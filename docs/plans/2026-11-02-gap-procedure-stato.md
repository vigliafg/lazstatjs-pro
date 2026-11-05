# Stato esecuzione — piano di chiusura del gap procedurale

**Ultimo aggiornamento**: 2026-11-05 (fase 2.2: seconda integrazione dei modelli non lineari)
**Piano di riferimento**: [`2026-11-02-gap-procedure-piano.md`](2026-11-02-gap-procedure-piano.md)
**Baseline documentale**: `main` @ `1ef2860` (piano v2.2)
**Stato**: W0–W9 chiuse; gate G0–G9 verdi; copertura 73/73 metodi e 36/36 voci
**Ondata corrente**: W9 chiusa — Survey/ML/Advanced (7 item); piano completato

---

## 0-bis. Fase 2.0 — inventario procedure e tabelle (2026-11-05)

**Branch**: `grafici-procedure` · **worktree**: principale

**Contesto**: prima fase del piano "tabelle dei risultati allineate a JMP": censire
tutte le procedure, preesistenti e aggiunte, con le tabelle che producono, prima
di qualunque confronto e di qualunque modifica alle tabelle.

| Item | Stato |
| --- | --- |
| Inventario delle 72 procedure (36 baseline + 36 aggiunte) | chiuso |
| Origine di ogni procedura ricostruita dalla storia del registro | chiuso |
| Tabelle e voci lette eseguendo i 72 runner reali | chiuso (244 tabelle, 3.975 voci) |
| Controparte JMP e verifica della presenza nei quattro libri | chiuso (63 con piattaforma, 39 documentate) |
| Script di censimento riproducibile | chiuso (`scripts/inventory-procedures.mts`) |
| Fase 2.1 (confronto voce per voce) | **chiusa su 72/72 procedure**: 38 con piattaforma JMP documentata, 20 blocchi mancanti calcolabili su 15 procedure, 3 voci non calcolabili |
| Fase 2.2, prima integrazione (regressione lineare) | chiusa e completa secondo §8.8: `Media della risposta`, tabella `reg-effects`, sezione di prosa sugli effetti Tipo III in sei lingue, test, golden |
| Fase 2.2, checklist di integrazione | definita nel piano §8.8: numerica, tabella/colonna, prosa, 6 lingue, test, golden, grafici, export, help |
| Fase 2.2, seconda integrazione (modelli non lineari) | **chiusa** e completa secondo §8.8: tabelle `logit-effects`, `ordinal-effects`, `multinomial-effects`, `count-effects`, `glm-effects`; colonna `ChiSquare (Wald)` in `logit-coefficients`; riga MSE in `nonlinear-fit`; prosa sugli effetti LR in sei lingue; 6 test in `src/stats/effects.test.ts`; golden invariato (solo aggiunte) |
| Fase 2.2, terza integrazione (`anova`) | **chiusa**: Bartlett e O'Brien in `anova-assumptions`, Steel–Dwass tra i post-hoc (p del massimo dei |z| pairwise con correlazione 1/2), opzione nel form e nelle sei lingue, prosa nel report; 4 test in `src/stats/kernels/anova-homogeneity.test.ts` (Bartlett e O'Brien contro R) |

**Test**: `npm run check` verde (1363 test, 0 fail); `npx tsc --noEmit` pulito,
compreso lo script di censimento.

**Artefatti**: `docs/analysis/2026-11-05-inventario-procedure-tabelle.md`
(riepilogo, tabella unica, elenco tabelle per procedura, limiti) e
`docs/analysis/2026-11-05-confronto-tabelle-jmp-regressione.md` (diff voce per
voce della famiglia regressione con rimando ai libri) e
`docs/analysis/2026-11-05-confronto-tabelle-jmp-tutte-le-procedure.md`
(panoramica delle 72 procedure con piattaforma, stato documentale e mancanze).

**Decisioni**: il censimento esegue i runner sui dataset di `samples/manifest.json`
invece di dedurre le tabelle dal codice; una sola modalità per procedura (le
modalità multiple si censiranno in 2.1); la controparte JMP è dichiarata
"documentata" solo se la piattaforma compare nei libri.

