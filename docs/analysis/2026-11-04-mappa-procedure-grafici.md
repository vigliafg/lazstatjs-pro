# Mappa procedure → grafici (2026-11-04)

Generata dall'inventario statico (`scripts/chart-inventory.mjs`), non a mano.

- **Procedure nel registro**: 72 (36 al baseline del piano `1ef2860` + 36 nuove)
- **Modelli `AnalysisChart`**: 349 (183 al baseline; +166 netti nella tornata)
- **Kind distinti**: 33
- **Legenda**: `●` = procedura nuova della tornata · **grassetto** = tipo di grafico con almeno un modello nuovo (tutte le righe con `●` hanno i grafici nuovi per definizione) · `—` = nessun grafico (solo `wizard`, per scelta)

| Procedura | Famiglia | Grafici (kind) | Modelli |
|---|---|---|---:|
| Wizard (`wizard`) | Guided | — | 0 |
| Descriptive (`descriptive`) | Descrittiva | **bar**, **pareto**, **box**, **dot**, **line**, interval, diamond, scatter, ecdf, histogram, shadowgram, scattermatrix, bubble, scatter3d, qq | 20 |
| Distribution Fit (`distfit`) | Descrittiva | qq, **line**, bar | 6 |
| Quality (SPC) (`quality`) | Descrittiva | **interval**, **line**, pareto, box, **bar**, histogram | 11 |
| ● Survey (complex samples) (`survey`) | Descrittiva | **forest**, **interval**, **bar** | 3 |
| ANCOVA (`ancova`) | Confronti | bar, line, scatter, qq | 4 |
| ANOVA (`anova`) | Confronti | **interval**, **bar**, **box**, diamond, circles, forest, scatter, qq | 13 |
| Equivalence (TOST) (`tost`) | Confronti | interval | 1 |
| Factorial ANOVA (`factorial`) | Confronti | line, **interval** | 2 |
| Mixed ANOVA (`mixedanova`) | Confronti | line | 2 |
| Non-parametric RM (`nonparamrm`) | Confronti | bar, heatmap, box | 5 |
| ● Proportions & rates (`proportions`) | Confronti | **interval** | 4 |
| Repeated ANOVA (`repeatedanova`) | Confronti | bar, line, interval | 3 |
| T-Test (`ttest`) | Confronti | **histogram**, **interval**, box, diamond | 14 |
| ● Variances (`variances`) | Confronti | **interval**, **box**, **forest** | 3 |
| Correlation (`correlation`) | Regressione | scatter, score, box, heatmap | 5 |
| Count Regression (`countreg`) | Regressione | scatter, qq, forest, bar | 6 |
| ● GAM / MARS (`mars`) | Regressione | **scatter**, **line**, **residual** | 3 |
| GEE (`gee`) | Regressione | scatter, bar, interval, forest, qq | 6 |
| ● GLM (`glm`) | Regressione | **scatter**, **residual**, **line** | 3 |
| ● GLMM (`glmm`) | Regressione | **scatter**, **interval**, **residual** | 4 |
| ● Instrumental Variables (`iv`) | Regressione | **scatter**, **residual** | 3 |
| Logistic Regression (`logistic`) | Regressione | line, heatmap, forest, bar | 7 |
| ● Mediation (`mediation`) | Regressione | **forest**, **bootstrap** | 2 |
| Mixed Model (LMM) (`lmm`) | Regressione | scatter, **interval**, bar, qq | 8 |
| ● Multinomial Logistic (`multinomial`) | Regressione | **bar**, **heatmap** | 3 |
| ● Nonlinear Regression (`nonlinear`) | Regressione | **scatter**, **residual** | 2 |
| Ordinal Logistic (`ordinal`) | Regressione | line, heatmap, forest | 4 |
| ● Panel Model (`panel`) | Regressione | **scatter**, **bar** | 3 |
| Partition (`partition`) | Regressione | tree, scatter, bar | 3 |
| ● PLS Regression (`pls`) | Regressione | **scatter**, **line**, **heatmap** | 3 |
| ● Propensity Score (`propensity`) | Regressione | **dot**, **histogram**, **interval** | 4 |
| ● Quantile Regression (`quantile`) | Regressione | **scatter**, **residual** | 2 |
| Regression (`regression`) | Regressione | **line**, **bar**, **scatter**, **residual**, box, qq | 15 |
| ● Tobit / Selection (`selection`) | Regressione | **scatter**, **histogram** | 4 |
| ● Canonical Correlation (`canonical`) | Multivariata | **scatter**, **bar** | 3 |
| Cluster Analysis (`cluster`) | Multivariata | dendrogram, line, **bar**, **scatter** | 5 |
| ● Conjoint Analysis (`conjoint`) | Multivariata | **bar** | 2 |
| ● Correspondence Analysis (`correspondence`) | Multivariata | **scatter**, **heatmap** | 2 |
| Discriminant / MANOVA (`discriminant`) | Multivariata | **line**, scatter, heatmap | 4 |
| ● Item Response Theory (`irt`) | Multivariata | **bar**, **line** | 3 |
| ● Latent Class (`latentclass`) | Multivariata | **bar**, **line** | 3 |
| ● Multidimensional Scaling (`mds`) | Multivariata | **scatter**, **scree** | 2 |
| Multivariate (`multivariate`) | Multivariata | heatmap, line, bar, scree, score, scatter | 12 |
| ● SEM / CFA (`sem`) | Multivariata | **bar**, **heatmap** | 3 |
| Agreement (`agreement`) | Categorica | bland, interval, heatmap, scatter | 6 |
| Chi-Square (χ²) (`chisquare`) | Categorica | **bar**, mosaic, **pareto** | 4 |
| Contingency (R×C) (`contingency`) | Categorica | **heatmap**, mosaic, **bar**, scatter, **forest**, **line** | 9 |
| ● Log-linear (`loglinear`) | Categorica | **heatmap**, **bar** | 2 |
| ● Accelerated Life Testing (`alt`) | Sopravvivenza | **forest**, **bar**, **scatter** | 3 |
| ● Competing Risks (`competing`) | Sopravvivenza | **line**, **forest** | 2 |
| Cox (PH) (`cox`) | Sopravvivenza | **bar**, **forest**, line, scatter | 8 |
| Parametric Survival (`parametric`) | Sopravvivenza | survival, line, forest, bar, qq | 7 |
| ● Recurrent Events (`recurrent`) | Sopravvivenza | **forest**, **line** | 2 |
| ● Reliability Growth & RBD (`reliability`) | Sopravvivenza | **line**, **bar** | 2 |
| Stratified Cox (`stratcox`) | Sopravvivenza | forest, survival, line, risk | 4 |
| Survival (KM) (`survival`) | Sopravvivenza | **survival**, **bar**, risk | 7 |
| Time-Dependent Cox (`tdcox`) | Sopravvivenza | forest | 1 |
| ● GARCH (`garch`) | Serie temporali | **line**, **acf**, **qq** | 3 |
| ● State-Space & Markov (`statespace`) | Serie temporali | **line** | 3 |
| Time Series (`timeseries`) | Serie temporali | **line**, acf, bar, **scatter** | 14 |
| ● VAR / VECM (`var`) | Serie temporali | **bar**, **line** | 3 |
| Missing Data (MI) (`mi`) | Dati mancanti | **bar**, **missingness**, **forest**, histogram, line, ecdf, dot | 13 |
| Resampling (`resampling`) | Disegno e potenza | bootstrap, qq | 3 |
| Response Surface (DOE) (`doe`) | Disegno e potenza | **scatter**, **heatmap**, surface, bar | 5 |
| Sample Size / Power (`samplesize`) | Disegno e potenza | power, line | 3 |
| ● Choice / MaxDiff (`choice`) | Machine learning | **bar**, **interval**, **forest** | 4 |
| ● Machine Learning (`ml`) | Machine learning | **heatmap**, **bar**, **scatter** | 5 |
| ● Text Mining (`text`) | Machine learning | **bar**, **heatmap** | 4 |
| ● Bayesian Analysis (`bayes`) | Avanzata | **histogram**, **interval**, **scatter**, **line** | 5 |
| ● Meta-Analysis (`meta`) | Avanzata | **forest**, **scatter**, **bar** | 3 |
| ● Spatial Statistics (`spatial`) | Avanzata | **scatter**, **line**, **bar**, **forest** | 4 |

