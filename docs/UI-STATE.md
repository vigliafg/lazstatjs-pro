# UI — stato attuale e backlog

> Aggiornato dopo la chiusura del backlog UI (UI-01…UI-11); griglia in
> [`GRID-STATE.md`](GRID-STATE.md).
> Checkpoint griglia: [`GRID-STATE.md`](GRID-STATE.md).
> Questo documento fotografa la UI dopo il workbench a tre zone e fissa il
> lavoro rimanente prima della fase dedicata a inserimento ed editing dei dati.

## 1. Sintesi

La UI non è più una barra di 31 schede con i form in un'unica riga. È un
workbench in tre zone:

1. **Library** — ricerca e famiglie di analisi.
2. **Setup** — parametri della procedura attiva e Run.
3. **Output** — documento a schede con outline, collapse e salto al Setup.

La scoperta delle procedure e la configurazione sono ora allineate al flusso
mentale dell'utente. L'iterazione non lo è ancora: manca il ciclo completo
*rileggi la card → applica i suoi parametri → cambia i dati → rilancia*.

**Valutazione sintetica: 8/10 come primo blocco di ricostruzione.**
Architettura giusta, esecuzione solida, iterazione incompleta.

## 2. Com'è fatta la UI oggi

### 2.1 Shell

| Area | Stato | Note |
|---|---|---|
| **Data** | evoluta | Griglia, tipi, livelli, missing code, formule persistenti, virtualizzazione, inspector, clean, transform, validazione, filtro, import/export, progetti |
| **Analysis** | ricostruita | Workbench a tre zone |
| **Settings** | invariata | Alcuni controlli generali restano non collegati |
| **Help** | aggiornata ai nuovi flussi | Contenuto ancora in parte ereditato dalla vecchia UI |

L'header mostra il brand LazStats e le quattro aree. Le etichette sono state
accorciate (`Data`, `Analysis`, `Settings`, `Help`).

### 2.2 Analysis workbench

**Library**

- 31 procedure raggruppate in 10 famiglie: Guided, Descriptive, Compare
  groups, Regression, Multivariate, Categorical, Survival, Time series,
  Missing data, Design & power.
- Ricerca su etichetta, descrizione, keyword e nome della famiglia.
- Risultati per prefisso di parola (`cox` non matcha più `wilcoxon`).
- Recenti: ultime 5 analisi in `localStorage`, l'attiva è esclusa.
- Badge `heavy` per le procedure costose.
- `Invio` seleziona il primo risultato, `Esc` pulisce la ricerca.
- Le famiglie si aprono/chiudono; quella attiva si apre automaticamente.

**Setup**

- Famiglia, titolo, descrizione e badge `heavy computation`.
- CI globale (90/95/99%).
- Form esistente, riusato senza riscrivere i 31 pannelli.
- Titoli di sezione contestuali (`Variables & model`, `Table & options`,
  `Design & precision`, `Missing data & pooling`, ...).
- Run sticky in basso; `Ctrl/Cmd + Enter` esegue.
- Su mobile si passa a Output solo se il run è andato a buon fine.
- Il contenitore verticale ha reso leggibili anche i form larghi; Chi-Square
  e Contingency sono stati compattati per il pannello stretto.

**Output**

- Una card per run, con etichetta dell'analisi, ora e titolo.
- Outline orizzontale cliccabile.
- Collapse/expand.
- Pulsante **Setup** che riapre la procedura che ha prodotto la card.
- Rimozione per card.
- Copy, Charts PNG, Report HTML e Results XLSX invariati.
- `analysisId` salvato nella card: il collegamento Setup sopravvive a reload e
  file `.lzs`. I progetti vecchi restano compatibili.
- Le card collapse restano nel DOM: Report HTML e XLSX le includono; il copy
  rimuove la classe `hidden` e le include.
- L'auto-scroll porta all'inizio della nuova card, non in fondo al report.

### 2.3 Responsive e tastiera

