# Grafici per procedura: confronto con Minitab, SPSS, Stata, Statgraphics, jamovi, JASP

- **Richiesta**: «in statistics descriptive quali grafici minitab, spss, stata, statgraphic, jamovi, jasp utilizzano? istogramma con gaussiana sovrapposta con tails destre e sinistre?? leaf and stem graphics, ecc ecc. quali abbiamo implementato noi e cosa hanno di più loro? fai una tabella procedura per procedura»
- **Repo e revisione**: `/home/vigliafg/Documenti/GitHub/lazstatjs-pro`, commit `8e12f92`.
- **Metodo**: confronto per **capacità documentate** dei moduli base (e, dove indicato, estensioni), non per versione bloccata. Le celle elencano i grafici tipici, non ogni variante. «n.p.» = non previsto nel modulo base; «est.» = disponibile tramite modulo/estensione.
- **Fonti ufficiali principali**:
  - Minitab: <https://support.minitab.com/en-us/minitab/help-and-how-to/statistics/basic-statistics/how-to/graphical-summary/before-you-start/overview>, <https://support.minitab.com/en-us/minitab/help-and-how-to/graphs/graphs-in-minitab>.
  - SPSS: <https://www.ibm.com/docs/en/spss-statistics>, <https://www.ibm.com/docs/en/spss-statistics/32.0.0?topic=explore-plots>.
  - Stata: <https://www.stata.com/manuals/rhistogram.pdf>, <https://www.stata.com/manuals/rdiagnosticplots.pdf>, <https://www.stata.com/links/stata-basics/box-plots>.
  - Statgraphics: <https://www.statgraphics.com/basic-statistics>, <https://www.statgraphics.com/basic-statistics-using-statgraphics>.
  - jamovi: <https://docs.jamovi.org/jmv/jmv_descriptives.html>.
  - JASP: <https://jasp-stats.org/manual/>, <https://jasp-stats.org/2024/07/26/raincloud-plots-in-jasp-incredibly-useful-surprisingly-easy/>.

## 1. Descriptive: il confronto che interessa di più

