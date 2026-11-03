# Piano di implementazione — chiusura del gap procedurale

**Versione**: 2.0 — piano esecutivo dettagliato
**Data**: 2026-11-02
**Repository**: `/home/vigliafg/Documenti/GitHub/lazstatjs-pro`
**Baseline**: `main` @ `1042c61` (36 voci di registro, 10 famiglie, `npm run check` verde)
**Documento precedente**: v1.0, piano strategico del 2026-11-02 (superato da questa versione)
**Stato**: pronto per l’esecuzione; protocollo di checkpoint e handoff definito

---

## 0. Registro delle revisioni

| Versione | Data | Contenuto |
|---|---|---|
| 1.0 | 2026-11-02 | Perimetro, 73 metodi, 11 famiglie, ondate, stime |
| 2.0 | 2026-11-02 | WBS, dipendenze, Definition of Ready/Done, work package per famiglia, matrice di tracciabilità, piano test, release plan, primi 4 sprint |
| 2.1 | 2026-11-02 | Protocollo di checkpoint, handoff e compattazione; documento di stato `gap-procedure-stato.md` |
| 2.2 | 2026-11-02 | W0-09: retrofit dei reference test sulle 8 procedure esistenti senza confronto indipendente |

---

## 1. Executive summary

Il piano porta LazStats da **36 a circa 72 voci di registro**, coprendo **73
metodi** oggi assenti rispetto a Minitab, SPSS, Stata e JMP:

- **36 nuove voci** di primo livello;
- **37 metodi** come modalità di procedure esistenti;
- **0** nuove famiglie obbligatorie, **2** famiglie nuove consigliate
  (`Machine Learning`, `Advanced & Bayesian`);
- **10 ondate** di rilascio, ciascuna verificabile con `npm run check`;
- **~599 giornate/uomo** a lordo (511 item + 44 W0 + 44 fondazioni JIT),
  ~629 con overhead, riducibili a ~550 con il riuso dei moduli condivisi;
- **~9-11 mesi** con 3 sviluppatori, **~14-16 mesi** con 2, **~26-30 mesi** con 1.

La prima ondata (14 metodi, di cui 2 nuove voci) è realizzabile in **6-8
settimane** con 2 sviluppatori e non richiede alcun modulo numerico avanzato.

### 1.1 Metriche di successo

| Metrica | Target |
|---|---|
| Copertura metodi | 73/73 tracciati e chiusi |
| Voci di registro | ~72, tutte con form + runner + help |
| Reference test | 100% dei kernel nuovi |
| `npm run check` | verde a ogni ondata |
| Traduzioni | help e UI 6/6 lingue |
| Dataset | ogni procedura data-driven coperta nei 5 formati |
| Prestazioni | nessun blocco UI >100 ms; heavy nel worker |
| Retrocompatibilità | nessun bump di `PROJECT_VERSION` |

---

## 2. Obiettivi, perimetro e non-obiettivi

### 2.1 Obiettivo

Implementare tutti i metodi statistici presenti in almeno uno dei quattro
programmi di riferimento e assenti da LazStats, con la stessa qualità
architetturale delle procedure esistenti.

### 2.2 Perimetro

Il conteggio usa la granularità **metodo di menu**: un metodo che l’utente
sceglie per rispondere a una domanda statistica, con input e output
riconoscibili. Non contano:

- opzioni (correzione di continuità, tipo di contrasto, stimatore di varianza);
- varianti di stimatore (HC0/HC1/HC3, ML/REML, tipi di rotazione);
- trasformazioni e gestione dati;
- grafici, tabelle descrittive pure, reportistica;
- moduli verticali non statistici (genomica, finanza, marketing diretto).

### 2.3 Non-obiettivi

- Parità pixel-per-pixel con i quattro programmi.
- Tutti i comandi Stata (>250): il piano copre i metodi, non le combinazioni.
- Moduli commerciali separati non inclusi nelle edizioni base (AMOS, JMP Pro,
  Minitab Predictive Analytics): sono P2 e possono slittare.
- Riscrittura di data management, import/export, grafica o report.
- Cambio dello schema `.lzs` o della versione del progetto.

### 2.4 Ripartizione per famiglia

| Famiglia | Mancanti | Nuove voci | Estensioni | Priorità |
|---|---:|---:|---:|---|
| Descriptive | 8 | 0 | 8 | P0 |
| Compare groups | 11 | 3 | 8 | P0 |
| Regression | 15 | 11 | 4 | P0/P1 |
| Multivariate | 8 | 7 | 1 | P1 |
| Categorical | 4 | 1 | 3 | P1 |
| Survival | 8 | 4 | 4 | P1 |
| Time series | 7 | 3 | 4 | P1/P2 |
| Design & power | 4 | 0 | 4 | P0/P1 |
| Missing data | 2 | 1 | 1 | P2 |
| Machine learning (nuova) | 3 | 3 | 0 | P2 |
| Advanced & Bayesian (nuova) | 3 | 3 | 0 | P2 |
| **Totale** | **73** | **36** | **37** |  |

---

## 3. Baseline e assunzioni

### 3.1 Baseline tecnica

- Registro: `src/analyses/registry.ts`, 36 voci, 10 famiglie.
- Runner: `src/analyses/runners.ts`, 36 builder.
- Procedure heavy: 9, worker dedicato.
- Contratto output: `AnalysisRunResult` in `src/analyses/types.ts`.
- Grafici: `AnalysisChart` in `src/stats/charts.ts`, motore Vega-Lite.
- Persistenza: `.lzs` v2, campi nuovi opzionali.
- Test: `src/**/*.test.ts` con `node --import tsx --test`.
- Guardrail: `npm run check` = lint + test + dependency-cruiser + madge +
  file-size.

### 3.2 Assunzioni

1. Un solo dataset per progetto, una sola griglia (`GridData`), come oggi.
2. I metodi che richiedono forme dati diverse (panel, survival start-stop,
   conjoint wide, testo, coordinate spaziali) usano **adattatori di forma** in
   lettura, senza cambiare lo storage della griglia.
3. Le stime assumono 5 giorni/settimana per sviluppatore e includono test,
   help e documentazione, ma **non** la traduzione professionale.
4. Le reference implementation sono R/Stata/SciPy, con tolleranze dichiarate.
5. Ogni ondata è rilasciabile e non blocca le successive se le dipendenze sono
   rispettate.

### 3.3 Vincoli

- Nessun file sorgente oltre 700 righe, salvo eccezione motivata in
  `scripts/check-file-size.mjs`.
- Nessuna dipendenza runtime nuova senza valutazione (preferire kernel puri).
- Nessun `forwardRef` o accesso diretto alla console dai pannelli.
- Nessun calcolo nei table builder: tutto nei kernel.

---

## 4. Convenzioni e punti di contatto

### 4.1 Struttura di una procedura

```
src/stats/kernels/<id>.ts        calcolo puro, testabile senza React
src/stats/tables/<id>.ts         TableSpec, nessun ricalcolo
src/stats/reports/<id>.ts        ReportSpec, prosa via copy()
src/analyses/<id>/Form.tsx       controllato, nessuno stato proprio
src/analyses/<id>/defaults.ts    scelta colonne grid-aware (se serve)
src/analyses/<id>/run.tsx        buildOutput(ctx) -> AnalysisRunResult
```

Per le **modalità** di procedure esistenti, il kernel e il runner restano nella
cartella della procedura madre; il form aggiunge un selettore di modalità.

### 4.2 Punti di contatto obbligatori

| Area | File | Cosa aggiornare |
|---|---|---|
| Registry | `src/analyses/registry.ts` | id, label, family, description, keywords, cost |
| Runner | `src/analyses/runners.ts` | `ANALYSIS_RUNNERS[id]` |
| Parametri | `src/io/project/types.ts` | tipo + `DEFAULT_PARAMS` |
| Parser | `src/io/project/parse.ts` | parsing difensivo, clamp, enum |
| Snapshot | `src/analyses/paramsSnapshot.ts` | `PARAMS_KEY[id]` |
| Remap colonne | `src/analyses/params.ts` | `setPrimaryColumn` + remap |
| Ruoli | `src/analyses/roles.ts` / `rolesL4.ts` | ruoli colonna |
| Worker | `src/analyses/worker/heavyIds.ts` + `heavyRunners.ts` | solo se heavy |
| Form | `src/ui/analysis/AnalysisOptions.tsx` | render del form |
| i18n meta | `src/i18n/catalog/*/meta.ts` | label + description |
| i18n UI | `src/i18n/catalog/*/analysis.ts` | stringhe form |
| Report copy | `src/stats/reportCopy/catalog/*/` | prosa report |
| Help | `src/help/content/<locale>/procedures-*.ts` | pagina a due livelli |
| Help order | `src/help/content/order.ts` | posizione del topic |
| Help charts | `src/help/content/<locale>/charts.ts` | elenco grafici |
| Samples | `samples/manifest.json` + `samples/generate.R` | dataset e 5 formati |
| Docs | `README.md`, `ARCHITECTURE.md`, `docs/PROJECT-STATUS.md`, `docs/UI-STATE.md` | conteggi e checklist |

### 4.3 Convenzioni di naming

