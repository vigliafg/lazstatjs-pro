# Stato — Grafici delle procedure (piano LazStats/JMP)

- **Documento di piano**: `2026-11-03-grafici-procedure-piano.md`
- **Repository**: `/home/vigliafg/Documenti/GitHub/lazstatjs-pro`
- **Creato**: 2026-11-03
- **Ultimo aggiornamento**: 2026-11-03 (F8.1, F8.2 e F9.1 chiuse)
- **Fase corrente**: F9.2a — survey e MI
- **Deadline**: 10 giorni lavorativi, 4 h/giorno, fasi ≤ 60 min
- **Branch**: `grafici-procedure` (creato da `main` in F0.1)
- **HEAD al momento della baseline**: `48ed3c0` — `ci(release): evita il DMG macOS non creabile sul runner`
- **Versione**: `0.19.0`

## Ripresa rapida (2026-11-03, fine sessione)

- **Ultimo commit**: `feat(charts): F9.1 matrice di alias del disegno DOE`.
- **Chiuso**: F0.1 → F9.1. O8 chiusa con `npm run check` exit 0; F9.1 con gate
  mirato: 30 test (doe, samplesize, resampling, copy, analysisKinds,
  buildSpec), `tsc --noEmit` exit 0, `check-locale` verde su
  it/en/fr/es/de/pt-PT, `help:build` con 498 topic in 6 lingue.
- **Da riprendere**: **F9.2a** (survey e MI), poi F9.2b.
- **Debito aperto e noto**: le note nuove di `alt-life-stress` e delle tre
  modalità di `timeseries` esistono solo in inglese; le altre lingue ricadono su
  EN e vanno chiuse in F11.1a–b (nei cataloghi `<locale>/charts-extra.ts`
  restano le voci vecchie delle note riscritte, ora non più usate).
- **Non committato di proposito**: `AVVIO-AGENTE-GRAFICI.md` e i PDF `jmp*.pdf`
  restano fuori dal versionamento (istruzione del file di avvio).