- Sopra `lg` (1024 px): tre pannelli affiancati, con libreria e setup
  nascondibili e **Focus output**.
- Sotto `lg`: segmented control `Library / Setup / Output`, un pannello alla
  volta.
- `Ctrl/Cmd + K` porta il focus alla ricerca della libreria e esce da Focus
  output se necessario.
- `Ctrl/Cmd + Enter` esegue l'analisi attiva.
- Restano attivi `Ctrl+Z` / `Ctrl+Y` della griglia.
- A 1024 px i tre pannelli sono usabili ma stretti; le tabelle larghe
  richiedono scroll orizzontale.

### 2.4 Persistenza e compatibilità

- Autosave e `.lzs` continuano a salvare griglia, preferenze, impostazioni,
  parametri e snapshot HTML.
- `StoredOutput.analysisId` è opzionale: nessun cambio di `PROJECT_VERSION`.
- I blocchi ripristinati senza `analysisId` mostrano `Result N` e non hanno il
  pulsante Setup.
- Il formato del progetto resta leggibile dalle versioni precedenti.

## 3. Mappa dei componenti

| File | Ruolo | Righe |
|---|---|---|
| `src/ui/AnalysisTab.tsx` | Shell del workbench, pane, focus, scorciatoie | ~220 |
| `src/ui/analysis/AnalysisLibrary.tsx` | Libreria, ricerca, famiglie, recenti, badge | ~274 |
| `src/ui/analysis/AnalysisOptions.tsx` | Setup, CI, switch sui 31 form, Run | ~417 |
| `src/ui/analysis/types.ts` | Contratto `AnalysisTabProps` | ~123 |
| `src/ui/analysis/useRecentAnalyses.ts` | Recenti in `localStorage` | ~39 |
| `src/ui/OutputConsole.tsx` | Documento output, card, outline, azioni | ~298 |
| `src/analyses/registry.ts` | Metadati UI + registro analisi | ~354 |
| `src/io/outputs.ts` | Snapshot + `analysisId` | invariato nella sostanza |
| `src/io/project/index.ts` | Persistenza `analysisId` | invariato nella sostanza |
| `src/index.css` | Card output, Run, focus ring, header | modificato |
| `src/help/helpContent.ts` | Help allineato al workbench | aggiornato |

I 31 form non sono stati riscritti: sono il contenuto del pannello Setup. Questo
ha tenuto basso il rischio, ma significa che la struttura interna dei form è
ancora quella di prima.

## 4. Cosa è completo

- [x] Registro analisi con famiglia, descrizione, keyword e costo.
- [x] Libreria ricercabile con famiglie e recenti.
- [x] Badge `heavy` e indicazione nel Setup.
- [x] Setup stabile con CI, form e Run sticky.
- [x] Output a card con outline e collapse.
- [x] Salto al Setup dalla card, anche dopo reload.
- [x] Persistenza di `analysisId` senza cambio di versione del progetto.
- [x] Layout desktop a tre pannelli.
- [x] Layout mobile a pannello singolo.
- [x] Focus output.
- [x] Scorciatoie `Ctrl/Cmd+K` e `Ctrl/Cmd+Enter`.
- [x] Chi-Square e Contingency compatti per il pannello stretto.
- [x] Help, README e ARCHITECTURE aggiornati.
- [x] Test del registro e della persistenza di `analysisId`.
- [x] Snapshot dei parametri nella card, **Re-run** e **Apply** dal risultato.
- [x] Stale anche quando cambiano i parametri dell'analisi.
- [x] **Live-run** per le procedure `instant`, con debounce e card unica.
- [x] Output workspace: filtro per analisi, pin, copia card, conferma Clear.
- [x] Store context/reducer e riduzione di `AnalysisTabProps` da 88 a 38 props.
- [x] Form system condiviso (`Field`, `VariableSelect`, `Advanced`, …).
- [x] Ricerca con ranking, preferiti e indice A–Z, navigazione da tastiera.
- [x] Settings onesta: azioni di sessione e progetti recenti.
- [x] Shell i18n centralizzata e footer/aria-live responsive.
- [x] Bundle senza warning: pannelli, help, IO e runners lazy.
- [x] Suite Playwright per il workspace analisi (desktop + mobile).

