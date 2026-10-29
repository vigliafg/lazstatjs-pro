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
   rilanciare l'analisi; **Cancel** scarta; **Reset** torna ai default. Le
   modifiche sono salvate da autosave e `.lzs` e restano modificabili al reload.

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
`seMean`, `sePred`, `df`) e il numero di classi dell'istogramma (transform
Vega-Lite sui valori grezzi).

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
  vega/layers.ts       layer per famiglia (scatter, bar, box, forest, ...)
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
punti/outlier/media/mediana/ordine per il boxplot; barre d'errore, etichette,
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

## Test

- `src/charts/schema.test.ts`, `features.test.ts`, `copy.test.ts`.
- `src/charts/vega/buildSpec.test.ts`: `vega-lite.compile()` per ogni kind,
  nessun warning, test numerico CI/PI (PI più larga della CI e monotonia con il
  livello).
- `src/io/outputsCharts.test.ts`: persistenza, card legacy, overflow.
- Playwright: run + chart ready, edit + reload, PNG + report HTML.
- `npm run check`, build e guardrail restano verdi.

## Localizzazione

La chrome dell'editor (pulsanti, etichette dei controlli) usa le sei lingue
della UI. Titoli, note e assi dei grafici sono contenuto del report e passano
da `copy()`: la sorgente italiana vive nei runner, la traduzione inglese in
`src/stats/reportCopy/catalog/en/charts.ts`. Se una lingua non ha ancora la
frase, `copy()` usa l'inglese invece dell'italiano; aggiungere le traduzioni in
`src/stats/reportCopy/catalog/<locale>/` non richiede modifiche ai runner.
