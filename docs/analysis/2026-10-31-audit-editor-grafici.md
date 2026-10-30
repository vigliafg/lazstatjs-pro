# Audit dell’editor dei grafici: funzionalità mancanti e confronto con i principali programmi

- **Richiesta**: «audit sulle funzionalità mancanti dell’editor dei grafici. per esempio manca la possibilità di mettere dentro il grafico testi, frecce, box, la possibilità di selezionare colori di background/foreground, modifica di oggetti statistici (boxplot, linee di regressione, simboli di punti...) colori e formati degli assi, delle griglie... documentati su come funzionano altri grandi programmi di statistica»
- **Perimetro**: editor del singolo grafico (`ChartEditorDialog`, toolbar generale, pannello specifico, registro `features`, opzioni `ChartOptions`, renderer Vega-Lite, tema, export PNG). Fuori perimetro: scelta dei grafici prodotta dal run, tabelle, report testuale, export HTML/Word.
- **Data e revisione del codice**: 2026-10-31, commit `39fd742`.
- **Stato**: analisi, nessuna modifica al codice.

## Sintesi esecutiva

L’editor è solido sul **che cosa mostrare** (oggetti statistici, layer, bande, etichette, ordinamento) e debole sul **come farlo sembrare una figura pubblicabile**. Manca soprattutto:

1. **annotazioni libere**: testo, frecce, linee, rettangoli/ellissi, callout;
2. **colori per oggetto**: serie, barre, box, mediana, baffi, outlier, linea di regressione, riferimenti, tick di censura;
3. **colori di sfondo/foreground** e bordi del pannello, indipendenti dal tema;
4. **formattazione di assi e griglie**: formati numerici, limiti, break, log su ogni asse, font, colori, spessore, griglia minore;
5. **testi modificabili**: titolo, sottotitolo, note, etichette degli assi e legenda (oggi solo mostra/nascondi);
6. **dimensione e composizione**: larghezza/altezza, margini, DPI, pannelli multipli/facet, export vector;
7. **template salvabili** per procedura o progetto.

Rispetto a SPSS, Stata, SAS, Minitab e Prism, lazstatjs è più vicino a **JASP/jamovi**: opzioni guidate e riproducibili, non un editor grafico diretto. Il salto di qualità non richiede un rewrite: richiede un modello di stile/annotazioni sopra `ChartOptions` e due nuovi tipi di controllo (`text`, `color`).

## Cosa c’è oggi

### Controlli generali

Da `src/charts/features.ts:115-153` e `src/stats/charts.ts:46-68`:

- preset `default | minimal | print`;
- tema `dark | light`;
- griglia X/Y on/off e opacità unica;
- palette `default | colorblind | mono`;
- legenda mostra/nascondi e posizione `bottom | right`;
- titolo, sottotitolo, nota, titoli degli assi: solo mostra/nascondi;
- zero baseline e tooltip;
- dimensione `compact | regular | wide`.

### Stile

Da `src/charts/features.ts:155-203`:

- forma punto: cerchio, quadrato, diamante, triangolo;
- dimensione e opacità dei punti;
- spessore e tratteggio della linea: impostazione globale, ma diversi layer usano valori fissi nel renderer.

Non esistono controlli per **colore arbitrario, font, testo o formattazione numerica**: `FeatureType` è solo `checkbox | select | number | range` (`src/charts/features.ts:11`). Palette e tema sono controlli colore, ma solo predefiniti.

### Controlli specifici per tipo

Il registro copre bene gli oggetti statistici:

- scatter: punti, fit OLS/robust, banda CI/PI, livello, opacità banda, equazione, R², N, etichette, ellisse;
- line: step, marker, banda;
- bar: raggruppamento, errore SE/CI/SD, etichette, ordinamento, linea di riferimento;
- box: display box/notched/violin/raincloud, punti, outlier, media, etichetta mediana, ordinamento;
- interval/dot/ecdf: etichette, media, mediana, ordinamento;
- histogram: bin, densità normale, KDE, rug, linea media;
- qq: riferimento, banda, detrendizzato;
- forest: scala log, riferimento, ordinamento;
- survival: IC, censura, mediana, step;
- mosaic/heatmap/risk/acf/scree/score/bland/power/bootstrap/missingness/residual: opzioni semantiche specifiche.

