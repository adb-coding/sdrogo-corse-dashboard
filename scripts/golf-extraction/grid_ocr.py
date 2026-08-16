"""
Estrazione della tabella dei punteggi basata sulla GEOMETRIA della griglia.

Idea di fondo
-------------
La tabella ha sempre 18 colonne (buche) di larghezza costante. Invece di
leggere una riga intera e sperare che l'OCR separi i token nel modo giusto
(cosa che fallisce: due celle vicine vengono fuse in "48"), qui:

  1. si individuano le bande orizzontali delle righe;
  2. si individua la griglia delle 18 colonne dai profili di inchiostro;
  3. si ritaglia OGNI cella e si riconoscono i singoli glifi;
  4. i glifi vengono raggruppati per forma: lo stesso disegno riceve la
     stessa etichetta (voto di maggioranza). Questo elimina gli scambi
     sistematici 3/8/6, perche' nella stessa immagine il "3" e' sempre
     identico a se stesso;
  5. un DP sul vincolo somma(buche) == totale corregge i residui.

Cosi' il numero di buche e' 18 per costruzione e la posizione di ogni
punteggio non puo' piu' slittare.
"""

import os
import re
from collections import defaultdict

import cv2
import numpy as np

NUM_HOLES = 18

# Coppie di cifre che l'OCR confonde in questo font (bold, condensato).
CONFUSIONI = {
    "3": "896",
    "8": "3695",
    "6": "85",
    "5": "68",
    "9": "83",
    "0": "8",
    "1": "7",
    "7": "1",
    "2": "",
    "4": "",
}

MAX_PUNTI_BUCA = 20
COSTO_GLIFO_DI_TROPPO = 2.5


# --------------------------------------------------------------------------
# Utilita' di basso livello
# --------------------------------------------------------------------------

def _binarizza(gray_crop):
    """Otsu + normalizzazione della polarita': l'inchiostro (testo) resta a 255.

    Serve perche' le righe dei giocatori sono testo chiaro su fondo scuro,
    mentre la riga PAR e' testo scuro su fondo verde chiaro.
    """
    if gray_crop.size == 0:
        return gray_crop
    blur = cv2.GaussianBlur(gray_crop, (3, 3), 0)
    _, bw = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    if (bw > 0).mean() > 0.5:          # il testo e' sempre la minoranza dei pixel
        bw = 255 - bw
    return bw


def _binarizza_scala(gray_crop, fattore=1.0):
    """Come _binarizza ma con soglia abbassabile.

    Le colonne delle buche non giocate hanno testo grigio slavato: con la
    sola soglia di Otsu spariscono e la griglia viene stimata su meno
    colonne (e quindi con il passo sbagliato).
    """
    if gray_crop.size == 0:
        return gray_crop
    blur = cv2.GaussianBlur(gray_crop, (3, 3), 0)
    t, bw = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    testo_chiaro = (bw > 0).mean() <= 0.5
    if fattore == 1.0:
        return bw if testo_chiaro else 255 - bw
    if testo_chiaro:
        return ((blur > t * fattore) * 255).astype(np.uint8)
    return ((blur < t + (255 - t) * (1 - fattore)) * 255).astype(np.uint8)


def _runs(profilo, soglia=0):
    """Intervalli [start, end) in cui il profilo supera la soglia."""
    out = []
    start = None
    for i, v in enumerate(profilo):
        if v > soglia and start is None:
            start = i
        elif v <= soglia and start is not None:
            out.append((start, i))
            start = None
    if start is not None:
        out.append((start, len(profilo)))
    return out


def _unisci_runs(runs, gap_max):
    """Fonde intervalli separati da meno di gap_max pixel."""
    if not runs:
        return []
    out = [list(runs[0])]
    for a, b in runs[1:]:
        if a - out[-1][1] <= gap_max:
            out[-1][1] = b
        else:
            out.append([a, b])
    return [tuple(r) for r in out]


