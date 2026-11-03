# Inventario dei grafici delle procedure

Sorgente: scansione statica di `src/analyses/*/` (esclusi i test).
Comando: `npm run chart:inventory`.

## Totali

- Analisi con almeno un grafico: **71**
- Modelli `AnalysisChart` emessi: **326**
- Kind distinti: **32**

## Grafici per analisi

| Analisi | Grafici |
|---|---:|
| `agreement` | 6 |
| `alt` | 2 |
| `ancova` | 4 |
| `anova` | 11 |
| `bayes` | 4 |
| `canonical` | 2 |
| `chisquare` | 3 |
| `choice` | 4 |
| `cluster` | 3 |
| `competing` | 2 |
| `conjoint` | 2 |
| `contingency` | 8 |
| `correlation` | 5 |
| `correspondence` | 2 |
| `countreg` | 6 |
| `cox` | 8 |
| `descriptive` | 20 |
| `discriminant` | 4 |
| `distfit` | 5 |
| `doe` | 4 |
| `factorial` | 2 |
| `garch` | 2 |
| `gee` | 6 |
| `glm` | 3 |
| `glmm` | 4 |
| `irt` | 2 |
| `iv` | 2 |
| `latentclass` | 2 |
| `lmm` | 8 |
| `logistic` | 7 |
| `loglinear` | 2 |
| `mars` | 3 |
| `mds` | 2 |
| `mediation` | 2 |
| `meta` | 3 |
| `mi` | 13 |
| `mixedanova` | 2 |
| `ml` | 5 |
| `multinomial` | 2 |
| `multivariate` | 12 |
| `nonlinear` | 2 |
| `nonparamrm` | 5 |
| `ordinal` | 4 |
| `panel` | 3 |
| `parametric` | 7 |
| `partition` | 3 |
| `pls` | 2 |
| `propensity` | 4 |
| `proportions` | 4 |
| `quality` | 11 |
| `quantile` | 2 |
| `recurrent` | 2 |
| `regression` | 14 |
| `reliability` | 2 |
| `repeatedanova` | 3 |
| `resampling` | 3 |
| `samplesize` | 3 |
| `selection` | 4 |
| `sem` | 2 |
| `spatial` | 3 |
| `statespace` | 3 |
| `stratcox` | 4 |
| `survey` | 2 |
| `survival` | 7 |
| `tdcox` | 1 |
| `text` | 4 |
| `timeseries` | 14 |
| `tost` | 1 |
| `ttest` | 13 |
| `var` | 3 |
| `variances` | 2 |

## Kind usati

| Kind | Modelli |
|---|---:|
| `'dendrogram' as const` | 1 |
| `acf` | 4 |
| `bar` | 61 |
| `bland` | 1 |
| `bootstrap` | 3 |
| `box` | 16 |
| `bubble` | 1 |
| `circles` | 1 |
| `diamond` | 5 |
| `dot` | 4 |
| `ecdf` | 2 |
| `forest` | 22 |
| `heatmap` | 17 |
| `histogram` | 9 |
| `interval` | 29 |
| `line` | 58 |
| `missingness` | 3 |
| `mosaic` | 2 |
| `pareto` | 2 |
| `power` | 1 |
| `qq` | 11 |
| `residual` | 8 |
| `risk` | 2 |
| `scatter` | 47 |
| `scatter3d` | 1 |
| `scattermatrix` | 1 |
| `score` | 3 |
| `scree` | 2 |
| `shadowgram` | 1 |
| `surface` | 2 |
| `survival` | 5 |
| `tree` | 1 |

### `agreement` (6)

| Grafico | Kind | File |
|---|---|---|
| `agreement-bland` | `bland` | `src/analyses/agreement/run.tsx:29` |
| `agreement-bland-ci` | `interval` | `src/analyses/agreement/run.tsx:56` |
| `agreement-kappa` | `heatmap` | `src/analyses/agreement/run.tsx:100` |
| `agreement-kappa-ci` | `interval` | `src/analyses/agreement/run.tsx:110` |
| `agreement-icc` | `scatter` | `src/analyses/agreement/run.tsx:140` |
| `agreement-icc-ci` | `interval` | `src/analyses/agreement/run.tsx:159` |

### `alt` (2)

| Grafico | Kind | File |
|---|---|---|
| `alt-coefficients` | `forest` | `src/analyses/alt/run.tsx:88` |
| `alt-acceleration` | `bar` | `src/analyses/alt/run.tsx:105` |

### `ancova` (4)

| Grafico | Kind | File |
|---|---|---|
| `ancova-means` | `bar` | `src/analyses/ancova/run.tsx:145` |
| `ancova-profile` | `line` | `src/analyses/ancova/run.tsx:158` |
| `ancova-residual-fitted` | `scatter` | `src/analyses/ancova/run.tsx:172` |
| `ancova-residual-qq` | `qq` | `src/analyses/ancova/run.tsx:187` |

### `anova` (11)

