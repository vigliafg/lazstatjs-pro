# Verifica visiva estesa — modelli grafici della tornata

Data: 2026-11-04 · branch `grafici-procedure` · HEAD `a6b08e3`

## Copertura

| Voce | Valore |
| --- | --- |
| Modelli nuovi (presenti a HEAD, assenti a `1ef2860`) | 165 su 53 analisi |
| Modelli costruiti con dati reali | **165 / 165** |
| Errori di build dello spec | 0 |
| Errori Vega-Embed | 0 |
| Valori `NaN` / `Infinity` nel rendering | 0 |
| Screenshot | 165 PNG (deviceScaleFactor 2, card ~940×470 CSS) |
| Fogli di contatto | 19 (3×3) |

Metodo: parametri ricavati dagli esempi di `samples/manifest.json` mappati sui
ruoli di ogni procedura, esecuzione reale `run.tsx → buildVegaSpec →
Vega-Lite compile → vega-embed` in Chrome, cattura PNG dell'elemento card.
Non sono state usate spec finte né dati generati a mano: dove il sample non
copriva un ruolo è stata aggiunta una fixture minima e dichiarata.

Metriche automatiche raccolte per ogni card: numero di mark, testi renderizzati,
righe di testo con 5+ decimali, coppie testo/sfondo con contrasto < 3:1.

Artefatti: `sheet-01.png` … `sheet-19.png` (panoramiche), `flags/*.png`
(ingrandimenti delle card segnalate), `render-report.json` (metriche per card),
`manifest.json` (tutte le spec renderizzate, per riprodurre i casi).

> Nota: l'intestazione delle card negli screenshot mostra
> `undefined · id · undefined` perché la pagina di QA usa solo `id`/`spec`;
> è un difetto dell'harness temporaneo, **non** dell'applicazione.

## Difetti trovati

19 modelli su 165 (11,5%) presentano almeno un difetto visibile. Le correzioni
sono nella sezione finale «Correzioni applicate».

### A. Heatmap: testo illeggibile sulle celle chiare — 5 grafici

`heatmapLayers` (`src/charts/vega/layers.ts`, ~riga 483) colora allo stesso modo
tutte le etichette con `theme.text` (`#e2e8f0`). Su una scala divergente le celle
vicine allo zero sono quasi bianche, quindi il testo sparisce.

| Grafico | Etichette sotto 3:1 |
| --- | --- |
| `doe-alias` | 30 |
| `sem-residuals` | 30 |
| `mi-categorical-bars` | 10 (etichette valore su barre chiare) |
| `multinomial-confusion` | 6 |
| `pls-loadings` | 3 |
| `ml-confusion` | 2 |

Evidenza: `flags/pls-loadings.png` (i valori `-0.01` e `0` della riga `wt` sono
praticamente invisibili), `flags/doe-alias.png`, `flags/sem-residuals.png`,
`flags/ml-confusion.png`, `flags/multinomial-confusion.png`.

### B. Pareto: cumulata disallineata dalle barre — 2 grafici

`paretoLayers` (`src/charts/vega/advancedLayers.ts`, ~riga 87) combina un asse
ordinate con una linea su scala diversa. Vega-Lite emette:

```
WARN Domains that should be unioned has conflicting sort properties. Sort will be set to true
```

Il risultato misurato su `gof-contribution`: la cumulata non segue l'ordine
decrescente delle barre (`A=40` compare due volte, `B=100` finisce secondo,
`E=80` ultimo). L'ordine decrescente delle barre va perso.

Colpisce `gof-contribution` e `freq-cumulative`.

### C. Serie presenti nel modello ma non lette dal builder → grafico vuoto — 5 grafici

I runner mettono le righe in `data.series`, ma i layer usano `rowsOf(chart, 'points')`
(`src/charts/vega/encoding.ts:28`, chiamato da `scatterOnly`
`src/charts/vega/layers.ts:534` e dal ramo `bar`). Il layer finisce con
`values: []` e la card mostra assi e legenda senza alcun segno.

