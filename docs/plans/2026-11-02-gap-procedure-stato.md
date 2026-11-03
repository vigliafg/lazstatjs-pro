# Stato esecuzione — piano di chiusura del gap procedurale

**Ultimo aggiornamento**: 2026-11-03 (checkpoint W2: 11/12; C-10 deciso = GLMM completo)
**Piano di riferimento**: [`2026-11-02-gap-procedure-piano.md`](2026-11-02-gap-procedure-piano.md)
**Baseline documentale**: `main` @ `1ef2860` (piano v2.2)
**Stato**: W0 e W1 chiuse; W2 a 11/12 metodi, gate non ancora dichiarato per C-10 (GLMM/pendenze casuali)
**Prossima ondata**: chiusura C-10 con GLMM completo (Laplace), poi W3

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
| Ondata corrente | W2 quase chiusa: 11/12 metodi |
| Branch/worktree | `feat/gap-wave-1` (in-place, senza worktree) |
| Ultimo commit di codice | `7bf4e84` (W2, 11 metodi) |
| Ultimo commit documentale | `39feca4` (handoff pre-compattazione) |
| Test | `npm run check` verde; `npm test` 1052/1052 verdi; `npm run test:samples` 7/7; locale check 6/6 |
| Item chiusi | 25 / 73 |
| Nuove voci | 6 / 36 (`proportions`, `variances`, `glm`, `quantile`, `nonlinear`, `multinomial`) |
| Estensioni | 19 / 37 |
| Reference baseline | 35 / 35 procedure statistiche (W0-09 chiuso) |
| Blocchi | nessuno |
| Prossimo gate | G2 — fine W2, dopo C-10 (GLMM completo con Laplace) |

---

## 3. Dashboard ondate

| Ondata | Scope | Metodi | Nuove voci | Stato | Gate |
|---|---|---:|---:|---|---|
| W0 | Fondazioni condivise + retrofit | — | — | **chiusa** (G0 verde) | G0 |
| W1 | Descriptive + test di base | 14 | 2 | **chiusa** (G1 verde) | G1 |
| W2 | ANOVA/GLMM + Regressione nucleo | 12 | 5 | **in corso** (11/12; C-10 deciso: GLMM completo) | G2 |
| W3 | Regressione avanzata | 7 | 7 | non iniziata | G3 |
| W4 | Categorical + MI categorica | 5 | 1 | non iniziata | G4 |
| W5 | Multivariate avanzata | 8 | 7 | non iniziata | G5 |
| W6 | Survival e affidabilità | 8 | 4 | non iniziata | G6 |
| W7 | Time series | 7 | 3 | non iniziata | G7 |
| W8 | Quality/DOE/power restanti | 5 | 0 | non iniziata | G8 |
| W9 | Survey + ML + Advanced | 7 | 7 | non iniziata | G9 |

---

## 4. Dashboard famiglie

| Famiglia | Chiusi | Totale | Stato |
|---|---:|---:|---|
| Descriptive | 5 | 8 | in corso (D-01…D-04, Q-04) |
| Compare groups | 7 | 11 | in corso (C-01…C-07) |
| Regression | 0 | 15 | non iniziata |
| Multivariate | 0 | 8 | non iniziata |
| Categorical | 0 | 4 | non iniziata |
| Survival | 0 | 8 | non iniziata |
| Time series | 0 | 7 | non iniziata |
| Design & power | 2 | 4 | in corso (P-01, P-02) |
| Missing data | 0 | 2 | non iniziata |
| Machine Learning | 0 | 3 | non iniziata |
| Advanced & Bayesian | 0 | 3 | non iniziata |
| **Totale** | **14** | **73** |  |

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

## 5c. Ondata W2 — stato al checkpoint (11/12)

Obiettivo: ANOVA/GLMM + nucleo regressione, **12 metodi, 5 nuove voci**.

### Chiusi in W2 (11)

| ID | Metodo | Tipo | Note |
|---|---|---|---|
| C-08 | ANOVA nested | mode `anova` | `kernels/nestedAnova.ts`, reference `aov` |
| C-09 | MANCOVA | mode `discriminant` | `kernels/mancova.ts`, reference `car::Anova` |
| C-11 | ANOM | mode `anova` | `kernels/anom.ts`, limite Bonferroni-t documentato |
| R-01 | Stepwise / best subsets | mode `regression` | `kernels/selection.ts`, reference `leaps`/`step` |
| R-02 | Polinomiale | mode `regression` | `kernels/polynomial.ts`, reference `lm(poly raw)` |
| R-03 | Non lineare | voce `nonlinear` | `kernels/nonlinear.ts`, reference `nls` |
| R-04 | Multinomiale | voce `multinomial` | `kernels/multinomial.ts`, reference `nnet::multinom` |
| R-05 | Probit | mode `logistic` | link `probit` in `kernels/logistic.ts`, reference `glm(probit)` |
| R-06 | GLM | voce `glm` | famiglie gaussiana/binomiale/Poisson/Gamma; Tweedie non inclusa |
| R-07 | Quantile | voce `quantile` | `kernels/quantile.ts` (Barrodale–Roberts), reference `quantreg` |
| R-08 | Ridge/LASSO/elastic net | mode `regression` | `kernels/penalized.ts`, reference `glmnet` |

