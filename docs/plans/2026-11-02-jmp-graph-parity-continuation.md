# JMP Graph Parity — documento di prosecuzione

- **Data**: 2026-11-02
- **Repository**: `/home/vigliafg/Documenti/GitHub/lazstatjs-pro`
- **Piano madre**: `/home/vigliafg/.opencode/plan/2026-11-02-jmp-graph-parity.md`
- **Stato**: **Milestone A, B, C, D, E ed F completate e verdi**. Gate G0–G8 superati.
- **Scopo di questo documento**: permettere a una nuova sessione, dopo la
  compattazione del contesto, di riprendere esattamente da dove ci si è fermati
  senza perdere decisioni, invarianti o dettagli di implementazione.

## 1. Contesto in una riga

La gallery stile v1 esiste già (`src/charts/styles.ts`, `ChartStyleGallery.tsx`,
`ChartStyles.tsx`, `useChartStyleLibrary.ts`). La Milestone A aggiunge le due
famiglie esplicite **LazStats-like** e **JMP-like**, i primi tre oggetti JMP
(box Oneway, scatter regression, Q-Q), il filtro famiglia, il confronto
side-by-side e le relative opzioni/dati. Il default LazStats resta invariato.
La Milestone B completa gli L1 mancanti (interval, dot, residual, histogram,
box-outlier) e aggiunge sei oggetti L2 (diamond, circles, shadowgram, scatter
matrix, bubble, scatter 3D) emessi dalle procedure pertinenti. La Milestone C
introduce i pannelli compositi L3 (`PanelChart`), li rende persistenti ed
esportabili e li emette come report aggiuntivi di descriptive, ANOVA,
regressione, PCA e serie temporali.

## 2. Milestone A — cosa è già fatto

### A.1 Metadati e disponibilità

File: `src/charts/styles.ts`, `src/charts/styles.test.ts`.

- Tipi nuovi: `ChartStyleOrigin = 'lazstat' | 'jmp'`,
  `ChartCapability = 'meanY' | 'meanCI' | 'percentile' | 'band' | 'group'`,
  `ChartStyleContext = { chart?, analysisId? }`.
- `ChartStyle` ha ora `origin`, `descriptionKey`, `analyses`, `requires`.
- Il factory interno `style()` assegna `origin: 'lazstat'` a tutti i built-in,
  salvo override esplicito.
- `qq.probability` è `origin:'jmp'`, `descriptionKey:'chart.style.jmpQqHint'`,
  resta **default**. `qq.classic` è `origin:'lazstat'`.
- `styleAvailable(style, context)`:
  - filtra `analyses` solo se `analysisId` è presente;
  - senza `chart` è ottimistica (pre-run);
  - `meanY`: `stats.meanY` finito;
  - `meanCI`: almeno una riga `summary` con `meanLo` e `meanHi` finiti;
  - `percentile`: almeno una riga `summary` con `p10` e `p90` finiti;
  - `band`: `data.grid` con almeno un `seMean`/`sePred` finito, oppure
    `data.band` non vuoto;
  - `group`: almeno un punto con `group`.
- `stylesByOrigin(kind, origin, user)` per il filtro UI.
- `stylesFor`, `resolvedStyle`, `matchingChartStyle` **non hanno cambiato
  firma**.
- `patchesFor` in `src/hooks/useChartStyleLibrary.ts`: se lo stile risolto non è
  disponibile per `analysisId`, usa `defaultChartStyle(kind)` (non salta la
  patch in silenzio).

Test aggiunti in `styles.test.ts`:

- ogni kind con gallery ha almeno un tile LazStats;
- `qq.probability` è l'unico default JMP-like;
- `styleAvailable` per ogni capability, pre-run ottimistico, `analyses`;
- gli stili utente restano fuori dalle famiglie built-in.

### A.2 i18n

File: `src/i18n/catalog/{en,it,fr,es,de,pt-PT}/analysis.ts`.

Chiavi aggiunte (tutte e sei le lingue):

- `chart.style.origin.lazstat|jmp|user`
- `chart.style.filterAll|filterLazstat|filterJmp|filterUser`
- `chart.style.compare`, `chart.style.compareTitle`
- `chart.style.jmpOneway`, `chart.style.jmpRegression`
- `chart.style.jmpOnewayHint`, `chart.style.jmpRegressionHint`,
  `chart.style.jmpQqHint`
- `chart.style.more`
- `chart.feature.whiskerRule`
- `chart.whisker.tukey`, `chart.whisker.percentile`
- `chart.feature.meanInterval`, `chart.feature.jitter`
- `chart.feature.meanLine` esisteva già ed è riusata per la linea media dello
  scatter.

Verifica: `node --import tsx scripts/check-locale.mjs <locale>` per
`en it fr es de pt-PT` → tutte complete (1299/1299 chiavi UI, 2006/2006 frasi
report, 41 pagine help). Nota: `npm run locales:check` senza argomento stampa
solo l'usage ed esce 1; passare la locale.

### A.3 Box JMP-like

File:

- `src/stats/charts.ts` — `BoxOptions` ha `whisker: 'tukey' | 'percentile'`,
  `showMeanInterval: boolean`, `jitter: boolean`.
- `src/charts/defaults.ts` — default `tukey`, `false`, `false`.
- `src/charts/features.ts` — controlli editor:
  - select `whisker` (sezione Summary, solo display `box`);
  - checkbox `jitter` (sezione Data, solo display `box`);
  - checkbox `showMeanInterval` (sezione Summary, solo display `box` e almeno
    una riga summary con `meanLo/meanHi` finiti).
- `src/charts/kits/common.ts`:
  - `BoxStats` ha `p10`/`p90` (calcolati con `percentile` da
    `src/stats/kernels/distributions.ts`);
  - `boxRows(groups, { level = 95 })` aggiunge `p10`, `p90` e, se `n >= 2` e
    finiti, `meanLo`/`meanHi`. Per singleton/gruppi non calcolabili i campi
    **non vengono scritti** (mai `NaN`, altrimenti `finiteRows` scarta la riga).
- `src/charts/vega/boxLayers.ts`:
  - baffi `p10/p90` se `whisker === 'percentile'`, altrimenti `min/max`;
  - IC media: rule verticale `meanLo → meanHi` + due tick/cappucci, solo se
    entrambi finiti;
  - jitter: `((index % 101) - 50) * 0.004`, campo `jitter`, `xOffset`
    quantitativo con dominio `[-0.2, 0.2]`, solo per i punti del box;
  - gli outlier Tukey restano invariati.
- Livello CI passato ai call site:
  - `src/analyses/anova/run.tsx` (`ciLevel`),
  - `src/analyses/ttest/run.tsx` (tutti i box, incluso rank/differenze),
  - `src/analyses/descriptive/run.tsx` (`input.level`).
- `src/analyses/regression/run.tsx`: il box dei residui ora usa `boxRows`
  (una sola fonte di verità; i campi nuovi non si perdono).
- Stile `box.jmp-oneway` in `styles.ts`:
  `display:'box', whisker:'percentile', showPoints:true, jitter:true,
  showMean:true, showMeanInterval:true, showOutliers:true`,
  `origin:'jmp'`, `descriptionKey:'chart.style.jmpOnewayHint'`,
  `requires:['percentile','meanCI']`.

