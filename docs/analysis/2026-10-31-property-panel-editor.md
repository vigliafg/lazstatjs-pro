# Property panel laterale per gli oggetti del grafico: studio di integrazione

- **Richiesta**: «valuta utilizzo della fascia verticale destra come property panel di tutti gli oggetti componenti il grafico. ogni oggetto esplode/collassa e rende editabili le sue proprietà tipo property panel di libreoffice... ogni oggetto/features può rendersi visibile/invisibile con l'icona occhio o selettore di proprietà. devono essere integrate nelle proprietà le varianti degli oggetti statistici (per esempio boxplot nelle sue varietà). studia questo sistema e mostra se si può integrare»
- **Perimetro**: `ChartEditorDialog`, fascia destra da 340 px, `ChartSpecificPanel`, `ChartGeneralToolbar`, registro `features`, `ChartOptions`, renderer Vega-Lite.
- **Data e revisione del codice**: 2026-10-31, commit `2d75bb9`.
- **Stato**: studio di fattibilità, nessuna modifica al codice.

## Verdetto

**Sì, si può integrare.** Non richiede un rewrite dei renderer: la maggior parte delle proprietà esiste già come `FeatureDescriptor`; manca soprattutto un **livello di raggruppamento “oggetto”** sopra le feature e una UI a sezioni collassabili con occhio di visibilità. La percentuale esatta va verificata su un prototipo, non assunta.

L’integrazione è però **media**, non banale:

- la fascia destra attuale è un pannello piatto di feature specifiche, non un albero di oggetti;
- molte feature sono varianti, non oggetti (es. `display` del box, `fit` dello scatter);
- alcuni oggetti non hanno ancora un flag di visibilità (baffi, cappucci, linea mediana, componenti del box);
- il pannello deve convivere con la toolbar generale senza duplicare i controlli;
- servono nuove etichette in 6 cataloghi i18n e test per 22 kind.

La soluzione consigliata è un **albero di oggetti + proprietà inline**, non un property panel piatto. La fascia destra diventa l’autorità per tutte le proprietà; la toolbar resta una “quick bar” per preset/tema/dimensione e per undo/redo/export/reset.

## Perché è fattibile

### Cosa esiste già

- Ogni grafico ha un modello semantico con `kind`, `data`, `fields`, `options` (`src/stats/charts.ts:255-273`).
- Le opzioni sono già tipizzate per kind e contengono la maggior parte delle proprietà: punti, fit, banda, errore, display box, marker, censura, mediana, step, raggruppamento, reference line, ecc. (`src/stats/charts.ts:46-230`).
- Il registro `featuresFor(chart)` produce descrittori con `id`, `labelKey`, `type`, `get`, `set`, `visible`, `section`, `choices` (`src/charts/features.ts:18-40,529-533`).
- L’editor ha già anteprima live, undo/redo, reset globale/sezione e export PNG (`src/components/charts/ChartEditorDialog.tsx:54-171`).
- La fascia destra esiste già a 340 px su desktop e come disclosure su mobile (`ChartEditorDialog.tsx:238-270`).

### Cosa manca

- Un modello “oggetto” che raggruppi le feature e definisca gerarchia, icona, visibilità e varianti.
- Un componente albero con chevron, occhio, selezione e proprietà inline.
- Flag di visibilità per alcuni oggetti statistici.
- Una politica chiara per non duplicare toolbar e pannello.
- Un layout responsive migliore del `<details>` mobile.

## UX proposta

### Struttura della fascia destra

Larghezza consigliata: **380-400 px** su desktop (oggi 340 px), da validare con le stringhe più lunghe in 6 lingue. La fascia è scrollabile, con header sticky. Il selettore “Vai a…” e la ricerca sono opzionali e rinviabili: con 10-20 nodi il chevron basta.