| Grafico | Kind | File |
|---|---|---|
| `anom-decision-lines` | `interval` | `src/analyses/anova/anom.ts:48` |
| `nested-anova-means` | `interval` | `src/analyses/anova/nested.ts:58` |
| `anova-box` | `box` | `src/analyses/anova/run.tsx:270` |
| `anova-means` | `bar` | `src/analyses/anova/run.tsx:280` |
| `anova-diamond` | `diamond` | `src/analyses/anova/run.tsx:290` |
| `anova-circles` | `circles` | `src/analyses/anova/run.tsx:303` |
| `anova-posthoc-forest` | `forest` | `src/analyses/anova/run.tsx:320` |
| `anova-residual-fitted` | `scatter` | `src/analyses/anova/run.tsx:338` |
| `anova-residual-qq` | `qq` | `src/analyses/anova/run.tsx:354` |
| `anova-rank-box` | `box` | `src/analyses/anova/run.tsx:373` |
| `mood-box` | `box` | `src/analyses/anova/run.tsx:460` |

### `bayes` (4)

| Grafico | Kind | File |
|---|---|---|
| `bayes-posterior-density` | `histogram` | `src/analyses/bayes/run.tsx:82` |
| `bayes-interval` | `interval` | `src/analyses/bayes/run.tsx:94` |
| `bayes-groups` | `interval` | `src/analyses/bayes/run.tsx:113` |
| `bayes-joint` | `scatter` | `src/analyses/bayes/run.tsx:136` |

### `canonical` (2)

| Grafico | Kind | File |
|---|---|---|
| `canonical-scores` | `scatter` | `src/analyses/canonical/run.tsx:49` |
| `canonical-loadings` | `bar` | `src/analyses/canonical/run.tsx:64` |

### `chisquare` (3)

| Grafico | Kind | File |
|---|---|---|
| `chisq-observed-expected` | `bar` | `src/analyses/chisquare/run.tsx:123` |
| `chisq-mosaic` | `mosaic` | `src/analyses/chisquare/run.tsx:149` |
| `gof-bar` | `bar` | `src/analyses/chisquare/run.tsx:214` |

### `choice` (4)

| Grafico | Kind | File |
|---|---|---|
| `choice-maxdiff-scores` | `bar` | `src/analyses/choice/run.tsx:45` |
| `choice-maxdiff-shares` | `interval` | `src/analyses/choice/run.tsx:60` |
| `choice-coefficients` | `forest` | `src/analyses/choice/run.tsx:120` |
| `choice-shares` | `bar` | `src/analyses/choice/run.tsx:137` |

### `cluster` (3)

| Grafico | Kind | File |
|---|---|---|
| `cluster-dendrogram` | `'dendrogram' as const` | `src/analyses/cluster/run.tsx:93` |
| `cluster-profile` | `line` | `src/analyses/cluster/run.tsx:107` |
| `cluster-sizes` | `bar` | `src/analyses/cluster/run.tsx:122` |

### `competing` (2)

| Grafico | Kind | File |
|---|---|---|
| `competing-cif` | `line` | `src/analyses/competing/run.tsx:81` |
| `competing-forest` | `forest` | `src/analyses/competing/run.tsx:98` |

### `conjoint` (2)

| Grafico | Kind | File |
|---|---|---|
| `conjoint-utilities` | `bar` | `src/analyses/conjoint/run.tsx:59` |
| `conjoint-importance` | `bar` | `src/analyses/conjoint/run.tsx:75` |

### `contingency` (8)

| Grafico | Kind | File |
|---|---|---|
| `contingency-residuals` | `heatmap` | `src/analyses/contingency/run.tsx:133` |
| `contingency-mosaic` | `mosaic` | `src/analyses/contingency/run.tsx:146` |
| `contingency-association` | `bar` | `src/analyses/contingency/run.tsx:156` |
| `contingency-ca` | `scatter` | `src/analyses/contingency/run.tsx:166` |
| `contingency-ca-inertia` | `bar` | `src/analyses/contingency/run.tsx:176` |
| `contingency-mh-forest` | `forest` | `src/analyses/contingency/run.tsx:227` |
| `contingency-trend-line` | `line` | `src/analyses/contingency/run.tsx:283` |
| `contingency-exact-residuals` | `heatmap` | `src/analyses/contingency/run.tsx:346` |

### `correlation` (5)

| Grafico | Kind | File |
|---|---|---|
| `corr-raw-scatter` | `scatter` | `src/analyses/correlation/run.tsx:140` |
| `corr-rank-scatter` | `score` | `src/analyses/correlation/run.tsx:153` |
| `corr-box` | `box` | `src/analyses/correlation/run.tsx:172` |
| `corr-pair-${i + 1}-${j + 1}` | `scatter` | `src/analyses/correlation/run.tsx:191` |
| `corr-heatmap` | `heatmap` | `src/analyses/correlation/run.tsx:222` |

### `correspondence` (2)

