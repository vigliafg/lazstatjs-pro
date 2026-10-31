# Piano di implementazione — Editor delle annotazioni del grafico

- **Richiesta**: «molto bene create il piano di implementazione dettagliato»
- **Obiettivo**: aggiungere annotazioni libere (testo, linea, freccia, rettangolo) ai grafici, con un secondo editor collegato bidirezionalmente al property panel, persistenza nel progetto ed export.
- **Criteri di successo**:
  1. aggiungere/spostare/ridimensionare/eliminare un’annotazione dal secondo editor;
  2. vedere la stessa modifica nel property panel e viceversa;
  3. annullare con un solo undo/redo, una transazione per gesto;
  4. riaprire il progetto e ritrovare le annotazioni;
  5. esportare PNG/SVG con le annotazioni;
  6. nessuna regressione sui grafici senza annotazioni.
- **Non-obiettivi v1**: coordinate ancorate ai dati (`space: 'data'`), disegno a mano libera, immagini, collaborazione, whiteboard infinito, rotazione, gruppi, testo ricco, template di annotazioni, editing multi-utente.
- **Assunzioni**: il secondo editor è una **modalità dello stesso `ChartEditorDialog`**, non una finestra separata; usa lo stesso draft e lo stesso undo. Le annotazioni v1 usano solo coordinate normalizzate `plot` (0-1).

## Vincoli dal repository

- L’editor vive in `ChartEditorDialog` con fascia destra a 380 px; su mobile tab Grafico/Proprietà (`src/components/charts/ChartEditorDialog.tsx:47-300`).
- Il property panel è a oggetti, con sezioni collassabili, occhio e reset (`src/components/charts/ChartObjectPanel.tsx`, `src/charts/objects.ts`).
- `ChartOptions` è serializzato nel progetto e attraversa il worker; le opzioni comuni stanno in `src/stats/charts.ts:46-68`.
- `mergeOptions` fa merge superficiale e preserva le chiavi presenti in `options` (`src/charts/defaults.ts:224-237`). Una lista per-card non deve entrare nei default globali.
- Il modello chart ha un limite di caratteri (`MAX_CHART_MODEL_CHARS`, `src/charts/schema.ts:117-147`): superarlo fa scartare il chart intero, non solo le annotazioni.
- `VegaChart` monta Vega con renderer SVG e non espone la `view` (`src/components/charts/VegaChart.tsx:20-82`).
- `chartExport` clona **l’intero SVG Vega** (`src/io/chartExport.ts:37-90`): tutto ciò che sta dentro l’SVG viene esportato gratis; un overlay esterno no.

## Stato attuale

- Non esiste `ChartAnnotation`.
- Non esiste un layer di annotazioni.
- Il property panel ha solo il gruppo “Annotazioni” previsto nel mockup, non implementato.
- L’export PNG conosce solo l’SVG Vega.
- Il chart editor ha già preview live, undo/redo, reset, export PNG (`ChartEditorDialog.tsx:54-171`).

## Decisione architetturale

**Editor custom domain-specific**, non Excalidraw.

Tre livelli:

1. **Modello**: `ChartAnnotation[]` per-card in `ChartOptions`.
2. **Rendering statico**: annotazioni disegnate **dentro lo stesso SVG Vega**, così preview, PNG, SVG e report usano lo stesso contenuto senza composizione.
3. **Editing**: un overlay di **handle** sopra il grafico, escluso dall’export; le annotazioni vere restano nell’SVG.

Il secondo editor è una **modalità dello stesso dialog**:

- desktop: il canvas resta a sinistra, il property panel a destra mostra la lista annotazioni;
- mobile: terzo tab “Annotazioni” accanto a Grafico/Proprietà;
- stesso `draft`, stesso `applyDraft`, stessa history: nessun secondo undo.

Excalidraw resta fuori da questo piano.

### Coordinate

- Solo `space: 'plot'` in v1: `x` e `y` normalizzati 0-1 rispetto all’area del grafico. Resiste al resize e al cambio di dimensione della card.
- `space: 'data'` (ancoraggio ai valori) è esplicitamente **v2**: richiede adapter per scale nominali/quantitative, gestione annotazioni orfane e riproiezione al cambio dati. Non entra in questo piano.
- La mappatura plot→pixel usa la `view` Vega (`view.width()`, `view.height()`, `view.origin()`) o, se instabile, il bounding box del gruppo plot nell’SVG. È il primo sub-task tecnico.

### Rendering ed export

- **Statico**: un `<g>` di annotazioni viene appeso all’SVG Vega dopo il render; `chartExport` lo clona già.
- **Editing**: un overlay HTML/SVG separato disegna solo selezione, handles e hit-area; ha `data-no-export` e non finisce nel PNG.
- **Report HTML/Word**: verificare che usino lo stesso SVG; se non lo fanno, riusare lo stesso gruppo statico, non un’immagine del canvas.
- Nessuna modifica a `chartExport` per comporre due SVG: è lavoro evitabile.

## Modello dati