Esistono già **annotazioni automatiche**: etichette di punti, equazione/R²/N, p log-rank nella survival, valori nelle heatmap. Non esiste però un’annotazione **libera e modificabile** dall’utente.

### Editor

Da `src/components/charts/ChartEditorDialog.tsx`:

- anteprima live con debounce;
- undo/redo fino a 60 stati;
- reset globale e reset della sezione;
- export PNG del pannello;
- focus trap, Escape, conferma su modifiche non salvate;
- layout desktop/mobile.

## Cosa manca

### A. Annotazioni

| Funzione | Stato | Note |
|---|---|---|
| Testo libero nel grafico | ❌ | Non esiste un’opzione né un layer di annotazione. |
| Frecce | ❌ | Nessun modello dati, nessun renderer. |
| Linee libere | ⚠️ | Solo reference line orizzontali in alcuni kind. |
| Rettangoli/ellissi/box | ❌ | Nessun shape libero. |
| Etichette su punti specifici | ⚠️ | `pointLabels` automatiche e `chart.data.labels`; non c’è testo libero editabile. |
| Bande/regioni colorate | ⚠️ | Solo TOST (`regions` in `barLayers`). |
| Immagini/logo | ❌ | — |
| Ordine z / porta avanti-indietro | ❌ | — |

### B. Colori

| Funzione | Stato | Note |
|---|---|---|
| Sfondo del grafico | ⚠️ | Derivato dal tema, non modificabile. |
| Sfondo del pannello/plot area | ❌ | Un solo `background` in `themeFor`. |
| Bordo del pannello | ❌ | — |
| Colore per serie | ❌ | Solo palette globale (`colorAt`). |
| Colore barre/box/mediana/baffi/outlier | ❌ | Hardcoded da palette/tema. |
| Colore linea di regressione/banda | ⚠️ | Indice palette fisso, non editabile. |
| Colore reference line/error bar/censoring | ❌ | Hardcoded. |
| Colore testo/titoli/assi/tick | ❌ | Derivato dal tema. |
| Colore griglia | ❌ | Derivato dal tema; solo opacità. |
| Trasparenza per oggetto | ⚠️ | Solo punto e banda. |
| Scala colore continua (heatmap/mosaic) | ❌ | Solo palette discreta/diverging; niente gradiente, midpoint o range. |
| Reference line arbitraria con valore/etichetta | ⚠️ | Solo zero/uno in bar; per forest reference 0/1. |

### C. Oggetti statistici

| Funzione | Stato | Note |
|---|---|---|
| Box: fill, bordo, spessore, median line, whisker, caps, outlier | ❌ | Stili fissi nel renderer. |
| Punti: forma/colore per serie | ⚠️ | Forma globale; colore da palette. |
| Linea di regressione: colore, spessore, tratteggio separati | ❌ | Condivide `lineWidth`/`lineDash`. |
| Banda CI/PI: colore, pattern, bordo | ⚠️ | Solo opacità. |
| Barre: fill, bordo, larghezza, gap | ⚠️ | Solo grouping; niente stile. |
| Error bar: colore, spessore, cap size | ❌ | Hardcoded. |
| Survival: censor tick, mediane, CI | ⚠️ | Solo mostra/nascondi. |
| Forest: diamond, pesi, colori per riga | ❌ | — |

### D. Assi e griglie

| Funzione | Stato | Note |
|---|---|---|
| Titolo asse editabile | ❌ | Solo `showXTitle`/`showYTitle`. |
| Font family/size/weight/color | ❌ | Hardcoded in `axis()` (`encoding.ts:47-61`). |
| Formato numerico (decimale, %, data, migliaia) | ❌ | — |
| Limiti min/max | ❌ | — |
| Break/tick count e rotazione etichette | ❌ | — |
| Scala log su assi arbitrari | ⚠️ | Solo forest. |
| Asse secondario | ❌ | — |
| Griglia maggiore/minore, colore, spessore, tratteggio | ⚠️ | Solo on/off + opacità. |
| Griglia sopra/sotto i dati | ❌ | — |
| Linea asse/domain/tick color e size | ❌ | Hardcoded. |

### E. Legenda e testi

