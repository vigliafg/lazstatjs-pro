# Stato — Grafici delle procedure (piano LazStats/JMP)

- **Documento di piano**: `2026-11-03-grafici-procedure-piano.md`
- **Repository**: `/home/vigliafg/Documenti/GitHub/lazstatjs-pro`
- **Creato**: 2026-11-03
- **Ultimo aggiornamento**: 2026-11-03 (baseline)
- **Fase corrente**: F0.1 — da iniziare
- **Deadline**: 10 giorni lavorativi, 4 h/giorno, fasi ≤ 60 min
- **Branch**: `main` (creare `grafici-procedure` prima di F0.1)
- **HEAD al momento della baseline**: `48ed3c0` — `ci(release): evita il DMG macOS non creabile sul runner`
- **Versione**: `0.19.0`

---

## 0. Regola d'uso (vincolante)

1. Questo documento si aggiorna **dopo ogni fase**, prima di compattare il
   contesto e prima di ogni handoff.
2. Le fonti di verità sono: questo documento, i commit e i test. Non la memoria
   della chat.
3. Non dichiarare una fase "fatta" se i test mirati non sono verdi.
4. Se una fase è bloccata, scrivere **perché**, cosa è stato provato e la
   decisione necessaria. Non lasciare il campo vuoto.
5. Le decisioni di prodotto/architettura non coperte dal piano si annotano in
   §4 e si segnalano come domande aperte in §8.

---

## 1. Baseline verificata (2026-11-03)

| Metrica | Valore |
|---|---|
| Procedure nel registro | 72 |
| Procedure con almeno un grafico | 71 |
| Solo `wizard` senza grafici | 1 (per scelta) |
| Modelli `AnalysisChart` nei runner | 321 |
| Analisi con un solo grafico | 4 (`factorial`, `recurrent`, `tdcox`, `tost`) |
| Analisi con 2 grafici | 21 |
| Analisi con ≥3 grafici | 46 |
| Varianti JMP esistenti | box, scatter, Q-Q, interval, dot, residual, histogram |
| Nuovi kind L4 | `tree`, `pareto`, `dendrogram`, `surface` |
| Test unitari | `npm test` (verificare il conteggio al primo gate) |
| Working tree | pulito tranne i PDF JMP non tracciati |

**Nota**: il piano non parte da "zero grafici". Parte da 321 modelli e 29 gap
mirati (più una sostituzione). La matrice §6 del piano è la decisione; questo
documento registra l'esecuzione.

---

## 2. Dashboard delle fasi

Legenda: `⬜` da fare · `🟨` in corso · `✅` fatta · `⛔` bloccata · `⏭️` saltata
con motivo.

| Fase | Contenuto | Tempo | Stato | Commit | Test |
|---|---|---:|---|---|---|
| F0.1 | Inventario, guardrail, stato | 60 | ⬜ | — | — |
| F0.2 | 3 varianti JMP (`forest`, `survival`, `line`) | 60 | ⬜ | — | — |
| F1.1a | `factorial`: medie di cella | 45 | ⬜ | — | — |
| F1.1b | `recurrent`: mean cumulative function | 45 | ⬜ | — | — |
| F1.2 | `tost` e chiusura ampiezza | 45 | ⬜ | — | — |
| F2.1 | `descriptive`: frequenze cumulate, outlier strip | 60 | ⬜ | — | — |
| F2.2 | `quality`: profilo operatore, contributi carta | 60 | ⬜ | — | — |
| F3.1 | varianze, sign, KS | 60 | ⬜ | — | — |
| F3.2 | Mood, GOF, nested | 60 | ⬜ | — | — |
| F3.3 | GLMM/GEE/LMM polish | 45 | ⬜ | — | — |
| F4.1 | stepwise, polynomial, penalized | 60 | ⬜ | — | — |
| F4.2 | multinomial, IV, PLS | 60 | ⬜ | — | — |
| F4.3 | logistica, conteggi, ordinale | 45 | ⬜ | — | — |
| F4.4 | diagnostica di regressione | 45 | ⬜ | — | — |
| F5.1 | cluster, canonical, MDS, correspondence | 60 | ⬜ | — | — |
| F5.2a | SEM, latent class | 45 | ⬜ | — | — |
| F5.2b | IRT ICC, conjoint | 30 | ⬜ | — | — |
| F5.3 | PCA/EFA/alpha e pannelli | 45 | ⬜ | — | — |
| F6.1 | esatti, trend, verifica MH | 45 | ⬜ | — | — |
| F7.1 | life table, competing, frailty, recurrent | 45 | ⬜ | — | — |
| F7.2 | Cox, stratified, time-dependent | 45 | ⬜ | — | — |
| F7.3a | ALT: life-stress plot | 45 | ⬜ | — | — |
| F7.3b | parametric, reliability | 30 | ⬜ | — | — |
| F8.1 | Holt-Winters, unit root, spettrale | 45 | ⬜ | — | — |
| F8.2 | VAR, GARCH, state-space | 60 | ⬜ | — | — |
| F9.1 | sample size, resampling, DOE | 60 | ⬜ | — | — |
| F9.2a | survey, MI | 45 | ⬜ | — | — |
| F9.2b | ML, text, choice | 30 | ⬜ | — | — |
| F9.3a | Bayes PPC, meta | 45 | ⬜ | — | — |
| F9.3b | spatial variogram | 45 | ⬜ | — | — |
| F10.1 | applicazione `jmp-ratio`/`jmp-km`/`jmp-connected` | 45 | ⬜ | — | — |
| F10.2 | bar, Pareto, mosaico, heatmap, interval, dot | 45 | ⬜ | — | — |
| F10.3 | box, scatter, Q-Q: default per procedura | 45 | ⬜ | — | — |
| F11.1a | traduzioni fr/es | 45 | ⬜ | — | — |
| F11.1b | traduzioni de/pt-PT | 45 | ⬜ | — | — |
| F11.2 | help, manuale, inventario | 60 | ⬜ | — | — |
| F11.3 | gate finale e release | 60 | ⬜ | — | — |