Test: `common.test.ts` (percentili, IC media, singleton, gruppo costante,
outlier Tukey), `boxLayers.test.ts` (baffi percentile, IC media, jitter
deterministico ciclo 101, default invariato).

### A.4 Scatter JMP-like

File:

- `src/stats/charts.ts` — `ScatterOptions.showMeanLine` (default `false`).
- `src/charts/defaults.ts` — factory `showMeanLine: false`.
- `src/charts/features.ts` — checkbox `showMeanLine`, visibile solo se
  `chart.stats.meanY` è finito.
- `src/charts/vega/layers.ts` — se `showMeanLine` e `stats.meanY` finito,
  aggiunge una rule orizzontale alla media riusando il blocco `rules` esistente.
- `src/analyses/regression/run.tsx`:
  - `reg-scatter` espone `stats.meanY`;
  - rimosso l'override `band:'none'` da `reg-scatter` (il factory resta
    `none`, ma lo stile può impostare `band:'ci'`);
  - `reg-observed-fitted` espone `stats.meanY` ma **non** ha `grid`: la banda
    per `k >= 2` resta fuori v1.
- Stile `scatter.jmp-regression`:
  `fit:'ols', band:'ci', showBand:true, bandLevel:95, showMeanLine:true,
  equation:'short', ellipse:false`, `origin:'jmp'`,
  `analyses:['regression']`, `requires:['meanY','band']`.
  Non usa `lineDash` (il fit OLS ha già il suo tratteggio).

Test: `layers.test.ts` (mean line opzionale, assenza senza `meanY`, banda CI da
grid), `regression/run.test.ts` (`meanY`, `band` factory `none`, style apply
`ci`, observed-fitted senza banda), `buildSpec.test.ts` (fixture dedicata
`jmp-regression` con grid e mean line, compile senza warning).

### A.5 Q-Q

- `qq.probability` resta id e default; ha `origin:'jmp'` e descrizione.
- `qq.classic` resta `origin:'lazstat'`.
- Nessun nuovo id, nessun cambio di default.

### A.6 Gallery UI e selettore pre-run

File:

- `src/components/charts/ChartStyleGallery.tsx`
- `src/components/charts/ChartEditorDialog.tsx`
- `src/ui/analysis/ChartStyles.tsx`
- `src/hooks/useOutputConsole.tsx`
- `e2e/chart-styles.spec.ts`

Comportamenti implementati:

- tile filtrate con `styleAvailable(style, { chart })`: una variante non
  disponibile è **nascosta**, non disabilitata;
- badge testuali `LazStats`, `JMP-like`, `Personale` su ogni tile
  (`data-chart-style-origin`, `data-chart-style-origin-badge`);
- badge `Default` come prima;
- descrizione visibile e `title` con `descriptionKey`
  (`data-chart-style-description`);
- filtro famiglia `Tutti · LazStats · JMP-like · Personali`
  (`data-chart-style-filters`, `data-chart-style-filter`), mostrato solo se il
  kind ha più di una famiglia;
- match attivo filtrato con `styleAvailable` (uno stile non disponibile non
  risulta selezionato);
- cap 8 built-in visibili + pulsante “Altri” (`data-chart-style-more`);
- anteprime live limitate alle prime 6 tile; le altre mostrano un placeholder
  leggero (`data-chart-style-placeholder`) ma restano cliccabili;
- azione `⇄ Confronta` (`data-chart-style-compare`): inserisce due copie,
  `titolo · LazStats` e `titolo · JMP-like`, senza rerun; visibile solo se
  esistono entrambe le famiglie disponibili e `onInsert`;
- `ChartEditorDialog` implementa `insertCompare`; `onInsert` resta invariato;
- `useOutputConsole.insertOutputChart` deduplica per `kind + title + opzioni`
  (JSON), così un secondo click su “Confronta” non duplica le card e il cap
  `MAX_CHARTS_PER_OUTPUT = 24` resta rispettato da `appendChartCopy`;
- selettore pre-run (`ChartStyles.tsx`): lista filtrata per `analyses`
  (`styleAvailable` con `analysisId`), un override sconosciuto/non disponibile
  mostra “Follow global”, il valore effettivo ricade sul default globale o sul
  default del kind.

E2E `e2e/chart-styles.spec.ts` (desktop, 4 test verdi):

1. Q-Q: default probability, badge JMP/LazStats, descrizione, filtro, insert
   copy, riapertura.
2. ANOVA box: quattro display + `jmp-oneway`, badge, descrizione, filtro
   JMP/LazStats, selezione.
3. Regressione: `jmp-regression` visibile, `Confronta` inserisce 3 chart
   (originale + LazStats + JMP-like), secondo click non duplica.
4. Libreria utente: salvataggio stile, Settings, override pre-run, rerun.

### A.7 Verifiche eseguite (tutte verdi)

```bash
npm run lint                 # tsc --noEmit
npm test                     # 756 test, 42 suite, 0 fail
npm run guard                # depcruise, madge, file-size (671 file < 700, 2 eccezioni)
npm run check                # lint + test + guard
npx playwright test e2e/chart-styles.spec.ts --project=desktop   # 4 passed
node --import tsx scripts/check-locale.mjs {en,it,fr,es,de,pt-PT}
```

## 2-bis. Milestone B — cosa è già fatto

### B.1 `interval.jmp-mean-diamond`

- `IntervalOptions.showMeanDiamond: boolean` (factory `false`).
- Editor: checkbox `chart.feature.meanDiamond`.
- `intervalLayers`: con l'opzione attiva il punto della stima diventa un
  **diamante** pieno, con la stessa regola verticale `lo → hi` e i due
  cappucci già presenti.
- Stile `interval.jmp-mean-diamond` (`origin:'jmp'`, descrizione
  `chart.style.jmpMeanDiamondHint`, `showMeanDiamond:true`).

### B.2 `dot.jmp-strip`

- `DotOptions.jitter: 'none' | 'strip' | 'wide'` (factory `'strip'`, quindi il
  default storico resta jitterato).
- Editor: select `chart.feature.jitter` con scelte `chart.jitter.*`.
- `dotLayers`: `none` rimuove `xOffset`; `strip` mantiene il ciclo 9;
  `wide` usa il ciclo 101 (`((i % 101) - 50) * 0.006`, dominio ±0.35).
- Stile `dot.jmp-strip` (`jitter:'wide'`, `showMean:false`).

### B.3 `residual.jmp-residual`

- `ResidualOptions.showStdBand: boolean` (factory `false`).
- Editor: checkbox `chart.feature.residBand`, visibile solo se
  `stats.residSd` è finito.
- `scatterOnly`: con l'opzione attiva aggiunge due regole a `±2·residSd`
  oltre alla linea dello zero.
- `src/analyses/regression/run.tsx`: il chart `reg-residual-fitted` espone
  `stats.residSd` e `stats.n`.
- Stile `residual.jmp-residual` con `requires:['residSd']`.
- Nota: normal-quantile e sequence restano grafici separati (Q-Q residui e
  diagnostica già presente); non sono sovrapponibili allo stesso asse del
  residuo-vs-stimato e non vengono finti come overlay.

### B.4 `histogram.jmp-basic`

