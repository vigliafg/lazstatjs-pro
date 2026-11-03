# Stato — Grafici delle procedure (piano LazStats/JMP)

- **Documento di piano**: `2026-11-03-grafici-procedure-piano.md`
- **Repository**: `/home/vigliafg/Documenti/GitHub/lazstatjs-pro`
- **Creato**: 2026-11-03
- **Ultimo aggiornamento**: 2026-11-03 (F3.3 chiusa, ondata O3 chiusa)
- **Fase corrente**: F4.1 — da iniziare
- **Deadline**: 10 giorni lavorativi, 4 h/giorno, fasi ≤ 60 min
- **Branch**: `grafici-procedure` (creato da `main` in F0.1)
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
| F0.1 | Inventario, guardrail, stato | 60 | ✅ | `feat(charts): F0.1 inventario grafici e guardrail su sub-runner` | 8 test mirati + `npm run check` verdi |
| F0.2 | 3 varianti JMP (`forest`, `survival`, `line`) | 60 | ✅ | `feat(charts): F0.2 tre varianti JMP` | 25 test + `locales:check` verdi |
| F1.1a | `factorial`: medie di cella | 45 | ✅ | `feat(charts): F1.1a medie di cella` | 11 test verdi |
| F1.1b | `recurrent`: mean cumulative function | 45 | ✅ | `feat(charts): F1.1b funzione cumulata media` | 11 test verdi |
| F1.2 | `tost` e chiusura ampiezza | 45 | ✅ | `feat(charts): F1.2 TOST a intervallo` | 22 test + inventory verdi |
| F2.1 | `descriptive`: frequenze cumulate, outlier strip | 60 | ✅ | `feat(charts): F2.1 Pareto e strip outlier` | 17 test verdi |
| F2.2 | `quality`: profilo operatore, contributi carta | 60 | ✅ | `feat(charts): F2.2 profilo parte per operatore` | 9 test + `check` verdi |
| F3.1 | varianze, sign, KS | 60 | ✅ | `feat(charts): F3.1 forest varianze, mediana e KS` | 15 test + help verdi |
| F3.2 | Mood, GOF, nested | 60 | ✅ | `feat(charts): F3.2 mediane Mood, componenti gerarchiche e contributi GOF` | 9 test + `check` e `locales:check` verdi |
| F3.3 | GLMM/GEE/LMM polish | 45 | ✅ | `feat(charts): F3.3 guide caterpillar per LMM, GLMM e GEE` | `check` + `locales:check` verdi |
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
| 2026-11-03 | F0.1 | `enChartCopy` include `en/charts-l4.ts` e il nuovo `en/charts-f0.ts` | senza il merge le card L4 in inglese ricadevano sull'italiano |
| 2026-11-03 | F0.1 | `copy.test.ts` verifica la catena reale di `copy()` (`enChartCopy` → `enReportCopy`) | molte stringhe dei runner sono già tradotte nel catalogo del report |
| 2026-11-03 | F0.1 | Le 211 stringhe EN mancanti stanno in un file per ondata (`en/charts-f0.ts`) | i cataloghi esistenti sono già al limite di 700 righe |
| 2026-11-03 | F0.2 | Tre varianti JMP opt-in: `forest.jmp-ratio`, `survival.jmp-km`, `line.jmp-connected` | convenzioni documentate, nessun cambio di default né di dati |
| 2026-11-03 | F0.2 | `line.jmp-connected` ha lo stesso patch di `markers` | il contratto del piano è quello; `matchingChartStyle` evidenzia `markers` come primo match |
| 2026-11-03 | F1.1a | `factorial-cells` riusa le medie di cella già in `series` | nessun nuovo calcolo nel kernel, solo il layer `intervals` |
| 2026-11-03 | F1.1b | MCF in forma Nelson–Aalen: eventi al tempo / soggetti a rischio, cumulati | è la definizione non parametrica del MCF per eventi ricorrenti |
| 2026-11-03 | F1.2 | Il layer `interval` disegna anche `regions` (rettangolo dietro le regole) | serve per la regione di equivalenza TOST ed è riusabile da ogni card interval |
| 2026-11-03 | F1.2 | `tost` resta a 1 grafico (sostituzione, non aggiunta) | §6.2 lo elenca come ♻️; il DoD F1.2 chiede solo `factorial`/`recurrent` a 2 e `tdcox` documentato |
| 2026-11-03 | F2.1 | La cumulata del Pareto si calcola nel runner dai conteggi del tally | il kernel di frequenza non espone la cumulata e il renderer non deve calcolarla |
| 2026-11-03 | F2.1 | Lo strip marca il valore segnalato con `flag: 1` nei dati e lo nomina nella nota | il layer `dot` non ha un colore per punto; niente nuovo kind né layer ad hoc |
| 2026-11-03 | F2.2 | `msa-operator-profile` usa le righe parte/operatore già nel ramo MSA | nessuna modifica al kernel `msa` |
| 2026-11-03 | F2.2 | `mcontrol-contribution` spostato a F2.3 | il kernel `mcontrol` non espone i contributi per variabile: serve una modifica kernel > 30 min |
| 2026-11-03 | F3.1 | Riuso `medianCI` di `stats/kernels/distributions` invece di un nuovo helper in `kits/common` | il piano chiedeva un helper nuovo, ma esiste già con test |
| 2026-11-03 | F3.2 | `mood-median-ci` applica `medianCI` alle osservazioni di ogni gruppo, non alla mediana comune | il test Mood confronta i conteggi sopra/sotto la mediana comune; l’intervallo descrive la mediana del gruppo |
| 2026-11-03 | F3.2 | `nested-variance` legge `varianceComponents` del kernel `nestedAnova` | nessun nuovo calcolo né modifica kernel |
| 2026-11-03 | F3.2 | `gof-contribution` calcola (O−E)²/E nel runner e ordina le barre in modo decrescente | il kernel `goodnessOfFit` espone già observed/expected; con `sort: 'none'` il layer Pareto non riordina |
| 2026-11-03 | F3.3 | Nessun nuovo grafico: i caterpillar avevano già `sort: 'asc'`, IC e linea dello zero | il polish richiesto è la lettura corretta nelle guide, non un altro kind |

