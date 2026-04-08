# Classifica Sdrogo Corse
**Sdrogo Corse Dashboard** è una piattaforma fan made per tenere traccia della classifica delle sdrogo corse.

Ringrazio in primo luogo Dread, Rohn, Gabbo, Delux, JTaz, Mollu, e ilMasseo per i contenuti che portano, ma anche @antobeviz per il meticoloso lavoro nell'aver raccolto e tenuto traccia delle statistiche e aver reso possibile la creazione di questo progetto.

**Note on Development**: il progetto è stato realizzato tramite *Vibe-coding*, focalizzandolo sulla creazione di un prodotto data-driven in un tempo relativamente breve. Sono stati utilizzati i seguenti LLM: 
- Gemini 3 Pro
- Kimi-k2.5
- Qwen3-coder-next

## 🛠️Tech Stack & Architecture
- **Core**: Next.js 14 (App Router) per il routing e la gestione del rendering
- **Data Layer**: Architettura basata su file flat (CSV) per garantire portabilità e facilità di aggiornamento senza l'utilizzo di un database relazionale
- **Charts**: Recharts per la visualizzazione dinamica
- **Styling**: Tailwind CSS ottimizzato per desktop
- **Type Safety**: TypeScript per la creazione delle interfacce  

## 📊Funzionalità
La dashboard è divisa in tre pagine: 
### 🏅1. Classifica
La pagina principale che riporta la classifica delle sdrogo corse. 
- **Podio**: top 3 dei giocatori in base alla metrica che si vuole considerare (punti - media punti - vittorie - posizione media - % vittorie)
- **Classifica Globale**: con le varie statistiche - la colonna `Form` riporta i punteggi delle ultime 5 gare corse
- **Prestazioni**: line chart della serie dei punti o delle posizioni negli elenchi
- **Storico Elenchi**: ordine di arrivo e classifica elenco per elenco

### 📈2. Elenchi
Raccolta di tutti gli elenchi giocati, con la possibilità di cliccare nel dettaglio un elenco e vedere la distribuzione dei punti.
### 🏎️3. Sdrogo Piloti
Permette di vedere le statistiche per ogni *Sdrogo Pilota* nel dettaglio:
- riassunto delle statistiche principali 
- serie storica dei punteggi nei vari elenchi
- *Sdrogo Potenziale*: un radar chart per visualizzare il potenziale e la comparazione diretta contro altri giocatori su:
    * Potenza, calcolata come i punti totali ottenuti dal giocatore in percentuale al numero massimo di punti ottenibili (standardizzato a 4 gare per elenco);
    * Media Punti, calcolata sulla media del migliore giocatore, che serve come benchmark;
    * Vittorie, in percentuale sul numero di elenchi giocati
    * Elenchi giocati, il numero di partecipazioni sul totale degli elenchi considerati
    * Piazzamento, calcolato confrontando la posizione di arrivo differente dalla prima in ogni gara, penalizzando del 20% per ogni posizione persa.
- Dettaglio degli elenchi giocati
- Scontro Testa-a-Testa con gli altri giocatori, con la possiblità di vedere il confronto diretto dello *Sdrogo Potenziale* sul radar chart.

### 📱Versione Mobile

La versione mobile potrebbe avere bug grafici e non ossere ottimizata su tutti i dispositivi, in quanto lo sviluppo si è concentrato principalmente sulla versione desktop. 

La differenza principale sta nella creazione di una barra di navigazione per navigare tra le tre pagine. 

### ⏳Classifica All-time

Ho inserito la classifica All-time estrapolando i frame delle classifiche da alcuni dei video reperibili nelle playlist dei canali attraverso una rete neurale creata con PyTorch. I frame estratti sono poi stati sottoposti a un modello LLM per estrarre le classifiche in modo automatico, quindi inevitabilmente sono presenti degli errori in alcuni elenchi.

Nei prossimi push fornirò maggiori dettagli nel framework e nel codice utilizzato per estrarre questi frame e il modello utilizzato.


## 📂Struttura del Progetto

```bash
├── src
│   ├── app           # App Router (Pages: Drivers, Playlist)
│   ├── components    # UI components
│   ├── lib           # Core logic
│   │   ├── colors.ts # Player-specific color mapping
│   │   ├── data.ts   # Client-side data fetching & filtering
│   │   ├── data_server.ts # Server-side data engine
│   └── types         # Interface TypeScript globali
```

## 🚀Riproduzione del progetto
**Prerequisiti**
- Node.js 18.x o superiore
- npm / pnpm / yarn

**Installazione**
1. Clona la repositori
``` bash
git clone https://github.com/tuo-username/sdrogo-corse-dashboard.git
```

2. Spostati nella cartella
```bash
cd /percorso/alla/cartella/sdrogo-corse-dashboard
```

3. Installa le dipendenze

```bash
npm install
```
4. Avvia il server di sviluppo
```bash
npm run dev
```


## 📝Data Scheme

Tutti i dati storici sono gestiti tramite `/public/sdrogo_corse_stats.csv`. Per l'inserimento di nuovi dati, seguire lo schema: 

| **Campo** | **Descrizione** |
| :--- | :--- |
| `elenco_id` | ID incrementale dell'elenco |
| `video_owner` | Chi ha caricato il video |
| `giocatore` | Nome normalizzato del pilota |
| `punti_totali` | Punteggio nell'elenco |
| `punteggi_singole_gare` | Stringa formattata (es: "15, 10, 12, 10) |
| `num_gare` | Numero di gare nell'elenco |
| `titolo` | Titolo del video |
| `link` | URL YouTube |



##  ⚖️Disclaimer e Mantenimento

Questo progetto è stato fatto come hobby e al solo scopo di creare qualcosa di interessante per la community melagoodiana.

La versione attuale è stata prodotta, come già detto, tramite vibe-coding, per accelerare la produzione e ottenere in pochi giorni un sito funzionale.

Le mia abilità e il tempo a disposizione non mi permettono di seguire assiduamente e mantenere la directory e il sito aggiornati e di rispondere ad eventuali richieste di pull, ma qualsiasi miglioramento o contributo da parte della community sono ben accetti, sia per migliorare il progetto in se, sia che per implementare nuove funzionalità o nuove idee.

Tutti i loghi, video, e marchi appartengono ai rispettivi proprietari
