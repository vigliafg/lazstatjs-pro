# Secondo editor per le annotazioni del grafico: studio di fattibilità e bidirezionalità

- **Richiesta**: «crea un secondo studio preliminare per l'utilizzo, per le annotazioni nel grafico, di un secondo editor collegato bidirezionalmente al primo (quello col property panel). come fare? libreria esterna? excalidraw? la bidirezionalità fra i due editor sarebbe un problema? studiate questo»
- **Perimetro**: editor del grafico con property panel (`ChartEditorDialog`), secondo editor per testo/frecce/forme, modello delle annotazioni, sincronizzazione, persistenza, export.
- **Data e revisione del codice**: 2026-10-31, commit `4a16fdd`.
- **Stato**: studio preliminare, nessuna modifica al codice.

## Verdetto

**Sì, si può fare**, ma **Excalidraw non è la scelta giusta come editor principale delle annotazioni statistiche**.

La soluzione raccomandata è:

1. un **modello unico di annotazioni** dentro `ChartOptions`;
2. un **secondo editor leggero** sopra l’SVG del grafico (overlay HTML/SVG), non un whiteboard;
3. il property panel come **lista/vista proprietà** dello stesso modello;
4. una **bidirezionalità a stella**: entrambi gli editor scrivono sullo stesso store, non si parlano direttamente.

Excalidraw resta utile solo come **modalità freeform opzionale** su un’immagine esportata del grafico, non come editor collegato ai dati.

La bidirezionalità **non è un problema concettuale**, ma lo diventa se:

- i due editor hanno due modelli diversi (scene Excalidraw vs annotazioni statistiche);
- hanno due stack di undo;
- usano coordinate diverse (pixel vs dati);
- si sincronizzano con `onChange` senza guardie, creando loop.

## Perché serve un secondo editor

Il property panel è ottimo per:

- elencare le annotazioni;
- modificarne testo, colore, spessore, freccia, allineamento;
- selezionare, bloccare, ordinare, eliminare;
- mostrare/nascondere.

Non è ottimo per:

- posizionare con il mouse;
- trascinare, ridimensionare, ruotare;
- disegnare frecce e forme;
- vedere l’annotazione nel contesto;
- modificare il testo direttamente sul grafico.

Il secondo editor serve per l’interazione diretta; il property panel per il controllo preciso. Sono due viste dello stesso modello.

## Architettura consigliata

### 1. Modello unico

```ts
interface ChartAnnotation {
  id: string;
  type: 'text' | 'line' | 'rect' | 'ellipse' | 'arrow';
  space: 'plot' | 'data';       // normalizzato 0-1 oppure coordinate dati
  x: number; y: number;
  x2?: number; y2?: number;
  text?: string;
  color?: string;
  fill?: string;
  border?: string;
  width?: number;
  dash?: 'solid' | 'dashed' | 'dotted';
  arrow?: boolean;
  fontSize?: number;
  align?: 'left' | 'center' | 'right';
  z: number;
  locked?: boolean;
  hidden?: boolean;
}
```

Le annotazioni stanno in `ChartOptions.annotations`. Sono dati puri, serializzabili, compatibili con worker e progetto `.lzs`.

### 2. Due viste, un solo store

```
ChartOptions.annotations
        │
        ├── AnnotationList (property panel)
        │      └── form properties, select, delete, reorder
        │
        └── AnnotationCanvas (second editor)
               └── drag/resize/text edit/arrows/shapes
```

Nessun editor possiede il dato. Entrambi dispatchano `applyAnnotations(next)`.

### 3. Bidirezionalità a stella

- Il property panel modifica `annotations` → il canvas riceve il nuovo array e ridisegna.
- Il canvas modifica `annotations` → il property panel aggiorna la lista e i campi.
- La selezione è un id condiviso (`selectedAnnotationId`), stato UI, non persistito.
- Le modifiche passano da un reducer/transazione unica; undo/redo resta quello del chart editor.
- Guardia `isApplyingExternalChange` per evitare loop quando il canvas riscrive lo stesso array.
- Riconciliazione per **id**: aggiunte, modifiche, eliminazioni, riordino z.