## 5. Valutazione

### 5.1 Punti di forza

- **La scoperta è risolta.** 31 procedure non sono più un catalogo da scorrere.
- **Il Setup è prevedibile.** La cornice è la stessa per tutte le analisi; cambia
  solo il contenuto.
- **L'output è un documento.** Card, outline e collapse sono il modello giusto.
- **Il rischio è stato contenuto.** Form e kernel non sono stati riscritti.
- **La persistenza è solida.** Il Setup jump funziona anche sui progetti salvati.
- **La tastiera è di prima classe.** Ricerca, selezione e run hanno una via
  completa senza mouse.

### 5.2 Limiti residui

1. **Live-run solo su richiesta.** Le procedure `instant` si aggiornano con il
   toggle *Live* e 500 ms di debounce; non è il default e le `heavy` restano
   esplicite.
2. **Contratto del workspace ancora ampio.** `AnalysisTabProps` è sceso da 88 a
   38 props e le slice passano dal reducer, ma griglia, output e ruoli restano
   props esplicite.
3. **Form system completo.** Tutti i 31 pannelli usano le primitive condivise
   (`Field`, `VariableSelect`, `VariableList`, `CheckboxList`, `Advanced`,
   `CheckboxField`).
4. **i18n del chrome.** Shell, form, editor dati e dialoghi passano da
   `src/i18n.ts`. Restano fuori solo i nomi propri dei metodi statistici
   (Tukey, Bonferroni, …) e il contenuto di help/report, che è prosa italiana
   per scelta editoriale.
5. **Preferiti locali.** Il ranking è per parole (non fuzzy) e i preferiti
   vivono in `localStorage`.
6. **Settings senza recent cliccabili.** I progetti recenti sono un elenco di
   nomi: senza File System Access non possono essere riaperti con un click.

### 5.3 Debito tecnico

- `AnalysisTabProps` è ancora un contratto unico ampio.
- I nomi dei metodi statistici restano non tradotti (sono nomi propri).
- I preferiti non sono persistiti nel progetto `.lzs` (solo browser).
- Help e report sono contenuto italiano, non stringhe di chrome.

## 6. Backlog

Priorità:

- **P0** — chiude il flusso di lavoro; va fatto prima del resto.
- **P1** — protegge il lavoro e riduce il rischio di regressioni.
- **P2** — qualità e produttività.
- **P3** — rifinitura e scala.

| ID | Pri | Intervento | Stato | Note |
|---|---|---|---|---|
| **UI-01** | P0 | Iteration loop: parametri nella card, re-run, apply | **Fatto** | `params`/`paramsSignature` nello snapshot; Re-run e Apply nella card; stale anche sui parametri |
| **UI-02** | P0 | Store context/reducer e riduzione props | **Fatto** | `ui/analysis/store.tsx`; 88 → 38 props; `applyAnalysisAction` testato |
| **UI-03** | P1 | Suite Playwright analisi | **Fatto** | 7 scenari: ricerca/run, collapse/Setup, reload, mobile, live-run, output workspace, libreria |
| **UI-04** | P2 | Live-run `instant` con debounce e stato | **Fatto** | Toggle Live, 500 ms, card unica sostituita, indicatore “syncing” |
| **UI-05** | P2 | Output workspace: filtro, pin, copia, conferma Clear | **Fatto** | Filtro per analisi, pin in cima, copia card, conferma su Clear |
| **UI-06** | P2 | Form system condiviso | **Fatto** | `Field`, `Section`, `VariableSelect`, `VariableList`, `CheckboxList`, `Advanced`, `CheckboxField`; **tutti i 31 form** migrati |
| **UI-07** | P2 | Responsive/a11y | **Fatto** | Footer mobile, focus dei pannelli, `aria-live`, libreria nascosta sotto 1280 px |
| **UI-08** | P3 | Ricerca con ranking, preferiti, A–Z, tastiera | **Fatto** | Punteggio per label/keyword/descrizione, preferiti, indice piatto, frecce/Home/End |
| **UI-09** | P3 | Settings e progetto | **Fatto** | Rimossi i controlli demo; azioni di sessione; elenco progetti recenti |
| **UI-10** | P3 | i18n | **Fatto** | Lingua UI = inglese; tutte le stringhe di chrome (shell, form, editor dati, dialoghi) in `src/i18n.ts`; help e report restano contenuto italiano |
| **UI-11** | P3 | Code splitting | **Fatto** | `AnalysisTab`, help, import/export e runners lazy; chunk vendor separati; nessun warning >500 kB |