| Grafico | Sorgente | Contenuto |
| --- | --- | --- |
| `glm-residuals` | residual | `values: []` |
| `glmm-residual-fitted` | residual | `values: []` |
| `iv-residuals` | `src/analyses/iv/run.tsx:116` | subtitle “N = 220”, 0 punti |
| `polynomial-residuals` | residual | `values: []` |
| `penalized-coefficients-chart` | `src/analyses/regression/penalized.ts:72` | bar, `values: []` |

Nessuna delle card mostra un messaggio di stato vuoto: il grafico vuoto viene
presentato come se il risultato fosse valido. Evidenza: `flags/iv-residuals.png`.

Non rientrano nella classe (verificati, corretti): `outliers-box` (layer punti
vuoto perché non ci sono outlier), `survival-life-curve` e `survival-turnbull`
(banda vuota, curva disegnata dal layer linea).

### D. Asse x quantitative su valori categorici → nessun segno — 1 grafico

`mancova-adjusted-means` dichiara `x` come `quantitative` mentre i valori sono
`"A"`, `"B"`, `"C"`. `encoding.ts:207` sceglie `nominal` solo se il modello
espone `fields.xType === 'nominal'`; `src/analyses/discriminant/mancova.ts:72`
non lo imposta. Risultato: dominio x vuoto, nessun tick, nessuna linea né punto,
legenda `Y1`/`Y2` popolata. Evidenza: `flags/mancova-adjusted-means.png`.

È l'unico caso della tornata in cui un asse quantitative riceve valori testuali
(verifica automatica su tutte le 165 spec).

### E. Tick con 6–13 decimali — 5 grafici

Domini degenerati senza `axis.format` esplicito, quindi il formato predefinito
di d3 produce etichette illeggibili:

| Grafico | Etichette |
| --- | --- |
| `glmm-random-slopes` | `−0.0000000000003`, `−0.0000000000002` |
| `lmm-random-slopes` | `−0.0000000000003`, `−0.0000000000002` |
| `iv-residuals` | `0.000000` |
| `penalized-coefficients-chart` | `0.000000` |
| `selection-criterion` | `1.000000` |

Evidenza: `flags/canonical-loadings.png` e i fogli `sheet-13.png`
(`glmm-random-slopes`, `lmm-random-slopes`), `flags/iv-residuals.png`.

### F. Etichette valore a basso contrasto sulle barre — 3 grafici

Le etichette sopra/entro le barre usano un colore fisso che non rispetta il
riempimento della barra sottostante: `choice-maxdiff-scores` (5 etichette),
`irt-items` (3), `mi-categorical-bars` (10). Evidenza: `flags/choice-maxdiff-scores.png`,
`flags/irt-items.png`, `flags/mi-categorical-bars.png`.

## Verificati corretti (campione ampio)

- Tutte le famiglie `line`/`area` con banda CI, forest, intervalli, box con
  jitter, ECDF/QQ, ACF, IRF/FEVD, mappe e matrici di confusione colorate con
  sfondi saturi (testo leggibile).
- `correspondence-biplot`: dati corretti; il solo difetto è il tick `0.000000`
  (classe E), dovuto a una seconda dimensione identicamente nulla su una tabella
  2×2.
- `alt-coefficients`: corretto; l'intervallo di `Temperature` è realmente
  schiacciato su 1.0 (effetto trascurabile), non è un difetto di rendering.
- `canonical-loadings`, `contingency-trend-line`: legenda interna alla card e
  leggibile a piena risoluzione (l'impressione di taglio era dovuta alla scala
  dei fogli di contatto).
- `freq-bar-1`, `freq-bar-2`: l'ordine delle modalità segue la frequenza
  (comportamento previsto dal piano), non è un difetto.

## Prossimi passi suggeriti (non eseguiti)

1. `heatmapLayers`: scegliere il colore del testo per luminanza della cella.
2. `paretoLayers`: cumulata su asse con lo stesso dominio delle barre o
   `resolve: independent`, mantenendo l'ordine decrescente.
3. Allineare il contratto `data.points` / `data.series` (fallback in `rowsOf`)
   e aggiungere uno stato “nessun dato” invece di una card vuota.
4. `xType: 'nominal'` per `mancova-adjusted-means`.
5. Formato adattivo per gli assi con dominio stretto (es. `si`/`~g`).

## Correzioni applicate (2026-11-04)

