# Confronto delle tabelle dei risultati con JMP — famiglia regressione (2026-11-05)

Fase 2.1 del piano: per ogni procedura della famiglia `regression` (20 procedure)
confronto tra le voci che JMP stampa e quelle che produciamo noi. Le nostre voci
sono quelle **eseguite** da `scripts/inventory-procedures.mts` (etichette di riga
e colonne reali, non dedotte dal codice); le voci JMP sono lette dai quattro libri
con `pdftotext -layout`, con il rimando alle righe del testo estratto.

## Fonti JMP

| Fonte | Contenuto usato |
| --- | --- |
| `jmp4.pdf` cap. 15, testo righe 9416-9445 | Summary of Fit (cinque voci), Lack of Fit, Analysis of Variance |
| `jmp3.pdf` righe 12526-12545 | Effect Tests e Parameter Estimates (Estimate, Std Error, t Ratio, Prob>\|t\|, Std Beta, VIF, Tol, IC 95%) |
| `jmp4.pdf` righe 11929-11960 | Nominal Logistic: Whole Model Test, Parameter Estimates, Effect Likelihood Ratio Tests |
| `jmp3.pdf` righe 11989-12000 e 12080-12115 | Generalized Linear Model: Effect Tests sul modello Poisson |
| `jmp3.pdf` cap. 13 (righe 12460-12500) | Analysis of Variance del modello multiplo (Model, Error, C. Total) |

I libri **non** mostrano tabelle REML complete per i modelli misti né la
piattaforma GEE: per `lmm`, `glmm`, `gee` le voci JMP sono ricavate dalla
descrizione del Mixed Model in `jmp3` e sono marcate "non documentata" dove il
libro non le stampa.

## Stati usati

- **presente** — la voce c'è, con lo stesso nome o con un altro (il nome JMP è indicato).
- **mancante, calcolabile** — la voce non c'è e si ricava dai nostri input.
- **mancante, non calcolabile** — serve un input che non abbiamo.
- **non documentata** — JMP potrebbe averla, ma i libri non la mostrano: non la conto come mancanza.

## Riepilogo

| Procedura | Piattaforma JMP | Presenti | Mancanti calcolabili | Mancanti non calcolabili |
| --- | --- | --- | --- | --- |
| `regression` | Fit Model / Bivariate | 18 | 2 | 1 |
| `logistic` | Nominal Logistic | 10 | 2 | 0 |
| `glm` | Generalized Linear Model | 8 | 2 | 0 |
| `countreg` | Fit Model (Poisson) | 7 | 1 | 0 |
| `ordinal` | Ordinal Logistic | 8 | 1 | 0 |
| `multinomial` | Nominal Logistic (multiclasse) | 8 | 1 | 0 |
| `nonlinear` | Nonlinear / Fit Curve | 9 | 1 | 0 |
| `lmm` | Mixed Model | 8 | 2 | 0 |
| `glmm` | Mixed Model (GLMM) | 7 | 2 | 0 |
| `gee` | GEE | 6 | 0 | 0 |
| `correlation`, `quantile`, `pls`, `mars`, `iv`, `panel`, `selection`, `mediation`, `propensity`, `partition` | — | — | — | — |

**Totale: 14 blocchi di voci mancanti e calcolabili** (circa 35 valori numerici),
1 non calcolabile (Lack of Fit della regressione lineare).

Le altre dieci procedure non hanno un confronto: `correlation` è coperta da
Multivariate > Correlations ma le sue voci sono già tutte presenti; per
`quantile`, `pls`, `mars`, `iv`, `panel`, `selection`, `mediation`, `propensity`
e `partition` i libri non documentano la piattaforma corrispondente, quindi non
c'è un riferimento da cui dedurre voci mancanti.

## `regression` — Fit Model / Bivariate