- **Albero di lavoro**: pulito tranne quei file non tracciati; branch
  `grafici-procedure`.

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
| F4.1 | stepwise, polynomial, penalized | 60 | ✅ | `feat(charts): F4.1 coefficienti del modello selezionato` | 6 test + `check` e `locales:check` verdi |
| F4.2 | multinomial, IV, PLS | 60 | ✅ | `feat(charts): F4.2 confusione, primo stadio e loadings PLS` | 21 test + `check` e `locales:check` verdi |
| F4.3 | logistica, conteggi, ordinale | 45 | ✅ | `feat(charts): F4.3 foreste su scala log e link dichiarato` | 3 test + `check` e `locales:check` verdi |
| F4.4 | diagnostica di regressione | 45 | ✅ | `feat(charts): F4.4 verifica stili JMP della regressione` | 8 test + `check` e `locales:check` verdi |
| F5.1 | cluster, canonical, MDS, correspondence | 60 | ✅ | `feat(charts): F5.1 silhouette, scatter dei cluster e correlazioni canoniche` | 3 test + `check` e `locales:check` verdi (MDS/correspondence già a 2 grafici) |
| F5.2a | SEM, latent class | 45 | ✅ | `feat(charts): F5.2a adeguamento SEM e certezza delle classi latenti` | 2 test + `check` e `locales:check` verdi |
| F5.2b | IRT ICC, conjoint | 30 | ✅ | `feat(charts): F5.2b curve caratteristiche degli item` | 2 test + `check` e `locales:check` verdi (conjoint già a 2 grafici) |
| F5.3 | PCA/EFA/alpha e pannelli | 45 | ✅ | `feat(charts): F5.3 guide di PCA, EFA e alpha` | `check` + `locales:check` verdi; inventario rigenerato |
| F6.1 | esatti, trend, verifica MH | 45 | ✅ | `feat(charts): F6.1 osservati e attesi nel test esatto` | 2 test + `check` e `locales:check` verdi |
| F7.1 | life table, competing, frailty, recurrent | 45 | ✅ | `feat(charts): F7.1–F7.2 sopravvivenza, rischi competitivi e foreste su scala log` | 17 test + `check` e `locales:check` verdi |
| F7.2 | Cox, stratified, time-dependent | 45 | ✅ | idem (commit unico: i cataloghi sono condivisi) | 17 test + `check` e `locales:check` verdi |
| F7.3a | ALT: life-stress plot | 45 | ✅ | `feat(charts): F7.3a life-stress plot e verifica parametriche` | 8 test + `check` verdi |
| F7.3b | parametric, reliability | 30 | ✅ | idem (solo verifica, nessuna modifica) | `check` verde, 7 grafici parametrici coerenti |
| F8.1 | Holt-Winters, unit root, spettrale | 45 | ✅ | `feat(charts): F8.1 Holt-Winters, radici unitarie e spettrale` | 16 test + `lint` + `locales:check` + `help:build` verdi |
| F8.2 | VAR, GARCH, state-space | 60 | ✅ | `feat(charts): F8.2 Q-Q dei residui GARCH` | 23 test + `lint` + `locales:check` + `help:build` verdi |
| F9.1 | sample size, resampling, DOE | 60 | ✅ | `feat(charts): F9.1 matrice di alias del disegno DOE` | 30 test + `lint` + `locales:check` + `help:build` verdi |
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
| 2026-11-03 | F4.1 | `selection-coefficients` mostra solo i predittori scelti, non l’intercetta | l’intercetta resta nella tabella e schiaccerebbe la scala delle barre |
| 2026-11-03 | F4.1 | Niente banda CI su `polynomial-curve` | `polynomialCurve` restituisce solo `{x, y}`: il kernel non espone `seMean` e aggiungerlo è fuori budget |
| 2026-11-03 | F4.1 | Niente `penalized-cv` | `penalizedPath` restituisce i fit, non gli errori di cross-validazione |
| 2026-11-03 | F4.2 | `pls-loadings` mostra solo i loadings X | `PlsResult` espone `components[].loading` (X); i loadings Y non esistono come campo separato |
| 2026-11-03 | F4.2 | La matrice di confusione usa `sort: 'none'` | le classi devono restare nell’ordine del modello, non riordinate per margine |
| 2026-11-03 | F4.2 | Test aggiunti ai `run.test.ts` esistenti invece di nuovi `charts.test.ts` | stessi fixture e stesso kernel: un file per analisi avrebbe duplicato i dati |
| 2026-11-03 | F4.3 | I forest di IRR/OR hanno `logScale: true` nel runner | allinea i tre runner alla variante `forest.jmp-ratio` senza cambiare il default del kind |
| 2026-11-03 | F4.3 | Il link della logistica compare nel sottotitolo e la nota probit cita Φ(η) | il grafico deve dire quale curva sta disegnando |
| 2026-11-03 | F4.4 | Nessun cambio ai runner: `reg-scatter` porta già `meanY` e `grid.seMean`, `reg-residual-fitted` porta `residSd` | le varianti `jmp-regression` e `jmp-residual` sono selezionabili senza forzare il default del kind |
| 2026-11-03 | QA | Lo scatter accetta `series` come osservazioni quando `points` manca | tre runner (IV, polinomio) passavano solo `series`: le card erano vuote e i test non lo vedevano |
| 2026-11-03 | QA | Il Pareto accetta la cumulata sia come `category` sia come `x` | i runner esistenti usano `x`; il layer leggeva solo `category` |
| 2026-11-03 | F5.1 | `silhouetteByCluster` è una funzione pura nel kernel, non un campo di `ClusterResult` | il kernel esponeva solo la media globale; il dettaglio per cluster serve ai grafici e ai test |
| 2026-11-03 | F5.1 | `cluster-scatter` usa le prime due variabili, non le componenti principali | il piano esclude una PCA; la nota lo dichiara esplicitamente |
| 2026-11-03 | F5.2a | `sem-fit` affianca modello e soglia per indice, invece di una linea di riferimento | CFI (≥0,95) e RMSEA (≤0,06) hanno soglie su scale diverse: la coppia di barre le rende confrontabili |
| 2026-11-03 | F5.2a | `latentclass-entropy` mostra per classe la quota di casi con posterior ≥ 0,80; l’entropia va nel sottotitolo | un indice globale in un grafico a barre avrebbe una sola barra, senza informazione per classe |
| 2026-11-03 | F5.2b | La ICC è `iccProbability(a, b, θ)` nel kernel, con test su soglia 0,5 e monotonia | il piano chiede una funzione pura testata; il grafico deve usare la stessa formula del kernel |
| 2026-11-03 | F5.2b | Nessun cambio a `conjoint`: utilità per attributo e importanza % sono già ordinate e spiegate | la fase chiedeva solo la verifica |
| 2026-11-03 | F5.3 | `pca-loadings` (heatmap) e `pca-loading-plot` (scatter) restano entrambi | scelta dell’utente, documentata nella guida: confronto tra variabili vs direzione |
| 2026-11-03 | F6.1 | Nessuna banda sul `contingency-trend-line` | `cochranArmitageTrend` restituisce solo la statistica complessiva e le proporzioni, non l’incertezza per riga: la nota lo dichiara |
| 2026-11-03 | F6.1 | Il forest MH resta uno solo, con `logScale: false` e riferimento 0 | il piano vieta un secondo forest; l’asse dichiara il log-OR, non l’OR |
| 2026-11-03 | F7.1 | Note di life table, CIF e forest di sottodistribuzione riscritte; nessun grafico nuovo | la fase chiedeva l’allineamento delle note: mancava la differenza tavola/KM e il motivo per cui non esiste una CIF impilata |
| 2026-11-03 | F7.2 | `cox-forest`, `stratcox-forest`, `tdcox-forest` e `frailty-forest` passano a `logScale: true` con riferimento 1 | su scala lineare gli HR protettivi si comprimono attorno allo zero, come già valeva per logistica e conteggi |
| 2026-11-03 | F7.2 | `tdcox` resta a un grafico: nessun β(t) | il kernel riporta solo le stime per intervallo; un grafico dell’effetto nel tempo richiederebbe un β(t) che non esiste (dichiarato in help e nella nota) |
| 2026-11-03 | F7.1–F7.2 | Commit unico per le due fasi | i cataloghi `en/charts*.ts` contengono voci di entrambe: separarle lascerebbe un commit con traduzioni non usate e il test del copy rosso |
| 2026-11-03 | F7.3a | Il life-stress plot usa coordinate trasformate, non un asse log del grafico | lo scatter non espone una scala log sull’asse: x è la trasformazione del modello e y è log10 del tempo, così la relazione AFT diventa retta |
| 2026-11-03 | F7.3a | La retta è ancorata alla media dei punti, non all’intercetta del modello | il fit non espone le medie delle covariati: con l’ancoraggio la pendenza resta quella stimata e la nota dichiara che le covariati spostano solo l’intercetta |
| 2026-11-03 | F7.3a | Nuove stringhe di copy solo in inglese | il test L4 controlla le locale dei report, non le note di questo grafico; le altre lingue ricadono sull’inglese, da tradurre in F11.1a–b |
| 2026-11-03 | F8.1 | Il trend di `unitroot-series` è calcolato nel runner da `linearTrendLine` (funzione pura esportata), non nel kernel | `unitRootTests` non espone la retta usata dall’ADF/KPSS e una modifica kernel sarebbe fuori budget; i due estremi della retta bastano al layer `line` |
| 2026-11-03 | F8.1 | La nota di `unitroot-series` riporta ADF, valore critico 5% e p | il piano chiede la statistica nella nota; con il critico il lettore vede subito se la serie è borderline |
| 2026-11-03 | F8.1 | La nota di `spectral-density` nomina periodo di picco, Fisher g e p | una nota generica non dice dove guardare: il picco dominante è il dato che il grafico deve comunicare |
| 2026-11-03 | F8.1 | `hw-series` marca le osservazioni con i marker e tiene la banda sul solo forecast | le tre serie sono altrimenti indistinguibili; la banda resta l’intervallo di previsione (il kernel fornisce `lo`/`hi` solo per il forecast) |
| 2026-11-03 | F8.2 | `garch-qq` usa `qqPoints`/`qqReference`/`qqBand` di `kits/common`, non helper nuovi | sono gli stessi usati da `countreg` e dagli altri Q-Q: una sola definizione di punti, retta ed envelope |
| 2026-11-03 | F8.2 | La banda del Q-Q GARCH usa il `ciLevel` della procedura | l’envelope è un intervallo, quindi deve seguire il livello scelto dall’utente, non un 95% fisso |
| 2026-11-03 | F8.2 | Jarque–Bera va nel sottotitolo, non in un grafico | il kernel espone solo statistica e p; un istogramma dei residui non aggiungerebbe informazione alla diagonale |
| 2026-11-03 | F9.1 | La matrice di alias è la correlazione tra i termini del disegno (effetti principali + interazioni a due vie), calcolata nel runner da `designAliasCells` | il kernel del disegno restituisce solo le colonne codificate; la correlazione è pura algebra e non richiede una modifica kernel |
| 2026-11-03 | F9.1 | Oltre quattro fattori la matrice si limita agli effetti principali | con 7 fattori i termini diventano 28 e la heatmap non è più leggibile; la nota lo dichiara |
| 2026-11-03 | F9.1 | `samplesize` e `resampling` restano ai tre grafici ciascuno, con un’asserzione sui loro id nei test | la fase chiedeva la verifica: il test blocca l’aggiunta o la perdita silenziosa di un grafico |

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