### 4. Coordinate

Questo è il punto che decide tutto.

- **`space: 'plot'`**: coordinate normalizzate 0-1 rispetto all’area del grafico. Resiste al resize e al cambio di dimensione della card. È la scelta giusta per testo, frecce, box, callout.
- **`space: 'data'`**: coordinate sui valori (x categoriale o numerico, y numerico). Utile per annotazioni ancorate a un punto statistico (es. “outlier”, “p=0.03”).
- Il renderer converte `plot` in pixel con le dimensioni correnti; `data` con le scale Vega.
- Se il modello statistico cambia, le annotazioni `data` possono diventare orfane: vanno marcate e mostrate nel pannello, non eliminate in silenzio.

### 5. Rendering

Due livelli:

1. **Statico/export**: `annotationLayers(chart, options)` aggiunto a `buildSpec`, così PNG/HTML/Word includono le annotazioni senza dipendere dal DOM del secondo editor.
2. **Interattivo**: overlay HTML/SVG sopra `VegaChart` per selezione, drag, resize, editing testo. L’overlay non fa parte della spec Vega.

Per le frecce: linea + triangolo all’estremo, oppure un mark Vega dedicato. È l’unico punto che richiede una prova tecnica.

### 6. Persistenza e export

- schema versionato (`annotationsVersion`), normalizzazione in `mergeOptions`/parse;
- limite numero annotazioni e caratteri, per non superare `MAX_CHART_MODEL_CHARS`;
- sanitizzazione di testi/colori;
- incluse in `chart.options`, quindi già nel progetto e nel worker;
- export SVG/PNG/HTML deve usare lo stesso layer statico, non un’immagine del canvas.

## Excalidraw: valutazione

### Cosa offre

- componente React ufficiale `@excalidraw/excalidraw`;
- licenza **MIT** (repository Excalidraw);
- testo, frecce, rettangoli, ellissi, immagini, selezione, resize, rotazione, undo/redo, export;
- API `onChange(elements, appState, files)` e `updateScene(sceneData)` per la sincronizzazione;
- scene JSON serializzabile.

### Perché non è l’editor principale

1. **Modello whiteboard, non statistico.** Excalidraw non conosce assi, scale, dati o plot area: le sue coordinate sono pixel su una tela infinita.
2. **Canvas infinito e zoom/pan.** Va domato con `viewModeEnabled`, `zenModeEnabled`, `appState` e una viewport fissa; non è il suo caso d’uso naturale.
3. **Sfondo del grafico.** Per vedere il grafico sotto le annotazioni bisogna inserire un’immagine di sfondo (elemento image bloccato) oppure sovrapporre il canvas al grafico. Nel primo caso il grafico è uno snapshot e non si aggiorna; nel secondo Excalidraw cattura i pointer event e copre l’interazione col grafico.
4. **Coordinate non dati.** Un’annotazione “vicino al punto 2024” non segue il punto se il grafico viene ridisegnato o ridimensionato.
5. **Due history.** Excalidraw ha il proprio undo/redo; il chart editor ha il suo. Una modifica nel secondo editor finisce in due storie diverse.
6. **Stile.** Il tratto hand-drawn è identitario e poco adatto a una figura statistica pubblicabile; la precisione tecnica non è il punto di forza.
7. **Bundle e dipendenze.** È un editor completo, non una libreria di annotazioni: peso e superficie di manutenzione maggiori.
8. **Bidirezionalità fragile.** `onChange` → conversione scene→annotations, `updateScene` ← annotations→scene, con guardie per non rientrare. È fattibile, ma è un adattatore bidirezionale tra due modelli diversi, non una singola fonte di verità.

### Quando Excalidraw ha senso