```text
┌─ Proprietà ───────────────────────────────┐
│ [ Box plot ▼ ]                            │
├───────────────────────────────────────────┤
│ ▾ Grafico                                 │
│    Titolo      [....................]      │
│    Sottotitolo [....................]      │
│    Tema        [ Chiaro ▼ ]                │
│    Dimensione  [ Regolare ▼ ]              │
│                                            │
│ ▾ Area del grafico                         │
│    Sfondo      [ ■ ]  Bordo [ ■ ]         │
│                                            │
│ ▾ Assi                                     │
│    ▸ Asse X                                │
│    ▸ Asse Y                                │
│    ▸ Griglia X                             │
│    ▸ Griglia Y                             │
│                                            │
│ ▾ Legenda                            👁    │
│                                            │
│ ▾ Dati                                     │
│    ▾ Box plot                        👁    │
│       Visualizzazione [ Box ▼ ]            │
│       ▸ Scatola                            │
│       ▸ Baffi e cappucci             ○    │
│       ▸ Mediana                            │
│       ▸ Outlier                      👁    │
│       ▸ Punti                        👁    │
│       ▸ Media                        👁    │
│       ▸ Etichetta mediana            👁    │
│                                            │
│ ▾ Annotazioni                        [+]   │
└───────────────────────────────────────────┘
```

Legenda: `👁` = toggle già esistente e utilizzabile in Fase 1; `○` = flag previsto ma non ancora nel renderer.

Comportamento:

- **Chevron** (`▸/▾`): espande/collassa l’oggetto e mostra le proprietà inline.
- **Occhio**: mostra/nasconde l’oggetto; `aria-pressed`, tooltip “Mostra/Nascondi”. Compare **solo** dove esiste un toggle reale: non sulle sezioni che raggruppano proprietà (Assi, Area, Grafico).
- **Click sul nome**: espande l’oggetto e porta il focus sulle sue proprietà; non c’è uno stato di selezione separato dall’espansione.
- **Proprietà**: controlli impilati (label sopra, controllo sotto) per stare in 380 px; non la griglia compatta della toolbar.
- **Reset oggetto**: riusa il reset di sezione, applicato al sottoinsieme di feature dell’oggetto.
- **Ricerca / “Vai a…”**: opzionali, non in Fase 1.
- **Stato espanso**: solo UI di sessione, non salvato nel progetto.

### Perché non un pannello piatto

Il pannello attuale (`ChartSpecificPanel`) mostra tutte le feature specifiche in sezioni piatte. Con sezioni collassabili e, solo dove serve, oggetti:

- l’utente capisce **a quale oggetto** appartiene una proprietà;
- le varianti statistiche non sembrano proprietà scollegate;
- l’occhio dà un controllo di visibilità coerente;
- si può crescere con annotazioni e stili per oggetto senza una lista unica ingestibile.

## Modello degli oggetti

### Tipo

```ts
interface ChartObjectNode {
  id: string;                    // 'box', 'whiskers', 'fit', ...
  labelKey: MessageKey;
  features?: string[];           // feature ids da featuresFor(chart)
  children?: ChartObjectNode[];
  visible?: {
    get: (options: ChartOptions) => boolean;
    set: (options: ChartOptions, visible: boolean) => ChartOptions;
  };
  variants?: string[];           // feature ids che cambiano la variante
}
```

`ChartObjectNode` è **metadato di UI**, non un nuovo modello dati. Le proprietà restano `ChartOptions`; le funzioni `get/set` riusano `FeatureDescriptor` o piccoli adapter.

### Approccio ibrido: sezioni prima, oggetti solo dove servono

Non serve un builder di oggetti per tutti i 22 kind. `ChartSpecificPanel` già raggruppa le feature per `feature.section` in fieldset (`src/components/charts/ChartSpecificPanel.tsx:27-49`). La via più corta è:

1. **Sezioni collassabili** con chevron e, dove esiste un toggle reale, occhio.
2. **`layout="stacked"`** su `ChartControls` per il pannello.
3. **Nodi oggetto** solo per i kind compositi in cui una sezione contiene più oggetti distinti: boxplot, scatter, survival, bar.
4. Per gli altri kind, le sezioni esistenti bastano: non aggiungere un albero artificiale.

`ChartObjectNode` e `chartObjects()` restano utili, ma solo per i kind pilota. Il resto usa `ChartSpecificPanel` esteso.

### Visibilità vs variante

L’occhio non deve confondersi con il cambio di variante:

- `fit: none | ols | robust | both` è una **variante**, non una visibilità;
- `band: none | ci | pi` è una variante;
- `error: none | se | ci | sd` è una variante;
- `step` è un’interpolazione, non una visibilità.

Se l’occhio spegne un oggetto mappandolo su `none`, riaccendendolo si perde la variante scelta. Quindi:

- in Fase 1 l’occhio compare solo sugli oggetti che hanno già un vero flag `show*`;
- per fit/band/error bar si aggiungono in Fase 3 flag separati (`showFit`, `showBand`, `showErrorBars`) che preservano la variante;
- l’occhio non compare su “Assi”, “Area”, “Grafico”: sono contenitori di proprietà, non oggetti visibili.

### Esempio: boxplot

```text
Box plot
├─ Visualizzazione: box | notched | violin | raincloud   (variante)
├─ Scatola
├─ Baffi e cappucci         ○  showWhiskers (Fase 3)
├─ Mediana
├─ Etichetta mediana        👁  labelMedian
├─ Outlier                  👁  showOutliers
├─ Punti                    👁  showPoints
└─ Media                    👁  showMean
```

Oggi esistono `display`, `showPoints`, `showOutliers`, `showMean`, `labelMedian` (`src/stats/charts.ts:101-110`). **Non** servono `showBox`, `showMedianLine`, `showViolin`:

- `display: violin` già sceglie il violino; per tornare al box si cambia variante;
- `raincloud` compone violino e box; nascondere solo il violino sarebbe uno stato ambiguo;
- una scatola senza mediana o una mediana senza scatola sono stati statisticamente dubbi.

L’unico flag nuovo ragionevole in questa fase è `showWhiskers` (con i cappucci), perché nascondere i baffi lasciando scatola e outlier è un’opzione grafica sensata. `showViolin`/`showBox` restano fuori dal piano.

### Esempio: scatter

```text
Dati
└─ Dispersione
   ├─ Punti                 👁  showPoints
   ├─ Etichette punti       👁  pointLabels
   ├─ Linea di fit          ○  fit: none|ols|robust|both
   ├─ Banda CI/PI           ○  band: none|ci|pi
   ├─ Ellisse               👁  ellipse
   ├─ Equazione             👁  equation
   ├─ R²                    👁  showR2
   ├─ N                     👁  showN
   └─ Regole orizzontali    👁  rules
```

`fit` e `band` sono **varianti**, non visibilità: l’occhio non li spegne in Fase 1. In Fase 3 si aggiungono `showFit`/`showBand` separati, così riaccendendo l’oggetto si conserva la variante scelta.

### Esempio: survival

```text
Dati
└─ Curve di sopravvivenza
   ├─ Curve
   ├─ Banda IC              👁  showCI
   ├─ Censura               👁  showCensoring
   ├─ Mediane               👁  showMedian
   └─ Step                  ○  step (interpolazione, non visibilità)
```

### Esempio: bar

```text
Dati
└─ Barre
   ├─ Barre
   ├─ Affiancate/impilate   (variante grouping)
   ├─ Barre d’errore        ○  error: none|se|ci|sd
   ├─ Etichette valori      👁  valueLabels
   └─ Linea di riferimento  👁  referenceLine
```

## Mappatura oggetti → feature esistenti

La tabella copre **solo** ciò che serve al property panel. `AxisStyle`, annotazioni, colori arbitrari e export sono l’audit separato e non vanno implementati in questo piano. Gli effort sono ipotesi da validare sul prototipo.

| Oggetto | Feature/opzioni esistenti | Flag necessari per il pannello | Effort |
|---|---|---|---|
| Grafico (titolo, note, tema, palette, size, preset) | `general.*`, `style.size`, `style.palette`, `style.theme` | nessuno (override testo in audit) | S |
| Area del grafico | `theme`, `chartSurfaceBackground` | nessuno (appearance in audit) | S |
| Asse X/Y | `showXTitle`, `showYTitle`, `gridX/Y` | nessuno (AxisStyle in audit) | S |
| Griglia X/Y | `gridX`, `gridY`, `gridOpacity` | nessuno (stile in audit) | S |
| Legenda | `showLegend`, `legendPosition` | nessuno (stile in audit) | S |
| Punti | `showPoints`, `pointShape`, `pointSize`, `pointOpacity` | colore per serie (audit) | S |
| Linea | `lineWidth`, `lineDash`, `step` | colore per serie (audit) | S |
| Marker | `showMarkers` | colore, forma per serie (audit) | S |
| Banda | `showBand`, `band`, `bandLevel`, `bandOpacity` | colore, bordo, pattern (audit) | S |
| Fit | `fit`, `equation`, `showR2`, `showN` | colore/spessore/tratteggio (audit) | S |
| Barre | `grouping`, `error`, `valueLabels`, `sort`, `referenceLine` | fill/bordo/larghezza/gap (audit) | S |
| Box | `display`, `showPoints`, `showOutliers`, `showMean`, `labelMedian` | `showWhiskers` | S |
| Error bar | `error` | cap size (stile, audit) | S |
| Survival | `showCI`, `showCensoring`, `showMedian`, `step` | nessuno | S |
| Forest | `logScale`, `reference`, `sort` | diamond/pesi/colori riga (audit) | M |
| Heatmap/mosaic | `showValues`, `diverging`, `sort`, `residualColor` | scala continua (audit) | M |
| Annotazioni | — | fuori piano (audit) | — |
| Tela/export | `size` | fuori piano (audit) | — |