| Funzione | Stato | Note |
|---|---|---|
| Titolo legenda editabile | ❌ | Deriva da `chart.fields.series`. |
| Etichette serie editabili | ❌ | — |
| Ordine e selezione voci | ❌ | — |
| Font/colore/dimensione legenda | ❌ | Hardcoded 9px. |
| Posizione libera | ⚠️ | Solo bottom/right. |
| Titolo/sottotitolo/note editabili | ❌ | Solo mostra/nascondi. |
| Allineamento/posizione titolo | ❌ | — |
| Caption/tag/footer | ⚠️ | `note` esiste, non editabile. |

### F. Tela, composizione, export

| Funzione | Stato | Note |
|---|---|---|
| Larghezza/altezza numeriche | ⚠️ | Solo 3 preset (`SIZE_OPTIONS`, `defaults.ts:259-266`). |
| Margini/padding | ❌ | — |
| DPI/risoluzione export | ❌ | Export PNG a dimensione DOM. |
| SVG/PDF vettoriale | ❌ | Solo PNG/HTML/Word. |
| Pannelli multipli/facet | ❌ | — |
| Grafici affiancati/inset | ❌ | — |
| Template per procedura/progetto | ⚠️ | Solo `chartDefaults` globale. |
| Alt text/accessibilità | ❌ | — |

## Confronto con i grandi programmi

Legenda: ✅ supportato in modo diretto; ⚠️ parziale o solo via opzioni/codice; ❌ assente o non documentato.

| Capacità | lazstatjs | SPSS | Stata | SAS | Minitab | Prism | ggplot2 | JASP/jamovi |
|---|---|---|---|---|---|---|---|---|
| Testo libero | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Frecce | ❌ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ❌ |
| Rettangoli/ellissi | ❌ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Reference line | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Colore per oggetto | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Sfondo/plot area | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Formato assi/limiti/break | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Griglia minore/stile | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Legenda editabile | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Template salvabili | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Editing diretto (drag/select) | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Facet/pannelli | ❌ | ⚠️ | ⚠️ | ✅ | ⚠️ | ⚠️ | ✅ | ⚠️ |
| Riproducibilità da codice | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | ⚠️ |

### SPSS Statistics — Chart Editor

L’editor SPSS è un editor grafico completo: si selezionano gli oggetti sul canvas, si modificano le proprietà (testo, linee, riempimenti, assi, legenda), si aggiungono titoli, note, reference line e annotazioni. La documentazione ufficiale descrive le reference line con equation, proprietà e stile linea; la guida introduttiva documenta l’aggiunta di titoli e footnote dal Chart Builder. È il modello “property panel + canvas” più vicino a ciò che manca a lazstatjs.

### Stata — Graph Editor

Stata documenta esplicitamente:

- Add Text Tool, Add Line Tool (anche frecce), Add Marker Tool;
- modifica di titoli, caption, note, griglie, reference line;
- cambio del tipo di grafico (scatter → line/area/bar e viceversa);
- modifica di qualsiasi oggetto con doppio clic: colore, dimensione, allineamento;
- Object Browser, contextual menu, Graph Recorder per riapplicare le modifiche.

È il riferimento più chiaro per annotazioni libere e modifica diretta degli oggetti.

### SAS — ODS Graphics Editor

La guida ODS Graphics Editor documenta:

- modifica delle proprietà globali (stile, dimensione, risoluzione);
- titoli/footnote, legenda, sfondo del plot, marker, font;
- annotazioni con testo, forme, linee, frecce e immagini;
- salvataggio come template.

SAS è il riferimento per “annotazioni + proprietà globali + template”.

### Minitab — Edit Graph

Minitab documenta:

- Edit Graph dialog con selezione dell’oggetto e proprietà;
- annotazioni con testo, rettangoli/quadrati, cerchi/ellissi, marker;
- reference line con label e stile;
- modifica di fill, font e linee;
- Data Display per aggiungere/togliere barre, simboli, linee;
- temi e opzioni globali.

È il riferimento più vicino a un utente non programmatore.

### GraphPad Prism — Format Graph

Prism documenta:

- aggiunta di testo, linee, frecce, rettangoli, ovali, immagini e tabelle;
- Format Object per spessore, colore, stile, riempimento, frecce;
- Format Graph per dataset, con applicazione globale;
- Format Axis per limiti, tick, font, distanza etichette;
- secondo asse Y e ordinamento dei dataset.

È il riferimento per la figura “pubblicabile” e per la coerenza tra grafici.

