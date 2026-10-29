# Run-report e session-report nei software statistici

Data: 2026-10-29. Terminologia allineata a `AGENTS.md`:

- **run-report**: output di una singola procedura statistica (un run).
- **session-report**: insieme ordinato degli output di più run-report
  consecutivi nella stessa sessione.

Questa nota confronta i modelli dei programmi statistici più diffusi e ricava
le strutture ricorrenti utili per LazStats.

## 1. Quadro comparativo

| Programma | run-report | session-report | Finestra di output | Modello |
|---|---|---|---|---|
| **SPSS Statistics** | Gli output objects prodotti da una procedura (tabelle pivot, grafici, note) | Intero Viewer document (`.spv`) | Output Viewer con albero a sinistra e contenuto a destra | Albero/documento |
| **SAS** | Output ODS di un passo `PROC` (tabelle, figure, note) | Risultati ODS della sessione / documento esportato | Results window ad albero + Results Viewer; Log separato | Albero/documento |
| **Stata** | Blocco stampato da un comando (es. `summarize`, `regress`) | Intero Results window o file di log (`.smcl`/testo) | Results window a scorrimento; grafici in finestre separate | Log/stream |
| **R / RStudio** | Output di una chiamata o di un chunk (console, tabella, plot) | Documento R Markdown/Quarto renderizzato o notebook | Console, Plots, Viewer, Notebook; nessun albero unico di default | Notebook/documento |
| **JASP** | Blocco di una singola analisi con tabelle e grafici | Intero Results panel / file `.jasp` | Pannello destro a stack di blocchi comprimibili | Card/stack |
| **jamovi** | Blocco di una singola analisi | Intero Results panel / file `.omv` | Pannello destro a stack di analisi | Card/stack |
| **Minitab** | Output testuale di una procedura nella Session window + grafici collegati | Contenuto della Session window + oggetti del progetto | Session window testuale, Graph windows, Project Manager | Ibrido log + oggetti |
| **GraphPad Prism** | Results sheet di una singola analisi | Intero progetto Prism con più Results/Graph/Layout | Navigatore a fogli/tab del progetto | Documento a fogli |
| **Python / Jupyter** | Output di una cella (testo, HTML, plot) | Notebook intero o export HTML/PDF | Output inline sotto le celle; console separata in alcuni IDE | Notebook/documento |

## 2. Struttura generale di un run-report

Nei programmi che strutturano l'output — SPSS, SAS, JASP, jamovi, Prism — un
run-report tende ad avere sempre gli stessi blocchi logici.

```text
┌─ IDENTITÀ ────────────────────────────────────────────────┐
│ procedura · titolo · ID run · data/ora                    │
│ dataset · ruoli delle variabili · opzioni · livello CI    │
│ stato: ok / avviso / errore / obsoleto                    │
├─ DIAGNOSTICA E NOTE ──────────────────────────────────────┤
│ avvisi, assunzioni, casi esclusi, missing, pesi           │
├─ RISULTATI PRINCIPALI ────────────────────────────────────┤
│ tabelle primarie (test, stime, fit, effect size)          │
│ tabelle secondarie (post-hoc, contrasti, diagnostica)     │
│ grafici collegati                                         │
├─ LETTURA ─────────────────────────────────────────────────┤
│ interpretazione discorsiva / sintesi                      │
│ metodi, limiti e avvertenze                               │
├─ PROVENIENZA E AZIONI ────────────────────────────────────┤
│ parametri salvati · sintassi/codice · re-run · export     │
└───────────────────────────────────────────────────────────┘
```

Elementi ricorrenti:

1. **Identità**: la procedura e le scelte che l'hanno prodotta devono essere
   riconoscibili senza riaprire il setup.
2. **Stato**: warning, errori, risultati obsoleti e dati mancanti appartengono
   al run-report, non al session-report.
3. **Blocchi eterogenei**: tabelle, grafici, testo e callout convivono nello
   stesso run-report; l'ordine è stabile.
4. **Provenienza**: i parametri e la versione del software rendono il blocco
   riproducibile.
5. **Unità di esportazione**: un run-report deve poter essere esportato da solo,
   senza trascinare tutta la sessione.

Differenze principali:

- **SPSS/SAS** rappresentano il run-report come più output objects raggruppati
  sotto una procedura; l'unità è il documento, non la card.
- **JASP/jamovi** lo rappresentano come un unico blocco comprimibile e
  modificabile; l'unità è l'analisi.
- **Stata/Minitab** lo rappresentano come testo consecutivo; l'unità è il
  comando/procedura, ma i confini sono meno visivi.
- **R Markdown/Quarto e Jupyter** lo legano al codice che lo ha prodotto.

