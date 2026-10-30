# Nuova finestra report card/stack con outline ad albero

- **Richiesta**: «scrivi il piano per la nuova versione della finestra di report card/stack con outline ad albero».
- **Obiettivo**: evolvere l'attuale `OutputConsole` in un **session-report** con:
  - card/stack dei **run-report**;
  - outline ad albero per famiglia → analisi → run-report;
  - ricerca, filtri di stato, pin e collapse;
  - export separato del singolo run-report e dell'intera sessione;
  - metadati di sessione sempre visibili;
  - layout responsive con outline laterale su desktop e drawer su pannelli stretti.
- **Criteri di successo**:
  1. La finestra mostra un outline navigabile con gruppi famiglia/analisi e un nodo per ogni run-report.
  2. Click sull'outline → scroll al run-report; scroll → evidenziazione del nodo attivo.
  3. Ricerca e filtri (`Tutti`, `Fissati`, `Stale`, `Warning`) nascondono i nodi e le card senza smontarle.
  4. I run-report hanno numero stabile, anche dopo reload e rimozioni.
  5. La card espone «Esporta run-report»; la toolbar espone «Esporta session-report».
  6. Il comportamento esistente di filtro per analisi, pin, collapse, clear, copy, re-run e modifica grafico resta invariato.
  7. Su pannello Output stretto l'outline diventa un drawer accessibile da tastiera.
  8. `npm run check`, `npm run test:e2e` e `npm run build` restano verdi.
- **Non-obiettivi**:
  - Non è un albero documentale completo tipo SPSS con nodi arbitrari, drag-and-drop e tabelle come nodi separati.
  - Non introduce notebook, celle di codice o esecuzione per chunk.
  - Non cambia kernel, runner, form o contenuto dei report.
  - Non introduce multi-sessione o più finestre di output.
  - Non cambia il formato `.lzs` in modo incompatibile: i nuovi campi sono opzionali.
  - Non introduce virtualizzazione: il limite attuale è 20 run-report persistiti.
- **Assunzioni**:
  - L'outline raggruppa usando `analysisMeta()` e `familyOf()` del registry; le analisi sconosciute finiscono in un gruppo «Altri».
  - I pin restano scorciatoie in cima all'outline e continuano a riordinare le card in alto, come oggi.
  - Il numero del run-report è persistito in un campo opzionale `runNumber`; i progetti legacy usano la posizione.
  - L'aspetto personalizzato della finestra output continua ad applicarsi al contenuto del session-report, outline compreso.
  - L'export del run-report riusa `buildReportFromElement` sul nodo della singola card.
  - Il pin/collapse/filtro restano stato di vista locale nella prima iterazione; la persistenza è una fase successiva.

## Stato attuale verificato

- `src/ui/OutputConsole.tsx` (566 righe) contiene già:
  - toolbar della sessione;
  - outline lineare a chip;
  - filtro per analisi;
  - pin e collapse;
  - card `<article class="output-card">`;
  - azioni per card e azioni di sessione.
- `OutputEntry` e `SessionOutputBody` vivono in `OutputConsole.tsx` e sono importati da `useOutputConsole.tsx` e `App.tsx`.
- `src/ui/analysis/outputSelection.ts` copre solo il filtro per analisi e conserva l'indice originale.
- `useOutputConsole.tsx`:
  - crea le card con `id` temporale e `runSeq`;
  - esporta HTML/Word/Excel/PNG sull'intero `#output-content`;
  - non ha un export per singola card.
- `StoredOutput` in `src/io/outputs.ts` non ha un numero di run persistito.
- `parseStoredOutputs` valida già campi opzionali e `capStoredOutputs` limita a 20 blocchi.
- Il registry espone `ANALYSIS_FAMILIES`, `analysisMeta`, `familyOf`, `familyLabel`, `analysisLabel`.
- `OutputConsole` riceve `outputStyle` e lo applica a `#output-content`; l'outline nuovo deve ereditare quell'aspetto.
- L'App è a 700 righe: le nuove responsabilità vanno in `AnalysisTab`/`OutputConsole`/hook, non in `App.tsx`.
- I test esistenti che vanno preservati:
  - `filters, pins and clears result cards`;
  - `returns to all analyses when the filtered card is removed`;
  - export PNG/report;
  - modifica grafico e reload.