### F4.1 — Stepwise, polynomial, penalized

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**: `selection-coefficients` [bar] con i coefficienti del modello scelto
  dalla selezione e il loro IC (`error: 'ci'`, regola a zero), più la nota che
  spiega come leggere le barre che attraversano lo zero.
- **Verificato**: `polynomial-curve`/`polynomial-residuals` e
  `penalized-path`/`penalized-coefficients-chart` sono già presenti e coerenti;
  banda CI e curva di cross-validazione restano fuori perché i kernel non
  espongono `seMean` né gli errori CV (annotato nelle guide).
- **File toccati**: `src/analyses/regression/selection.ts`,
  `src/analyses/regression/charts.test.ts` (nuovo),
  `src/stats/reportCopy/catalog/en/charts-w10.ts`,
  `src/help/content/{en,it,fr,es,de,pt-PT}/charts.ts`.
- **Test**: regression charts + w2 → 6/6 verdi; `npm run check` verde;
  `locales:check` verde sulle 6 lingue.
- **Commit**: `feat(charts): F4.1 coefficienti del modello selezionato`

### F4.2 — Multinomial, IV, PLS

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**:
  - `multinomial-confusion` [heatmap]: celle osservato × predetto con i
    conteggi, diagonale = classificazioni corrette.
  - `iv-first-stage` [scatter]: una serie per strumento contro la prima
    variabile endogena, per vedere a occhio la forza dello strumento.
  - `pls-loadings` [heatmap]: loading di ogni predittore su ogni componente;
    `analysisKinds.pls` dichiara ora `heatmap`.
