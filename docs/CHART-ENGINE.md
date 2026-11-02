# Motore grafico Vega-Lite e grafici editabili

Il motore grafico di LazStats produce ogni grafico come **modello semantico
serializzabile** e lo compila in una specifica Vega-Lite solo al momento del
render. Victory e `recharts` non sono più dipendenze.

## Due fasi

1. **Run** — il runner calcola tabelle, prosa e uno o più `AnalysisChart` con le
   opzioni di fabbrica. La card mostra, nell'ordine: titolo/header, tabelle,
   prosa del report, grafici.
2. **Edit** — cliccando un grafico (o il pulsante *Edit chart*) si apre
   `ChartEditorDialog`: preview live, toolbar generale sticky, pannello destro
   con le opzioni specifiche. **Done** aggiorna le opzioni della card senza
   rilanciare l'analisi; **Cancel** scarta; **Reset** torna alle opzioni
   iniziali della card. Le modifiche sono salvate da autosave e `.lzs` e
   restano modificabili al reload.

Sotto 1024px il dialogo diventa full-screen e il pannello specifico collassa in
un `<details>` sotto il grafico. Il pannello contiene solo opzioni di
visualizzazione, mai parametri statistici (orizzonte di previsione, post-hoc,
numero di imputazioni, ...).

## Contratto

`src/stats/charts.ts` definisce `AnalysisChart`:

```ts
{
  version: 1,
  id, kind, title, subtitle?, note?,
  layout: 'full' | 'half',
  data: Record<string, ChartRow[]>,   // points, fit, band, bars, summary, ...
  fields: Record<string, string>,     // etichette leggibili
  stats?: Record<string, number | string | null>,
  options: ChartOptions               // unione discriminata per kind
}
```

I dati sono già aggregati dal kernel: il renderer non ricalcola statistica. Le
uniche eccezioni sono la banda CI/PI della regressione (calcolata da `xGrid`,
`seMean`, `sePred`, `df`), il numero di classi dell'istogramma (transform
Vega-Lite sui valori grezzi) e la KDE del violin (calcolata in TypeScript dai
`points` del box). La KDE usa i punti presenti nel modello: oltre il cap di
2000 punti per layer è una stima; il notch usa `n` dal summary, quindi resta
esatto anche quando i punti sono campionati.

## Strati

```
src/charts/
  defaults.ts          default di fabbrica, preset, merge
  features.ts          unico registro dei controlli (generali + specifici)
  schema.ts            parse/validate/downsample/cap di worker e .lzs
  kits/common.ts       costruttori condivisi (box summary, makeChart)
  vega/theme.ts        palette, sfondi, colori di assi e griglia
  vega/buildSpec.ts    dispatcher modello -> TopLevelSpec
  vega/encoding.ts     helper comuni (assi, legenda, tooltip, bande)
  vega/layers.ts       layer per famiglia (scatter, bar, forest, ...)
  vega/boxLayers.ts    box standard, box con tacca e violin
src/components/charts/
  VegaChart.tsx        mount/update/finalize di vega-embed, renderer SVG
  ChartCard.tsx        cornice, note, pulsante Edit, apertura popup
  ChartEditorDialog.tsx shell, preview, Done/Cancel/Reset, focus trap
  ChartGeneralToolbar.tsx / ChartSpecificPanel.tsx / ChartControls.tsx
```

`src/charts/` non importa `ui/`, `analyses/`, `hooks/`, `components/` o `io/`.
`vega-embed` è caricato con `import()` dinamico: il bundle iniziale e il worker
non contengono Vega. Build misurata: chunk `vega` 842 kB (291 kB gzip) caricato
solo al primo grafico, `heavy.worker` senza Vega, chunk applicativo invariato
rispetto alla baseline (la crescita è confinata al chunk lazy).

## Feature v1

Generali: preset (`Default`, `Minimal`, `Print light`), tema scuro/chiaro,
griglia X/Y e opacità, palette (default, colorblind, monocromatica), legenda e
posizione, titolo/sottotitolo/note, titoli assi, base zero, forma/dimensione/
opacità punti, spessore e tratteggio linee, dimensione, tooltip.