| Grafico | Kind | File |
|---|---|---|
| `correspondence-biplot` | `scatter` | `src/analyses/correspondence/run.tsx:38` |
| `correspondence-residual-heatmap` | `heatmap` | `src/analyses/correspondence/run.tsx:63` |

### `countreg` (6)

| Grafico | Kind | File |
|---|---|---|
| `count-observed-fitted` | `scatter` | `src/analyses/countreg/run.tsx:51` |
| `count-residual-fitted` | `scatter` | `src/analyses/countreg/run.tsx:61` |
| `count-residual-qq` | `qq` | `src/analyses/countreg/run.tsx:74` |
| `count-irr-forest` | `forest` | `src/analyses/countreg/run.tsx:88` |
| `count-dispersion` | `bar` | `src/analyses/countreg/run.tsx:102` |
| `count-rootogram` | `bar` | `src/analyses/countreg/run.tsx:143` |

### `cox` (8)

| Grafico | Kind | File |
|---|---|---|
| `frailty-effects` | `bar` | `src/analyses/cox/run.tsx:161` |
| `frailty-forest` | `forest` | `src/analyses/cox/run.tsx:176` |
| `cox-forest` | `forest` | `src/analyses/cox/run.tsx:220` |
| `cox-baseline-hazard` | `line` | `src/analyses/cox/run.tsx:238` |
| `cox-baseline-survival` | `line` | `src/analyses/cox/run.tsx:261` |
| `cox-schoenfeld-${index + 1}` | `scatter` | `src/analyses/cox/run.tsx:294` |
| `cox-martingale` | `scatter` | `src/analyses/cox/run.tsx:330` |
| `cox-predicted-survival` | `line` | `src/analyses/cox/run.tsx:367` |

### `descriptive` (20)

| Grafico | Kind | File |
|---|---|---|
| `freq-bar-${index + 1}` | `bar` | `src/analyses/descriptive/run.tsx:89` |
| `freq-cumulative` | `pareto` | `src/analyses/descriptive/run.tsx:116` |
| `outliers-box` | `box` | `src/analyses/descriptive/run.tsx:182` |
| `outliers-strip-${index + 1}` | `dot` | `src/analyses/descriptive/run.tsx:198` |
| `runs-sequence-${index + 1}` | `line` | `src/analyses/descriptive/run.tsx:259` |
| `runs-lengths-${index + 1}` | `bar` | `src/analyses/descriptive/run.tsx:273` |
| `desc-means` | `bar` | `src/analyses/descriptive/run.tsx:383` |
| `desc-box` | `box` | `src/analyses/descriptive/run.tsx:392` |
| `desc-interval` | `interval` | `src/analyses/descriptive/run.tsx:415` |
| `desc-diamond` | `diamond` | `src/analyses/descriptive/run.tsx:423` |
| `desc-dot` | `dot` | `src/analyses/descriptive/run.tsx:439` |
| `desc-spread-level` | `scatter` | `src/analyses/descriptive/run.tsx:451` |
| `desc-pair-${i + 1}-${j + 1}` | `scatter` | `src/analyses/descriptive/run.tsx:476` |
| `desc-ecdf` | `ecdf` | `src/analyses/descriptive/run.tsx:503` |
| `desc-hist-${r.name}` | `histogram` | `src/analyses/descriptive/run.tsx:517` |
| `desc-shadow-${r.name}` | `shadowgram` | `src/analyses/descriptive/run.tsx:528` |
| `desc-matrix` | `scattermatrix` | `src/analyses/descriptive/run.tsx:594` |
| `desc-bubble` | `bubble` | `src/analyses/descriptive/run.tsx:627` |
| `desc-scatter3d` | `scatter3d` | `src/analyses/descriptive/run.tsx:645` |
| `desc-qq-${r.name}` | `qq` | `src/analyses/descriptive/run.tsx:662` |

### `discriminant` (4)

| Grafico | Kind | File |
|---|---|---|
| `mancova-adjusted-means` | `line` | `src/analyses/discriminant/mancova.ts:71` |
| `discriminant-canonical` | `scatter` | `src/analyses/discriminant/run.tsx:92` |
| `discriminant-profile` | `line` | `src/analyses/discriminant/run.tsx:113` |
| `discriminant-coefficients` | `heatmap` | `src/analyses/discriminant/run.tsx:128` |

### `distfit` (5)

| Grafico | Kind | File |
|---|---|---|
| `distfit-probability` | `qq` | `src/analyses/distfit/run.tsx:88` |
| `distfit-pp` | `qq` | `src/analyses/distfit/run.tsx:104` |
| `distfit-density` | `line` | `src/analyses/distfit/run.tsx:121` |
| `distfit-criteria` | `bar` | `src/analyses/distfit/run.tsx:135` |
| `ks-ecdf` | `line` | `src/analyses/distfit/run.tsx:196` |

### `doe` (4)

