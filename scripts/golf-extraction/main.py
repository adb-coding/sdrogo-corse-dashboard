# Usato per estrarre i dati dalla playlist e popolare il file data_img.json

import cv2
import easyocr
import pandas as pd
import re
import os
import json
import yt_dlp


JSON_PATH = os.path.join(os.getcwd(), 'data_img.json')


def estrai_classifica(image_path):

    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)

    # 2. INIZIALIZZAZIONE EASYOCR
    # Inizializziamo il lettore (italiano e inglese per coprire i nomi dei giocatori)
    # Imposta gpu=True se hai una scheda video Nvidia attiva, velocizza molto
    reader = easyocr.Reader(['it', 'en'], gpu=True) 

    print("Analisi dell'immagine in corso con EasyOCR...")
    # Leggiamo il testo ottenendo anche i box di posizionamento (fondamentali per le tabelle)
    results = reader.readtext(gray)
    width = gray.shape[1]
    
    name_limit = width * 0.35
    total_limit = width * 0.80

    righe_grezze = {}
    soglia_y = 15  # Pixel di tolleranza per definire se due testi sono sulla stessa riga

    for (bbox, text, prob) in results:
        # bbox ha i 4 angoli: [top_left, top_right, bottom_right, bottom_left]
        y_center = (bbox[0][1] + bbox[2][1]) / 2  # Calcoliamo il centro verticale del testo
        x_start = bbox[0][0]                     # Posizione orizzontale
        
        # Troviamo se esiste già una riga vicina a questa altezza Y
        trovata = False
        for y_chiave in righe_grezze.keys():
            if abs(y_center - y_chiave) < soglia_y:
                righe_grezze[y_chiave].append((x_start, text))
                trovata = True
                break
        
        if not trovata:
            righe_grezze[y_center] = [(x_start, text)]

    # 4. ORDINAMENTO E PARSING
    # Ordiniamo le righe dall'alto verso il basso (Y) e gli elementi da sinistra a destra (X)
    classifica_strutturata = []
    
    for y in sorted(righe_grezze.keys()):
        # Ordina gli elementi all'interno della riga in base alla coordinata X
        riga_ordinata = sorted(righe_grezze[y], key=lambda item: item[0])
        nome_giocatore = ""
        blocchi_buche = []
        totale = ""

        # testi_riga = [item[1] for item in riga_ordinata]
        for x_pos, testo in riga_ordinata:
            testo = testo.strip()
            if not testo:
                continue

            if x_pos < name_limit:
                if re.match(r'^\d+$', testo) and len(testo) == 1:
                    continue

                if nome_giocatore == "":
                    nome_giocatore += " " + testo
                else:
                    nome_giocatore = testo
                
            elif x_pos > total_limit:
                numeri_totale = "".join(re.findall(r'\d+', testo))
                if numeri_totale:
                    totale = numeri_totale

            else:
                numeri_trovati = re.findall(r'\d+', testo)
                blocchi_buche.extend(numeri_trovati)

            
        nome_giocatore = re.sub(r'^\d+\s+', '', nome_giocatore)
        
        if nome_giocatore.lower() in ["buca", "totale"] or not nome_giocatore:
            continue

        if not totale and blocchi_buche:
            totale = blocchi_buche.pop()


        stringa_buche = ",".join(blocchi_buche)
        
        totale_buche = len(blocchi_buche)
        print(f'{nome_giocatore},{totale},"{stringa_buche}",{totale_buche}')

    # # 5. MOSTRA I RISULTATI
    # print("\n--- DATI ESTRATTI GREZZI ---")
    # for riga in classifica_strutturata:
    #     print(riga)
        
    # return classifica_strutturata


def process_playlist(playlist_url, data_file):
    # Handle multiple URLs: 
    # 1. Strip brackets and quotes (in case a Python list is pasted)
    # 2. Split by comma, space, or newline
    clean_input = playlist_url.replace('[', '').replace(']', '').replace("'", "").replace('"', '').replace(',', ' ')
    urls = [u.strip() for u in clean_input.split() if u.strip()]

    if os.path.exists(data_file):
        with open(data_file, "r") as f:
            data_json = json.load(f)
    
    data = data_json

    already_extracted_videos = []

    for url in urls:
        ydl_opts = {
            'quiet': True, 
            'extract_flat': True
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                info = ydl.extract_info(url, download=False)
                if 'entries' in info:
                    entries = info['entries']
                else:
                    entries = [info]
            except Exception as e:
                print(f" [!] Error accessing {url}: {e}")
                continue

        print(f"Found {len(entries)} videos in {url}. Starting scan...")
        

        # Pre-scan output folder for existing IDs
        # existing_files = os.listdir(OUTPUT_PATH)
        
        for counter, entry in enumerate(entries, 1):
            video_id = entry.get('id')
            video_title = entry.get('title', 'Unknown title')
            
            # Robust URL construction: handle case where 'url' might be missing in extract_flat
            video_url = entry.get('url')
            if not video_url or 'youtube.com' not in video_url:
                video_url = f"https://www.youtube.com/watch?v={video_id}"

            video_info = get_video_info(video_url=video_url, elenco_id=counter)
            data[f"elenco_{str(counter)}"] = video_info
        
            # CHECK IF THE VIDEO HAS ALREADY BEEN SAVED (Using ID)
            if any(video_id in x for x in already_extracted_videos):
                print(f"[{counter}/{len(entries)}] Skipping: {video_title} (ID: {video_id} already exists)")
                continue

            print(f"[{counter}/{len(entries)}] Processing: {video_title}")
    
    return data
            

def get_video_info(video_url, elenco_id):
    ydl_opts = {'quiet': True, 'noplaylist': True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=False)
    # stream_url = info.get('url') or info['formats'][-1].get('url')
    return {
        "elenco_id": elenco_id,
        "title": info.get('title','video'),
        "video_owner": info.get('uploader', 'unknown'),
        "date": info.get('upload_date','unknown'),
        "link": video_url,
        "video_id": info.get('id','unknown')
    }


# RITAGLIO_TABELLA = "leaderboard_example.png" 
# dati = estrai_classifica(RITAGLIO_TABELLA)

# video_info = get_video_info("https://www.youtube.com/watch?v=5S6Dq7LAFNA&list=PLNn6OQTRPzc0&index=43", 43)
# print(video_info)

data = process_playlist("https://www.youtube.com/playlist?list=PLNiSDL1xBMBM", JSON_PATH)
# print(data)

with open("data_img.json","w") as f:
    json.dump(data, f, indent=4)