```ts
type AnnotationType = 'text' | 'line' | 'arrow' | 'rect';

interface ChartAnnotation {
  id: string;
  type: AnnotationType;
  /** Coordinate normalizzate 0-1 nell'area del grafico. */
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  text?: string;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  fontSize?: number;
  hidden?: boolean;
}
```

Regole:

- massimo **20 annotazioni** per grafico;
- testo massimo **200 caratteri**;
- `plot` clampato a `[0,1]`;
- colori validati (`#rgb`, `#rrggbb`, `rgb()`, nome semplice);
- z-order = ordine dell’array (niente campo `z`);
- niente `locked` in v1;
- budget serializzato complessivo (es. 20 KB) per non superare `MAX_CHART_MODEL_CHARS`; in caso di eccesso si scartano/limitano le annotazioni, mai il chart.

`annotations` è **opzionale e per-card**: non va in `factoryOptions`, `ChartDefaults`, `COMMON_KEYS` o nel payload dei default globali. `mergeOptions` la preserva già; `parseChartModel` la sanifica.

## Passi

### 1. Modello, sanificazione, persistenza (S)

**File**: `src/stats/charts.ts`, `src/charts/annotations.ts`, `src/charts/schema.ts`, `src/io/project/parse.ts`.

- `ChartAnnotation` + `normalizeAnnotations` (limiti, clamp, colori, id, ordine).
- `annotations?: ChartAnnotation[]` nelle opzioni comuni per-card.
- Sanificazione in `parseChartModel`/`mergeOptions`; test legacy senza campo.
- Budget totale e test con annotazioni grandi.
- Nessun intervento su `HEAVY_WORKER`/default globali.

**Verifica**: round-trip progetto, worker, riapertura, budget, valori invalidi.

### 2. Rendering statico dentro l’SVG Vega (M)

**File**: `src/components/charts/VegaChart.tsx`, `src/charts/annotations.ts`, `src/components/charts/AnnotationLayer.ts`.

- Esporre la view Vega con `onViewReady(view)` (o equivalente) da `VegaChart`.
- Calcolare l’area plot: `view.width()/height()/origin()`; fallback al bounding box del gruppo plot.
- Appendere un `<g>` con testo, linea, freccia (linea + triangolo), rettangolo.
- Rispettare `hidden`; niente overlay esterno per il contenuto.
- Verifica: PNG/SVG contengono le annotazioni **senza toccare `chartExport`**.

**Verifica**: screenshot di un testo a `(0.5, 0.5)` e di una freccia; PNG allineato; resize 320→1200 px.

**Rischio alto**: se `view.origin()` non è stabile, usare il bounding box del gruppo plot; lo spike è questo passo.

### 3. Overlay di editing (M)

**File**: `src/components/charts/AnnotationCanvas.tsx`, `src/components/charts/AnnotationToolbar.tsx`.

- Overlay assoluto sopra `VegaChart`, con hit-area e handles; `data-no-export`.
- Seleziona, trascina, ridimensiona (8 handle), nudge con frecce, Delete/Esc.
- Creazione: testo con click, linea/freccia/rettangolo con drag.
- Doppio click sul testo → textarea locale; commit su blur/Enter.
- Durante il drag si aggiorna uno stato locale; si chiama `applyDraft` **una sola volta** al pointer-up. Niente una voce di history per pixel.

**Verifica**: e2e add/drag/resize/delete/nudge; una sola voce di undo per gesto.

### 4. Property panel e bidirezionalità (M)

**File**: `src/charts/objects.ts`, `src/components/charts/ChartObjectPanel.tsx`, `src/components/charts/AnnotationList.tsx`, i18n.

- Gruppo “Annotazioni” nella parte alta del pannello.
- Lista compatta: tipo/testo, occhio, elimina, selezione.
- Proprietà dell’annotazione selezionata: testo, colore, riempimento, spessore, font, coordinate.
- Click sulla lista → selezione nel canvas; click sul canvas → selezione nella lista.
- “Aggiungi testo / freccia / forma” e “Apri editor annotazioni”.
- Stesso `applyDraft`; nessun secondo stato o history.

**Verifica**: modifica dal pannello → canvas; drag sul canvas → campi pannello; undo/redo.

### 5. Verifica, export, accessibilità (S/M)

**File**: `e2e/chart-editor.spec.ts`, `e2e/annotation-editor.spec.ts`, baseline visive, `src/io/chartExport.ts` (solo verifica).

- E2E add/drag/resize/property sync/undo/delete.
- Export PNG/SVG con coordinate note e verifica pixel (non solo “immagine non vuota”).
- Screenshot desktop e mobile con annotazioni.
- Lista accessibile come alternativa al canvas; `aria-label` sulle annotazioni.
- `npm run test:e2e` esplicito: `npm test` non esegue gli e2e.

## Test

### Unit

- normalizzazione: limiti, clamp, colori, id, ordine;
- budget serializzato;
- merge/parse legacy;
- coordinate plot→pixel;
- z-order = ordine array.

