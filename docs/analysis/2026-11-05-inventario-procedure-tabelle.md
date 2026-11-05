# Inventario delle procedure e delle tabelle dei risultati (2026-11-05)

Fase 2.0 del piano: censimento di **tutte** le procedure, preesistenti e aggiunte,
con le tabelle che ognuna produce, prima del confronto con JMP.

## Come è stato prodotto

- Elenco delle procedure e delle famiglie: `src/analyses/registry.ts`.
- Origine: prima comparsa di ogni id nella storia di `registry.ts` (`git show` per
  ogni commit), confrontata con la baseline `1ef2860`.
- Tabelle e voci: **esecuzione reale** dei 72 runner con
  `node --import tsx scripts/inventory-procedures.mts`; ogni procedura usa il
  dataset e le colonne dichiarate in `samples/manifest.json`, con i parametri di
  `DEFAULT_PARAMS` e i ruoli dell'esempio. Il risultato è la lista `TableSpec`
  effettivamente restituita, con numero di righe e colonne.
- Controparte JMP: piattaforma corrispondente e presenza nei quattro libri
  (`jmp.pdf`, `jmp2.pdf`, `jmp3.pdf`, `jmp4.pdf`) verificata per parola chiave
  sul testo estratto con `pdftotext -layout`.

## Riepilogo

| Voce | Valore |
| --- | --- |
| Procedure censite | **72** (36 di baseline, 36 aggiunte dopo) |
| Tabelle prodotte | **244** |
| Voci (righe) nei risultati | **3975** |
| Con una piattaforma JMP corrispondente | 63 |
| Piattaforma JMP documentata nei libri | 39 |
| Senza controparte JMP | 9 |

## Per famiglia

| Famiglia | Procedure | Baseline | Aggiunte | Tabelle | Voci | JMP documentata |
| --- | --- | --- | --- | --- | --- | --- |
| Guided | 1 | 1 | 0 | 4 | 13 | 0 |
| Descriptive | 4 | 3 | 1 | 11 | 57 | 3 |
| Compare groups | 10 | 8 | 2 | 39 | 172 | 9 |
| Regression | 20 | 8 | 12 | 67 | 332 | 10 |
| Multivariate | 10 | 3 | 7 | 35 | 2045 | 5 |
| Categorical | 4 | 3 | 1 | 14 | 52 | 4 |
| Survival | 9 | 5 | 4 | 25 | 564 | 4 |
| Time series | 4 | 1 | 3 | 24 | 559 | 1 |
| Missing data | 1 | 1 | 0 | 2 | 8 | 0 |
| Design & power | 3 | 3 | 0 | 8 | 64 | 2 |
| Machine learning | 3 | 0 | 3 | 7 | 72 | 1 |
| Advanced & Bayesian | 3 | 0 | 3 | 8 | 37 | 0 |

## Tutte le procedure