**Prossimi 3 passi**: (1) fase 2.2 sui modelli non lineari (7 blocchi: Effect LR
tests e colonna ChiSquare per logistico/ordinale/multinomiale/conteggi, MSE per il
non lineare), ognuno chiuso con la checklist §8.8 compresa la prosa; (2) modelli misti `lmm`/`glmm` (4 blocchi) e confronti `anova`/`variances`
(3 blocchi, Steel–Dwass l'unico non banale).

---

## 0. Checkpoint QA grafici (2026-11-04)

**Branch**: `grafici-procedure` · **worktree**: principale · **ultimo commit**: `fix(charts): legenda colore su una scala valida e barre con poche categorie` (HEAD)

**Contesto**: QA visiva dei 165 modelli grafici nuovi (`1ef2860` → HEAD) e
correzione dei difetti trovati.

| Item | Stato |
| --- | --- |
| QA visiva 165/165 modelli (19 fogli, 14 ingrandimenti) | chiuso |
| Heatmap: inchiostro etichette per luminanza cella | chiuso |
| Pareto: barre e cumulata sullo stesso ordinamento | chiuso |
| Grafici vuoti: `data.series` → `data.points` / `bars` in 5 runner | chiuso |
| MANCOVA: `xType: 'nominal'` | chiuso |
| Assi con domini minuscoli: formato `.4~g` | chiuso |
| Etichette barre: centro del segmento nello stack, fuori barra altrove | chiuso |
| Linee multi-serie tutte dello stesso colore (`mark.stroke` vince sul `color`) | chiuso |
| Riverifica delle 51 card rimaste con i runner reali | 44/51 ricostruite, 7 rinviate (servono fixture: SEM, `ml-confusion`, `ks-diff`, `hw-series`, `mi-categorical-missingness-matrix`) |
| Legenda a dominio degenere di `text-similarity` | chiuso (`colorDomain`: dominio allargato a zero; legenda `.4~g`, legge `0 … 1`) |
| Barre con 1–2 categorie larghe tutta la banda | chiuso (`barThickness`: tetto di 120 px, esclusi i gruppi con `xOffset`) |
| Test di regressione dei due fix | chiuso (`layers.test.ts`: 2 test nuovi) |

**Test**: `npm run check` verde — 1362 test, 0 fail; depcruise e madge puliti;
filesize OK (`layers.ts` 688 righe, helpers di scala in
`src/charts/vega/encoding.ts`, inchiostro in `src/charts/vega/ink.ts`).

**Artefatti**: `docs/qa/new-models-2026-11-04/` (report, metriche, fogli),
`docs/qa/fix-verify-2026-11-04/` (galleria e screenshot after) e
`docs/qa/recheck-2026-11-04/` (riverifica: 44 card, 5 fogli, metriche).

**Prossimi 3 passi**: (1) aggiungere le fixture per le 7 card rinviate (SEM,
`ml-confusion`, `ks-diff`, `hw-series`, `mi-categorical-missingness-matrix`);
(2) ricontrollare i fogli dopo i due fix (fatto: `fix2-*.png`);
(3) push del branch quando richiesto.

---

## 1. Regola d’uso (vincolante)

Questo documento è la **fonte di ripresa** dopo una compattazione del contesto.

Va aggiornato **sempre**:

1. alla fine di ogni checkpoint;
2. **prima** di ogni compattazione;
3. prima di cambiare famiglia, fondazione o sessione;
4. dopo un commit che cambia lo stato del piano.

Se il contesto viene compattato senza che questo file sia aggiornato, la
ripresa è da considerarsi non valida.

Non duplicare qui il piano: riportare stato, commit, test, decisioni e prossimi
passi; per il resto rimandare alle sezioni del piano.

---

## 2. Stato sintetico

| Voce | Valore |
|---|---|
| Ondata corrente | W9 chiusa (gate G9 verde); piano completato |
| Branch/worktree | `feat/gap-wave-1` (in-place, senza worktree) |
| Ultimo commit di codice | `9367952` (chiusura debiti W9) |
| Ultimo commit documentale | questo aggiornamento |
| Test | `npm run check` verde; `npm test` 1298/1298 verdi; `npm run test:samples` 7/7; locale check 6/6 |
| Item chiusi | 73 / 73; W9 chiusa |
| Nuove voci | 36 / 36 (W1–W7 + 7 voci W9) |
| Estensioni | 29 / 37 (cluster k-means/k-medians, life table, frailty, censoring a intervallo, parametriche extra) |
| Reference baseline | 35 / 35 baseline W0 + 7 W3 + 3 W4 + 8 W5 + 5 W6 + 7 W7 + 5 W8 + 7 W9 |
| Blocchi | nessuno |
| Prossimo gate | nessuno; piano completato (G9 verde) |

---

## 3. Dashboard ondate

| Ondata | Scope | Metodi | Nuove voci | Stato | Gate |
|---|---|---:|---:|---|---|
| W0 | Fondazioni condivise + retrofit | — | — | **chiusa** (G0 verde) | G0 |
| W1 | Descriptive + test di base | 14 | 2 | **chiusa** (G1 verde) | G1 |
| W2 | ANOVA/GLMM + Regressione nucleo | 12 | 5 | **chiusa** (G2 verde) | G2 |
| W3 | Regressione avanzata | 7 | 7 | **chiusa** (G3 verde) | G3 |
| W4 | Categorical + MI categorica | 5 | 1 | **chiusa** (G4 verde) | G4 |
| W5 | Multivariate avanzata | 8 | 7 | **chiusa** (G5 verde) | G5 |
| W6 | Survival e affidabilità | 8 | 4 | **chiusa** (G6 verde) | G6 |
| W7 | Time series | 7 | 3 | **chiusa** (G7 verde) | G7 |
| W8 | Quality/DOE/power restanti | 5 | 0 | **chiusa** (G8 verde) | G8 |
| W9 | Survey + ML + Advanced | 7 | 7 | **chiusa** (G9 verde) | G9 |

---

## 4. Dashboard famiglie

| Famiglia | Chiusi | Totale | Stato |
|---|---:|---:|---|
| Descriptive | 8 | 8 | **chiusa** (D-01…D-04, Q-01…Q-04) |
| Compare groups | 11 | 11 | **chiusa** (C-01…C-11) |
| Regression | 15 | 15 | **chiusa** (R-01…R-15) |
| Multivariate | 8 | 8 | **chiusa** (M-01…M-08) |
| Categorical | 4 | 4 | **chiusa** (K-01…K-04) |
| Survival | 8 | 8 | **chiusa** (S-01…S-08) |
| Time series | 7 | 7 | **chiusa** (T-01…T-07) |
| Design & power | 4 | 4 | **chiusa** (P-01…P-03, Q-05) |
| Missing data | 2 | 2 | **chiusa** (N-01, N-02) |
| Machine Learning | 3 | 3 | **chiusa** (L-01…L-03) |
| Advanced & Bayesian | 3 | 3 | **chiusa** (A-01…A-03) |
| **Totale** | **73** | **73** | **piano completato** |

---

## 5. Ondata W0 — chiusa (gate G0 verde)

Obiettivo raggiunto: toolkit numerico, reference harness, sample generator,
i18n/help scaffolding, data shape adapters, performance guards e retrofit dei
reference test sulle 8 procedure esistenti.

| Task | Descrizione | Stato |
|---|---|---|
| W0-01 | `kernels/optimize.ts` (Newton, BFGS, IRLS, EM) | **fatto** |
| W0-02 | `kernels/glm.ts` (famiglie, link, devianza) | **fatto**, reference R via fixture |
| W0-03 | estensioni matrici (solve, Cholesky, SVD, QR, pinv, rango) | **fatto** |
| W0-04 | reference harness R + fixture + tolleranze + helper | **fatto** (`src/stats/reference/`) |
| W0-05 | estensione `samples/generate.R` + schema manifest + validatore | **fatto** |
| W0-06 | i18n/help scaffolding: famiglie pianificate, template pagina, README | **fatto** |
| W0-07 | data shape adapters (long/wide, start-stop, matrici, testo) | **fatto** (`src/io/shapes.ts`) |
| W0-08 | performance guards, benchmark, worker check | **fatto** (`kernels/guards.ts`, `bench:kernels`) |
| W0-09 | retrofit reference test delle 8 procedure | **fatto (8/8)** |
| G0 | gate: toolkit, reference dimostrativa, sample test, 8/8 retrofit | **verde** |

### Verifiche del gate

- `npm run lint` verde.
- `npm test` **880/880** verdi.
- `npm run test:samples` **7/7** verdi (manifest + 5 formati).
- `scripts/check-locale.mjs` verde su `en, it, fr, es, de, pt-PT`.
- `npm run guard` verde (depcruise, madge, file size).
- Reference baseline **35/35** procedure statistiche.

### W0-09 — reference test aggiunti

| Procedura | Reference | Esito |
|---|---|---|
| TOST | R one-sample/paired/independent | verde |
| Quality/SPC | formula chiusa Xbar-R + Cp/Cpk | verde |
| Cluster | R `hclust(method="ward.D2")` | verde (dopo fix) |
| Discriminant | R `MASS::lda` (root canoniche, Wilks, confusion) | verde |
| Partition | R `rpart` (soglie, foglie, R²) | verde |
| DOE | R `lm` (coefficienti, SE, p, R², punto stazionario) | verde |
| MI | forma chiusa deterministica (linea esatta) | verde (dopo fix) |
| Resampling | p esatta 4v4, p=1 degenere, quantili R type 7 | verde |

### Bug reali trovati dai reference test

1. **Ward.D2** (già corretto in W0-09 3/8): fattore `nA·nB` invece di
   `2·nA·nB`, altezze dimezzate di √2.
2. **MI**: `imputeColumn` riempiva i valori mancanti con la media e poi
   saltava l'imputazione perché il segnaposto non era più `null`; MICE non
   imputava mai. Ora il modello condizionale è stimato solo sulle righe
   osservate e i valori mancanti vengono davvero imputati.
3. **DOE**: i p-value dei coefficienti usavano `tSF` (una coda) invece di
   `twoSidedTP` (due code), quindi erano metà di quelli di `lm`.

### Performance (W0-08)

Baseline con `npm run bench:kernels`:

| Caso | Prima | Dopo |
|---|---:|---:|
| OLS 50 000 × 2 | ~28 s (OOM a 100k) | ~0,9 s |
| OLS 10 000 × 2 | ~4,8 s | ~0,5 s |
| GLM binomiale 10 000 | ~35 ms | ~32 ms |
| Ward 120 × 2 | ~133 ms | ~147 ms |

Cause e rimedi:

- Theil–Sen enumerava tutte le coppie (O(n²)) anche dentro 600 bootstrap:
  ora `calcTheilSenCapped` usa al massimo `THEIL_SEN_MAX_ROWS = 100` punti
  equispaziati.
- Test di Lilliefors: 1000 replicazioni su tutto il campione; ora al massimo
  `LILLIEFORS_MAX_ROWS = 1000` righe.
- Guardie centralizzate in `kernels/guards.ts` (`quadratic`, `iterative`,
  `linear`) con messaggi pronti per `AnalysisRunResult.reason`; il runner
  cluster usa `sampleEvenly` invece del passo ad hoc.
- Worker check già coperto da `src/analyses/worker/heavyIds.test.ts`.

### Prossimi 3 passi (W1)

1. Aprire W1: descriptive (frequenze/tally, intervallo di tolleranza) e test
   di base (proporzioni, tasso Poisson, varianza, sign test, Mood, KS).
2. Per ogni metodo: kernel + test + reference, voce di registro, form, help in
   6 lingue, sample nei 5 formati.
3. Chiudere G1 con `npm run check`, locale check e sample test.

### File toccati in W0

- `src/stats/kernels/optimize.ts` + test
- `src/stats/kernels/glm.ts` + test
- `src/stats/kernels/matrix.ts` + test (QR, rango)
- `src/stats/kernels/guards.ts` + test
- `src/stats/kernels/tost.test.ts`, `quality.test.ts`, `cluster.ts/.test.ts`,
  `discriminant.test.ts`, `partition.test.ts`, `doe.ts/.test.ts`,
  `mi.ts/.test.ts`, `resampling.test.ts`
- `src/stats/kernels/regression.ts`, `ranks.ts`, `distributions.ts` (cap
  performance)
- `src/stats/reference/` (harness, fixture `glm.json`, generatore R, README)
- `src/io/sampleManifest.ts` + `samples/manifest.schema.json` +
  `samples/generate.R` (validazione)
- `src/io/shapes.ts` + test
- `src/analyses/registry.ts`, `src/i18n/catalog/*/meta.ts`,
  `src/help/content/template.ts` + README
- `src/analyses/cluster/run.tsx`, `src/analyses/regression/run.tsx`
- `scripts/bench-kernels.mjs`, `package.json`

### Decisioni / deviazioni

- **DOE**: `rsm` non è installato; il reference usa `lm` con lo stesso modello
  quadratico. I coefficienti, gli errori standard, i p-value e il punto
  stazionario sono identici, quindi la copertura è equivalente.
- **Resampling**: il p-value di permutazione del kernel è Monte-Carlo (seed
  fisso), non enumerazione esatta. Il test confronta con l'esattezza 2/70 con
  tolleranza dichiarata `5e-3` e verifica il caso degenere p = 1 in modo
  esatto; l'intervallo bootstrap è confrontato con `quantile(type = 7)` di R
  sulla stessa distribuzione.
- **Nuove famiglie** `ml` e `advanced`: dichiarate nel registro e nei cataloghi
  (6 lingue) ma nascoste da `groupByFamily` finché non hanno procedure.
- `npm test` completo: **880/880 verdi**.

---

## 5b. Ondata W1 — chiusa (gate G1 verde)

Obiettivo raggiunto: 14 metodi tra Descriptive, Compare e Design & power, con
help in 6 lingue, sample nei 5 formati e reference test.

| ID | Metodo | Tipo | Moduli | Reference |
|---|---|---|---|---|
| D-01 | Frequenze/tally | mode `descriptive` | `kernels/frequency.ts` | `table`, `prop.test(correct=FALSE)` |
| D-02 | Outlier Grubbs/Dixon | mode `descriptive` | `kernels/outliers.ts` | formula Grubbs + Beta esatta Dixon |
| D-03 | Runs test | mode `descriptive` | `kernels/runs.ts` | formula R + enumerazione esatta |
| D-04 | Intervallo di tolleranza | mode `quality` | `kernels/tolerance.ts` | Howe + tabella pubblicata |
| Q-04 | CUSUM | mode `quality` | `kernels/cusum.ts` | loop R |
| C-01 | Proporzioni 1/2 campioni | **new `proportions`** | `kernels/proportions.ts` | `binom.test`, `prop.test(correct=FALSE)` |
| C-02 | Tassi Poisson 1/2 campioni | mode `proportions` | `kernels/poissonTests.ts` | `poisson.test` |
| C-03 | Varianze 1/2 | **new `variances`** | `kernels/variances.ts` | `var.test`, `bartlett.test`, `car::leveneTest` |
| C-04 | Sign test | mode `ttest` | `kernels/sign.ts` | `binom.test` |
| C-05 | KS a due campioni | mode `distfit` | `kernels/ks.ts` | `ks.test` (p esatto) |
| C-06 | Mood median | mode `anova` | `kernels/mood.ts` | `coin::median_test` |
| C-07 | GOF categorico | mode `chisquare` | `kernels/goodness.ts` | `chisq.test` |
| P-01 | Sample size una proporzione | mode `samplesize` | `kernels/samplesize.ts` | `pwr::pwr.p.test` |
| P-02 | Sample size varianze/Poisson | mode `samplesize` | `kernels/samplesize.ts` | potenza esatta χ²/Poisson in R |

### Verifiche del gate

- `npm run check` verde (lint, **957/957** test, depcruise/madge/file size).
- `npm run test:samples` **7/7** verdi.
- `scripts/check-locale.mjs` verde su `en, it, fr, es, de, pt-PT`.
- Nuovi reference test: frequency, outliers, runs, tolerance, cusum,
  proportions, poissonTests, variances, sign, ks, mood, goodness,
  samplesize W1.

### Decisioni e deviazioni W1

- **Dixon**: il p esatto usa la distribuzione Beta degli spazi uniformi
  (`r10` Beta(1,n−2), `r11` Beta(1,n−3), `r21` Beta(2,n−4), `r22`
  Beta(2,n−5)) invece delle tavole interpolate: stessa risposta, nessuna
  interpolazione.
- **Tolleranza**: `tolerance::tolInt` non è installato; il fattore usa
  l'approssimazione di Howe, confrontata con la formula R e con la tavola
  pubblicata (differenza ~0,1% a n = 10), dichiarata nel metodo.
- **KS**: il p esatto usa il conteggio dei cammini sul reticolo (BigInt) per
  n₁·n₂ ≤ 200 000; sopra quella soglia usa la serie asintotica e lo dichiara.
- **Mood**: la statistica include la correzione (N−1)/N di
  `coin::median_test`, non il χ² di Pearson non corretto.
- **Runs**: il p asintotico ha la correzione di continuità; il p esatto è
  calcolato per enumerazione combinatoria fino a 50 osservazioni.
- **Sample**: nuovo `compare/two_groups_binary` (5 formati) per proporzioni e
  tassi; `categorical/categorical_gof` per la bontà di adattamento.
- `PROJECT_VERSION` invariato: i nuovi campi sono opzionali e il parser
  applica i default.

### File principali toccati in W1

- `src/stats/kernels/{frequency,outliers,runs,tolerance,cusum,proportions,poissonTests,variances,sign,ks,mood,goodness}.ts`
- `src/stats/kernels/samplesize.ts` (tre nuovi disegni)
- `src/stats/{tables,reports}/{frequency,outliers,runs,tolerance,cusum,proportions,variances,signTest,ks,mood,goodness}.ts`
- `src/stats/analysisResults.ts` (tipi risultato fuori da `kernels/`)
- `src/analyses/{proportions,variances}/`, e modalità in
  `descriptive/`, `quality/`, `ttest/`, `distfit/`, `anova/`, `chisquare/`
- `src/io/project/{types,parse}.ts`, `src/analyses/{params,roles,runners,paramsSnapshot}.ts`
- help `l4*.ts` + `procedures-core/more` in 6 lingue, cataloghi report/chart
- `samples/generate.R`, `samples/manifest.json`, nuovi dataset

---

## 5c. Ondata W2 — chiusa (gate G2 verde)

Obiettivo raggiunto: ANOVA/GLMM + nucleo regressione, **12 metodi, 5 nuove
voci**. Chiusi: C-08, C-09, C-10, C-11, R-01…R-08.

| ID | Metodo | Tipo | Note |
|---|---|---|---|
| C-08 | ANOVA nested | mode `anova` | `kernels/nestedAnova.ts`, reference `aov` |
| C-09 | MANCOVA | mode `discriminant` | `kernels/mancova.ts`, reference `car::Anova` |
| C-10 | GLMM / pendenze casuali | voce `glmm` + mode `lmm` | `kernels/glmm.ts` (Laplace), reference `lme4` |
| C-11 | ANOM | mode `anova` | `kernels/anom.ts`, limite Bonferroni-t documentato |
| R-01 | Stepwise / best subsets | mode `regression` | `kernels/selection.ts`, reference `leaps`/`step` |
| R-02 | Polinomiale | mode `regression` | `kernels/polynomial.ts`, reference `lm(poly raw)` |
| R-03 | Non lineare | voce `nonlinear` | `kernels/nonlinear.ts`, reference `nls` |
| R-04 | Multinomiale | voce `multinomial` | `kernels/multinomial.ts`, reference `nnet::multinom` |
| R-05 | Probit | mode `logistic` | link `probit` in `kernels/logistic.ts`, reference `glm(probit)` |
| R-06 | GLM | voce `glm` | famiglie gaussiana/binomiale/Poisson/Gamma; Tweedie non inclusa |
| R-07 | Quantile | voce `quantile` | `kernels/quantile.ts` (Barrodale–Roberts), reference `quantreg` |
| R-08 | Ridge/LASSO/elastic net | mode `regression` | `kernels/penalized.ts`, reference `glmnet` |

### C-10 — dettaglio implementato

- Modello `η_i = X_iβ + Z_i b_{g(i)}`, `b_g ~ N(0, D)`; `D` 1×1 (intercetta)
  o 2×2 (intercetta + pendenza con covarianza); un solo fattore di gruppo.
- Famiglie/link: gaussiana/identity, binomiale/logit, Poisson/log.
- Log-verosimiglianza di Laplace: modo `b_g` per gruppo con Newton, correzione
  `½ log|H_g|`, ottimizzazione congiunta di β e dei parametri di `D` via BFGS.
- SE dei coefficienti dall'Hessiana numerica a varianze fissate (stessa
  definizione di `lme4` con `use.hessian = FALSE`); p di Wald normale.