- id: minuscolo, senza trattini (`multinomial`, `latentclass`, `statespace`).
- modalità: stringa enum nel params (`mode: 'binomial' | 'poisson'`).
- file kernel: un file per famiglia numerica, split se >700 righe.
- test: `<modulo>.test.ts` accanto al modulo; reference test in
  `src/stats/testing/reference/`.
- help: una pagina per voce di registro; le modalità aggiungono sezioni alla
  pagina madre.

---

## 5. Definition of Ready / Definition of Done

### 5.1 Definition of Ready (prima di iniziare un item)

- [ ] Metodo descritto in una scheda con input, output, assunzioni, casi limite.
- [ ] Reference implementation R/Stata/SciPy scelta e versione annotata.
- [ ] Dataset di esempio (esistente o nuovo) identificato.
- [ ] Decisione “nuova voce vs modalità” presa e motivata.
- [ ] Grafici previsti o motivazione dell’assenza.
- [ ] Dipendenze da altri item/fondazioni identificate.

### 5.2 Definition of Done (per chiudere un item)

- [ ] Kernel puro + test unitari + reference test con tolleranza.
- [ ] Casi di rifiuto: dati insufficienti, singolarità, separazione, NA.
- [ ] TableSpec e ReportSpec completi.
- [ ] Builder `run.tsx` con caso valido e rifiuti.
- [ ] Form controllato + default grid-aware.
- [ ] Parametri tipizzati, default, parsing difensivo, clamp, enum validati.
- [ ] Ruoli colonna e `setPrimaryColumn`.
- [ ] Registry + runner (+ worker se heavy).
- [ ] Almeno un grafico o motivazione esplicita.
- [ ] Help a due livelli in 6 lingue + `charts` + `seeAlso`.
- [ ] Etichette UI e report copy in 6 lingue.
- [ ] Dataset di esempio nei 5 formati (se data-driven).
- [ ] Test di coverage: registry, runner, help, sample, worker.
- [ ] `npm run check` verde.
- [ ] Conteggi e checklist aggiornati nei documenti.

### 5.3 Checklist PR

- [ ] Nessun file >700 righe.
- [ ] Nessun import React nei kernel.
- [ ] Nessun ricalcolo nei table builder.
- [ ] Nessun `any` non motivato.
- [ ] Test aggiunti e nominati in modo descrittivo.
- [ ] Help e i18n aggiornati.
- [ ] Sample manifest aggiornato.
- [ ] Conteggi documentali aggiornati.

---

## 6. Work breakdown structure e dipendenze

### 6.1 Ondata 0 — fondazioni condivise e retrofit (44 giornate)

| ID | Task | Output | Giorni | Gate |
|---|---|---|---:|---|
| W0-01 | `kernels/optimize.ts` | Newton–Raphson, BFGS, IRLS, EM, line search, convergenza | 7 | test su funzioni note + reference R |
| W0-02 | `kernels/glm.ts` | famiglie, link, devianza, residui, AIC/BIC | 7 | confronto `glm()` su 3 famiglie |
| W0-03 | `kernels/matrix` estensioni | SVD, Cholesky, QR, pseudo-inversa, rango | 3 | test vs NumPy |
| W0-04 | Reference harness | script R, fixture, tolleranze, helper di confronto | 3 | un test dimostrativo verde |
| W0-05 | Sample generator | estensione `samples/generate.R`, manifest schema | 3 | `npm run test:samples` verde |
| W0-06 | i18n/help scaffolding | nuove famiglie, glossario, template pagina | 2 | `check-locale` verde |
| W0-07 | Data shape adapters | long/wide, start-stop, matrici, testo | 2 | test unitari |
| W0-08 | Performance guards | limiti righe/colonne, messaggi, worker check | 3 | benchmark baseline |
| W0-09 | Retrofit reference test | reference indipendenti per TOST, Quality, Cluster, Discriminant, Partition, DOE, MI, Resampling | 14 | 8/8 reference verdi, tolleranze dichiarate |

### 6.2 Fondazioni just-in-time

| ID | Quando | Contenuto | Giorni | Serve a |
|---|---|---|---:|---|
| F4 | Prima di W5 | EM/latent helpers, inizializzazioni, BIC/entropia | 8 | M-05, M-06, N-01 |
| F5 | Prima di W6 | verosimiglianze di sopravvivenza, censoring, frailty — **fatto** | 8 | S-02, S-03, S-04, S-07 |
| F6 | Prima di W7 | Kalman, smoothing, filtri | 8 | T-03, T-06, T-07 |
| F8 | Prima di W9 | MCMC, ensemble, survey variance | 20 | N-02, L-01, A-01, A-03 |

### 6.3 Ondate

| Ondata | Scope | Metodi | Nuove voci | Giorni | Gate |
|---|---|---|---:|---:|---|
| 0 | Fondazioni e retrofit | — | — | 44 | G0: toolkit numerico e 8 reference verdi |
| 1 | Descriptive + test di base (Compare) | 14 | 2 | 36 | G1: 14 metodi, help 6 lingue |
| 2 | ANOVA/GLMM + Regression nucleo | 12 | 5 | 74 | G2: GLM/GLMM reference verdi |
| 3 | Regression avanzata | 7 | 7 | 53 | G3: 7 modelli su dati reali |
| 4 | Categorical + MI categorica | 5 | 1 | 28 | G4: tabelle e imputazione |
| 5 | Multivariate avanzata | 8 | 7 | 76 | G5: SEM/IRT/latent verdi |
| 6 | Survival e affidabilità | 8 | 4 | 57 | G6: competing/frailty/recurrent |
| 7 | Time series | 7 | 3 | 51 | G7: VAR/GARCH/state-space |
| 8 | Quality/DOE/power restanti | 5 | 0 | 25 | G8: DOE builder |
| 9 | Survey + ML + Advanced | 7 | 7 | 111 | G9: copertura 73/73 |
| JIT | F4-F8 (fondazioni just-in-time) | — | — | 44 | gate per ondata |
| **Totale** |  | **73** | **36** | **599** |  |

### 6.4 Percorso critico e parallelizzazione

```
W0 ──► W2 (Regressione nucleo) ──► W3 (Regressione avanzata) ──► W5 (Multivariate)
 │                                      │
 ├──► W1 (Descriptive/Compare)          ├──► W6 (Survival)
 │                                      ├──► W7 (Time series)
 └──► W4 (Categorical/MI)               └──► W8 (Quality/DOE)
                                                │
                                                └──► W9 (Survey/ML/Advanced)
```

- **Critico**: W0 → W2 → W3 → W5 → W9.
- **Parallelizzabili** dopo W2: W1, W4, W6, W7, W8.
- **Team 3**: A = numerica (W0, W2, W3, W5), B = UI/i18n/help (tutte le
  ondate), C = QA/sample/reference (tutte le ondate).
- **Team 2**: A = numerica, B = UI + QA; W1 e W4 prima, poi W2/W3.
- **Team 1**: ordine W0, W1, W2, W3, W4, W5, W6, W7, W8, W9.

---

## 7. Work package per famiglia

Legenda:
- **Tipo**: `new` = nuova voce di registro; `mode` = modalità di una voce
  esistente.
- **gg**: giornate stimate (2 = S, 4 = M, 9 = L, 17 = XL).
- **Dip.**: dipendenze (item o fondazione).
- **Sample**: dataset esistente o nuovo (`*` = da creare).

### 7.1 Descriptive (8 metodi, 0 nuove voci)

Obiettivo: completare l’esplorazione univariata e le modalità di `quality`.
Entry: W0 chiuso. Exit: 8 metodi con help e sample.

| ID | Metodo | Tipo | Kernel / moduli | Form / params | Test reference | Sample | gg | Dip. |
|---|---|---|---|---|---:|---|---:|---|
| D-01 | Frequenze/tally | mode | `kernels/frequency.ts` | `descriptive/Form.tsx`, `descMode` | `table`, `prop.test` | `iris` | 2 | — |
| D-02 | Outlier Grubbs/Dixon | mode | `kernels/outliers.ts` | `descriptive/Form.tsx` | `DescTools::GrubbsTest`, `outliers::dixon.test` | `mtcars` | 2 | — |
| D-03 | Runs test | mode | `kernels/runs.ts` | `descriptive/Form.tsx` | `randtests::runs.test` | `airquality` | 2 | — |
| D-04 | Intervalli di tolleranza | mode | `kernels/tolerance.ts` | `quality/Form.tsx`, `tolerance` | `tolerance::tolInt` | `mtcars` | 2 | — |
| Q-01 | Gage R&R/MSA | mode | `kernels/msa.ts` | `quality/Form.tsx`, `msa` | `SixSigma::ss.rr`, `MSA` | `msa_demo*` | 4 | — |
| Q-02 | Acceptance sampling/OC | mode | `kernels/acceptance.ts` | `quality/Form.tsx`, `acceptance` | `acceptanceSampling` | `acceptance_demo*` | 4 | — |
| Q-03 | Carte multivariate | mode | `kernels/mcontrol.ts` | `quality/Form.tsx`, `mcontrol` | `qcc::mqcc`, `MSQC` | `msa_demo*` | 4 | — |
| Q-04 | CUSUM | mode | `kernels/quality.ts` | `quality/Form.tsx`, chart type | `qcc::cusum` | `plantgrowth` | 2 | — |