Specifiche: fit OLS/Theil-Sen e bande CI/PI 90/95/99 per la regressione;
tipo di box (box, notched, violin), punti/outlier/media/mediana/ordine per il
boxplot; barre d'errore, etichette,
ordine e riferimento per le barre; densità/rug/media e classi per
l'istogramma; IC/censura/mediana/gradini per la survival; scala log,
riferimento e ordine per il forest; Kaiser e valori per lo scree; bias/LoA per
Bland–Altman; target e punto di disegno per la potenza; e così via. Le feature
non applicabili sono nascoste.

## Milestone B — grafici delle procedure successive

Sono stati aggiunti anche i grafici per le procedure che prima non ne avevano:

- `mixedanova`: interazione gruppo × condizione e traiettorie dei soggetti;
- `tost`: differenza con IC e margini di equivalenza;
- `countreg`: osservati vs predetti e residui vs predetti;
- `ordinal`: curve di probabilità predetta per categoria;
- `lmm`: osservati vs predetti, residui, medie per gruppo e Q-Q;
- `gee`: osservati vs predetti e medie per cluster;
- `stratcox` e `tdcox`: forest plot degli hazard ratio;
- `parametric`: curve di sopravvivenza, hazard e hazard cumulativo per profilo del primo predittore;
- `contingency`: heatmap dei residui standardizzati;
- `mi`: valori osservati e mancanti per variabile, distribuzione osservata e completata;
- `resampling`: distribuzione bootstrap e distribuzione nulla di permutazione;
- `agreement`: scatter ICC e heatmap kappa;
- `nonparamrm`: McNemar (coppie concordanti/discordanti) e Jonckheere (box per
  gruppo ordinato).

I dati derivati necessari (fitted/residui, probabilità ordinali, profili,
matrici di accordo, distribuzioni) sono esposti dai kernel e coperti da
`src/analyses/milestoneB.test.ts`, che compila ogni nuovo grafico con Vega-Lite.

## Default dei grafici

`Settings → Charts` riusa `ChartControls` e salva un `ChartDefaults` nel
progetto (opzionale nei file vecchi). La catena è `factory < user defaults <
per-card options`: i nuovi run usano i default, le card esistenti non vengono
toccate. `Reset chart defaults` riporta ai valori di fabbrica. Il merge avviene
in `withChartDefaults`, che avvolge il runner sincrono e il worker.

## Galleria degli stili