**Fase di contingenza** (si aggiunge solo se F2.2 sfora e lascia un
sotto-blocco aperto):

- `F2.3` — contributi della carta multivariata (kernel `mcontrol`), se F2.2
  chiude solo `msa-operator-profile`.

---

## 3. Dashboard per famiglia

| Famiglia | Analisi | Gap pianificati | Fasi | Stato |
|---|---|---:|---|---|
| Descriptive | `descriptive`, `distfit`, `ttest`, `anova`, `factorial`, `ancova`, `repeatedanova`, `mixedanova`, `nonparamrm`, `tost`, `proportions`, `variances` | 9 | F1.2, F2.1, F3.1, F3.2 | ⬜ |
| Quality / SPC | `quality` | 2 | F2.2 | ⬜ |
| Regression | `regression`, `logistic`, `glm`, `quantile`, `nonlinear`, `multinomial`, `countreg`, `ordinal`, `lmm`, `glmm`, `gee`, `pls`, `mars`, `iv`, `panel`, `selection`, `mediation`, `propensity` | 4 | F3.3, F4.1–F4.4 | ⬜ |
| Multivariate | `multivariate`, `cluster`, `canonical`, `mds`, `correspondence`, `sem`, `latentclass`, `irt`, `conjoint`, `discriminant` | 6 | F3.2, F5.1–F5.3 | ⬜ |
| Categorical | `chisquare`, `contingency`, `loglinear`, `agreement` | 2 | F3.2, F6.1 | ⬜ |
| Survival | `survival`, `cox`, `stratcox`, `tdcox`, `parametric`, `competing`, `recurrent`, `alt`, `reliability` | 2 | F1.1a–b, F7.1–F7.3b | ⬜ |
| Time series | `timeseries`, `var`, `garch`, `statespace` | 1 | F8.1, F8.2 | ⬜ |
| Design & power | `samplesize`, `resampling`, `doe` | 1 | F9.1 | ⬜ |
| Missing data | `mi`, `survey` | 1 | F9.2a | ⬜ |
| ML | `ml`, `text`, `choice` | 0 | F9.2b | ⬜ |
| Advanced | `bayes`, `meta`, `spatial` | 2 | F9.3a–b | ⬜ |
| Guided | `wizard` | 0 (per scelta) | — | ✅ |

---

## 4. Registro delle decisioni

