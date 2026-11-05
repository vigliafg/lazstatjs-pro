# Confronto con JMP di tutte le procedure (2026-11-05)

Chiusura della fase 2.1: tutte e **72** le procedure sono state collocate rispetto
a JMP. Per ognuna: piattaforma corrispondente, se i quattro libri la documentano,
le nostre tabelle (lette eseguendo i runner) e le voci mancanti.

## Come leggere lo stato

- **documentata** — la piattaforma JMP compare nei libri, quindi esiste un output
  di riferimento da cui dedurre le voci (verifica per parola chiave su `pdftotext`).
- **non documentata** — JMP può avere la piattaforma, ma i libri non ne mostrano
  l'output: non ci sono voci da confrontare, e non le invento.
- **mancante calcolabile** — la voce si ricava dai nostri input; **non calcolabile**
  quando serve un input che non abbiamo (repliche, pesi).

## Riepilogo

| Voce | Valore |
| --- | --- |
| Procedure analizzate | **72/72** |
| Con piattaforma JMP documentata nei libri | 38 |
| Con almeno una voce mancante calcolabile | 15 |
| Blocchi di voci mancanti e calcolabili | **20** |
| Voci mancanti non calcolabili | 3 |

La regressione lineare è già stata integrata (`Media della risposta` e tabella
`reg-effects`), quindi non compare tra le mancanti; il dettaglio del suo diff è in
`2026-11-05-confronto-tabelle-jmp-regressione.md`.

## Per famiglia

| Famiglia | Procedure | JMP documentata | Mancanti calcolabili | Non calcolabili |
| --- | --- | --- | --- | --- |
| Guided | 1 | 0 | 0 | 0 |
| Descriptive | 4 | 3 | 2 | 1 |
| Compare groups | 10 | 10 | 3 | 0 |
| Regression | 20 | 11 | 12 | 1 |
| Multivariate | 10 | 5 | 2 | 0 |
| Categorical | 4 | 4 | 1 | 0 |
| Survival | 9 | 0 | 0 | 0 |
| Time series | 4 | 1 | 0 | 0 |
| Missing data | 1 | 0 | 0 | 0 |
| Design & power | 3 | 3 | 0 | 1 |
| Machine learning | 3 | 1 | 0 | 0 |
| Advanced & Bayesian | 3 | 0 | 0 | 0 |

## Tutte le procedure

