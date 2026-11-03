# Note di release — grafici delle procedure

**Data:** 3 novembre 2026
**Branch:** `grafici-procedure`
**Versione:** 0.19.0
**Piano:** `docs/plans/2026-11-03-grafici-procedure-piano.md` (F0.1 → F11.3)

## Numeri finali

- 71 procedure su 72 con almeno un grafico; il `wizard` resta senza per scelta.
- 349 modelli `AnalysisChart`, 33 kind distinti
  (`docs/analysis/2026-11-03-inventario-grafici-72-procedure.md`).
- 1356 test unitari, 0 fail (`npm run check`).
- e2e dei grafici: 12 passati, 3 skipped (`chart-editor` + `chart-styles`,
  progetto desktop).
- `npm run test:samples` verde; `npm run build` verde (web + Electron).
- 6 lingue (it sorgente, en, fr, es, de, pt-PT), 1786 chiavi i18n, 83 pagine
  help per lingua.

## Grafici aggiunti, per famiglia

| Famiglia | Aggiunte principali |
|---|---|
| Descriptive | intervallo della mediana e differenza appaiata (`ttest`), dot con valori segnalati da Grubbs/Dixon, Pareto delle frequenze, medie di cella fattoriali, intervallo di tolleranza |
| Quality / SPC | contributi CUSUM, profilo parte × operatore (MSA), Pareto cumulato |
| Regression | forest dei coefficienti del modello selezionato, primo stadio IV, loadings PLS, matrice di confusione multinomiale |
| Multivariate | silhouette per cluster, scatter dei cluster, correlazioni canoniche, indici di fit SEM, certezza di classificazione LCA, curve caratteristiche IRT |
| Categorical | contributo al χ², mosaico dei residui, osservati/attesi del test esatto, trend Cochran–Armitage |
| Survival | curva della tavola attuariale, CIF, MCF per eventi ricorrenti, life-stress, curve di affidabilità |
| Time series | Holt–Winters, trend con ADF, spettro con Fisher g, Q-Q dei residui GARCH |
| Design & power | matrice di alias del disegno, superficie DOE |
| Missing e survey | effetto del disegno (DEFF), osservati vs completati nell'imputazione |
| ML, text, choice | forest dei coefficienti, termini e similarità tra documenti, MaxDiff |
| Advanced | controllo predittivo bayesiano, variogramma spaziale, funnel meta con pooled verticale |

## Convenzioni JMP

Sono opt-in: nessuna cambia il default del kind.

- `forest.jmp-ratio` — scala log, riferimento 1; con `logScale` il layer scarta
  le righe con stima o estremi non positivi.
- `survival.jmp-km` — gradini, IC, censure e mediana su `survival-km`,
  `stratcox-km` e `survival-life-curve`. `parametric-survival` prende la mediana
  senza gradini, perché la curva è analitica.
- `line.jmp-connected` — osservati con marker su `ts-arima-chart`, `hw-series`,
  `var-irf-chart`.
- `interval.jmp-mean-diamond` e `dot.jmp-strip` — media con diamante e striscia
  larga, attive dove la media ha senso.
- Box JMP per i confronti tra gruppi (`anova`, `nonparamrm`, `quality`): baffi
  10°–90°, media con IC, jitter; la diagnostica resta sulla coda Tukey.

## Limiti dichiarati

- `tdcox` senza grafico β(t): il kernel restituisce β costanti.
- `competing` senza CIF impilate: il modello è stimato per una causa alla volta.
- Actual by Predicted con banda solo per `k = 1`.
- MSA senza scomposizione della varianza per operatore.
- `surface` senza scelta mesh/contour nell'editor.
- `meta-forest` in scala lineare: `MetaParams` non dichiara il measure.
- Heatmap dei loadings in scala divergente, perché i carichi hanno segno.