| Grafico / oggetto | Minitab | SPSS | Stata | Statgraphics | jamovi | JASP | Noi oggi | Delta |
|---|---|---|---|---|---|---|---|---|
| Istogramma (conteggi) | Graph > Histogram | Explore/Frequencies | `histogram` | Frequency Histogram | Descriptives > Histogram | Distribution plot | **Sì** (histogram) | — |
| Istogramma + curva normale | Graphical Summary / Histogram con normal curve | Explore/Frequencies; Chart Editor > Show Distribution Curve | `histogram, normal` | Histogram con normal curve | Histogram + density (non solo normale) | Distribution plot con density | **Sì** (opzione `showDensity`, normale) | Minitab/SPSS/Stata/Statgraphics hanno il normale; jamovi/JASP hanno densità; noi solo normale |
| Istogramma + KDE/densità | Individual Distribution Identification / fitted distribution | n.p. (normale via Chart Editor) | `histogram, kdensity`; `kdensity` | Distribution fitting | Histogram + density | Distribution plot con density | **Sì** (opzione `showKde`) | — |
| Istogramma + code destra/sinistra | Probability Distribution Plot con aree/tail; Graphical Summary con normale | n.p. come istogramma; P-P/Q-Q per code | `qnorm`/`pnorm` per code; `kdensity` | Distribution Fitting + Tail Areas + outlier plot | QQ | QQ | **Solo Q-Q** (nessuna tail area nel grafico) | Tail areas e outlier plot |
| Stem-and-leaf | Graph > Stem-and-Leaf | Explore (default) | `stem` | Stem-and-Leaf Display | n.p. | n.p. | **No** | Minitab, SPSS, Stata, Statgraphics |
| Dotplot | Graph > Dotplot | Chart Builder (dot) | `dotplot`, `graph dot` | Dotplot | Descriptives > Dot | Dot plot | **Sì** (kind `dot`) | — |
| Boxplot | Graph > Boxplot | Explore/Chart Builder | `graph box/hbox` | Box-and-Whisker | Box | Box | **Sì** (box, notched, violin) | — |
| Violin | n.p. (base) | n.p. (base) | est. `vioplot` | n.p. (base) | Violin | Violin | **Sì** | — |
| Raincloud | n.p. | n.p. | n.p. | n.p. | est. moduli (jjstatsplot, vijPlots, snowLatent) | **Sì** (modulo dedicato) | **No** | JASP; jamovi via estensione |
| Q-Q normale | Graph > Probability Plot | Explore > Normality plots | `qnorm`, `qqplot` | Normal Probability Plot | Q-Q | Q-Q | **Sì** | — |
| P-P | Probability Plot (distribuzioni) | Explore (P-P) | `pnorm` | Probability plot | n.p. | n.p. | **No** | SPSS, Stata |
| Q-Q detrendizzato | n.p. | Explore (detrended normal Q-Q) | n.p. | n.p. | n.p. | n.p. | **Sì** (opzione `detrended`) | — |
| Probability plot per distribuzioni | Individual Distribution Identification | Explore/P-P | `qchi`/`pchi` | Distribution Fitting | n.p. | n.p. | **Solo normale** | Minitab, SAS/SPSS/Stata per altre distribuzioni |
| ECDF / cumulativa | Empirical CDF Plot (web app) | n.p. | `cumul`/est. | n.p. | n.p. | n.p. | **Sì** (kind `ecdf`) | Minitab, Stata/estensioni |
| Interval plot (media ± IC) | Graph > Interval Plot | Error bar/Chart Builder | `twoway`/`marginsplot` | Means Plot | Error bar plot | Interval plot | **Barre con IC** (non point-range) | point-range/interval plot |
| Outlier plot con limiti sigma | Boxplot + outlier | Boxplot | est. | Outlier Plot | Box | Box | **Boxplot outlier** | Statgraphics sigma plot |
| Spread-vs-level | n.p. | Explore | n.p. | n.p. | n.p. | n.p. | **No** | SPSS |
| Bar/pie per categorie | Graph > Bar/Pie | Frequencies/Chart Builder | `graph bar` | Bar/Pie | Bar | Bar | **Bar** (no pie) | pie e barre raggruppate/stacked |
| Scatter matrix | Matrix Plot | Chart Builder scatter matrix | `graph matrix` | Scatterplot Matrix | Correlation matrix plot | Correlation matrix | **Heatmap** di correlazione, non scatter matrix | scatter matrix |

**Risposta breve sui tuoi esempi**:
- **Istogramma con gaussiana sovrapposta**: ce l’abbiamo come opzione (`showDensity`), ma solo con curva normale, non con KDE né con fitted distribution.
- **Code destre/sinistre**: non abbiamo un grafico dedicato alle tail areas; il Q-Q mostra le deviazioni nelle code, ma non quantifica le aree. Minitab/Statgraphics hanno tail areas e outlier plot; SPSS/Stata hanno Q-Q/P-P e `qnorm`/`pnorm`.
- **Stem-and-leaf**: non l’abbiamo; Minitab, SPSS, Stata e Statgraphics sì.
- **Dotplot/raincloud/ECDF/spread-vs-level/interval plot**: non li abbiamo (abbiamo box/notch/violin, barre con IC, Q-Q).

## 2. Tabella procedura per procedura

Legenda: **Noi** = grafici attuali (id/kind); **Delta** = ciò che gli altri hanno in più e che ha più senso implementare. Le celle dei programmi sono esempi tipici del modulo base; «n.p.» significa nessun grafico specifico previsto nel modulo base.