## Integrazione tecnica

### 1. Modulo `src/charts/objects.ts` solo per i kind pilota

Non modificare `featuresFor` e non costruire un albero per tutti i 22 kind. `ChartSpecificPanel` già raggruppa per `feature.section`; per box/scatter/survival/bar si aggiunge un builder di oggetti che **consuma** le feature esistenti. Per gli altri kind valgono le sezioni esistenti, con chevron e occhio.

### 2. Nuovi componenti (due, non quattro)

- `ChartObjectSection.tsx`: header oggetto con chevron/occhio + proprietà inline; usato sia dalle sezioni esistenti sia dai nodi oggetto.
- `ChartObjectTree.tsx`: solo per i kind pilota compositi (box, scatter, survival, bar).

`ChartControls` resta l’unico renderer dei controlli, con `layout` `inline | stacked`. Non creare un `ChartPropertyControls` separato.

### 3. Riuso di `ChartControls`

`ChartControls` oggi rende checkbox/select/number/range in riga (`src/components/charts/ChartControls.tsx:20-78`). Aggiungere una prop `layout?: 'inline' | 'stacked'`:

- `inline`: toolbar attuale;
- `stacked`: label sopra, controllo largo, valore a destra.

Nessuna duplicazione di logica: stessi `FeatureDescriptor`.

### 4. Visibilità

In Fase 1 l’occhio mappa **solo** opzioni che sono già un vero toggle:

| Oggetto | Flag esistente | Renderer |
|---|---|---|
| Punti | `showPoints` | scatter/box |
| Outlier | `showOutliers` | box |
| Media | `showMean` | box |
| Etichetta mediana | `labelMedian` | box |
| Marker | `showMarkers` | line |
| Banda | `showBand` | line |
| IC survival | `showCI` | survival |
| Censura | `showCensoring` | survival |
| Mediane | `showMedian` | survival |
| Legenda | `showLegend` | tutti |
| Griglia | `gridX`/`gridY` | tutti |
| Titoli | `showTitle`/`showXTitle`/`showYTitle` | tutti |

Fit, band e error bar **non** vengono spenti con `none` in Fase 1: perderebbero la variante. I flag separati `showFit`, `showBand`, `showErrorBars` arrivano in Fase 3. `showWhiskers` è l’unico flag nuovo di Fase 3 insieme a `capSize` per le error bar.
| Mediane survival | già `showMedian` | `survivalLayers` |

Regola: un oggetto nascosto non deve lasciare assi o legende vuote; il pannello mostra un avviso “nessun oggetto visibile” se il grafico resta vuoto.

### 5. Varianti

Le varianti restano proprietà dell’oggetto:

- box: `display` (box/notched/violin/raincloud);
- scatter: `fit` (none/ols/robust/both), `band` (none/ci/pi);
- bar: `grouping` (stacked/grouped), `error` (none/se/ci/sd);
- line/survival: `step`;
- histogram: `showDensity`/`showKde`;
- forest: `logScale`, `reference`;
- heatmap: `diverging`.

L’albero non deve creare un nodo per ogni variante: sarebbe un albero di opzioni, non di oggetti.

### 6. Toolbar vs pannello

Consiglio: **una sola autorità per le proprietà**. La toolbar resta:

- undo/redo, export PNG, reset, Done/Cancel;
- preset, tema, palette, dimensione (accesso rapido).

Tutto il resto va nel pannello. Se si tengono gli stessi controlli in entrambi, vanno sincronizzati e testati; il rischio di duplicazione è alto.

### 7. Responsive

Oggi:

- desktop: `lg:grid-cols-[minmax(0,1fr)_340px]`;
- mobile: `<details>` sotto il grafico.

Proposta:

- desktop: `minmax(0,1fr) 380px` (o 400 se il preview lo consente);
- tablet: 340 px;
- mobile: tab “Grafico / Proprietà” o drawer a tutta altezza, non `<details>`;
- il pannello mantiene header sticky e restore dello scroll.

### 8. Stato e undo/redo

- `expanded` è stato UI locale, non `ChartOptions`; non c’è uno stato “selezionato” separato dall’espansione.
- Ogni modifica passa da `applyDraft`; i setter devono restare immutabili, altrimenti la history conserva riferimenti condivisi.
- Reset oggetto = reset di sezione applicato al sottoinsieme di feature, in **una sola** transazione.
- Le scorciatoie Ctrl/Cmd+Z devono essere ignorate quando il focus è in un campo testuale (futuri input testo/annotazioni).
- Reset globale e reset sezione restano; “reset oggetto” non è un terzo comando con semantica diversa.

### 9. Internazionalizzazione

Ogni nuovo `labelKey` oggetto va in **6 cataloghi** (`en`, `it`, `es`, `fr`, `de`, `pt-PT`). Riusare le label delle feature esistenti dove possibile; nuove chiavi solo per i nodi oggetto e per i flag nuovi.

## Rischi e mitigazioni

| Rischio | Gravità | Mitigazione |
|---|---|---|
| Duplicazione toolbar/pannello | Media | Toolbar solo quick bar; rimuovere il `<details>` “More style” in Fase 2 |
| Feature orfane o duplicate nell’albero | Alta | Test: ogni feature assegnata a un solo oggetto; fallback “Altro”; solo 5 kind pilota |
| Albero troppo profondo | Media | Max 3 livelli; varianti come proprietà, non nodi |
| Occhi su oggetti senza toggle reale | Alta | Fase 1 solo flag `show*` esistenti; niente occhio su Assi/Area/Grafico |
| Perdita della variante con l’occhio | Alta | `showFit`/`showBand`/`showErrorBars` separati in Fase 3 |
| Oggetti visibili senza dati | Media | Builder filtra per presenza dati/kind |
| Nascondere tutto lascia grafico vuoto | Media | Avviso e “Mostra tutti” |
| Nuovi flag rompono progetti vecchi | Alta | `normalizeChartDefaults`, `COMMON_KEYS`, test legacy, round-trip worker |
| Pannello 380 px troppo stretto | Media | Validare con traduzioni lunghe e 3 livelli; controlli impilati |
| Accessibilità | Media | `aria-expanded`, `aria-pressed`, tastiera, focus visibile |
| Manutenzione 22 kind | Alta | Solo 5 kind pilota; il resto usa le sezioni esistenti |

## Piano di integrazione

### Fase 1 — Sezioni collassabili + occhio sui 5 kind pilota

- Estendere `ChartSpecificPanel` con sezioni collassabili e occhio, senza cambiare i renderer.
- `ChartObjectSection` per header/chevron/occhio; `ChartObjectTree` solo per box, scatter, survival, bar.
- `ChartControls` con `layout="stacked"`.
- Occhio solo su flag `show*` reali; niente occhio su Assi/Area/Grafico.
- Test: ogni feature assegnata una volta; eye get/set; differenza della spec prima/dopo; undo/redo.

**Effort: S/M.**

### Fase 2 — Pannello autorità e toolbar snella

- Spostare general/style nelle sezioni del pannello (Grafico, Area, Assi, Griglia, Legenda).
- Toolbar: preset/tema/palette/size + undo/redo/export/reset.
- **Rimuovere** il `<details>` “More style” dalla toolbar: altrimenti i controlli restano duplicati.
- Layout 380 px, mobile tab “Grafico / Proprietà” o drawer.

**Effort: M.**

### Fase 3 — Visibilità e varianti

- `showWhiskers` e `capSize` error bar.
- `showFit`, `showBand`, `showErrorBars` separati dalle varianti `fit`/`band`/`error`.
- Reset oggetto come singola transazione.
- Test su box, notched, violin, raincloud, fallback senza punti, fit/band, error bar.

**Effort: S/M.**

### Fase 4 — Estensione agli altri kind