`src/charts/styles.ts` dichiara, per tipo di grafico, gli **stili** mostrati
nella fascia orizzontale sotto l'anteprima dell'editor. Uno stile possiede solo
le opzioni specifiche del `kind` (visualizzazione box, asse Q-Q, sovrapposizioni
dell'istogramma, ...), mai colori, tema o annotazioni. Per ogni kind con
varianti esiste esattamente uno stile `isDefault`, che riproduce le opzioni di
fabbrica (`styles.test.ts` lo verifica): le procedure continuano quindi a
emettere il default senza modifiche.

- Clic su una tile: applica lo stile alla bozza dell'editor, in un solo undo.
- `+` sulla tile: `appendChartCopy` aggiunge una copia della card con quello
  stile allo stesso run-report, una sotto l'altra, senza rieseguire l'analisi
  (cap `MAX_CHARTS_PER_OUTPUT`).
- **Salva stile…**: le opzioni specifiche correnti diventano uno stile nominato
  del progetto (`ProjectSettings.chartStyles`, max 40, validato contro le chiavi
  del tipo). Si rinominano/eliminano da Impostazioni → Grafici.
- **Stile dei nuovi grafici**: `chartStyleDefaults[kind]` (globale) e
  `chartStyleOverrides[analysisId][kind]` (procedura) scelgono lo stile usato dai
  run successivi; `withChartStyles` lo applica con l'ordine fabbrica < default
  comuni < stile < opzioni della card, quindi le scelte statistiche del runner
  vincono sempre.
- Le anteprime sono `VegaChart` in miniatura con i dati della card, marcate
  `data-no-export` per non finire negli export PNG.

## Persistenza e limiti

- `PROJECT_VERSION = 3`; `parseProject` accetta v1, v2 e v3.
- `ProjectSettings.chartDefaults` è presente nei file nuovi e ricostruito con i
  default di fabbrica nei file v1/v2.
- Le card v1/v2 conservano lo snapshot HTML statico e restano leggibili ma non
  modificabili; un nuovo run produce una card v3 editabile.
- Lo snapshot HTML conserva **tabelle e prosa**, non i grafici: i modelli sono
  salvati a parte e renderizzati al reload.
- Limiti: `MAX_CHARTS_PER_OUTPUT = 24`, `MAX_CHART_POINTS = 2000` (downsample
  deterministico), `MAX_CHART_MODEL_CHARS = 120_000`, `MAX_OUTPUT_CHARS =
  600_000`, `MAX_STORED_OUTPUT_CHARS = 1_500_000`.
- Oltre 24 grafici i primi 24 restano live e persistiti; gli altri sono
  dichiarati nella card con *Show all* in sessione. Se un modello o il budget
  caratteri non basta, il grafico è omesso con nota: tabelle e prosa non si
  perdono. I Q-Q descrittivi sono limitati alle prime 8 variabili.

## Export asincrono

`awaitChartsReady(root, 5000)` attende `data-chart-state` su ogni
`[data-chart-surface]` prima di copiare o esportare. `copyCard`, `copyOutput`,
PNG, report HTML e Word sono asincroni; se un grafico non è pronto si esporta il
resto e si mostra un avviso. L'export PNG usa solo `[data-chart-surface] svg` e
lo sfondo dichiarato da `data-chart-background`.

## Pannelli compositi (L3)

Un pannello è un report fatto di grafici e tabelle già calcolati; non è un
`ChartKind` e non appare nella gallery stile. Il contratto è `PanelChart`
(`version:1`, `kind:'panel'`, `layout:'grid' | 'stack'`, `children:
AnalysisChart[]` a profondità 1, `tables?`), in `src/stats/charts.ts`.

- I runner restituiscono `panels` accanto a `charts`; i pannelli sono additivi
  e non sostituiscono i grafici autonomi.
- `src/charts/panels.ts` contiene i builder (`distributionPanel`,
  `onewayPanel`, `fitModelPanel`, `regressionDiagnosticPanel`, `pcaPanel`,
  `timeSeriesPanel`, `qualityPanel`). Selezionano oggetti già esistenti,
  deduplicano e degradano quando un grafico manca.
- `PanelCard.tsx` rende i figli come `ChartCard` editabili; il loro
  `data-chart-id` è prefissato con l'id del pannello e l'editor aggiorna sia la
  copia autonoma sia quella nel pannello.
- `schema.ts` valida i pannelli (`parsePanelModel`, `parsePanelModels`) e li
  limita (`fitPanelBudget`, massimo 8 figli, nessun annidamento). Persistenza,
  worker e `.lzs` trasportano `panels` come i `charts`.
- HTML/Word includono il pannello intero; l'export PNG esporta ogni grafico una
  volta sola, saltando la copia nel pannello quando esiste già la superficie
  autonoma.
- `qualityPanel` viene emesso dalla procedura Quality (control/capability/
  Pareto/variability) insieme ai grafici autonomi; il builder non è cambiato.

## Procedure L4 (Milestone D)

Le nuove procedure vivono nel registro come le altre e producono tabelle,
report, grafici e — dove previsto — pannelli:

- **Partition** (`partition`): albero CART di regressione, report delle foglie,
  regole di split e importanza delle variabili. Nuovo `kind: 'tree'`, layout
  calcolato nel runner (`layoutPartitionTree`).
- **Quality (SPC)** (`quality`): carta di controllo XBar-R/individui/EWMA,
  capacità Cp/Cpk, Pareto e variabilità per gruppo. Emette `panel-quality`.
  Nuovo `kind: 'pareto'`; capacità e controllo riusano `histogram`/`line`.
- **Cluster** (`cluster`): clustering gerarchico average/complete/single/Ward,
  dendrogramma, profili standardizzati e dimensioni. Nuovo
  `kind: 'dendrogram'`.
- **Discriminant / MANOVA** (`discriminant`): LDA, lambda di Wilks/Pillai,
  test univariati, matrice di classificazione, grafico canonico e profilo delle
  medie (copre anche il profile plot MANOVA).
- **Response Surface (DOE)** (`doe`): modello lineare/quadratico, superficie
  proiettata, curve di livello, coefficienti e punto stazionario. Nuovo
  `kind: 'surface'` con `display: 'mesh' | 'contour'`.

I nuovi `kind` non hanno tile nella gallery stile: sono oggetti L4, non
varianti L1. Le firme dei report non importano i kernel: i tipi dei risultati
stanno in `src/stats/analysisResults.ts`, così `stats/reports` legge solo
numeri già calcolati.

## Interazione e linking (L5)

Lo stato di selezione è di sessione: non viene salvato in `.lzs` e non modifica
dati, statistiche, tabelle o report.

- **Chiavi di riga**: un runner che vuole partecipare al linking aggiunge
  `__row` alle righe del layer di osservazioni. Il valore è l'indice della riga
  nella griglia usata dal run (filtro righe e missing già applicati), quindi
  tutti i grafici dello stesso run-report condividono lo stesso spazio di
  chiavi. Oggi lo fanno descriptive, regressione e ANOVA.
- **`src/charts/interaction.ts`**: tipi `ChartLink`/`LinkSelection`,
  `rowKeyOf`, `interactionPoints`, `chartLinkable`, `applyChartLink`,
  `linkSignature`, geometria `keysInRect`/`keysInPolygon`/`brushRect`.
- **Opacità**: `applyChartLink` aggiunge ai soli layer a simboli un transform
  `__linkOpacity` e un'encoding `opacity` con `scale: null`. Selezionati = 1,
  non selezionati = 0,14, righe nascoste dal Data Filter = 0,04. Linee, bande,
  regole e summary non cambiano.
- **Aggiornamento senza re-embed**: le chiavi viaggiano nei segnali Vega
  `linkKeys`/`hiddenKeys`, non nel testo dell'espressione. `VegaChart` tiene lo
  stesso `chartKey` quando cambia solo la selezione e aggiorna la vista con
  `view.signal(...)` + `runAsync()`: un pennello non ricompila più il grafico.
  Misura sintetica su 2 000 punti: aggiornamento del segnale ~7 ms mediani,
  contro il percorso di ricompilazione/embed che ricrea il DOM Vega.
- **Overlay**: `ChartInteractionLayer` copre l'area del grafico misurata da
  `measurePlotArea`. Pennello e lazo proiettano i punti dal scenegraph Vega
  (`view.scenegraph()`), non dai nomi degli scale: Vega-Lite può nominare gli
  scale per layer (Q-Q a due assi, Pareto a due assi y). L'overlay esiste solo
  con `Link` attivo, quindi tooltip, annotazioni ed editor restano usabili.
- **Accessibilità**: la superficie ha `role="application"`, focus visibile,
  istruzioni `sr-only` collegate con `aria-describedby`, Invio seleziona tutti i
  punti ed Esc annulla. Il conteggio `N selezionati` e `N nascosti` sono
  `role="status" aria-live="polite"`; il chip `Link`/`Nessun ID riga` ha
  `title`/`aria-label` esplicativi e contrasto più alto.
- **Contesto**: `ChartLinkProvider` in `OutputConsole` espone `selection`,
  `hidden`, `linkMode`, `tool`, `exporting`; ogni `ChartCard` legge lo stesso
  stato, quindi i pannelli L3 si attenuano insieme ai grafici autonomi.
- **Export pulito**: durante PNG/HTML/Word e copia testo `exporting` è attivo;
  le card non ricevono il link state, quindi il report esporta tutti i dati
  senza attenuazione. HTML/Word rimuovono anche gli elementi `data-no-export`
  (overlay, profiler, chip) e il PNG filtra le superfici dentro `data-no-export`.
  Data Filter e Graph Builder sono dialoghi fuori dal DOM dell'output e non
  entrano nell'export.
- **Data Filter**: `DataFilterDialog` deriva le chiavi `hidden` dalle righe della
  `linkGrid`; supporta elenco di valori categorici, soglia numerica e
  animazione sui valori ordinati. Non modifica tabelle, statistiche o report.
- **Prediction Profiler**: il runner DOE scrive i coefficienti del modello nel
  `stats` del grafico `surface`; `profiler.ts` valuta lo stesso polinomio e
  `PredictionProfiler` offre due slider e due sezioni senza rieseguire
  l'analisi.
- **Graph Builder**: `charts/builder.ts` compone `scatter`, `line`, `bar`
  (media per categoria), `box` e `histogram` con `makeChart`; il dialogo
  assegna X/Y/Gruppo con drag-and-drop o click e aggiunge una card normale
  tramite `pushBuiltChart`. Non ha `analysisId`, quindi non ha Re-run.
- **Copy L4**: report, tabelle, grafici e pagine help delle procedure L4 sono
  tradotti in tutte e sei le lingue. `catalog/charts.ts` sovrappone il catalogo
  L4 della lingua attiva a quello inglese degli altri grafici; le pagine help
  vivono in `src/help/content/l4-<locale>.ts`.
- **Manuale L5**: la pagina `interaction` (in tutte le lingue, dopo
  `output-console`) spiega linking, pennello, lazo, Data Filter ed export
  pulito.

## Test

- `src/charts/schema.test.ts`, `features.test.ts`, `copy.test.ts`.
- `src/charts/interaction.test.ts`: chiavi di riga, `chartLinkable`,
  `applyChartLink` con segnali, pennello e lazo.
- `src/charts/copy.test.ts`: copertura delle copy L4 in tutte le lingue.
- `src/charts/profiler.test.ts` e `src/charts/builder.test.ts`.
- `e2e/interaction.spec.ts`: brush/lazo con dimming, Data Filter animato,
  Prediction Profiler, Graph Builder ed export HTML pulito con selezione attiva.
- `src/charts/kits/common.test.ts`: `n` nel summary e KDE del violin
  (simmetria, semilarghezza, gruppi singleton/costanti).
- `src/charts/vega/boxLayers.test.ts`: notch (folded, IQR=0), ordine delle
  categorie e geometria di base di notch/violin.
- `src/charts/vega/buildSpec.test.ts`: `vega-lite.compile()` per ogni kind,
  nessun warning, test numerico CI/PI (PI più larga della CI e monotonia con il
  livello).
- `src/io/outputsCharts.test.ts`: persistenza, card legacy, overflow.
- Playwright: run + chart ready, edit + reload, PNG + report HTML;
  `e2e/chart-editor.spec.ts` copre toolbar, pannello specifico, Reset,
  undo/redo, export PNG diretto, persistenza, focus trap e layout mobile su
  ANOVA e regressione semplice (screenshot in
  `test-results/chart-editor-audit/`).
- Baseline visive opzionali: `VISUAL=1 npx playwright test
  e2e/chart-editor.spec.ts --project=desktop -g baseline`.
- `npm run check`, build e guardrail restano verdi.

## Localizzazione

La chrome dell'editor (pulsanti, etichette dei controlli) usa le sei lingue
della UI. Titoli, note e assi dei grafici sono contenuto del report e passano
da `copy()`: la sorgente italiana vive nei runner, la traduzione inglese in
`src/stats/reportCopy/catalog/en/charts.ts`. Se una lingua non ha ancora la
frase, `copy()` usa l'inglese invece dell'italiano; aggiungere le traduzioni in
`src/stats/reportCopy/catalog/<locale>/` non richiede modifiche ai runner.