| Procedura | Famiglia | Origine | Dataset di esempio | Tabelle | Voci | Piattaforma JMP |
| --- | --- | --- | --- | --- | --- | --- |
| `wizard` Wizard | guided | baseline `1ef2860` | `descriptive/iris` | 4 | 13 | — |
| `descriptive` Descriptive | descriptive | baseline `1ef2860` | `descriptive/iris` | 4 | 16 | Distribution (jmp3, jmp4) |
| `distfit` Distribution Fit | descriptive | baseline `1ef2860` | `descriptive/iris` | 3 | 19 | Distribution > Fit Distribution (jmp3, jmp4) |
| `quality` Quality (SPC) | descriptive | baseline `1ef2860` | `compare/plantgrowth` | 2 | 16 | Control Chart (jmp3, jmp4) |
| `survey` Survey (complex samples) | descriptive | W9 (`fd4858d`) | `design/survey_demo` | 2 | 6 | Survey / pesi (non nei libri) |
| `ancova` ANCOVA | compare | baseline `1ef2860` | `compare/toothgrowth` | 5 | 14 | Fit Model (ANCOVA) (jmp3, jmp4) |
| `anova` ANOVA | compare | baseline `1ef2860` | `compare/plantgrowth` | 8 | 28 | Fit Y by X > Oneway (jmp3, jmp4) |
| `factorial` Factorial ANOVA | compare | baseline `1ef2860` | `compare/toothgrowth` | 5 | 21 | Fit Model (due fattori) (jmp3, jmp4) |
| `mixedanova` Mixed ANOVA | compare | baseline `1ef2860` | `compare/chickweight_wide` | 5 | 48 | — |
| `nonparamrm` Non-parametric RM | compare | baseline `1ef2860` | `compare/sleep_wide` | 3 | 10 | Fit Y by X > Wilcoxon / KW (jmp3) |
| `proportions` Proportions & rates | compare | compare (`356fdf9`) | `compare/two_groups_binary` | 1 | 1 | Distribution > Test Probabilities (jmp3, jmp4) |
| `repeatedanova` Repeated ANOVA | compare | baseline `1ef2860` | `compare/chickweight_wide` | 3 | 20 | Fit Model > Repeated Measures (jmp3) |
| `tost` Equivalence (TOST) | compare | baseline `1ef2860` | `compare/plantgrowth_wide` | 2 | 14 | Test di equivalenza (jmp3) |
| `ttest` T-Test | compare | baseline `1ef2860` | `compare/plantgrowth_wide` | 6 | 15 | Fit Y by X > t Test; Matched Pairs (jmp3, jmp4) |
| `variances` Variances | compare | compare (`74e1179`) | `compare/plantgrowth` | 1 | 1 | Fit Y by X > Unequal Variances (jmp3, jmp4) |
| `correlation` Correlation | regression | baseline `1ef2860` | `descriptive/iris` | 6 | 28 | Multivariate > Correlations (jmp3, jmp4) |
| `countreg` Count Regression | regression | baseline `1ef2860` | `regression/quine` | 2 | 15 | Fit Model > Poisson (jmp3, jmp4) |
| `gee` GEE | regression | baseline `1ef2860` | `regression/chickweight_long` | 2 | 8 | — |
| `glm` GLM | regression | W2 (`7bf4e84`) | `regression/mtcars` | 2 | 13 | Fit Model > Generalized Linear (jmp3) |
| `glmm` GLMM | regression | GLMM (`863029b`) | `regression/mtcars` | 3 | 9 | Fit Model > Mixed Model (jmp3) |
| `iv` Instrumental Variables | regression | W3 (`8f8298f`) | `regression/iv_demo` | 3 | 11 | Variabili strumentali (non nei libri) |
| `lmm` Mixed Model (LMM) | regression | baseline `1ef2860` | `regression/chickweight_long` | 2 | 8 | — |
| `logistic` Logistic Regression | regression | baseline `1ef2860` | `regression/birthwt` | 4 | 26 | — |
| `mars` GAM / MARS | regression | W3 (`8f8298f`) | `regression/mtcars` | 3 | 19 | MARS (non nei libri) |
| `mediation` Mediation | regression | W3 (`8f8298f`) | `regression/mtcars` | 4 | 19 | Mediazione (non nei libri) |
| `multinomial` Multinomial Logistic | regression | W2 (`7bf4e84`) | `regression/housing` | 3 | 20 | Fit Model > Nominal Logistic (jmp3) |
| `nonlinear` Nonlinear Regression | regression | W2 (`7bf4e84`) | `regression/mtcars` | 2 | 11 | Nonlinear / Fit Curve (jmp3, jmp4) |
| `ordinal` Ordinal Logistic | regression | baseline `1ef2860` | `regression/housing` | 3 | 12 | — |
| `panel` Panel Model | regression | W3 (`8f8298f`) | `regression/panel_demo` | 5 | 19 | Fit Model > Mixed Model (panel) (jmp3) |
| `partition` Partition | regression | baseline `1ef2860` | `descriptive/iris` | 4 | 19 | Partition (jmp3, jmp4) |
| `pls` PLS Regression | regression | W3 (`8f8298f`) | `regression/mtcars` | 3 | 9 | Partial Least Squares (non nei libri) |
| `propensity` Propensity Score | regression | W3 (`8f8298f`) | `regression/treatment_demo` | 4 | 15 | Propensity score (non nei libri) |
| `quantile` Quantile Regression | regression | W2 (`7bf4e84`) | `regression/mtcars` | 2 | 10 | Quantile Regression (non nei libri) |
| `regression` Regression | regression | baseline `1ef2860` | `regression/mtcars` | 6 | 45 | Fit Model / Bivariate (jmp3, jmp4) |
| `selection` Tobit / Selection | regression | W3 (`8f8298f`) | `regression/selection_demo` | 4 | 16 | Fit Model > Stepwise (jmp3) |
| `canonical` Canonical Correlation | multivariate | W5 (`09c67cc`) | `descriptive/iris` | 3 | 14 | Multivariate > Canonical Correlation (jmp2) |
| `cluster` Cluster Analysis | multivariate | baseline `1ef2860` | `descriptive/iris` | 3 | 242 | Cluster (jmp3, jmp4) |
| `conjoint` Conjoint Analysis | multivariate | W5 (`09c67cc`) | `multivariate/conjoint_demo` | 3 | 15 | Conjoint (non nei libri) |
| `correspondence` Correspondence Analysis | multivariate | W5 (`09c67cc`) | `design/resampling_two_groups` | 3 | 7 | Correspondence Analysis (jmp3) |
| `discriminant` Discriminant / MANOVA | multivariate | baseline `1ef2860` | `descriptive/iris` | 5 | 16 | Discriminant (jmp3) |
| `irt` Item Response Theory | multivariate | W5 (`09c67cc`) | `multivariate/irt_demo` | 3 | 208 | Item Response Theory (non nei libri) |
| `latentclass` Latent Class | multivariate | W5 (`09c67cc`) | `multivariate/latent_demo` | 4 | 220 | Latent Class (non nei libri) |
| `mds` Multidimensional Scaling | multivariate | W5 (`09c67cc`) | `multivariate/usarrests` | 3 | 1280 | Multidimensional Scaling (non nei libri) |
| `multivariate` Multivariate | multivariate | baseline `1ef2860` | `descriptive/iris` | 3 | 13 | Multivariate > Principal Components (jmp3, jmp4) |
| `sem` SEM / CFA | multivariate | W5 (`09c67cc`) | `multivariate/sem_demo` | 5 | 30 | Structural Equation Models (non nei libri) |
| `agreement` Agreement | categorical | baseline `1ef2860` | `categorical/agreement_ratings` | 1 | 8 | Measurement Systems Analysis (jmp3) |
| `chisquare` Chi-Square (χ²) | categorical | baseline `1ef2860` | `categorical/categorical_gof` | 4 | 16 | Fit Y by X > Contingency (jmp3, jmp4) |
| `contingency` Contingency (R×C) | categorical | baseline `1ef2860` | `design/resampling_two_groups` | 5 | 14 | Fit Y by X > Contingency (jmp3, jmp4) |
| `loglinear` Log-linear | categorical | W4 (`e2ec8cc`) | `design/resampling_two_groups` | 4 | 14 | Fit Model > Poisson (log-linear) (jmp3) |
| `alt` Accelerated Life Testing | survival | W6 (`0bc03fe`) | `survival/alt_demo` | 2 | 11 | Accelerated life test (non nei libri) |
| `competing` Competing Risks | survival | W6 (`0bc03fe`) | `survival/competing_demo` | 3 | 151 | Survival > rischi concorrenti (non nei libri) |
| `cox` Cox (PH) | survival | baseline `1ef2860` | `survival/lung` | 5 | 159 | Survival > Proportional Hazards (jmp3) |
| `parametric` Parametric Survival | survival | baseline `1ef2860` | `survival/lung` | 2 | 10 | — |
| `recurrent` Recurrent Events | survival | W6 (`0bc03fe`) | `survival/recurrent_demo` | 3 | 13 | Survival > eventi ricorrenti (non nei libri) |
| `reliability` Reliability Growth & RBD | survival | W6 (`0bc03fe`) | `survival/reliability_demo` | 2 | 29 | Life Distribution (jmp4) |
| `stratcox` Stratified Cox | survival | baseline `1ef2860` | `survival/lung` | 2 | 13 | Survival > PH per strato (jmp3) |
| `survival` Survival (KM) | survival | baseline `1ef2860` | `survival/lung` | 4 | 166 | Survival > Kaplan-Meier (jmp3) |
| `tdcox` Time-Dependent Cox | survival | baseline `1ef2860` | `survival/heart` | 2 | 12 | Survival > covariate dipendenti dal tempo (non nei libri) |
| `garch` GARCH | timeseries | W7 (`994a5d4`) | `timeseries/garch_demo` | 4 | 26 | Time Series > GARCH (non nei libri) |
| `statespace` State-Space & Markov | timeseries | W7 (`994a5d4`) | `timeseries/statespace_demo` | 3 | 317 | Time Series > State Space (non nei libri) |
| `timeseries` Time Series | timeseries | baseline `1ef2860` | `timeseries/airpassengers` | 10 | 78 | Time Series > ARIMA / Smoothing (jmp3, jmp4) |
| `var` VAR / VECM | timeseries | W7 (`994a5d4`) | `timeseries/var_demo` | 7 | 138 | Time Series > VAR (non nei libri) |
| `mi` Missing Data (MI) | missing | baseline `1ef2860` | `missing/airquality` | 2 | 8 | — |
| `doe` Response Surface (DOE) | design | baseline `1ef2860` | `regression/mtcars` | 3 | 14 | Design of Experiments (jmp3, jmp4) |
| `resampling` Resampling | design | baseline `1ef2860` | `design/resampling_two_groups` | 2 | 8 | — |
| `samplesize` Sample Size / Power | design | baseline `1ef2860` | `design/resampling_two_groups` | 3 | 42 | DOE > Sample Size and Power (jmp3, jmp4) |
| `choice` Choice / MaxDiff | ml | W9 (`fd4858d`) | `design/choice_demo` | 3 | 13 | Choice Modeling (non nei libri) |
| `ml` Machine Learning | ml | W9 (`fd4858d`) | `ml/ml_demo` | 3 | 41 | Partition / Neural (jmp3, jmp4) |
| `text` Text Mining | ml | W9 (`fd4858d`) | `text/text_demo` | 1 | 18 | Text Explorer (non nei libri) |
| `bayes` Bayesian Analysis | advanced | W9 (`fd4858d`) | `design/bayes_demo` | 2 | 7 | Bayesiano (non nei libri) |
| `meta` Meta-Analysis | advanced | W9 (`fd4858d`) | `design/meta_demo` | 5 | 24 | Meta-analisi (non nei libri) |
| `spatial` Spatial Statistics | advanced | W9 (`fd4858d`) | `design/spatial_demo` | 1 | 6 | Spatial (non nei libri) |

