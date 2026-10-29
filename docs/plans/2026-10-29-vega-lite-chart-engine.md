# Migrazione del motore grafico a Vega-Lite e grafici editabili in due fasi

- **Richiesta**: «richiesta di un piano di implementazione di cambio engine per la generazione di grafici da quello attuale al nuovo VEGA-LITE. la generazione dei grafici deve avere due fasi: fase 1: il grafico viene generato con le caratteristiche di default quando di lancia il run statistico e inserito nel report; fase 2: il grafico selezionato da dentro il report puo essere modificato in una viewport popup e al grafico possono essere aggiunte features e modifiche realative allo stile/colori ... richiedi il consenso dei subagenti e concordare al 100%.»
- **Obiettivo**: sostituire Victory con Vega-Lite, produrre ogni grafico come specifica serializzabile e renderlo modificabile per-card dentro il report, senza appesantire il flusso di analisi.
- **Criteri di successo**:
  1. Dopo un run, la card mostra tabelle → prosa del report → grafico(i), con il grafico di default già pronto.
  2. Cliccando un grafico si apre un editor popup grande; le feature generali e quelle della procedura sono attivabili con checkbox/select; **Done** reinserisce il grafico modificato, **Cancel** lo lascia invariato, **Reset** torna ai default.
  3. Le modifiche sopravvivono a reload e `.lzs`; il grafico resta modificabile dopo il ripristino.
  4. Il payload dei runner e dei worker è JSON-serializzabile; nessun componente React attraversa il worker.
  5. Nessun grafico esistente viene perso nella migrazione; i grafici nuovi per procedure oggi senza grafico sono un secondo milestone esplicito.
  6. Victory non è più importato né presente nelle dipendenze; anche `recharts` (dipendenza morta) viene rimossa; il renderer Vega-Lite è caricato on-demand.
  7. `npm run check`, Playwright, build e guardrail restano verdi; il chunk iniziale non cresce in modo percepibile.
- **Non-obiettivi**:
  - Non è un editor grafico generalista tipo Tableau: niente drag-and-drop di campi arbitrari, niente formule Vega scritte dall'utente.
  - Non cambia i kernel statistici né il testo dei report, salvo i dati derivati necessari ai grafici.
  - Non introduce nuovi metodi statistici.
  - Non implementa subito il menu “default grafici” nelle impostazioni: è il passo 8, predisposto ma successivo.
  - Non rende modificabili le vecchie card Victory già salvate: restano statiche; per modificarle si rilancia l'analisi.
- **Assunzioni**:
  - Vega-Lite 6, Vega 6 e `vega-embed` 7 funzionano con Vite 6 e React 19; lo spike iniziale lo verifica.
  - Il renderer SVG è sufficiente per report, Word, HTML e PNG; non serve canvas.
  - Le modifiche sono per-card. Un nuovo run riparte dai default; non eredita le modifiche del run precedente.
  - Il tema di default resta quello scuro dell'app; il tema “stampa chiaro” è una scelta dell'editor.
  - Il catalogo dei grafici standard è completo come direzione, ma l'implementazione è divisa in **Milestone A** (procedure che oggi hanno già un grafico) e **Milestone B** (procedure oggi senza grafico, dopo l'estensione dei kernel).

## Vincoli dal repository

- Victory è ancora una dipendenza runtime: `package.json:37`; i grafici sono React/Victory dentro i runner (`src/analyses/regression/run.tsx:1-10`, `src/analyses/ttest/run.tsx:1-9`).
- Il contratto di output ammette un `node` React e solo tre tipi di grafico serializzabili: `src/analyses/types.ts:15-23`, `src/stats/charts.ts:44-75`.
- Il renderer serializzabile è ancora Victory: `src/components/AnalysisCharts.tsx:1-8` e `:187-199`.
- Oggi l'ordine è tabelle → grafici → report: `src/components/AnalysisOutput.tsx:21-26`, `src/hooks/useOutputConsole.tsx:55-75`, commento in `src/components/AnalysisReport.tsx:42-45`.
- La persistenza conserva solo HTML statico: `src/io/outputs.ts:22-39`, `src/io/project/index.ts:30-45`, `src/io/project/types.ts:8-10` (versione 2).
- Le card ripristinate iniettano quell'HTML e non hanno un albero React modificabile: `src/ui/OutputConsole.tsx:470-475`.
- L'export PNG cerca qualunque `<svg>` grande: `src/io/chartExport.ts:72-81`; l'export report clona l'HTML con gli SVG inline: `src/io/reportExport.ts:130-139`.
- I worker restituiscono `tables`, `report`, `charts`, `header`: `src/analyses/worker/heavy.worker.ts:51-59`; i runner heavy sono 9 (`src/analyses/worker/heavyRunners.ts:19-40`).
- Le impostazioni oggi coprono solo sessione e IO: `src/ui/SettingsTab.tsx:6-16`; non esiste un default per i grafici.
- Le regole di dipendenza vietano a `stats/` di conoscere UI/analyses/io: `.dependency-cruiser.cjs`; il file-size guard è a 700 righe (`scripts/check-file-size.mjs`).
- `AnalysisOptions.tsx` è a 688 righe e `App.tsx` a 684: le nuove superfici vanno in file/hook dedicati.
- I sample e2e sono in `samples/` e il manifest è `samples/manifest.json`; il runner di test è `src/io/samples.test.ts`.
- Il multilingua è attivo in sei lingue (`en, it, fr, es, de, pt-PT`): la prosa dei report passa da `copy()` con la lingua del report (inoltrata anche ai worker), la chrome da `t()`. Oggi titoli e note dei grafici sono stringhe italiane dentro i runner/`AnalysisChart`: la migrazione deve portarle nel contratto localizzato, altrimenti l'export inglese torna misto.

## Stato attuale

- Solo Cox e Time Series passano dal worker con grafici serializzabili; le altre procedure costruiscono Victory direttamente nel `node`.
- Grafici presenti oggi, che non devono sparire:
  - descriptive: medie, boxplot, istogramma, Q-Q;
  - t-test: boxplot per gruppo/differenze;
  - ANOVA: boxplot per gruppo e rank boxplot;
  - factorial: interaction plot;
  - ANCOVA: barre raw/adjusted;
  - repeated ANOVA: barre delle condizioni;
  - non-parametric RM: barre Friedman/Cochran;
  - regression: scatter + retta OLS/Theil-Sen + boxplot residui;
  - correlation: scatter raw/rank + boxplot;
  - logistic: curva predetta + punti osservati;
  - multivariate: scree + score plot;
  - chi-square: barre observed/expected;
  - agreement: Bland-Altman;
  - survival: curve Kaplan-Meier;
  - Cox: forest plot;
  - time series: ACF e forecast;
  - sample size: curva di potenza.