- **File toccati**: `src/analyses/multinomial/run.tsx` e `run.test.ts`,
  `src/analyses/iv/run.tsx` e `run.test.ts`, `src/analyses/pls/run.tsx` e
  `run.test.ts`, `src/charts/analysisKinds.ts`,
  `src/stats/reportCopy/catalog/en/charts-w10.ts`,
  `src/help/content/{en,it,fr,es,de,pt-PT}/charts.ts` (nuove guide per
  `multinomial`, `iv`, `pls`).
- **Test**: multinomial + iv + pls + copy + analysisKinds → 21/21 verdi;
  `npm run check` verde; `locales:check` verde sulle 6 lingue.
- **Commit**: `feat(charts): F4.2 confusione, primo stadio e loadings PLS`

### F4.3 — Logistica, conteggi, ordinale

- **Stato**: ✅ chiusa (2026-11-03)
- **Verificato**: il kernel `logistic` usa già la stessa curva per logit e probit
  (`sigmoid` vs `Φ`); i forest di IRR/OR avevano `reference: 'one'` ma non la
  scala log.
- **Fatto**: `logScale: true` nei forest `count-irr-forest`,
  `ordinal-or-forest` e `logistic-or-forest`; sottotitolo della logistica con
  il link dichiarato e nota probit che cita Φ(η) al posto della logistica;
  `chartGuides` aggiornate nelle 6 lingue per `logistic`, `countreg`,
  `ordinal`.
- **File toccati**: `src/analyses/logistic/run.tsx`,
  `src/analyses/countreg/run.tsx`, `src/analyses/ordinal/run.tsx`,
  `src/stats/reportCopy/catalog/en/charts-w10.ts`,
  `src/help/content/{en,it,fr,es,de,pt-PT}/charts.ts`.
- **Test**: logistic + countreg + ordinal → 3/3 verdi; `npm run check`
  verde; `locales:check` verde sulle 6 lingue.
- **Commit**: `feat(charts): F4.3 foreste su scala log e link dichiarato`

### F4.4 — Diagnostica di regressione

- **Stato**: ✅ chiusa (2026-11-03); ondata O4 chiusa con gate verde
- **Verificato**:
  - `reg-scatter` (k = 1) porta `stats.meanY` e `data.grid` con
    `seMean`/`sePred`: la variante `scatter.jmp-regression` è disponibile e
    limitata a `regression`.
  - `reg-observed-fitted` (k ≥ 2) resta punti + diagonale, senza banda: non
    obiettivo documentato.
  - `reg-residual-fitted` porta `stats.residSd`, quindi `residual.jmp-residual`
    è selezionabile e la banda ±2 SD usa il campo già calcolato.
  - Gli id usati da `regressionDiagnosticPanel` non cambiano.
- **Fatto**: test in `src/analyses/regression/charts.test.ts` che verifica la
  disponibilità dei due stili (e il filtro per analisi) sui grafici reali.
- **Test**: regression charts + panels → 8/8 verdi; `npm run check` verde;
  `locales:check` verde sulle 6 lingue.
- **Commit**: `feat(charts): F4.4 verifica stili JMP della regressione`

### QA visiva — contact sheet dei nuovi grafici

- **Stato**: ✅ chiusa (2026-11-03)
- **Metodo**: `scripts/chart-qa.mjs` esegue i builder reali su 7 fixture, compila
  gli stessi spec dell’app con `buildVegaSpec` e scrive una pagina statica
  (Vega + Vega-Lite + vega-embed da `node_modules`); Playwright (`chrome`)
  produce uno screenshot full-page, poi ispezionato a riquadri.
- **Difetti trovati e corretti**:
  1. `iv-first-stage` (e `iv-observed-fitted`, `polynomial-curve`) erano
     **vuoti**: `scatterLayers` leggeva solo `data.points`, mentre quei runner
     passano una tabella lunga `data.series`. Ora lo scatter legge `series`
     quando `points` è assente e colora per `series`.
  2. La cumulata del Pareto era una linea verticale sull’ultima categoria:
     `paretoLayers` leggeva solo la chiave `category`, mentre i runner emettono
     `x`. Ora accetta entrambe.
  3. `selection-coefficients` diceva “1 predittori”: aggiunto il singolare.
  4. `mood-median-ci` sovrapponeva le etichette di valore all’intervallo:
     `valueLabels` disattivato (i numeri restano nella tabella).