| Procedura | Famiglia | Piattaforma JMP | Documentata | Tabelle | Mancanti calcolabili | Non calcolabili |
| --- | --- | --- | --- | --- | --- | --- |
| `wizard` Wizard | guided | — | no | 4 | — | — |
| `descriptive` Descriptive | descriptive | Distribution | sì | 4 | — | Sum Wgt (nessun input di pesi) |
| `distfit` Distribution Fit | descriptive | Distribution > Fit Distribution | sì | 3 | Cramér–von Mises nella bontà di adattamento | — |
| `quality` Quality (SPC) | descriptive | Control Chart | sì | 2 | limiti di controllo per sottogruppo | — |
| `survey` Survey (complex samples) | descriptive | Survey / pesi | no | 2 | — | — |
| `ancova` ANCOVA | compare | Fit Model (ANCOVA) | sì | 5 | — | — |
| `anova` ANOVA | compare | Fit Y by X > Oneway | sì | 8 | Bartlett e O'Brien nel pannello delle varianze; confronti non parametrici Steel–Dwass | — |
| `factorial` Factorial ANOVA | compare | Fit Model (due fattori) | sì | 5 | — | — |
| `mixedanova` Mixed ANOVA | compare | Fit Model > Repeated Measures | sì | 5 | — | — |
| `nonparamrm` Non-parametric RM | compare | Fit Y by X > Wilcoxon / Friedman | sì | 3 | — | — |
| `proportions` Proportions & rates | compare | Distribution > Test Probabilities | sì | 1 | — | — |
| `repeatedanova` Repeated ANOVA | compare | Fit Model > Repeated Measures | sì | 3 | — | — |
| `tost` Equivalence (TOST) | compare | Test di equivalenza | sì | 2 | — | — |
| `ttest` T-Test | compare | Fit Y by X > t Test; Matched Pairs | sì | 6 | — | — |
| `variances` Variances | compare | Fit Y by X > Unequal Variances | sì | 1 | test di uguaglianza per k gruppi nella modalità predefinita (Bartlett, Levene, Brown–Forsythe) | — |
| `correlation` Correlation | regression | Multivariate > Correlations | sì | 6 | — | — |
| `countreg` Count Regression | regression | Fit Model > Poisson | sì | 2 | Effect LR tests per termine | — |
| `gee` GEE | regression | GEE | no | 2 | — | — |
| `glm` GLM | regression | Generalized Linear Model | sì | 2 | Effect Tests per termine; colonna ChiSquare (Wald) | — |
| `glmm` GLMM | regression | Mixed Model (GLMM) | sì | 3 | SE e IC 95% dei componenti di varianza; Fixed Effects Tests per termine | — |
| `iv` Instrumental Variables | regression | Variabili strumentali | no | 3 | — | — |
| `lmm` Mixed Model (LMM) | regression | Mixed Model | sì | 2 | SE e IC 95% dei componenti di varianza; Fixed Effects Tests per termine | — |
| `logistic` Logistic Regression | regression | Nominal Logistic | sì | 4 | Effect Likelihood Ratio Tests per termine; colonna ChiSquare (Wald) accanto a z | — |
| `mars` GAM / MARS | regression | MARS | no | 3 | — | — |
| `mediation` Mediation | regression | Mediazione | no | 4 | — | — |
| `multinomial` Multinomial Logistic | regression | Nominal Logistic | sì | 3 | Effect LR tests per termine | — |
| `nonlinear` Nonlinear Regression | regression | Nonlinear / Fit Curve | sì | 2 | MSE nel Summary of Fit | — |
| `ordinal` Ordinal Logistic | regression | Ordinal Logistic | sì | 3 | Effect LR tests per termine | — |
| `panel` Panel Model | regression | Mixed Model (panel) | no | 5 | — | — |
| `partition` Partition | regression | Partition | sì | 4 | — | — |
| `pls` PLS Regression | regression | Partial Least Squares | no | 3 | — | — |
| `propensity` Propensity Score | regression | Propensity score | no | 4 | — | — |
| `quantile` Quantile Regression | regression | Quantile Regression | no | 2 | — | — |
| `regression` Regression | regression | Fit Model / Bivariate | sì | 7 | — | Lack of Fit (richiede repliche) |
| `selection` Tobit / Selection | regression | Fit Model > Stepwise | no | 4 | — | — |
| `canonical` Canonical Correlation | multivariate | Multivariate > Canonical Correlation | sì | 3 | — | — |
| `cluster` Cluster Analysis | multivariate | Cluster | sì | 3 | CCC e pseudo-F della fusione | — |
| `conjoint` Conjoint Analysis | multivariate | Conjoint | no | 3 | — | — |
| `correspondence` Correspondence Analysis | multivariate | Correspondence Analysis | sì | 3 | — | — |
| `discriminant` Discriminant / MANOVA | multivariate | Discriminant | sì | 5 | — | — |
| `irt` Item Response Theory | multivariate | Item Response Theory | no | 3 | — | — |
| `latentclass` Latent Class | multivariate | Latent Class | no | 4 | — | — |
| `mds` Multidimensional Scaling | multivariate | Multidimensional Scaling | no | 3 | — | — |
| `multivariate` Multivariate | multivariate | Multivariate > Principal Components | sì | 3 | autovettori (coefficienti delle componenti) | — |
| `sem` SEM / CFA | multivariate | Structural Equation Models | no | 5 | — | — |
| `agreement` Agreement | categorical | Measurement Systems Analysis | sì | 1 | varianze dei componenti e %GRR / ndc | — |
| `chisquare` Chi-Square (χ²) | categorical | Fit Y by X > Contingency | sì | 4 | — | — |
| `contingency` Contingency (R×C) | categorical | Fit Y by X > Contingency | sì | 5 | — | — |
| `loglinear` Log-linear | categorical | Fit Model > Poisson (log-linear) | sì | 4 | — | — |
| `alt` Accelerated Life Testing | survival | Accelerated life test | no | 2 | — | — |
| `competing` Competing Risks | survival | Survival > rischi concorrenti | no | 3 | — | — |
| `cox` Cox (PH) | survival | Survival > Proportional Hazards | no | 5 | — | — |
| `parametric` Parametric Survival | survival | — | no | 2 | — | — |
| `recurrent` Recurrent Events | survival | Survival > eventi ricorrenti | no | 3 | — | — |
| `reliability` Reliability Growth & RBD | survival | Life Distribution | no | 2 | — | — |
| `stratcox` Stratified Cox | survival | Survival > PH per strato | no | 2 | — | — |
| `survival` Survival (KM) | survival | Survival > Kaplan-Meier | no | 4 | — | — |
| `tdcox` Time-Dependent Cox | survival | Survival > covariate dipendenti dal tempo | no | 2 | — | — |
| `garch` GARCH | timeseries | Time Series > GARCH | no | 4 | — | — |
| `statespace` State-Space & Markov | timeseries | Time Series > State Space | no | 3 | — | — |
| `timeseries` Time Series | timeseries | Time Series > ARIMA / Smoothing | sì | 10 | — | — |
| `var` VAR / VECM | timeseries | Time Series > VAR | no | 7 | — | — |
| `mi` Missing Data (MI) | missing | Imputazione multipla | no | 2 | — | — |
| `doe` Response Surface (DOE) | design | Design of Experiments | sì | 3 | — | Lack of Fit (richiede repliche) |
| `resampling` Resampling | design | Bootstrap | sì | 2 | — | — |
| `samplesize` Sample Size / Power | design | Sample Size and Power | sì | 3 | — | — |
| `choice` Choice / MaxDiff | ml | Choice Modeling | no | 3 | — | — |
| `ml` Machine Learning | ml | Partition / Neural | sì | 3 | — | — |
| `text` Text Mining | ml | Text Explorer | no | 1 | — | — |
| `bayes` Bayesian Analysis | advanced | Bayesiano | no | 2 | — | — |
| `meta` Meta-Analysis | advanced | Meta-analisi | no | 5 | — | — |
| `spatial` Spatial Statistics | advanced | Spatial | no | 1 | — | — |