- Stile `histogram.jmp-basic`: istogramma + rug + linea della media
  (`showDensity:false`, `showKde:false`, `showRug:true`, `showMeanLine:true`).
- Non è un pannello Distribution e non aggiunge curve normali non richieste.

### B.5 `box.jmp-outlier`

- Stile `box.jmp-outlier`: baffi Tukey 1,5 IQR, outlier visibili, media con
  IC (`showMean:true`, `showMeanInterval:true`), `requires:['meanCI']`.
- Distinto da `jmp-oneway` (baffi 10–90, punti jittered).

### B.6–B.10 Oggetti L2

Nuovi `kind` in `CHART_KINDS`:

| Kind | Oggetto | Renderer | Emissione |
|---|---|---|---|
| `diamond` | diamante media/IC | `objectLayers.diamondLayers` | descriptive, ttest, anova |
| `circles` | cerchi di confronto | `circleLayers` | anova |
| `shadowgram` | densità ombreggiata | `shadowgramLayers` | descriptive |
| `scattermatrix` | matrice di dispersione con ellissi | `scatterMatrixLayers` | descriptive (≥3 variabili) |
| `bubble` | X, Y, size | `bubbleLayers` | descriptive (≥3 variabili) |
| `scatter3d` | proiezione 3D + ellisse | `scatter3dLayers` | descriptive (≥3 variabili) |

Dettagli:

- `diamond` ha `scaleToCI` (dimensione = ampiezza IC) e `showLabels`; il
  renderer usa `size` encoding quando attivo.
- `circles` ha `showIntervals` e `showLabels`; il cerchio è dimensionato
  sull'ampiezza dell'IC, la regola orizzontale è opzionale.
- `shadowgram` calcola la KDE con `kernelDensity` e disegna un'area con rug
  opzionale e linea media opzionale.
- `scattermatrix`: il runner prepara coordinate normalizzate per pannello
  (`px/py`, punti, ellissi, etichette diagonali) e `stats.dim`; il renderer
  disegna cornici, punti, ellissi e nomi delle variabili. Solo ≥3 variabili,
  massimo 4, campionamento deterministico.
- `bubble`: size encoding con legenda opzionale.
- `scatter3d`: proiezione isometrica deterministica normalizzata, size segue
  z; l'ellisse è la densità **proiettata** (2D), dichiarata come tale.
- Questi oggetti non hanno tile nella gallery stile: sono nuovi `kind`
  emessi dai runner, non varianti L1. La gallery resta solo L1.

### B.7 Verifiche eseguite

```bash
npm run lint                 # tsc --noEmit
npm test                     # 767 test, 42 suite, 0 fail
npm run guard                # depcruise, madge, file-size (672 file < 700, 2 eccezioni)
npm run check                # lint + test + guard
npx playwright test e2e/chart-styles.spec.ts e2e/analysis.spec.ts --project=desktop
npx playwright test e2e/chart-editor.spec.ts --project=desktop
node --import tsx scripts/check-locale.mjs {en,it,fr,es,de,pt-PT}
```

Risultati: 32 e2e passati (1 skipped) per analysis/chart-styles, 8 passati
(3 skipped) per chart-editor, locale tutte complete.

Nuovi test principali:

- `src/charts/vega/objectLayers.test.ts` — tutti gli L2.
- `src/analyses/descriptive/run.test.ts` — emissione L2 con 3 variabili e
  assenza con 2.
- `src/charts/vega/layers.test.ts` — diamante interval, jitter dot,
  banda residui.
- `src/charts/styles.test.ts` — opzioni degli stili B e capability
  `residSd`.
- `src/charts/schema.test.ts` — round-trip delle nuove opzioni/kind.

## 2-ter. Milestone C — cosa è già fatto

### C.1 Contratto `PanelChart`

File: `src/stats/charts.ts`, `src/charts/schema.ts`.

```ts
interface PanelChart {
  version: 1;
  id: string;
  kind: 'panel';
  title: string;
  subtitle?: string;
  note?: string;                 // prosa breve sotto il pannello
  layout: 'grid' | 'stack';
  children: AnalysisChart[];     // profondità 1
  tables?: TableSpec[];          // tabelle compatte del report
}
```

- `MAX_PANEL_CHILDREN = 8`; un pannello vuoto non viene creato.
- `ReportChart = AnalysisChart | PanelChart` è disponibile come tipo, ma i
  pannelli **non** vivono nell'array `charts`: hanno un array `panels`
  separato. Questa scelta evita di toccare i runner e i test esistenti e
  mantiene il cap/da budget separato.
- `parsePanelModel` valida e sanifica figli e tabelle; `parsePanelModels` li
  legge da worker, autosave e `.lzs`.
- Un pannello dentro un pannello è rifiutato: `children` passa da
  `parseChartModel`, che non conosce il kind `panel`.
- `fitPanelBudget` applica le stesse regole di `fitChartBudget`.
- I pannelli non hanno `options`, non entrano in `CHART_KINDS`, non hanno tile
  nella gallery stile e non possono essere creati dall'editor come stile.

### C.2 Renderer, persistenza, export

File: `src/components/charts/PanelCard.tsx`,
`src/components/AnalysisCharts.tsx`, `src/components/AnalysisOutput.tsx`,
`src/ui/output/RunReportCard.tsx`, `src/hooks/useOutputConsole.tsx`,
`src/io/outputs.ts`, `src/io/project/index.ts`, `src/io/chartExport.ts`.

- `PanelCard` mostra titolo, sottotitolo, tabelle, figli come `ChartCard`
  editabili e una nota finale. `layout:'grid'` usa due colonne da `xl`,
  `layout:'stack'` una colonna.
- I figli mantengono editor, annotazioni e superficie SVG. Il loro
  `data-chart-id` è prefissato con l'id del pannello
  (`panel-oneway:anova-box`), così i selettori DOM e gli e2e restano univoci
  anche quando lo stesso modello è anche un grafico autonomo.
- `panels` viaggia in `AnalysisRunResult`, nel protocollo del worker,
  `StoredOutput`, `SessionOutputBody` e nello snapshot `.lzs`.
- HTML/Word includono il pannello perché l'export fotografa il DOM live.
- L'export PNG esporta ogni grafico **una sola volta**: le copie dentro un
  pannello vengono saltate quando lo stesso chart id è già presente come
  superficie autonoma. I grafici che esistono solo dentro un pannello vengono
  comunque esportati.
- `awaitChartsReady` usa 10 s invece di 5 s: un run con pannelli renderizza più
  viste Vega (grafico autonomo + copia nel pannello).

### C.3 Builder dei pannelli

File: `src/charts/panels.ts`, `src/charts/panels.test.ts`.

| Builder | Figli tipici | Emissione |
|---|---|---|
| `distributionPanel` | istogramma, box, Q-Q, shadowgram | descriptive |
| `onewayPanel` | diamond, circles, box, post-hoc forest | ANOVA |
| `fitModelPanel` | observed-fitted/scatter, residui, scale-location, leverage, Q-Q | regressione |
| `regressionDiagnosticPanel` | residui, scale-location, leverage, Cook, Q-Q | regressione |
| `pcaPanel` | scree, score, loadings, biplot | PCA |
| `timeSeriesPanel` | serie/previsione, ACF, PACF, decomposizione | serie temporali |
| `qualityPanel` | control/capability/Pareto/variability | **non emesso**: mancano i grafici L4 |