- Output: coefficienti fissi, componenti di varianza (varianze, covarianza,
  correlazione, varianza residua gaussiana), BLUP con SE, ICC, logLik, AIC,
  BIC, iterazioni, convergenza.
- Guardie: famiglie/link non ammessi, risposta fuori supporto, gruppi < 2,
  righe disallineate, D singolare o varianza al bordo, separazione, budget.
- `lmm` guadagna il flag `randomSlope`: usa lo stesso kernel gaussiano e produce
  tabelle/report dedicati (`lmmRandomSlope.ts`).

### Reference C-10

`src/stats/reference/r/glmm.R` + `fixtures/glmm.json` con quattro casi
`lme4`: `sleepstudy` con pendenza casuale, `sleepstudy` con sola intercetta,
`birthwt` binomiale, `quine` Poisson (`glmer(nAGQ = 1)` = Laplace).
Scarti misurati: coefficienti 2.2e-5, SE 7.9e-4, componenti di varianza
3.9e-5 relativo, logLik 1.1e-5, AIC 2.1e-5, fitted 6.2e-5. Tolleranze del test:
coefficienti 1e-3, SE 2e-3, varianze 5e-2 relativo, logLik/AIC 1e-2, fitted 1e-3.

### Reference aggiunte in W2

`probit`, `polynomial`, `selection`, `penalized`, `quantile`, `nonlinear`,
`multinomial`, `nestedAnova`, `anom`, `mancova`, `glmm` (script R + fixture
committate; nessun R richiesto a test-time).

### Parallelizzazione usata

- W2 iniziale: tre `general` su kernel `nonlinear`, `multinomial`, `quantile`;
  poi tre `general` sulle voci complete; due `general` sui cataloghi
  reportCopy; uno sulle pagine help.
- C-10: tre `general` in parallelo — kernel+reference `glmm`, tabelle+report
  `glmm`, help 6 lingue — poi un `general` sui cataloghi reportCopy W3.
  Agente principale: contratti condivisi (`types/parse/params/roles/registry/
  runners/AnalysisForm/worker/analysisKinds`), voce `glmm`, estensione `lmm`,
  grafici, sample, integrazione e gate.

### Debito residuo noto

- R-06: Tweedie non implementata (solo Gamma); documentato nel report.
- ANOM: linee di decisione con approssimazione Bonferroni-t, non SMM esatta.
- La fixture MANCOVA usa i valori stampati da `car` (7 cifre): tolleranza 1e-6.
- GLMM: una sola pendenza casuale e un solo fattore di gruppo; non sono
  inclusi effetti casuali incrociati, pesi o offset.
- `lmm` con pendenza casuale usa p di Wald, non gradi di libertà Satterthwaite.

---

## 5d. Ondata W3 — pre-decisioni sulle reference (2026-11-03)

Decisione presa prima di aprire W3, dopo la verifica dei pacchetti R
disponibili. **Nessuna installazione nuova**: le fixture sono committate, R
non serve a test-time.

| Item | Reference scelta | Note |
|---|---|---|
| R-09 PLS | `pls` | canonico |
| R-10 GAM/MARS | `mgcv`, `earth` | canonici |
| R-11 IV/2SLS | `AER::ivreg`, `systemfit` | il pacchetto `ivreg` manca, la funzione c'è |
| R-12 Panel FE/RE | `plm` | canonico |
| R-13 Tobit | `AER::tobit` (survreg) | ML esatto, censura dichiarata nello script |
| R-13 Selection | **base R two-step** | `glm(probit)` + OLS con inverse Mills ratio |
| R-14 Mediazione | `lavaan::sem` + bootstrap per proprietà | punto: tolleranza stretta; bootstrap: niente confronto puntuale |
| R-15 Propensity | `MatchIt` | confronto su ATT e bilanciamento, non sulle coppie |

### Perché queste scelte

- `sampleSelection` e `mediation` non sono installati. `sampleSelection::selection`
  stima in **ML**, mentre lo scope W3 di R-13 è il **two-step**: confrontarli
  richiederebbe tolleranze larghe e nasconderebbe errori. Il riferimento
  two-step si scrive in base R ed è indipendente dal nostro kernel.
- L'ML di Heckman resta **fuori da W3** e va dichiarato come limite nel report
  e nell'help.