| Voce JMP | Nostra | Stato |
| --- | --- | --- |
| RSquare | `reg-model` → R² | presente |
| RSquare Adj | `reg-model` → Adjusted R² | presente (nome diverso) |
| Root Mean Square Error | `reg-model` → SE of estimate | presente (nome diverso) |
| Observations | `reg-model` → N | presente (nome diverso) |
| **Mean of Response** | — | **mancante, calcolabile**: media della variabile dipendente |
| Analysis of Variance (Model/Error/C. Total, DF, SS, MS, F, Prob>F) | `reg-anova` (Regression/Residual/Total, SS, df, MS, F, p) | presente (nomi diversi) |
| Parameter Estimates (Estimate, Std Error, t Ratio, Prob>\|t\|) | `reg-coefficients` (B, SE, t, p) | presente |
| Std Beta, VIF, Tol | `reg-coefficients` (β std., VIF, Tolerance) | presente |
| Lower/Upper 95% | `reg-coefficients` (CI low, CI high) | presente |
| **Effect Tests** (Nparm, DF, Sum of Squares, F Ratio, Prob>F per termine) | — | **mancante, calcolabile**: SS Tipo III per termine, F e p |
| Lack of Fit (SS, DF, MS, F, Prob>F) | — | **mancante, non calcolabile**: richiede repliche (pure error) |

In più abbiamo R, F, p (F), AIC, BIC, Durbin–Watson, diagnostica (leverage, Cook,
Breusch–Pagan, White, RESET, DFBETAS, condition index), residui e stimatori
robusti: voci che JMP mette in altri pannelli o non ha.

## `logistic` — Nominal Logistic

| Voce JMP | Nostra | Stato |
| --- | --- | --- |
| Whole Model Test: -LogLikelihood, DF, ChiSquare, Prob>ChiSq | `logit-fit`: Log-verosimiglianza, df, LR χ², p del modello | presente |
| RSquare (U) | `logit-fit`: McFadden R² | presente (nome diverso) |
| Observations | `logit-fit`: Osservazioni | presente |
| Parameter Estimates: Estimate, Std Error | `logit-coefficients`: B, SE | presente |
| Parameter Estimates: ChiSquare (Wald) | — | **mancante, calcolabile**: z², da aggiungere come colonna accanto a Wald z |
| Parameter Estimates: Prob>ChiSq | `logit-coefficients`: p | presente |
| **Effect Likelihood Ratio Tests** (Nparm, DF, L-R ChiSquare, Prob>ChiSq per termine) | — | **mancante, calcolabile**: confronto di verosimiglianza con il modello senza il termine |

In più: eventi, eventi per parametro, Cox–Snell, Nagelkerke, AIC, BIC, odds ratio
con IC, accuratezza/sensibilità/specificità/AUC.

## `glm` — Generalized Linear Model

| Voce JMP | Nostra | Stato |
| --- | --- | --- |
| Observations | `glm-fit`: Osservazioni | presente |
| Deviance, df residui, df nullo | `glm-fit`: Devianza, df residui, df nullo | presente |
| Dispersione, Log-verosimiglianza, AIC | `glm-fit` | presente |
| Parameter Estimates: Estimate, Std Error, z, Prob>\|z\|, IC | `glm-coefficients`: B, SE, z, p, CI low/high | presente |
| Parameter Estimates: ChiSquare | — | **mancante, calcolabile**: z² |
| **Effect Tests** per termine | — | **mancante, calcolabile**: analisi di devianza per termine |

## `countreg` — Fit Model (Poisson / binomiale negativa)

| Voce JMP | Nostra | Stato |
| --- | --- | --- |
| Observations, Deviance, df residui | `count-summary`: N, Deviance, df residui | presente |
| Dispersion (Pearson/df) | `count-summary`: Dispersione (Pearson/df) | presente |
| -LogLikelihood, AIC, BIC | `count-summary`: Log-verosimiglianza, AIC, BIC | presente |
| LR vs modello nullo, p | `count-summary`: LR vs nullo, p LR | presente |
| Parameter Estimates (Estimate, SE, z, p, IRR, IC) | `count-coefficients` | presente |
| **Effect Tests / LR per termine** | — | **mancante, calcolabile** |

Il test di sovradispersione che JMP riporta in alcuni pannelli non compare nei
libri: **non documentata**, non conteggiata.

## `ordinal` — Ordinal Logistic

| Voce JMP | Nostra | Stato |
| --- | --- | --- |
| Whole Model Test (LogLik, LR, p) | `ordinal-summary`: Log-verosimiglianza, LR vs nullo, p LR | presente |
| RSquare (U) | `ordinal-summary`: McFadden R² | presente (nome diverso) |
| Parameters: Estimate, SE, z, p, OR, IC | `ordinal-coefficients` | presente |
| Thresholds (α, SE, IC) | `ordinal-thresholds` | presente |
| **Effect Likelihood Ratio Tests** per termine | — | **mancante, calcolabile** |