# --------------------------------------------------------------------------
# Righe e griglia delle colonne
# --------------------------------------------------------------------------

def bande_righe(risultati_ocr, altezza_img):
    """Raggruppa i box OCR in righe e restituisce (y_centro, y0, y1, token)."""
    gruppi = defaultdict(list)
    altezze = []
    for bbox, testo, prob in risultati_ocr:
        y_c = (bbox[0][1] + bbox[2][1]) / 2.0
        altezze.append(abs(bbox[2][1] - bbox[0][1]))
        chiave = None
        for k in gruppi:
            if abs(y_c - k) < 20:
                chiave = k
                break
        gruppi[chiave if chiave is not None else y_c].append((bbox, testo, prob))

    if not gruppi:
        return []

    h_tipica = float(np.median(altezze)) if altezze else 20.0
    centri = sorted(gruppi)
    if len(centri) > 1:
        passo = float(np.median(np.diff(centri)))
    else:
        passo = h_tipica * 1.6

    righe = []
    for y_c in centri:
        mezza = min(passo * 0.46, h_tipica * 0.95)
        y0 = int(max(0, y_c - mezza))
        y1 = int(min(altezza_img, y_c + mezza))
        righe.append((y_c, y0, y1, gruppi[y_c]))
    return righe


def limiti_area_buche(righe, larghezza):
    """x sinistro/destro dell'area delle 18 colonne.

    Si usano le etichette di intestazione ("BUCA" a sinistra, "TOTALE" a
    destra) quando l'OCR le trova; altrimenti si ripiega sulle proporzioni.
    """
    x_lo = x_hi = None
    for _, _, _, token in righe:
        for bbox, testo, _ in token:
            t = testo.strip().upper()
            if "BUCA" in t:
                x_lo = max(x_lo or 0, bbox[1][0])
            if "TOTAL" in t:
                x_hi = min(x_hi or larghezza, bbox[0][0])
    if x_lo is None:
        x_lo = larghezza * 0.33
    if x_hi is None:
        x_hi = larghezza * 0.88
    return int(x_lo) + 2, int(x_hi) - 2


def raffina_bande(gray, righe, x_lo, x_hi):
    """Stringe ogni banda sull'inchiostro reale della riga.

    Le bande ricavate dai box dell'OCR sono piu' alte del testo e arrivano a
    sfiorare la riga successiva: due cifre incolonnate finirebbero nella
    stessa cella (il "2" di sotto letto come "12").
    """
    fuori = []
    centri = [r[0] for r in righe]
    passo = float(np.median(np.diff(centri))) if len(centri) > 1 else 40.0
    H = gray.shape[0]

    for y_c, y0, y1, token in righe:
        # prima scelta: l'estensione verticale dei token che stanno nell'area
        # delle buche. I box dell'OCR sono stretti sul testo anche quando il
        # testo lo raggruppa male, e ignorano avatar e nomi (piu' alti).
        cifre = [b for b, t, p in token if x_lo <= b[0][0] <= x_hi]
        if len(cifre) >= 2:
            alto = float(np.median([b[0][1] for b in cifre]))
            basso = float(np.median([b[2][1] for b in cifre]))
            if 4 <= basso - alto <= passo:
                fuori.append((y_c, int(max(0, alto - 3)), int(min(H, basso + 3)), token))
                continue

        g0 = int(max(0, y_c - passo * 0.60))
        g1 = int(min(H, y_c + passo * 0.60))
        crop = gray[g0:g1, x_lo:x_hi]
        nuovo = (y0, y1)
        if crop.size:
            bw = _binarizza_scala(crop, 1.0)
            profilo = (bw > 0).sum(axis=1)
            minimo = max(2, int(crop.shape[1] * 0.008))
            blocchi = _unisci_runs(_runs(profilo, minimo), 2)
            rel = y_c - g0
            contenitore = None
            for a, b in blocchi:
                if a - 2 <= rel <= b + 2:
                    contenitore = (a, b)
                    break
            if contenitore is None and blocchi:
                contenitore = min(blocchi, key=lambda r: abs((r[0] + r[1]) / 2 - rel))
            if contenitore:
                altezza = contenitore[1] - contenitore[0]
                # se la banda stretta e' assurda (righe fuse o testo perso)
                # si tiene quella originale: meglio larga che sbagliata
                if passo * 0.20 <= altezza <= passo * 0.85:
                    nuovo = (max(0, g0 + contenitore[0] - 2),
                             min(H, g0 + contenitore[1] + 2))
        fuori.append((y_c, nuovo[0], nuovo[1], token))
    return fuori