- **Verificato dopo il fix**: IV mostra le due serie Z1/Z2, il Pareto ha la
  cumulata monotona 40→100, il sottotitolo è corretto.
- **Test**: `layers.test.ts` copre scatter da `series` e cumulata con chiave
  `x`; `npm run check` e `locales:check` verdi.
- **Commit**: `fix(charts): QA visiva, scatter da series e cumulata del Pareto`

### F5.1 — Cluster, canonical, MDS, correspondence

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**:
  - `silhouetteByCluster` nel kernel `cluster`: silhouette media per cluster con
    la stessa definizione della media globale, con test su due gruppi separati.
  - `cluster-silhouette` [bar] e `cluster-scatter` [scatter] (prime due
    variabili, colore per cluster, nota che esclude la PCA); `analysisKinds`
    di `cluster` dichiara ora `scatter`.
  - `canonical-corr` [bar] con le correlazioni canoniche per funzione.
- **Verificato**: MDS e correspondence avevano già due grafici ciascuna, nessun
  intervento richiesto.
- **File toccati**: `src/stats/kernels/cluster.ts`,
  `src/analyses/cluster/{run.tsx,charts.test.ts}`,
  `src/analyses/canonical/{run.tsx,charts.test.ts}`,
  `src/analyses/l4.test.ts`, `src/charts/analysisKinds.ts`,
  `src/stats/reportCopy/catalog/en/charts-w10.ts`,
  `src/help/content/{en,it,fr,es,de,pt-PT}/charts.ts`.
- **Test**: cluster + canonical + l4 → 3 nuovi verdi, suite completa verde;
  `npm run check` verde; `locales:check` verde sulle 6 lingue.
- **Commit**: `feat(charts): F5.1 silhouette, scatter dei cluster e correlazioni canoniche`

### F5.2a — SEM e latent class

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**:
  - `sem-fit` [bar]: CFI, RMSEA e SRMR affiancati alla propria soglia
    convenzionale (0,95 / 0,06 / 0,08), con χ², df e p nel sottotitolo.
  - `latentclass-entropy` [bar]: quota di casi di ogni classe assegnati con
    posterior ≥ 0,80, con l’entropia del modello nel sottotitolo.
- **File toccati**: `src/analyses/sem/{run.tsx,charts.test.ts}`,
  `src/analyses/latentclass/{run.tsx,charts.test.ts}`,
  `src/stats/reportCopy/catalog/en/charts-w10.ts`,
  `src/help/content/{en,it,fr,es,de,pt-PT}/charts.ts` (nuove guide `sem` e
  `latentclass`).
- **Test**: sem + latent class → 2/2 verdi; `npm run check` verde;
  `locales:check` verde sulle 6 lingue.
- **Commit**: `feat(charts): F5.2a adeguamento SEM e certezza delle classi latenti`

### F5.2b — IRT e conjoint

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**: `iccProbability(a, b, θ)` nel kernel `irt` (Rasch = a 1) e
  `irt-icc` [line] con una curva per item sullo stesso reticolo di θ.
- **Verificato**: `conjoint-utilities` (utilità per livello, raggruppate per
  attributo) e `conjoint-importance` (quota % sul totale) sono già ordinate e
  con note corrette: nessun intervento.
- **File toccati**: `src/stats/kernels/irt.ts`, `src/analyses/irt/run.tsx`,
  `src/analyses/irt/charts.test.ts`,
  `src/stats/reportCopy/catalog/en/charts-w10.ts`,
  `src/help/content/{en,it,fr,es,de,pt-PT}/charts.ts` (nuova guida `irt`).
- **Test**: irt → 2/2 verdi; `npm run check` verde; `locales:check` verde
  sulle 6 lingue.
- **Commit**: `feat(charts): F5.2b curve caratteristiche degli item`

### F5.3 — PCA/EFA/alpha e pannelli

- **Stato**: ✅ chiusa (2026-11-03); ondata O5 chiusa con gate verde
- **Verificato**: `pca-scree`, `pca-score`, `pca-loadings`, `pca-loading-plot`,
  `pca-biplot`, `efa-loadings`, `efa-parallel`, `efa-variance`,
  `efa-communalities`, `alpha-items`, `alpha-correlations`, `alpha-if-deleted`
  sono emessi dal runner `multivariate`; `pcaPanel` compone scree, score,
  loadings e biplot e degrada se mancano.
- **Fatto**: guida `multivariate` riscritta nelle 6 lingue, con la spiegazione
  della coppia heatmap/loading plot (nessun grafico eliminato) e delle
  sezioni EFA e alpha.
- **File toccati**: `src/help/content/{en,it,fr,es,de,pt-PT}/charts.ts`;
  inventario statico rigenerato: **342 modelli** in 71 analisi, 32 kind.