| Grafico | Kind | File |
|---|---|---|
| `doe-design-map` | `scatter` | `src/analyses/doe/run.tsx:68` |
| `doe-surface` | `surface` | `src/analyses/doe/run.tsx:145` |
| `doe-contour` | `surface` | `src/analyses/doe/run.tsx:170` |
| `doe-coefficients` | `bar` | `src/analyses/doe/run.tsx:183` |

### `factorial` (2)

| Grafico | Kind | File |
|---|---|---|
| `factorial-interaction` | `line` | `src/analyses/factorial/run.tsx:109` |
| `factorial-cells` | `interval` | `src/analyses/factorial/run.tsx:126` |

### `garch` (2)

| Grafico | Kind | File |
|---|---|---|
| `garch-volatility` | `line` | `src/analyses/garch/run.tsx:49` |
| `garch-residual-acf` | `acf` | `src/analyses/garch/run.tsx:59` |

### `gee` (6)

| Grafico | Kind | File |
|---|---|---|
| `gee-observed-fitted` | `scatter` | `src/analyses/gee/run.tsx:75` |
| `gee-cluster-means` | `bar` | `src/analyses/gee/run.tsx:85` |
| `gee-cluster-residuals` | `interval` | `src/analyses/gee/run.tsx:103` |
| `gee-coefficient-forest` | `forest` | `src/analyses/gee/run.tsx:117` |
| `gee-residual-qq` | `qq` | `src/analyses/gee/run.tsx:131` |
| `gee-marginal` | `bar` | `src/analyses/gee/run.tsx:151` |

### `glm` (3)

| Grafico | Kind | File |
|---|---|---|
| `glm-fitted` | `scatter` | `src/analyses/glm/run.tsx:65` |
| `glm-residuals` | `residual` | `src/analyses/glm/run.tsx:80` |
| `glm-profile` | `line` | `src/analyses/glm/run.tsx:111` |

### `glmm` (4)

| Grafico | Kind | File |
|---|---|---|
| `glmm-observed-fitted` | `scatter` | `src/analyses/glmm/run.tsx:112` |
| `glmm-random-effects` | `interval` | `src/analyses/glmm/run.tsx:131` |
| `glmm-residual-fitted` | `residual` | `src/analyses/glmm/run.tsx:145` |
| `glmm-random-slopes` | `interval` | `src/analyses/glmm/run.tsx:171` |

### `irt` (2)

| Grafico | Kind | File |
|---|---|---|
| `irt-items` | `bar` | `src/analyses/irt/run.tsx:43` |
| `irt-information` | `line` | `src/analyses/irt/run.tsx:55` |

### `iv` (2)

| Grafico | Kind | File |
|---|---|---|
| `iv-observed-fitted` | `scatter` | `src/analyses/iv/run.tsx:93` |
| `iv-residuals` | `residual` | `src/analyses/iv/run.tsx:109` |

### `latentclass` (2)

| Grafico | Kind | File |
|---|---|---|
| `latentclass-proportions` | `bar` | `src/analyses/latentclass/run.tsx:66` |
| `latentclass-probabilities` | `line` | `src/analyses/latentclass/run.tsx:81` |

### `lmm` (8)

| Grafico | Kind | File |
|---|---|---|
| `lmm-observed-fitted` | `scatter` | `src/analyses/lmm/randomSlope.ts:100` |
| `lmm-random-slopes` | `interval` | `src/analyses/lmm/randomSlope.ts:112` |
| `lmm-random-intercepts` | `interval` | `src/analyses/lmm/randomSlope.ts:121` |
| `lmm-observed-fitted` | `scatter` | `src/analyses/lmm/run.tsx:55` |
| `lmm-residual-fitted` | `scatter` | `src/analyses/lmm/run.tsx:65` |
| `lmm-group-means` | `bar` | `src/analyses/lmm/run.tsx:75` |
| `lmm-random-effects` | `interval` | `src/analyses/lmm/run.tsx:101` |
| `lmm-residual-qq` | `qq` | `src/analyses/lmm/run.tsx:116` |

### `logistic` (7)

| Grafico | Kind | File |
|---|---|---|
| `logistic-curve` | `line` | `src/analyses/logistic/run.tsx:98` |
| `logistic-roc` | `line` | `src/analyses/logistic/run.tsx:119` |
| `logistic-lift` | `line` | `src/analyses/logistic/run.tsx:160` |
| `logistic-calibration` | `line` | `src/analyses/logistic/run.tsx:186` |
| `logistic-confusion` | `heatmap` | `src/analyses/logistic/run.tsx:224` |
| `logistic-or-forest` | `forest` | `src/analyses/logistic/run.tsx:259` |
| `logistic-marginal` | `bar` | `src/analyses/logistic/run.tsx:279` |

### `loglinear` (2)

| Grafico | Kind | File |
|---|---|---|
| `loglinear-residuals` | `heatmap` | `src/analyses/loglinear/run.tsx:56` |
| `loglinear-observed-expected` | `bar` | `src/analyses/loglinear/run.tsx:68` |

### `mars` (3)