## Tabelle per procedura

Formato: `id` (titolo) — righe.

**`wizard`** (4 tabelle, 13 voci)
- `wiz-audit` (Audit delle colonne) — 5
- `wiz-groups` (Esito per gruppo) — 3
- `wiz-checks` (Controlli sulle assunzioni) — 2
- `wiz-path` (Percorso consigliato) — 3

**`descriptive`** (4 tabelle, 16 voci)
- `desc-location` (Campione e misure di posizione) — 4
- `desc-dispersion` (Dispersione e valori anomali) — 4
- `desc-shape` (Forma e test di normalità) — 4
- `desc-quantiles` (Quantili) — 4

**`distfit`** (3 tabelle, 19 voci)
- `fit-parameters` (Distribuzioni stimate) — 5
- `fit-gof` (Bontà di adattamento) — 5
- `fit-percentiles` (Percentili della distribuzione migliore (Lognormale)) — 9

**`quality`** (2 tabelle, 16 voci)
- `quality-control-summary` (Sintesi della carta di controllo) — 10
- `quality-control-ranges` (Sottogruppi e ampiezze) — 6

**`survey`** (2 tabelle, 6 voci)
- `survey-design` (Disegno del campione) — 5
- `survey-estimates` (Stime e intervalli di confidenza) — 1