- Il bootstrap della mediazione non è confrontabile punto per punto con R
  (generatori casuali diversi). La fixture copre solo `a`, `b`, `c'`, effetto
  indiretto e SE delta; il bootstrap si valida per proprietà: IC che contiene
  la stima, ampiezza che decresce con n, copertura Monte Carlo ≥ nominale −
  tolleranza. Va scritto nel test.
- `quine` ha 2 gruppi `Eth`: per il GLMM resta un campione valido ma poco
  informativo; i riferimenti forti sono `sleepstudy` e `birthwt`.

## 5e. Ondata W3 — avanzamento (2026-11-03)

Apertura di W3 dopo la decisione sulle reference (§5d). Nessuna installazione
R nuova. Stato dei cantieri:

| Item | Stato | Note |
|---|---|---|
| R-09 PLS | **test verdi** | kernel `pls.ts`, reference `pls::plsr(oscorespls)`, 14/14 test, scarti ≤ 2.3e-11 |
| R-10 MARS | **test verdi** | kernel `mars.ts`, reference `earth`, 13/13 test, scarti ≤ 6.7e-13 |
| R-11 IV/2SLS | **test verdi** | kernel `iv.ts`, reference `AER::ivreg` + HC1, 11/11 test, scarti ≤ 1e-13 |
| R-12 Panel FE/RE | **test verdi** | kernel `panel.ts`, reference `plm` (within/random + Hausman), 15/15 test |
| R-13 Tobit/Heckman | **test verdi** | kernel `tobit.ts`, reference `AER::tobit` + base R two-step, 18/18 test |
| R-14 Mediazione | **test verdi** | kernel `mediation.ts`, reference `lavaan`, bootstrap per proprietà, 8/8 test |
| R-15 Propensity | **test verdi** | kernel `propensity.ts`, reference `MatchIt` + base R IPW, 14/14 test |

Integrazione condivisa già fatta: tipi/default, parsing, normalizzazione,
validazione, ruoli, registry, runners, worker, `AnalysisForm`, i18n meta/form,
help 6 lingue, sample manifest e quattro dataset simulati
(`iv_demo`, `panel_demo`, `selection_demo`, `treatment_demo`).

Chiusure finali prima di G3:

- traduzioni `reportCopy` completate per `de`, `fr`, `es`, `pt-PT`: 3309/3309
  frasi in ciascuna lingua (`w3-regression.ts` e `w3-econometrics.ts` per
  locale, agganciati nei rispettivi `catalog/<loc>/index.ts`);
- due chiavi inglesi stantie (varianti superate delle frasi panel su errori
  standard) rimosse da tutti i cataloghi: il test `reportCopy` le segnalava
  come non usate;
- eccezioni di `scripts/check-file-size.mjs` aggiornate per i file condivisi
  cresciuti (`types` 1038, `parse` 872, `params` 1023, `roles` 1005);
- `ANALYSIS_CHART_KINDS` esteso ai 7 nuovi item; rimosso
  `src/analyses/panel/probe.ts`; helper `isFailure` nel test panel per il
  narrowing TS.

Gate G3 (2026-11-03):

| Verifica | Esito |
|---|---|
| `npx tsc --noEmit` | pulito |
| `npm test` | **1161/1161** verdi |
| `npm run test:samples` | 7/7 verdi |
| `npm run depcruise` | nessuna violazione (919 moduli) |
| `npm run madge` | nessuna dipendenza circolare |
| `npm run filesize` | 903 file sotto 700 righe, 8 eccezioni |
| `node scripts/check-locale.mjs` it/en/de/fr/es/pt-PT | 6/6 "translation wave complete" |

Nota dataset: `selection_demo` è stato rigenerato con intercette più basse
(133 censurati su 450, 243 selezionati); la fixture `tobit.json` è stata
rigenerata sui dati reali e i 18 test selection restano verdi.

## 5f. Ondata W4 — avanzamento (2026-11-03)

Apertura di W4 dopo G3. Nessuna installazione R nuova: le reference usano
`stats`, `coin`, `mice`, già disponibili. Stato dei cantieri:

| Item | Stato | Note |
|---|---|---|
| K-01 Mantel–Haenszel | **test verdi** | modalità `mantelHaenszel` di `contingency`; OR pooled, χ² MH con correzione di continuità, OR di strato; reference `mantelhaen.test` + caso cella zero |
| K-02 Cochran–Armitage | **test verdi** | modalità `trend`; formula equivalente a `prop.trend.test`, punteggi editabili in UI |
| K-03 Log-linear | **test verdi** | nuova voce `loglinear`; Poisson su tabella due vie, modelli `independence`/`saturated`; reference `glm(family = poisson)` |
| K-04 Esatti R×C | **test verdi** | modalità `exact`; Fisher per 2×2, enumerazione a margini fissi con budget, Monte Carlo deterministico oltre il budget |
| N-01 MI categorica | **test verdi** | modalità `categorical` di `mi`; MICE con logistica/multinomiale, pooling di Rubin sulle proporzioni; reference `mice` (logreg/polyreg), tolleranza 0.06 |

Integrazione condivisa: `ContingencyParams` esteso con `mode`, `strata`,
`scores`; nuovo `LoglinearParams`; `MiParams.model = 'categorical'`;
`parse.ts` difensivo; registry con `loglinear`; `paramsSnapshot`,
`analysisKinds`, `runners`, `AnalysisForm`, validazione ruoli/perimetro e
default aggiornati. `roles.ts` salta il controllo continuo per le variabili MI
categoriche. Help `w4-*.ts` in 6 lingue; contingency e MI aggiornati nei
sommari e nei rimandi. Chiavi i18n `contingency.mode*`, `contingency.strata*`,
`contingency.scores`, `loglinear.*`, `form.loglinear*`, `form.categorical`,
`meta.analysis.loglinear.*` in 6 lingue.

Chiusure finali prima di G4:

- traduzioni `reportCopy` complete per `de`, `fr`, `es`, `pt-PT`:
  **3512/3512** frasi in ciascuna lingua; nuovi moduli `contingency` e
  `loglinear`, più le frasi dei grafici W4 in `catalog/en/charts.ts`;
- sample nuovi in `samples/categorical/`: `stratified_2x2` (300 righe),
  `ordinal_table` (240), `categorical_table` (160, con codici mancanti);
  `generate.R` e manifest aggiornati, `loglinear` dichiarato manual-only;
- eccezioni di `scripts/check-file-size.mjs` aggiornate per `types` 1092,
  `parse` 945, `roles` 1008 e `catalog/en/charts.ts` 754.

Gate G4 (2026-11-03):

| Verifica | Esito |
|---|---|
| `npx tsc --noEmit` | pulito |
| `npm test` | **1196/1196** verdi |
| `npm run test:samples` | 7/7 verdi |
| `npm run depcruise` | nessuna violazione (942 moduli) |
| `npm run madge` | nessuna dipendenza circolare |
| `npm run filesize` | 926 file sotto 700 righe, 8 eccezioni |
| `node scripts/check-locale.mjs` it/en/de/fr/es/pt-PT | 6/6 "translation wave complete" |

Decisioni W4:

- K-01/K-02/K-04 restano **modalità** di `contingency`, non nuove voci; la
  modalità `chi2` conserva tabelle, grafici e note invariati.
- K-03 è una **voce nuova** perché ha un modello e una UI propri; il modello
  saturo non passa da `glmFit` (p = n), ma risolve `Xβ = log(y)` e costruisce
  la covarianza da `(X'WX)⁻¹`. Con una cella zero il saturo è rifiutato.
- N-01 imputa solo categorie osservate, non introduce codici nuovi; il FIML
  resta fuori scope e verrà ripreso dopo M-05.
- Il confronto con `mice` è sulla distribuzione pooled delle proporzioni
  (tolleranza assoluta 0.06), non sui singoli valori imputati: RNG e schedule
  delle catene sono diversi.

## 5g. Ondata W5 — avanzamento (2026-11-03)

Apertura di W5 dopo G4. Pacchetti R verificati: `lavaan`, `poLCA`, `mirt`,
`ca`, `conjoint` disponibili (installati nella library utente per generare le
fixture); i test usano solo i JSON committati.

| Item | Stato | Note |
|---|---|---|
| M-01 K-means/k-medians | **test verdi** | modalità `kmeans`/`kmedians` di `cluster`; inizializzazione farthest-first deterministica; reference `stats::kmeans` |
| M-02 Correlazione canonica | **test verdi** | nuova voce `canonical`; SVD di `Sxx^-1/2 Sxy Syy^-1/2`; reference `cancor` |
| M-03 MDS | **test verdi** | nuova voce `mds`; classica (Torgerson) e non metrica (Kruskal/PAVA); reference `cmdscale`/`isoMDS` |
| M-04 Corrispondenze | **test verdi** | nuova voce `correspondence` con editor di tabella; reference `ca::ca` |
| M-05 SEM/CFA | **test verdi** | nuova voce `sem`; ML su covarianza con fattori a varianza 1 e percorso strutturale opzionale; reference `lavaan` |
| M-06 Classi latenti | **test verdi** | nuova voce `latentclass`; EM con start deterministici e casuali, BIC/entropia; reference `poLCA` |
| M-07 IRT | **test verdi** | nuova voce `irt`; 2PL/Rasch con quadratura gaussiana ed EM; reference `mirt` |
| M-08 Conjoint | **test verdi** | nuova voce `conjoint`; codifica a effetti, utilità parziali e importanza; reference `conjoint`/`lm` |

Integrazione condivisa: `ProjectParams` e `parse.ts` estesi con i sette nuovi
blocchi; `params.ts` (validazione/remap), `rolesW5.ts`, `paramsSnapshot`,
`registry`, `runners`, `worker/heavyIds` + `heavyRunners`,
`AnalysisForm`, `analysisKinds`, `useProjectParams` e default per ogni voce.
Help `w5-*.ts` in 6 lingue (69 pagine per libro); chiavi i18n `canonical.*`,
`mds.*`, `sem.*`, `latentclass.*`, `irt.*`, `conjoint.*`, `cluster.kmeans*`,
`meta.analysis.*` in 6 lingue.