Solo come **modalità freeform separata**:

- l’utente esporta il grafico come immagine;
- apre un whiteboard Excalidraw con l’immagine di sfondo bloccata;
- aggiunge testo/frecce/forme;
- esporta un PNG/SVG annotato.

In questo caso le annotazioni non sono collegate ai dati e non tornano nel chart editor. È un’uscita “figura annotata”, non un layer statistico.

## tldraw

tldraw è tecnicamente valido, ma la licenza non è permissiva: l’SDK richiede una licenza per la produzione (trial, commerciale o hobby con watermark). Per un progetto che deve poter distribuire l’editor senza vincoli, **non è una scelta sicura**.

## Konva / Fabric

- licenza MIT;
- canvas scene graph, oggetti, drag/resize, testi, forme;
- richiedono comunque toolbar, selezione, editing testo, z-order, export;
- integrazione con l’SVG Vega meno naturale dell’overlay SVG;
- buona alternativa se l’overlay SVG diventa troppo complesso.

## React Moveable / Selecto / React Annotation

- `react-moveable` + `react-selecto` (MIT): selezione, drag, resize, rotazione, snap; sono mattoni, non un editor completo.
- `react-annotation` (Susie Lu): annotazioni SVG dichiarative, non un editor.
- Sono la combinazione più adatta per un **editor leggero custom**: overlay SVG + moveable/selecto per la manipolazione.

## Confronto

| Soluzione | Fit statistico | Sforzo | Rischio | Licenza | Bidirezionalità |
|---|---|---|---|---|---|
| Overlay SVG custom + moveable/selecto | Alto | Medio | Medio | MIT | Alta (stesso modello) |
| Excalidraw | Basso/medio | Medio | Alto | MIT | Bassa/media (adattatore) |
| tldraw | Medio | Medio | Alto (licenza) | SDK commerciale | Media |
| Konva/Fabric | Medio | Alto | Medio | MIT | Alta (stesso modello) |
| react-annotation | Basso | Basso | Basso | MIT | Solo rendering |

## La bidirezionalità è un problema?

**No, se il modello è uno.** Diventa un problema se:

- il secondo editor ha il proprio stato;
- il property panel e il canvas fanno `onChange` l’uno verso l’altro;
- le coordinate sono pixel e il grafico cambia;
- ci sono due undo stack;
- si sincronizza l’intero scene JSON a ogni frame.

La soluzione è:

1. un array `annotations` come unica fonte di verità;
2. selezione come id, non come oggetto duplicato;
3. aggiornamenti immutabili e transazioni;
4. guardia di rientro;
5. coordinate normalizzate/dati, non pixel;
6. un solo undo/redo, quello del chart editor;
7. test di andata/ritorno: proprietà → canvas → proprietà produce lo stesso stato.

## UI proposta

Nel property panel, sotto “Annotazioni”:

```text
▾ Annotazioni                         [+ Testo] [+ Freccia] [+ Forma]
   ▸ “Outlier 2024”                    👁  🔒
   ▾ “p = 0.03”                        👁  🔒
      Testo     [ p = 0.03 ]
      Posizione [ plot: 0.72, 0.18 ]
      Colore    [ ■ ]
      Font      [ 10 ]
   ▸ Freccia “gruppo B”                👁  🔒
```

Pulsante **“Apri editor annotazioni”** → secondo editor a tutta finestra:

```text
┌─ Annotazioni ──────────────────────────────────────────────┐
│ [Seleziona] [Testo] [Freccia] [Rettangolo] [Ellisse]       │
│ [Undo] [Redo] [Elimina] [Porta avanti] [Porta dietro]      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│        grafico Vega + overlay annotazioni                  │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ X: 0.72  Y: 0.18   [Annulla] [Applica]                     │
└────────────────────────────────────────────────────────────┘
```

Il secondo editor non è un whiteboard: è un **canvas di annotazione** con il grafico sotto, toolbar essenziale, coordinate mostrate, zoom/fit.