- I builder selezionano oggetti già calcolati, deduplicano per id, applicano il
  cap e restituiscono `null` se non resta alcun figlio.
- Ogni pannello degrada con grazia: se un grafico manca, il pannello mostra gli
  altri; non inventa dati.
- Le tabelle sono incluse per id quando presenti (`desc-location`,
  `anova-table`, `reg-diagnostics`, `pca-eigen`, `ts-summary`, ...).
- `qualityPanel` è pronto e testato, ma nessuna procedura produce ancora
  control chart/capability/Pareto/variability: l'emissione appartiene alla
  Milestone D, non si finge un pannello qualità con grafici diversi.
- I pannelli ereditano il gruppo output del report che compongono:
  `panel-distribution`, `panel-oneway`, `panel-fit-model`, `panel-pca`,
  `panel-timeseries` sono `recommended`;
  `panel-regression-diagnostics` è `diagnostic`. `filterPanelsByGroups` li
  nasconde insieme ai grafici corrispondenti.

### C.4 Test aggiunti

- `src/charts/panels.test.ts`: deduplica, cap, degrado, selezione per ogni
  builder, `qualityPanel`.
- `src/charts/schema.test.ts`: parse/round-trip, profondità 1, tabelle, cap,
  budget.
- `src/io/outputsCharts.test.ts`: pannelli in `StoredOutput`, budget e `.lzs`.
- `src/charts/outputs.test.ts`: filtro per gruppo dei pannelli.
- `src/charts/copy.test.ts`: le stringhe dei pannelli entrano nel catalogo
  inglese.
- Test dei runner: descriptive, ANOVA, regressione, PCA, serie temporali.
- `e2e/analysis.spec.ts`: il pannello Oneway compare, i figli sono pronti e il
  pannello torna dopo reload.

### C.5 Verifiche eseguite (tutte verdi)

```bash
npm run lint                 # tsc --noEmit
npm test                     # 780 test, 42 suite, 0 fail
npm run guard                # depcruise, madge, file-size (674 file < 700, 2 eccezioni)
npm run check                # lint + test + guard
npx playwright test e2e/analysis.spec.ts e2e/chart-styles.spec.ts --project=desktop
# 33 passed, 1 skipped
npx playwright test e2e/chart-editor.spec.ts --project=desktop
# 8 passed, 3 skipped
for l in en it fr es de pt-PT; do node --import tsx scripts/check-locale.mjs "$l"; done
```

## 2-quater. Milestone D — cosa è già fatto

### D.1 Partition

- Kernel `src/stats/kernels/partition.ts`: CART di regressione con split per
  riduzione SSE (prefix sums), `maxDepth` 1–6, `minSplit` 2–50, report delle
  foglie, importanza per variabile, predizioni e metriche R²/RMSE/MAE.
- Analisi `partition`: `PartitionParams { response, predictors, maxDepth,
  minSplit }`, form, default, registry (`regression`), tabelle
  `partition-summary`, `partition-splits`, `partition-leaves`,
  `partition-importance`, report di lettura.
- Nuovo `kind: 'tree'` con layout binario normalizzato calcolato nel runner;
  grafici `partition-tree`, `partition-observed`, `partition-importance`.

### D.2 PCA/EFA, serie temporali, corrispondenze, logistico

- Erano già presenti e non sono stati duplicati: PCA/EFA (scree, score,
  loadings, biplot, analisi parallela), serie temporali (ACF/PACF,
  decomposizione, rolling, ARIMA), corrispondenze (dentro contingency),
  ROC/confusione del logistico, profili di repeated/mixed.
- Aggiunta al logistico la **curva di lift cumulata** (`logistic-lift`) per
  coprire lift/cumulativa senza toccare ROC e calibrazione.

### D.3 Quality (SPC)

- Kernel `src/stats/kernels/quality.ts`: XBar-R, individui, EWMA (λ = 0,2),
  capacità Cp/Cpk/CPU/CPL e quota fuori specifica, Pareto ordinato.
- Analisi `quality`: modalità `control | capability | pareto | variability`,
  form, default, registry (`descriptive`), tabelle e tre report di lettura.
- Grafici: `control-chart` (`line` con limiti), `capab-histogram`
  (`histogram` con regole verticali LSL/USL/target/media), `pareto-chart`
  (`kind: 'pareto'`), `variab-box` (`box`).
- `qualityPanel` viene ora emesso e prova il gate C: pannello e grafici
  autonomi convivono.

### D.4 Cluster

- Kernel `src/stats/kernels/cluster.ts`: distanze euclidee, legami
  average/complete/single/Ward, sequenza di fusione, taglio in k cluster,
  medie e profili standardizzati, layout dendrogramma.
- Analisi `cluster`: form, default, registry (`multivariate`), tabelle
  `cluster-means`, `cluster-merges`, `cluster-membership`, report.
- Nuovo `kind: 'dendrogram'`; grafici `cluster-dendrogram`,
  `cluster-profile`, `cluster-sizes`. Campionamento deterministico a 120 righe.

### D.5 Discriminant / MANOVA e DOE

- Kernel `src/stats/kernels/discriminant.ts`: LDA con covarianza pooled,
  coefficienti, costanti, accuratezza, matrice di confusione, funzioni
  canoniche (whitening della covarianza within), Wilks/Pillai, test univariati.
  Copre anche il profile plot MANOVA con `discriminant-profile`.
- Kernel `src/stats/kernels/doe.ts`: OLS lineare/quadratico, termini con SE/t/p,
  R²/R² corretto/RMSE/F, griglia 13×13, mesh proiettata, curve di livello
  (marching squares), punto stazionario e classificazione con l'Hessiano.
- Nuovo `kind: 'surface'` con `display: 'mesh' | 'contour'`.
- Analisi `discriminant` e `doe` complete di form, default, registry, tabelle,
  report e test.

### D.6 Tipi condivisi e vincoli architetturali

- `src/stats/analysisResults.ts` contiene i tipi dei risultati L4: i report
  importano da lì, non dai kernel (regola `reports-senza-ricalcolo`).
- `src/analyses/rolesL4.ts` contiene i ruoli colonna L4, mergiati in
  `roles.ts` per non superare il limite di 700 righe.
- `features.ts` è a 701 righe con eccezione esplicita nel guardrail; il pannello
  `surface` non ha controlli specifici (la modalità è scelta dal runner).
- Nuovi `kind` (`tree`, `pareto`, `dendrogram`, `surface`) restano fuori dalla
  gallery stile: sono L4, non varianti L1.
- Help: pagine condivise in `src/help/content/l4.ts`, incluse in tutte le sei
  lingue; in Milestone F ogni lingua ha la propria copia
  `l4-{fr,es,de,pt-PT}.ts`, quindi non resta alcun fallback inglese per le copy
  o le pagine L4.

### D.7 Verifiche eseguite

```bash
npm run lint                 # tsc --noEmit
npm test                     # 802 test, 42 suite, 0 fail
npm run guard                # depcruise, madge, file-size (711 file, 3 eccezioni)
npm run check                # lint + test + guard
npx playwright test e2e/analysis.spec.ts e2e/chart-styles.spec.ts --project=desktop
# 33 passed, 1 skipped
for l in en it fr es de pt-PT; do node --import tsx scripts/check-locale.mjs "$l"; done
```