Chiusure finali prima di G5:

- F4: `src/stats/kernels/latent.ts` con standardizzazione, BIC/AIC/AICc,
  entropia normalizzata, quadratura Gauss-Hermite, gradiente numerico e
  `maximize`.
- `reportCopy` W5 completo: **3693/3693** frasi per `en`, `fr`, `es`, `de`,
  `pt-PT`; nuovi moduli `w5.ts` per locale.
- Sample nuovi in `samples/multivariate/`: `sem_demo` (320), `latent_demo`
  (450), `irt_demo` (600), `conjoint_demo` (18); `generate.R` e manifest
  aggiornati; `correspondence` dichiarata manual-only.
- Reference R: `cluster.R`, `canonical.R`, `mds.R`, `correspondence.R`,
  `sem.R`, `latentclass.R`, `irt.R`, `conjoint.R` + fixture JSON.
- Eccezioni file-size aggiornate: `types` 1194, `parse` 1020, `params` 1129,
  `roles` 1016.

Gate G5 (2026-11-03):

| Verifica | Esito |
|---|---|
| `npx tsc --noEmit` | pulito |
| `npm test` | **1206/1206** verdi |
| `npm run test:samples` | 7/7 verdi |
| `npm run depcruise` | nessuna violazione (1004 moduli) |
| `npm run madge` | nessuna dipendenza circolare |
| `npm run filesize` | 988 file sotto 700 righe, 8 eccezioni |
| `node scripts/check-locale.mjs` it/en/de/fr/es/pt-PT | 6/6 "translation wave complete" |

Decisioni W5:

- M-01 resta una **modalità** di `cluster` (nessuna voce nuova), con
  `method = kmeans | kmedians`; le modalità gerarchiche conservano dendrogramma
  e profili.
- M-05 è una CFA con fattori a varianza 1 e percorso strutturale opzionale tra
  due fattori; non è un SEM generalizzato. Il limite è dichiarato nel report.
- M-06 usa start deterministici più start casuali; nei modelli a 3 classi la
  fixture `poLCA` può cadere in un massimo locale diverso, quindi il test
  confronta log-verosimiglianza e BIC, non la permutazione delle classi.
- M-07 stima 2PL/Rasch con EM e quadratura; i parametri sono confrontati con
  `mirt` a tolleranza larga perché i due ottimizzatori possono fermarsi in
  punti vicini della stessa cresta di verosimiglianza.
- M-08 usa la stessa codifica a effetti di `conjoint::caUtilities` (`lm` con
  `contr.sum`); la fixture è generata da quel modello.

## 5h. Ondata W6 — avanzamento (2026-11-03)

### Cosa è stato chiuso

- **S-01** Life table: modalità `life` in `survival`, tavola attuariale con q,
  p, S(t), SE di Greenwood per gruppo.
- **S-02** Competing risks: nuova voce `competing`, kernel Fine–Gray con
  CIF, `cmprsk::crr` come reference.
- **S-03** Frailty: modalità `frailty` in `cox`, fragilità gamma condivisa con
  EM e varianza θ, `coxph(frailty(...))` come reference.
- **S-04** Eventi ricorrenti: nuova voce `recurrent`, Andersen–Gill e
  Wei–Lin–Weissfeld con errori robusti per soggetto.
- **S-05** Censoring L/R/intervallo: modalità `interval` in `survival` con
  NPMLE di Turnbull; `survfit(Surv(type="interval2"))` come reference.
- **S-06** Parametriche extra: log-normale, log-logistica e Gompertz in
  `parametric`, con censura a intervallo.
- **S-07** ALT: nuova voce `alt`, AFT di Weibull su stress trasformato e
  fattore di accelerazione.
- **S-08** Reliability growth/RBD: nuova voce `reliability`, Crow–AMSAA e
  diagrammi serie/parallelo.

### F5 — fondazione survival

La fondazione F5 è stata realizzata dentro i kernel esistenti e nuovi:
verosimiglianza parziale pesata per la fragilità gamma (EM), verosimiglianza
Fine–Gray con pesi di censura, score residuali cluster-robust per AG/WLW e
verosimiglianza AFT/PH con supporto a intervalli. Non è stato creato un file
separato: le parti condivise restano in `kernels/survival.ts`,
`kernels/cox.ts`, `kernels/parametric.ts`.

### Reference e sample

- 5 nuovi reference test: `survivalW6`, `competing`, `recurrent`, `alt`,
  `reliability` con fixture JSON committate e script R in
  `src/stats/reference/r/`.
- 4 nuovi sample in 5 formati: `competing_demo`, `recurrent_demo`, `alt_demo`,
  `reliability_demo`.
- I sample legacy `categorical_table`, `ordinal_table`, `stratified_2x2`
  sono stati riportati in `samples/generate.R` per non perderli nella
  rigenerazione.

### UI, help e copy

- Registry, tipi, parse, params, ruoli (`rolesW6`), runners, worker heavy,
  `AnalysisForm`, `analysisKinds`, default e `useProjectParams` aggiornati.
- Help W6 in 6 lingue (`w6-*.ts`) con 4 nuove pagine.
- Copy report/tabelle W6: catalogo inglese completo; le altre lingue
  riusano temporaneamente il catalogo inglese per i nuovi messaggi.
  `check-locale` è verde su 6/6.

### Verifiche

- `npm run check` **verde** (1227/1227 test, tsc, depcruise, madge,
  file size).
- `npm run test:samples` **7/7**.
- Locale check **6/6**.
- Reference W6 **5/5** verdi.

---

## 5j. Ondata W8 — avanzamento (2026-11-03)

Obiettivo raggiunto: 5 metodi quality/DOE/power, nessuna nuova voce.

| ID | Metodo | Tipo | Moduli | Reference |
|---|---|---|---|---|
| Q-01 | Gage R&R / MSA | mode `quality` | `kernels/msa.ts` | ANOVA due vie base R |
| Q-02 | Acceptance sampling/OC | mode `quality` | `kernels/acceptance.ts` | `pbinom`/`phyper` + `uniroot` |
| Q-03 | Carte multivariate T² | mode `quality` | `kernels/mcontrol.ts` | covarianza pooled + `qf` base R |
| P-03 | Power regressione/logistica | mode `samplesize` | `kernels/samplesize.ts` | `pwr::pwr.f2.test` + formula Hsieh |
| Q-05 | Generazione disegni DOE | mode `doe` | `kernels/doeDesign.ts` | `expand.grid` + generatori espliciti |

### Decisioni e deviazioni W8

- Q-02 non richiede il grid: il piano `(n, c)` e il lotto sono parametri; il
  sample `acceptance_demo` documenta l'ispezione storica.
- Q-03 usa la formulazione Phase I con covarianza pooled e limite F esatto.
- Q-05 copre fattoriale completo, metà frazione, CCD rotabile e Box-Behnken
  (3–4 fattori); `FrF2`, `DoE.base` e `rsm` non sono installati, quindi il
  reference usa `expand.grid` con gli stessi generatori.
- P-03: `pwrss` non è installato; la logistica usa la formula chiusa di Hsieh
  et al., documentata nel reference.
- Copy report/tabelle e titoli grafici W8 per de/fr/es/pt-PT usano il catalogo
  inglese (debito dichiarato, come W6/W7).

### Verifiche del gate G8

- `npm run check` verde: `tsc`, **1266/1266** test, depcruise, madge, file size.
- `npm run test:samples` **7/7**; 3 sample nuovi (`msa_demo`,
  `acceptance_demo`, `doe_demo`) in 5 formati.
- Locale check **6/6** (76 pagine help, 4398 frasi report).
- Reference W8 **5/5** verdi; fixture committate.

### Handoff — 2026-11-03 / chiusura W8 (G8 verde)

- Ondata: W8 chiusa, gate G8 verde; prossima W9.
- Branch/worktree: `feat/gap-wave-1` (in-place, nessun worktree).
- Ultimo commit: `f1a93dc` (chiusura W8) su `feat/gap-wave-1`.
- Item chiusi (ID): Q-01, Q-02, Q-03, P-03, Q-05.
- Item in corso (ID): nessuno.
- Item bloccati (ID + motivo): nessuno.
- Test eseguiti e risultato: `npm run check` verde (1266/1266); sample
  7/7; locale 6/6.
- File/moduli toccati: kernel `msa`, `acceptance`, `mcontrol`, `doeDesign`,
  `samplesize`; tabelle/report omonimi; form quality/doe/samplesize; contratti
  `types/parse/params/roles`; help 6 lingue; copy W8; sample W8; reference.
- Decisioni prese / deviazioni dal piano: vedi sopra.
- Prossimi 3 passi:
  1. Aprire W9: N-02 survey, L-01 ML, L-02 text, L-03 choice, A-01 bayes,
     A-02 meta, A-03 spatial.
  2. Verificare le fondazioni F8 (MCMC, ensemble, survey variance) prima dei
     kernel; usare fallback R quando i pacchetti non sono installati.
  3. Chiudere G9 con check completo, sample, locale e aggiornamento conteggi.
- Domande aperte: nessuna.
- Rischi attivi: F8 non ancora implementata; L-02 richiede un formato testo
  dedicato; A-01/A-03 sono heavy e vanno nel worker.

---

## 5k. Ondata W9 — avanzamento (2026-11-03)

Obiettivo raggiunto: 7 metodi survey/ML/advanced, 7 nuove voci di registro.
Copertura finale: **73/73 metodi**, **36/36 nuove voci**.