**`ancova`** (5 tabelle, 14 voci)
- `ancova-model` (ANCOVA — effetti (SS tipo III)) — 4
- `ancova-means` (Medie aggiustate per gruppo) — 2
- `ancova-coefficients` (Coefficienti del modello) — 3
- `ancova-slopes` (Omogeneità delle pendenze) — 4
- `ancova-posthoc` (Confronti a coppie (medie aggiustate)) — 1

**`anova`** (8 tabelle, 28 voci)
- `anova-groups` (Descrittive per gruppo) — 3
- `anova-table` (ANOVA a una via) — 3
- `anova-effects` (Effect size) — 5
- `anova-assumptions` (Assunzioni) — 7
- `anova-posthoc` (Post-hoc) — 3
- `anova-kruskal` (Kruskal–Wallis H (non parametrico)) — 1
- `anova-kruskal-ranks` (Ranghi per gruppo) — 3
- `anova-dunn` (Post-hoc Dunn) — 3

**`factorial`** (5 tabelle, 21 voci)
- `fac-anova` (ANOVA a due fattori) — 4
- `fac-cells` (Medie per cella) — 6
- `fac-marginal-a` (Medie marginali · Supplement) — 2
- `fac-marginal-b` (Medie marginali · Dose) — 3
- `fac-diagnostics` (Diagnostica del modello) — 6