Test aggiunti:

- `src/stats/kernels/partition.test.ts`, `quality.test.ts`,
  `cluster.test.ts`, `discriminant.test.ts`, `doe.test.ts`.
- `src/analyses/l4.test.ts`: i cinque runner, compile Vega-Lite e
  `panel-quality`.
- `src/io/project/l4Params.test.ts`: parse, clamp e fallback dei parametri L4.
- `src/charts/copy.test.ts`: copy inglese dei nuovi grafici.
- `src/help/content.test.ts`: pagine L4 in tutte le lingue.

## 2-quinquies. Milestone E — cosa è già fatto

### E.1 Row state condiviso

File: `src/charts/interaction.ts`, `src/components/charts/ChartLinkContext.tsx`.

- Campo riservato `__row`: la chiave è l'indice della riga del dataset usato dal
  run (griglia filtrata/mascherata). Tutti i grafici di uno stesso run-report
  usano quindi lo stesso spazio di chiavi.
- Tipi `LinkSelection` (`sourceId`, `kind: 'brush' | 'lasso' | 'point'`, `keys`)
  e `ChartLink` (`keys`, `hidden`).
- `rowKeyOf`, `chartHasRowKeys`, `chartRowKeys`, `interactionPoints`
  (layer `points`, `markers`, `series`, `summary`, `values`; x da
  `row.x ?? row.category`, y da `row.y ?? row.value`).
- `chartLinkable`: solo i grafici che disegnano osservazioni come simboli;
  rispetta `showPoints` di scatter/residui/box/scatter3d e `showMarkers` della
  linea. Istogrammi, shadowgram e linee senza marker non offrono il lazo.
- `applyChartLink`: aggiunge ai soli layer a simboli un transform
  `__linkOpacity` e un'encoding `opacity` con `scale: null`. Selezionati = 1,
  non selezionati = 0,14, nascosti dal Data Filter = 0,04. Linee, bande, regole
  e summary restano intatte.
- `normalizeKeys` deduplica e limita a 20 000 chiavi; `linkSignature` evita
  ricompilazioni inutili.
- `ChartLinkProvider`/`useChartLinkState` tengono `selection`, `hidden`,
  `linkMode` e `tool` (`brush`/`lasso`). Lo stato è di sessione: non viene
  persistito e non entra in `.lzs`.

Chiavi `__row` emesse da:

- **Descriptive**: box, dot, istogramma, shadowgram, ECDF, Q-Q, scatter a
  coppie, bubble, scatter 3D.
- **Regressione**: scatter, osservati-vs-stimati, residui-vs-stimati,
  scale-location, leverage, Cook, residui parziali, box dei residui e Q-Q dei
  residui.
- **ANOVA**: box e box dei ranghi Kruskal-Wallis. I box senza punti (per
  esempio il box dei residui di regressione) restano senza linking e il chip
  dice “No row IDs”.

### E.2 Brushing e dynamic linking

File: `src/components/charts/ChartInteractionLayer.tsx`,
`src/components/charts/VegaChart.tsx`, `src/components/charts/ChartCard.tsx`,
`src/ui/OutputConsole.tsx`, `src/ui/output/SessionReportToolbar.tsx`.

- Overlay trasparente sull'area del grafico misurata da `measurePlotArea`.
- I punti sono proiettati dal **scenegraph** Vega (`item.x/item.y` dei simboli),
  non dai nomi degli scale: funziona anche quando Vega-Lite rinomina gli scale
  per layer (Q-Q con due assi x indipendenti, Pareto con due assi y).
- Il pennello seleziona per rettangolo; il lazo per poligono
  (`keysInRect`/`keysInPolygon`). Un click senza trascinamento annulla.
- L'overlay esiste solo con la modalità linking attiva: tooltip, annotazioni e
  editor del grafico continuano a funzionare.
- Toolbar della sessione: toggle `Link`, selettore `brush`/`lasso`, conteggio
  `N selected`, pulsante di annullamento e conteggio `N hidden` del Data Filter.
- Ogni card mostra `Link` o `No row IDs`; i pannelli L3 usano lo stesso
  provider, quindi i figli si attenuano come i grafici autonomi (verificato in
  e2e su `panel-fit-model:reg-scatter`).

### E.3 Lasso

Stesso overlay, modalità `lasso`: poligono disegnato con il puntatore,
point-in-polygon in pixel CSS, selezione deduplicata. Il poligono resta visibile
fino alla selezione successiva o a doppio click/Escape.

### E.4 Data Filter con animazione

File: `src/ui/output/DataFilterDialog.tsx`.

- Colonna categorica: elenco di valori con conteggio, inclusione/esclusione.
- Colonna numerica/intera: soglia `≤ valore` con slider.
- `Animate` parte dal valore minimo e percorre i valori ordinati; il pannello
  usa `motion` per l'ingresso e le barre. `Stop` interrompe.
- Le righe escluse diventano chiavi `hidden` nello stesso row state del
  linking; i grafici linkabili le attenuano a 0,04.
- Il filtro usa `linkGrid` (la griglia realmente usata dai run, con filtro
  righe e missing applicati), così gli indici coincidono con `__row`.
- Cambio dataset: selezione e nascosti vengono azzerati.

### E.5 Prediction Profiler interattivo

File: `src/charts/profiler.ts`,
`src/components/charts/PredictionProfiler.tsx`, `src/analyses/doe/run.tsx`.

- Il runner DOE scrive nel grafico `surface` i coefficienti
  (`coefIntercept`, `coefA`, `coefB`, `coefAA`, `coefAB`, `coefBB`), il modello
  e i range dei fattori e della risposta.
- `surfaceModelOf` valida il modello; `predictSurface` valuta il polinomio con
  clamp al range osservato; `predictionPosition` e `surfaceSlice` alimentano la
  barra e i due profili.
- Sotto il grafico `surface` compaiono due slider, la previsione, una barra
  rispetto al range fitted e due sparkline A/B. `Reset` torna al centro.
- Nessun rerun, nessuna modifica ai dati o alla stima; il pannello è
  `data-no-export`.

### E.6 Graph Builder limitato ai kind esistenti

File: `src/charts/builder.ts`,
`src/components/charts/GraphBuilderDialog.tsx`, `src/hooks/useOutputConsole.tsx`.

- Kind disponibili: `scatter`, `line`, `bar` (media per categoria), `box`,
  `histogram`. Nessun nuovo renderer.
- Assegnazione X/Y/Gruppo con drag-and-drop oppure click colonna + click slot.
- Anteprima live con lo stesso `VegaChart`; `Add to report` crea una card
  normale tramite `pushBuiltChart` (nessun `analysisId`, niente Re-run).
- Scatter e line mantengono `__row`, quindi il grafico costruito partecipa al
  linking; la linea attiva i marker per avere simboli da selezionare.
- Funziona anche con la console vuota: la card è il primo run-report.

### E.7 Verifiche eseguite (tutte verdi)