| ID | Metodo | Tipo | Moduli | Reference |
|---|---|---|---|---|
| N-02 | Survey/complex samples | nuova voce `survey` | `kernels/survey.ts` | `survey::svydesign` + `svymean`/`svytotal`/`svyglm` |
| L-01 | RF/boosting/reti neurali | nuova voce `ml` | `kernels/ml.ts`, `kernels/ensemble.ts` | `randomForest` + `gbm` + `nnet` |
| L-02 | Text mining | nuova voce `text` | `kernels/text.ts` | base R TF-IDF/coseno + `scikit-learn` LDA |
| L-03 | Choice/MaxDiff | nuova voce `choice` | `kernels/choice.ts` | `optim` sul logit condizionale + conteggi esatti |
| A-01 | Analisi bayesiana | nuova voce `bayes` | `kernels/bayes.ts`, `kernels/mcmc.ts` | posteriori coniugate, Gibbs gerarchico + `lm` |
| A-02 | Meta-analisi | nuova voce `meta` | `kernels/meta.ts` | `metafor::rma` + `lm` pesata per Egger |
| A-03 | Statistica spaziale | nuova voce `spatial` | `kernels/spatial.ts` | `spdep` + `spatialreg::lagsarlm` |

### Decisioni e deviazioni W9

- F8 è stata assorbita nei kernel: `mcmc.ts` (Rhat/ESS/HDI), `ensemble.ts`
  (alberi/RF/boosting), `survey.ts` (varianza di linearizzazione con PSU).
- L-01 copre random forest, gradient boosting e rete a uno strato nascosto sia
  per regressione sia per classificazione one-vs-rest, con matrice di confusione,
  accuratezza bilanciata e log-loss.
- L-02 usa LDA con Gibbs collapsing; il reference è `scikit-learn` LDA
  (inferenza variazionale) e confronta perplessità e recupero dei vocabolari.
- A-01 usa campionatori coniugati e Gibbs, non Stan/brms: il reference è
  analitico per i modelli coniugati, `lm` per la regressione e `lme4` per il
  modello gerarchico normale.
- A-02 usa intervalli normali (come `metafor` con `test = "z"`) e il test di
  Egger coincide con la regressione pesata `lm(effect ~ se, weights = 1/se²)`.
- A-03 usa pesi k-nearest row-standardised e verosimiglianza concentrata SAR;
  il modello filtra solo l'esito, non la matrice disegno.
- Copy report/tabelle e titoli grafici W6–W9 sono tradotti per de/fr/es/pt-PT;
  il catalogo grafico storico resta inglese-first con override locali.

### Verifiche del gate G9

- `npm run check` verde: `tsc`, **1298/1298** test, depcruise, madge, file size.
- `npm run test:samples` **7/7**; 8 sample nuovi (`survey_demo`, `ml_demo`,
  `text_demo`, `choice_demo`, `maxdiff_demo`, `meta_demo`, `bayes_demo`,
  `spatial_demo`) in 5 formati.
- Locale check **6/6** (83 pagine help, 4645 frasi report).
- Reference W9 **9/9** verdi; fixture committate. Test W9 complessivi:
  runner, reference e regressione/classificazione ML.

### Handoff — 2026-11-03 / chiusura W9 (G9 verde)

- Ondata: W9 chiusa, gate G9 verde; piano completato.
- Branch/worktree: `feat/gap-wave-1` (in-place, nessun worktree).
- Ultimo commit: `9367952` (chiusura debiti W9) su `feat/gap-wave-1`.
- Item chiusi (ID): N-02, L-01, L-02, L-03, A-01, A-02, A-03.
- Item in corso (ID): nessuno.
- Item bloccati (ID + motivo): nessuno.
- Test eseguiti e risultato: `npm run check` verde (1298/1298); sample 7/7;
  locale 6/6; reference W9 9/9.
- File/moduli toccati: kernel `survey`, `ml`, `ensemble`, `text`, `choice`,
  `meta`, `bayes`, `mcmc`, `spatial`; tabelle/report omonimi; form e default
  delle 7 voci; contratti `types/parse/params/roles/registry`; help W9 in 6
  lingue; copy W9; reference e fixture; 8 sample W9; docs di stato.
- Decisioni prese / deviazioni dal piano: vedi sopra.
- Prossimi 3 passi:
  1. Revisione finale del branch e merge su `main`.
  2. Eventuale release v0.19 con note di rilascio.
  3. Manutenzione del catalogo grafico storico (ancora inglese-first).
- Domande aperte: nessuna.
- Rischi attivi: il catalogo grafico storico non è tradotto in tutte le voci;
  le traduzioni W6–W9 vanno riviste quando cambia la prosa inglese.

---

## 6. Registro checkpoint

| Data | Checkpoint | Commit | Test | Esito | Note |
|---|---|---|---|---|---|
| 2026-11-02 | Piano approvato | `746b558` | docs only | verde | Creato piano v2.0 e protocollo |
| 2026-11-02 | Piano v2.2 + W0-09 | `in corso` | docs only | verde | Aggiunto retrofit reference test per 8 procedure |
| 2026-11-02 | Checkpoint W0 parziale | `9c6116a` | `npm test` 850/850 | verde | W0-01/02/03 chiusi; W0-09 3/8; fix Ward.D2 |
| 2026-11-02 | Chiusura W0 / G0 | `ab0c26a` | `npm run check` + `test:samples` + locale 6/6 | verde | W0-01…09 chiusi; 880/880; fix MI e DOE; cap Theil–Sen/Lilliefors |
| 2026-11-03 | Chiusura W1 / G1 | `e10684a` | `npm run check` + `test:samples` + locale 6/6 | verde | 14 metodi (D-01…D-04, Q-04, C-01…C-07, P-01/P-02); 957/957; 2 nuove voci |
| 2026-11-03 | Handoff pre-compattazione | `bccd8bd` | `npm run check` verde (ultima esecuzione) | verde | W1 chiusa; W2 pianificata con batch di 3 subagenti; nessun file W2 scritto |
| 2026-11-03 | Checkpoint W2 (11/12) | `7bf4e84` | `npm run check` 1052/1052 + `test:samples` 7/7 + locale 6/6 | verde | C-08/C-09/C-11, R-01…R-08 tranne C-10; 4 nuove voci; 10 reference; G2 non dichiarato |
| 2026-11-03 | Chiusura W2 / G2 | `863029b` + `3ff1b34` + `7bfb8f4` | `npm run check` 1068/1068 + `test:samples` 7/7 + locale 6/6 | verde | C-10 GLMM Laplace + `lmm` random slope; 26/73 metodi, 7/36 voci, 20/37 estensioni |
| 2026-11-03 | Chiusura W3 / G3 | `8f8298f` | `npm run check` 1161/1161 + `test:samples` 7/7 + locale 6/6 | verde | R-09…R-15 (7/7); 33/73 metodi, 14/36 voci; traduzioni reportCopy 5 lingue complete |
| 2026-11-03 | Chiusura W4 / G4 | `e2ec8cc` | `npm run check` 1196/1196 + `test:samples` 7/7 + locale 6/6 | verde | K-01…K-04 + N-01 (5/5); 38/73 metodi, 15/36 voci; 3 reference W4; traduzioni reportCopy 5 lingue complete |
| 2026-11-03 | Chiusura W5 / G5 | `09c67cc` | `npm run check` 1206/1206 + `test:samples` 7/7 + locale 6/6 | verde | M-01…M-08 (8/8); 46/73 metodi, 22/36 voci, 25/37 estensioni; 8 reference W5; F4 e reportCopy 5 lingue complete |
| 2026-11-03 | Chiusura W6 / G6 | chiusura W6 | `npm run check` + `test:samples` + locale 6/6 | verde | S-01…S-08 (8/8); 54/73 metodi, 26/36 voci; 5 reference W6 |
| 2026-11-03 | Chiusura W7 / G7 | `994a5d4` + `515062c` | `npm run check` 1241/1241 + `test:samples` 7/7 + locale 6/6 | verde | T-01…T-07 (7/7); 61/73 metodi, 29/36 voci; 7 reference W7 |
| 2026-11-03 | Chiusura W8 / G8 | `f1a93dc` + docs | `npm run check` 1266/1266 + `test:samples` 7/7 + locale 6/6 | verde | Q-01…Q-03, P-03, Q-05 (5/5); 66/73 metodi, 29/36 voci; 5 reference W8, 3 sample nuovi |
| 2026-11-03 | Chiusura W9 / G9 | `fd4858d` + docs | `npm run check` 1295/1295 + `test:samples` 7/7 + locale 6/6 | verde | N-02, L-01…L-03, A-01…A-03 (7/7); 73/73 metodi, 36/36 voci; 7 reference W9, 8 sample nuovi |
| 2026-11-03 | Debiti W9 chiusi | `9367952` | `npm run check` 1298/1298 + `test:samples` 7/7 + locale 6/6 | verde | Classificazione ML, Bayes gerarchico, LDA, copy W6–W9 in 4 lingue; reference W9 9/9 |
| 2026-11-03 | Release v0.19.0 | `7511471` + tag `v0.19.0` | GitHub Actions release verde; check 1298/1298 + sample 7/7 + locale 6/6 | verde | Merge su `main`, versione 0.19.0, release pubblicata con asset Linux/Windows/macOS zip; DMG macOS manuale |

> A ogni checkpoint aggiungere una riga. Non cancellare le righe precedenti.

---

## 7. Handoff per la prossima compattazione

Compilare **prima** di compattare. Se un campo non si applica, scrivere “n/d”.

Handoff corrente: **§5k — chiusura W9 / G9 verde**. Piano completato:
73/73 metodi, 36/36 nuove voci. Prossimo passo: revisione finale, merge e
release v0.19.

## 5i. Ondata W7 — avanzamento (2026-11-03)

- **Stato**: W7 chiusa il 2026-11-03; gate G7 verde.
- **Metodi**: T-01 Holt–Winters, T-02 radici unitarie (ADF/KPSS/PP),
  T-03 VAR/VECM, T-04 analisi spettrale, T-05 ARIMAX, T-06 GARCH(1,1),
  T-07 state-space locale e Markov switching a due regimi.