- Non hanno grafici oggi: `mixedanova`, `tost`, `countreg`, `ordinal`, `lmm`, `gee`, `stratcox`, `tdcox`, `parametric`, `contingency`, `mi`, `resampling`, `wizard`; `nonparamrm` ha solo Friedman/Cochran, non McNemar/Jonckheere; `agreement` ha solo Bland-Altman, non ICC/kappa.
- Non esiste un modello di feature: ogni grafico è codice JSX con stili hard-coded. Non c'è persistenza di opzioni, né un punto unico per griglie, palette, punti, linee.
- Il report HTML/Word dipende dagli SVG già nel DOM; un renderer asincrono come Vega richiede un “ready” esplicito prima di esportare.
- I testi dei grafici non sono ancora localizzati: `AnalysisChart` porta `title`, `subtitle`, `note` e `xLabel` come stringhe, alcune italiane. Le card in inglese oggi mostrano tabelle e report tradotti ma titoli/note dei grafici in italiano: va chiuso nella stessa migrazione.
- La card è già la sede naturale dell'edit: l'utente vede il grafico nel report e lo seleziona lì.

## Approccio proposto

### 1. Perché Vega-Lite

Vega-Lite è dichiarativo: un grafico è un oggetto JSON compilabile in Vega. Questo risolve insieme tre problemi:

1. **Worker**: il runner produce solo dati e specifiche, non React.
2. **Editing**: le feature sono trasformazioni pure del modello + opzioni, non patch a un albero di componenti.
3. **Persistence**: si salvano modello e opzioni, non un SVG o un HTML opaco.

Non si usa `react-vega`: aggiunge un wrapper senza dare il controllo sul ciclo di vita della `View`, sul rendering SVG e sugli export. Si usa `vega-embed` direttamente in un componente React dedicato.

### 2. Strati (riuso del contratto esistente)

Non si crea un secondo contratto di grafico. Si **estende** `AnalysisChart` in `src/stats/charts.ts`; la nuova parte pura vive in `src/charts/`:

```
src/stats/charts.ts          contratto puro e serializzabile (evoluzione di AnalysisChart)
src/charts/                  puro, senza React
  features.ts                descrittori delle feature (generali + specifiche)
  defaults.ts                default di fabbrica e merge futuro con i default utente
  schema.ts                  parse/validate/cap per .lzs e worker
  vega/theme.ts              palette, font, assi, griglia
  vega/buildSpec.ts          AnalysisChart + ChartOptions -> Vega-Lite TopLevelSpec
  kits/                      costruttori per famiglia/procedura
src/components/charts/       React + vega-embed, caricati on-demand
  VegaChart.tsx              mount/update/finalize della View, SVG
  ChartCard.tsx              cornice, titolo, note, pulsante Edit
  ChartEditorDialog.tsx      popup, preview, Done/Cancel/Reset
  ChartControls.tsx          checkbox/select/number/color/range
src/analyses/.../run.tsx     solo tables, report, charts, title
```

Regola dependency-cruiser nuova: `src/charts/` può importare `src/stats/charts` e `src/grid` solo per tipi; mai `ui/`, `analyses/`, `hooks/`, `components/`.

### 3. Evoluzione di `AnalysisChart`

Il contratto esistente ha già `id/kind/title/subtitle/note` e attraversa già il worker (`src/stats/charts.ts:44-75`, `src/analyses/worker/heavy.worker.ts:51-59`). Si estende con:

```ts
interface ChartModelBase {
  version: 1;
  id: string;
  kind: ChartKind;
  title: string;
  subtitle?: string;
  note?: string;
  layout: 'full' | 'half';
  data: Record<string, ChartRow[]>;   // layer nominati: points, fit, band, ...
  fields: Record<string, string>;     // nomi leggibili per assi/legenda
  stats?: Record<string, number | string | null>;
  options: ChartOptions;
  sampled?: boolean;
}
```

I dati sono già aggregati dal runner: il renderer non ricalcola statistica. Per esempio una regressione semplice produce `points`, `fit`, `band`, `robust`, `stats.intercept/slope/r2/n/df`; un boxplot produce `summary` con min/q1/mediana/q3/max/outliers/mean; una survival produce `curves` con time/survival/lo/hi/censored. I grafici con molti punti vengono decimati in modo deterministico a `MAX_CHART_POINTS = 2000` e il modello espone `sampled: true` con una nota.

`ChartOptions` è un'unione discriminata per `kind`, non un `Record<string, unknown>` non validato. L'editor e i default usano una tabella dati di controlli (id, label, tipo, get/set) costruita sull'unione; niente registry di classi.

### 4. Costruzione Vega-Lite

`buildVegaSpec(model, options)` restituisce un `TopLevelSpec` composto da layer:

- `point`/`circle` per scatter;
- `line` per rette, serie, KM, forecast;
- `area` per bande di confidenza/predizione;
- `bar` per barre, istogrammi, ACF/PACF;
- `rect` per heatmap/mosaic;
- `rule` per reference line, IC, limiti;
- `text` per equazione, R², etichette;
- `tick` per intervalli di gruppo quando il dato è già aggregato.

Dove Vega-Lite ha un mark nativo adatto (`boxplot`, `errorbar`) si usa quello per il default; i layer custom servono solo per forest, KM, bande CI già calcolate e mosaico. Le statistiche sono precalcolate o riducibili da `stats`; niente transform che richiedano dati grezzi. Il builder è testabile in Node con `vega-lite.compile()`; non importa React.

Per la regressione semplice il modello conserva `xGrid`, `yhat`, `seMean`, `sePred`, `df`; il builder calcola la banda per il livello scelto (90/95/99) con il t critico. In regressione multipla il grafico standard diventa **osservati vs fitted** + **residui vs fitted**, non una singola retta.

### 5. Due fasi

**Fase 1 — run.** Il runner calcola tabelle, prosa e uno o più `AnalysisChart`; `defaultOptions(kind, chartDefaults, context)` produce le opzioni. La card renderizza il grafico dopo la prosa del report. Nessun popup, nessun costo di editing.