**Note**

- D-01 accetta `cat`, `bol`, stringhe e interi a pochi livelli: il form mostra
  “Variabili numeriche / Frequenze”.
- D-02/D-03 sono righe di output, non procedure separate.
- D-04 condivide `toleranceInterval` con `quality`.
- Q-01/Q-02/Q-03 usano un dataset a misure/repliche; Q-04 è un tipo di carta.

**Rischi**: MSA e acceptance hanno form diversi dal resto di `quality`; valutare
un selettore a schede per non appesantire il pannello.

---

### 7.2 Compare groups (11 metodi, 3 nuove voci)

Obiettivo: coprire i test di base e completare ANOVA.

| ID | Metodo | Tipo | Kernel / moduli | Form / params | Test reference | Sample | gg | Dip. |
|---|---|---|---|---|---:|---|---:|---|
| C-01 | Proporzioni 1/2 campioni | new `proportions` | `kernels/proportions.ts` | `proportions/Form.tsx` | `prop.test`, `binom.test` | `two_groups_binary*` | 4 | W0-02 |
| C-02 | Tassi Poisson 1/2 campioni | mode | `kernels/poissonTests.ts` | `proportions/Form.tsx`, `poisson` | `poisson.test` | `quine` | 4 | C-01 |
| C-03 | Varianze 1/2 | new `variances` | `kernels/variances.ts` | `variances/Form.tsx` | `var.test`, `lawstat::leveneTest`, `bartlett.test` | `plantgrowth` | 4 | — |
| C-04 | Sign test | mode | `kernels/ttest.ts` | `ttest/Form.tsx` | `coin::sign_test`, `BSDA::SIGN.test` | `sleep_wide` | 2 | — |
| C-05 | KS a due campioni | mode | `kernels/distfit.ts` | `distfit/Form.tsx` | `ks.test` | `iris` | 2 | — |
| C-06 | Mood median | mode | `kernels/anova.ts` | `anova/Form.tsx` | `coin::median_test` | `plantgrowth` | 2 | — |
| C-07 | GOF categorico | mode | `kernels/chisquare.ts` | `chisquare/Form.tsx`, `goodness` | `chisq.test` | `categorical_gof*` | 4 | — |
| C-08 | ANOVA nested | mode | `kernels/anova.ts` | `anova/Form.tsx`, `nested` | `aov`, `lme4` | `nested_demo*` | 4 | — |
| C-09 | MANCOVA | mode | `kernels/discriminant.ts` | `discriminant/Form.tsx`, `mancova` | `car::Anova` | `iris` | 4 | — |
| C-10 | Pendenze casuali / GLMM | mode + new `glmm` | `kernels/lmm.ts`, `kernels/glmm.ts` | `lmm/Form.tsx`, `glmm/Form.tsx` | `lme4::lmer/glmer`, `glmmTMB` | `chickweight_long` | 9 | W0-01/02 |
| C-11 | ANOM | mode | `kernels/anom.ts` | `anova/Form.tsx`, `anom` | `ANOM`, `mra` | `plantgrowth` | 2 | — |

**Note**

- `proportions` e `variances` sono le uniche voci nuove “piccole”: restano
  leggere e usano le distribuzioni esistenti.
- `glmm` è la prima voce che richiede il motore di massima verosimiglianza
  generico: dipende da W0-01/W0-02.
- `MANCOVA` riusa la scomposizione di `discriminant`.

**Rischi**: la separazione nella logistica/GLMM richiede messaggi espliciti e
casi di test dedicati.

---

### 7.3 Regression (15 metodi, 11 nuove voci)

Obiettivo: passare da OLS/logistica/count a una cassetta di modelli completa.

| ID | Metodo | Tipo | Kernel / moduli | Form / params | Test reference | Sample | gg | Dip. |
|---|---|---|---|---|---:|---|---:|---|
| R-01 | Stepwise/best subsets | mode | `kernels/regression.ts` | `regression/Form.tsx`, `selection` | `step`, `leaps` | `mtcars` | 4 | — |
| R-02 | Polinomiale/curve | mode | `kernels/regression.ts` | `regression/Form.tsx`, `polynomial` | `lm(y ~ poly(x))` | `mtcars` | 4 | — |
| R-03 | Non lineare | new `nonlinear` | `kernels/nonlinear.ts` | `nonlinear/Form.tsx` | `nls` | `faithful` | 9 | W0-01 |
| R-04 | Multinomiale | new `multinomial` | `kernels/multinomial.ts` | `multinomial/Form.tsx` | `nnet::multinom` | `iris` | 9 | W0-02 |
| R-05 | Probit | mode | `kernels/logistic.ts` | `logistic/Form.tsx`, link | `glm(binomial(probit))` | `birthwt` | 2 | — |
| R-06 | GLM gamma/Tweedie | new `glm` | `kernels/glm.ts` | `glm/Form.tsx` | `glm` gamma/tweedie | `mtcars` | 9 | W0-02 |
| R-07 | Quantile | new `quantile` | `kernels/quantile.ts` | `quantile/Form.tsx` | `quantreg::rq` | `mtcars` | 9 | W0-01 |
| R-08 | Ridge/LASSO/elastic net | mode | `kernels/penalized.ts` | `regression/Form.tsx`, `penalized` | `glmnet` | `mtcars` | 9 | W0-03 |
| R-09 | PLS | new `pls` | `kernels/pls.ts` | `pls/Form.tsx` | `pls::plsr` | `mtcars` | 9 | W0-03 |
| R-10 | GAM/MARS | new `mars` | `kernels/mars.ts` | `mars/Form.tsx` | `earth` | `mtcars` | 9 | W0-03 |
| R-11 | IV/2SLS | new `iv` | `kernels/iv.ts` | `iv/Form.tsx` | `AER::ivreg` | `iv_demo*` | 9 | W0-03 |
| R-12 | Panel FE/RE | new `panel` | `kernels/panel.ts` | `panel/Form.tsx` | `plm` | `panel_demo*` | 9 | R-11 |
| R-13 | Tobit/selection | new `selection` | `kernels/tobit.ts` | `selection/Form.tsx` | `AER::tobit` + base R two-step | `selection_demo*` | 9 | W0-01 |
| R-14 | Mediazione | new `mediation` | `kernels/mediation.ts` | `mediation/Form.tsx` | `lavaan` + bootstrap per proprietà | `mtcars` | 4 | — |
| R-15 | Propensity score | new `propensity` | `kernels/propensity.ts` | `propensity/Form.tsx` | `MatchIt` + base R IPW | `treatment_demo*` | 4 | R-05 |

**Note**

- R-06 `glm` è il motore condiviso da multinomiale, ordinale, probit, count;
  progettarlo come famiglia + link e poi specializzare.
- R-07/R-08/R-10 richiedono `optimize`/`penalized` di W0.
- R-12/R-13 sono i più econometrici: dopo R-11 e con dataset longitudinali.
- R-14/R-15 sono “medi” e possono essere anticipati se serve valore clinico.

**Rischi**: panel e selection richiedono bilanciamento/struttura dati; prevedere
adattatori e messaggi espliciti.

**Deviazioni decise in W3** (dettaglio in
`2026-11-02-gap-procedure-stato.md` §5d):

- R-13 usa `kernels/tobit.ts` perché `kernels/selection.ts` è già la selezione
  stepwise di R-01. La voce resta `selection`.
- `sampleSelection` e `mediation` non sono installati: il riferimento di
  Heckman è base R two-step, quello della mediazione è `lavaan` per le stime
  puntuali e il bootstrap è validato per proprietà.
- L'ML di Heckman resta fuori da W3 ed è dichiarato come limite.

**Stato W3 (2026-11-03)**: R-09…R-15 chiusi, gate G3 verde. Kernel, reference
R, voci/UI, help e `reportCopy` in 6 lingue completati; `npm run check`
1161/1161, `test:samples` 7/7, locale check 6/6. Dettaglio in
`2026-11-02-gap-procedure-stato.md` §5e e registro §6.

---

### 7.4 Multivariate (8 metodi, 7 nuove voci)

| ID | Metodo | Tipo | Kernel / moduli | Form / params | Test reference | Sample | gg | Dip. |
|---|---|---|---|---|---:|---|---:|---|
| M-01 | K-means/k-medians | mode | `kernels/cluster.ts` | `cluster/Form.tsx`, `method` | `kmeans` | `iris` | 4 | — |
| M-02 | Correlazione canonica | new `canonical` | `kernels/canonical.ts` | `canonical/Form.tsx` | `cancor` | `iris` | 4 | W0-03 |
| M-03 | MDS | new `mds` | `kernels/mds.ts` | `mds/Form.tsx` | `cmdscale`, `MASS::isoMDS` | `usarrests` | 4 | — |
| M-04 | Correspondence | new `correspondence` | `kernels/correspondence.ts` | `correspondence/Form.tsx` | `ca::ca` | `usarrests` | 4 | — |
| M-05 | SEM/CFA | new `sem` | `kernels/sem.ts` | `sem/Form.tsx` | `lavaan` | `sem_demo*` | 17 | F4, W0-03 |
| M-06 | Latent class | new `latentclass` | `kernels/latentclass.ts` | `latentclass/Form.tsx` | `poLCA`, `tidyLPA` | `latent_demo*` | 17 | F4 |
| M-07 | IRT | new `irt` | `kernels/irt.ts` | `irt/Form.tsx` | `mirt` | `irt_demo*` | 17 | W0-01 |
| M-08 | Conjoint | new `conjoint` | `kernels/conjoint.ts` | `conjoint/Form.tsx` | `conjoint` | `conjoint_demo*` | 9 | — |