**`mixedanova`** (5 tabelle, 48 voci)
- `mixed-cells` (Medie cella) — 4
- `mixed-emmeans` (EM means (marginali non pesate)) — 10
- `mixed-anova` (ANOVA mista split-plot) — 5
- `mixed-sphericity` (Sfericità e correzioni) — 8
- `mixed-contrasts` (Contrasti pairwise (Holm)) — 21

**`nonparamrm`** (3 tabelle, 10 voci)
- `friedman-test` (Test di Friedman) — 4
- `friedman-ranks` (Ranghi medi per trattamento) — 3
- `friedman-nemenyi` (Post-hoc Nemenyi) — 3

**`proportions`** (1 tabelle, 1 voci)
- `prop-one` (Proporzione (un campione)) — 1

**`repeatedanova`** (3 tabelle, 20 voci)
- `rm-anova` (ANOVA a misure ripetute) — 4
- `rm-sphericity` (Sfericità e correzioni) — 10
- `rm-descriptives` (Descrittive per condizione) — 6

**`tost`** (2 tabelle, 14 voci)
- `tost-summary` (Differenza e intervallo di confidenza) — 11
- `tost-tests` (Two One-Sided Tests) — 3

**`ttest`** (6 tabelle, 15 voci)
- `ttest-sample` (Campione e statistiche descrittive) — 2
- `ttest-main` (Test t per campioni indipendenti (varianze uguali)) — 1
- `ttest-effects` (Effect size) — 5
- `ttest-assumptions` (Assunzioni) — 4
- `ttest-mannwhitney` (Mann–Whitney U (non parametrico)) — 2
- `ttest-hl` (Hodges–Lehmann) — 1

**`variances`** (1 tabelle, 1 voci)
- `var-one` (Varianza (un campione)) — 1

**`correlation`** (6 tabelle, 28 voci)
- `corr-pairs` (Correlazioni a coppie) — 6
- `corr-matrix-pearson` (Matrice di correlazione di Pearson (r)) — 4
- `corr-matrix-spearman` (Matrice di correlazione di Spearman (ρ)) — 4
- `corr-matrix-kendall` (Matrice di correlazione di Kendall (τ-b)) — 4
- `corr-descriptives` (Descrittive delle variabili) — 4
- `corr-partial` (Correlazioni parziali) — 6

**`countreg`** (2 tabelle, 15 voci)
- `count-summary` (Sintesi del modello) — 11
- `count-coefficients` (Coefficienti) — 4

**`gee`** (2 tabelle, 8 voci)
- `gee-summary` (GEE) — 6
- `gee-coefficients` (Coefficienti) — 2

**`glm`** (2 tabelle, 13 voci)
- `glm-coefficients` (Coefficienti del modello) — 3
- `glm-fit` (Bontà del modello) — 10

**`glmm`** (3 tabelle, 9 voci)
- `glmm-coefficients` (Coefficienti del modello) — 3
- `glmm-random` (Componenti di varianza) — 3
- `glmm-blups` (Effetti casuali per gruppo) — 3

**`iv`** (3 tabelle, 11 voci)
- `iv-structural` (Equazione strutturale) — 3
- `iv-first-stage` (Primo stadio) — 2
- `iv-diagnostics` (Diagnostica) — 6

**`lmm`** (2 tabelle, 8 voci)
- `lmm-summary` (Modello lineare misto) — 6
- `lmm-fixed` (Effetti fissi) — 2

**`logistic`** (4 tabelle, 26 voci)
- `logit-fit` (Modello logistico) — 13
- `logit-coefficients` (Coefficienti e odds ratio) — 8
- `logit-classification` (Classificazione) — 4
- `logit-warning` (Attenzione: separazione) — 1

**`mars`** (3 tabelle, 19 voci)
- `mars-terms` (Termini della base MARS) — 4
- `mars-fit` (Bontà del modello) — 12
- `mars-importance` (Importanza dei predittori) — 3

**`mediation`** (4 tabelle, 19 voci)
- `mediation-paths` (Percorsi della mediazione) — 4
- `mediation-effects` (Scomposizione degli effetti) — 4
- `mediation-bootstrap` (Bootstrap dell’effetto indiretto) — 6
- `mediation-fit` (Adattamento dei modelli) — 5

**`multinomial`** (3 tabelle, 20 voci)
- `multinomial-fit` (Modello multinomiale) — 11
- `multinomial-coefficients` (Coefficienti per classe) — 6
- `multinomial-classification` (Classificazione per classe) — 3

**`nonlinear`** (2 tabelle, 11 voci)
- `nonlinear-parameters` (Parametri del modello) — 2
- `nonlinear-fit` (Bontà di adattamento) — 9