### Aperto (1) — C-10, decisione presa: GLMM completo

**Decisione (2026-11-03)**: implementare il GLMM completo con approssimazione
di Laplace, non solo le pendenze casuali gaussiane. Famiglie gaussiana,
binomiale e Poisson; effetti casuali a intercetta e a pendenza (un predittore);
un solo fattore di raggruppamento.

**Kernel** `src/stats/kernels/glmm.ts` (nuovo):
- Modello: `η_i = X_iβ + Z_i b_{g(i)}`, `b_g ~ N(0, D)`, con `D` 1×1
  (random intercept) o 2×2 (intercept + slope, con covarianza).
- Famiglie/link: gaussian/identity, binomial/logit, poisson/log.
- Log-verosimiglianza approssimata di Laplace: per ogni gruppo, modo `b_g`
  con Newton 1D/2D e correzione `0.5 log|H_g|`; `β` e i parametri di `D`
  ottimizzati con BFGS (gradiente numerico) e inizializzazione da GLM/LMM.
- SE da Hessiana numerica della log-verosimiglianza approssimata; IC e test
  z/t dichiarati; output: coefficienti fissi, varianze/correlazione random,
  BLUP per gruppo, fitted, logLik, AIC, ICC, iterazioni, convergenza.
- Guardie: gruppi sufficienti, `D` non singolare, varianza al bordo (→0),
  separazione binomiale, convergenza fallita.

**Reference R**:
- `lme4::lmer` per gaussiano con pendenza casuale (`chickweight_long`:
  `Weight ~ Time + (Time | Chick)`).
- `lme4::glmer` per binomiale (`birthwt`/`cbpp`) e Poisson (`quine`).
- Script in `src/stats/reference/r/glmm.R`, fixture `fixtures/glmm.json`;
  tolleranze dichiarate (Laplace vs lme4): coefficienti 1e-4–1e-3, varianze
  5e-2, con motivazione nel test.

**Integrazione**:
- `GlmmParams` in `types.ts` + default + `parse.ts` + `params.ts` + `roles.ts`.
- Registry/runners/AnalysisForm/worker heavy/`analysisKinds`.
- Form: esito, predittori, gruppo, famiglia, link, pendenza casuale.
- Runner + tabelle + report + grafici (osservati/stimati, caterpillar dei
  random effects, residui).
- Help 6 lingue (`w2-*.ts` o nuovo `w3-*.ts`), cataloghi reportCopy 6 lingue,
  sample manifest (`chickweight_long`, `quine`, `birthwt`).

**Conteggi attesi dopo C-10**: 26/73 metodi, 7/36 nuove voci (`glmm`),
20/37 estensioni (parte `mode` di C-10).

**Rischi**: stabilità numerica del Laplace; separazione; varianza al bordo;
differenze con l’ottimizzatore di lme4; runtime (procedura heavy nel worker).

### Reference aggiunte in W2

`probit`, `polynomial`, `selection`, `penalized`, `quantile`, `nonlinear`,
`multinomial`, `nestedAnova`, `anom`, `mancova` (script R + fixture committate;
nessun R richiesto a test-time).

### Parallelizzazione usata

Batch 1: tre `general` su kernel `nonlinear`, `multinomial`, `quantile`.
Batch 2: tre `general` sulle voci complete `quantile`, `nonlinear`,
`multinomial` (form, runner, tabelle, report, test).
Batch 3: due `general` sui cataloghi reportCopy (en/de e es/fr/pt-PT) e uno
sulle pagine help 6 lingue. Agente principale: contratti condivisi, GLM,
MANCOVA, modalità ANOVA/regressione/logistica, integrazione e gate.

### Debito residuo noto

- C-10 GLMM/pendenze casuali.
- R-06: Tweedie non implementata (solo Gamma); documentato nel report.
- ANOM: linee di decisione con approssimazione Bonferroni-t, non SMM esatta.
- La fixture MANCOVA usa i valori stampati da `car` (7 cifre): tolleranza 1e-6.

---

## 6. Registro checkpoint