def banda_totale(righe, larghezza, x_hi):
    """Intervallo x della colonna TOTALE, preso dall'etichetta di testata."""
    for _, _, _, token in righe:
        for bbox, testo, _ in token:
            if "TOTAL" in testo.strip().upper():
                return int(bbox[0][0]) - 4, int(bbox[1][0]) + 4
    return int(x_hi), int(larghezza)


def celle_di_riga(bw_riga, gap_cella):
    """Blocchi di inchiostro della riga, fusi in celle (glifi vicini insieme)."""
    profilo = (bw_riga > 0).sum(axis=0)
    return _unisci_runs(_runs(profilo, 0), gap_cella)


def griglia_colonne(gray, righe, x_lo, x_hi):
    """Centri delle 18 colonne.

    Ogni riga che si segmenta in esattamente 18 blocchi vota; si prende la
    mediana. Se nessuna riga collabora, si divide l'area in 18 parti uguali.
    """
    passo_atteso = (x_hi - x_lo) / float(NUM_HOLES)
    gap_cella = max(4, int(passo_atteso * 0.34))

    voti = []
    parziali = []
    for _, y0, y1, _ in righe:
        crop = gray[y0:y1, x_lo:x_hi]
        if crop.size == 0:
            continue
        migliore = None
        for fattore in (1.0, 0.8, 0.65, 0.5):
            blocchi = celle_di_riga(_binarizza_scala(crop, fattore), gap_cella)
            blocchi = [b for b in blocchi if (b[1] - b[0]) >= 2]
            if len(blocchi) == NUM_HOLES:
                migliore = blocchi
                break
            if migliore is None or len(blocchi) > len(migliore):
                migliore = blocchi
        centri_riga = [x_lo + (a + b) / 2.0 for a, b in migliore]
        if len(migliore) == NUM_HOLES:
            voti.append(centri_riga)
        elif len(migliore) >= 4:
            parziali.append(centri_riga)

    if voti:
        centri = np.median(np.array(voti), axis=0)
    elif parziali:
        # nessuna riga completa: le buche giocate sono sempre le prime, quindi
        # i blocchi trovati corrispondono alle colonne 0..k-1. Si stima
        # passo e origine con una regressione e si estrapola fino a 18.
        xs = np.array([i for c in parziali for i in range(len(c))], dtype=float)
        ys = np.array([v for c in parziali for v in c], dtype=float)
        A = np.vstack([xs, np.ones_like(xs)]).T
        passo, origine = np.linalg.lstsq(A, ys, rcond=None)[0]
        centri = origine + passo * np.arange(NUM_HOLES)
        passo_atteso = float(passo)
    else:
        centri = np.array([x_lo + passo_atteso * (i + 0.5) for i in range(NUM_HOLES)])

    # bordi = punti medi fra centri consecutivi
    bordi = [centri[0] - passo_atteso / 2.0]
    for i in range(NUM_HOLES - 1):
        bordi.append((centri[i] + centri[i + 1]) / 2.0)
    bordi.append(centri[-1] + passo_atteso / 2.0)
    return centri, np.array(bordi), len(voti)