```bash
npm run lint                 # tsc --noEmit
npm test                     # 829 test, 42 suite, 0 fail
npm run guard                # depcruise, madge, file-size (719 file, 3 eccezioni)
npm run check                # lint + test + guard
npx playwright test e2e/interaction.spec.ts --project=desktop       # 5 passed
npx playwright test e2e/analysis.spec.ts e2e/chart-styles.spec.ts --project=desktop
# 33 passed, 1 skipped
npx playwright test e2e/chart-editor.spec.ts --project=desktop      # 8 passed, 3 skipped
for l in en it fr es de pt-PT; do node --import tsx scripts/check-locale.mjs "$l"; done
```

Test aggiunti:

- `src/charts/interaction.test.ts`: chiavi, normalizzazione, `interactionPoints`,
  `chartLinkable`, `applyChartLink`, rettangolo e poligono.
- `src/charts/profiler.test.ts`: modello lineare/quadratico, clamp, posizione,
  sezioni.
- `src/charts/builder.test.ts`: tutti i kind, gruppi, chiavi, combinazioni
  invalide.
- `src/charts/vega/buildSpec.test.ts`: compile di uno scatter linkato con
  `__linkOpacity`, nessun warning.
- `e2e/interaction.spec.ts`: brush, dimming e clear; lazo; Data Filter con
  soglia, animazione e dimming; Prediction Profiler; Graph Builder con anteprima
  e card aggiunta.

## 2-sexies. Milestone F — cosa è già fatto

Gate **G8 superato**: `npm run check` verde, accessibilità, export e locale L4
verificati.

### F.1 Traduzioni L4 reali

File nuovi:

- `src/stats/reportCopy/catalog/{fr,es,de,pt-PT}/l4.ts` — 207 frasi di report e
  tabelle ciascuno, chiavi italiane invariate e segnaposto allineati.
- `src/stats/reportCopy/catalog/{fr,es,de,pt-PT}/charts-l4.ts` — 87 titoli,
  note ed etichette dei grafici L4 ciascuno.
- `src/help/content/l4-{fr,es,de,pt-PT}.ts` — cinque pagine help L4 tradotte
  (Partition, Quality, Cluster, Discriminant, DOE).
- `src/stats/reportCopy/catalog/charts.ts` — `chartCatalogFor(locale)`
  sovrappone il catalogo L4 della lingua a quello inglese degli altri grafici;
  `copy()` lo consulta prima del fallback inglese.
- `{fr,es,de,pt-PT}/index.ts` importano `l4Copy` locale; ogni `book.ts` importa
  `l4Topics` dalla propria lingua.
- Test: `src/charts/copy.test.ts` verifica chiavi e segnaposto L4 in tutte le
  lingue e che `copy()` restituisca il titolo localizzato.

Verifica: `check-locale` su `en it fr es de pt-PT` → 1409/1409 chiavi UI,
2191/2191 frasi report, 47 pagine help per lingua.

### F.2 Accessibilità dell'interazione

File: `ChartInteractionLayer.tsx`, `ChartCard.tsx`,
`SessionReportToolbar.tsx`, cataloghi `analysis.ts`.

- superficie con focus visibile a 2 px, `aria-describedby` verso istruzioni
  `sr-only`, `aria-keyshortcuts="Enter Escape"`;
- **Invio** seleziona tutti i punti del grafico, **Esc** annulla;
- conteggi `N selezionati` / `N nascosti` con `role="status"` e
  `aria-live="polite"`;
- chip `Link`/`Nessun ID riga` con `title`/`aria-label` esplicativi, icona
  `aria-hidden` e contrasto più alto;
- il select dello strumento ha la nuova etichetta `chart.link.tool`.

### F.3 Performance: segnali invece di re-embed

File: `src/charts/interaction.ts`, `src/components/charts/VegaChart.tsx`,
`src/charts/vega/buildSpec.test.ts`.

- `applyChartLink` inserisce i parametri `linkKeys`/`hiddenKeys` e usa i segnali
  nell'espressione di opacità; il grafico nasce già con lo scaffolding, anche
  senza selezione.
- `VegaChart` non include più il link state in `chartKey`: un pennello o un
  cambio di nascosti aggiorna la vista con `view.signal(...)` + `runAsync()`,
  senza ricompilare né rimontare Vega.
- Misura sintetica su 2 000 punti: aggiornamento del segnale ~7 ms mediani;
  il percorso precedente ricompilava e re-incorporava il grafico.
- `buildSpec.test.ts` verifica che il compilato contenga i segnali.

### F.4 Export pulito

File: `src/hooks/useOutputConsole.tsx`, `src/components/charts/ChartLinkContext.tsx`,
`src/components/charts/ChartCard.tsx`, `src/io/reportExport.ts`,
`src/ui/OutputConsole.tsx`.

- `ChartLinkValue.exporting` sospende selezione, attenuazione e overlay durante
  copia testo, PNG, HTML, Word e run-report.
- Le card ricevono `linkState`/`interaction` solo se `exporting` è falso; dopo
  l'export lo stato live torna visibile.
- HTML/Word rimuovono `button`, `[data-no-print]` e `[data-no-export]`; il CSS
  di stampa nasconde gli stessi elementi. Il PNG già filtra le superfici dentro
  `[data-no-export]`.
- Test e2e: export HTML con selezione attiva → nessun
  `data-chart-link-surface`, nessun `data-prediction-profiler`, nessuna opacità
  0,14; la selezione live riappare dopo l'export.

### F.5 Manuale e documentazione

- Nuova pagina help `interaction` in tutte e sei le lingue, dopo
  `output-console`; spiega linking, pennello, lazo, Data Filter, stato di
  sessione ed export pulito.
- `docs/CHART-ENGINE.md` e `ARCHITECTURE.md` aggiornati con segnali, export
  pulito, accessibilità, copy L4 e pagina manuale L5.
- Questa sezione e la matrice di copertura sotto sono la documentazione finale
  della milestone.

### F.6 Verifiche eseguite (tutte verdi)

```bash
npm run lint                 # tsc --noEmit
npm test                     # 833 test, 42 suite, 0 fail
npm run guard                # depcruise, madge, file-size (748 moduli, 3 eccezioni)
npm run check                # lint + test + guard
npm run help:build           # 6 lingue, 47 pagine ciascuna
npx playwright test e2e/interaction.spec.ts --project=desktop       # 6 passed
for l in en it fr es de pt-PT; do node --import tsx scripts/check-locale.mjs "$l"; done
```

### F.7 Matrice di copertura finale (L1–L5)

| Livello | Copertura | Dove |
|---|---|---|
| **L1 — Style** | Box, scatter, Q-Q, interval, dot, residual, histogram con varianti LazStats/JMP-like; gallery a due famiglie, filtro, confronto | `src/charts/styles.ts`, `ChartStyleGallery.tsx`, `e2e/chart-styles.spec.ts` |
| **L2 — Oggetti** | `diamond`, `circles`, `shadowgram`, `scattermatrix`, `bubble`, `scatter3d`; oggetti L4 `tree`, `pareto`, `dendrogram`, `surface` | `objectLayers.ts`, `advancedLayers.ts`, runner L2/L4 |
| **L3 — Pannelli** | Distribution, Oneway, Fit Model, Regression diagnostics, PCA, Time series, Quality | `src/charts/panels.ts`, `PanelCard.tsx` |
| **L4 — Analisi** | Partition, Quality, Cluster, Discriminant/MANOVA, DOE; famiglie già presenti (PCA, serie temporali, logistico, corrispondenze) | registry, kernel, report, help L4 |
| **L5 — Interazione** | Row state, brush, lasso, Data Filter animato, Prediction Profiler, Graph Builder; stato di sessione e export pulito | `interaction.ts`, `ChartInteractionLayer.tsx`, `useOutputConsole.tsx`, `e2e/interaction.spec.ts` |