| Grafico | Kind | File |
|---|---|---|
| `mars-fitted` | `scatter` | `src/analyses/mars/run.tsx:102` |
| `mars-profile` | `line` | `src/analyses/mars/run.tsx:142` |
| `mars-residuals` | `residual` | `src/analyses/mars/run.tsx:157` |

### `mds` (2)

| Grafico | Kind | File |
|---|---|---|
| `mds-map` | `scatter` | `src/analyses/mds/run.tsx:44` |
| `mds-stress` | `scree` | `src/analyses/mds/run.tsx:63` |

### `mediation` (2)

| Grafico | Kind | File |
|---|---|---|
| `mediation-effects-forest` | `forest` | `src/analyses/mediation/run.tsx:141` |
| `mediation-bootstrap` | `bootstrap` | `src/analyses/mediation/run.tsx:161` |

### `meta` (3)

| Grafico | Kind | File |
|---|---|---|
| `meta-forest` | `forest` | `src/analyses/meta/run.tsx:40` |
| `meta-funnel` | `scatter` | `src/analyses/meta/run.tsx:65` |
| `meta-weights` | `bar` | `src/analyses/meta/run.tsx:81` |

### `mi` (13)

| Grafico | Kind | File |
|---|---|---|
| `mi-categorical-bars` | `bar` | `src/analyses/mi/run.tsx:75` |
| `mi-categorical-missing` | `bar` | `src/analyses/mi/run.tsx:85` |
| `mi-categorical-missingness-matrix` | `missingness` | `src/analyses/mi/run.tsx:95` |
| `mi-categorical-pooled-forest` | `forest` | `src/analyses/mi/run.tsx:112` |
| `mi-observed-density` | `histogram` | `src/analyses/mi/run.tsx:228` |
| `mi-completed-density` | `histogram` | `src/analyses/mi/run.tsx:237` |
| `mi-missingness` | `missingness` | `src/analyses/mi/run.tsx:247` |
| `mi-missingness-matrix` | `missingness` | `src/analyses/mi/run.tsx:259` |
| `mi-patterns` | `bar` | `src/analyses/mi/run.tsx:281` |
| `mi-trace` | `line` | `src/analyses/mi/run.tsx:300` |
| `mi-observed-completed` | `ecdf` | `src/analyses/mi/run.tsx:314` |
| `mi-pooled-forest` | `forest` | `src/analyses/mi/run.tsx:328` |
| `mi-strip` | `dot` | `src/analyses/mi/run.tsx:348` |

### `mixedanova` (2)

| Grafico | Kind | File |
|---|---|---|
| `mixed-interaction` | `line` | `src/analyses/mixedanova/run.tsx:89` |
| `mixed-trajectories` | `line` | `src/analyses/mixedanova/run.tsx:102` |

### `ml` (5)

| Grafico | Kind | File |
|---|---|---|
| `ml-confusion` | `heatmap` | `src/analyses/ml/run.tsx:89` |
| `ml-recall` | `bar` | `src/analyses/ml/run.tsx:108` |
| `ml-observed-predicted` | `scatter` | `src/analyses/ml/run.tsx:128` |
| `ml-residuals` | `scatter` | `src/analyses/ml/run.tsx:143` |
| `ml-importance` | `bar` | `src/analyses/ml/run.tsx:161` |

### `multinomial` (2)

| Grafico | Kind | File |
|---|---|---|
| `multinomial-probabilities` | `bar` | `src/analyses/multinomial/run.tsx:110` |
| `multinomial-accuracy` | `bar` | `src/analyses/multinomial/run.tsx:133` |

### `multivariate` (12)

| Grafico | Kind | File |
|---|---|---|
| `efa-loadings` | `heatmap` | `src/analyses/multivariate/run.tsx:98` |
| `efa-parallel` | `line` | `src/analyses/multivariate/run.tsx:108` |
| `efa-variance` | `bar` | `src/analyses/multivariate/run.tsx:118` |
| `efa-communalities` | `bar` | `src/analyses/multivariate/run.tsx:133` |
| `pca-scree` | `scree` | `src/analyses/multivariate/run.tsx:178` |
| `pca-score` | `score` | `src/analyses/multivariate/run.tsx:188` |
| `pca-loadings` | `heatmap` | `src/analyses/multivariate/run.tsx:208` |
| `pca-loading-plot` | `scatter` | `src/analyses/multivariate/run.tsx:218` |
| `pca-biplot` | `score` | `src/analyses/multivariate/run.tsx:252` |
| `alpha-items` | `bar` | `src/analyses/multivariate/run.tsx:299` |
| `alpha-correlations` | `heatmap` | `src/analyses/multivariate/run.tsx:311` |
| `alpha-if-deleted` | `bar` | `src/analyses/multivariate/run.tsx:329` |

### `nonlinear` (2)

| Grafico | Kind | File |
|---|---|---|
| `nonlinear-curve` | `scatter` | `src/analyses/nonlinear/run.tsx:82` |
| `nonlinear-residuals` | `residual` | `src/analyses/nonlinear/run.tsx:102` |