- **Nuove voci**: `var`, `garch`, `statespace`; T-01/T-02/T-04/T-05 sono
  modalità della voce `timeseries`.
- **Kernel**: `holtwinters.ts`, `unitroot.ts`, `spectral.ts`, `var.ts`,
  `garch.ts`, `statespace.ts`; ARIMA esteso con `xreg` per ARIMAX e ADF con
  trend; ottimizzatore condiviso in `minimize.ts`.
- **Reference**: 7 test nuovi (`holtwinters`, `unitroot`, `spectral`,
  `arimax`, `var`, `garch`, `statespace`) con fixture JSON committate.
  `vars`, `rugarch`, `KFAS`, `MSwM` non sono installati: i reference usano
  implementazioni indipendenti in R base (`lm`, `optim`, ricorsioni
  Kalman/Hamilton) e `tseries`/`urca` dove disponibili.
- **Integrazione**: tipi, parse, params, ruoli (`rolesW7`), registry, runners,
  worker heavy, form, chart kinds, default, report/tabelle e copy W7.
- **Help**: 3 nuove pagine in 6 lingue (`w7-*.ts`) e nota sulle modalità nella
  pagina Time Series.
- **Sample**: `var_demo`, `garch_demo`, `statespace_demo` in 5 formati.
- **Test**: `npm run check` verde (1241/1241), `test:samples` 7/7, locale
  check 6/6 (76 pagine help, 4268 frasi report in inglese).
- **Debito dichiarato**: il copy report/tabelle e i titoli dei grafici W7 per
  de/fr/es/pt-PT usano temporaneamente il catalogo inglese, come in W6.

---

### Handoff — 2026-11-03 / chiusura W7 (G7 verde)

- Ondata: W7 chiusa, gate G7 verde; prossima W8 (quality/DOE/power).
- Branch/worktree: `feat/gap-wave-1` (in-place, nessun worktree).
- Ultimo commit: `994a5d4` (codice, help, sample e copy W7); documenti in
  questo commit.
- Item chiusi (ID): T-01 Holt–Winters, T-02 radici unitarie, T-03 VAR/VECM,
  T-04 analisi spettrale, T-05 ARIMAX, T-06 GARCH, T-07 state-space/Markov.
- Item in corso (ID): nessuno.
- Item bloccati (ID + motivo): nessuno.
- Test eseguiti e risultato: `npm run check` verde (1241/1241 test, tsc,
  depcruise, madge, file size); `test:samples` 7/7; locale check 6/6.
- File/moduli toccati: contratti `types/parse/params/rolesW7/registry/
  runners/heavyIds/heavyRunners/AnalysisForm/analysisKinds/useProjectParams`;
  kernel `holtwinters`, `unitroot`, `spectral`, `var`, `garch`, `statespace`,
  `minimize`; ARIMA con `xreg`; tabelle/report/reportCopy/help W7; 3 sample
  nuovi; 7 reference test e fixture.
- Decisioni prese / deviazioni dal piano:
  - F6 è realizzata dentro `statespace` e `garch`, con ottimizzatore condiviso
    in `minimize.ts` (non un file Kalman separato).
  - I reference VAR/VECM e GARCH usano R base (`lm`, `optim`) e
    `tseries`/`urca` perché `vars`, `rugarch`, `KFAS` e `MSwM` non sono
    installati; le fixture sono committate e i test non richiedono R.
  - ARIMAX stima una regressione con errori ARMA (come `forecast::Arima`), non
    regressori aggiunti alla sola equazione ARIMA.
  - Il copy W7 per de/fr/es/pt-PT usa temporaneamente il catalogo inglese
    (debito dichiarato, come W6).
- Prossimi 3 passi:
  1. Aprire W8 verificando i metodi quality/DOE/power restanti e i reference.
  2. Implementare gli item W8 con test mirati per step.
  3. Chiudere G8 con `npm run check`, `test:samples`, locale check e
     aggiornamento di stato/piano.
- Domande aperte: nessuna; restano i debiti di traduzione del copy W6/W7 per
  de/fr/es/pt-PT.
- Rischi: la stima locale state-space è lenta su serie lunghe (worker heavy);
  i reference R base non coprono `vars`/`rugarch`/`KFAS`/`MSwM` originali.

### Handoff — 2026-11-03 / chiusura W6 (G6 verde)

- Ondata: W6 chiusa, gate G6 verde; prossima W7 (time series).
- Branch/worktree: `feat/gap-wave-1` (in-place, nessun worktree).
- Ultimo commit: codice `0bc03fe`, documenti `19a82bc`.
- Item chiusi (ID): S-01 life table, S-02 competing risks, S-03 frailty,
  S-04 eventi ricorrenti, S-05 censoring a intervallo, S-06 parametriche
  extra, S-07 ALT, S-08 reliability growth/RBD.
- Item in corso (ID): nessuno.
- Item bloccati (ID + motivo): nessuno.
- Test eseguiti e risultato: `npm run check` verde (1227/1227 test, tsc,
  depcruise, madge, file size); `test:samples` 7/7; locale check 6/6.
- File/moduli toccati: contratti `types/parse/params/rolesW6/registry/
  runners/heavyIds/heavyRunners/AnalysisForm/analysisKinds/useProjectParams`;
  kernel `survival`, `cox`, `parametric`, `competing`, `recurrent`, `alt`,
  `reliability`; tabelle/report/reportCopy/help W6; 4 sample nuovi.
- Decisioni prese / deviazioni dal piano:
  - F5 non è un file separato: le verosimiglianze condivise restano nei kernel
    delle procedure che le usano.
  - Frailty gamma via EM con verosimiglianza parziale pesata; θ è stimato con
    massimizzazione numerica della prior gamma attesa.
  - La varianza di Fine–Gray è model-based (la sandwich di `crr` include il
    termine di censura): confronto con tolleranza dichiarata.
  - Il copy W6 per de/fr/es/pt-PT usa temporaneamente il catalogo inglese.
- Prossimi 3 passi:
  1. Aprire W7: Holt-Winters, radice unitaria, VAR/VECM, spettrale,
     ARIMAX, GARCH, state-space.
  2. Verificare F6 (Kalman, smoothing, filtri) e i pacchetti R disponibili.
  3. Implementare T-01/T-02/T-04/T-05 sul motore ARIMA e T-03/T-06/T-07 con
     reference dedicati.
- Domande aperte: nessuna; la traduzione completa del copy W6 è un debito
  dichiarato.
- Rischi attivi: la fragilità gamma e la varianza Fine–Gray sono
  approssimazioni; l’estrapolazione ALT resta un’assunzione fisica.

### Handoff — 2026-11-03 / chiusura W5 (G5 verde)

- Ondata: W5 chiusa, gate G5 verde; prossima W6 (survival e affidabilità).
- Branch/worktree: `feat/gap-wave-1` (in-place, nessun worktree).
- Ultimo commit: `a0055dd` (etichette ruolo W5; gate su `09c67cc`).
- Item chiusi (ID): M-01 k-means/k-medians, M-02 correlazione canonica,
  M-03 MDS, M-04 corrispondenze, M-05 SEM/CFA, M-06 classi latenti,
  M-07 IRT, M-08 conjoint.
- Item in corso (ID): nessuno.
- Item bloccati (ID + motivo): nessuno.
- Test eseguiti e risultato: `npm run check` **verde** (1206/1206 test, tsc,
  depcruise, madge, file size); `npm run test:samples` 7/7; locale check 6/6.
- File/moduli toccati: contratti `types/parse/params/roles/rolesW5/
  paramsSnapshot/registry/runners/heavyIds/heavyRunners/AnalysisForm/
  analysisKinds/useProjectParams`; kernel `latent` (F4), `cluster`,
  `canonical`, `mds`, `correspondence`, `sem`, `latentclass`, `irt`,
  `conjoint`; tabelle/report omonimi; voci `analyses/{canonical,mds,
  correspondence,sem,latentclass,irt,conjoint}` e form/run; help `w5-*.ts` in
  6 lingue; cataloghi reportCopy `w5.ts` per locale; `samples/generate.R` e
  manifest con 4 dataset; reference R + fixture W5.
- Decisioni prese / deviazioni dal piano:
  - M-01 è una modalità di `cluster`, non una voce nuova.
  - M-05 è una CFA con fattori a varianza 1 e percorso strutturale opzionale;
    il SEM generalizzato resta fuori scope.
  - M-06 confronta con `poLCA` su log-verosimiglianza e BIC quando i massimi
    locali differiscono; il test stretto è sul modello a 2 classi.
  - M-07 confronta i parametri con `mirt` a tolleranza larga e la
    log-verosimiglianza in modo stretto.
  - M-08 replica la codifica di `conjoint::caUtilities` (`lm`, `contr.sum`).
- Prossimi 3 passi:
  1. Aprire W6 verificando i pacchetti R per survival e affidabilità.
  2. Implementare S-01…S-08 uno alla volta con kernel + reference + voce/UI +
     help/i18n, come per W5.
  3. Chiudere G6 con `npm run check`, `test:samples` e locale check.
- Domande aperte: nessuna.
- Rischi attivi: i pacchetti `poLCA`, `mirt`, `conjoint` sono installati solo
  nella library utente usata per generare le fixture; i test non richiedono R.
  SEM/IRT hanno molti parametri e i TableSpec restano volutamente minimi.

### Riassunto di 10 righe — W5

1. Ondata e obiettivo: W5 chiusa, G5 verde; 46/73 metodi.
2. Cosa è chiuso: 8 metodi, 7 voci nuove, 1 estensione.
3. Cosa è in corso: nulla; W6 pronta a partire.
4. Cosa è bloccato: nulla.
5. Ultimo commit: `09c67cc` su `feat/gap-wave-1`.
6. Test: `npm run check` 1206/1206; sample 7/7; locale 6/6.
7. Decisioni: cluster k-means/k-medians come modalità; CFA invece di SEM
   generalizzato; latent class e IRT con tolleranze dichiarate.