## Piano consigliato

### Fase 1 — Modello e rendering statico

- `ChartAnnotation`, normalizzazione, persistenza.
- `annotationLayers` in Vega per testo, linee, rettangoli.
- Test di compilazione e export.
- Nessuna UI interattiva.

### Fase 2 — Property panel list

- Gruppo “Annotazioni” con lista, selezione, proprietà, visibilità, lock, z-order.
- Aggiunta/eliminazione da pulsanti.
- Test di round-trip.

### Fase 3 — Secondo editor custom

- Overlay SVG sopra `VegaChart`.
- Seleziona, trascina, ridimensiona; testo double-click.
- Frecce/forme; snap alla plot area.
- `react-moveable`/`selecto` opzionali.
- Stesso store, stesso undo.

### Fase 4 — Export e accessibilità

- SVG/PNG/HTML/Word con annotazioni.
- Lista accessibile come alternativa al canvas.
- Alt text/descrizione.

### Excalidraw come opzione separata (se richiesta)

- Modal “Annota immagine”: esporta il grafico in PNG, apre Excalidraw con immagine bloccata, esporta PNG annotato.
- Nessuna bidirezionalità con il chart editor.
- Dichiarare che è un’immagine statica, non un layer dati.

## Rischi

| Rischio | Gravità | Mitigazione |
|---|---|---|
| Due modelli/undo stack | Alta | Un solo array, un solo undo |
| Coordinate pixel | Alta | `space: plot/data`, adapter |
| Loop di sincronizzazione | Alta | guardia, id, transazioni |
| Annotazioni orfane dopo cambio dati | Media | marcatura e avviso, non cancellazione |
| Testo/editing e Ctrl+Z | Media | gestione focus, editor testo locale |
| Export divergente | Alta | layer statico unico per preview/export |
| Persistenza pesante | Media | limiti, schema versionato |
| Excalidraw bundle/whiteboard | Media | solo modalità separata |
| tldraw licensing | Alta | escluso |
| Accessibilità | Media | lista proprietà + alt text |

## Esperimenti che chiuderebbero i dubbi

1. Prototipo overlay SVG con un testo, una freccia e un rettangolo su un grafico Vega: verifica coordinate e export SVG.
2. Prototipo Excalidraw con immagine di sfondo e `onChange`: misurare il costo dell’adattatore e la stabilità del resize.
3. Test di 100 annotazioni: performance, dimensione JSON, tempo di export.
4. Test di resize 320→1200 px: le annotazioni `plot` restano coerenti?
5. Test di cambio dati: le annotazioni `data` vengono riproiettate o marcate orfane?

## Conclusione

La scelta razionale è **un secondo editor custom, leggero, sopra l’SVG del grafico**, con un modello unico di annotazioni e il property panel come lista di controllo. Excalidraw è una bella libreria, ma è un whiteboard: usarlo come editor principale significa costruire un ponte tra due modelli, due coordinate e due storie, con un risultato meno integrato.

Se l’obiettivo è “annotare una figura esportata”, Excalidraw va benissimo come modalità separata. Se l’obiettivo è “annotazioni statistiche collegate al grafico”, la strada è l’overlay custom.

## Fonti

- Excalidraw, repository e licenza MIT: <https://github.com/excalidraw/excalidraw>, <https://github.com/excalidraw/excalidraw/blob/master/LICENSE>
- Excalidraw npm component, `onChange`/`updateScene`: <https://www.npmjs.com/package/@excalidraw/excalidraw>
- Excalidraw embed guide: <https://excalidraw-excalidraw.mintlify.app/introduction>
- tldraw license: <https://tldraw.dev/community/license>, <https://github.com/tldraw/tldraw/blob/main/LICENSE.md>
- react-moveable / selecto: <https://github.com/daybrush/selecto>, <https://daybrush.com/moveable/>
- react-annotation: <https://react-annotation.susielu.com>
