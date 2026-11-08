# Chart editor — assi: limiti e scala (fase 1)

Stato: **fasi 1 e 2 implementate** (2026-11-08). Fase 3 in fondo al documento.

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

## Fase 3 — zoom e pan

- `params: [{ select: { type: 'interval', encodings: ['x','y'] }, bind: 'scales' }]`
  per pan/zoom con assi riadattati, piu' un pulsante di reset.
- Attenzione: il brush di linking in `src/charts/interaction.ts` usa gli stessi
  `params`; `applyChartLink` filtra e riaggiunge i suoi, quindi la fusione va
  verificata con il linking attivo e con il brush spento.