## Vincoli dal repository

- `.dependency-cruiser.cjs`:
  - `ui/` non importa kernel/tabelle;
  - `hooks/` e `io/` passano dai barrel pubblici;
  - `components/` non conosce `ui/`.
- File sotto 700 righe; `OutputConsole.tsx` è già a 566, quindi va diviso prima di crescere.
- `PROJECT_VERSION` resta 3: `runNumber` è un campo opzionale.
- i18n attiva in 6 lingue (`en, it, de, es, fr, pt-PT`): ogni nuova chiave va in tutti i cataloghi.
- Il limite `MAX_STORED_OUTPUTS = 20` rende l'outline piccolo: niente virtualizzazione.
- Le card filtrate restano montate ma nascoste, perché export e PNG devono vedere tutta la sessione.
- La UI non deve perdere il comportamento del filtro per analisi già coperto da E2E.

## Approccio

1. **Card/stack resta il modello**: l'outline è un indice, non un secondo contenuto.
2. **Tre livelli nell'outline**: famiglia → analisi → run-report. I run-report restano le foglie.
3. **Numero stabile**: `runNumber` persistito; l'indice visivo non cambia quando si rimuove una card precedente.
4. **Pin come scorciatoie**: sezione «Fissati» in cima, senza duplicare i nodi reali; le card pinned restano in cima come oggi.
5. **Filtri non distruttivi**: le card non corrispondenti restano nel DOM con `hidden`, così export e report non cambiano.
6. **Export a due livelli**: sessione dalla toolbar, run-report dalla card.
7. **Responsive a container, non a viewport**: l'outline dipende dalla larghezza del pannello Output, non da quella dello schermo.
8. **Prima comportamento, poi persistenza**: pin/collapse/filtro locali nella v1; persistenza in una fase separata.

## Passi

1. **Modello e selettori puri dell'outline** — nuovo `src/ui/analysis/sessionOutline.ts`, test `sessionOutline.test.ts`.
   - Tipi:
     ```ts
     type OutlineRun = {
       id: string;
       runNumber: number;
       title: string;
       analysisId?: string;
       pinned: boolean;
       stale: boolean;
       warning: boolean;
     };
     type OutlineAnalysis = { id: string; label: string; runs: OutlineRun[] };
     type OutlineFamily = { id: string; label: string; analyses: OutlineAnalysis[] };
     type SessionOutline = { pinned: OutlineRun[]; families: OutlineFamily[]; total: number };
     ```
   - `buildSessionOutline(outputs, { pinnedIds, staleIds, query, filter })`.
   - Filtri: `all`, `pinned`, `stale`, `warning`.
   - Ricerca case-insensitive su titolo, etichetta analisi, famiglia e numero.
   - Analisi sconosciute → famiglia «Altri».
   - I gruppi senza run dopo il filtro non compaiono.
   - Test: ordinamento, numerazione, pin, ricerca, filtri, analisi sconosciuta, lista vuota. Rischio S.

2. **Numero stabile del run-report** — `src/io/outputs.ts`, `src/hooks/useOutputConsole.tsx`, `src/io/outputs.test.ts`.
   - `StoredOutput.runNumber?: number`.
   - `parseStoredOutputs` accetta solo interi `>= 1`; i legacy restano senza campo.
   - `useOutputConsole` inizializza `runSeq` dal massimo `runNumber` esistente + 1.
   - `pushOutput` assegna `runNumber` alla nuova card.
   - `capStoredOutputs` non rinumera.
   - Test: round-trip, legacy senza campo, cap che mantiene i numeri, nuova card dopo restore. Rischio S/M.

3. **Estrazione tipi e componenti** — nuova cartella `src/ui/output/`.
   - `src/ui/output/types.ts`: `OutputEntry`, `SessionOutputBody`, `restoredOutputs`.
   - `src/ui/output/SessionReportHeader.tsx`.
   - `src/ui/output/SessionReportToolbar.tsx`.
   - `src/ui/output/SessionOutline.tsx`.
   - `src/ui/output/RunReportCard.tsx`.
   - `src/ui/OutputConsole.tsx` resta l'orchestratore e riesporta i tipi per compatibilità o aggiorna gli import in `App.tsx`/hook.
   - Nessun cambio di comportamento in questo passo; test esistenti verdi. Rischio M.