**Note**

- M-01 riusa le distanze di `cluster`.
- M-05/M-06/M-07 condividono EM/ottimizzazione: F4 è obbligatoria.
- M-08 richiede formato “wide” a profili: adattatore dedicato.
- M-05 abilita FIML per N-01.

**Rischi**: SEM e IRT hanno molti parametri di output; definire prima i TableSpec
minimi per non esplodere.

**Stato W5 (2026-11-03)**: M-01…M-08 chiusi, gate G5 verde. Cluster esteso a
k-means/k-medians; nuove voci `canonical`, `mds`, `correspondence`, `sem`,
`latentclass`, `irt`, `conjoint`; F4 in `kernels/latent.ts` (entropia, BIC,
quadratura, gradiente numerico). Reference R: `kmeans`, `cancor`, `cmdscale`/
`isoMDS`, `ca`, `lavaan`, `poLCA`, `mirt`, `conjoint`/`lm`. `npm run check`
1206/1206, `test:samples` 7/7, locale check 6/6. Dettaglio in
`2026-11-02-gap-procedure-stato.md` §5g e registro §6.

---

### 7.5 Categorical (4 metodi, 1 nuova voce)

| ID | Metodo | Tipo | Kernel / moduli | Form / params | Test reference | Sample | gg | Dip. |
|---|---|---|---|---|---:|---|---:|---|
| K-01 | Mantel-Haenszel | mode | `kernels/contingency.ts` | `contingency/Form.tsx`, `stratified` | `mantelhaen.test` | `stratified_2x2*` | 4 | — |
| K-02 | Cochran-Armitage | mode | `kernels/contingency.ts` | `contingency/Form.tsx`, `trend` | `coin::trend_test` | `ordinal_table*` | 2 | — |
| K-03 | Log-linear | new `loglinear` | `kernels/loglinear.ts` | `loglinear/Form.tsx` | `loglin`, `glm` | `categorical_table*` | 9 | W0-02 |
| K-04 | Esatti R×C | mode | `kernels/contingency.ts` | `contingency/Form.tsx`, `exact` | `fisher.test(simulate.p.value=)` | `matched_binary` | 4 | — |

**Note**

- K-01/K-02/K-04 sono estensioni di `contingency`.
- K-03 riusa `glm` Poisson; non scrivere un motore separato.
- K-04 deve avere un limite di tempo e un messaggio oltre soglia.

---

### 7.6 Survival e affidabilità (8 metodi, 4 nuove voci)

| ID | Metodo | Tipo | Kernel / moduli | Form / params | Test reference | Sample | gg | Dip. |
|---|---|---|---|---|---:|---|---:|---|
| S-01 | Life tables | mode | `kernels/survival.ts` | `survival/Form.tsx`, `life` | `survival::survfit`, `ltable` | `lung` | 4 | — |
| S-02 | Competing risks | new `competing` | `kernels/competing.ts` | `competing/Form.tsx` | `cmprsk::crr` | `competing_demo*` | 9 | F5 |
| S-03 | Frailty | mode | `kernels/cox.ts` | `cox/Form.tsx`, `frailty` | `coxme`, `frailtypack` | `lung` | 9 | F5 |
| S-04 | Eventi ricorrenti | new `recurrent` | `kernels/recurrent.ts` | `recurrent/Form.tsx` | `survival` AG, WLW | `recurrent_demo*` | 9 | F5 |
| S-05 | Censoring L/R/intervallo | mode | `kernels/survival.ts`, `parametric.ts` | `survival/Form.tsx`, `parametric/Form.tsx` | `Surv(type=interval2)` | `lung` | 4 | — |
| S-06 | Parametriche extra | mode | `kernels/parametric.ts` | `parametric/Form.tsx` | `flexsurv` | `lung` | 4 | — |
| S-07 | ALT | new `alt` | `kernels/alt.ts` | `alt/Form.tsx` | `ALT`, `WeibullR` | `alt_demo*` | 9 | F5 |
| S-08 | Reliability growth/RBD | new `reliability` | `kernels/reliability.ts` | `reliability/Form.tsx` | `ReliabilityTheory`, `WeibullR` | `reliability_demo*` | 9 | F5 |

**Note**

- S-01/S-05/S-06 sono estensioni a basso rischio.
- S-02/S-03/S-04 richiedono F5.
- S-07/S-08 sono P1/P2, più industriali.
- **Stato**: W6 chiusa il 2026-11-03; gate G6 verde (1227/1227 test,
  `test:samples` 7/7, locale check 6/6). F5 realizzata nei kernel di
  sopravvivenza (`survival`, `cox`, `parametric`).

---

### 7.7 Time series (7 metodi, 3 nuove voci)

| ID | Metodo | Tipo | Kernel / moduli | Form / params | Test reference | Sample | gg | Dip. |
|---|---|---|---|---|---:|---|---:|---|
| T-01 | Holt-Winters | mode | `kernels/timeseries.ts` | `timeseries/Form.tsx` | `forecast::hw` | `airpassengers` | 4 | — |
| T-02 | Radice unitaria | mode | `kernels/timeseries.ts` | `timeseries/Form.tsx` | `adf.test`, `kpss.test`, `PP.test` | `airpassengers` | 4 | — |
| T-03 | VAR/VECM | new `var` | `kernels/var.ts` | `var/Form.tsx` | `vars::VAR` | `var_demo*` | 9 | F6 |
| T-04 | Analisi spettrale | mode | `kernels/timeseries.ts` | `timeseries/Form.tsx` | `spectrum`, `spec.ar` | `airpassengers` | 4 | — |
| T-05 | ARIMAX/intervention | mode | `kernels/timeseries.ts` | `timeseries/Form.tsx`, `xreg` | `forecast::Arima(xreg=)` | `airquality` | 4 | — |
| T-06 | GARCH | new `garch` | `kernels/garch.ts` | `garch/Form.tsx` | `rugarch` | `garch_demo*` | 9 | F6 |
| T-07 | State-space/Markov | new `statespace` | `kernels/statespace.ts` | `statespace/Form.tsx` | `KFAS`, `MSwM` | `statespace_demo*` | 17 | F6 |

**Note**

- T-01/T-02/T-04/T-05 condividono il motore ARIMA esistente.
- T-05 è propedeutico a T-03.
- T-06/T-07 richiedono F6.
- **Stato**: W7 chiusa il 2026-11-03; gate G7 verde (1241/1241 test,
  `test:samples` 7/7, locale check 6/6). F6 realizzata nei kernel
  `statespace` (Kalman/RTS) e `garch` (filtro di volatilità), con
  ottimizzatore condiviso in `minimize.ts`.

---

### 7.8 Design & power (4 metodi, 0 nuove voci)

| ID | Metodo | Tipo | Kernel / moduli | Form / params | Test reference | Sample | gg | Dip. |
|---|---|---|---|---|---:|---|---:|---|
| P-01 | Sample size una proporzione | mode | `kernels/samplesize.ts` | `samplesize/Form.tsx` | `pwr::pwr.p.test` | — | 2 | — |
| P-02 | Sample size varianze/Poisson | mode | `kernels/samplesize.ts` | `samplesize/Form.tsx` | `pwr`, `pwrss` | — | 2 | — |
| P-03 | Power regressione/logistica | mode | `kernels/samplesize.ts` | `samplesize/Form.tsx` | `pwr`, `pwrss` | — | 4 | — |
| Q-05 | Generazione disegni DOE | mode | `kernels/doeDesign.ts` | `doe/Form.tsx`, `design` | `FrF2`, `DoE.base`, `rsm` | `doe_demo*` | 9 | — |

**Note**

- P-01/P-02 sono quasi gratuiti.
- Q-05 è un builder di matrici fattoriali, distinto dall’analisi RSM.

**Stato W8 (2026-11-03)**: Q-01 (Gage R&R), Q-02 (acceptance/OC), Q-03
(T² di Hotelling), P-03 (potenza regressione/logistica) e Q-05 (generatore
DOE) chiusi; gate G8 verde. Reference: ANOVA base R, `pbinom`/`phyper`,
covarianza pooled + `qf`, `pwr::pwr.f2.test` + formula Hsieh, `expand.grid`.
Sample: `msa_demo`, `acceptance_demo`, `doe_demo`. Dettaglio in
`2026-11-02-gap-procedure-stato.md` §5j.

---

### 7.9 Missing data (2 metodi, 1 nuova voce)

