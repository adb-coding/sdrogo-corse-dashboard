# Estrazione Dati - Golf

![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)

Questa cartella raccoglie gli script utilizzati per estrarre il testo della classifica partendo dalle immagini, estratte manualmente dal video, e analizzate tramite utilizzo di tecniche OCR - Optical Character Recognition - utilizzando la libreria EasyOCR 

> [!NOTE] 
> Questo progetto è stato fatto puramente a scopo didattico e per migliorare quello principale. Lo scopo era quello di estrarre automaticamente il maggior numero di dati. Sono consapevole delle numerose migliorie che si possono aggiungere e della presenza di alcuni errori.


## Struttura Cartella

```
├── data_img.json
├── grid_ocr.py
├── images
├── main.py
├── process_grid.py
└── requirements.txt
```

## Funzionamento

La pipeline si divide in due step procedurali: 
1. si analizza la playlist per estrarre tutti i metadati dei video, contenuti in questa [playlist](https://www.youtube.com/playlist?list=PLNiSDL1xBMBM). I metadati sono salvati in formato .json all'interno di data_img.json tramite lo script `main.py`. 

Ogni volta che un video viene aggiunto, questo processo viene svolto da zero;

2. Si estrae manualmente l'immagine della classifica mostrata nel video (deve essere completa) e salvata all'interno della cartella `images`.

3. Tramite lo script `process_grid.py`, vengono individuate le righe e le colonne della tabella tramite la loro posizione stimata, per poi venire tradotti in caratteri tramite l'utilizzo della libreria *easyocr*. 

### Limitazioni

Lo script originale, con l'utilizzo e l'individuazione all'interno di un'area ristretta portava a risultati discreti ma non ottimali. I principali errori erano dovuti a numeri confusi o letti erroneamente - 3, 5, e 8 creavano i maggiori problemi. 

Con l'utilizzo di *Claude Code* e *Opus 5* ho migliorato l'efficienza della lettura e del riconoscimento dei numeri, migliorando l'area di identificazione e assegnando delle posizioni più definite per il riconoscimento dei caratteri.

Questo significa che le immagni devono essere relativamente standard, e la posizione della tabella deve essere centrale, simile a quella delle immagini già utilizzate

## Riproducibilità

Per riprodurre il progetto, è necessario aver installato Python e installare le librerie necessarie nell'ambiente virtuale (consigliato) o nell'ambiente globale.

```
pip install -r requirements.txt
```

Per estrarre i metadati dei video, eseguire:
```
python main.py
```

Una volta salvate le immagini nella cartella `images`, eseguire

```
python process_grid.py                    #per scansionare tutte le immagini
python process_grid.py --only image_name  #solamente per un'immagine  
```

L'output di default è in formato .csv, ma può essere cambiato aggiungendo il tag `--output` in linea di comando

## Prossime Features

Lo step sucessivo per lo sviluppo è quello di automatizzare il processo di estrazione delle immagini come nel caso visto per le [Sdrogo Corse](../sdrogo-corse-extraction/README.md).