Restano fuori perimetro, come documentato: MANOVA multi-fattore standalone,
partizione categorica, linking tra dataset diversi, attributi `excluded`/
`color`/`marker`, Data Filter categorico oltre 80 valori, controllo editor
`surface` e banda Actual by Predicted per `k >= 2`.

## 3. Invarianti da non rompere

1. **Un solo default per kind** e il default built-in riproduce
   `factoryOptions(kind)`. `styles.test.ts` lo verifica.
2. **Eccezione Q-Q documentata**: `qq.probability` è default JMP-like;
   `qq.classic` è LazStats. Non cambiare il default storico.
3. **Ordine di merge invariato**:
   `factory < default comuni < stile < opzioni esplicite della card`.
   Uno stile non deve mai cambiare dati o statistica, solo la presentazione.
4. **L'override esplicito del runner vince**. Per abilitare una feature via
   stile bisogna rimuovere l'override che la blocca (come fatto per
   `reg-scatter band`), non invertire il merge.
5. **Nessun `NaN` nei summary**: `finiteRows` scarta l'intera riga. I campi
   opzionali non calcolabili vanno omessi.
6. **User styles**: `user: true` e `origin` assente; i badge li trattano come
   “Personale”. Non assegnare `origin` agli stili utente.
7. **Pre-run vs gallery**: senza chart i `requires` sono ottimistici; filtra
   solo `analyses`. `patchesFor` ricade sul default del kind.
8. **Niente nuovi `kind` in Milestone A/B L1**: le varianti L1 usano i kind
   esistenti (`box`, `scatter`, `qq`, `interval`, `dot`, `residual`,
   `histogram`). Gli L2 della Milestone B sono invece nuovi kind espliciti
   (`diamond`, `circles`, `shadowgram`, `scattermatrix`, `bubble`,
   `scatter3d`) e non vanno travestiti da stile.
9. **Persistenza**: non salvare l'id dello stile nella card; le opzioni sono la
   fonte di verità. Non bumpare `PROJECT_VERSION` per queste opzioni.
10. **Jitter**: pattern deterministico, ciclo 101, nessun transform Vega
    aggiuntivo, nessun dato persistito in più.
11. **Compare**: due copie, deduplica per `kind + title + options`, cap 24.
12. **Gallery**: massimo 8 built-in visibili, “Altri”, preview live max 6,
    `data-no-export` sulle miniature.
13. **L2**: i nuovi oggetti non hanno tile gallery; sono `kind` separati con
    dati propri. `scattermatrix` richiede coordinate già normalizzate dal
    runner; `scatter3d` dichiara che l'ellisse è proiettata, non un test 3D.
14. **Residui**: `stats.residSd` è la SD dei residui del modello, non la SD
    standardizzata; la banda `showStdBand` è ±2 volte quel valore.
15. **Pannelli fuori dalla gallery**: `panel` non è un `ChartKind`, non ha
    opzioni, non ha stili e non compare tra i kind di `styles.ts`.
16. **Pannelli additivi**: i runner emettono `panels` in aggiunta a `charts`;
    i pannelli non sostituiscono i grafici autonomi. Un pannello vuoto non
    deve essere creato.
17. **Profondità 1**: `PanelChart.children` contiene solo `AnalysisChart`; un
    pannello annidato è rifiutato dal parser.
18. **PNG**: ogni grafico si esporta una volta; le copie dentro un pannello
    vengono saltate se lo stesso chart id è già una superficie autonoma.
19. **Qualità**: `qualityPanel` viene emesso dalla procedura `quality`; le
    carte controllo/capacità/Pareto/variabilità restano anche autonome.
20. **L4**: i nuovi `kind` (`tree`, `pareto`, `dendrogram`, `surface`) non hanno
    tile gallery e non sono stili; sono oggetti emessi dai runner L4.
21. **Report senza kernel**: `src/stats/reports/*` importa i tipi dei risultati
    da `src/stats/analysisResults.ts`, mai dai kernel.
22. **Quality panel**: la procedura `quality` emette `panel-quality` insieme ai
    grafici autonomi; non si costruisce un pannello da grafici non di qualità.
23. **DOE**: la mesh è una proiezione 2D dichiarata; le curve di livello usano
    coordinate reali dei fattori, non coordinate proiettate.
24. **Cluster**: i profili sono medie standardizzate; il numero di cluster è una
    scelta dell'analista e non un test di esistenza dei gruppi.
25. **Linking senza ricalcolo**: `applyChartLink` cambia solo l'opacità dei
    simboli; dati, statistiche, tabelle, report ed export restano identici.
    Linee, bande, regole e summary non vengono attenuate.
26. **Chiavi di riga**: `__row` è l'indice della riga nella griglia usata dal
    run (`linkGrid`), non un id persistente. Se il dataset cambia, selezione e
    nascosti vengono azzerati. Non salvare `__row` come identità di progetto.
27. **Solo simboli**: un grafico è linkabile solo se disegna osservazioni come
    simboli (`chartLinkable`); istogrammi, shadowgram e linee senza marker non
    devono offrire un lazo che non selezionerebbe nulla.
28. **Scenegraph, non nomi di scale**: l'overlay proietta i punti da
    `view.scenegraph()`; non dipendere da `view.scale('x')` (Vega-Lite v6 può
    nominare gli scale per layer).
29. **Stato di interazione di sessione**: `selection` e `hidden` non sono
    persistiti in `.lzs` e non cambiano `dataRevision`; non renderli parte del
    contratto `AnalysisChart`.
30. **Profiler senza rerun**: i coefficienti DOE sono dati già calcolati nel
    `stats` del grafico `surface`; lo slider valuta lo stesso polinomio e non
    tocca il kernel né i dati osservati.
31. **Graph Builder senza nuovi kind**: il builder compone solo `scatter`,
    `line`, `bar`, `box`, `histogram` e passa da `makeChart`; non aggiunge
    renderer, non inventa aggregazioni oltre alla media per categoria.
32. **Segnali di linking**: `linkKeys`/`hiddenKeys` sono segnali Vega, non testo
    dell'espressione. Un cambio di selezione non deve cambiare `chartKey` né
    ricompilare/rimontare la vista; il grafico nasce già con lo scaffolding dei
    segnali anche senza selezione.
33. **Export pulito**: durante l'export `exporting` sospende selezione,
    attenuazione e overlay; HTML/Word rimuovono `[data-no-export]` e il PNG
    filtra le superfici dentro `[data-no-export]`. Il report esportato conserva
    sempre tutte le righe, indipendentemente da brush e Data Filter.
34. **Accessibilità dell'interazione**: la superficie ha focus visibile,
    istruzioni `sr-only`, Invio seleziona tutti i punti ed Esc annulla; i
    conteggi sono annunciati con `role="status"`/`aria-live`; il chip
    `Link`/`Nessun ID riga` ha testo e `aria-label` espliciti, non solo colore.