| ID | Metodo | Tipo | Kernel / moduli | Form / params | Test reference | Sample | gg | Dip. |
|---|---|---|---|---|---:|---|---:|---|
| N-01 | MI categorica (FIML dopo M-05) | mode | `kernels/mi.ts` | `mi/Form.tsx`, `categorical` | `mice`, `lavaan` FIML | `airquality` | 9 | W0-02, M-05 |
| N-02 | Survey/complex samples | new `survey` | `kernels/survey.ts` | `survey/Form.tsx` | `survey` | `survey_demo*` | 17 | F8 |

**Note**

- N-01 parte in W4 con l’imputazione categorica; il FIML si chiude dopo M-05.
- N-02 è trasversale e richiede F8.

**Stato W4 (2026-11-03)**: K-01…K-04 e N-01 chiusi, gate G4 verde. Kernel,
reference R (`mantelhaen.test`, `prop.trend.test`, enumerazione esatta,
`glm` Poisson, `mice`), voci/UI, help `w4-*.ts` e `reportCopy` in 6 lingue
completati; `npm run check` 1196/1196, `test:samples` 7/7, locale check 6/6.
K-03 è una voce autonoma: il modello saturo risolve direttamente
`Xβ = log(y)` perché `glmFit` richiede p < n. Dettaglio in
`2026-11-02-gap-procedure-stato.md` §5f e registro §6.

---

### 7.10 Machine Learning (3 metodi, 3 nuove voci)

| ID | Metodo | Tipo | Kernel / moduli | Form / params | Test reference | Sample | gg | Dip. |
|---|---|---|---|---|---:|---|---:|---|
| L-01 | RF/boosting/reti neurali | new `ml` | `kernels/ml.ts` | `ml/Form.tsx` | `randomForest`, `xgboost`, `nnet` | `iris`, `birthwt` | 17 | F8 |
| L-02 | Text mining | new `text` | `kernels/text.ts` | `text/Form.tsx` | `quanteda`, `topicmodels` | `text_demo*` | 17 | — |
| L-03 | Choice/MaxDiff | new `choice` | `kernels/choice.ts` | `choice/Form.tsx` | `mlogit`, `ChoiceModelR` | `choice_demo*` | 17 | R-04 |

**Note**

- L-01 parte da random forest e gradient boosting; reti neurali in seconda fase.
- L-02 richiede pipeline testuale e formato dedicato.
- L-03 condivide il logit condizionale con R-04.

---

### 7.11 Advanced & Bayesian (3 metodi, 3 nuove voci)

| ID | Metodo | Tipo | Kernel / moduli | Form / params | Test reference | Sample | gg | Dip. |
|---|---|---|---|---|---:|---|---:|---|
| A-01 | Analisi bayesiana | new `bayes` | `kernels/bayes.ts` | `bayes/Form.tsx` | `rstan`, `brms` | `mtcars` | 17 | F8 |
| A-02 | Meta-analisi | new `meta` | `kernels/meta.ts` | `meta/Form.tsx` | `metafor` | `meta_demo*` | 9 | — |
| A-03 | Statistica spaziale | new `spatial` | `kernels/spatial.ts` | `spatial/Form.tsx` | `spdep`, `spatialreg` | `spatial_demo*` | 17 | F8, W0-03 |

---

## 8. Workstream trasversali

### 8.1 Numerica

- Un kernel per famiglia numerica, non per procedura, quando la matematica è
  condivisa (GLM, sopravvivenza, serie temporali).
- Split a 700 righe: `optimize`, `glm`, `survivalLikelihood`, `kalman`,
  `mcmc`, `ensemble`, `survey`.
- Tolleranze:
  - forme chiuse: 1e-9 relativo;
  - iterative: 1e-6;
  - MCMC/ML: 1e-2 o criteri diagnostici (Rhat < 1.05, ESS > 400).
- Ogni kernel espone `Result | null` e non lancia eccezioni sui dati invalidi.

### 8.2 UI e registry

- Nuove voci: form completo, una sezione per gruppo di parametri.
- Modalità: selettore in testa, sezioni condizionali, default invariati.
- Fino a ~15 voci per famiglia; oltre, introdurre sottogruppi nella libreria.
- Le nuove famiglie `ml` e `advanced` richiedono etichette in 6 lingue e
  un’icona/descrizione coerente.

### 8.3 i18n, help e report copy

- Ogni voce nuova: pagina help a due livelli in 6 lingue + `charts` + `seeAlso`.
- Le modalità aggiungono una sezione alla pagina madre, non una nuova pagina.
- `scripts/check-locale.mjs <locale>` è il gate per ogni ondata.
- `docs/glossary/glossary.md` va aggiornato **prima** della traduzione.
- Report copy: italiano + inglese nella stessa ondata; fr/es/de/pt-PT entro la
  chiusura dell’ondata.

### 8.4 Dataset

Nuovi dataset previsti (5 formati ciascuno):

| ID | Famiglia | Uso |
|---|---|---|
| `two_groups_binary` | compare | proporzioni, varianze |
| `categorical_gof` | compare | GOF |
| `nested_demo` | compare | ANOVA nested |
| `msa_demo` | descriptive | Gage R&R, carte multivariate |
| `acceptance_demo` | descriptive | acceptance sampling |
| `stratified_2x2` | categorical | Mantel-Haenszel |
| `ordinal_table` | categorical | Cochran-Armitage |
| `categorical_table` | categorical | log-linear |
| `panel_demo` | regression | panel FE/RE |
| `selection_demo` | regression | Tobit/Heckman |
| `iv_demo` | regression | IV/2SLS |
| `treatment_demo` | regression | propensity |
| `competing_demo` | survival | competing risks |
| `recurrent_demo` | survival | eventi ricorrenti |
| `alt_demo` | survival | ALT |
| `reliability_demo` | survival | reliability |
| `var_demo` | time series | VAR/VECM |
| `garch_demo` | time series | GARCH |
| `statespace_demo` | time series | state-space |
| `doe_demo` | design | DOE design |
| `survey_demo` | missing/design | survey |
| `sem_demo` | multivariate | SEM |
| `latent_demo` | multivariate | latent class |
| `irt_demo` | multivariate | IRT |
| `conjoint_demo` | multivariate | conjoint |
| `text_demo` | ml | text mining |
| `choice_demo` | ml | choice/MaxDiff |
| `meta_demo` | advanced | meta-analysis |
| `spatial_demo` | advanced | spatial |

Regole:

- dataset piccolo (≤500 righe) e deterministico;
- `samples/generate.R` aggiornato;
- `manifest.json` con `procedures` e `examples`;
- `src/io/samples.test.ts` deve restare verde.

### 8.5 Grafici

- Riusare `scatter`, `line`, `bar`, `box`, `histogram`, `interval`, `forest`,
  `survival`, `heatmap`, `scree`, `score`, `power`, `bootstrap`, `tree`.
- Nuovi kind solo per: dendrogramma, biplot/canonical, ICC/IRT, superficie 3D
  (se non basta `line`/`heatmap`).
- Ogni grafico nuovo: test di compilazione Vega-Lite e voce in `charts.ts`.

### 8.6 Performance e worker

- Heavy: GLMM, nonlinear, GLM, quantile, penalized, PLS, MARS, IV, panel,
  selection, SEM, latent class, IRT, competing, frailty, recurrent, ALT, VAR,
  GARCH, state-space, survey, MI categoriale, ML, Bayes, meta, spatial.
- Aggiornare `heavyIds.ts` e `heavyRunners.ts`; il test `heavyIds.test.ts`
  fallisce se non sono allineati.
- Limiti: messaggi espliciti oltre 50.000 righe o 500 colonne; le procedure
  iterative possono avere limiti più bassi.

### 8.7 Documentazione

- Aggiornare i conteggi solo a fine ondata, non a ogni item.
- `PROJECT-STATUS.md` e `UI-STATE.md` sono documenti vivi; gli audit datati
  restano snapshot storici.
- Aggiungere una tabella “copertura per famiglia” in `PROJECT-STATUS.md`.
- Aggiornare `docs/analysis/2026-10-30-inventario-grafici-31-procedure.md` con
  una nota che il perimetro è cambiato.

---

## 9. Strategia di test

### 9.1 Livelli

| Livello | Cosa | Strumento |
|---|---|---|
| Kernel unit | casi noti, edge, rifiuti | `node:test` |
| Reference | confronto R/Stata/SciPy | fixture + tolleranze |
| Builder | output valido/rifiuto | `run.test.ts` |
| Params | parse, clamp, enum, default | `params.test.ts` |
| Roles | mapping colonne, errori tipo | `roles.test.ts` |
| Snapshot | firma parametri/stale | `paramsSnapshot.test.ts` |
| Coverage | registry, runner, help, sample, worker | test esistenti |
| Chart | compilazione Vega-Lite | `chartsCoverage.test.ts` |
| E2E | apertura form, run, output | Playwright |

### 9.2 Reference matrix (estratto)