- **Test**: `npm run check` verde; `locales:check` verde sulle 6 lingue;
  `npm run chart:inventory` rieseguito sul codice finale di O5.
- **Commit**: `feat(charts): F5.3 guide di PCA, EFA e alpha`

### F6.1 — Esatti, trend, Mantel–Haenszel

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**: `exact-observed-expected` [bar] con osservati e attesi affiancati per
  cella nel test esatto; nota del trend aggiornata per esplicitare l’assenza di
  banda; guida `contingency` riscritta nelle 6 lingue.
- **Verificato**: `contingency-mh-forest` è già corretto — log-OR per strato più
  pooled, riferimento 0, asse «Log odds ratio», nessun secondo forest.
- **File toccati**: `src/analyses/contingency/{run.tsx,charts.test.ts}`,
  `src/stats/reportCopy/catalog/en/charts-w10.ts`,
  `src/help/content/{en,it,fr,es,de,pt-PT}/charts.ts`.
- **Test**: contingency → 2/2 verdi (attesi 6,5/8,5/6,5/8,5 verificati);
  `npm run check` verde; `locales:check` verde sulle 6 lingue.
- **Commit**: `feat(charts): F6.1 osservati e attesi nel test esatto`

### F7.1 — Life table, competing, frailty, recurrent

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**: nota della life table riscritta per spiegare la differenza con KM
  (la tavola raggruppa il tempo, KM scende a ogni evento); nota del secondo
  grafico legata ai soggetti a rischio; nota della CIF che dichiara il modello
  per causa singola e l’assenza di CIF impilata; guida `survival` aggiornata
  nelle 6 lingue.
- **Verificato**: `recurrent-mcf` (F1.1b) convive con `recurrent-forest` su
  IC e riferimento 1; `frailty-forest` mostra gli HR condizionati con la nota
  che gli intervalli non includono l’incertezza della fragilità.
- **File toccati**: `src/analyses/survival/run.tsx`,
  `src/analyses/competing/run.tsx`, `src/analyses/cox/run.tsx`,
  `src/stats/reportCopy/catalog/en/{charts,charts-w6,charts-w10}.ts`,
  `src/help/content/{en,it,fr,es,de,pt-PT}/charts.ts`.
- **Test**: survival 5/5, competing 2/2, copy 4/4 verdi.
- **Commit**: `feat(charts): F7.1–F7.2 sopravvivenza, rischi competitivi e foreste su scala log`

### F7.2 — Cox, stratified, time-dependent

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**: `cox-forest`, `frailty-forest`, `stratcox-forest` e `tdcox-forest`
  su scala log con riferimento 1; sottotitolo del Cox che dichiara «scala log»
  al posto di «scala lineare»; nota del Cox riscritta (la scala log dà lo
  stesso spazio a HR protettivi e di rischio); guide `cox`, `stratcox` e
  `tdcox` riscritte nelle 6 lingue, con il limite di `tdcox` (nessun β(t)).
- **Verificato**: `cox-schoenfeld-*` ha già la nota sull’ipotesi di rischi
  proporzionali e il riferimento a 0; `tdcox` resta a un solo grafico.
- **File toccati**: `src/analyses/{cox,stratcox,tdcox}/run.tsx`,
  `src/analyses/{cox,stratcox}/run.test.ts`, `src/analyses/tdcox/charts.test.ts`,
  `scripts/remove-chart-copy.mjs` (nuovo, rimuove le voci EN obsolete),
  cataloghi EN, guide nelle 6 lingue.
- **Test**: `cox/run.test.ts` 3/3, `stratcox/run.test.ts` 3/3 (con le nuove
  asserzioni su `logScale` e `reference`), `tdcox/charts.test.ts` 2/2 nuovo;
  `npm run check` verde; `locales:check` verde sulle 6 lingue.
- **Nota sui test**: il dataset start-stop dei primi tentativi dava matrice
  singolare (follow-up tutti uguali); il test usa follow-up disuguali e lo
  dichiara in un commento — non è un test indebolito, è il caso degenere
  documentato.
- **Commit**: `feat(charts): F7.1–F7.2 sopravvivenza, rischi competitivi e foreste su scala log`

### F7.3a — ALT: life-stress plot

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**: nuovo `alt-life-stress` [scatter] con i tempi osservati su log10
  contro lo stress trasformato dal modello (1/S, log S o S) e la retta con la
  pendenza β dello stress; helper puro `altStressTransform` e
  `altLifeStressLine` in `src/stats/alt/lifeStress.ts`.
- **File toccati**: `src/analyses/alt/{run.tsx,charts.test.ts}`,
  `src/stats/alt/lifeStress.ts`, `src/stats/reportCopy/catalog/en/charts-w10.ts`.
- **Test**: 8/8 (trasformazione, pendenza e centroide, campione degenere,
  grafico presente con punti e retta, test del copy).