| Data | Checkpoint | Commit | Test | Esito | Note |
|---|---|---|---|---|---|
| 2026-11-02 | Piano approvato | `746b558` | docs only | verde | Creato piano v2.0 e protocollo |
| 2026-11-02 | Piano v2.2 + W0-09 | `in corso` | docs only | verde | Aggiunto retrofit reference test per 8 procedure |
| 2026-11-02 | Checkpoint W0 parziale | `9c6116a` | `npm test` 850/850 | verde | W0-01/02/03 chiusi; W0-09 3/8; fix Ward.D2 |
| 2026-11-02 | Chiusura W0 / G0 | `ab0c26a` | `npm run check` + `test:samples` + locale 6/6 | verde | W0-01…09 chiusi; 880/880; fix MI e DOE; cap Theil–Sen/Lilliefors |
| 2026-11-03 | Chiusura W1 / G1 | `e10684a` | `npm run check` + `test:samples` + locale 6/6 | verde | 14 metodi (D-01…D-04, Q-04, C-01…C-07, P-01/P-02); 957/957; 2 nuove voci |
| 2026-11-03 | Handoff pre-compattazione | `bccd8bd` | `npm run check` verde (ultima esecuzione) | verde | W1 chiusa; W2 pianificata con batch di 3 subagenti; nessun file W2 scritto |\n| 2026-11-03 | Checkpoint W2 (11/12) | `7bf4e84` | `npm run check` 1052/1052 + `test:samples` 7/7 + locale 6/6 | verde | C-08/C-09/C-11, R-01…R-08 tranne C-10; 4 nuove voci; 10 reference; G2 non dichiarato |

> A ogni checkpoint aggiungere una riga. Non cancellare le righe precedenti.

---

## 7. Handoff per la prossima compattazione

Compilare **prima** di compattare. Se un campo non si applica, scrivere “n/d”.

### Handoff — 2026-11-03 / pre-compattazione, C-10 deciso

- Ondata: W2 a 11/12; C-10 (GLMM completo) è il prossimo lavoro.
- Branch/worktree: `feat/gap-wave-1` (in-place, nessun worktree).
- Ultimo commit: `e6588d9` (documenti); codice `7bf4e84`.
- Item chiusi (ID): W1 completa; W2: C-08, C-09, C-11, R-01…R-08 tranne C-10.
- Item in corso (ID): C-10 — GLMM completo con Laplace (decisione presa).
- Item bloccati (ID + motivo): nessuno.
- Test eseguiti e risultato: `npm run check` **verde** (1052/1052),
  `test:samples` 7/7, locale 6/6, depcruise/madge/filesize verdi.
- File/moduli toccati: vedi §5c; nessuna modifica di codice dopo `7bf4e84`.
- Decisioni prese / deviazioni dal piano:
  - C-10 = GLMM completo: famiglie gaussiana/binomiale/Poisson, random
    intercept e random slope, Laplace + BFGS, reference `lme4`.
  - R-06 senza Tweedie (solo Gamma), documentato.
  - ANOM con Bonferroni-t, documentato.
- Prossimi 3 passi:
  1. `kernels/glmm.ts` + unit test + `reference/r/glmm.R` + fixture
     (`lmer`/`glmer` su chickweight_long, birthwt/cbpp, quine).
  2. Contratti condivisi e voce `glmm` (form, runner, tabelle, report,
     grafici), worker heavy, `analysisKinds`.
  3. Help 6 lingue, cataloghi reportCopy, sample manifest, `npm run check`,
     dichiarazione G2 e conteggi 26/73, 7/36, 20/37.
- Domande aperte: nessuna; C-10 è deciso.
- Rischi attivi: stabilità del Laplace, separazione, varianza al bordo,
  differenze con l’ottimizzatore lme4, runtime heavy.

### Riassunto di 10 righe

1. Ondata e obiettivo: W2 11/12; C-10 = GLMM completo (deciso).
2. Cosa è chiuso: 25 metodi, 6 voci nuove, 19 estensioni; gate verde.
3. Cosa è in corso: C-10 non ancora iniziato.
4. Cosa è bloccato: nulla.
5. Ultimo commit: `e6588d9` su `feat/gap-wave-1`.
6. Test: `npm run check` 1052/1052; sample 7/7; locale 6/6.
7. Decisioni: GLMM con Laplace, random intercept + slope, lme4 reference.
8. Prossimi 3 passi: kernel glmm + reference, voce/UI, help/sample/G2.
9. Domande: nessuna.
10. Rischi: numerica del Laplace e tolleranze vs lme4.

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

Nessuna: C-10 è stato deciso come **GLMM completo con Laplace** (2026-11-03).

---

## 10. Cosa non fare

- Non compattare a metà di una modifica senza WIP commit.
- Non compattare con test rossi senza dichiararlo.
- Non dichiarare chiuso un item senza il gate di ondata.
- Non aggiornare i conteggi globali (36→72) prima di G1.
- Non duplicare il piano in questo file: rimandare alle sezioni.