| # | Procedura | Minitab | SPSS | Stata | Statgraphics | jamovi | JASP | Noi | Delta |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Wizard** | — | — | — | — | — | — | **Nessun grafico** | Nessuna lacuna statistica: è una guida, non un output |
| 2 | **Descriptive** | Graphical Summary (hist+normal, box), stem-leaf, dotplot, interval, probability plot | Explore (hist+normal, stem-leaf, box, Q-Q, detrended Q-Q, spread-level) | hist normal/kdensity, kdensity, box, dotplot, stem, qnorm | hist+normal, stem-leaf, box, quantile, normal probability, distribution fitting/tails | hist, density, box, violin, dot, QQ, bar | distribution plot, box+violin+jitter, QQ, dot, interval, raincloud | bar medie, interval, box/notch/violin, dot, ECDF, hist (prima var) con normale/KDE, QQ normale/detrendizzato (max 8) | stem-leaf, raincloud, spread-level, scatter matrix |
| 3 | **Distribution Fit** | Individual Distribution Identification (PDF/CDF, probability plot) | P-P/Q-Q; Explore | `qnorm`, `pnorm`, `qchi` | Distribution Fitting + QQ/probability + tails | QQ | QQ | QQ/probability | PDF/CDF fittata, P-P, confronto distribuzioni, tail areas |
| 4 | **T-Test** | individual value plot, box, interval, dotplot | box, error bar, bar with CI, QQ | box, dotplot, twoway, `stripplot` est. | box, means plot, quantile | box/violin/raincloud, bar with error, QQ | box/violin/raincloud, interval, raincloud difference | 6 box variants + μ/0 rules | mean/interval plot, paired slope, difference density, effect-size forest |
| 5 | **ANOVA** | interval, individual value, box, residual four-in-one, Tukey plot, main effects | profile/EMM, box, error bar, post-hoc | `marginsplot`, box, `pwcompare`, residual | means plot, multiple range, box, residual, variance check | box/violin/raincloud, bar/error, assumption checks | box/violin/raincloud, interval, post-hoc | box, bar CI, rank box | post-hoc brackets/letters, effect-size forest, residual panel, EMM |
| 6 | **Factorial ANOVA** | interaction, main effects, interval, residual four-in-one | profile/interaction, EMM | `marginsplot`, interaction, `contrast` | means, interaction, residual | interaction/profile, EMM, raincloud | interaction, raincloud, post-hoc | line interaction | interaction with CI, cell-means bar, residual panel, simple effects |
| 7 | **ANCOVA** | interval/adjusted means, residual | profile/EMM, scatter, residual | `marginsplot`, `rvfplot` | means/adjusted means, residual | EMM, raincloud/box | raincloud/box, EMM | bar raw/adjusted with CI | adjusted-means interval, covariate profile, residual diagnostics |
| 8 | **Repeated ANOVA** | interval, profile, individual value | profile with within CI | `marginsplot`, twoway | means/profile, box | profile, raincloud, QQ | profile/raincloud, post-hoc | bar CI, subject trajectories | within-subject CI, profile with error bars, change plot |
| 9 | **Mixed ANOVA** | interaction, interval, residual | profile/EMM | `marginsplot`, interaction | interaction/means | interaction, EMM, raincloud | interaction, EMM, raincloud | interaction, trajectories | EMM with CI, caterpillar, residual |
| 10 | **Non-parametric RM** | box, dotplot | box, medians | box, dotplot, `signtest` no plot | box, means/median plot | box/violin/raincloud | box/violin/raincloud, post-hoc | rank bar, discordant bar, proportion bar, rank box | post-hoc comparison, rank violin, discordant heatmap |
| 11 | **TOST** | equivalence interval (generic) | interval/error bar | `tost` est. + twoway | equivalence/interval | TOST module (est.) | n.p. dedicated | bar difference+CI+margins | equivalence region shading, forest/interval, one-sided p |
| 12 | **Regression** | fitted line, residual four-in-one, matrix plot | scatter+fit, partial plots, residual, P-P | `lfit`/`qfit`, `rvfplot`, `lvr2plot`, `acprplot`, `qnorm` | fitted model, residual, influence, lack-of-fit | scatter+fit, residual, QQ | scatter+fit/CI, residual, QQ | scatter fit/robust/band/equation/R²/N, observed-fitted, residual, box, QQ, scale-location, leverage, Cook, partial residual | coefficient forest, pannello unico |
| 13 | **Correlation** | matrix plot, scatter, fitted line | scatter matrix, correlation matrix | `graph matrix`, twoway | scatterplot matrix, correlation matrix | correlation matrix plot, scatter | correlation matrix, scatter | raw scatter, rank score, box, heatmap | scatter matrix, fit/LOESS, ellipse, partial network |
| 14 | **Logistic** | binary fitted line, ROC/classification (modulo) | ROC, classification, probability curve | `lroc`, `roctab`, `marginsplot` | fitted model, ROC/classification | GAMLj predicted/ROC (est.) | logistic plots/ROC (dove previsto) | probability curve + binary markers, ROC con AUC, calibrazione | confusion heatmap, OR forest, marginal effects |
| 15 | **Count Regression** | Poisson/NB residual plots | GENLIN profile/residual | `marginsplot`, `estat`, `rvfplot` | fitted model/residual | GAMLj predicted/residual | GLM predicted/residual | observed-fitted, residual-fitted | rootogram, marginal effects, dispersion |
| 16 | **Ordinal Logistic** | ordinal fitted probabilities | GENLIN profile | `marginsplot`, `predict` | fitted probabilities | GAMLj/ordinal module | ordinal module plots | category probability curves | CI bands, category heatmap, observed vs predicted |
| 17 | **LMM** | residual, interval, random effects | MIXED profile, EMM, residual | `marginsplot`, `predict`, caterpillar est. | variance components/means | GAMLj EMM/caterpillar (est.) | raincloud, EMM, caterpillar (dove previsto) | observed-fitted, residual, group means, QQ | caterpillar, EMM, ICC plot, residual by group |
| 18 | **GEE** | GEE residual/means | GEE profile/EMM | `xtgee`, `marginsplot` | marginal means/residual | GAMLj marginal means (est.) | GEE marginal means (dove previsto) | observed-fitted, cluster observed/predicted bars | cluster profiles, marginal effects, working correlation |
| 19 | **Multivariate** | scree, score, loading plot | Factor scree/loading/component | `screeplot`, `loadingplot`, `scoreplot`, biplot est. | scree, loadings, biplot (modulo) | PCA/EFA loadings (est.) | scree, loadings, biplot, parallel analysis | scree, score, loadings heatmap, biplot, EFA parallel/variance/communalities, alpha item charts | loading plot with CI, advanced adequacy diagnostics |
| 20 | **Chi-Square** | bar, stacked bar, mosaic (modulo) | bar, clustered/stacked, mosaic (dove previsto) | `graph bar`, `mosaic` est. | bar, pie, mosaic, skychart | bar, mosaic (est.) | bar, heatmap (dove previsto) | observed/expected grouped bars, mosaic | association plot, fourfold, Fisher annotation |
| 21 | **Contingency** | mosaic/association (modulo) | crosstabs + bar | `mosaic` est., `tabplot` est. | mosaic, skychart, association | contingency bar/heatmap (est.) | contingency bar/heatmap | residual heatmap, mosaic, association residuals | fourfold, correspondence analysis, expected heatmap |
| 22 | **Agreement** | agreement/measurement plots, scatter | scatter, Bland–Altman via Chart Builder | `blandaltman` est., twoway | measurement/agreement plots | blandr module: BA, diff histogram/QQ | agreement/Bland–Altman (dove previsto) | Bland–Altman, kappa heatmap, ICC scatter | LoA CI, trend/proportional bias, ICC/forest, identity x=y |
| 23 | **Survival (KM)** | survival plot, hazard plot | KM, log-rank, Cox | `sts graph`, `stcurve`, risk table | survival module plots | survival module | survival module | KM + CI + censor + mediane, risk table | log-rank p, competing risks, RMST |
| 24 | **Cox** | forest/HR? residual? | forest, survival, Cox diagnostics | `stcox`, `stcurve`, `estat phtest`, Schoenfeld | forest/HR, residual (modulo) | Cox forest (est.) | Cox forest, diagnostics (dove previsto) | forest HR/CI/ref, baseline hazard/survival, Schoenfeld | martingale, predicted survival |
| 25 | **Stratified Cox** | forest, stratified survival | stratified Cox/KM | `stcox, strata`, `stcurve` | forest/HR per stratum | Cox/strata (est.) | Cox/strata | forest + KM per stratum + risk table | baseline per stratum, Schoenfeld per strato |
| 26 | **Time-Dependent Cox** | n.p. dedicated | Cox with time-dependent covariate | `stcox` time-varying, `stcurve` | n.p. dedicated | Cox est. | Cox est. | forest | time-varying effect plot, Schoenfeld, predicted survival |
| 27 | **Parametric Survival** | distribution fit, survival/hazard | AFT/parametric survival | `streg`, `stcurve` | distribution fitting/survival | survival module | survival/parametric (dove previsto) | survival profiles, hazard, cumulative hazard | fitted PDF/hist, QQ, hazard CI, median survival |
| 28 | **Time Series** | time series plot, ACF/PACF, decomposition, forecast | sequence charts, ACF/PACF, decomposition, forecast | `tsline`, `ac`, `pac`, `forecast` | time series plots, ACF/PACF, forecast | Time Series module (ACF/PACF/ARIMA) | Time Series module (ACF/PACF/ARIMA/spectral) | ACF, ARIMA forecast, simple forecast | PACF, decomposition, residual ACF/QQ, accuracy, spectral |
| 29 | **Missing Data (MI)** | missing data analysis (modulo) | missing pattern, imputation | `mi`, `mimrplot` est. | missing data (modulo) | missing module (mice) | missing data module | observed/completed hist, missingness bars | missingness matrix/pattern, convergence, overlay, pooled forest |
| 30 | **Sample Size / Power** | Power and Sample Size (power curve) | SamplePower (separate) | `power` (power curve) | Sample Size Determination (power curves) | power module (est.) | power module (dove previsto) | power curve + target + design | precision curve, sensitivity, design table |
| 31 | **Resampling** | bootstrap (dove previsto) | bootstrap in procedure (no dedicated) | `bootstrap`, `permute`, graph hist | resampling (modulo) | bootstrap module (est.) | bootstrap (dove previsto) | bootstrap/permutation hist + observed/CI | density/QQ, BCa, p annotation, null overlay |