## Dettaglio per famiglia

### Guided (1 procedure)

Senza riferimento nei libri (nessuna voce conteggiata): `wizard`.

### Descriptive (4 procedure)

Con riferimento nei libri:
- **`descriptive`** (Distribution): nostre tabelle `desc-location`, `desc-dispersion`, `desc-shape`, `desc-quantiles`.
  Non calcolabili: Sum Wgt (nessun input di pesi).
- **`distfit`** (Distribution > Fit Distribution): nostre tabelle `fit-parameters`, `fit-gof`, `fit-percentiles`.
  Mancano e sono calcolabili: Cramér–von Mises nella bontà di adattamento.
- **`quality`** (Control Chart): nostre tabelle `quality-control-summary`, `quality-control-ranges`.
  Mancano e sono calcolabili: limiti di controllo per sottogruppo.

Senza riferimento nei libri (nessuna voce conteggiata): `survey`.

### Compare groups (10 procedure)

Con riferimento nei libri:
- **`ancova`** (Fit Model (ANCOVA)): nostre tabelle `ancova-model`, `ancova-means`, `ancova-coefficients`, `ancova-slopes`, `ancova-posthoc`.
- **`anova`** (Fit Y by X > Oneway): nostre tabelle `anova-groups`, `anova-table`, `anova-effects`, `anova-assumptions`, `anova-posthoc`, `anova-kruskal`, ….
  Mancano e sono calcolabili: Bartlett e O'Brien nel pannello delle varianze; confronti non parametrici Steel–Dwass.
