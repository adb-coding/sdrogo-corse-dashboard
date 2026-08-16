"""
Estrazione della tabella dei punteggi basata sulla GEOMETRIA della griglia.

Alternativa standalone a process_all.py: usa grid_ocr.py e scrive un CSV
separato, senza toccare la pipeline esistente.

    python process_grid.py --only elenco_65 --debug
    python process_grid.py --out golf_with_friends_grid.csv
"""

import os
import re
import json
import argparse

import cv2
import easyocr
import numpy as np
import pandas as pd

from grid_ocr import (
    NUM_HOLES,
    banda_totale,
    bande_righe,
    candidati_valore,
    correggi_con_totale,
    firma_glifo,
    glifi_di_cella,
    griglia_colonne,
    limiti_area_buche,
    maschera_non_colorata,
    raffina_bande,
    raggruppa_glifi,
    gruppo_principale,
)


# --------------------------------------------------------------------------
# Riconoscimento dei glifi
# --------------------------------------------------------------------------

def riconosci_glifi(reader, gray, box_glifi, pad_ratio=0.35, pad_x=3):
    """OCR forzato su ogni glifo: niente detection, niente raggruppamenti.

    Si usa reader.recognize() passando direttamente i box, quindi EasyOCR non
    puo' fondere due celle vicine in un unico token (la causa di "48").
    """
    if not box_glifi:
        return []

    H, W = gray.shape[:2]

    # margine orizzontale: al massimo meta' dello spazio libero verso il
    # glifo accanto. Troppo stretto e il riconoscimento peggiora, troppo
    # largo e la cifra vicina entra nel ritaglio ("5" letto "58").
    def _spazio(i, verso):
        x0, x1, y0, y1 = box_glifi[i]
        migliore = 40
        for j, (a0, a1, b0, b1) in enumerate(box_glifi):
            if j == i:
                continue
            if min(y1, b1) - max(y0, b0) <= 0.4 * (y1 - y0):
                continue                      # non e' sulla stessa riga
            d = a0 - x1 if verso > 0 else x0 - a1
            if 0 <= d < migliore:
                migliore = d
        return migliore

    lista = []
    for i, (x0, x1, y0, y1) in enumerate(box_glifi):
        pad_y = int(max(3, (y1 - y0) * pad_ratio))
        pl = int(min(8, max(pad_x, _spazio(i, -1) // 2)))
        pr = int(min(8, max(pad_x, _spazio(i, +1) // 2)))
        lista.append([max(0, x0 - pl), min(W, x1 + pr),
                      max(0, y0 - pad_y), min(H, y1 + pad_y)])

    grezzi = reader.recognize(
        gray, horizontal_list=lista, free_list=[],
        allowlist="0123456789", detail=1, paragraph=False,
        contrast_ths=0.05, adjust_contrast=0.7,
    )

    # riallineamento per coordinate: non ci si fida dell'ordine di ritorno
    per_chiave = {}
    for bbox, testo, conf in grezzi:
        xs = [p[0] for p in bbox]
        ys = [p[1] for p in bbox]
        per_chiave[(int(min(xs)), int(min(ys)))] = (testo.strip(), float(conf))

    out = []
    for (x0, x1, y0, y1), (bx0, bx1, by0, by1) in zip(lista, box_glifi):
        testo, conf = per_chiave.get((int(x0), int(y0)), ("", 0.0))
        # due cifre sono ammesse solo da un glifo largo (le due cifre di "11"
        # possono restare attaccate); altrimenti e' il vicino che e' entrato
        # nel ritaglio e va scartato.
        largo = (bx1 - bx0) > 0.75 * max(by1 - by0, 1)
        if not testo.isdigit() or len(testo) > (2 if largo else 1):
            testo, conf = "", 0.0      # decidera' il cluster di forma
        out.append((testo, conf))
    return out


def vota_per_forma(firme, letture):
    """Stessa forma -> stessa cifra.

    I glifi vengono raggruppati per similarita' e ogni gruppo prende
    l'etichetta piu' votata (peso = confidenza). E' questo passaggio a
    eliminare gli scambi 3/8/6: il font e' sempre lo stesso, quindi ogni "3"
    e' identico a ogni altro "3" e la lettura sbagliata finisce in minoranza.

    Il voto e' fatto su TUTTE le immagini insieme: una cifra rara in una
    singola tabella (uno "0", un "7") avrebbe pochi voti e potrebbe perdere,
    mentre sull'intero dataset ne ha centinaia.
    """
    cluster, centroidi = raggruppa_glifi(firme)

    voti = {}
    for c, (testo, conf) in zip(cluster, letture):
        if c < 0 or not testo:
            continue
        voti.setdefault(c, {}).setdefault(testo, 0.0)
        voti[c][testo] += conf

    def _vincente(c):
        somma = sum(voti[c].values())
        etichetta = max(voti[c], key=voti[c].get)
        return etichetta, (voti[c][etichetta] / somma if somma else 0.0)

    # un glifo sfocato puo' formare un cluster tutto suo, senza nessun voto:
    # gli si presta l'etichetta del cluster etichettato piu' somigliante
    prestiti = {}
    for c in set(cluster):
        if c < 0 or voti.get(c):
            continue
        meglio, punteggio = None, 0.80
        for altro in voti:
            s = float(np.dot(centroidi[c], centroidi[altro]))
            if s > punteggio:
                meglio, punteggio = altro, s
        if meglio is not None:
            etichetta, _q = _vincente(meglio)
            prestiti[c] = (etichetta, punteggio * 0.6)

    finali = []
    for c, (testo, conf) in zip(cluster, letture):
        if voti.get(c):
            etichetta, quota = _vincente(c)
            # un cluster diviso a meta' non e' una prova: in quel caso si
            # tiene la lettura del singolo glifo, se c'e'
            finali.append((etichetta, quota) if (quota >= 0.65 or not testo)
                          else (testo, conf))
        elif c in prestiti:
            finali.append(prestiti[c])
        else:
            finali.append((testo, conf))
    return finali, cluster


# --------------------------------------------------------------------------
# Estrazione di una immagine
# --------------------------------------------------------------------------

def salva_verifica(gray, bordi, righe_utili, letti, percorso):
    """Immagine annotata: griglia disegnata + valore letto sopra ogni cella.

    Serve per capire a colpo d'occhio se un errore viene dalla griglia
    (colonne fuori posto) o dalla lettura della cifra.
    """
    vis = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
    for b in bordi:
        cv2.line(vis, (int(b), 0), (int(b), vis.shape[0]), (0, 160, 255), 1)
    for r_i, (nome, y0, y1) in enumerate(righe_utili):
        cv2.line(vis, (0, y0), (vis.shape[1], y0), (0, 255, 0), 1)
        cv2.line(vis, (0, y1), (vis.shape[1], y1), (0, 255, 0), 1)
        for c, valore in enumerate(letti[r_i]):
            x = int(bordi[c]) + 3
            cv2.putText(vis, str(valore), (x, y0 + 12),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 255), 1, cv2.LINE_AA)
    cv2.imwrite(percorso, vis)


def analizza_immagine(reader, image_path, debug=False):
    """Primo passaggio: geometria della tabella e ritaglio dei glifi.

    Non decide ancora quale cifra sia ciascun glifo: restituisce le letture
    grezze e le firme di forma, che verranno votate insieme a quelle di tutte
    le altre immagini.
    """
    if not os.path.exists(image_path):
        print(f"   [!] File immagine non trovato: {image_path}")
        return None

    img = cv2.imread(image_path)
    if img is None:
        print(f"   [!] Immagine illeggibile: {image_path}")
        return None

    img = cv2.resize(img, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    H, W = gray.shape[:2]
    non_colorato = maschera_non_colorata(img)   # esclude le frecce rosse/verdi

    risultati = reader.readtext(gray)
    righe = bande_righe(risultati, H)
    if not righe:
        return None

    x_lo, x_hi = limiti_area_buche(righe, W)
    righe = raffina_bande(gray, righe, x_lo, x_hi)
    centri, bordi, n_voti = griglia_colonne(gray, righe, x_lo, x_hi)
    if debug:
        passo = float(np.diff(centri).mean()) if len(centri) > 1 else 0.0
        print(f"   [debug] area buche x=[{x_lo},{x_hi}] passo={passo:.1f} "
              f"righe che confermano la griglia: {n_voti}")

    # --- selezione delle righe utili (salta l'intestazione BUCA) ---
    righe_utili = []
    for y_c, y0, y1, token in righe:
        nome = " ".join(t.strip() for b, t, p in sorted(token, key=lambda z: z[0][0][0])
                        if b[0][0] < x_lo and t.strip()).strip()
        nome = re.sub(r"^\d+\s*", "", nome).strip()   # toglie il numero di posizione
        chiave = nome.lower().strip(" .:0123456789")
        if not nome:
            continue
        if "buca" in chiave or "hole" in chiave:
            continue

        righe_utili.append((nome, y0, y1))

    # --- raccolta di tutti i glifi (buche + totali) ---
    tx0, tx1 = banda_totale(righe, W, x_hi)
    gap_glifi = max(4, int((bordi[1] - bordi[0]) * 0.34))

    box_glifi, mappa = [], []
    trattini = [set() for _ in righe_utili]
    for r_i, (nome, y0, y1) in enumerate(righe_utili):
        for c in range(NUM_HOLES):
            x0, x1 = int(round(bordi[c])), int(round(bordi[c + 1]))
            glifi, e_trattino = glifi_di_cella(gray, x0, x1, y0, y1)
            if e_trattino and not glifi:
                trattini[r_i].add(c)
            for g in glifi:
                box_glifi.append(g)
                mappa.append((r_i, c))
        # la maschera colore serve solo a togliere la freccia ▲/▼, che esiste
        # solo nelle righe dei giocatori. Sulla riga PAR (testo scuro su verde)
        # eroderebbe le cifre, e un "1" sottile sparirebbe del tutto.
        e_par = nome.lower().strip(" .:") == "par"
        glifi_t, _ = glifi_di_cella(gray, tx0, tx1, y0, y1,
                                    maschera_valida=None if e_par else non_colorato)
        scelti = gruppo_principale(glifi_t, gap_glifi)
        if len(scelti) < 2:
            # riga evidenziata in giallo: la maschera colore mangia anche le
            # cifre. Si rilegge senza maschera, tanto la freccia viene comunque
            # scartata da gruppo_principale (e' un blocco isolato piu' piccolo).
            senza, _ = glifi_di_cella(gray, tx0, tx1, y0, y1)
            alternativa = gruppo_principale(senza, gap_glifi)
            if len(alternativa) > len(scelti):
                scelti = alternativa
        for g in scelti:
            box_glifi.append(g)
            mappa.append((r_i, "T"))

    return {
        "path": image_path,
        "righe_utili": righe_utili,
        "bordi": bordi,
        "mappa": mappa,
        "trattini": trattini,
        "letture": riconosci_glifi(reader, gray, box_glifi),
        "firme": [firma_glifo(gray, b) for b in box_glifi],
    }


def componi_righe(analisi, debug=False, dump_dir=None):
    """Secondo passaggio: dalle cifre votate alle righe della tabella.

    Ritorna (riga_par, giocatori); ogni voce e'
    (nome, stringa_buche, totale, num_buche, nota_di_verifica).
    """
    righe_utili = analisi["righe_utili"]
    trattini = analisi["trattini"]

    celle = [{} for _ in righe_utili]
    for (r_i, c), (testo, conf) in zip(analisi["mappa"], analisi["letture"]):
        celle[r_i].setdefault(c, []).append((testo, conf))

    riga_par = None
    giocatori = []
    letti = []

    for r_i, (nome, y0, y1) in enumerate(righe_utili):
        letti_riga, conf_riga = [], []
        for c in range(NUM_HOLES):
            glifi = celle[r_i].get(c, [])
            testo = "".join(t for t, _ in glifi)
            if testo.isdigit():
                letti_riga.append(int(testo))
                conf_riga.append(float(np.mean([cf for _, cf in glifi])))
            else:
                letti_riga.append(None)
                conf_riga.append(0.0)

        # le buche non giocate ("-") stanno sempre in coda: si taglia li'
        n_giocate = NUM_HOLES
        while n_giocate > 0 and letti_riga[n_giocate - 1] is None:
            n_giocate -= 1

        vuote = [c + 1 for c in range(n_giocate)
                 if letti_riga[c] is None and c not in trattini[r_i]]
        valori = [v if v is not None else 0 for v in letti_riga[:n_giocate]]
        confidenze = conf_riga[:n_giocate]

        totale = "".join(t for t, _ in celle[r_i].get("T", []))
        totale = totale if totale.isdigit() else ""

        totale_ocr = totale
        valori, quadra = correggi_con_totale(valori, confidenze, totale)
        if not quadra and totale and confidenze and min(confidenze) >= 0.5:
            # anche il totale puo' essere letto male. Lo si corregge solo se
            # la somma delle buche, cosi' come sono state lette, e' gia' una
            # sua variante confondibile: nessuna cella viene toccata.
            varianti = {v for v, _ in candidati_valore(totale, 0.5, massimo=300)}
            if sum(valori) in varianti:
                totale, quadra = str(sum(valori)), True

        nota = []
        if not totale and n_giocate and not vuote:
            # totale illeggibile ma buche tutte lette: si scrive la somma,
            # segnalando che manca il controllo incrociato
            totale = str(sum(valori))
            nota.append("totale_ricalcolato_da_somma")
        if vuote:
            nota.append(f"celle_vuote={vuote}")
        if n_giocate == 0:
            nota.append("nessuna buca letta")
        if totale_ocr and totale != totale_ocr:
            nota.append(f"totale_ocr={totale_ocr}->{totale}")
        if not quadra and totale_ocr:
            nota.append(f"somma={sum(valori)}!=totale={totale or '?'}")
        nota = "; ".join(nota)

        stringa = ",".join(str(v) for v in valori)
        letti.append(valori)
        if debug:
            grezzo = "".join(t or "?" for t, _ in celle[r_i].get("T", []))
            print(f"   [{'OK ' if not nota else 'REV'}] {nome:<16} ({n_giocate:2d}) "
                  f"{stringa}  tot={totale} [glifi_tot={grezzo}]")

        if nome.lower().strip(" .:") == "par":
            riga_par = (nome.upper(), stringa, totale, n_giocate, nota)
        else:
            giocatori.append((nome, stringa, totale, n_giocate, nota))

    if dump_dir:
        os.makedirs(dump_dir, exist_ok=True)
        img = cv2.imread(analisi["path"])
        gray = cv2.cvtColor(cv2.resize(img, None, fx=2.0, fy=2.0,
                                       interpolation=cv2.INTER_CUBIC), cv2.COLOR_BGR2GRAY)
        nome_file = os.path.splitext(os.path.basename(analisi["path"]))[0] + "_check.png"
        salva_verifica(gray, analisi["bordi"], righe_utili, letti,
                       os.path.join(dump_dir, nome_file))

    return riga_par, giocatori


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", default="data_img.json")
    ap.add_argument("--images", default="images")
    ap.add_argument("--out", default="golf_with_friends_grid.csv")
    ap.add_argument("--only", default=None, help="processa solo questo id (es. elenco_65)")
    ap.add_argument("--debug", action="store_true")
    ap.add_argument("--cpu", action="store_true")
    ap.add_argument("--dump-dir", default=None,
                    help="salva immagini annotate con griglia e letture")
    args = ap.parse_args()

    with open(args.json, "r", encoding="utf-8") as f:
        metadata = json.load(f)

    print("Inizializzazione di EasyOCR...")
    reader = easyocr.Reader(["it", "en"], gpu=not args.cpu)

    # --- passaggio 1: geometria e ritaglio dei glifi di ogni immagine ---
    analisi = []
    for item in metadata:
        if args.only and item != args.only:
            continue
        print(f"Analizzo: {item}.png ...")
        a = analizza_immagine(reader, os.path.join(args.images, item + ".png"),
                              debug=args.debug)
        if a:
            a["item"] = item
            analisi.append(a)

    # --- passaggio 2: voto delle forme su tutte le immagini insieme ---
    firme = [f for a in analisi for f in a["firme"]]
    letture = [l for a in analisi for l in a["letture"]]
    print(f"Voto le forme di {len(firme)} glifi su {len(analisi)} immagini...")
    votate, cluster = vota_per_forma(firme, letture)
    print(f"   forme distinte trovate: {len(set(cluster))}")
    i = 0
    for a in analisi:
        n = len(a["letture"])
        a["letture"] = votate[i:i + n]
        i += n

    # --- passaggio 3: ricomposizione delle righe ---
    record = []
    da_rivedere = 0
    for a in analisi:
        item = a["item"]
        print(f"Ricompongo: {item}.png ...")
        riga_par, giocatori = componi_righe(a, debug=args.debug, dump_dir=args.dump_dir)

        righe = ([riga_par] if riga_par else []) + list(giocatori)
        for nome, buche, totale, n_buche, nota in righe:
            if nota:
                da_rivedere += 1
            record.append({
                "elenco_id": metadata[item].get("elenco_id", ""),
                "video_owner": metadata[item].get("video_owner", ""),
                "giocatore": nome,
                "punti_totali": totale,
                "punteggi_singole_gare": buche,
                "num_gare": n_buche,
                "titolo": metadata[item].get("title", ""),
                "video_id": metadata[item].get("video_id", ""),
                "link": metadata[item].get("link", ""),
                "upload_date": metadata[item].get("date", ""),
                "da_verificare": nota,
            })

    pd.DataFrame(record).to_csv(args.out, index=False, encoding="utf-8")
    print(f"\n[v] Completato: {len(record)} righe -> {args.out}")
    print(f"    righe da verificare a mano: {da_rivedere}")


if __name__ == "__main__":
    main()