## 3. Struttura generale di un session-report

Il session-report è la collezione ordinata dei run-report, con un livello di
metadati e navigazione che il singolo run-report non ha.

```text
┌─ SESSIONE ────────────────────────────────────────────────┐
│ progetto · dataset · filtri · lingua · versione · data    │
├─ INDICE / OUTLINE ────────────────────────────────────────┤
│ 01  run-report 1                                          │
│ 02  run-report 2                                          │
│ 03  run-report 3                                          │
├─ CORPO ───────────────────────────────────────────────────┤
│ run-report 1                                              │
│ run-report 2                                              │
│ run-report 3                                              │
├─ STATO DI SESSIONE ───────────────────────────────────────┤
│ pin, collapse, filtri, stale, ordinamento, note           │
├─ ESPORTAZIONE ────────────────────────────────────────────┤
│ HTML / PDF / Word / Excel / codice riproducibile          │
└───────────────────────────────────────────────────────────┘
```

Elementi ricorrenti:

1. **Ordine cronologico** di produzione, con possibilità di pin o
   riordinamento.
2. **Indice navigabile**: in SPSS e SAS è un albero; in JASP/jamovi è lo
   scroll dei blocchi; in Stata è il log.
3. **Contesto condiviso**: dataset, filtri, pesi, missing e lingua valgono per
   tutti i run-report.
4. **Stato aggregato**: un run-report può essere obsoleto rispetto al dataset
   corrente mentre gli altri restano validi.
5. **Export aggregato**: il session-report è ciò che si stampa o si consegna
   come documento completo.
6. **Coerenza visiva**: tabelle, grafici e stili devono restare coerenti tra
   run-report consecutivi.

## 4. Come è strutturata la finestra di output

Si osservano quattro modelli dominanti.

### 4.1 Log/stream — Stata, Minitab Session, SAS listing

- L'output è aggiunto in coda, in ordine cronologico.
- La finestra è un testo scorrevole; i confini tra run-report sono dati
  dall'eco del comando e dalla formattazione.
- I grafici sono spesso in finestre separate.
- Vantaggi: semplicità, trascrizione fedele del flusso di lavoro.
- Limiti: poca navigazione, difficile confronto tra run-report, export
  strutturato debole.

### 4.2 Albero/documento — SPSS Viewer, SAS Results Viewer, Prism

- Un pannello a sinistra mostra l'albero dei risultati; a destra il contenuto
  formattato.
- Ogni nodo può corrispondere a una procedura, una tabella o un grafico.
- I run-report sono gruppi di nodi; il session-report è l'intero documento.
- Vantaggi: forte gerarchia, navigazione rapida, export documentale.
- Limiti: più rigido, meno “vivo” nel rifare un'analisi.

### 4.3 Card/stack — JASP, jamovi

- Ogni analisi aggiunge un blocco nel pannello risultati.
- Il blocco è comprimibile, eliminabile e spesso modificabile con aggiornamento
  live.
- L'ordine è quello di aggiunta; il session-report è l'intero stack.
- Vantaggi: ottima leggibilità, re-run immediato, separazione netta tra
  run-report.
- Limiti: sessioni molto lunghe richiedono outline, filtri e ricerca.

### 4.4 Notebook/documento — R Markdown/Quarto, Jupyter

- Codice e output sono intrecciati; il documento è il session-report.
- Il run-report è l'output di un chunk/cella.
- Vantaggi: riproducibilità e narrativa.
- Limiti: lo stato può essere non lineare; l'output non è sempre un oggetto
  persistente e navigabile.

### 4.5 Variante a fogli — GraphPad Prism, XLSTAT

- Ogni analisi produce un foglio o un gruppo di fogli nel progetto.
- Il session-report è il workbook/progetto.
- Vantaggi: semplicità mentale e stampa.
- Limiti: poca aggregazione e navigazione tra analisi eterogenee.

## 5. Schede per programma

### SPSS Statistics

- **Output Viewer**: albero a sinistra, output a destra.
- Ogni procedura aggiunge output objects (tabelle pivot, grafici, note,
  warning, log).
- Il file `.spv` è il session-report completo.
- Un run-report è l'insieme degli oggetti prodotti da una procedura.
- Le tabelle sono modificabili (pivot), i grafici hanno editor dedicato.

### SAS

- La session-report è la collezione ODS; la Results window mostra l'albero
  degli output objects e il Results Viewer il contenuto.
- Il Log è separato e non fa parte del report formattato, ma è essenziale per
  la provenienza.
- Un run-report è l'output di un passo `PROC`.
- L'export avviene per destinazione ODS (HTML, PDF, RTF, Excel).