- **`factorial`** (Fit Model (due fattori)): nostre tabelle `fac-anova`, `fac-cells`, `fac-marginal-a`, `fac-marginal-b`, `fac-diagnostics`.
- **`mixedanova`** (Fit Model > Repeated Measures): nostre tabelle `mixed-cells`, `mixed-emmeans`, `mixed-anova`, `mixed-sphericity`, `mixed-contrasts`.
- **`nonparamrm`** (Fit Y by X > Wilcoxon / Friedman): nostre tabelle `friedman-test`, `friedman-ranks`, `friedman-nemenyi`.
- **`proportions`** (Distribution > Test Probabilities): nostre tabelle `prop-one`.
- **`repeatedanova`** (Fit Model > Repeated Measures): nostre tabelle `rm-anova`, `rm-sphericity`, `rm-descriptives`.
- **`tost`** (Test di equivalenza): nostre tabelle `tost-summary`, `tost-tests`.
- **`ttest`** (Fit Y by X > t Test; Matched Pairs): nostre tabelle `ttest-sample`, `ttest-main`, `ttest-effects`, `ttest-assumptions`, `ttest-mannwhitney`, `ttest-hl`.
- **`variances`** (Fit Y by X > Unequal Variances): nostre tabelle `var-one`.
  Mancano e sono calcolabili: test di uguaglianza per k gruppi nella modalità predefinita (Bartlett, Levene, Brown–Forsythe).

### Regression (20 procedure)

Con riferimento nei libri:
- **`correlation`** (Multivariate > Correlations): nostre tabelle `corr-pairs`, `corr-matrix-pearson`, `corr-matrix-spearman`, `corr-matrix-kendall`, `corr-descriptives`, `corr-partial`.
- **`countreg`** (Fit Model > Poisson): nostre tabelle `count-summary`, `count-coefficients`.
  Mancano e sono calcolabili: Effect LR tests per termine.
- **`glm`** (Generalized Linear Model): nostre tabelle `glm-coefficients`, `glm-fit`.
  Mancano e sono calcolabili: Effect Tests per termine; colonna ChiSquare (Wald).
- **`glmm`** (Mixed Model (GLMM)): nostre tabelle `glmm-coefficients`, `glmm-random`, `glmm-blups`.
  Mancano e sono calcolabili: SE e IC 95% dei componenti di varianza; Fixed Effects Tests per termine.
- **`lmm`** (Mixed Model): nostre tabelle `lmm-summary`, `lmm-fixed`.
  Mancano e sono calcolabili: SE e IC 95% dei componenti di varianza; Fixed Effects Tests per termine.
- **`logistic`** (Nominal Logistic): nostre tabelle `logit-fit`, `logit-coefficients`, `logit-classification`, `logit-warning`.
  Mancano e sono calcolabili: Effect Likelihood Ratio Tests per termine; colonna ChiSquare (Wald) accanto a z.
- **`multinomial`** (Nominal Logistic): nostre tabelle `multinomial-fit`, `multinomial-coefficients`, `multinomial-classification`.
  Mancano e sono calcolabili: Effect LR tests per termine.
- **`nonlinear`** (Nonlinear / Fit Curve): nostre tabelle `nonlinear-parameters`, `nonlinear-fit`.
  Mancano e sono calcolabili: MSE nel Summary of Fit.
- **`ordinal`** (Ordinal Logistic): nostre tabelle `ordinal-summary`, `ordinal-coefficients`, `ordinal-thresholds`.
  Mancano e sono calcolabili: Effect LR tests per termine.
- **`partition`** (Partition): nostre tabelle `partition-summary`, `partition-splits`, `partition-leaves`, `partition-importance`.
- **`regression`** (Fit Model / Bivariate): nostre tabelle `reg-model`, `reg-anova`, `reg-effects`, `reg-coefficients`, `reg-diagnostics`, `reg-residuals`, ….
  Non calcolabili: Lack of Fit (richiede repliche).

Senza riferimento nei libri (nessuna voce conteggiata): `gee`, `iv`, `mars`, `mediation`, `panel`, `pls`, `propensity`, `quantile`, `selection`.

### Multivariate (10 procedure)

Con riferimento nei libri:
- **`canonical`** (Multivariate > Canonical Correlation): nostre tabelle `canonical-functions`, `canonical-coefficients`, `canonical-summary`.
- **`cluster`** (Cluster): nostre tabelle `cluster-means`, `cluster-merges`, `cluster-membership`.
  Mancano e sono calcolabili: CCC e pseudo-F della fusione.
- **`correspondence`** (Correspondence Analysis): nostre tabelle `correspondence-inertia`, `correspondence-coordinates`, `correspondence-residuals`.
- **`discriminant`** (Discriminant): nostre tabelle `discriminant-wilks`, `discriminant-univariate`, `discriminant-coefficients`, `discriminant-confusion`, `discriminant-centroids`.
- **`multivariate`** (Multivariate > Principal Components): nostre tabelle `pca-eigen`, `pca-loadings`, `pca-adequacy`.
  Mancano e sono calcolabili: autovettori (coefficienti delle componenti).