## `multinomial` — Nominal Logistic multiclasse

| Voce JMP | Nostra | Stato |
| --- | --- | --- |
| Whole Model Test (LogLik, LR, p) | `multinomial-fit`: Log-verosimiglianza, Deviance, AIC | presente |
| Parameter Estimates per classe (Estimate, SE, z, p, OR, IC) | `multinomial-coefficients` | presente |
| Classe di riferimento, predittori, parametri | `multinomial-fit` | presente |
| Confusion / accuratezza | `multinomial-classification` (per classe) e accuratezza complessiva | presente |
| **Effect Likelihood Ratio Tests** per termine | — | **mancante, calcolabile** |

## `nonlinear` — Nonlinear / Fit Curve

| Voce JMP | Nostra | Stato |
| --- | --- | --- |
| Solution: Estimate, Std Error, t Ratio, Prob>\|t\|, IC 95% per parametro | `nonlinear-parameters`: estimate, se, t, p, ciLo, ciHi | presente |
| Summary of Fit: SSE, DFE, RSquare, RSquare Adj, RMSE | `nonlinear-fit`: SSE, df, R², R² corretto, RMSE | presente |
| **Mean Square Error (MSE)** | — | **mancante, calcolabile**: SSE/df |
| Iterazioni, convergenza | `nonlinear-fit` | presente (in più) |

## `lmm` — Mixed Model

| Voce JMP | Nostra | Stato |
| --- | --- | --- |
| Observations, gruppi | `lmm-summary`: N, Gruppi | presente |
| REML Variance Component Estimates (stima) | `lmm-summary`: Varianza intercetta, Varianza residua | presente |
| **REML Variance Component Estimates: Std Error e IC 95%** | — | **mancante, calcolabile** (matrice di informazione; oneroso ma fattibile) |
| Solution for Fixed Effects (Estimate, SE, t, p, IC) | `lmm-fixed` | presente |
| **Fixed Effects Tests (F, Prob>F per termine)** | — | **mancante, calcolabile**: test di Wald congiunto per termine |
| ICC, logLik REML | `lmm-summary` | presente (in più) |

## `glmm` — Mixed Model (GLMM)

| Voce JMP | Nostra | Stato |
| --- | --- | --- |
| Solution for Fixed Effects | `glmm-coefficients` | presente |
| Random effects / componenti di varianza (stima) | `glmm-random`: Varianza intercetta, Varianza residua | presente |
| BLUP per gruppo | `glmm-blups` | presente (in più rispetto ai libri) |
| **SE e IC dei componenti di varianza** | — | **mancante, calcolabile**: da approssimazione di Laplace |
| **Fixed Effects Tests (F/χ², p per termine)** | — | **mancante, calcolabile** |

## `gee`

| Voce JMP | Nostra | Stato |
| --- | --- | --- |
| Stime, SE, z, p, OR, IC | `gee-coefficients` | presente |
| N, cluster, alpha di lavoro, phi, iterazioni | `gee-summary` | presente |

La piattaforma GEE non è documentata nei libri: nessuna voce mancante conteggiata.

## Conseguenze

La prima ondata di integrazione riguarda la regressione lineare, dove le due voci
mancanti sono indipendenti dal resto. **Stato: implementate** (2026-11-05).

1. **Mean of Response** in `reg-model`: una riga, la media della variabile
   dipendente sulle righe complete del modello (`RegressionStats.meanY`).
2. **`reg-effects`**: una tabella con una riga per termine (Nparm, df, SS Tipo III,
   F, p). Per i termini a un grado di libertà F coincide con t², quindi il valore è
   verificabile in due modi indipendenti.

Verifica: valori ricalcolati in R 4.5.2 con `lm()` e modelli ridotti drop-one su
`mtcars` (`wt` SS 88.5028, `hp` 51.6918, `disp` 0.0571) e su un dataset di test a
due predittori; coincidenza a 1e-9. Due test nuovi in `src/stats/tables.test.ts`.

Le voci delle altre procedure restano elencate qui e verranno integrate nelle
ondate successive, una famiglia o un modello per volta, con ricalcolo in R.