### R — ggplot2

ggplot2 è il riferimento concettuale:

- annotazioni con `geom_text`, `geom_label`, `geom_rect`, `geom_segment`, `arrow`;
- scale per limiti, break, label, transformazioni log;
- `theme()` per sfondo, griglia, font, assi, legenda;
- `facet_wrap`/`facet_grid` per pannelli;
- guide per legenda.

Non è un editor diretto: è il massimo della flessibilità, ma richiede codice. lazstatjs dovrebbe prendere il modello di opzioni, non l’interazione.

### JASP e jamovi

Sono GUI statistiche basate su ggplot2, con opzioni esposte nei pannelli di analisi e personalizzazione limitata rispetto a SPSS/Stata. jamovi documenta l’integrazione ggplot2 nei moduli e i temi; la comunità segnala storicamente limiti sull’editing fine degli assi. JASP documenta l’editing di plot e formule, ma non è un editor grafico general-purpose. Sono il riferimento per “opzioni guidate e riproducibili”, non per annotazioni libere.

## Architettura proposta

### 1. Nuovo modello di stile

Non aggiungere decine di chiavi piatte a `CommonChartOptions`. Introdurre:

```ts
interface ChartAppearance {
  background?: string;
  panel?: string;
  border?: string;
  text?: string;
  muted?: string;
  fontFamily?: string;
  axis?: { x?: AxisStyle; y?: AxisStyle };
  grid?: GridStyle;
}
interface AxisStyle {
  title?: string;
  format?: string;        // '.1f', '.0%', '~s', 'yyyy'
  min?: number; max?: number;
  log?: boolean;
  ticks?: number;
  labelAngle?: number;
  color?: string; size?: number;
  grid?: boolean;
}
interface ObjectStyles {
  series?: Record<string, string>; // colore per nome serie, non per indice
  bar?: FillStyle;
  box?: BoxStyle;
  fit?: LineStyle;
  reference?: LineStyle;
  errorBar?: LineStyle;
  censor?: MarkerStyle;
}
```

`ChartOptions` resta discriminato per kind; `appearance` e `objectStyles` sono comuni. Precedenza esplicita: **override utente > palette scelta > tema**. I preset `print`/`mono` devono continuare a garantire leggibilità; l’editor mostra un avviso di contrasto quando testo/sfondo o serie/sfondo sono troppo vicini. I colori delle serie vanno salvati per **nome serie**, non per indice: l’ordine delle righe non deve cambiare l’assegnazione.

Titolo, sottotitolo, nota, titoli degli assi e titolo legenda oggi vivono su `AnalysisChart`, non su `ChartOptions` (`src/stats/charts.ts:258-273`). Per renderli editabili servono override espliciti nelle opzioni (`titleOverride`, `subtitleOverride`, `noteOverride`, `xTitleOverride`, `yTitleOverride`, `legendTitleOverride`) letti da `titleFor`/`axis`/`colorEncoding`; in alternativa va ampliato il contratto di modifica della card. La scelta va fatta prima di implementare, altrimenti il testo si perde al salvataggio perché `onUpdateChart` aggiorna solo `chart.options` (`src/hooks/useOutputConsole.tsx:155-172`).

### 2. Annotazioni

```ts
type ChartAnnotation =
  | { type: 'text'; x: number | string; y: number; text: string; color?: string; size?: number; align?: 'left'|'center'|'right'; space?: 'data'|'pixel' }
  | { type: 'line'; x: number; y: number; x2: number; y2: number; color?: string; width?: number; dash?: 'solid'|'dashed'|'dotted'; arrow?: boolean; space?: 'data'|'pixel' }
  | { type: 'rect'; x: number; y: number; x2: number; y2: number; fill?: string; opacity?: number; border?: string; space?: 'data'|'pixel' };
```

Le annotazioni stanno in `chart.options.annotations` (o in `chart.data.annotations` se devono essere serializzate con il run). Un layer comune `annotationLayers(chart, options)` viene aggiunto da `buildSpec` a tutti i kind. Per le frecce: linea + triangolo all’estremo, oppure un mark Vega dedicato; la prima soluzione è compatibile con Vega-Lite, la seconda è più precisa.