**Fase 2 — edit.** `ChartCard` espone un pulsante/focus “Edit chart”; click o Enter apre `ChartEditorDialog`. Il dialogo lavora su una copia di `ChartOptions` e su una preview Vega-Lite. **Done** aggiorna il `chart.options` nella card (senza rilanciare l'analisi); **Cancel** scarta; **Reset** ripristina i default. La card aggiorna il grafico e l'autosave.

### 5.1 Layout del viewport di editing

L'editor è una finestra di lavoro, non un form: il grafico resta grande e visibile, le scelte sono divise per responsabilità.

```
┌──────────────────────────────────────────────────────────────────────┐
│ Titolo del grafico · nome analisi              [Reset] [Cancel] [Done]│
├──────────────────────────────────────────────┬───────────────────────┤
│ [Default ▾] [Dark ▾] [Grid X] [Grid Y]      │ Features for scatter  │
│ [Palette ▾] [Legend]  [More style ▾]         │ ┌ Fit ──────────────┐ │
│ ──────────────────────────────────────────── │ │ Line: [OLS ▾]     │ │
│                                              │ │ Robust: [ ]       │ │
│              PREVIEW VEGA-LITE               │ └───────────────────┘ │
│                                              │ ┌ Uncertainty ──────┐ │
│                                              │ │ Band: [95% CI ▾]  │ │
│                                              │ │ Opacity: [slider] │ │
│                                              │ └───────────────────┘ │
│                                              │ ┌ Annotation ───────┐ │
│                                              │ │ Equation: [x]     │ │
│                                              │ │ R²: [x]           │ │
│                                              │ └───────────────────┘ │
│                                              │ [Reset this section]  │
├──────────────────────────────────────────────┴───────────────────────┤
│ (mobile: il pannello specifico collassa sotto il grafico)            │
└──────────────────────────────────────────────────────────────────────┘
```

**Shell.** Header globale separato dai controlli: titolo del grafico e nome analisi a sinistra; `Reset`, `Cancel`, `Done` a destra, con `Done` primario. `Escape` chiude solo se non ci sono modifiche; se dirty chiede conferma (stesso pattern di `window.confirm` già usato in `OutputConsole`). Focus trap minimale, focus iniziale sul titolo, ritorno del focus al pulsante Edit. `aria-modal`, `role="dialog"`, `aria-labelledby`.

**Toolbar superiore (generali).** Sta sopra il grafico, nella colonna sinistra, e resta sticky mentre il preview scorre. Inline mostra solo le scelte di uso frequente: preset, tema, griglia X, griglia Y, palette, legenda. `More style` non è un popover posizionato: è un blocco `<details>`/`FieldSet` immediatamente sotto la toolbar, che riusa il pattern di divulgazione progressiva di `FormFields`; contiene sfondo, colore testo/assi, forma/dimensione punti, spessore/tratteggio linee, titolo/note on/off, dimensione del grafico. Ogni controllo ha label visibile o `aria-label`; niente icone senza testo per scelte ambigue. Le feature non applicabili sono **nascoste**; non si usa il doppio registro nascosto/disabilitato.

**Fascia laterale destra (specifiche).** Larghezza 320–360px, scroll indipendente, gruppi `fieldset`/`legend`: per la regressione `Fit`, `Uncertainty`, `Annotation`, `Points`; per il boxplot `Data`, `Summary`, `Order`; per la survival `Curve`, `Censoring`, `Risk table`, `Annotation`. I controlli sono checkbox, select/listbox, number input, range, color. L'ordine dei gruppi usa una checkbox-list/select con pulsanti su/giù già presenti in `FormFields`, non un `<select multiple>`. In cima: “Features for <chart type>” e `Reset this section`; se non ci sono opzioni specifiche, empty state “No specific options for this chart”. Il pannello contiene **solo opzioni di visualizzazione ricavabili dal modello già calcolato**: non cambia orizzonte di previsione, metodo post-hoc, numero di imputazioni o altri parametri statistici.

**Responsive.** Sopra 1024px: due colonne, grafico flessibile, pannello destro fisso. Sotto 1024px: dialog full-screen; toolbar sticky con wrap/scroll orizzontale; il pannello specifico collassa in un `<details>` sotto il grafico (niente bottom sheet/tab e niente stato di navigazione aggiuntivo). Il grafico mantiene un'altezza minima e non viene coperto.

**Stato.** Il dialogo lavora su una copia di `ChartOptions`; la preview è live con debounce ~120ms. `Done` committa in `chart.options`, `Cancel` scarta, `Reset` riporta ai default del kind. Un dirty indicator è visibile nell'header. `ChartEditorDialog` gestisce shell/stato/focus; `ChartGeneralToolbar` e `ChartSpecificPanel` sono solo layout che compongono `ChartControls`; `ChartControls` è l'unico renderer dei controlli; `features.ts` è l'unico registro con un flag `prominent` per i sei controlli inline.

### 6. Feature generali (v1)

Valide per ogni grafico, mostrate in “General” con preset e controlli semplici:

- preset: `Default`, `Minimal`, `Print light`;
- tema: scuro app / chiaro;
- sfondo card e sfondo plot;
- griglie: nessuna / orizzontale / verticale / entrambe; opacità;
- titolo, sottotitolo, note: mostra/nascondi;
- legenda: mostra/nascondi, posizione destra/basso;
- palette: default, colorblind, monocromatica;
- punti: forma, dimensione, opacità;
- linee: spessore, tratteggio;
- assi: titoli, zero baseline;
- dimensione: compact/regular/wide;
- tooltip on/off.

Sono fuori dalla v1 e passano al passo 8: rotazione tick, formato numerico, angoli barre, alt text avanzato, preset multipli, jitter generalizzato. Le feature non applicabili sono nascoste (es. “log scale” solo se i dati sono positivi).

### 7. Feature specifiche (v1 e catalogo)

Sono dichiarate per `kind` e mostrate in “This chart”. Per la v1:

- **regressione**: retta OLS / Theil-Sen / entrambe; banda di confidenza 90/95/99 o predizione; opacità banda; equazione breve/estesa; R² breve/esteso; N; etichette punti.
- **boxplot**: punti grezzi, outliers, media, mediana etichettata, ordine gruppi.
- **barre/medie**: barre d'errore SE/IC 95/SD, etichette valore, linea di riferimento, ordinamento.
- **ANOVA/factorial/ANCOVA**: bracket di significatività post-hoc, medie adjusted vs raw, linee di interazione.
- **correlazione**: retta di fit, banda IC, r/p, matrice vs singola coppia.
- **logistica**: curva predetta, proporzioni osservate, cutoff, shading classificazione.
- **survival**: IC, censor marks, risk table, median lines, log-rank annotation.
- **Cox/stratcox/tdcox**: scala log, reference HR=1, ordinamento, tabella HR/CI/p.
- **time series**: osservato/previsione/IC già calcolati, ACF/PACF, bande; l'orizzonte di previsione resta un parametro dell'analisi e non si modifica dall'editor del grafico.
- **multivariate**: scree con linea Kaiser, score plot, loadings arrows, etichette.
- **agreement**: Bland-Altman bias/LoA/CI, identity line; kappa heatmap e ICC scatter nel Milestone B.
- **chi-square/contingency**: observed vs expected, residui standardizzati, mosaico.
- **istogramma/Q-Q**: bins, densità normale, rug, mean/median line, Q-Q CI.
- **forest**: log scale, sort, tabella.
- **ACF/PACF**: barre, bande di confidenza.
- **resampling/sample size/MI/parametric/count/ordinal/LMM/GEE**: feature del Milestone B, dopo i dati kernel.

### 8. Output, ordine e persistenza

Il contratto finale diventa:

```ts
type AnalysisRunResult =
  | { ok: true; title: string; tables: TableSpec[]; report: ReportSpec | null;
      charts: AnalysisChart[]; header?: string }
  | { ok: false; reason: string };
```

`node` sparisce. `AnalysisOutput` compone, in un solo punto:

```
title / header
tables
AnalysisReport (prosa)
charts (ChartCard, editabili)
```

Durante la migrazione resta un fallback `node` per i runner non ancora convertiti; il fallback viene rimosso al passo 7. Non si crea un secondo tipo di blocco output.

Per non perdere le card già salvate:

- `PROJECT_VERSION` sale a 3; `parseProject` accetta v1/v2/v3.
- Una card v3 strutturata conserva `title`, `html` (solo tabelle + prosa, per il ripristino leggero), `charts` (modelli + opzioni), `header` e i metadati esistenti.
- Una card v1/v2 conserva l'HTML Victory e resta statica, senza pulsante Edit; un hint invita a rilanciare l'analisi.
- `pushOutput` costruisce l'HTML statico **senza grafici**; i grafici vengono renderizzati live da `charts` in sessione e dopo il reload.
- `createProjectSnapshot`/`parseStoredOutputs` validano e limitano i modelli; `capStoredOutputs` misura HTML + JSON dei grafici.

Limiti espliciti:

- `MAX_CHARTS_PER_OUTPUT = 24` (limite di interfaccia, non solo di persistenza);
- `MAX_CHART_POINTS = 2000` per grafico (downsample deterministico);
- `MAX_CHART_MODEL_CHARS = 120_000` per grafico;
- `MAX_OUTPUT_CHARS = 600_000` per card, HTML + JSON dei grafici;
- `MAX_STORED_OUTPUT_CHARS = 1_500_000` totale, invariato;
- **oltre 24 grafici**: i primi 24 restano live e persistiti, gli altri vengono omessi con una nota nella card (`chartLimitNote`) e un comando “mostra tutti” che li renderizza solo in sessione; nessun grafico viene eliminato in modo silenzioso;
- per `descriptive`, i Q-Q sono limitati alle prime 8 variabili selezionate; oltre, la nota dice di ridurre la selezione. Questo evita che una descrittiva con 100 variabili generi 100 grafici;
- se un grafico supera il limite in caratteri dopo il downsample, viene rimosso dalla persistenza con `chartStored: false` e la card mostra “grafico non persistito: rilancia l'analisi”; tabelle e prosa non si perdono;
- se il totale dei grafici supera `MAX_OUTPUT_CHARS`, si persistono i grafici nell'ordine finché c'è spazio, gli altri ricevono `chartStored: false` con la stessa nota;
- test espliciti per: 24+ grafici, Q-Q oltre 8 variabili, modello oltre 120k, output oltre 600k, `.lzs` manomesso.

### 9. Export asincrono

Vega-Lite renderizza in modo asincrono. Prima di copiare o esportare si attende:

```ts
awaitChartsReady(root, { timeoutMs: 5000 });
```

- `ChartCard` espone `data-chart-state="loading|ready|error"` e `data-chart-background`.
- `copyCard`, `copyOutput`, `exportChartPngs`, `exportReportHtml`, `exportReportWord` diventano asincroni e attendono i grafici; se un grafico fallisce, esportano gli altri e mostrano un avviso.
- `chartExport` cerca solo `[data-chart-surface] svg`, non qualunque SVG; usa il background dichiarato dal tema.
- `reportExport` mantiene l'SVG inline ma non forza più un fondo scuro: lo sfondo è quello del grafico/preset.
- `exportResultsXlsx` resta sincrono: usa solo tabelle.

### 10. Worker

I runner heavy smettono di importare Victory. Restituiscono `title`, `tables`, `report`, `charts`, `header`; il worker posta gli stessi campi. Il client li propaga. Il bundle del worker perde Victory e non acquisisce Vega: il runtime Vega-Lite resta solo nel chunk lazy del main thread.

### 11. Default futuri (passo 8)

`ChartDefaults` è un oggetto opzionale nei settings del progetto. Nella v1 esiste solo il merge `factory defaults < per-card options`; la catena `user defaults` viene aggiunta al passo 8 insieme al menu Settings “Charts”. Il menu riusa `ChartControls` in modalità `defaults`; le modifiche valgono per i run futuri, non retroattivamente. Reset ai default di fabbrica.

## Grafici standard per procedura

La tabella è il catalogo completo richiesto. **Milestone A** = migrazione senza perdere grafici esistenti; **Milestone B** = grafici nuovi, dopo i dati kernel indicati. La colonna “Dati oggi” dice se il grafico può essere costruito subito o richiede un'estensione.

| Procedura | Milestone | Grafico/i standard (default) | Feature specifiche principali | Dati oggi |
|---|---|---|---|---|
| wizard | — | nessuno; apre la procedura scelta | — | — |
| descriptive | A | boxplot per variabile; medie con IC; istogramma della prima; Q-Q per variabile | IC, outlier, densità normale, Q-Q CI, ordine | Sì |
| distfit | A | probability plot osservato vs teorico | distribuzione, scala log, densità | Sì |
| ttest | A | boxplot per gruppo / differenze / one-sample + linea test | valore test, media/mediana, IC, punti | Sì |
| anova | A | boxplot per gruppo; medie con IC opzionale | bracket post-hoc, ordine, outlier | Medie sì; IC da calcolare |
| factorial | A | interaction plot delle medie di cella | IC, etichette n, ordine fattori | Medie sì; IC da calcolare |
| ancova | A | medie adjusted con IC; raw opzionale | covariate value, adjusted/raw, IC | Medie sì; IC da calcolare |
| repeatedanova | A | medie condizioni con IC; traiettorie soggetti | barre errore, linee soggetti | Medie/SD sì; IC da calcolare |
| mixedanova | B | interazione gruppo × condizione; traiettorie | IC, ordine, linee soggetti | No: IC celle da esporre |
| nonparamrm | A/B | Friedman mean ranks e Cochran proportions (A); McNemar discordant e Jonckheere group box/trend (B) | CD Nemenyi, exact p, ordine | Friedman/Cochran sì; McNemar/Jonckheere da esporre |
| tost | B | differenza + IC vs margini | margini, IC, shading equivalenza | Sì (stats diff/CI), manca solo il kit |
| regression | A | scatter + retta OLS; residui vs fitted; Q-Q residui | OLS/robust, banda CI/PI 90/95/99, equazione, R² | Sì; bande/fitted da aggiungere |
| correlation | A | scatter prima coppia + fit/IC; matrice heatmap se >2 | metodo, fit, ellisse, r/p, rank | Coppie sì; fit/IC da aggiungere |
| logistic | A | curva predetta + proporzioni osservate | cutoff, IC, logit, shading | Curva sì; IC se non già |
| countreg | B | osservati vs predetti; residui | famiglia, jitter, y=x | No: fitted/residui interni |
| ordinal | B | curve probabilità categorie; osservati vs predetti | categoria, cumulativa/individuale, predittore | No: probabilità predette |
| lmm | B | fitted vs observed; medie gruppo/ICC; Q-Q | ICC, gruppi, random intercept | No: fitted/residui/group means |
| gee | B | fitted vs observed; medie cluster | famiglia, cluster, marginal means | No: fitted/residui interni |
| multivariate | A | scree; score plot; loadings heatmap | Kaiser, label, arrows, ellissi | Sì |
| chisquare | A | observed vs expected bar; residui heatmap | expected labels, residual scale | Sì (tabella manuale) |
| contingency | B | mosaico o heatmap observed/expected | ordine, residui, etichette | Sì (tabella manuale), manca il kit |
| agreement | A/B | Bland-Altman (A); kappa heatmap e ICC scatter (B) | LoA, bias CI, identity, labels | Bland sì; ICC/kappa da kit |
| survival | A | KM curve | IC, censor, risk table, median, log-rank | Sì |
| cox | A | forest plot | log, reference, sort, table | Sì |
| stratcox | B | forest; KM per stratum opzionale | strata, log, reference | Coefficienti sì; baseline per strata da verificare |
| tdcox | B | forest | log, reference, interval note | Coefficienti sì |
| parametric | B | survival/hazard/cumulative hazard per profilo | distribuzione, profilo, IC | No: curve per profilo |
| timeseries | A | observed+forecast+IC; ACF/PACF | mostra/nascondi forecast già calcolato, IC, bande ACF/PACF; orizzonte e periodo restano parametri dell'analisi | Sì |
| mi | B | missingness bar/heatmap; densità observed/imputed | variabili, overlay | No: pattern e densità |
| samplesize | A | power curve | target line, design marker, scale | Sì |
| resampling | B | bootstrap distribution; permutation null | observed line, CI shading, bins | No: distribuzioni da esporre |

## Passi

1. **Spike tecnico e decisione dipendenze** — file: `package.json`, `vite.config.ts`, `docs/plans/...`
   - Provare `vega@6.4`, `vega-lite@6.5`, `vega-embed@7.3` con React 19/Vite 6: mount, `renderer:'svg'`, `view.runAsync()`, `view.toSVG()`, cleanup in StrictMode.
   - Misurare i chunk con `manualChunks` (`vega`, `vega-lite`, `vega-embed`) e verificare che il bundle iniziale non includa il runtime.
   - Verificare che `AnalysisChart` esteso passi `structuredClone` e il worker; verificare `vega-lite.compile` in Node.
   - Rischio: bundle/`vega-embed` asincrono. Stima: M.
2. **Contratto e adapter Vega-Lite** — file: `src/stats/charts.ts`, `src/charts/features.ts`, `src/charts/defaults.ts`, `src/charts/schema.ts`, `src/charts/vega/theme.ts`, `src/charts/vega/buildSpec.ts`
   - Estendere `AnalysisChart` con `version`, `layout`, `data`, `fields`, `stats`, `options`, `sampled`; `ChartKind` per scatter, line, bar, box, histogram, Q-Q, forest, survival, ACF, heatmap, mosaic, residual, scree, score, Bland-Altman, power, bootstrap, missingness.
   - Unione discriminata `ChartOptions`; niente registry di classi. Controlli dichiarati in una tabella dati.
   - `vega-lite.compile()` per ogni kind; nessun warning; layer/encoding attesi per le feature del pilota; nessun `undefined`/`NaN`.
   - Ogni etichetta visibile dello spec (titolo, sottotitolo, note, assi, legenda, tooltip) arriva da un contesto localizzato — `copy()` per il contenuto del report, `t()` per la chrome — mai da una costante italiana nel kit.
   - Rischio: feature specifiche complesse. Stima: L.
3. **Renderer, card e ordine output (vertical slice)** — file: `src/components/charts/VegaChart.tsx`, `ChartCard.tsx`, `src/components/AnalysisCharts.tsx`, `src/components/AnalysisOutput.tsx`, `src/hooks/useOutputConsole.tsx`
   - Caricamento dinamico di `vega-embed`; SVG; tooltip; `data-chart-state`; cleanup; fallback errore.
   - `AnalysisOutput` compone tabelle → report → grafici. Per i runner ancora legacy resta il `node`; per il pilota regressione si usa il nuovo percorso.
   - `ChartCard` con titolo, note, pulsante Edit, click/tastiera.
   - Test e2e minimo: run regressione, report prima del grafico, grafico visibile, Edit presente.
   - Rischio: race di rendering. Stima: L.
4. **Editor e persistenza v3 (pilota regressione completo)** — file: `src/components/charts/ChartEditorDialog.tsx`, `ChartGeneralToolbar.tsx`, `ChartSpecificPanel.tsx`, `ChartControls.tsx`, `src/ui/analysis/useChartEditor.ts`, `src/ui/OutputConsole.tsx`, `src/io/outputs.ts`, `src/io/project/*`, `src/analyses/regression/run.tsx`, `src/charts/kits/regression.ts`, `src/stats/kernels/regression.ts`
   - Shell a due colonne con header Done/Cancel/Reset; toolbar generale sticky; pannello destro specifico; `More style` come `<details>`/FieldSet; pannello collassato sotto il grafico sotto 1024px.
   - `ChartControls` unico renderer; `features.ts` unico registro con `prominent`; toolbar e pannello solo layout, senza stato/descrittori propri.
   - Preview live debounce ~120ms su copia di `ChartOptions`; dirty indicator; focus trap minimale; focus iniziale e ritorno al pulsante Edit; Escape con conferma se dirty.
   - `updateOutputChart(entryId, chartId, options)` aggiorna la card senza ricalcolare; persistenza `charts` e limiti di cui sopra.
   - Bande CI/PI e `seMean`/`sePred` per la regressione; equazione breve/estesa; R²; grafico residui.
   - Export asincrono con `awaitChartsReady`.
   - Test: modifica banda/equazione, Done, reload, cancel/reset, overflow, card legacy; layout desktop/mobile, testi lunghi, ordine gruppi, focus ed Escape.
   - Rischio: formule bande, persistenza e accessibilità. Stima: L.
5. **Migrazione Milestone A** — file: `src/analyses/descriptive/run.tsx`, `distfit/run.tsx`, `ttest/run.tsx`, `anova/run.tsx`, `factorial/run.tsx`, `ancova/run.tsx`, `repeatedanova/run.tsx`, `nonparamrm/run.tsx` (Friedman/Cochran), `correlation/run.tsx`, `logistic/run.tsx`, `multivariate/run.tsx`, `chisquare/run.tsx`, `agreement/run.tsx` (Bland), `survival/run.tsx`, `cox/run.tsx`, `timeseries/run.tsx`, `samplesize/run.tsx`; kit `src/charts/kits/*`
   - Rimuovere Victory da questi runner, produrre `AnalysisChart`; mantenere tabelle/report; aggiungere solo i dati derivati strettamente necessari (IC/medie, fit, loadings, bande).
   - Test unit per ogni builder + `vega-lite.compile`; e2e solo ANOVA e un export oltre al pilota.
   - Rischio: layout/etichette. Stima: L.
6. **Milestone B: nuovi grafici e dati kernel** — file: `src/analyses/mixedanova`, `tost`, `countreg`, `ordinal`, `lmm`, `gee`, `stratcox`, `tdcox`, `parametric`, `contingency`, `mi`, `resampling`, `agreement` (ICC/kappa), `nonparamrm` (McNemar/Jonckheere); `src/stats/kernels/*`
   - Esporre fitted/residui, probabilità, pattern missingness, distribuzioni bootstrap/permutazione, curve parametriche, ICC/kappa; test numerici prima del kit.
   - Kit e feature specifiche per ogni grafico; nessun runner nuovo senza test.
   - Rischio: dati derivati/kernel. Stima: XL.
7. **Chiusura Victory, legacy e worker** — file: `package.json`, `src/components/AnalysisCharts.tsx`, `src/stats/charts.ts`, `src/ui/analysis/analysisOutputNode.tsx`, `src/analyses/*/run.tsx`, `src/analyses/worker/*`
   - Eliminare `node`, il renderer Victory, `loadAnalysisOutput`, import `victory`; rimuovere anche `recharts` (`package.json:36`, zero import).
   - Aggiornare worker/protocol/client e test `structuredClone`; verificare che il worker non contenga Vega.
   - Build: verificare chunk e rimozione Victory; aggiornare guardrail.
   - Rischio: regressioni nei runner. Stima: M.
8. **Default nelle impostazioni (fase successiva)** — file: `src/charts/defaults.ts`, `src/io/project/types.ts`, `src/ui/SettingsTab.tsx`, `src/hooks/useProjectSession.ts`
   - `ChartDefaults` opzionale, sezione Settings “Charts”, merge `factory < user < per-run`, reset; nessuna applicazione retroattiva.
   - Test: persistenza, nuovi run, card esistenti invariate.
   - Rischio: aspettative utente. Stima: M.
9. **Documentazione, help, QA e performance** — file: `docs/CHART-ENGINE.md`, `src/help/content/<locale>/` (6 lingue) + `scripts/build-help.mjs`, `docs/PROJECT-STATUS.md`
   - Documentare feature generali/specifiche, guida “edit a chart”, catalogo standard e limiti di persistenza.
   - Aggiornare le schede del manuale nelle sei lingue (il libro è generato da `scripts/build-help.mjs`), i cataloghi i18n/reportCopy e i test delle chiavi; `npm run locales:check` resta verde. Misurare bundle, rendering, export e memoria.
   - Rischio: documentazione divergente. Stima: M.

**Totale: XL** (9 passi; Milestone A e B separati; 31 procedure coperte dal catalogo).

## Alternative considerate (e perché scartate)

- **Restare su Victory e aggiungere un pannello di stile**: Victory non produce un JSON di specifica; l'editor dovrebbe manipolare JSX e ogni feature richiederebbe componenti dedicati. Scartato.
- **Vega completo invece di Vega-Lite**: più potente, ma richiede grammatica a basso livello e aumenta il costo di ogni grafico; Vega-Lite copre i grafici statistici richiesti. Vega resta solo runtime.
- **`react-vega`**: wrapper comodo ma poco controllo su `View`, SVG e cleanup; `vega-embed` diretto è più prevedibile.
- **Plotly/ECharts/Chart.js**: JSON meno dichiarativo, editing e worker più difficili, export SVG meno uniforme.
- **Salvare solo un'immagine del grafico**: impedisce l'editing e la persistenza delle feature. Scartato.
- **Salvare la specifica Vega-Lite completa invece del modello**: l'editor dovrebbe fare patch strutturali sul JSON con feature non tipizzate; il modello semantico è più sicuro e più piccolo.
- **Canvas renderer**: export e report richiedono SVG; canvas complica HTML/Word. Scartato.
- **Un unico componente monolitico per tutti i grafici**: violerebbe il limite di 700 righe e renderebbe le feature specifiche ingestibili; si usano contratto + kit + componenti piccoli.
- **Migrare subito tutte le 31 procedure**: scartato; Milestone A protegge i grafici esistenti, Milestone B aggiunge i nuovi dopo i dati kernel.

## Riconciliazione del Concilio

| # | rilievo | chi | severità | decisione | motivo |
|---|---------|-----|----------|-----------|--------|
| 1 | Le bande CI/PI promesse dall'editor non hanno dati sufficienti nel modello | Luna | ALTA | accettato | Il modello conserva `xGrid`, `yhat`, `seMean`, `sePred`, `df`; il builder calcola la banda al livello scelto. Regressione multipla = osservati vs fitted + residui. |
| 2 | Gli export sono sincroni e possono partire prima del render Vega | Luna | ALTA | accettato | `awaitChartsReady(root, 5s)` prima di copy/PNG/HTML/Word; stato `loading/ready/error`, avviso su timeout. |
| 3 | Il catalogo richiede dati kernel non disponibili | Luna | ALTA | accettato | Milestone B esplicita con colonna “Dati oggi”; fitted/probabilità/pattern/bootstrap/curve vengono esposti e testati prima dei kit. |
| 4 | I limiti di persistenza non coprono i grafici | Luna | ALTA | accettato | Cap per modello e per output, overflow dichiarato (`chartStored:false`), tabelle/prosa sempre conservate, test dedicati. |
| 5 | Sfondo PNG/report non coerente con il tema | Luna | MEDIA | accettato | Background nel modello, export PNG e CSS report usano il tema effettivo; test chiaro/scuro. |
| 6 | Migrare tutte le 31 procedure è più ampio della richiesta | GLM | BLOCKER | accettato | Milestone A = grafici esistenti; Milestone B = nuovi grafici dopo i dati kernel. |
| 7 | `ChartModel` duplicherebbe `AnalysisChart` | GLM | BLOCKER | accettato | Si estende `AnalysisChart` in `src/stats/charts.ts`; `src/charts/` contiene solo feature/default/spec/kit. |
| 8 | Doppio percorso `node`/`OutputBlock` | GLM | BLOCKER | accettato | Un solo blocco in `AnalysisOutput`; fallback `node` solo per i runner non ancora migrati, rimosso al passo 7. |
| 9 | Registry `FeatureDescriptor` troppo astratto | GLM | ALTA | accettato | Unione discriminata `ChartOptions` + tabella dati di controlli; niente registry di classi. |
| 10 | Ordine dei passi troppo tardivo per la prima prova end-to-end | GLM | ALTA | accettato | Vertical slice passi 1-4: pilot regressione con default, editor, persistenza ed export prima delle famiglie. |
| 11 | Feature generali troppo numerose | GLM | ALTA | accettato | V1 a ~12 controlli; preset multipli, rotazione tick, formato numerico, angoli barre e alt text avanzato al passo 8. |
| 12 | Boxplot/errorbar/bande fatte a mano | GLM | MEDIA | accettato | Mark nativi Vega-Lite dove possibile; layer custom solo per forest/KM/bande precalcolate/mosaico. |
| 13 | `recharts` resta una dipendenza morta | GLM | MEDIA | accettato | Rimosso insieme a Victory (`package.json:36-37`, zero import in `src`). |
| 14 | E2E troppo numerosi per ogni famiglia | GLM | MEDIA | accettato | E2E limitati a regressione, ANOVA, un export e Cox worker; il resto è `vega-lite.compile` unit. |
| 15 | Documentazione troppo ampia | GLM | BASSA | accettato | `docs/CHART-ENGINE.md`, help e note di stato. |
| 16 | Milestone A omette `descriptive` e `distfit` | Luna/GLM | BLOCKER/MINOR | accettato | Aggiunti esplicitamente al passo 5, prima della rimozione di Victory. |
| 17 | Non è definito il comportamento oltre 12 grafici | Luna | ALTA | accettato | Cap a 24 con nota e “mostra tutti” in sessione; Q-Q descrittivi limitati a 8 variabili; overflow per caratteri. |
| 18 | I test non verificano numericamente CI/PI | Luna | ALTA | accettato | Test deterministico separato per CI e PI a 90/95/99, monotonia e PI > CI. |
| 19 | Un solo export e2e non copre PNG e report | Luna | ALTA | accettato | Test Playwright separati per PNG e report HTML dopo `awaitChartsReady`. |
| 20 | Togliere del tutto `MAX_CHARTS_PER_OUTPUT` | GLM | MINOR | rifiutato | Il cap a 24 è una protezione di interfaccia: evita 100 grafici Q-Q con 100 variabili. Ora ha comportamento e test espliciti, quindi non è ridondante. |
| 21 | Estrarre Milestone B in un documento separato | GLM | MINOR | rifiutato | La richiesta chiede il catalogo completo; resta nel piano come passo 6 tracciato, estraibile in follow-up senza cambiare il contenuto. |

**Esito**: 19 rilievi accettati, 2 rifiutati con motivazione; nessun BLOCKER aperto. Dopo il secondo giro e la verifica di chiusura, entrambi i critici hanno dato consenso al 100%.

## Verdetto dei critici

- **Luna**: APPROVE — «i 4 punti chiusi; consenso al 100%: sì». Prima del secondo giro: APPROVE_WITH_CHANGES per bande CI/PI, export asincrono, dati kernel e limiti di persistenza.
- **GLM**: APPROVE — «i tre BLOCKER e i tre rilievi ALTA sono risolti; consenso al 100%: sì». Restano solo rifiniture minori, tutte recepite o motivate nella tabella.

## Rischi e mitigazioni

- **Rendering asincrono**: `vega-embed` non è sincrono come Victory. Mitigazione: `data-chart-state` + `awaitChartsReady` prima di copy/report/PNG; fallback “chart non disponibile”.
- **Bundle**: Vega + Vega-Lite sono grandi. Mitigazione: import dinamico, manualChunks, misura in spike; il worker non importa Vega.
- **Persistenza**: i modelli con molti punti possono gonfiare `.lzs`. Mitigazione: downsample deterministico, cap per modello e per output, comportamento di overflow esplicito.
- **Feature creep**: l'editor può diventare una applicazione grafica. Mitigazione: catalogo chiuso di feature v1, preset, nessun JSON libero.
- **Correttezza**: un grafico può contraddire le tabelle. Mitigazione: i modelli derivano dagli stessi oggetti statistici delle tabelle; test di coerenza numerica.
- **Accessibilità**: popup e controlli. Mitigazione: focus trap, labels, tastiera, contrasto, test e2e.
- **Legacy**: le card Victory salvate restano statiche. Mitigazione: messaggio chiaro + re-run; migrazione v3 documentata.
- **Worker**: modelli non serializzabili per funzioni/NaN. Mitigazione: schema JSON, test `structuredClone`, sanitizzazione.
- **Export**: Vega SVG può includere stili non ereditati. Mitigazione: tema esplicito nel builder, background nel modello, test PNG/HTML.

## Test e verifica

- `npm run check` (lint, unit, dependency-cruiser, madge, file-size).
- `npm run test:samples` per i dataset e2e.
- `npm run test:e2e` desktop/mobile: regressione (default, edit, reload), ANOVA, un export, Cox worker.
- Nuovi test unitari:
  - `src/charts/schema.test.ts`
  - `src/charts/features.test.ts`
  - `src/charts/vega/buildSpec.test.ts`
  - `src/charts/kits/*.test.ts`
  - estensioni ai `src/analyses/*/run.test.ts`
  - `src/io/outputs.test.ts`, `src/io/project.test.ts`
- Test di regressione: stessi numeri delle tabelle; chart model contiene gli stessi punti/righe; overflow e card legacy.
- **Test numerico CI/PI**: dataset deterministico con x noti, controllo dei limiti della banda della media e della banda di predizione a 90/95/99; la PI deve essere più larga della CI e i limiti devono crescere con il livello. Test separato per la regressione semplice e per quella multipla (osservati vs fitted).
- **Test export**: Playwright verifica sia il PNG sia il report HTML dopo `awaitChartsReady`; il caso “grafico non ancora pronto” deve produrre un avviso, non un file vuoto.
- **Test overflow**: 24+ grafici, Q-Q oltre 8 variabili, modello oltre 120k, output oltre 600k; tabelle e prosa restano, il grafico omesso è dichiarato.
- **Test layout editor**: desktop 1440px e 1024px, mobile full-screen; toolbar superiore, pannello destro, collasso `<details>` sotto 1024px; testi lunghi, ordine gruppi con select/checkbox-list, empty state, `Reset this section`, focus trap, Escape dirty, ritorno focus.
- Test di performance: tempo di build di 100 specifiche, mount/smount di 20 grafici, export PNG.

## Criteri di accettazione

- [ ] Nessun import di `victory` nel codice; dipendenze `victory` e `recharts` rimosse.
- [ ] Nessun grafico esistente sparisce nella Milestone A.
- [ ] Ogni procedura del catalogo ha un grafico standard definito; Milestone B è tracciata come lavoro successivo.
- [ ] Il run produce chart di default dopo la prosa del report.
- [ ] Il popup ha toolbar superiore per le generali (preset, tema, griglie X/Y, palette, legenda, More style) e pannello destro per le specifiche del chart kind.
- [ ] Sopra 1024px il pannello destro è visibile; sotto 1024px collassa sotto il grafico senza perdere feature.
- [ ] Il pannello specifico contiene solo opzioni di visualizzazione, mai parametri statistici (orizzonte, post-hoc, numero imputazioni).
- [ ] Done aggiorna la card senza ricalcolare; Cancel non cambia nulla; Reset torna ai default.
- [ ] Reload e `.lzs` conservano le opzioni; le card legacy restano leggibili; overflow gestito.
- [ ] PNG/HTML/Word attendono i grafici e li includono; il report non perde tabelle o prosa.
- [ ] Titoli, sottotitoli, note, etichette e tooltip dei grafici sono localizzati (lingua del report per il contenuto, lingua UI per la chrome); nessuna stringa italiana hardcoded nei nuovi chart spec e `npm run locales:check` resta verde.
- [ ] `npm run check`, Playwright, build e guardrail verdi; worker senza Victory; chunk iniziale misurato.

## Domande aperte / condizioni per l'assenso

1. Le modifiche a un grafico devono essere ereditate da un nuovo run della stessa analisi? **Assunzione: no**, ogni run riparte dai default; l'ereditarietà sarà valutata nel passo 8.
2. Il report deve mostrare i grafici dopo la prosa o subito dopo le tabelle? **Assunzione: dopo la prosa**, come richiesto.
3. Le card salvate con Victory devono restare modificabili? **Assunzione: no**, restano statiche; l'utente rilancia l'analisi.
4. Il tema stampa chiaro è obbligatorio nella prima release? **Assunzione: sì come preset dell'editor**, non come default globale.
5. I grafici del Milestone B sono parte del piano ma non della prima release? **Assunzione: sì**, perché richiedono dati kernel aggiuntivi e non devono bloccare la sostituzione di Victory.

## Revisione 2026-10-29 — layout del viewport di editing

- **Richiesta**: toolbar superiore per le feature generali e fascia laterale destra per le scelte procedure-specific (checkbox, listbox, campi liberi), da inserire nel piano.
- **Verdetti**:
  - Luna: APPROVE — «BLOCKER 1/2 chiuso; BLOCKER 2/2 chiuso dopo la correzione della riga `timeseries`; consenso al 100%: sì».
  - GLM: APPROVE — «tutti i BLOCKER/MEDIA chiusi; consenso al 100%: sì». L'unica deviazione accettata è `window.confirm` su Escape dirty, coerente con `OutputConsole`.
- **Modifiche**:
  - aggiunta la sezione **5.1 Layout del viewport di editing**: shell/header, toolbar superiore sticky, pannello destro specifico, responsive, stato/dirty/focus, Done/Cancel/Reset;
  - aggiornato il passo 4 con `ChartGeneralToolbar.tsx`, `ChartSpecificPanel.tsx`, `ChartControls` come unico renderer e `features.ts` come unico registro;
  - rimosso l'orizzonte di previsione dalle feature editabili; è un parametro dell'analisi, non un'opzione del grafico;
  - aggiunti test layout desktop/mobile, testi lunghi, ordine gruppi, focus/Escape e criteri di accettazione.

| # | rilievo | chi | severità | decisione | motivo |
|---|---------|-----|----------|-----------|--------|
| 1 | Il layout richiesto non era ancora nel piano | Luna | BLOCKER | accettato | Inserita §5.1 e aggiornato il passo 4. |
| 2 | L'orizzonte di previsione era elencato come feature dell'editor | Luna | BLOCKER | accettato | Rimosso da §7 e dalla tabella `timeseries`; resta parametro dell'analisi. |
| 3 | `ChartGeneralToolbar`/`ChartSpecificPanel` duplicavano il renderer | GLM | MEDIA | accettato | Sono solo layout; `ChartControls` è l'unico renderer. |
| 4 | Il popover “More style” aggiungeva un meccanismo nuovo | GLM | MEDIA | accettato | Sostituito con `<details>`/`FieldSet`, pattern già presente. |
| 5 | Ambiguità su dove vivono le feature generali | GLM | MEDIA | accettato | Unico registro `features.ts` con flag `prominent` per i controlli inline. |
| 6 | Bottom sheet mobile aggiungeva stato/navigazione | GLM | MEDIA | accettato | Sotto 1024px il pannello collassa in `<details>` sotto il grafico. |
| 7 | Regola doppia nascosto/disabilitato | GLM | BASSA | accettato | Regola unica: feature non applicabili nascoste. |
| 8 | Hint “si applicano con Done” e paragrafo “Riuso futuro” superflui | GLM | BASSA | accettato | Rimossi; il riuso Settings resta nel passo 8. |
| 9 | `<select multiple>` per l'ordine gruppi | GLM | BASSA | accettato | Checkbox-list/select con pulsanti su/giù già presenti in `FormFields`. |
| 10 | Escape dirty con confirm invece del focus su Cancel | GLM | BASSA | rifiutato | `window.confirm` è già il pattern di `OutputConsole` e impedisce la perdita silenziosa delle modifiche. |

**Passi**: prima 9 → dopo 9 (nessun passo nuovo; passo 4 esteso con layout, componenti e test).