| Famiglia | R | Stata | Note |
|---|---|---|---|
| Test base | `prop.test`, `poisson.test`, `var.test`, `ks.test`, `coin` | `prtest`, `poisson`, `sdtest`, `ksmirnov`, `signtest` | tolleranza 1e-6 |
| ANOVA | `aov`, `car::Anova`, `lme4`, `glmmTMB` | `anova`, `mixed`, `melogit` | |
| Regressione | `glm`, `nnet`, `quantreg`, `glmnet`, `pls`, `earth`, `AER`, `plm`, `sampleSelection` | `logit`, `mlogit`, `qreg`, `lasso`, `ivregress`, `xtreg`, `tobit`, `heckman` | |
| Multivariata | `cancor`, `cmdscale`, `ca`, `lavaan`, `poLCA`, `mirt`, `conjoint` | `canon`, `mds`, `ca`, `sem`, `lclass`, `irt` | |
| Categorical | `mantelhaen.test`, `coin`, `loglin`, `fisher.test` | `mhodds`, `tabodds`, `loglin` | |
| Survival | `survival`, `cmprsk`, `coxme`, `frailtypack`, `flexsurv` | `stcrreg`, `stcox`, `streg` | |
| Time series | `forecast`, `tseries`, `vars`, `rugarch`, `KFAS` | `arima`, `dfuller`, `var`, `arch`, `sspace` | |
| Quality/DOE | `qcc`, `SixSigma`, `MSA`, `FrF2`, `DoE.base` | — | |
| Missing/survey | `mice`, `survey`, `lavaan` | `mi`, `svy` | |
| ML/Bayes/meta | `randomForest`, `xgboost`, `quanteda`, `mlogit`, `rstan`, `metafor` | `lasso`, `bayes`, `meta` | |

### 9.3 Criteri di accettazione numerica

- Statistiche e p-value: differenza relativa < 1e-6 per forme chiuse.
- Stime iterative: < 1e-4 o convergenza confrontabile.
- MCMC/ML: metriche diagnostiche e intervalli, non confronto puntuale.
- Ogni test reference dichiara dataset, versione R/pacchetto e tolleranza.

### 9.4 Retrofit del baseline esistente (W0-09)

Prima di aggiungere nuove procedure, le 8 procedure esistenti che oggi hanno
solo test di proprietà/decisione ricevono un reference test indipendente.

| Procedura | Cosa verificare | Reference | Tolleranza |
|---|---|---|---|
| TOST | t, p TOST, IC, decisione | R `TOSTER` | 1e-6 |
| Quality/SPC | limiti Xbar-R, CUSUM, Cp/Cpk | R `qcc` | 1e-6 |
| Cluster | merge, altezze, assegnazione | R `hclust` | 1e-8 |
| Discriminant/MANOVA | coefficienti LDA, Wilks, accuracy | R `MASS::lda`, `candisc` | 1e-6 |
| Partition | split, soglie, R², importanza | R `rpart` | 1e-4 |
| DOE | coefficienti, R², punto stazionario | R `rsm` | 1e-6 |
| MI | medie/SD pooled, coefficienti pooled | R `mice` (seed fisso) | 1e-3 |
| Resampling | p permutation esatta, IC bootstrap | R `coin` / calcolo esatto | 1e-9 / 1e-3 |

Regole:

- test aggiunti ai file esistenti (`kernels/*.test.ts` o `*.test.ts`);
- dataset deterministico e seed fisso per MI/resampling;
- per i metodi stocastici si confrontano media e tolleranza su più repliche,
  non un singolo valore;
- il gate G0 richiede **8/8 reference verdi** e tolleranze documentate.

Dopo W0-09, ogni procedura del registro ha almeno un test di correttezza
numerica, salvo il Wizard che non è una procedura statistica.

---

## 10. Release plan

| Release | Contenuto | Criterio di uscita |
|---|---|---|
| v0.13 | W0 + W1 (14 metodi) | G1 verde, help 6 lingue, 2 nuove voci |
| v0.14 | W2 (12 metodi) — **chiuso 2026-11-03, G2 verde** | GLM/GLMM reference, 5 nuove voci |
| v0.15 | W3 (7 metodi) — **chiuso 2026-11-03, G3 verde** | 7 modelli avanzati, 7 nuove voci |
| v0.16 | W4 + W5 (13 metodi) | Categorical, MI, SEM/IRT/latent |
| v0.17 | W6 + W7 (15 metodi) | Survival e time series |
| v0.18 | W8 (5 metodi) — **chiuso 2026-11-03, G8 verde** | Quality/DOE/power |
| v0.19 | W9 (7 metodi) | Survey/ML/Advanced, copertura 73/73 |

Ogni release:

- aggiorna `package.json` (minor);
- aggiorna i conteggi in `README.md`, `PROJECT-STATUS.md`, `UI-STATE.md`;
- include note di migrazione solo se cambia il comportamento di una procedura
  esistente (default invariati, quindi di norma nessuna nota).
- non cambia `PROJECT_VERSION`.

---

## 11. Stime e staffing

### 11.1 Per dimensione

| Classe | Giorni/item | Metodi | Totale |
|---|---:|---:|---:|
| S | 2 | 13 | 26 |
| M | 4 | 27 | 108 |
| L | 9 | 23 | 207 |
| XL | 17 | 10 | 170 |
| **Subtotale** |  | **73** | **511** |
| Fondazioni W0 (incl. W0-09) | 44 | — | 44 |
| Fondazioni JIT (F4-F8) | 44 | — | 44 |
| **Totale** |  |  | **599** |

Le stime includono test, help e documentazione. Aggiungendo ~5% per traduzioni
e gate di ondata: **~629 giornate/uomo** a lordo, **~550** con il riuso dei
moduli condivisi.

### 11.2 Calendario

| Team | Durata | Note |
|---|---|---|
| 1 sviluppatore | 26-30 mesi | sequenziale, W1 prima per valore |
| 2 sviluppatori | 14-16 mesi | A numerica, B UI/QA |
| 3 sviluppatori | 9-11 mesi | A numerica, B UI/i18n, C QA/reference |

### 11.3 Milestone temporali (team 3)

| Mese | Milestone |
|---|---|
| 1 | W0 chiuso, G0 |
| 2-3 | W1 chiuso, v0.13 |
| 4 | W2 chiuso, v0.14 |
| 5 | W3 chiuso, v0.15 |
| 6-7 | W4+W5 chiusi, v0.16 |
| 8 | W6+W7 chiusi, v0.17 |
| 9 | W8 chiuso, v0.18 |
| 10 | W9 chiuso, v0.19, copertura 73/73 |

---

## 12. Risk register

| ID | Rischio | P | I | Mitigazione | Trigger |
|---|---|---|---|---|---|
| R1 | Errore numerico in metodi avanzati | M | A | reference test, tolleranze, revisione incrociata | test reference rosso |
| R2 | Esplosione registro/UI | M | M | modalità, nuove famiglie, sottogruppi | >15 voci/famiglia |
| R3 | Costo traduzioni | A | A | glossario, batch, `check-locale` | help mancante |
| R4 | Performance su griglie grandi | M | A | worker, limiti, benchmark | blocco >100 ms |
| R5 | Scope creep (tutte le opzioni Stata) | A | A | perimetro “metodo di menu” | nuove richieste fuori backlog |
| R6 | Dipendenze numeriche non pronte | M | A | fondazioni just-in-time, gate | kernel duplicato |
| R7 | Dataset insufficienti | M | M | piano sample, generatore R | `samples.test` rosso |
| R8 | Regressioni sulle procedure esistenti | B | A | default invariati, golden test | test legacy rosso |
| R9 | Complessità SEM/IRT/Bayes | A | A | milestone interne, output minimi | stima superata >30% |
| R10 | Turnover/conoscenza | B | M | documentazione per item, ADR | assenza >1 settimana |

---

## 13. Governance e tracking

### 13.1 Cadenza

- **Sprint**: 2 settimane.
- **Review settimanale**: stato item, blocchi, rischi.
- **Gate di ondata**: demo + `npm run check` + help + sample + docs.
- **Retrospettiva**: stima vs actual, aggiornamento backlog.

### 13.2 Dashboard

| Indicatore | Frequenza | Fonte |
|---|---|---|
| Metodi chiusi / 73 | settimanale | backlog |
| Nuove voci / 36 | settimanale | registry |
| Reference test verdi | settimanale | CI |
| Help 6/6 | per ondata | `check-locale` |
| Sample coverage | per ondata | `samples.test` |
| Debito aperto | settimanale | issue |

### 13.3 Definition of “item chiuso”

Un item passa a “done” solo nel gate di ondata, non quando il codice compila.
Le voci parziali restano “in corso” e non entrano nel conteggio di copertura.

---

## 14. Appendici

### A. Matrice di tracciabilità (73 metodi)