8. Prossimi 3 passi: aprire W6, implementare S-01…S-08, chiudere G6.
9. Domande: nessuna.
10. Rischi: reference R di W6 da verificare prima dei kernel; output survival
    e affidabilità da limitare per non esplodere.

### Handoff — 2026-11-03 / chiusura W4 (G4 verde) — storico

- Ondata: W4 chiusa, gate G4 verde; prossima W5 (multivariate avanzata).
- Branch/worktree: `feat/gap-wave-1` (in-place, nessun worktree).
- Ultimo commit: `e2ec8cc` (chiusura W4).
- Item chiusi (ID): W3 completa; W4 completa — K-01 Mantel–Haenszel,
  K-02 Cochran–Armitage, K-03 log-linear, K-04 esatti R×C, N-01 MI categorica.
- Item in corso (ID): nessuno.
- Item bloccati (ID + motivo): nessuno.
- Test eseguiti e risultato: `npm run check` **verde** (1196/1196 test, tsc,
  depcruise, madge, file size); `npm run test:samples` 7/7; locale check 6/6
  ("translation wave complete" per it/en/de/fr/es/pt-PT).
- File/moduli toccati: contratti `types/parse/params/roles/paramsSnapshot/
  registry/runners/AnalysisForm/analysisKinds`; kernel `contingency`,
  `loglinear`, `miCategorical`; tabelle/report `contingencyModes`,
  `loglinear`, `miCategorical`; voci `analyses/loglinear/*` e form/run
  `contingency`, `mi`; help `w4-*.ts` in 6 lingue; cataloghi reportCopy
  `contingency`, `loglinear`, `mi`, `charts`; `samples/generate.R` e manifest
  con 3 dataset; fixture reference `contingency`, `loglinear`, `mi`.
- Decisioni prese / deviazioni dal piano:
  - K-01/K-02/K-04 sono modalità di `contingency`; la modalità `chi2` resta
    invariata per tabelle, grafici e note.
  - K-03 è una voce nuova; il saturo risolve direttamente `Xβ = log(y)` perché
    `glmFit` rifiuta p = n; con celle zero il saturo è rifiutato.
  - N-01 imputa solo categorie osservate con pooling di Rubin sulle
    proporzioni; FIML resta fuori scope fino a M-05.
  - Reference `mice` confrontata sulla distribuzione pooled (tolleranza 0.06).
  - Regole operative aggiornate: `AGENTS.md` “Economia del contesto” e piano
    §17 impongono un solo scrittore e nessun subagente parallelo in scrittura;
    i subagenti restano solo in lettura quando costano meno della lettura
    diretta. Test mirati durante gli step, gate completo solo a fine ondata.
- Prossimi 3 passi:
  1. Aprire W5: M-01…M-08 (cluster, CCA, MDS, correspondence, SEM/CFA,
     latent class, IRT, conjoint), verificando `lavaan`, `poLCA`, `mirt`,
     `ca` prima di scrivere i kernel.
  2. Applicare il flusso kernel + fixture R + voce/UI + help/i18n, con
     subagenti paralleli su file dedicati e contratti condivisi al main.
  3. Chiudere G5 con `npm run check`, `test:samples` e locale check.
- Domande aperte: nessuna.
- Rischi attivi: `lavaan`/`poLCA`/`mirt`/`ca` potrebbero non essere
  installati; SEM/IRT hanno molti parametri e vanno limitati i TableSpec
  minimi prima di implementare.

### Riassunto di 10 righe — W4 (storico)

1. Ondata e obiettivo: W4 chiusa, G4 verde; 38/73 metodi.
2. Cosa è chiuso: 5 metodi (K-01…K-04, N-01), 1 voce nuova (`loglinear`),
   4 estensioni; 15/36 voci e 24/37 estensioni complessive.
3. Cosa è in corso: nulla; W5 pronta a partire.
4. Cosa è bloccato: nulla.
5. Ultimo commit: W4 su `feat/gap-wave-1`.
6. Test: `npm run check` 1196/1196; sample 7/7; locale 6/6.
7. Decisioni: modalità contingency per MH/trend/esatti; `loglinear` voce
   autonoma; MI categorica senza FIML, pooling sulle proporzioni.
8. Prossimi 3 passi: aprire W5, implementare M-01…M-08, chiudere G5.
9. Domande: nessuna.
10. Rischi: reference R di W5 da verificare prima dei kernel; output SEM/IRT
    da limitare per non esplodere.

### Handoff — 2026-11-03 / chiusura W2 (G2 verde) — storico

- Ondata: W2 chiusa, gate G2 verde; prossima W3 (regressione avanzata).
- Branch/worktree: `feat/gap-wave-1` (in-place, nessun worktree).
- Ultimo commit: `7bfb8f4` (test SE BLUP); codice `863029b`, documenti `3ff1b34`.
- Item chiusi (ID): W1 completa; W2 completa — C-08, C-09, C-10, C-11,
  R-01…R-08.
- Item in corso (ID): nessuno.
- Item bloccati (ID + motivo): nessuno.
- Test eseguiti e risultato: `npm run check` **verde** (1068/1068 test, tsc,
  eslint, depcruise, madge, file size); `npm run test:samples` 7/7; locale
  check 6/6.
- File/moduli toccati: contratti `types/parse/params/roles/registry/runners/
  AnalysisForm/worker/analysisKinds`; kernel `glmm.ts`; tabelle/report
  `glmm.ts` e `lmmRandomSlope.ts`; voce `analyses/glmm/*` e
  `analyses/lmm/randomSlope.ts`; help 6 lingue (`w3-*.ts`); cataloghi
  reportCopy 6 lingue (`w3.ts`); sample manifest; reference `glmm`.
- Decisioni prese / deviazioni dal piano:
  - C-10 realizzato come GLMM completo: Laplace, gaussiana/binomiale/Poisson,
    random intercept e una random slope, un solo fattore di gruppo.
  - `lmm` esteso con `randomSlope` (gaussiana) invece di duplicare la voce.
  - R-06 senza Tweedie (solo Gamma), documentato.
  - ANOM con Bonferroni-t, documentato.
  - `quine` ha solo 2 gruppi `Eth`: il campione resta valido ma la varianza
    casuale è poco informativa; `sleepstudy`/`birthwt` sono i riferimenti forti.
- Prossimi 3 passi:
  1. Aprire W3: R-09 PLS, R-10 GAM/MARS, R-11 IV/2SLS, R-12 panel FE/RE,
     R-13 Tobit/selection, R-14 mediazione, R-15 propensity score.
  2. Per ogni item: kernel + unit test + reference R (pacchetti disponibili:
     `pls`, `mgcv`, `AER`, `plm`, `sampleSelection` assente → fallback,
     `mediation` assente → fallback), poi voce/UI.
  3. Ai gate intermedi aggiornare questo documento e i conteggi.
- Domande aperte: nessuna; i fallback reference di W3 sono decisi in §5d.
- Rischi attivi: il bootstrap della mediazione non è confrontabile punto per
  punto con R (validazione per proprietà); Heckman ML resta fuori scope.

### Riassunto di 10 righe — W2 (storico)

1. Ondata e obiettivo: W2 chiusa, G2 verde; 26/73 metodi.
2. Cosa è chiuso: 26 metodi, 7 voci nuove, 20 estensioni.
3. Cosa è in corso: nulla; W3 pronta a partire.
4. Cosa è bloccato: nulla.
5. Ultimo commit: `863029b` su `feat/gap-wave-1`.
6. Test: `npm run check` 1068/1068; sample 7/7; locale 6/6.
7. Decisioni: GLMM Laplace completo; `lmm` con random slope; Tweedie esclusa.
8. Prossimi 3 passi: aprire W3, kernel+reference dei 7 modelli, gate G3.
9. Domande: nessuna.
10. Rischi: pacchetti R mancanti per selection/mediazione in W3.

```md
## Handoff — YYYY-MM-DD / W?

- Ondata:
- Branch/worktree:
- Ultimo commit:
- Item chiusi (ID):
- Item in corso (ID):
- Item bloccati (ID + motivo):
- Test eseguiti e risultato:
- File/moduli toccati:
- Decisioni prese / deviazioni dal piano:
- Prossimi 3 passi:
  1.
  2.
  3.
- Domande aperte:
- Rischi attivi:
```

---

## 8. Decisioni attive

Rimandare al piano §3. Decisioni già prese:

- D1: estendere una procedura esistente prima di creare una nuova voce.
- D2: ogni voce nuova rispetta il contratto di `ARCHITECTURE.md`.
- D3: kernel puri, test unitari e reference test.
- D4: modalità multiple con un solo form e default invariati.
- D5: procedure heavy nel worker.
- D6: riuso dei `ChartKind` esistenti.
- D7: help e i18n in 6 lingue sono parte della DoD.
- D8: dataset di esempio nei 5 formati.
- D9: rilascio a ondate, niente feature flag.
- D10: nessun bump di `PROJECT_VERSION` per campi opzionali.
- D11: usare 2–3 subagenti in parallelo quando i compiti sono separabili, con
  proprietario unico dei file; i file condivisi restano all’agente principale
  (piano §17, `AGENTS.md`).

---

## 9. Domande aperte

Nessuna. W2 è chiusa; le domande di prodotto si riaprono con W3.

---

## 10. Cosa non fare

- Non compattare a metà di una modifica senza WIP commit.
- Non compattare con test rossi senza dichiararlo.
- Non dichiarare chiuso un item senza il gate di ondata.
- Non aggiornare i conteggi globali (36→72) prima di G1.
- Non duplicare il piano in questo file: rimandare alle sezioni.