### `nonparamrm` (5)

| Grafico | Kind | File |
|---|---|---|
| `friedman-ranks` | `bar` | `src/analyses/nonparamrm/run.tsx:79` |
| `friedman-posthoc` | `heatmap` | `src/analyses/nonparamrm/run.tsx:88` |
| `mcnemar-discordant` | `bar` | `src/analyses/nonparamrm/run.tsx:150` |
| `cochran-proportions` | `bar` | `src/analyses/nonparamrm/run.tsx:210` |
| `jonckheere-groups` | `box` | `src/analyses/nonparamrm/run.tsx:273` |

### `ordinal` (4)

| Grafico | Kind | File |
|---|---|---|
| `ordinal-probabilities` | `line` | `src/analyses/ordinal/run.tsx:58` |
| `ordinal-probability-heatmap` | `heatmap` | `src/analyses/ordinal/run.tsx:79` |
| `ordinal-or-forest` | `forest` | `src/analyses/ordinal/run.tsx:93` |
| `ordinal-thresholds` | `forest` | `src/analyses/ordinal/run.tsx:107` |

### `panel` (3)

| Grafico | Kind | File |
|---|---|---|
| `panel-observed-fitted` | `scatter` | `src/analyses/panel/run.tsx:135` |
| `panel-entity-effects` | `bar` | `src/analyses/panel/run.tsx:156` |
| `panel-fe-re` | `bar` | `src/analyses/panel/run.tsx:189` |

### `parametric` (7)

| Grafico | Kind | File |
|---|---|---|
| `parametric-survival` | `survival` | `src/analyses/parametric/run.tsx:168` |
| `parametric-hazard` | `line` | `src/analyses/parametric/run.tsx:178` |
| `parametric-cumhazard` | `line` | `src/analyses/parametric/run.tsx:188` |
| `parametric-density` | `line` | `src/analyses/parametric/run.tsx:198` |
| `parametric-coefficients` | `forest` | `src/analyses/parametric/run.tsx:212` |
| `parametric-median` | `bar` | `src/analyses/parametric/run.tsx:228` |
| `parametric-qq` | `qq` | `src/analyses/parametric/run.tsx:244` |

### `partition` (3)

| Grafico | Kind | File |
|---|---|---|
| `partition-tree` | `tree` | `src/analyses/partition/run.tsx:70` |
| `partition-observed` | `scatter` | `src/analyses/partition/run.tsx:91` |
| `partition-importance` | `bar` | `src/analyses/partition/run.tsx:107` |

### `pls` (2)

| Grafico | Kind | File |
|---|---|---|
| `pls-observed-fitted` | `scatter` | `src/analyses/pls/run.tsx:93` |
| `pls-cumulative-r2` | `line` | `src/analyses/pls/run.tsx:118` |

### `propensity` (4)

| Grafico | Kind | File |
|---|---|---|
| `propensity-love` | `dot` | `src/analyses/propensity/run.tsx:125` |
| `propensity-score-treated` | `histogram` | `src/analyses/propensity/run.tsx:138` |
| `propensity-score-control` | `histogram` | `src/analyses/propensity/run.tsx:151` |
| `propensity-att` | `interval` | `src/analyses/propensity/run.tsx:164` |

### `proportions` (4)

| Grafico | Kind | File |
|---|---|---|
| `prop-one-interval` | `interval` | `src/analyses/proportions/run.tsx:90` |
| `prop-two-interval` | `interval` | `src/analyses/proportions/run.tsx:182` |
| `rate-one-interval` | `interval` | `src/analyses/proportions/run.tsx:212` |
| `rate-two-interval` | `interval` | `src/analyses/proportions/run.tsx:276` |

### `quality` (11)

| Grafico | Kind | File |
|---|---|---|
| `tolerance-interval` | `interval` | `src/analyses/quality/run.tsx:85` |
| `cusum-chart` | `line` | `src/analyses/quality/run.tsx:125` |
| `pareto-chart` | `pareto` | `src/analyses/quality/run.tsx:171` |
| `variab-box` | `box` | `src/analyses/quality/run.tsx:233` |
| `msa-variance` | `bar` | `src/analyses/quality/run.tsx:275` |
| `msa-operator-profile` | `line` | `src/analyses/quality/run.tsx:311` |
| `accept-oc` | `line` | `src/analyses/quality/run.tsx:354` |
| `accept-aoq` | `line` | `src/analyses/quality/run.tsx:370` |
| `mcontrol-chart` | `line` | `src/analyses/quality/run.tsx:417` |
| `capab-histogram` | `histogram` | `src/analyses/quality/run.tsx:459` |
| `control-chart` | `line` | `src/analyses/quality/run.tsx:520` |

### `quantile` (2)

| Grafico | Kind | File |
|---|---|---|
| `quantile-line` | `scatter` | `src/analyses/quantile/run.tsx:112` |
| `quantile-residuals` | `residual` | `src/analyses/quantile/run.tsx:139` |

### `recurrent` (2)