**`ordinal`** (3 tabelle, 12 voci)
- `ordinal-summary` (Modello ordinale) — 8
- `ordinal-coefficients` (Coefficienti) — 2
- `ordinal-thresholds` (Soglie) — 2

**`panel`** (5 tabelle, 19 voci)
- `panel-fe` (Effetti fissi (within)) — 2
- `panel-re` (Effetti casuali (Swamy–Arora)) — 3
- `panel-variance` (Componenti di varianza) — 3
- `panel-hausman` (Test di Hausman) — 1
- `panel-fit` (Adattamento del modello panel) — 10

**`partition`** (4 tabelle, 19 voci)
- `partition-summary` (Sintesi dell’albero) — 5
- `partition-splits` (Regole di suddivisione) — 5
- `partition-leaves` (Report delle foglie) — 6
- `partition-importance` (Importanza delle variabili) — 3

**`pls`** (3 tabelle, 9 voci)
- `pls-coefficients` (Coefficienti PLS) — 4
- `pls-components` (Componenti latenti) — 2
- `pls-vip` (Importanza delle variabili (VIP)) — 3

**`propensity`** (4 tabelle, 15 voci)
- `propensity-model` (Modello di propensione) — 4
- `propensity-balance` (Bilanciamento delle covariabili) — 3
- `propensity-att` (Effetto medio sul trattato (ATT)) — 1
- `propensity-sample` (Campione e supporto comune) — 7

**`quantile`** (2 tabelle, 10 voci)
- `quantile-coefficients` (Coefficienti della regressione quantilica) — 3
- `quantile-fit` (Adattamento del modello quantilico) — 7

**`regression`** (6 tabelle, 45 voci)
- `reg-model` (Sintesi del modello) — 10
- `reg-anova` (ANOVA del modello) — 3
- `reg-coefficients` (Coefficienti) — 4
- `reg-diagnostics` (Diagnostica del modello) — 14
- `reg-residuals` (Diagnostica dei residui) — 11
- `reg-robust` (Stimatori robusti univariati) — 3

**`selection`** (4 tabelle, 16 voci)
- `tobit-outcome` (Equazione dell’esito (Tobit)) — 3
- `tobit-variance` (Parametri di varianza (Tobit)) — 4
- `tobit-diagnostics` (Diagnostica (Tobit)) — 6
- `tobit-fit` (Adattamento (Tobit)) — 3

**`canonical`** (3 tabelle, 14 voci)
- `canonical-functions` (Funzioni canoniche) — 2
- `canonical-coefficients` (Coefficienti canonici) — 8
- `canonical-summary` (Sintesi) — 4

**`cluster`** (3 tabelle, 242 voci)
- `cluster-means` (Medie dei cluster) — 3
- `cluster-merges` (Sequenza di fusione) — 119
- `cluster-membership` (Assegnazione dei casi) — 120

**`conjoint`** (3 tabelle, 15 voci)
- `conjoint-utilities` (Utilità delle modalità) — 6
- `conjoint-importance` (Importanza degli attributi) — 2
- `conjoint-fit` (Adattamento del modello) — 7

**`correspondence`** (3 tabelle, 7 voci)
- `correspondence-inertia` (Inerzia per asse) — 1
- `correspondence-coordinates` (Coordinate delle modalità) — 4
- `correspondence-residuals` (Residui standardizzati) — 2

**`discriminant`** (5 tabelle, 16 voci)
- `discriminant-wilks` (MANOVA — lambda di Wilks) — 2
- `discriminant-univariate` (Test univariati) — 4
- `discriminant-coefficients` (Coefficienti discriminanti) — 4
- `discriminant-confusion` (Matrice di classificazione) — 3
- `discriminant-centroids` (Centroidi canonici) — 3

**`irt`** (3 tabelle, 208 voci)
- `irt-items` (Parametri degli item) — 3
- `irt-fit` (Adattamento e affidabilità) — 5
- `irt-persons` (Punteggi di abilità) — 200

**`latentclass`** (4 tabelle, 220 voci)
- `latentclass-fit` (Adattamento del modello) — 6
- `latentclass-proportions` (Dimensione delle classi) — 2
- `latentclass-probabilities` (Probabilità di risposta per classe) — 12
- `latentclass-assignment` (Classificazione dei casi) — 200

**`mds`** (3 tabelle, 1280 voci)
- `mds-fit` (Qualità della rappresentazione) — 5
- `mds-coordinates` (Coordinate MDS) — 50
- `mds-distances` (Distanze e disparità) — 1225