### Esito

Tutti i blocchi sono chiusi o parziali come indicato. I residui (form non
migrati, i18n dei form, preferiti locali) sono miglioramenti incrementali, non
prerequisiti.

## 7. Criteri di accettazione

- Trovare una qualsiasi delle 31 procedure in **≤ 2 interazioni** (ricerca o
  famiglia).
- Eseguire una procedura in **≤ 3 click** da Analysis.
- Rilanciare un risultato storico con i suoi parametri in **≤ 2 click**.
- Vedere lo stato **stale** dopo un cambio di dati o parametri.
- Completare `ricerca → selezione → run → lettura` a 390 px senza scroll
  orizzontale della pagina.
- `npm run check` verde e suite UI verde.
- Nessun errore console nei flussi principali.
- Reload e `.lzs` ripristinano analisi attiva, parametri e card.
- Report HTML e XLSX includono anche le card collapse.

## 8. Rischi

- **UI-02 tocca App, persistenza e tutti i form.** Va fatto con test di
  regressione e senza cambiare il formato `.lzs`.
- **Salvare i parametri nella card aumenta la dimensione del progetto.** Serve
  un cap e una politica di compatibilità.
- **Il live-run può bloccare il thread** perché i kernel sono sincroni. Senza
  worker, va limitato alle analisi davvero economiche e con debounce.
- **I test UI richiedono Playwright e un browser in CI.** È una dipendenza nuova.
- **La UI può sembrare una vetrina senza il loop di iterazione.** UI-01 è il
  confine tra "bella navigazione" e "flusso di lavoro completo".

## 9. Prossima fase: inserimento ed editing dei dati

Analisi completata: [`docs/DATA-EDITING-ANALYSIS.md`](DATA-EDITING-ANALYSIS.md).

La fase successiva non parte dal codice: parte da un'analisi comparata dei
programmi più popolari, rapportata al nostro modello attuale.

### 9.1 Perimetro

Dentro:

- inserimento e modifica delle celle;
- colonne, tipi, metadati e livelli;
- paste/import, fill, sort, filter;
- colonne calcolate, split/merge, ricode;
- valori mancanti e validazione;
- undo/redo e integrità dei dati;
- griglie grandi e tastiera.

Fuori:

- nuove procedure statistiche;
- riscrittura dei kernel;
- backend o collaborazione multiutente.

### 9.2 Baseline attuale

La scheda Data ha già:

- griglia tipizzata (`num`, `int`, `dec`, `cat`, `str`, `id`, `bol`, `dat`,
  `dtm`, `tim`, `alp`, `chr`);
- editor dei livelli con label, ordine, reference e ricode;
- Clean: find/replace, trim, righe vuote/duplicate, missing con
  media/mediana/moda;
- Transform: sort, recode, split/merge, **compute one-shot**;
- filtro di visualizzazione, freeze prima colonna, validazione e auto-fix;
- undo/redo, paste TSV, fill down, selezione a intervallo;
- import CSV/TSV/JSON/Excel e export multi-formato;
- un solo `GridData` per progetto.

### 9.3 Programmi da confrontare