## 3. Cosa hanno in più, in sintesi

- **Descrittive**: stem-and-leaf, spread-vs-level, tail areas, outlier plot sigma, raincloud, scatter matrix. Noi abbiamo istogramma con normale/KDE, box/notch/violin, dotplot, ECDF, interval plot, Q-Q normale/detrendizzato, barre con IC.
- **Confronti**: interval/point-range plot, paired slope, post-hoc bracket/lettere, EMM con IC, diagnostica residui. Noi abbiamo box, barre con IC, interaction line, traiettorie.
- **Regressione**: coefficient forest e pannello unico. Noi abbiamo fit/bande/equazione/R²/N, residui vs fitted, box, QQ, scale-location, leverage, Cook e residui parziali.
- **Categoriche**: fourfold, correspondence analysis e skychart. Noi abbiamo barre affiancate, mosaico, residui di associazione e heatmap dei residui.
- **Survival**: log-rank annotation, competing risks/RMST e martingale. Noi abbiamo KM/CI/censura/mediane, risk table, forest, baseline e Schoenfeld.
- **Multivariate**: loading plot con IC e diagnostica avanzata. Noi abbiamo scree, score, loadings heatmap, biplot, parallel analysis e grafici alpha/EFA.
- **Missing**: pattern matrix, convergence/trace, overlay, pooled forest. Noi abbiamo due istogrammi e missingness bar.
- **Time series**: PACF, decomposition, residual diagnostics, spectral. Noi abbiamo ACF e forecast line.

## 4. Priorità di implementazione suggerita

1. **P0 (completato il 2026-10-31)**: bar sort, heatmap sort, score labels/ellipse, residual `showPoints`, survival mediane, scatter `pointLabels`; aggiunti KDE, Q-Q detrendizzato, interval, dot, ECDF.
2. **P1 residuo**: stem-and-leaf, spread-vs-level, raincloud, scatter matrix, EMM/post-hoc, fourfold, missingness matrix, PACF/decomposition, precision curve.
3. **P2**: raincloud, box+violin, heatmap clustering, scatter matrix, resampling density/QQ.

## 5. Caveat

- I grafici elencati per i programmi esterni sono **esempi documentati**, non un inventario esaustivo: molte funzioni dipendono dal modulo, dalla versione e dalle estensioni (soprattutto jamovi/JASP).
- «n.p.» non significa che il programma non possa produrre il grafico con codice/estensioni; significa che non è un comando dedicato del modulo base.
- Il confronto è per **capacità grafiche**, non per qualità statistica o completezza dell’output.
- La lista dei nostri grafici è verificata nel codice; le fonti esterne sono documentazione ufficiale, non test eseguiti in questa sede.