| ID | Metodo | Famiglia | Tipo | Ondata | gg |
|---|---|---|---|---|---:|
| D-01 | Frequenze/tally | Descriptive | mode | 1 | 2 |
| D-02 | Outlier Grubbs/Dixon | Descriptive | mode | 1 | 2 |
| D-03 | Runs test | Descriptive | mode | 1 | 2 |
| D-04 | Intervalli di tolleranza | Descriptive | mode | 1 | 2 |
| Q-01 | Gage R&R/MSA | Descriptive | mode | 8 | 4 |
| Q-02 | Acceptance sampling/OC | Descriptive | mode | 8 | 4 |
| Q-03 | Carte multivariate | Descriptive | mode | 8 | 4 |
| Q-04 | CUSUM | Descriptive | mode | 1 | 2 |
| C-01 | Proporzioni 1/2 campioni | Compare | new | 1 | 4 |
| C-02 | Tassi Poisson 1/2 campioni | Compare | mode | 1 | 4 |
| C-03 | Varianze 1/2 | Compare | new | 1 | 4 |
| C-04 | Sign test | Compare | mode | 1 | 2 |
| C-05 | KS a due campioni | Compare | mode | 1 | 2 |
| C-06 | Mood median | Compare | mode | 1 | 2 |
| C-07 | GOF categorico | Compare | mode | 1 | 4 |
| C-08 | ANOVA nested | Compare | mode | 2 | 4 |
| C-09 | MANCOVA | Compare | mode | 2 | 4 |
| C-10 | Pendenze casuali/GLMM | Compare | mode+new | 2 | 9 |
| C-11 | ANOM | Compare | mode | 2 | 2 |
| R-01 | Stepwise/best subsets | Regression | mode | 2 | 4 |
| R-02 | Polinomiale/curve | Regression | mode | 2 | 4 |
| R-03 | Non lineare | Regression | new | 2 | 9 |
| R-04 | Multinomiale | Regression | new | 2 | 9 |
| R-05 | Probit | Regression | mode | 2 | 2 |
| R-06 | GLM gamma/Tweedie | Regression | new | 2 | 9 |
| R-07 | Quantile | Regression | new | 2 | 9 |
| R-08 | Ridge/LASSO/elastic net | Regression | mode | 2 | 9 |
| R-09 | PLS | Regression | new | 3 | 9 |
| R-10 | GAM/MARS | Regression | new | 3 | 9 |
| R-11 | IV/2SLS | Regression | new | 3 | 9 |
| R-12 | Panel FE/RE | Regression | new | 3 | 9 |
| R-13 | Tobit/selection | Regression | new | 3 | 9 |
| R-14 | Mediazione | Regression | new | 3 | 4 |
| R-15 | Propensity score | Regression | new | 3 | 4 |
| M-01 | K-means/k-medians | Multivariate | mode | 5 | 4 |
| M-02 | Correlazione canonica | Multivariate | new | 5 | 4 |
| M-03 | MDS | Multivariate | new | 5 | 4 |
| M-04 | Correspondence | Multivariate | new | 5 | 4 |
| M-05 | SEM/CFA | Multivariate | new | 5 | 17 |
| M-06 | Latent class | Multivariate | new | 5 | 17 |
| M-07 | IRT | Multivariate | new | 5 | 17 |
| M-08 | Conjoint | Multivariate | new | 5 | 9 |
| K-01 | Mantel-Haenszel | Categorical | mode | 4 | 4 |
| K-02 | Cochran-Armitage | Categorical | mode | 4 | 2 |
| K-03 | Log-linear | Categorical | new | 4 | 9 |
| K-04 | Esatti R×C | Categorical | mode | 4 | 4 |
| S-01 | Life tables | Survival | mode | 6 | 4 |
| S-02 | Competing risks | Survival | new | 6 | 9 |
| S-03 | Frailty | Survival | mode | 6 | 9 |
| S-04 | Eventi ricorrenti | Survival | new | 6 | 9 |
| S-05 | Censoring L/R/intervallo | Survival | mode | 6 | 4 |
| S-06 | Parametriche extra | Survival | mode | 6 | 4 |
| S-07 | ALT | Survival | new | 6 | 9 |
| S-08 | Reliability growth/RBD | Survival | new | 6 | 9 |
| T-01 | Holt-Winters | Time series | mode | 7 | 4 |
| T-02 | Radice unitaria | Time series | mode | 7 | 4 |
| T-03 | VAR/VECM | Time series | new | 7 | 9 |
| T-04 | Analisi spettrale | Time series | mode | 7 | 4 |
| T-05 | ARIMAX/intervention | Time series | mode | 7 | 4 |
| T-06 | GARCH | Time series | new | 7 | 9 |
| T-07 | State-space/Markov | Time series | new | 7 | 17 |
| P-01 | Sample size una proporzione | Design | mode | 1 | 2 |
| P-02 | Sample size varianze/Poisson | Design | mode | 1 | 2 |
| P-03 | Power regressione/logistica | Design | mode | 8 | 4 |
| Q-05 | Generazione disegni DOE | Design | mode | 8 | 9 |
| N-01 | MI categorica/FIML | Missing | mode | 4 | 9 |
| N-02 | Survey/complex samples | Missing | new | 9 | 17 |
| L-01 | RF/boosting/reti neurali | ML | new | 9 | 17 |
| L-02 | Text mining | ML | new | 9 | 17 |
| L-03 | Choice/MaxDiff | ML | new | 9 | 17 |
| A-01 | Analisi bayesiana | Advanced | new | 9 | 17 |
| A-02 | Meta-analisi | Advanced | new | 9 | 9 |
| A-03 | Statistica spaziale | Advanced | new | 9 | 17 |

Nota: le 36 nuove voci sono 35 righe `new` + 1 riga `mode+new` (C-10, che
introduce `glmm` e insieme estende `lmm`). Le 37 estensioni sono 36 righe
`mode` + la parte `mode` di C-10.

### B. Matrice reference test

| Area | Dataset | R | Stata | Tolleranza |
|---|---|---|---|---|
| Proporzioni | `two_groups_binary` | `prop.test`, `binom.test` | `prtest` | 1e-6 |
| Poisson | `quine` | `poisson.test` | `poisson` | 1e-6 |
| Varianze | `plantgrowth` | `var.test`, `leveneTest`, `bartlett.test` | `sdtest`, `robvar` | 1e-6 |
| Non parametrici | `sleep_wide`, `plantgrowth` | `coin`, `ks.test` | `signtest`, `ksmirnov` | 1e-6 |
| ANOVA | `plantgrowth`, `nested_demo` | `aov`, `car::Anova`, `lme4` | `anova`, `mixed` | 1e-6 |
| GLM/GLMM | `mtcars`, `chickweight_long` | `glm`, `glmer`, `glmmTMB` | `glm`, `melogit` | 1e-4 |
| Regressione avanzata | `mtcars`, `panel_demo` | `nnet`, `quantreg`, `glmnet`, `pls`, `earth`, `AER`, `plm`, `sampleSelection` | `mlogit`, `qreg`, `lasso`, `ivregress`, `xtreg`, `tobit`, `heckman` | 1e-4 |
| Multivariata | `iris`, `usarrests`, `sem_demo` | `cancor`, `cmdscale`, `ca`, `lavaan`, `poLCA`, `mirt` | `canon`, `mds`, `ca`, `sem`, `lclass`, `irt` | 1e-4 |
| Categorical | `stratified_2x2`, `ordinal_table` | `mantelhaen.test`, `coin::trend_test`, `loglin` | `mhodds`, `tabodds` | 1e-6 |
| Survival | `lung`, `competing_demo` | `survival`, `cmprsk`, `coxme`, `frailtypack`, `flexsurv` | `stcrreg`, `stcox`, `streg` | 1e-4 |
| Time series | `airpassengers`, `var_demo` | `forecast`, `tseries`, `vars`, `rugarch`, `KFAS` | `arima`, `dfuller`, `var`, `arch`, `sspace` | 1e-4 |
| Quality/DOE | `msa_demo`, `doe_demo` | `qcc`, `SixSigma`, `FrF2`, `DoE.base` | — | 1e-6 |
| Missing/survey | `airquality`, `survey_demo` | `mice`, `survey` | `mi`, `svy` | 1e-4 |
| ML/Bayes/meta | `iris`, `text_demo`, `meta_demo` | `randomForest`, `xgboost`, `quanteda`, `mlogit`, `rstan`, `metafor` | `lasso`, `bayes`, `meta` | diagnostica |

### C. Piano dataset

Vedi §8.4. Ogni dataset nuovo deve avere:

- `samples/<family>/<id>/data.{csv,sav,dta,xlsx,json}`;
- voce in `samples/manifest.json` con `rows`, `columns`, `procedures`,
  `examples`;
- generatore in `samples/generate.R`;
- test in `src/io/samples.test.ts`.

### D. Glossario

Termini da aggiungere prima della traduzione:

- frequenze/tally, intervallo di tolleranza, Gage R&R, CUSUM, MSA;
- proporzioni, tasso Poisson, varianza, sign test, Mood, GOF;
- stepwise, LASSO, ridge, elastic net, quantile, GAM, MARS, PLS, IV/2SLS;
- panel, Tobit, Heckman, propensity score, mediazione;
- canonical, MDS, correspondence, SEM, CFA, latent class, IRT, conjoint;
- Mantel-Haenszel, Cochran-Armitage, log-linear;
- life table, competing risks, frailty, recurrent events, ALT, RBD;
- Holt-Winters, ADF, KPSS, VAR, VECM, GARCH, state-space;
- acceptance sampling, OC curve, DOE, Box-Behnken, CCD, Taguchi;
- survey, complex samples, FIML, MI;
- random forest, boosting, text mining, MaxDiff, Bayesian, meta-analysis,
  spatial.

### E. Checklist PR (sintetica)