**Attenzione alle coordinate**: un solo layer con `x`/`y` numerici non funziona per assi nominali, boxplot con categorie convertite in indici, mosaic e survival. Servono:
- coordinata in **spazio dati** (numerico o categoria) per scatter/line/bar;
- coordinata in **pixel/normalizzata** per boxplot, mosaic, heatmap e annotazioni “a margine”;
- un adattatore per kind che risolva la scala e l’ancoraggio, con test dedicati almeno a bar nominale, boxplot, mosaic e survival.

Prima di generalizzare, riusare i pattern esistenti: `chart.data.labels` e `references`/`rules` già producono layer di testo e linee (`src/charts/vega/layers.ts:72-98`). `annotationLayers` deve aggregare quel formato, non inventarne uno parallelo.

### 3. Nuovi tipi di controllo

`FeatureType` deve crescere di **due** soli tipi:

- `text` per titolo, etichette, annotazioni;
- `color` per sfondo, serie, oggetti.

`number` e `select` esistono già (`src/charts/features.ts:11`). Attenzione: `FeatureDescriptor` legge e scrive un valore scalare, mentre `ChartControls` tratta ogni tipo diverso da checkbox/select come range numerico (`src/components/charts/ChartControls.tsx:23-78`). Per questo annotazioni e stili annidati non vanno schiacciati nel registro scalare: servono componenti dedicati (lista annotazioni, editor oggetti) che producano `ChartOptions` e restino dentro undo/redo/reset.

### 4. Assi e griglie

`axis()` in `src/charts/vega/encoding.ts:41-61` deve accettare uno `AxisStyle` per asse. Oggi font, colori e tick size sono costanti. Aggiungere:

- `format`, `tickCount`, `labelAngle`, `labelLimit`;
- `scale: { domain, type: 'log' }`;
- `grid` separato per maggiore/minore;
- `domainColor`, `tickColor`, `tickSize`, `labelColor`.

### 5. Template e default

`chartDefaults` è già globale e viene applicato dal builder, anche nel worker (`src/charts/defaults.ts:40-48,224-233`; `src/analyses/worker/heavy.worker.ts:42`). Non serve un sistema nuovo: estendere il tipo a:

```ts
interface ChartDefaults {
  common?: Partial<CommonChartOptions>;
  byKind?: Partial<Record<ChartKind, Partial<ChartOptions>>>;
  byAnalysis?: Record<string, Partial<ChartOptions>>;
}
```

Con “Salva come default per questa procedura” nell’editor e normalizzazione dei progetti vecchi. Il lavoro è **estendere** l’editor dei default esistente, non costruirlo.

### 6. Export

- SVG: il renderer è già SVG (`VegaChart.tsx:39`) e l’export PNG clona il DOM SVG; il download SVG è quasi gratuito.
- PNG: fattore di scala configurabile in `chartExport.ts` (oggi 2×); “DPI” va definito rispetto ai pixel SVG, non come nuova pipeline.
- PDF puro con embedding font: dipendenza nuova, P2.
- Dimensioni esplicite, margini e test di regressione sui file generati.
- Sfondo personalizzato: spec, contenitore e export PNG devono leggere lo **stesso** colore risolto, altrimenti il PNG esce con uno sfondo diverso dall’anteprima.

### 7. Persistenza e compatibilità

Le nuove opzioni annidate non entrano automaticamente nei default né nella validazione:

- `mergeOptions` fa un merge superficiale (`src/charts/defaults.ts:224-233`);
- `COMMON_KEYS`/`commonOptionsOf` hanno elenchi espliciti (`src/charts/defaults.ts:52-82,85-126`);
- `normalizeChartDefaults` va esteso;
- le annotazioni devono essere dati puri serializzabili, compatibili con il worker (`heavy.worker.ts:42`) e con il limite del modello chart (`MAX_CHART_MODEL_CHARS`, `src/charts/schema.ts:117-147`).

Servono test di caricamento di un progetto legacy, round-trip dei default e un limite al numero/dimensione delle annotazioni.

### 8. Costo i18n

Ogni nuova etichetta `chart.*` va aggiunta in **6 cataloghi** (`en`, `it`, `es`, `fr`, `de`, `pt-PT`). Il piano deve contare questo costo: riusare le etichette esistenti dove possibile e introdurre nuove chiavi solo per i controlli P0/P1 realmente visibili.

## Backlog prioritizzato