# --------------------------------------------------------------------------
# Glifi
# --------------------------------------------------------------------------

def glifi_di_cella(gray, x0, x1, y0, y1, maschera_valida=None):
    """Box assoluti dei singoli glifi di una cella (1 o 2 cifre).

    Ritorna (lista_box, e_trattino). `e_trattino` distingue la buca non
    giocata (nella tabella c'e' un "-") dalla cella davvero vuota, che invece
    e' un errore di lettura.
    """
    crop = gray[y0:y1, x0:x1]
    if crop.size == 0:
        return [], False
    bw = _binarizza(crop)
    if maschera_valida is not None:
        bw = cv2.bitwise_and(bw, maschera_valida[y0:y1, x0:x1] * 255)

    # elimina residui di bordo/griglia: tiene solo componenti alte abbastanza
    h = bw.shape[0]
    n, lab, stats, _ = cv2.connectedComponentsWithStats((bw > 0).astype(np.uint8), 8)
    tenuti = np.zeros_like(bw)
    e_trattino = False
    larghezza_cella = max(x1 - x0, 1)
    for i in range(1, n):
        x, y, w_, h_, area = stats[i]
        # bordi verticali: separatore di cella o riquadro giallo della buca
        # in corso. Sono alti, sottili e appiccicati al bordo del ritaglio,
        # mentre le cifre stanno al centro. Senza questo filtro diventano "1".
        al_bordo = x <= larghezza_cella * 0.10 or (x + w_) >= larghezza_cella * 0.90
        if al_bordo and h_ >= h * 0.7 and w_ <= max(3, larghezza_cella * 0.14):
            continue
        if h_ >= h * 0.35 and area >= 6 and w_ <= (x1 - x0) * 0.8:
            tenuti[lab == i] = 255
        elif area >= 4 and w_ >= 2 * max(h_, 1):
            e_trattino = True          # segmento basso e largo = buca non giocata
    if not tenuti.any():
        return [], e_trattino

    colonne = _runs((tenuti > 0).sum(axis=0), 0)
    colonne = _unisci_runs(colonne, 2)
    colonne = [c for c in colonne if (c[1] - c[0]) >= 2]

    out = []
    for a, b in colonne:
        sub = tenuti[:, a:b]
        righe_ink = np.where((sub > 0).any(axis=1))[0]
        if righe_ink.size == 0:
            continue
        out.append((x0 + a, x0 + b, y0 + int(righe_ink[0]), y0 + int(righe_ink[-1]) + 1))
    return out, e_trattino


def gruppo_principale(box_glifi, gap_max):
    """Tiene solo il blocco di glifi contigui piu' numeroso.

    Nella colonna TOTALE, oltre al punteggio, possono comparire la freccia
    ▲/▼ (a destra) e il puntatore del mouse (ovunque): sono blocchi isolati
    da uno stacco, e hanno meno glifi delle due cifre del totale.
    """
    if not box_glifi:
        return []
    ordinati = sorted(box_glifi, key=lambda b: b[0])
    gruppi = [[ordinati[0]]]
    for b in ordinati[1:]:
        if b[0] - gruppi[-1][-1][1] > gap_max:
            gruppi.append([b])
        else:
            gruppi[-1].append(b)
    return max(gruppi, key=lambda g: (len(g), -g[0][0]))


def maschera_non_colorata(img_bgr, sat_max=110, val_min=90):
    """1 dove il pixel NON e' un colore acceso.

    Serve nella colonna TOTALE: le frecce rosse/verdi accanto al punteggio
    verrebbero altrimenti scambiate per cifre.
    """
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    colorato = (hsv[:, :, 1] > sat_max) & (hsv[:, :, 2] > val_min)
    return (~colorato).astype(np.uint8)