4. **Header e toolbar del session-report** — `SessionReportHeader`, `SessionReportToolbar`, `AnalysisTab.tsx`.
   - `AnalysisTab` calcola `sessionMeta` da `grid`, `filterAffectsAnalysis`, `activeRowFilter`, `visibleRowCount`, `ciLevel`, `datasetId`.
   - Header:
     - dataset, righe/colonne, filtro attivo, numero run-report, analisi distinte, stale.
     - `Esporta session-report ▾`, `Cerca`, `Filtri ▾`, `Pulisci`.
   - Mantiene il select «Filter results by analysis».
   - Nuove chiavi i18n in tutte le lingue.
   - Test: E2E mostra metadati e mantiene il filtro per analisi. Rischio S/M.

5. **Outline ad albero** — `SessionOutline.tsx`.
   - Struttura:
     ```
     ★ Fissati
     ▾ Confronto
       ▾ ANOVA (2)
         01 ANOVA …
         04 ANOVA …
       ▸ T-Test (1)
     ▸ Regressione
     ```
   - `role="tree"`, `treeitem`, `aria-level`, `aria-expanded`, `aria-selected`.
   - Tastiera: `ArrowUp/Down` tra nodi visibili, `ArrowRight/Left` espande/collassa, `Home/End`, `Enter` attiva.
   - Click su famiglia/analisi espande; click su run-report scrolla alla card.
   - Ricerca con auto-espansione dei gruppi corrispondenti.
   - Filtri di stato con conteggi.
   - Sezione «Fissati» come scorciatoie, non duplicati.
   - Test unit già nel passo 1; E2E: gruppi visibili, ricerca, collapse, tastiera. Rischio M/L.

6. **Integrazione outline + card stack** — `OutputConsole.tsx`, `AnalysisTab.tsx`, `src/hooks/useContainerWidth.ts`.
   - Layout:
     ```text
     #output-content
       ├─ SessionReportHeader
       ├─ SessionReportToolbar
       └─ grid
            ├─ SessionOutline (220–260 px)
            └─ stack delle RunReportCard
     ```
   - Outline sticky, scroll indipendente.
   - `IntersectionObserver` sulle card per aggiornare il nodo attivo; click con `scrollIntoView`/`scrollTo`.
   - Evitare loop scroll ↔ observer con un flag `programmaticScroll`.
   - `useContainerWidth` con `ResizeObserver`:
     - pannello ≥ 720 px → outline laterale;
     - pannello < 720 px → pulsante «Indice» e drawer.
   - Drawer: focus trap leggero, `Esc` chiude, click su run-report chiude.
   - Le card filtrate restano montate con `hidden`.
   - Test E2E: desktop outline laterale, pannello stretto drawer, scroll sync. Rischio M/L.

7. **Export run-report vs session-report** — `useOutputConsole.tsx`, toolbar, `RunReportCard`.
   - Sessione: mantenere `exportReportHtml`, `exportReportWord`, `exportResultsXlsx`, `exportChartPngs`.
   - Run-report:
     - `exportRunReportHtml(entryId)`;
     - `exportRunReportWord(entryId)`;
     - riuso di `buildReportFromElement` sul nodo `#output-block-<id>`;
     - `awaitChartsReady` sulla card;
     - metadati: titolo del run-report, data/ora, analisi, CI.
   - Card: menu «Esporta run-report ▾» con HTML/Word.
   - Toolbar: menu «Esporta session-report ▾» con HTML/Word.
   - Toast distinti.
   - Test E2E: download del run-report e della sessione; il file del run-report non contiene altri titoli di card. Rischio M.