### P0 — figura pubblicabile di base

1. **Colori di base e per serie**, salvati per nome serie: barre, box, fit, reference, error bar, censoring. Prima un choke point `colorOverrides` in `colorAt` (`theme.ts:60-63`), non un `ObjectStyles` completo.
2. **Sfondo/plot area/bordo** con precedenza override > palette > tema e avviso di contrasto.
3. **Testi editabili**: titolo, sottotitolo, note, titoli assi, titolo legenda, con override persistiti.
4. **Assi**: formato numerico, limiti, tick e label angle; niente log universale in P0.
5. **Annotazioni testo + reference line/band** con coordinate e adattatori per kind.
6. **Griglia**: colore e visibilità; tratteggio/minore in P1.

### P1 — controllo esperto

7. **Frecce, rettangoli, ellissi** (freccia = flag su linea, non tipo separato).
8. **Stile fine per oggetto statistico**: box/whisker/median/outlier, fit line separata, error bar caps, point symbol per serie.
9. **Legenda**: etichette, ordine, font, posizione.
10. **Griglia completa**: spessore, tratteggio, minore, sopra/sotto i dati.
11. **Scala log su assi arbitrari** con gestione di zero/negativi.
12. **Canvas**: larghezza/altezza, margini, DPI.
13. **Template per procedura/progetto**: estensione dei default esistenti.
14. **SVG download**; PDF in P2.
15. **Alt text/descrizione accessibile** almeno per i grafici esportati.

### P2 — editor grafico completo

16. Editing diretto sul canvas (drag, select, resize).
17. Pannelli multipli/facet/inset.
18. Asse secondario.
19. Immagini/logo.
20. Linked brushing/zoom.
21. PDF con embedding font.

## Cosa non fare

- Non trasformare l’editor in un editor grafico libero: la riproducibilità del run è un valore.
- Non aggiungere un’opzione per ogni pixel: il modello di stile deve essere semantico (serie, box, fit, reference), non “colore del mark 3”.
- Non duplicare le stesse opzioni in generale e specifico: gli oggetti statistici vanno nel pannello specifico, l’aspetto globale in quello generale.
- Non rompere i progetti salvati: normalizzare le nuove opzioni in `normalizeChartDefaults`, `COMMON_KEYS`/`commonOptionsOf` e `mergeOptions`, con test di caricamento legacy.

## Riconciliazione del Concilio

Entrambi i critici hanno dato `APPROVE_WITH_CHANGES`.

| # | Rilievo | Chi | Decisione | Come cambia il report |
|---|---|---|---|---|
| 1 | Descrizioni troppo assolute su annotazioni/colori | Luna | Accettato | Precisato che esistono annotazioni automatiche e palette predefinite, non controlli liberi. |
| 2 | `FeatureType` scalar-only non basta per liste/oggetti annidati | Luna | Accettato | Aggiunto che servono componenti dedicati per annotazioni e stili, oltre a `text`/`color`. |
| 3 | Non è definito dove persistono titolo/note/etichette | Luna | Accettato | Aggiunti override espliciti in `ChartOptions` o ampliamento del contratto di modifica. |
| 4 | Un solo layer di annotazioni non copre assi nominali/boxplot/mosaic/survival | Luna | Accettato | Aggiunte coordinate in spazio dati/pixel e adattatori per kind. |
| 5 | Persistenza più complessa di `mergeOptions` | Luna/GLM | Accettato | Aggiunti `normalizeChartDefaults`, `COMMON_KEYS`/`commonOptionsOf`, cap modello e test legacy. |
| 6 | Mancano scale colore continue e reference line arbitrarie | Luna | Accettato | Aggiunte al gap e al P0/P1. |
| 7 | Colori serie per indice fragili | Luna | Accettato | `seriesColors` per nome serie, non per indice. |
| 8 | P0 sovraccarico | Luna/GLM | Accettato | P0 ridotto; log universale, stile fine e griglia completa spostati in P1. |
| 9 | Sfondo/export possono divergere; DPI non banale | Luna | Accettato | Aggiunta sincronizzazione spec/contenitore/export e chiarimento DPI. |
| 10 | Template per procedura esistono già in gran parte | GLM | Accettato | Riformulato come estensione di `ChartDefaults`, non nuovo sistema. |
| 11 | Export SVG quasi gratis | GLM | Accettato | Spostato a P1 basso; PDF a P2. |
| 12 | Costo i18n ×6 ignorato | GLM | Accettato | Aggiunta sezione dedicata. |
| 13 | Vincolo worker/cap modello non citato | GLM | Accettato | Aggiunto in persistenza. |
| 14 | Precedenza override/palette/tema indefinita | GLM | Accettato | Definito override > palette > tema + avviso contrasto. |
| 15 | `number` è già un FeatureType | GLM | Accettato | Corretto: si aggiungono solo `text` e `color`. |
| 16 | `arrow` come variante separata è YAGNI | GLM | Accettato | Unito a `line` con flag `arrow`. |
| 17 | Canale `chart.data.labels` già esistente | GLM | Accettato | Aggiunto il riuso dei pattern label/rules. |
| 18 | Alt text in P2 troppo tardi | Luna | Accettato | Spostato a P1. |