Tutte le classi A–F sono state corrette, con test mirati e ricontrollo visivo.
`npm run check` verde: 1359 test, 0 fallimenti, depcruise/madge/filesize puliti.

| Classe | Correzione | File |
| --- | --- | --- |
| A | L'etichetta delle celle sceglie l'inchiostro dalla luminanza dello schema (`redblue`/`blues` incrociano a 0,72 di scala): scuro sulle celle chiare, bianco sulle sature. Un layer di testo per inchiostro, così la scala colore delle celle non viene toccata. | `src/charts/vega/ink.ts`, `src/charts/vega/layers.ts` |
| B | Barre e cumulata vengono normalizzate sullo stesso campo `category` e condividono un solo oggetto di encoding x: l'ordinamento decrescente resta e la linea non slitta più (sparito anche l'avviso Vega-Lite sui sort in conflitto). | `src/charts/vega/advancedLayers.ts` |
| C | I cinque runner scrivono nella chiave canonica del layer (`points` per residui, `bars` per i coefficienti). | `glm/run.tsx`, `glmm/run.tsx`, `iv/run.tsx`, `regression/polynomial.ts`, `regression/penalized.ts` |
| D | `fields.xType: 'nominal'` sul grafico delle medie aggiustate: asse categorico e linee finalmente disegnate. | `src/analyses/discriminant/mancova.ts` |
| E | Gli assi con dominio sotto 1e-3 passano a `.4~g`: `3e-13` al posto di `0.0000000000003`; nessun effetto sugli assi normali e sugli assi nascosti (`axis: null`). | `src/charts/vega/buildSpec.ts` |
| F | Nello stack l'etichetta va al centro del segmento (non sulla giuntura, dove due etichette si sovrapponevano) con inchiostro scuro; le barre singole tengono l'etichetta fuori, sopra se positive e sotto la punta se negative. | `src/charts/vega/ink.ts`, `src/charts/vega/layers.ts` |

Test aggiunti: inchiostro heatmap, etichette barre (centro stack e fuori barra),
formato assi minuscoli, `points` non vuoti su `iv-residuals`, `bars` non vuote
sui coefficienti penalizzati. Aggiornato il test Pareto alla nuova geometria.

Verifica visiva: `docs/qa/fix-verify-2026-11-04/` — `gallery.html` con le card
ricostruite dai dati reali già catturati, più `stacked-after.png`,
`negative-after.png`, `pareto-after.png`, `tiny-axis-after.png`,
`mancova-after.png`.

### Linee multi-serie disegnate tutte dello stesso colore

26 grafici a linee multi-serie mostravano una sola linea blu con la legenda che
elencava invece serie di colori diversi. La causa è in Vega-Lite: un `stroke`
fissato nel mark ha **precedenza** sull'encoding `color`, e i layer a linea lo
impostavano tramite `lineStyle` (e inline in `ecdfLayers`); la legenda, che
legge l'encoding, restava corretta.

Correzione centralizzata in `src/charts/vega/buildSpec.ts` (`seriesLineColor`,
accanto a `formatTinyAxes`): sui layer a linea con un encoding `color` il colore
fisso del mark passa da `stroke` a `color`, che in Vega-Lite è solo un default e
cede all'encoding. Verificato compilando le spec con la Vega-Lite del progetto:

| mark | senza encoding colore | con encoding colore |
| --- | --- | --- |
| `stroke: '#4f9cf9'` | `{"value":"#4f9cf9"}` | `{"value":"#4f9cf9"}` (bug) |
| `color: '#4f9cf9'` | `{"value":"#4f9cf9"}` | `{"scale":"color","field":"series"}` |

I grafici a una sola serie restano identici; aree e rettangoli usavano già
`color` e non erano affetti. Regressione coperta dal test «a multi-series line
draws each series in its legend colour» in `buildSpec.test.ts`, che asserisce lo
stroke compilato uguale a `{ scale: 'color', field: 'series' }` (fallisce senza
il fix). Verifica visiva: `lines.html` e `lines-serie-after.png` (IRt 6 item,
classi latenti, ECDF A/B, profilo operatori, media stimata, crescita affidabilità);
prima: `before-ks-ecdf.png`.