- [ ] kernel + test + reference
- [ ] table/report
- [ ] runner + form + params + roles
- [ ] registry + runner + worker
- [ ] chart o motivazione
- [ ] help 6 lingue + i18n
- [ ] sample 5 formati
- [ ] coverage test
- [ ] `npm run check`
- [ ] docs conteggi

### F. Primi 4 sprint (2 settimane ciascuno)

#### Sprint 1 — fondazioni e quick win

- W0-01 `optimize.ts` (inizio)
- W0-02 `glm.ts` (scheletro)
- D-01 frequenze
- D-02 outlier
- Test: unit + reference R per D-01/D-02
- Exit: 2 metodi chiusi, W0-01 verde

#### Sprint 2 — fondazioni e test base

- W0-03 matrix
- D-03 runs
- D-04 tolleranza
- C-04 sign
- C-05 KS
- C-06 Mood
- Exit: 5 metodi chiusi, W0-01/03 verdi

#### Sprint 3 — test di base e quality

- W0-02 `glm.ts` completo
- C-01 proporzioni
- C-02 Poisson
- C-03 varianze
- Q-04 CUSUM
- P-01/P-02 sample size
- Exit: 6 metodi chiusi, W0-02 verde

#### Sprint 4 — chiusura Wave 1

- C-07 GOF
- R-05 probit
- Help 6 lingue per tutti gli item W1
- Sample nuovi: `two_groups_binary`, `categorical_gof`
- Coverage test + `npm run check`
- Exit: **G1**, 14 metodi, v0.13 pronta

---

## 15. Prossimo passo operativo

1. Leggere `docs/plans/2026-11-02-gap-procedure-stato.md` (fonte di ripresa).
2. Aprire un worktree `gap-wave-1`.
3. Creare il branch `feat/gap-wave-1`.
4. Implementare W0-01, W0-02, W0-09 e i primi due item (D-01, D-02).
5. Aggiornare il backlog in questo documento man mano che gli item passano
   il gate.
6. Non aggiornare i conteggi globali (36→72) fino alla chiusura di W1.

---

## 16. Protocollo di checkpoint, handoff e compattazione

### 16.1 Regola generale

**Nessuna compattazione senza handoff aggiornato.** Il documento di stato è:

`docs/plans/2026-11-02-gap-procedure-stato.md`

Va aggiornato:

- alla fine di ogni checkpoint;
- **prima** di ogni compattazione del contesto;
- prima di cambiare famiglia, fondazione o sessione;
- dopo un commit che cambia lo stato del piano.

La chat non è la fonte di verità: lo sono il documento di stato, i commit e i
test. Se il contesto viene compattato senza handoff, la ripresa è considerata
non valida.

### 16.2 Trigger

**Obbligatori**

1. Fine di ogni ondata (G0–G9).
2. Metà delle ondate lunghe:
   - W2 dopo R-05;
   - W5 dopo M-04;
   - W9 dopo L-01.
3. Cambio di famiglia o di fondazione (es. Regression → Multivariate).
4. Intervento rischioso su un kernel condiviso, sul registry o sulla persistenza.

**Consigliati**

5. Ogni 2-3 item chiusi o ogni ~2 settimane.
6. Quando il contesto si avvicina al limite.
7. Prima di una pausa lunga o di un cambio di sessione.

### 16.3 Checkpoint verde

Un checkpoint è “verde” quando:

- i test rilevanti passano;
- il codice è committato (anche WIP su branch dedicato);
- `gap-procedure-stato.md` è aggiornato;
- i prossimi 3 passi sono scritti;
- le domande aperte sono elencate.

Rituale:

1. Eseguire i test mirati; alla fine ondata `npm run check`.
2. Committare (o WIP commit sul branch).
3. Aggiornare `gap-procedure-stato.md`.
4. Aggiornare le checkbox del piano.
5. Produrre un riassunto di 10 righe: stato, commit, test, decisioni,
   prossimi 3 passi, domande.
6. L’utente compatta.

### 16.4 Fine ondata

In aggiunta al checkpoint verde:

- `npm run check` completo;
- aggiornamento conteggi (`README.md`, `docs/PROJECT-STATUS.md`,
  `docs/UI-STATE.md`);
- tag/release (`v0.13`, …);
- note di rilascio e demo;
- handoff esplicito per l’ondata successiva;
- aggiornamento della dashboard in `gap-procedure-stato.md`.

### 16.5 Contenuto minimo dell’handoff

- data e ondata corrente;
- branch, worktree e ultimo commit;
- item chiusi / in corso / bloccati;
- test eseguiti e risultato;
- file toccati e moduli nuovi;
- decisioni prese e deviazioni dal piano;
- prossimi 3 passi;
- domande aperte;
- rischi attivi.

### 16.6 Checkpoint pianificati

Oltre ai 10 gate di ondata:

| Checkpoint | Momento | Tipo |
|---|---|---|
| G0 | fine W0 | obbligatorio |
| G1 | fine W1 | obbligatorio |
| W2-mid | dopo R-05 | obbligatorio |
| G2 | fine W2 | obbligatorio |
| G3 | fine W3 | obbligatorio |
| G4 | fine W4 | obbligatorio |
| W5-mid | dopo M-04 | obbligatorio |
| G5 | fine W5 | obbligatorio |
| W6-mid | dopo S-04 | consigliato |
| G6 | fine W6 | obbligatorio |
| G7 | fine W7 | obbligatorio |
| G8 | fine W8 | obbligatorio |
| W9-mid | dopo L-01 | obbligatorio |
| G9 | fine W9 | obbligatorio |

Totale: **14 checkpoint obbligatori** + checkpoint liberi ogni 2-3 item.

### 16.7 Responsabilità

- **Agente**: aggiorna il documento di stato prima di ogni compattazione e non
  si affida alla memoria della chat; non dichiara “fatto” un item senza gate.
- **Utente**: decide quando compattare; può chiedere un checkpoint in qualsiasi
  momento.
- **Repo**: commit e test sono la prova dello stato; il documento di stato è la
  mappa per riprendere.

### 16.8 Cosa non fare

- Non compattare a metà di una modifica senza WIP commit.
- Non compattare con test rossi senza dichiararlo esplicitamente.
- Non cancellare il registro dei checkpoint: si aggiungono righe, non si
  riscrive la storia.
- Non aggiornare i conteggi globali prima del gate di ondata.
- Non usare il documento di stato per duplicare il piano: deve rimandare alle
  sezioni del piano, non ricopiarle.

---

## 17. Uso dei subagenti (regole vincolanti)

Obiettivo: **un solo scrittore** e subagenti solo in lettura, quando costano
meno della lettura diretta. Le regole di economia del contesto sono in
`AGENTS.md` e prevalgono in caso di conflitto.

### 17.1 Regola del proprietario unico

Ogni file ha **un solo scrittore per sessione**: l'agente principale. I file
condivisi sono di competenza esclusiva dell'agente principale:

- `src/analyses/registry.ts`;
- `src/io/project/{types,parse}.ts`;
- `src/analyses/{params,roles,runners,paramsSnapshot}.ts`;
- `src/ui/analysis/AnalysisForm.tsx`;
- cataloghi `src/i18n/catalog/*` e `src/stats/reportCopy/catalog/*`;
- help book (`src/help/content/*`, `order.ts`);
- `package.json`, `AGENTS.md`, documenti di piano.

I subagenti **non scrivono** kernel, tabelle, report, form, test, traduzioni,
help o integrazione. Se un compito tocca più file, si serializza nel main.

### 17.2 Schema per ondata

1. Agente principale: ricognizione diretta con `grep -n`, `wc -l` e `sed -n`.
   Un solo `explore` in lettura è ammesso se evita molte letture manuali.
2. Agente principale, un item alla volta: kernel + test mirato → tabelle/report
   → form/run → integrazione nei file condivisi → test mirato.
3. `council-luna` / `council-glm` in sola lettura: solo alla revisione del
   gate, non durante l'implementazione.
4. Agente principale: gate completo (`npm run check`, `test:samples`, locale
   check), aggiornamento dello stato, commit e push.

### 17.3 Contratto per un subagente in lettura

Se viene usato, l'incarico dichiara:

- perimetro esatto dei file o della domanda;
- cosa cercare e perché la lettura diretta costerebbe di più;
- criterio di stop;
- risposta breve: file/righe rilevanti, rischi, nessuna proposta di modifica.

L'agente principale verifica sempre con test mirati e resta l'unico a
modificare i file.

### 17.4 Cosa non delegare

- Scrittura di codice, test, traduzioni, help o documenti.
- Decisioni di prodotto o architettura.
- Modifiche distruttive o irreversibili.
- Bump di versione e release.
- Aggiornamento del documento di stato e del registro checkpoint.
- Merge di worktree sovrapposti.

### 17.5 Worktree

Worktree separati solo per rami davvero indipendenti. Per le ondate normali si
usa lo stesso albero con un solo scrittore: meno merge, meno conflitti, meno
token sprecati.

### 17.6 Economia del contesto

Test mirati durante gli step e gate completo solo a fine ondata; lettura
selettiva e output filtrati; niente rigenerazioni massive dei sample; script
una tantum per il lavoro ripetitivo; checkpoint e risposte finali brevi.
Dettaglio vincolante in `AGENTS.md`, sezione “Economia del contesto”.