| Grafico | Kind | File |
|---|---|---|
| `recurrent-forest` | `forest` | `src/analyses/recurrent/run.tsx:94` |
| `recurrent-mcf` | `line` | `src/analyses/recurrent/run.tsx:115` |

### `regression` (14)

| Grafico | Kind | File |
|---|---|---|
| `penalized-path` | `line` | `src/analyses/regression/penalized.ts:62` |
| `penalized-coefficients-chart` | `bar` | `src/analyses/regression/penalized.ts:71` |
| `polynomial-curve` | `scatter` | `src/analyses/regression/polynomial.ts:57` |
| `polynomial-residuals` | `residual` | `src/analyses/regression/polynomial.ts:71` |
| `reg-scatter` | `scatter` | `src/analyses/regression/run.tsx:272` |
| `reg-observed-fitted` | `scatter` | `src/analyses/regression/run.tsx:308` |
| `reg-residual-fitted` | `residual` | `src/analyses/regression/run.tsx:319` |
| `reg-scale-location` | `scatter` | `src/analyses/regression/run.tsx:342` |
| `reg-residual-leverage` | `scatter` | `src/analyses/regression/run.tsx:363` |
| `reg-cooks` | `scatter` | `src/analyses/regression/run.tsx:389` |
| `reg-partial-${position + 1}` | `scatter` | `src/analyses/regression/run.tsx:418` |
| `reg-residual-box` | `box` | `src/analyses/regression/run.tsx:432` |
| `reg-residual-qq` | `qq` | `src/analyses/regression/run.tsx:447` |
| `selection-criterion` | `line` | `src/analyses/regression/selection.ts:61` |

### `reliability` (2)

| Grafico | Kind | File |
|---|---|---|
| `reliability-growth` | `line` | `src/analyses/reliability/run.tsx:44` |
| `reliability-rbd` | `bar` | `src/analyses/reliability/run.tsx:93` |

### `repeatedanova` (3)

| Grafico | Kind | File |
|---|---|---|
| `repeated-means` | `bar` | `src/analyses/repeatedanova/run.tsx:89` |
| `repeated-trajectories` | `line` | `src/analyses/repeatedanova/run.tsx:98` |
| `repeated-change` | `interval` | `src/analyses/repeatedanova/run.tsx:111` |

### `resampling` (3)

| Grafico | Kind | File |
|---|---|---|
| `resampling-bootstrap` | `bootstrap` | `src/analyses/resampling/run.tsx:44` |
| `resampling-permutation` | `bootstrap` | `src/analyses/resampling/run.tsx:59` |
| `resampling-bootstrap-qq` | `qq` | `src/analyses/resampling/run.tsx:75` |

### `samplesize` (3)

| Grafico | Kind | File |
|---|---|---|
| `samplesize-power` | `power` | `src/analyses/samplesize/run.tsx:45` |
| `samplesize-precision` | `line` | `src/analyses/samplesize/run.tsx:63` |
| `samplesize-sensitivity` | `line` | `src/analyses/samplesize/run.tsx:116` |

### `selection` (4)

| Grafico | Kind | File |
|---|---|---|
| `tobit-observed-fitted` | `scatter` | `src/analyses/selection/run.tsx:91` |
| `tobit-latent-observed` | `scatter` | `src/analyses/selection/run.tsx:115` |
| `heckman-observed-fitted` | `scatter` | `src/analyses/selection/run.tsx:253` |
| `heckman-imr` | `histogram` | `src/analyses/selection/run.tsx:272` |

### `sem` (2)

| Grafico | Kind | File |
|---|---|---|
| `sem-loadings` | `bar` | `src/analyses/sem/run.tsx:52` |
| `sem-residuals` | `heatmap` | `src/analyses/sem/run.tsx:68` |

### `spatial` (3)

| Grafico | Kind | File |
|---|---|---|
| `spatial-map` | `scatter` | `src/analyses/spatial/run.tsx:67` |
| `spatial-lisa` | `bar` | `src/analyses/spatial/run.tsx:85` |
| `spatial-sar-coefficients` | `forest` | `src/analyses/spatial/run.tsx:105` |

### `statespace` (3)

| Grafico | Kind | File |
|---|---|---|
| `statespace-local` | `line` | `src/analyses/statespace/run.tsx:60` |
| `statespace-markov` | `line` | `src/analyses/statespace/run.tsx:102` |
| `statespace-regimes` | `line` | `src/analyses/statespace/run.tsx:112` |

### `stratcox` (4)

| Grafico | Kind | File |
|---|---|---|
| `stratcox-forest` | `forest` | `src/analyses/stratcox/run.tsx:112` |
| `stratcox-km` | `survival` | `src/analyses/stratcox/run.tsx:125` |
| `stratcox-baseline` | `line` | `src/analyses/stratcox/run.tsx:138` |
| `stratcox-risk` | `risk` | `src/analyses/stratcox/run.tsx:152` |

### `survey` (2)