| Data | Fase | Decisione | Motivo |
|---|---|---|---|
| 2026-11-03 | piano | Perimetro: audit + colmare i gap, non riscrittura | 321 grafici già presenti; il valore è nei 29 gap e nell'integrazione |
| 2026-11-03 | piano | Default LazStats + variante JMP opt-in | rispetta l'invariante "un solo default per kind" e la gallery |
| 2026-11-03 | piano | Ordine: ampiezza prima, poi profondità | ogni giorno il prodotto resta coerente |
| 2026-11-03 | piano | 3 nuove varianti JMP: `forest.jmp-ratio`, `survival.jmp-km`, `line.jmp-connected` | coprono i kind statisticamente più scoperti |
| 2026-11-03 | piano | Nessun nuovo kind salvo eccezione documentata (§10) | evita frammentazione del motore |
| 2026-11-03 | piano | Le traduzioni si fanno in F11.1a–b, non a ogni grafico | contiene il costo e mantiene le fasi a ~1 h |
| 2026-11-03 | piano | `tdcox` resta a 1 grafico (forest log) | il kernel non espone β(t); niente grafici finti |
| 2026-11-03 | piano | `competing` resta a 2 grafici (CIF + forest) | modello stimato per una causa alla volta |
| 2026-11-03 | piano | MSA: `msa-variance` resta l'unico grafico delle componenti; si aggiunge il profilo parte × operatore | il dettaglio per operatore non è scomposto dal kernel |

**Decisioni aperte** (da chiudere durante l'esecuzione):

- [ ] `msa-operator-profile`: le righe parte × operatore sono già nel runner;
      serve solo l'aggregazione (nessuna modifica al kernel).
- [ ] Banda CI su `reg-observed-fitted` per `k ≥ 2`: resta non obiettivo?
- [ ] `bayes-ppc`: quali modalità (`normal`, `proportion`, `rate`) copre?

---

## 5. Registro delle fasi completate

### F0.1 — Inventario, guardrail, stato

- **Stato**: ⬜ da iniziare
- **Obiettivo**: `scripts/chart-inventory.mjs`, doc inventario, test che vedono
  i sub-runner, questo documento.
- **File previsti**: `scripts/chart-inventory.mjs`, `package.json`,
  `docs/analysis/2026-11-03-inventario-grafici-72-procedure.md`,
  `src/charts/analysisKinds.test.ts`, `src/charts/copy.test.ts`.
- **Test**: `node --import tsx --test src/charts/analysisKinds.test.ts
  src/charts/copy.test.ts` + `npm run check`.
- **Esito**: —
- **Commit**: —

> Duplicare questa sezione per ogni fase conclusa, con: cosa è stato fatto,
> test, decisioni, file toccati, problemi, prossimi passi.

---

## 6. Grafici aggiunti / corretti

| Fase | id | Analisi | kind | Formato | Test | Stato |
|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — |

*(compilare a ogni fase; una riga per grafico)*

---

## 7. Prossimi 3 passi

1. Creare il branch `grafici-procedure` e aprire F0.1.
2. Implementare `scripts/chart-inventory.mjs` e verificare il totale 321.
3. Estendere `analysisKinds.test.ts` e `copy.test.ts` ai sub-runner; correggere
   le copy EN mancanti emerse.

---

## 8. Domande aperte

| # | Domanda | Impatto | Chi decide | Stato |
|---|---|---|---|---|
| 1 | `msa-operator-profile`: serve un helper kernel? | F2.2 | modello | chiusa: no, bastano le righe del runner |
| 2 | `bayes-ppc` copre tutte le modalità? | F9.3a | modello | aperta |
| 3 | La banda Actual by Predicted `k ≥ 2` resta fuori perimetro? | F4.4 | committente | aperta |

---

## 9. Rischi attivi

| Rischio | Stato | Mitigazione in corso |
|---|---|---|
| Copy EN mancante nei sub-runner | aperto | F0.1 estende `copy.test.ts` |
| File al limite di 700 righe | aperto | file per ondata, split |
| Forest log con IC ≤ 0 | aperto | regola in F10.1 |
| Cap 24 grafici per `mi` | aperto | conteggio in F9.2a |
| Fase che sfora l'ora | ricorrente | split e commit |

---

## 10. Handoff (template)

```md
## Handoff — <data> / <fase>

- **Branch**: <branch>
- **HEAD**: <sha> — <messaggio>
- **Fase**: <id> — <stato>
- **Fatto**: <bullet>
- **Test**: <comandi> → <esito>
- **Decisioni**: <bullet>
- **Prossimi 3 passi**: 1) ... 2) ... 3) ...
- **Domande aperte**: <bullet>
- **Rischi**: <bullet>
```

---

## 11. Chiusura

Da compilare in F11.3:

- [ ] Tutte le fasi ✅ o ⏭️ con motivo.
- [ ] `npm run check` verde.
- [ ] `npm run locales:check` verde.
- [ ] `npm run test:samples` verde.
- [ ] e2e editor/gallery verdi.
- [ ] `npm run build` verde.
- [ ] `docs/PROJECT-STATUS.md`, `docs/CHART-ENGINE.md`, inventario aggiornati.
- [ ] Debiti residui elencati qui sotto.

**Debiti residui**:

- —