**`multivariate`** (3 tabelle, 13 voci)
- `pca-eigen` (Autovalori e varianza spiegata) — 4
- `pca-loadings` (Saturazioni e comunalità) — 4
- `pca-adequacy` (Adeguatezza del campione) — 5

**`sem`** (5 tabelle, 30 voci)
- `sem-fit` (Indici di adattamento) — 10
- `sem-loadings` (Carichi fattoriali) — 6
- `sem-uniqueness` (Varianze residue) — 6
- `sem-factors` (Relazioni tra fattori) — 2
- `sem-residuals` (Residui di covarianza) — 6

**`agreement`** (1 tabelle, 8 voci)
- `agreement-icc` (Intraclass correlation) — 8

**`chisquare`** (4 tabelle, 16 voci)
- `chisq-contingency` (Tabella di contingenza e residui) — 4
- `chisq-tests` (Test di indipendenza) — 4
- `chisq-effects` (Effect size e misure di associazione) — 5
- `chisq-assumptions` (Assunzioni) — 3

**`contingency`** (5 tabelle, 14 voci)
- `cont-observed` (Tabella di contingenza (frequenze osservate)) — 2
- `cont-expected` (Frequenze attese sotto indipendenza) — 2
- `cont-residuals` (Residui e contributi al χ²) — 6
- `cont-tests` (Test di indipendenza) — 2
- `cont-association` (Ampiezza dell’associazione) — 2

**`loglinear`** (4 tabelle, 14 voci)
- `loglinear-parameters` (Parametri del modello) — 4
- `loglinear-fit` (Bontà di adattamento) — 1
- `loglinear-expected` (Frequenze attese dal modello) — 3
- `loglinear-residuals` (Residui delle celle) — 6

**`alt`** (2 tabelle, 11 voci)
- `alt-summary` (Sintesi del test di vita accelerata) — 9
- `alt-coefficients` (Coefficienti) — 2

**`competing`** (3 tabelle, 151 voci)
- `competing-summary` (Sintesi dei rischi competitivi) — 11
- `competing-coefficients` (Coefficienti di Fine–Gray) — 2
- `competing-cif` (Incidenza cumulativa) — 138

**`cox`** (5 tabelle, 159 voci)
- `cox-summary` (Sintesi del modello di Cox) — 11
- `cox-tests` (Test globali sul modello) — 3
- `cox-coefficients` (Coefficienti e hazard ratio) — 3
- `cox-ph` (Verifica dei rischi proporzionali) — 4
- `cox-baseline` (Rischio cumulato di base) — 138

**`parametric`** (2 tabelle, 10 voci)
- `param-summary` (Sopravvivenza parametrica) — 7
- `param-coefficients` (Coefficienti) — 3

**`recurrent`** (3 tabelle, 13 voci)
- `recurrent-summary` (Sintesi degli eventi ricorrenti) — 9
- `recurrent-coefficients` (Coefficienti) — 2
- `recurrent-tests` (Test globali) — 2

**`reliability`** (2 tabelle, 29 voci)
- `reliability-growth-summary` (Crescita dell’affidabilità (Crow–AMSAA)) — 9
- `reliability-growth-points` (Guasti cumulati e modello) — 20

**`stratcox`** (2 tabelle, 13 voci)
- `stratcox-summary` (Cox stratificato) — 11
- `stratcox-coefficients` (Coefficienti) — 2

**`survival`** (4 tabelle, 166 voci)
- `surv-summary` (Sintesi di sopravvivenza) — 2
- `surv-km` (Curva di Kaplan–Meier) — 150
- `surv-logrank` (Log-rank test) — 6
- `surv-life` (Life table (tutta la coorte)) — 8

**`tdcox`** (2 tabelle, 12 voci)
- `tdcox-summary` (Cox con covariate tempo-dipendenti) — 9
- `tdcox-coefficients` (Coefficienti) — 3

**`garch`** (4 tabelle, 26 voci)
- `garch-model` (Modello GARCH(1,1)) — 11
- `garch-coefficients` (Coefficienti del GARCH) — 3
- `garch-diagnostics` (Diagnostica dei residui standardizzati) — 2
- `garch-forecast` (Previsioni della varianza condizionale) — 10

**`statespace`** (3 tabelle, 317 voci)
- `ss-model` (Modello state-space locale) — 7
- `ss-states` (Stati filtrati e smussati) — 300
- `ss-forecast` (Previsioni) — 10

