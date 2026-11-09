# Chart editor — assi: limiti e scala (fase 1)

Stato: **fasi 1, 2 e 3 implementate** (2026-11-08).

## Cosa puo' fare l'utente

Nel pannello di modifica di una card, sezione **Asse**:

- **Asse X** e **Asse Y** come sotto-oggetti, ognuno con:
  - *Minimo* / *Massimo*: campo numerico; vuoto = automatico, cioe' il dominio
    resta quello calcolato dai dati;
  - *Scala*: Automatica, Lineare, Log, Radice quadrata;
  - *Inverti* (reverse), *Blocca ai limiti* (clamp), *Valori tondi* (nice).
- I limiti non finiscono mai nei preset stile, nei default utente o negli stili
  salvati: valgono per la singola card, perche' un range buono per un dataset
  non lo e' per un altro.
- Il pulsante di reset della sezione riporta tutti i controlli ad automatico.

## Decisioni di implementazione

1. **Un solo post-pass.** `applyAxisSettings` (`src/charts/vega/axis.ts`) gira in
   coda a `buildVegaSpec`, accanto a `formatTinyAxes` e `seriesLineColor`. Un
   punto solo invece di dodici layer builder da modificare.
2. **Chiavi piatte e opzionali** in `CommonChartOptions` (`xMin`, `yScaleType`,
   `xReverse`, ...). `null` o chiave assente = automatico. Restano opzionali per
   non rompere `ChartDefaults = CommonChartOptions`.
3. **`AXIS_DEFAULTS` sta in `factoryOptions` ma fuori da `COMMON_DEFAULTS` e
   `COMMON_KEYS`.** I preset stile derivano da `CHART_PRESET_KEYS = COMMON_KEYS`
   e `applyPreset` riscrive `COMMON_DEFAULTS`: se le chiavi d'asse entrassero in
   `COMMON_KEYS`, un preset catturerebbe i limiti. Il reset del pannello funziona
   lo stesso perche' usa `initialOptions` = `factoryOptions`.
4. **`sanitizePatch` esclude `AXIS_KEYS`** (`src/charts/styles.ts`): con le
   chiavi in factory, uno stile salvato potrebbe altrimenti fissare un range.
5. **Normalizzazione in `mergeOptions`** (`normalizeAxisOptions`): NaN, coppie
   min >= max e limiti non positivi con scala log degradano ad automatico invece
   di produrre warning Vega. Copre anche i `.lzs` modificati a mano.
6. **`axisChannels(kind)`** e' la tabella unica condivisa da pannello e builder:
   i tipi con assi derivati o condivisi non mostrano i controlli e non ricevono
   patch.