### Component/E2E

- aggiungere testo, spostarlo, modificarlo dal pannello;
- aggiungere freccia/rettangolo, resize, z-order;
- una voce di undo per drag/resize;
- Cancel/undo non duplica la history;
- persistenza dopo reload;
- export PNG/SVG con allineamento;
- mobile tab e touch.

### Visual

- `annotation-editor-desktop-linux.png`;
- `annotation-editor-mobile-linux.png`;
- confronto con/senza annotazioni.

## Rischi e mitigazioni

| Rischio | Gravità | Mitigazione |
|---|---|---|
| Mappatura plot → pixel instabile | Alta | spike in passo 2; fallback bounding box plot |
| Export errato | Alta | annotazioni dentro SVG; test pixel |
| Drag con history per pixel | Alta | stato locale + un `applyDraft` al pointer-up |
| Loop canvas ↔ pannello | Alta | stesso modello, id, transazioni, guardia |
| Testi lunghi/IME | Media | textarea locale, commit su blur/Enter |
| Budget modello superato | Alta | cap 20/200, budget 20 KB, test |
| Progetti vecchi | Alta | normalizzazione, test legacy |
| Accessibilità | Media | lista + aria-label |
| Performance 20 annotazioni | Bassa | overlay leggero, memo |

## Alternative scartate

- **Excalidraw**: whiteboard, coordinate pixel, undo separato, export separato. Solo modalità “annota immagine” opzionale.
- **tldraw**: licenza SDK non permissiva.
- **Konva/Fabric**: validi ma più lavoro per testi/selezione e meno integrati con l’SVG Vega.
- **Overlay separato + composizione export**: più codice e più rischi; scartato dopo la revisione.
- **Coordinate data in v1**: rimandate; richiedono adapter per kind e gestione orfane.

## Riconciliazione del Concilio

| # | Rilievo | Chi | Decisione | Come cambia il piano |
|---|---|---|---|---|
| 1 | Export composito due SVG inutile | GLM | Accettato | Annotazioni dentro lo stesso SVG Vega; `chartExport` invariato. |
| 2 | `space:'data'` troppo per v1 | GLM/Luna | Accettato | Solo `space:'plot'`; data coords in v2. |
| 3 | Modello 13 campi troppo | GLM | Accettato | Ridotto a 10 campi; niente `z`/`locked`; cap 20. |
| 4 | AnnotationList duplica l’editor | GLM | Accettato | Lista compatta + proprietà; drag/creazione solo nel canvas. |
| 5 | `annotations` non è default globale | GLM | Accettato | Per-card, fuori da `factoryOptions`/`ChartDefaults`/`COMMON_KEYS`. |
| 6 | Un undo per gesto | Luna | Accettato | Stato locale durante drag; `applyDraft` al pointer-up. |
| 7 | Budget può scartare il chart | Luna | Accettato | Budget 20 KB e limiti; mai scartare il chart. |
| 8 | Export/report possono divergere | Luna | Accettato | Stesso SVG; test pixel e verifica HTML/Word. |
| 9 | Ordine passo 6 dopo l’editor | Luna | Accettato | Data coords rimosse; niente duplicazione adapter. |
| 10 | Test export “non vuoto” insufficienti | Luna | Accettato | Test con coordinate note e verifica pixel. |
| 11 | `npm test` non esegue e2e | Luna | Accettato | `npm run test:e2e` esplicito. |
| 12 | Spike e renderer si sovrappongono | GLM | Accettato | Spike assorbito nel passo 2. |
| 13 | Accessibilità/mobile sovradimensionati | GLM | Accettato | v1: lista + aria-label, screenshot desktop/mobile; touch base. |

## Verdetto dei critici

- **Luna**: `APPROVE_WITH_CHANGES` — architettura fattibile; servono trasformazione plot sul bounding box, transazioni per gesto, budget e export composito/verifiche pixel.
- **GLM**: `APPROVE_WITH_CHANGES` — annotazioni dentro l’SVG Vega ed eliminazione di `space:'data'` e dell’export composito riducono il piano da 7 a 5 passi; modello e lista più semplici.

## Criteri di accettazione

1. Un testo aggiunto dal secondo editor compare nel pannello e viceversa.
2. Drag/resize aggiornano le coordinate nel pannello.
3. Un drag/resize è una sola voce di undo.
4. Il progetto riaperto conserva tipo, coordinate, stile e ordine.
5. PNG/SVG esportati contengono le annotazioni allineate; verifica pixel.
6. Un grafico senza annotazioni è identico a prima.
7. `npm test`, `lint`, `guard`, `build`, `npm run test:e2e` e visual sono verdi.

## Domande aperte

- Il secondo editor deve restare una modalità del dialog o diventare una finestra separata in una fase successiva?
- Il testo ricco (grassetto/corsivo) serve o basta testo semplice?
- Le annotazioni devono essere incluse anche in HTML/Word oltre che in PNG/SVG?
- Le coordinate dati sono richieste in una v2 o bastano le plot-relative?