**`timeseries`** (10 tabelle, 78 voci)
- `ts-summary` (Sintesi della serie) — 9
- `ts-acf` (Autocorrelazione e autocorrelazione parziale) — 13
- `ts-tests` (Test di casualità e trend) — 3
- `ts-models` (Confronto dei modelli di previsione) — 2
- `ts-arima-model` (Modello ARIMA / SARIMA selezionato) — 20
- `ts-arima-candidates` (Modelli candidati) — 9
- `ts-arima-coefficients` (Coefficienti stimati) — 5
- `ts-arima-diagnostics` (Diagnostica dei residui) — 3
- `ts-arima-accuracy` (Accuratezza del modello) — 2
- `ts-arima-forecast` (Previsioni ARIMA(2,1,2)) — 12

**`var`** (7 tabelle, 138 voci)
- `var-model` (Modello VAR(4)) — 8
- `var-selection` (Scelta dell’ordine) — 4
- `var-coefficients` (Coefficienti del VAR) — 18
- `var-sigma` (Matrice di covarianza dei residui) — 2
- `var-granger` (Causalità di Granger) — 2
- `var-irf` (Risposte impulsive ortogonalizzate) — 52
- `var-fevd` (Scomposizione della varianza dell’errore di previsione) — 52

**`mi`** (2 tabelle, 8 voci)
- `mi-missing` (Dati mancanti) — 4
- `mi-pooled` (Stime pooled (Rubin)) — 4

**`doe`** (3 tabelle, 14 voci)
- `doe-model` (Modello della superficie) — 6
- `doe-fit` (Bontà del modello) — 5
- `doe-stationary` (Punto stazionario) — 3

**`resampling`** (2 tabelle, 8 voci)
- `resampling-groups` (Statistiche per gruppo) — 2
- `resampling-test` (Inferenza di resampling) — 6

**`samplesize`** (3 tabelle, 42 voci)
- `ss-input` (Parametri del piano) — 6
- `ss-result` (Numerosità richiesta) — 4
- `ss-curve` (Potenza al variare di n) — 32

**`choice`** (3 tabelle, 13 voci)
- `choice-coefficients` (Logit condizionale) — 2
- `choice-shares` (Quote osservate e previste) — 3
- `choice-fit` (Adattamento) — 8

**`ml`** (3 tabelle, 41 voci)
- `ml-fit` (Prestazioni del modello) — 8
- `ml-importance` (Importanza delle variabili) — 3
- `ml-predictions` (Predizioni e residui) — 30

**`text`** (1 tabelle, 18 voci)
- `text-terms` (Termini più frequenti) — 18

**`bayes`** (2 tabelle, 7 voci)
- `bayes-posterior` (Distribuzione a posteriori) — 2
- `bayes-diagnostics` (Diagnostica del campionatore) — 5

**`meta`** (5 tabelle, 24 voci)
- `meta-pooled` (Stima pooled) — 2
- `meta-heterogeneity` (Eterogeneità) — 7
- `meta-studies` (Studi) — 9
- `meta-prediction` (Intervallo di previsione) — 2
- `meta-egger` (Test di Egger) — 4

**`spatial`** (1 tabelle, 6 voci)
- `spatial-moran` (Autocorrelazione globale) — 6

## Limiti

- Una sola configurazione per procedura: si usa la modalità predefinita con i ruoli
  dell'esempio. Le modalità multiple della stessa procedura (regressione polinomiale,
  di selezione, penalizzata; GLM con altre famiglie; ANOVA fattoriale a più livelli;
  SAM/q-value) hanno tabelle proprie che il censimento non elenca: vanno censite nella
  fase 2.1, quando si confronta voce per voce.
- Quattro procedure non hanno un esempio nel manifest (`contingency`,
  `correspondence`, `loglinear`, `samplesize`): girano su un dataset scelto per tipo di
  ruolo. `sem` e `multinomial` usano una struttura ricavata a mano, perché quella
  dichiarata non si stima sui sample.
- Due procedure girano in una modalità che non è quella suggerita dal nome:
  `proportions` parte da una proporzione a un campione (una sola riga di
  risultati) e `selection` parte dalla modalità Tobit. Le altre modalità hanno
  tabelle proprie, che il confronto della fase 2.1 deve includere.
- Il numero di voci dipende dal dataset: con più livelli o più covariate le tabelle
  crescono. Serve come misura relativa tra procedure, non come dimensione fissa.