- **Nota sul tipo**: `LifeStressPoint` è un type alias e non un’interfaccia:
  solo gli alias ottengono la index signature implicita richiesta da
  `ChartRow` (`Record<string, ChartValue>`).
- **Commit**: `feat(charts): F7.3a life-stress plot e verifica parametriche`

### F8.1 — Holt-Winters, radici unitarie, spettrale

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**:
  - `hw-series`: le osservazioni diventano marker, la linea adattata resta la
    seconda serie e il forecast (x = n + passo) disegna la banda `lo`/`hi`;
    nota riscritta per dire cosa sono punti, linea e banda.
  - `unitroot-series`: nuova serie «Trend lineare» calcolata da
    `linearTrendLine` (minimi quadrati su t, due estremi); nota con
    ADF, valore critico 5% e p.
  - `spectral-density`: nota con periodo di picco, Fisher g e p; sottotitolo
    invariato (periodogramma, Daniell, spettro AR).
- **File toccati**: `src/analyses/timeseries/modes.tsx`,
  `src/analyses/timeseries/charts.test.ts` (nuovo),
  `src/stats/reportCopy/catalog/en/charts-w10.ts`,
  `src/stats/reportCopy/catalog/en/charts-w7.ts` (voci obsolete rimosse),
  `src/help/content/{it,en,fr,es,de,pt-PT}/charts.ts`.
- **Test**: timeseries charts + run + copy + analysisKinds → 16/16 verdi;
  `tsc --noEmit` exit 0; `check-locale` verde sulle 6 lingue;
  `help:build` verde (498 topic).
- **Nota**: il forecast non è stato corretto: il kernel `fitHoltWinters`
  restituisce già `step` assoluto (`values.length + passo`), quindi i punti
  futuri cadono dopo la serie osservata.
- **Commit**: `feat(charts): F8.1 Holt-Winters, radici unitarie e spettrale`

### F8.2 — VAR, GARCH, state-space

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**:
  - `garch-qq` [qq] con i residui standardizzati (`fit.standardized`), retta di
    riferimento ed envelope al livello scelto; sottotitolo con N e
    Jarque–Bera, nota su come leggere code e asimmetria.
  - `analysisKinds.garch` dichiara anche `qq`.
  - Guide `var`, `garch` e `statespace` aggiunte nelle 6 lingue (prima
    mancavano del tutto).
- **Verificato**: `var-irf-chart` (una linea per shock → variabile, orizzonte
  dichiarato), `var-fevd-chart` (quote impilate all’ultimo orizzonte) e
  `vecm-alpha` (barre di α con etichette) sono coerenti; `statespace-local`
  (livello filtrato/smussato con banda di previsione) e `statespace-markov`
  più `statespace-regimes` (serie con previsione e probabilità del regime 2)
  restano gli stessi tre grafici già presenti.
- **File toccati**: `src/analyses/garch/run.tsx`,
  `src/analyses/garch/charts.test.ts` (nuovo), `src/charts/analysisKinds.ts`,
  `src/stats/reportCopy/catalog/en/charts-w10.ts`,
  `src/help/content/{it,en,fr,es,de,pt-PT}/charts.ts`.
- **Test**: garch charts + copy + analysisKinds + buildSpec → 23/23 verdi;
  `check-locale` verde sulle 6 lingue; `help:build` verde (498 topic);
  gate di fine ondata `npm run check` exit 0.
- **Commit**: `feat(charts): F8.2 Q-Q dei residui GARCH`

### F9.1 — Sample size, resampling, DOE

- **Stato**: ✅ chiusa (2026-11-03)
- **Fatto**:
  - `doe-alias` [heatmap]: correlazione tra i termini del disegno (effetti
    principali e, fino a quattro fattori, interazioni a due vie) calcolata da
    `designAliasCells`; rettangolo colorato divergente e valore numerico in
    ogni cella, con nota su ±1 (confusione) e 0 (ortogonalità).
  - `analysisKinds.doe` dichiara ora anche `heatmap`.
  - Guida `doe` aggiunta nelle 6 lingue (prima mancava).
- **Verificato**: `samplesize` resta a tre grafici (potenza, precisione,
  sensibilità), ora bloccati da un’asserzione sugli id; `resampling` resta a
  tre (bootstrap, permutazione, Q-Q) ed era già fissato nel suo test.
- **File toccati**: `src/analyses/doe/run.tsx`,
  `src/analyses/doe/charts.test.ts` (nuovo),
  `src/analyses/samplesize/run.test.ts`, `src/charts/analysisKinds.ts`,
  `src/stats/reportCopy/catalog/en/charts-w10.ts`,
  `src/help/content/{it,en,fr,es,de,pt-PT}/charts.ts`.
- **Test**: doe + samplesize + resampling + copy + analysisKinds + buildSpec
  → 30/30 verdi; `tsc --noEmit` exit 0; `check-locale` verde sulle 6 lingue;
  `help:build` verde (498 topic).