def firma_glifo(gray, box, dim=(16, 24)):
    """Vettore normalizzato della forma del glifo, per il raggruppamento."""
    x0, x1, y0, y1 = box
    crop = gray[y0:y1, x0:x1]
    if crop.size == 0:
        return None
    bw = _binarizza(crop)
    bw = cv2.resize(bw, dim, interpolation=cv2.INTER_AREA)
    v = (bw.astype(np.float32) / 255.0).ravel()
    n = np.linalg.norm(v)
    return v / n if n > 0 else None


def raggruppa_glifi(firme, soglia=0.95):
    """Cluster greedy per similarita' coseno, con capostipite fisso.

    Il centroide NON viene aggiornato mano a mano: se si media, il cluster
    deriva e finisce per assorbire cifre diverse ma simili (il "6" dentro i
    "5"), e allora il voto di maggioranza ribalta la cifra minoritaria.
    Meglio tanti cluster piccoli e puri: quelli senza voti si appoggiano poi
    al cluster etichettato piu' somigliante.

    Ritorna (indice_di_cluster_per_glifo, capostipiti).
    """
    centroidi = []
    etichette = []
    for f in firme:
        if f is None:
            etichette.append(-1)
            continue
        migliore, punteggio = -1, -1.0
        for i, c in enumerate(centroidi):
            s = float(np.dot(c, f))
            if s > punteggio:
                migliore, punteggio = i, s
        if migliore >= 0 and punteggio >= soglia:
            etichette.append(migliore)
        else:
            centroidi.append(f.copy())
            etichette.append(len(centroidi) - 1)
    return etichette, centroidi


# --------------------------------------------------------------------------
# Correzione con il vincolo della somma
# --------------------------------------------------------------------------

def candidati_valore(valore, conf, massimo=MAX_PUNTI_BUCA):
    """(valore_alternativo, costo) per una cella letta come `valore`.

    Si sostituisce una cifra alla volta, e solo con cifre confondibili: il
    costo cresce quando l'OCR era sicuro della lettura originale.
    """
    cand = {valore: 0.0}
    base = 1.0 + (1.0 - conf)
    cifre = list(valore)
    for i, c in enumerate(cifre):
        for alt in CONFUSIONI.get(c, ""):
            nuovo = "".join(cifre[:i] + [alt] + cifre[i + 1:])
            cand.setdefault(nuovo, base)

    # scarto di un glifo di troppo: nella cella puo' esserci finito il
    # puntatore del mouse, che viene letto come una cifra ("1" -> "41").
    # Costo alto: si sceglie solo se nient'altro fa quadrare la somma.
    if len(cifre) >= 2:
        for i in range(len(cifre)):
            cand.setdefault("".join(cifre[:i] + cifre[i + 1:]), COSTO_GLIFO_DI_TROPPO)
    # lo zero e' un punteggio legittimo (buca saltata ma conteggiata)
    return [(int(v), c) for v, c in cand.items()
            if v.isdigit() and 0 <= int(v) <= massimo]


def correggi_con_totale(valori, confidenze, totale):
    """Sceglie la combinazione a costo minimo la cui somma fa `totale`.

    Sostituisce sia il vecchio scambio 3/8 esaustivo sia la buca aggiunta in
    coda: qui le posizioni sono fisse, si tocca solo il valore.
    """
    try:
        totale = int(totale)
    except (TypeError, ValueError):
        return valori, False
    if sum(valori) == totale:
        return valori, True

    liste = [candidati_valore(str(v), c) for v, c in zip(valori, confidenze)]
    dp = {0: (0.0, ())}
    for opzioni in liste:
        nuovo = {}
        for somma, (costo, scelte) in dp.items():
            for v, c in opzioni:
                s2 = somma + v
                if s2 > totale:
                    continue
                c2 = costo + c
                if s2 not in nuovo or c2 < nuovo[s2][0]:
                    nuovo[s2] = (c2, scelte + (v,))
        dp = nuovo
        if not dp:
            return valori, False

    if totale in dp:
        return list(dp[totale][1]), True
    return valori, False