Senza riferimento nei libri (nessuna voce conteggiata): `conjoint`, `irt`, `latentclass`, `mds`, `sem`.

### Categorical (4 procedure)

Con riferimento nei libri:
- **`agreement`** (Measurement Systems Analysis): nostre tabelle `agreement-icc`.
  Mancano e sono calcolabili: varianze dei componenti e %GRR / ndc.
- **`chisquare`** (Fit Y by X > Contingency): nostre tabelle `chisq-contingency`, `chisq-tests`, `chisq-effects`, `chisq-assumptions`.
- **`contingency`** (Fit Y by X > Contingency): nostre tabelle `cont-observed`, `cont-expected`, `cont-residuals`, `cont-tests`, `cont-association`.
- **`loglinear`** (Fit Model > Poisson (log-linear)): nostre tabelle `loglinear-parameters`, `loglinear-fit`, `loglinear-expected`, `loglinear-residuals`.

### Survival (9 procedure)

Senza riferimento nei libri (nessuna voce conteggiata): `alt`, `competing`, `cox`, `parametric`, `recurrent`, `reliability`, `stratcox`, `survival`, `tdcox`.

### Time series (4 procedure)

Con riferimento nei libri:
- **`timeseries`** (Time Series > ARIMA / Smoothing): nostre tabelle `ts-summary`, `ts-acf`, `ts-tests`, `ts-models`, `ts-arima-model`, `ts-arima-candidates`, ….

Senza riferimento nei libri (nessuna voce conteggiata): `garch`, `statespace`, `var`.

### Missing data (1 procedure)

Senza riferimento nei libri (nessuna voce conteggiata): `mi`.

### Design & power (3 procedure)

Con riferimento nei libri:
- **`doe`** (Design of Experiments): nostre tabelle `doe-model`, `doe-fit`, `doe-stationary`.
  Non calcolabili: Lack of Fit (richiede repliche).
- **`resampling`** (Bootstrap): nostre tabelle `resampling-groups`, `resampling-test`.
- **`samplesize`** (Sample Size and Power): nostre tabelle `ss-input`, `ss-result`, `ss-curve`.

### Machine learning (3 procedure)

Con riferimento nei libri:
- **`ml`** (Partition / Neural): nostre tabelle `ml-fit`, `ml-importance`, `ml-predictions`.

Senza riferimento nei libri (nessuna voce conteggiata): `choice`, `text`.

### Advanced & Bayesian (3 procedure)

Senza riferimento nei libri (nessuna voce conteggiata): `bayes`, `meta`, `spatial`.

## Cosa resta da integrare, in ordine

1. **Modelli non lineari** (`logistic`, `ordinal`, `multinomial`, `countreg`, `glm`,
   `nonlinear`): 7 blocchi, tutti per termine o per colonna; il più ripetibile è il
   test di rapporto di verosimiglianza, che serve a quattro procedure.
2. **Modelli misti** (`lmm`, `glmm`): 4 blocchi, i più onerosi (matrice di informazione).
3. **Confronti** (`anova`, `variances`): 3 blocchi, con Steel–Dwass come unico caso
   non banale.
4. **Multivariata e descrittive** (`multivariate`, `cluster`, `distfit`, `agreement`):
   4 blocchi isolati, ognuno indipendente dagli altri.
5. **Serie e qualità** (`quality`): limiti per sottogruppo.

## Limiti

- Il confronto è per **voci di output**, non per valori: i libri usano dataset
  diversi dai nostri e non si possono confrontare i numeri voce per voce, salvo
  dove il dataset è riproducibile (verifiche in R, come per la regressione).
- Le piattaforme marcate "non documentata" non sono un giudizio su JMP: solo sul
  fatto che i quattro PDF non ne mostrano le tabelle.
- Una sola modalità per procedura, come nel censimento: le modalità alternative
  (`variances` con k gruppi, `selection` con stepwise, `glm` con altre famiglie)
  vanno censite quando si integra quella procedura.