35. **Locale L4**: report, tabelle, grafici e help L4 sono tradotti in tutte e
    sei le lingue; `catalog/charts.ts` sovrappone solo le copy L4 locali al
    catalogo inglese degli altri grafici. Non reintrodurre import da
    `../en/l4` nei cataloghi locali.
36. **Manuale L5**: la pagina `interaction` esiste in tutte le lingue ed è
    nell'ordine del libro; se si aggiunge una pagina, aggiornare
    `TOPIC_ORDER` e tutti i libri, altrimenti `content.test.ts` fallisce.

## 4. Working tree

Il repository contiene **modifiche non committate preesistenti** della gallery
v1 (fatte dall'altro agente) più le modifiche delle Milestone A, B, C, D, E ed
F. Non fare `git checkout`/reset di file non tracciati: `src/charts/styles.ts`,
`styles.test.ts`, `analysisKinds.ts`, `ChartStyleGallery.tsx`,
`ChartStyleSettings.tsx`, `useChartStyleLibrary.ts`, `ChartStyles.tsx`,
`e2e/chart-styles.spec.ts`, `src/charts/vega/objectLayers.ts` +
`objectLayers.test.ts`, `src/charts/panels.ts` + `panels.test.ts`,
`src/components/charts/PanelCard.tsx`, `src/analyses/descriptive/run.test.ts`,
`src/stats/kernels/partition|quality|cluster|discriminant|doe.ts`,
`src/stats/analysisResults.ts`, `src/analyses/partition|quality|cluster|discriminant|doe/`,
`src/charts/interaction.ts`, `src/charts/profiler.ts`, `src/charts/builder.ts`,
`src/components/charts/ChartLinkContext.tsx`,
`src/components/charts/ChartInteractionLayer.tsx`,
`src/components/charts/PredictionProfiler.tsx`,
`src/components/charts/GraphBuilderDialog.tsx`,
`src/ui/output/DataFilterDialog.tsx`, `e2e/interaction.spec.ts`,
`src/stats/reportCopy/catalog/{fr,es,de,pt-PT}/l4.ts` e `charts-l4.ts`,
`src/stats/reportCopy/catalog/charts.ts`,
`src/help/content/l4-{fr,es,de,pt-PT}.ts`,
i piani in `docs/plans/` e i PDF JMP sono nuovi o non tracciati. Nessun commit
è stato creato in questa sessione.

## 5. Milestone F — completata

Le Milestone A, B, C, D, E ed F sono completate (vedi §2, §2-bis, §2-ter,
§2-quater, §2-quinquies e §2-sexies): **G0–G8 superati**.

### Cosa resta fuori perimetro

- **MANOVA standalone**: discriminante include la MANOVA a un fattore; un test
  MANOVA multi-fattore separato non esiste ancora.
- **Partition categorica**: il kernel è di regressione (risposta numerica); la
  classificazione categorica non è implementata.
- **Linking su più run-report**: lo stato di selezione è per sessione/console;
  non collega card di dataset diversi e non viene salvato nel progetto.
- **Attributi di riga `excluded`/`color`/`marker`**: la Milestone E implementa
  `selected` e `hidden`; gli altri tre restano una possibile estensione.
- **Data Filter categorico oltre 80 valori**: l'elenco è troncato a 80; per
  colonne ad alta cardinalità usare la modalità numerica o il filtro righe.
- **Controllo editor `surface`**: la modalità mesh/contour è scelta dal runner;
  un controllo utente sarebbe una nuova ondata, non una modifica alla gallery.
- **Banda Actual by Predicted `k >= 2`**: richiede `seMean` per il profilo
  medio; resta rimandata.

### Gate

- **G5 superato** da C: pannelli esportabili (PNG/HTML/Word) e ricaricabili.
- **G6 superato** da D: nuove analisi complete e verdi.
- **G7 superato** da E: linking reale, lazo, Data Filter, profiler e Graph
  Builder con test e2e.
- **G8 superato** da F: `npm run check` verde, accessibilità, export pulito e
  locale L4 complete.

## 6. Comandi utili

```bash
# unit mirati
node --import tsx --test src/charts/styles.test.ts
node --import tsx --test src/charts/kits/common.test.ts src/charts/vega/boxLayers.test.ts
node --import tsx --test src/charts/vega/layers.test.ts src/charts/vega/buildSpec.test.ts
node --import tsx --test src/charts/vega/objectLayers.test.ts
node --import tsx --test src/charts/interaction.test.ts src/charts/profiler.test.ts src/charts/builder.test.ts
node --import tsx --test src/analyses/regression/run.test.ts src/analyses/descriptive/run.test.ts
node --import tsx --test src/charts/schema.test.ts
node --import tsx --test src/charts/panels.test.ts src/charts/outputs.test.ts

# suite completa
npm run check
npx playwright test e2e/interaction.spec.ts --project=desktop
npx playwright test e2e/analysis.spec.ts e2e/chart-styles.spec.ts --project=desktop
npx playwright test e2e/chart-editor.spec.ts --project=desktop

# locale (una alla volta)
for l in en it fr es de pt-PT; do node --import tsx scripts/check-locale.mjs "$l"; done
```

## 7. Decisioni già prese (non riaprire senza motivo)

- Nome UI: **LazStats** e **JMP-like**; “JMP-like” è descrittivo, nessun logo o
  colore JMP.
- Q-Q: `probability` resta default JMP-like; `classic` è LazStats.
- Colori JMP: fuori dalla gallery; eventualmente un preset separato, non uno
  stile.
- Confronto side-by-side: solo azione esplicita `⇄`, mai automatico.
- Banda Actual by Predicted `k >= 2`: rimandata (Milestone C), richiede
  `seMean` per il profilo medio.
- Pannelli compositi: L3, non appaiono nella gallery stile.
- L2 della Milestone B: oggetti nuovi (`diamond`, `circles`, `shadowgram`,
  `scattermatrix`, `bubble`, `scatter3d`), non varianti di stile; nessuna tile
  gallery. `scatter3d` mostra un'ellisse proiettata, dichiarata come tale.
- Pannelli della Milestone C: additivi rispetto ai grafici autonomi (`panels`
  separato da `charts`), non sostitutivi. HTML/Word catturano il pannello
  intero; il PNG esporta ogni grafico una volta sola.
- `qualityPanel`: builder pronto, emissione rimandata alla Milestone D perché i
  grafici di controllo/capacità non esistono ancora.
- Linking L5: lo stato è di sessione, non persistito; la selezione non cambia
  dati o statistiche. Il pennello/lazo è opt-in (`Link`), mai automatico.
- Data Filter: usa la griglia del run (`linkGrid`) e le chiavi `__row`; non è
  un secondo filtro righe e non altera i parametri dell'analisi.
- Prediction Profiler: valuta i coefficienti già calcolati del DOE; non è un
  nuovo kernel e non modifica il modello.
- Graph Builder: cinque kind esistenti, nessun renderer nuovo; la card prodotta
  non ha Re-run perché non è un'analisi del registro.
- Trascinamento: il Graph Builder accetta drag-and-drop ma anche click colonna
  + click slot, così resta usabile da tastiera.
