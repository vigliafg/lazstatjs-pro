# Audit procedure statistiche e grafici connessi

Data: 2026-10-29. Perimetro: 31 runner in `src/analyses/*/run.tsx`,
`AnalysisChart` in `src/stats/charts.ts`, renderer `src/charts/vega/*`.

## Copertura

- 30 procedure su 31 producono grafici; il Wizard non ne produce (solo
  raccomandazione).
- I grafici sono modelli serializzabili, editabili, persistiti, compilati in
  Vega-Lite e limitati dal budget della card.
- Test: `src/analyses/chartsCoverage.test.ts` verifica i fix sotto;
  `buildSpec.test.ts` compila tutti i kind; `milestoneB.test.ts` copre i runner
  aggiunti dopo la baseline. `npm test`: 563 test verdi.

## Mappa procedura → grafici

| Procedura | Grafici |
|---|---|
| Wizard | nessuno |
| Descriptive | medie, box, istogramma prima variabile, Q-Q fino a 8 |
| Distribution Fit | probability plot |
| T-Test | boxplot campione/gruppi, ranghi o differenze |
| ANOVA | box, medie con CI, box dei ranghi |
| Factorial ANOVA | interaction plot |
| ANCOVA | medie grezze e aggiustate con IC |
| Repeated ANOVA | medie con IC, traiettorie dei soggetti |
| Mixed ANOVA | interazione e traiettorie |
| Non-parametric RM | ranghi/percentuali/discordanze/box |
| TOST | differenza con IC e margini |
| Regression | scatter, osservati/predetti, residui, box, Q-Q |
| Correlation | scatter/ranghi per 2 variabili; box + heatmap per >2 |
| Logistic | curva di probabilità anche con più predittori |
| Count Regression | osservati/predetti, residui/predetti |
| Ordinal Logistic | probabilità per categoria |
| LMM | osservati/predetti, residui, medie per gruppo, Q-Q |
| GEE | osservati/predetti, medie per cluster |
| Multivariate | scree, score |
| Chi-Square | osservati vs attesi |
| Contingency | heatmap residui |
| Agreement | Bland–Altman, kappa, ICC |
| Survival | Kaplan–Meier |
| Cox | forest |
| Stratified Cox | forest + Kaplan–Meier per strato |
| Time-Dependent Cox | forest |
| Parametric Survival | sopravvivenza, hazard, hazard cumulativo |
| Time Series | ACF, ARIMA, modello semplice |
| Missing Data | istogrammi osservato/completato, missingness |
| Sample Size | curva di potenza |
| Resampling | bootstrap, permutazione |

## Correzioni applicate

1. **Logistic multi-predittore**: aggiunta `logisticProfileCurve`; il profilo
   del primo predittore mantiene gli altri alla media e produce sempre un
   grafico.
2. **Stratified Cox**: aggiunto `stratcox-km`, curve Kaplan–Meier per strato,
   oltre al forest plot.
3. **Repeated ANOVA**: barre con IC e nuovo grafico delle traiettorie dei
   soggetti (max 30 soggetti).
4. **ANCOVA**: le barre delle medie aggiustate espongono `lo/hi` e usano
   `error: 'ci'`.
5. **Correlation >2 variabili**: aggiunta heatmap della matrice di
   correlazione accanto al boxplot.
6. **Kind morti**:
   - `mosaic` rimosso dal contratto;
   - `residual` usato per il grafico residui-vs-predetti della regressione;
   - `missingness` usato per il grafico missingness della MI.
7. **T-Test a un campione**: aggiunta la regola `y = mu`; la nota ora
   corrisponde al grafico. Rimosso `boxDataDiffs` inutilizzato.
8. **Ordine livelli**:
   - Factorial ANOVA usa `orderedColumnLevels` + fallback `naturalCompare`;
   - ANOVA ordina i gruppi secondo i livelli dichiarati, con fallback naturale.
9. **Copy**: aggiunte le traduzioni inglesi per i nuovi titoli/note.

## Limiti residui

- **Cox** non ha curve di sopravvivenza aggiustate.
- **Time-Dependent Cox** non ha un grafico del coefficiente nel tempo /
  Schoenfeld.
- **Factorial ANOVA** interaction plot senza banda/IC (`showBand: false`).
- **MI** istogrammi solo per la prima variabile selezionata.
- **Cox/Stratified Cox/Time-Dependent Cox** forest plot su scala lineare; una
  scala logaritmica sarebbe più standard.
- I test visivi E2E coprono l’editor su ANOVA e regressione; gli altri grafici
  hanno test di compilazione, non una matrice visuale dedicata.
- `chartsCoverage.test.ts` verifica i fix principali, non ogni combinazione
  runner → chart.

## Test aggiunti

`src/analyses/chartsCoverage.test.ts`:

- logistic con 2 predittori → `logistic-curve`;
- stratified Cox → `forest` + `survival`;
- repeated ANOVA → barre con `lo/hi` + traiettorie;
- ANCOVA → barre aggiustate con IC;
- correlation >2 → `corr-heatmap`;
- MI → `missingness`;
- regressione → `residual`;
- T-Test one-sample → regola `y = mu`.

Tutti i modelli vengono compilati con `vega-lite.compile()`.