## Verdetto dei critici

- **Luna**: `APPROVE_WITH_CHANGES` — direzione valida, ma servono precisione su annotazioni/colori esistenti, persistenza dei testi, coordinate per kind e confini del P0.
- **GLM**: `APPROVE_WITH_CHANGES` — inventario accurato, ma ridurre l’architettura al choke point `colorAt`, estendere i default esistenti, contare i18n/worker/themeFor e non introdurre `ObjectStyles` completo in P0.

## Fonti consultate

- IBM SPSS Statistics, Chart Editor / Reference Lines: <https://www.ibm.com/docs/en/spss-statistics/32.0.0?topic=chart-reference-lines>; Brief Guide con aggiunta titoli/footnote: <https://public.dhe.ibm.com/software/analytics/spss/documentation/statistics/24.0/en/client/Manuals/IBM_SPSS_Statistics_Brief_Guide.pdf>
- Stata, Graph Editor: <https://www.stata.com/manuals/g-1grapheditor.pdf>, <https://www.stata.com/manuals/gsw15.pdf>, <https://www.stata.com/features/overview/graph-editor>
- SAS, ODS Graphics Editor: <https://documentation.sas.com/api/docsets/grstateditug/9.4/content/grstateditug.pdf>; panoramica: <http://www2.sas.com/proceedings/forum2008/235-2008.pdf>
- Minitab, Edit graphs: <https://support.minitab.com/en-us/minitab/help-and-how-to/graphs/general-graph-options/graph-editing-basics/edit-graphs>; Annotation shapes: <https://support.minitab.com/en-us/minitab/help-and-how-to/graphs/general-graph-options/labels-lines-and-annotations/annotation-shapes-text-and-markers>; Reference lines: <https://support.minitab.com/en-us/minitab/help-and-how-to/graphs/general-graph-options/labels-lines-and-annotations/reference-lines>; Attributes: <https://support.minitab.com/en-us/minitab/help-and-how-to/graphs/general-graph-options/graph-editing-basics/edit-attributes-for-fills-fonts-and-lines>
- GraphPad Prism, Adding text: <https://www.graphpad.com/guides/prism/latest/user-guide/selecting_text.htm>; Drawing lines, arrows and shapes: <https://www.graphpad.com/guides/prism/latest/user-guide/drawing_lines_arrows_and_shapes.htm>; Format Graph XY: <https://www.graphpad.com/guides/prism/latest/user-guide/using_format_graph_xy.htm>
- ggplot2, Annotations: <https://ggplot2-book.org/annotations>; reference: <https://ggplot2.tidyverse.org/reference/>
- jamovi, Adding plots/ggplot2: <https://docs.jamovi.org/_pages/tut_0107-adding-plots.html>; plot themes: <https://dev.jamovi.org/tutorial/tuts0302-plot-themes>
- JASP, sito e documentazione: <https://jasp-stats.org/>

## Aree non verificate

- Versione esatta e disponibilità effettiva di ogni funzione nelle edizioni correnti dei programmi commerciali: il confronto è per capacità documentate, non per audit pixel-per-pixel.
- Supporto JASP/jamovi all’annotazione libera: la documentazione pubblica non lo descrive come editor grafico general-purpose; la voce è marcata ⚠️/❌ per prudenza.
- Fattibilità delle frecce in Vega-Lite puro: richiede una prova tecnica (linea + triangolo o mark custom) prima di stimare il passo.