7. **`domainMin`/`domainMax`, non `domain`.** `domain` sostituirebbe l'intero
   dominio (e con esso l'auto-range del canale); i due estremi si compongono con
   il dominio dei dati. Quando c'e' almeno un limite si impone `zero: false`,
   altrimenti `zeroBaseline` estenderebbe un minimo positivo fino a zero.
8. **Solo canali quantitativi** e con `axis !== null`: gli assi nominali e quelli
   nascosti restano come prima.
9. **Nuovo tipo `numberInput`** nel renderer unico dei controlli, perche' gli
   slider esistenti hanno un intervallo fisso; campo vuoto = automatico.
10. **Tipi del descrittore in `featureTypes.ts`**: `axisFeatures.ts` ha bisogno
    di `FeatureDescriptor` senza importare `features.ts`, che a sua volta lo
    importa: tenerli li' evita il ciclo rilevato da depcruise.

## Canali modificabili per tipo

| Tipo | Canali | Motivo |
| --- | --- | --- |
| default (scatter, line, bar, box, histogram, ...) | x, y | — |
| `qq` | y | l'asse x e' la probabilita' teorica: e' la trasformazione |
| `forest` | x | y e' l'elenco nominale degli studi |
| `scree` | y | x e' l'indice delle componenti |
| `tree` | x | y e' la gerarchia nominale |
| `pareto`, `dendrogram`, `surface`, `heatmap`, `mosaic`, `missingness`, `scattermatrix`, `scatter3d` | nessuno | assi derivati o layout multi-pannello |

## File toccati

- `src/stats/charts.ts`: `AxisScaleType` e le dodici chiavi opzionali.
- `src/charts/axisModel.ts` (nuovo): default, chiavi, `axisChannels`,
  getter/setter, `normalizeAxisOptions`, `axisScalePatch`.
- `src/charts/vega/axis.ts` (nuovo): `applyAxisSettings`.
- `src/charts/vega/buildSpec.ts`: chiamata in coda.
- `src/charts/featureTypes.ts` (nuovo): tipi del descrittore, ora sotto il
  limite di 700 righe per `features.ts` (l'eccezione e' stata rimossa).
- `src/charts/axisFeatures.ts` (nuovo): i dodici controlli.
- `src/charts/features.ts`, `objects.ts`: registrazione e nodi Asse X/Asse Y.
- `src/charts/defaults.ts`: `AXIS_DEFAULTS` in `P`, normalizzazione in merge.
- `src/charts/styles.ts`: esclusione delle chiavi d'asse dagli stili.
- `src/components/charts/ChartControls.tsx`: tipo `numberInput`.
- i sei cataloghi `src/i18n/catalog/*/analysis.ts` (19 chiavi per lingua).

## Test

- `src/charts/axisModel.test.ts`: default automatici, normalizzazione dei valori
  non validi, patch vuota, canali per tipo, controlli registrati e campo vuoto,
  visibilita' sui tipi derivati.
- `src/charts/vega/axis.test.ts`: `domainMin`/`domainMax` in ogni layer, limite
  singolo, scala log, reverse/clamp/nice, override di un dominio interno fisso
  (sopravvivenza), assi derivati intatti (qq, pareto, forest, missingness),
  compilazione senza warning di tutti i 32 tipi con tutte le impostazioni.
- Verifica: `npm run lint`, i test mirati sopra, `locales:check` per le sei
  lingue, `depcruise`, `madge`, `filesize`, poi il gate `npm run check`.

## Fase 2 — tick e formato (implementata)

- Nuove chiavi per card: `xTickCount`/`yTickCount` (intero 2-50; vuoto =
  automatico) e `xLabelFormat`/`yLabelFormat` con Auto, Decimale (`~f`),
  Compatto (`~s`, cioe' `1.2k`), Percentuale (`.1%`) e Scientifico (`.2~e`).
- **Ordine in `buildVegaSpec`**: `applyAxisSettings` gira *dopo*
  `formatTinyAxes`, cosi' un formato scelto dall'utente vince sul `.4~g` che il
  post-pass applica ai domini minuscoli; la parte di scala e' indipendente
  dall'ordine.
- `tickCount` e' un *desiderata* di Vega-Lite: l'asse puo' sceglierne un altro
  per evitare etichette sovrapposte. Il valore viene arrotondato e riportato ad
  automatico fuori dall'intervallo 2-50; un formato sconosciuto torna ad Auto.
- Attributi scritti in `encoding[canale].axis` (merge con l'oggetto di `axis()`),
  non in `scale`: tick e formato appartengono all'asse, non al dominio.
- Test aggiunti: sanitizzazione di tick e formato, patch degli attributi,
  presenza nella spec, formato esplicito che batte il default dei domini
  minuscoli.

## Fase 3 — zoom e pan (implementata)

- Nuova chiave per card `enableZoom` (spenta di default). Quando e' attiva,
  `vega/zoom.ts` aggiunge un parametro `chartZoom` (`select: 'interval'`,
  `bind: 'scales'`): rotella per lo zoom, trascinamento per il pan, assi che
  seguono il dominio.
- **Dove sta il parametro**: sul primo layer con un campo continuo, non al
  top-level. A livello top-level Vega-Lite proietta la selezione su tutti i
  layer e avvisa per i layer di riferimento con un solo asse (una rule
  orizzontale non ha `x`); sul layer emette gli stessi signali
  `chartZoom_x`/`chartZoom_y` senza warning.
- **Canali**: il bind copre l'intera view, quindi servono scale continue e non
  binned. Una barra con x nominale o un istogramma con x binned restano senza
  zoom; Pareto e le matrici sono esclusi da `axisChannels`.
- I layer di riferimento con un valore fisso (`value`/`datum`, per esempio le
  rule orizzontali delle bande) **non** disattivano lo zoom: il parametro vive
  su un layer con campi, quindi quei layer non partecipano alla proiezione.
  Senza questo filtro lo scatter di correlazione perdeva lo zoom per una sola
  rule a valore fisso.
- **Convivenza con il brush di linking**: il brush non usa `params`. Vive in un
  overlay HTML e scrive i segnali `linkKeys`/`hiddenKeys` nella view montata,
  quindi `applyZoom` puo' accodare il suo parametro senza toccarli. Un test
  verifica che la spec con link attivo contenga tutti e tre i parametri.
- Nota d'uso: con il linking attivo l'overlay del brush copre l'area del plot,
  quindi la rotella e il pan li applica l'overlay ai signali del binding
  (`zoomDomain`/`panDomain`): Shift+trascinamento sposta la vista, il drag
  semplice resta il pennello e il reset resta sempre disponibile.
- **Reset**: pulsante in basso a destra nella view (`data-no-export`, quindi
  escluso da PNG e report). Incrementa un token che rimonta la view: e' l'unico
  modo affidabile di azzerare un bind di scala senza cambiare la spec.
- Test: parametro presente/assente, canali per tipo, compresenza con i segnali
  di link, normalizzazione booleana, compilazione senza warning dei 32 tipi.
- **E2E** (`e2e/chart-zoom.spec.ts`, desktop): rotella e trascinamento reali
  sulla card di regressione. I tick si leggono dall'SVG (`g.role-axis-label`):
  la rotella restringe il dominio (44-72 -> 53-65), il trascinamento lo trasla
  mantenendo la larghezza visibile, "Reset zoom" riporta i tick iniziali. Il
  test verifica anche che senza l'opzione il pulsante non esista. Un secondo
  caso tiene il linking attivo: con la superficie del pennello sopra il plot la
  rotella restringe ancora il dominio e Shift+drag lo trasla senza selezionare
  righe. Skippato su mobile (gesti del puntatore).