**Decisioni aperte** (da chiudere durante l'esecuzione):

- [ ] `msa-operator-profile`: le righe parte × operatore sono già nel runner;
      serve solo l'aggregazione (nessuna modifica al kernel).
- [ ] Banda CI su `reg-observed-fitted` per `k ≥ 2`: resta non obiettivo?
- [ ] `bayes-ppc`: quali modalità (`normal`, `proportion`, `rate`) copre?

---

## 5. Registro delle fasi completate

### F0.1 — Inventario, guardrail, stato

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**:
  - `scripts/chart-inventory.mjs` (+ script `chart:inventory`): scansione
    statica di `src/analyses/*/`, opzioni `--analysis <id>` e `--json`.
  - `docs/analysis/2026-11-03-inventario-grafici-72-procedure.md`: 321 modelli,
    71 analisi con grafici, 32 kind; sostituisce l'inventario del 2026-10-30.
  - `analysisKinds.test.ts`: legge tutti i moduli non-test dell'analisi, non
    solo `run.tsx` (sub-runner inclusi), estraendo i kind dalle chiamate
    `makeChart`.
  - `copy.test.ts`: scansione ricorsiva di `src/analyses`, catalogo risolto
    `enChartCopy` + fallback `enReportCopy` (la catena reale di `copy()`).
  - `catalog/charts.ts`: `enChartCopy` ora include `en/charts-l4.ts` (prima le
    card L4 in inglese ricadevano sull'italiano) e `en/charts-f0.ts` con le
    211 stringhe EN che non avevano sorgente inglese.
- **File toccati**: `scripts/chart-inventory.mjs`, `package.json`,
  `docs/analysis/2026-11-03-inventario-grafici-72-procedure.md`,
  `src/charts/analysisKinds.test.ts`, `src/charts/copy.test.ts`,
  `src/stats/reportCopy/catalog/charts.ts`,
  `src/stats/reportCopy/catalog/en/charts-f0.ts`.
- **Test**: `node --import tsx --test src/charts/analysisKinds.test.ts
  src/charts/copy.test.ts` → 8/8 verdi; `npm run check` → verde.
- **Esito**: inventario ripetibile (321, invariato), test che vedono i
  sub-runner, nessuna modifica ai grafici.
- **Commit**: `feat(charts): F0.1 inventario grafici e guardrail su sub-runner`

### F0.2 — Tre varianti JMP (`forest`, `survival`, `line`)

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**:
  - `forest.jmp-ratio`: `{ logScale: true, reference: 'one' }`, origine `jmp`.
  - `survival.jmp-km`: `{ step: true, showCI: true, showCensoring: true, showMedian: true }`.
  - `line.jmp-connected`: `{ step: false, showMarkers: true }`.
  - Etichette e hint `chart.style.jmp*` nelle 6 lingue.
  - Test pin in `styles.test.ts`; la gallery compila tutte le tile in
    `buildSpec.test.ts`.
- **File toccati**: `src/charts/styles.ts`, `src/charts/styles.test.ts`,
  `src/i18n/catalog/{en,it,fr,es,de,pt-PT}/analysis.ts`, documento di stato,
  piano §5.3.
- **Test**: `styles.test.ts` + `buildSpec.test.ts` → 25/25 verdi;
  `locales:check` verde sulle 6 lingue.
- **Nota**: `jmp-connected` condivide il patch con lo stile generico
  `markers`; la tile è selezionabile ma la gallery evidenzia `markers` come
  primo match (stesse opzioni, nessuna ambiguità di dati).
- **Commit**: `feat(charts): F0.2 tre varianti JMP`

**Mappa "procedura → stile JMP"** (applicazione in F10.1):

| Uso | Stile | Procedure |
|---|---|---|
| Forest dei rapporti (HR, OR, RR, IRR) | `jmp-ratio` | `cox`, `stratcox`, `tdcox`, `countreg`, `logistic`, `ordinal`, `gee`, `meta` |
| Curve di sopravvivenza | `jmp-km` | `survival`, `stratcox`, `parametric` (`survival-life-curve`) |
| Serie osservate con marker | `jmp-connected` | `timeseries` (`ts-arima-chart`, `hw-series`), `var` (`var-irf-chart`) |

### F1.1a — `factorial`: medie di cella

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**: `factorial-cells` [interval] costruito dalle medie di cella già in
  `series` (una riga per cella popolata, con IC); `interval` aggiunto ai kind
  dell'analisi; copy IT/EN e help IT/EN.
- **File toccati**: `src/analyses/factorial/run.tsx`,
  `src/analyses/factorial/charts.test.ts` (nuovo), `src/charts/analysisKinds.ts`,
  `src/stats/reportCopy/catalog/en/charts-w10.ts` (nuovo),
  `src/stats/reportCopy/catalog/charts.ts`, `src/help/content/{it,en}/charts.ts`.
- **Test**: `factorial/charts.test.ts` + `run.test.ts` + `analysisKinds.test.ts`
  + `copy.test.ts` → 11/11 verdi; `locales:check en` verde.
- **Nota**: il grafico compare solo se almeno una cella ha l'IC (n > 1).
- **Commit**: `feat(charts): F1.1a medie di cella`

### F1.1b — `recurrent`: mean cumulative function

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**: `meanCumulativeFunction` nel kernel `recurrent` (forma
  Nelson–Aalen: eventi al tempo / soggetti a rischio, cumulati) con test
  numerico su tempi noti; `recurrent-mcf` [line] emesso dal runner;
  `line` aggiunto ai kind; copy EN e help IT/EN.
- **File toccati**: `src/stats/kernels/recurrent.ts`,
  `src/stats/kernels/recurrent.test.ts` (nuovo), `src/analyses/recurrent/run.tsx`,
  `src/analyses/recurrent/charts.test.ts` (nuovo), `src/charts/analysisKinds.ts`,
  `src/stats/reportCopy/catalog/en/charts-w10.ts`, `src/help/content/{it,en}/charts.ts`.
- **Test**: kernel MCF (1/3, 2/3, 7/6, 13/6 su tempi noti) + chart test +
  `analysisKinds` + `copy` → 11/11 verdi.
- **Nota**: `recurrent` passa a 2 grafici; il forest resta condizionato alla
  presenza di covariate, il MCF è sempre disponibile.
- **Commit**: `feat(charts): F1.1b funzione cumulata media`

### F1.2 — `tost` e chiusura ampiezza

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**: `tost-difference` passa da `bar` a `interval`: punto = differenza,
  segmento = IC, regole tratteggiate ai margini, fascia della regione di
  equivalenza. Il layer `interval` ora disegna `regions` (rettangolo dietro le
  regole), con test di compilazione. Copy EN e help IT/EN aggiornati.
- **File toccati**: `src/analyses/tost/run.tsx`,
  `src/analyses/tost/charts.test.ts` (nuovo), `src/charts/vega/descriptiveLayers.ts`,
  `src/charts/vega/buildSpec.test.ts`, `src/charts/analysisKinds.ts`,
  `src/stats/reportCopy/catalog/en/charts-w10.ts`,
  `src/stats/reportCopy/catalog/en/charts-remaining.ts`,
  `src/help/content/{it,en}/charts.ts`,
  `docs/analysis/2026-11-03-inventario-grafici-72-procedure.md`.
- **Test**: TOST + buildSpec + copy + analysisKinds → 22/22 verdi;
  `chart:inventory` → 323 modelli; restano con un solo grafico `tdcox`
  (limite §6.4) e `tost` (sostituzione ♻️, non aggiunta).
- **Scostamento dal piano**: il passo 3 di §F1.2 parla di "solo `tdcox` a un
  grafico", ma la matrice §6.2 assegna a `tost` una sostituzione e il DoD
  chiede solo `factorial`/`recurrent` a 2. Nessun secondo grafico inventato.
- **Commit**: `feat(charts): F1.2 TOST a intervallo`

### F2.1 — `descriptive`: frequenze cumulate e outlier

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**: `freq-cumulative` [pareto] dalla prima variabile categorica (conteggi
  decrescenti + cumulata calcolata nel runner); `outliers-strip` [dot] per le
  prime due variabili con test di Grubbs/Dixon, jitter deterministico
  (`jmp-strip`) e `flag: 1` sul valore segnalato; `pareto` aggiunto ai kind.
- **File toccati**: `src/analyses/descriptive/run.tsx`,
  `src/analyses/descriptive/modes.test.ts`, `src/charts/analysisKinds.ts`,
  `src/stats/reportCopy/catalog/en/charts-w10.ts`,
  `src/help/content/{it,en}/charts.ts`.
- **Test**: `modes.test.ts` + `run.test.ts` + `copy` + `analysisKinds` → 17/17
  verdi.
- **Nota**: lo strip non ricolora il punto segnalato (il layer `dot` ha un solo
  colore); il flag resta nei dati e la nota rimanda alla tabella.
- **Commit**: `feat(charts): F2.1 Pareto e strip outlier`

### F2.2 — `quality`: profilo parte × operatore

- **Stato**: ✅ chiusa (2026-11-03); ondata O2 chiusa con `npm run check` verde
- **Fatto**: `msa-operator-profile` [line] con una serie per operatore e le medie
  parte × operatore già calcolate nel ramo MSA; help IT/EN.
- **Rinviato**: `mcontrol-contribution` [bar] a F2.3 — il kernel `mcontrol`
  restituisce solo `points.t2/out` e i contributi per variabile richiedono una
  modifica kernel (oltre il budget di 30 min previsto dal piano).
- **Verificato**: `cusum-chart` mostra già i limiti `h` e 0 via `rules`;
  `quality` dichiara già `line`, nessuna modifica a `analysisKinds`.
- **File toccati**: `src/analyses/quality/run.tsx`,
  `src/analyses/quality/charts.test.ts` (nuovo),
  `src/stats/reportCopy/catalog/en/charts-w10.ts`,
  `src/help/content/{it,en}/charts.ts`.
- **Test**: quality + copy + analysisKinds → 9/9 verdi; `npm run check` verde.
- **Commit**: `feat(charts): F2.2 profilo parte per operatore`

### F3.1 — Varianze, segni, KS

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**: `var-ratio-forest` [forest] su scala log con riferimento 1
  (`ratio`, `fLo`, `fHi` del kernel); `sign-ci` [interval] con mediana delle
  differenze e IC per ordine-statistiche (`medianCI` riusato); `ks-diff` [line]
  con la differenza F₁ − F₂ e il punto di massimo evidenziato.
- **File toccati**: `src/analyses/variances/run.tsx`, `src/analyses/ttest/run.tsx`,
  `src/analyses/distfit/run.tsx`, i rispettivi test, `src/charts/analysisKinds.ts`,
  `src/stats/reportCopy/catalog/en/charts-w10.ts`,
  `src/help/content/{en,it,fr,es,de,pt-PT}/charts.ts`.
- **Test**: variances + sign + ks + copy + analysisKinds → 15/15 verdi; help
  allineato nelle 6 lingue.
- **Commit**: `feat(charts): F3.1 forest varianze, mediana e KS`

### F3.2 — Mood, GOF, nested

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**:
  - `mood-median-ci` [interval]: mediane di gruppo con IC per
    ordine-statistiche (`medianCI`), accanto al box del test Mood.
  - `nested-variance` [bar]: componenti esterno/interno/residuo da
    `varianceComponents` del kernel `nestedAnova`.
  - `gof-contribution` [pareto]: (O − E)² / E per categoria, con cumulata
    calcolata nel runner, nel test di bontà di adattamento.
- **File toccati**: `src/analyses/anova/run.tsx`, `src/analyses/anova/nested.ts`,
  `src/analyses/anova/mood.test.ts`, `src/analyses/anova/w2.test.ts`,
  `src/analyses/chisquare/run.tsx`, `src/analyses/chisquare/gof.test.ts`,
  `src/charts/analysisKinds.ts`,
  `src/stats/reportCopy/catalog/en/charts-w10.ts`,
  `src/help/content/{en,it,fr,es,de,pt-PT}/charts.ts`.
- **Test**: mood + nested + gof → 9/9 verdi; `npm run check` verde;
  `locales:check` verde sulle 6 lingue.
- **Commit**: `feat(charts): F3.2 mediane Mood, componenti gerarchiche e contributi GOF`

### F3.3 — GLMM/GEE/LMM: polish e caterpillar

- **Stato**: ✅ chiusa (2026-11-03); ondata O3 chiusa con gate verde
- **Verificato**: `lmm-random-effects`, `lmm-random-slopes`,
  `lmm-random-intercepts`, `glmm-random-effects`, `glmm-random-slopes` e
  `gee-cluster-residuals` sono già caterpillar: `sort: 'asc'` sull’effetto,
  IC approssimato e `rules: [{ value: 0 }]` disegnato dal layer `interval`.
  Nessuna modifica ai runner.
- **Fatto**: `chartGuides` allineate nelle 6 lingue per `lmm` e `gee` (ora
  citano caterpillar, residui per cluster e forest dei rapporti di incidenza)
  e nuova guida `glmm`, che prima mancava in tutte le lingue.
- **File toccati**: `src/help/content/{en,it,fr,es,de,pt-PT}/charts.ts`.
- **Test**: `npm run check` verde (exit 0); `locales:check` verde sulle 6
  lingue.
- **Commit**: `feat(charts): F3.3 guide caterpillar per LMM, GLMM e GEE`

> Duplicare questa sezione per ogni fase conclusa, con: cosa è stato fatto,
> test, decisioni, file toccati, problemi, prossimi passi.

---

## 6. Grafici aggiunti / corretti

| Fase | id | Analisi | kind | Formato | Test | Stato |
|---|---|---|---|---|---|---|
| F1.1a | `factorial-cells` | `factorial` | `interval` | LZ | `factorial/charts.test.ts` | ✅ |
| F1.1b | `recurrent-mcf` | `recurrent` | `line` | JMP | `kernels/recurrent.test.ts` | ✅ |
| F1.2 | `tost-difference` ♻️ | `tost` | `interval` | JMP | `tost/charts.test.ts` | ✅ |
| F2.1 | `freq-cumulative` | `descriptive` | `pareto` | JMP | `descriptive/modes.test.ts` | ✅ |
| F2.1 | `outliers-strip` | `descriptive` | `dot` | JMP | `descriptive/modes.test.ts` | ✅ |
| F2.2 | `msa-operator-profile` | `quality` | `line` | JMP | `quality/charts.test.ts` | ✅ |
| F3.1 | `var-ratio-forest` | `variances` | `forest` | JMP | `variances/run.test.ts` | ✅ |
| F3.1 | `sign-ci` | `ttest` | `interval` | JMP | `ttest/sign.test.ts` | ✅ |
| F3.1 | `ks-diff` | `distfit` | `line` | JMP | `distfit/ks.test.ts` | ✅ |
| F3.2 | `mood-median-ci` | `anova` | `interval` | JMP | `anova/mood.test.ts` | ✅ |
| F3.2 | `nested-variance` | `anova` | `bar` | LZ | `anova/w2.test.ts` | ✅ |
| F3.2 | `gof-contribution` | `chisquare` | `pareto` | JMP | `chisquare/gof.test.ts` | ✅ |

*(compilare a ogni fase; una riga per grafico)*

---

## 7. Prossimi 3 passi

1. F4.1: stepwise, polinomiale e penalizzata in `regression` (#11).
2. F4.2: `multinomial` (#12), `iv` (#13), `pls` (#14).
3. Gate di fine ondata O4 con `npm run check`, `locales:check` e inventario
   statico aggiornato.

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
| Copy EN mancante nei sub-runner | chiuso in F0.1 | `copy.test.ts` esteso; 211 stringhe EN aggiunte in `en/charts-f0.ts` |
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