| Grafico | Kind | File |
|---|---|---|
| `survey-coefficients` | `forest` | `src/analyses/survey/run.tsx:76` |
| `survey-interval` | `interval` | `src/analyses/survey/run.tsx:97` |

### `survival` (7)

| Grafico | Kind | File |
|---|---|---|
| `survival-turnbull` | `survival` | `src/analyses/survival/run.tsx:86` |
| `survival-turnbull-mass` | `bar` | `src/analyses/survival/run.tsx:102` |
| `survival-life-curve` | `survival` | `src/analyses/survival/run.tsx:184` |
| `survival-life-events` | `bar` | `src/analyses/survival/run.tsx:193` |
| `survival-km` | `survival` | `src/analyses/survival/run.tsx:289` |
| `survival-rmst` | `bar` | `src/analyses/survival/run.tsx:298` |
| `survival-risk` | `risk` | `src/analyses/survival/run.tsx:308` |

### `tdcox` (1)

| Grafico | Kind | File |
|---|---|---|
| `tdcox-forest` | `forest` | `src/analyses/tdcox/run.tsx:43` |

### `text` (4)

| Grafico | Kind | File |
|---|---|---|
| `text-terms` | `bar` | `src/analyses/text/run.tsx:46` |
| `text-topic-prevalence` | `bar` | `src/analyses/text/run.tsx:65` |
| `text-document-topics` | `heatmap` | `src/analyses/text/run.tsx:83` |
| `text-similarity` | `heatmap` | `src/analyses/text/run.tsx:108` |

### `timeseries` (14)

| Grafico | Kind | File |
|---|---|---|
| `hw-series` | `line` | `src/analyses/timeseries/modes.tsx:51` |
| `unitroot-series` | `line` | `src/analyses/timeseries/modes.tsx:85` |
| `spectral-density` | `line` | `src/analyses/timeseries/modes.tsx:124` |
| `ts-acf-chart` | `acf` | `src/analyses/timeseries/run.tsx:134` |
| `ts-pacf-chart` | `acf` | `src/analyses/timeseries/run.tsx:154` |
| `ts-decomposition-trend` | `line` | `src/analyses/timeseries/run.tsx:178` |
| `ts-decomposition-components` | `line` | `src/analyses/timeseries/run.tsx:202` |
| `ts-residual-acf` | `acf` | `src/analyses/timeseries/run.tsx:225` |
| `ts-model-accuracy` | `bar` | `src/analyses/timeseries/run.tsx:255` |
| `ts-spectrum` | `line` | `src/analyses/timeseries/run.tsx:282` |
| `ts-rolling` | `line` | `src/analyses/timeseries/run.tsx:309` |
| `ts-arima-chart` | `line` | `src/analyses/timeseries/run.tsx:334` |
| `ts-simple-chart` | `line` | `src/analyses/timeseries/run.tsx:359` |
| `ts-arimax-scatter` | `scatter` | `src/analyses/timeseries/run.tsx:377` |

### `tost` (1)

| Grafico | Kind | File |
|---|---|---|
| `tost-difference` | `interval` | `src/analyses/tost/run.tsx:37` |

### `ttest` (13)

| Grafico | Kind | File |
|---|---|---|
| `sign-differences` | `histogram` | `src/analyses/ttest/run.tsx:59` |
| `ttest-one-box` | `box` | `src/analyses/ttest/run.tsx:121` |
| `ttest-one-mean` | `interval` | `src/analyses/ttest/run.tsx:137` |
| `ttest-one-diamond` | `diamond` | `src/analyses/ttest/run.tsx:152` |
| `ttest-one-rank` | `box` | `src/analyses/ttest/run.tsx:170` |
| `ttest-ind-box` | `box` | `src/analyses/ttest/run.tsx:296` |
| `ttest-ind-means` | `interval` | `src/analyses/ttest/run.tsx:310` |
| `ttest-ind-diamond` | `diamond` | `src/analyses/ttest/run.tsx:325` |
| `ttest-ind-rank` | `box` | `src/analyses/ttest/run.tsx:350` |
| `ttest-dep-box` | `box` | `src/analyses/ttest/run.tsx:435` |
| `ttest-dep-mean` | `interval` | `src/analyses/ttest/run.tsx:448` |
| `ttest-dep-diamond` | `diamond` | `src/analyses/ttest/run.tsx:463` |
| `ttest-dep-diff` | `box` | `src/analyses/ttest/run.tsx:483` |

### `var` (3)

| Grafico | Kind | File |
|---|---|---|
| `vecm-alpha` | `bar` | `src/analyses/var/run.tsx:41` |
| `var-irf-chart` | `line` | `src/analyses/var/run.tsx:84` |
| `var-fevd-chart` | `bar` | `src/analyses/var/run.tsx:97` |

### `variances` (2)

| Grafico | Kind | File |
|---|---|---|
| `var-one-interval` | `interval` | `src/analyses/variances/run.tsx:45` |
| `var-box` | `box` | `src/analyses/variances/run.tsx:101` |