### Stata

- Results window: flusso testuale di comandi e risultati.
- Grafici in Graph windows separate.
- Il log (`log using`) è la session-report naturale; `putdocx`, `putpdf`,
  `dyndoc` o `markdown` producono report strutturati.
- Un run-report è il blocco di un comando.
- Il confine è cronologico, non a card.

### R / RStudio

- Console, Plots, Viewer e Notebook sono superfici distinte.
- Un run-report è l'output di una chiamata o di un chunk.
- Il session-report è un documento R Markdown/Quarto renderizzato o un
  notebook esportato.
- La struttura del report dipende dai pacchetti usati (`gt`, `flextable`,
  `modelsummary`, `knitr`).
- Senza un documento, non esiste un session-report persistente e navigabile.

### JASP

- Pannello opzioni a sinistra, Results panel a destra.
- Ogni analisi è un blocco con titolo, tabelle e grafici; i blocchi si
  comprimono e si eliminano.
- Il file `.jasp` contiene dati, analisi e risultati.
- run-report = blocco di analisi; session-report = intero Results panel.
- È il modello più vicino a LazStats.

### jamovi

- Simile a JASP: ribbon/opzioni a sinistra, Results a destra.
- Ogni analisi aggiunge un blocco; il progetto `.omv` è il session-report.
- run-report = blocco; session-report = stack completo.
- Le analisi restano modificabili e ricalcolabili.

### Minitab

- Session window per l'output testuale, Worksheet per i dati, Graph windows
  per i grafici.
- Project Manager organizza worksheet, grafici, report e macro.
- run-report = output di una procedura + grafici collegati.
- session-report = Session window + oggetti del progetto.
- Modello ibrido: log testuale con oggetti separati.

### GraphPad Prism

- Progetto organizzato in Data tables, Results, Graphs e Layouts.
- Ogni analisi genera un Results sheet.
- run-report = Results sheet; session-report = progetto completo.
- Navigazione a fogli/tab, non a stream.

### Python / Jupyter

- Output inline sotto le celle; console separata in alcuni IDE.
- run-report = output di una cella o di un oggetto di analisi.
- session-report = notebook o export HTML/PDF.
- La riproducibilità richiede disciplina nell'ordine di esecuzione.

## 6. Implicazioni per LazStats

Stato attuale:

- `OutputConsole` è la **finestra del session-report**.
- Ogni `OutputEntry` / `article.output-card` è un **run-report**.
- L'outline, i pin, il filtro per analisi e l'export riguardano il
  session-report.
- I pulsanti “Re-run”, “Applica parametri”, “Setup”, “Modifica grafico”
  riguardano il singolo run-report.
- Lo stato “stale”, le warnings e i metadati appartengono al run-report.
- Le impostazioni “Finestra output” (sfondo, testo, font, dimensione) sono
  override del session-report, non del tema globale.

Raccomandazioni:

1. **Nominare esplicitamente i due livelli** nella documentazione e, dove
   serve, nella UI: “run-report” e “session-report”.
2. **Separare gli export**: “Esporta run-report” (singola card) e “Esporta
   session-report” (tutta la finestra).
3. **Dare identità stabile al run-report**: `id`, `analysisId`, `createdAt`,
   `datasetId`, `dataRevision`, `paramsSignature`, `ciLevel`, `status`.
4. **Dare identità al session-report**: dataset/progetto, filtri attivi,
   lingua, versione, data di creazione, elenco ordinato dei run-report.
5. **Mantenere l'outline** come indice del session-report, con numerazione
   stabile e raggruppamento per analisi/famiglia.
6. **Non mescolare stato e contenuto**: un run-report obsoleto resta nel
   session-report ma va marcato come tale.
7. **Conservare la provenienza**: parametri e versione devono rendere un
   run-report riproducibile anche dopo il reload.
8. **Evitare sessioni illeggibili**: introdurre ricerca/filtro per analisi e
   collasso persistente quando i run-report crescono.

## 7. Schema concettuale consigliato

```text
RunReport
  id
  analysisId
  title
  createdAt
  datasetId
  dataRevision
  params
  paramsSignature
  ciLevel
  status: ok | warning | error | stale
  blocks:
    - table
    - chart
    - narrative
    - callout
    - warning
  provenance:
    softwareVersion
    locale
    syntax/code

SessionReport
  id
  createdAt
  datasetId
  filters
  locale
  softwareVersion
  runs: RunReport[]
  viewState:
    pinnedIds
    collapsedIds
    activeFilter
```

Questo schema non richiede un cambio di formato: descrive il significato dei
dati già presenti in `OutputEntry` e nel vettore `outputs`.