8. **Persistenza dello stato di vista** — implementato in `src/ui/output/sessionViewState.ts` + `useSessionViewState.ts`.
   - Salva `pinned`, `collapsedFamilies`, `collapsedAnalyses`, `filter`, `outlineFilter` per `datasetId` in `localStorage` con chiave versionata `lazstats.sessionView.v1`.
   - Non usa `ProjectSettings`: l'autosave del progetto non riparte a ogni collapse.
   - Scrittura sincrona perché lo stato è minuscolo: un reload immediato dopo un pin non lo perde; al mount lo stato viene riletto (copre anche il cambio scheda che smonta la console).
   - Store limitato agli ultimi 5 dataset; pin e filtri non più validi vengono potati.
   - Ricerca e card attiva restano volutamente non persistite.
   - Test: `sessionViewState.test.ts` (parse, prune, cap, round-trip) + E2E reload e cambio scheda.

9. **Chiusura e documentazione** — `docs/RUN-REPORT-SESSION-REPORT.md`, `docs/UI-STATE.md`, `README` se necessario.
   - Aggiornare il disegno semigrafico della finestra.
   - Documentare numero stabile, filtri, export a due livelli, responsive.
   - Aggiornare i conteggi test e i limiti.
   - `npm run check`, `npm run test:e2e`, `npm run build`. Rischio S.

**Totale: M/L.** Ordine consigliato: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9.

## Rischi e mitigazioni

| Rischio | Mitigazione |
|---|---|
| Rompere il filtro per analisi esistente | Conservare `filterId` e i test E2E; aggiungere filtri di stato separati |
| Export di sessione incompleto perché le card filtrate sono nascoste | Mantenere le card montate con `hidden`, come oggi |
| Scroll sync che entra in loop | Flag `programmaticScroll` + observer con `requestAnimationFrame` |
| Outline troppo largo su pannello Output stretto | Container query via `ResizeObserver`, non viewport |
| Numerazione che cambia dopo rimozione | `runNumber` persistito; fallback posizionale solo per legacy |
| `runNumber` duplicato dopo restore | Inizializzare `runSeq` dal massimo esistente |
| Export del run-report senza grafici pronti | `awaitChartsReady` sul nodo della card prima del clone |
| Perdita di accessibilità | Ruoli tree, roving tabindex, test tastiera, drawer con focus |
| File oltre 700 righe | Split in `src/ui/output/` prima di aggiungere logica |
| i18n incompleta | Chiavi in tutti i 6 cataloghi + test esistente |

## Alternative considerate

- **Albero documentale completo tipo SPSS**: scartato. Richiede un modello gerarchico con tabelle/grafici come nodi, drag-and-drop e sincronizzazione complessa; non serve al limite di 20 run-report.
- **Outline come pannello separato a tutta altezza**: scartato. Ridurrebbe troppo lo spazio delle card su pannelli Output da 500–700 px.
- **Notebook/documento**: scartato. È un cambio di paradigma, non una evoluzione della finestra output.
- **Persistenza in `ProjectSettings`**: scartata per la v1. Pin/collapse sono stato di vista, non contenuto del progetto; l'autosave non deve ripartire a ogni espansione.
- **Export per run-report renderizzato dai dati invece del DOM**: scartato. Il DOM è già la fonte usata dall'export di sessione e garantisce parità visiva.
- **Virtualizzazione dell'outline**: scartata. `MAX_STORED_OUTPUTS = 20` rende il problema inesistente.

## Definition of Done

- [x] Outline ad albero famiglia → analisi → run-report.
- [x] Numero stabile del run-report persistito.
- [x] Pin, collapse, ricerca e filtri di stato.
- [x] Scroll sync e nodo attivo.
- [x] Outline laterale su desktop e drawer su pannello stretto.
- [x] Export separato run-report / session-report.
- [x] Metadati di sessione visibili.
- [x] Filtro per analisi, pin, clear, copy, re-run e grafici invariati.
- [x] i18n completa in 6 lingue.
- [x] `npm run check`, `npm run test:e2e`, `npm run build` verdi.
- [x] `docs/RUN-REPORT-SESSION-REPORT.md` e `docs/UI-STATE.md` aggiornati.
- [x] Persistenza per dataset di pin, gruppi chiusi e filtri dell’outline.

Ricerca e card attiva restano volutamente stato transitorio: non vengono
persistite.