- **Nota**: nella metà frazione con tre fattori A è confuso con BC e il test lo
  verifica (|r| = 1); nel fattoriale completo tutti i valori fuori diagonale
  sono zero.
- **Commit**: `feat(charts): F9.1 matrice di alias del disegno DOE`

### F7.3b — Parametric e reliability

- **Stato**: ✅ chiusa (2026-11-03, solo verifica)
- **Verificato**: `parametric-*` — sette grafici (sopravvivenza, hazard, hazard
  cumulativo, densità, rapporti, mediana, Q-Q) con note coerenti: le altre
  covariati restano alla media e ogni nota dice cosa rappresenta l’asse;
  `reliability-growth` mostra i punti osservati come serie «Osservati» e la
  curva attesa Crow–AMSAA come seconda serie; `reliability-rbd` ordina gli
  stadi per affidabilità con le etichette dei valori.
- **Modifiche**: nessuna, la fase chiedeva la verifica.
- **Test**: `npm run check` verde (parametric e reliability inclusi nella suite).
- **Commit**: `feat(charts): F7.3a life-stress plot e verifica parametriche`

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
| F4.1 | `selection-coefficients` | `regression` | `bar` | JMP | `regression/charts.test.ts` | ✅ |
| F4.2 | `multinomial-confusion` | `multinomial` | `heatmap` | LZ | `multinomial/run.test.ts` | ✅ |
| F4.2 | `iv-first-stage` | `iv` | `scatter` | LZ | `iv/run.test.ts` | ✅ |
| F4.2 | `pls-loadings` | `pls` | `heatmap` | LZ | `pls/run.test.ts` | ✅ |
| F5.1 | `cluster-silhouette` | `cluster` | `bar` | LZ | `cluster/charts.test.ts` | ✅ |
| F5.1 | `cluster-scatter` | `cluster` | `scatter` | LZ | `cluster/charts.test.ts` | ✅ |
| F5.1 | `canonical-corr` | `canonical` | `bar` | LZ | `canonical/charts.test.ts` | ✅ |
| F5.2a | `sem-fit` | `sem` | `bar` | LZ | `sem/charts.test.ts` | ✅ |
| F5.2a | `latentclass-entropy` | `latentclass` | `bar` | LZ | `latentclass/charts.test.ts` | ✅ |
| F5.2b | `irt-icc` | `irt` | `line` | LZ | `irt/charts.test.ts` | ✅ |
| F6.1 | `exact-observed-expected` | `contingency` | `bar` | LZ | `contingency/charts.test.ts` | ✅ |
| F7.1 | `survival-life-curve` ♻️ | `survival` | `survival` | JMP | `survival/run.test.ts` | ✅ |
| F7.1 | `survival-life-events` ♻️ | `survival` | `bar` | LZ | `survival/run.test.ts` | ✅ |
| F7.1 | `competing-cif` ♻️ | `competing` | `line` | JMP | `competing/charts.test.ts` | ✅ |
| F7.2 | `cox-forest` ♻️ | `cox` | `forest` | JMP | `cox/run.test.ts` | ✅ |
| F7.2 | `frailty-forest` ♻️ | `cox` | `forest` | JMP | `cox/run.test.ts` | ✅ |
| F7.2 | `stratcox-forest` ♻️ | `stratcox` | `forest` | JMP | `stratcox/run.test.ts` | ✅ |
| F7.2 | `tdcox-forest` ♻️ | `tdcox` | `forest` | JMP | `tdcox/charts.test.ts` | ✅ |
| F7.3a | `alt-life-stress` | `alt` | `scatter` | JMP | `alt/charts.test.ts` | ✅ |
| F8.1 | `hw-series` ♻️ | `timeseries` | `line` | JMP | `timeseries/charts.test.ts` | ✅ |
| F8.1 | `unitroot-series` ♻️ | `timeseries` | `line` | LZ | `timeseries/charts.test.ts` | ✅ |
| F8.1 | `spectral-density` ♻️ | `timeseries` | `line` | LZ | `timeseries/charts.test.ts` | ✅ |
| F8.2 | `garch-qq` | `garch` | `qq` | LZ | `garch/charts.test.ts` | ✅ |
| F9.1 | `doe-alias` | `doe` | `heatmap` | LZ | `doe/charts.test.ts` | ✅ |

*(compilare a ogni fase; una riga per grafico)*

F3.3, F4.3 e F4.4 sono fasi di allineamento: nessun nuovo id, solo opzioni dei
runner, guide e test sugli stili esistenti.

---

## 7. Prossimi 3 passi

1. F9.2a: survey e MI (`survey-deff`, cap di 24 grafici per `mi`).
2. F9.2b: coerenza di ML, text e choice.
3. Tradurre in F11.1a–b le note di life-stress, `timeseries`, Q-Q GARCH e
   matrice di alias.

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