- Migrare gli altri kind solo dopo la validazione dei 5 pilota.
- Per i kind semplici bastano le sezioni esistenti; nessun albero artificiale.
- Annotazioni, colori arbitrari e `AxisStyle` restano nel piano dell’audit, non qui.

**Effort: M.**

## Confronto con il riferimento LibreOffice

LibreOffice usa una sidebar a deck con sezioni collassabili e proprietà che cambiano con la selezione. Non ha un albero di oggetti del grafico, ma il pattern di interazione è lo stesso:

- sezioni con triangolo di espansione;
- proprietà contestuali all’oggetto;
- controlli compatti;
- stato della sidebar persistente.

La proposta aggiunge un **object browser** solo dove serve (box/scatter/survival/bar) e l’**occhio di visibilità** sui toggle reali. È un ibrido coerente, non un’imitazione di LibreOffice.

## Riconciliazione del Concilio

Entrambi i critici hanno dato `APPROVE_WITH_CHANGES`.

| # | Rilievo | Chi | Decisione | Come cambia il documento |
|---|---|---|---|---|
| 1 | Fase 1 promette occhi su oggetti senza toggle reale | Luna | Accettato | Occhio solo su flag `show*` esistenti; niente occhio su Assi/Area/Grafico. |
| 2 | `fit`/`band`/`error` con `none` perdono la variante | Luna | Accettato | Visibilità separata dalle varianti; `showFit`/`showBand`/`showErrorBars` in Fase 3. |
| 3 | Flag box (`showBox`, `showMedianLine`, `showViolin`) ambigui | Luna/GLM | Accettato | Resta solo `showWhiskers`; il violino si governa con `display`. |
| 4 | Undo/reset e input testuali | Luna | Accettato | Setter immutabili, reset in una transazione, scorciatoie ignorate nei campi testo. |
| 5 | Persistenza/default/worker non specificati | Luna | Accettato | Aggiunti `normalizeChartDefaults`, `COMMON_KEYS`, round-trip worker e test legacy. |
| 6 | Test solo su 4-5 kind non basta per 22 | Luna | Accettato | Fase 1 limitata a 5 kind pilota; il resto usa le sezioni esistenti. |
| 7 | 380 px non dimostrati | Luna | Accettato | Larghezza da validare con traduzioni lunghe; nessuna certezza dichiarata. |
| 8 | Albero per tutti i kind è troppo | GLM | Accettato | Approccio ibrido: sezioni prima, oggetti solo per box/scatter/survival/bar. |
| 9 | Quattro componenti nuovi sono troppi | GLM | Accettato | Due componenti: `ChartObjectSection` e `ChartObjectTree`; `ChartControls` con `layout`. |
| 10 | Fase 4 è quasi tutta Fase 1 | GLM | Accettato | Varianti integrate nella mappatura; fase ridotta a flag separati. |
| 11 | Fase 5 è YAGNI | GLM | Accettato | Annotazioni/stili restano nel piano dell’audit, fuori da questo. |
| 12 | Toolbar duplicata | GLM | Accettato | In Fase 2 va rimosso il `<details>` “More style”. |
| 13 | Ricerca/Vai a/localStorage/icone sono YAGNI | GLM | Accettato | Rinviati; l’espansione è l’unico stato UI. |
| 14 | Stime 70-80% ed effort non verificate | Luna | Accettato | Dichiarate come ipotesi da prototipo. |

## Verdetto dei critici

- **Luna**: `APPROVE_WITH_CHANGES` — struttura UI fattibile, ma Fase 1 limitata ai toggle reali e guardrail su varianti, history, reset e persistenza.
- **GLM**: `APPROVE_WITH_CHANGES` — il nocciolo è estendere `ChartSpecificPanel` con sezioni collassabili + occhio + `layout`; l’albero completo per 22 kind è troppo.

## Conclusione

L’integrazione è **fattibile e consigliata**, ma va ridotta al nocciolo:

1. sezioni collassabili con occhio sui 5 kind pilota;
2. `layout` impilato per i controlli;
3. pannello come autorità, toolbar come quick bar;
4. solo `showWhiskers` e i flag di visibilità separati dalle varianti in Fase 3.

Non serve un albero per tutti i 22 kind né un nuovo modello dati. La strada più sicura è validare il prototipo su box, scatter, line, bar e survival, misurare il layout con le traduzioni lunghe, poi estendere.