| Programma | Modello dati | Metadati | Editing | Lezione |
|---|---|---|---|---|
| **SPSS** | Data View + Variable View | Tipo, label, valori, missing, misura | Griglia + dialoghi Transform | Il dizionario variabili separato regge progetti grandi |
| **JASP** | Spreadsheet unico | Tipo e label inline | Editing diretto, basso attrito | La semplicità batte la completezza |
| **jamovi** | Spreadsheet + computed variables | Tipo, label, formula | Variabili calcolate di prima classe | La formula persistente è un vantaggio enorme |
| **Stata** | Data Editor + Variables Manager | Tipo, label, value labels, missing | Comandi + dialoghi | Metadati e riproducibilità |
| **SAS** | Tabelle e librerie | Tipi, label, formati | Table editor + task | Separazione dati/metadati |
| **Minitab** | Worksheet | Tipo, label, formato | Griglia + dialoghi | Modello column-centric |
| **Prism** | Tabelle per forma (XY, column, grouped, contingency, survival) | Tipi impliciti nella tabella | Tabelle specializzate | La forma dei dati è parte del contratto |
| **Excel** | Griglia libera | Nessun metadato statistico | Paste, fill, formule | Compatibilità e paste sono irrinunciabili |

### 9.4 Domande da chiudere

1. **Una griglia o più tabelle?** Le 31 analisi leggono un solo `GridData`;
   Prism dimostra il valore di più tabelle, ma il costo architetturale è alto.
2. **Variable View dedicata o metadati inline?** Oggi tutto sta nell'header e
   nel modale dei livelli. Una vista variabili scala meglio, ma aggiunge un
   secondo posto da mantenere.
3. **Colonne calcolate: one-shot o formula persistente?** Oggi `Compute` è
   un'operazione; jamovi/Excel suggeriscono una formula che si aggiorna.
4. **Valori mancanti: cella vuota o codici dedicati?** Serve una politica
   esplicita per analisi e import.
5. **Wide o long?** Le misure ripetute oggi sono wide; servono reshape e
   conversioni?
6. **Quanto Excel?** Paste, fill handle, drag, tastiera, formati.
7. **Griglie grandi?** Virtualizzazione, paste massivo, validazione incrementale.
8. **Mobile?** Editing completo o sola lettura/quick edit?

### 9.5 Deliverable della fase

1. Inventario preciso della scheda Data attuale.
2. Matrice di confronto dei programmi su modello dati, metadati, editing,
   import, performance e mobile.
3. 2–3 architetture candidate con trade-off:
   - **A.** Evolvere l'attuale griglia con Variable View e computed columns.
   - **B.** Modello SPSS-like: Data View + Variable View separati.
   - **C.** Modello Prism-like: più tabelle per forma del dato.
4. Scelta condivisa e piano a blocchi.
5. Solo dopo: implementazione.

### 9.6 Esito dell'analisi

La relazione griglia↔analisi è **snapshot con identità stabile**:

- l'analisi legge la griglia al Run, con i codici missing già azzerati;
- i parametri sono indici rimappati tramite `Column.id`;
- il filtro è view-only per default, con modalità analysis-filter esplicita;
- ogni modifica incrementa `dataRevision` e marca `stale` le card dipendenti;
- la colonna focalizzata può essere assegnata a qualsiasi ruolo dal Setup;
- un cambio tipo incompatibile con il ruolo blocca il Run e chiede di
  riselezionare la variabile.

DE-0..DE-7 sono completati. Checkpoint operativo in
[`GRID-STATE.md`](GRID-STATE.md), stato dettagliato e blocchi deferred in
`docs/DATA-EDITING-ANALYSIS.md` §12.

## 10. Decisioni aperte

- Una griglia o più tabelle?
- Variable View separata o metadati inline?
- Colonna calcolata persistente o one-shot?
- Lingua unica: inglese, italiano o i18n completa?
- Live-run di default per le analisi `instant`?
- Target primario: studente/ricercatore guidato o analista esperto?
