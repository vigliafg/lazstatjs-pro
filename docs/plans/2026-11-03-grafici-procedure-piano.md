# Piano — Grafici delle procedure: completamento e parità LazStats/JMP

- **Data**: 2026-11-03
- **Repository**: `/home/vigliafg/Documenti/GitHub/lazstatjs-pro`
- **Branch di partenza**: `main`, HEAD `48ed3c0`, versione `0.19.0`
- **Destinatario**: modello che esegue su un altro harness (DeepSeek V4.1 Flash, 4 h/giorno)
- **Documento di stato collegato**: `2026-11-03-grafici-procedure-stato.md`
- **Lingua del prodotto**: italiano (sorgente), UI/report/help in 6 lingue

---

## 0. Istruzioni per il modello che esegue (leggere per prime)

1. **Sei l'unico scrittore.** Non usare subagenti che modificano file. Un solo
   agente, un solo albero di lavoro. I subagenti in sola lettura sono ammessi
   solo se costano meno della lettura diretta.
2. **Il piano è la fonte di verità.** Il documento di stato registra i
   progressi; i commit e i test sono la prova. Non fidarti della memoria della
   chat.
3. **Una fase = un commit verde.** Alla fine di ogni fase: test mirati verdi,
   stato aggiornato, commit con messaggio `feat(charts): <fase> <cosa>`.
4. **Non rigenerare ciò che esiste.** Prima di implementare una fase, esegui
   `npm run chart:inventory` (creato in F0.1) e confronta la matrice §6 con il
   codice. Se un grafico è già presente e adatto, salta e annotalo nello stato.
5. **Non cambiare la statistica per far funzionare un grafico.** Se manca un
   dato derivato, aggiungi una funzione pura nel kernel con il suo test, oppure
   elimina il grafico e documenta il motivo. Mai calcolare statistiche nel
   renderer Vega-Lite.
6. **Non superare un'ora per fase.** Se una fase sfora, fermati al primo
   sotto-blocco verde, committa e sposta il resto nella fase successiva.
   Aggiorna lo stato.
7. **Non inventare convenzioni JMP.** Le convenzioni ammesse sono nella §6 e
   nei documenti citati. In dubbio, scegli LazStats e apri una domanda nello
   stato.
8. **Non toccare** kernel, report, form o parametri se la fase non lo richiede.
   Il perimetro è: runner, dati derivati, opzioni, stili, copy, help, test,
   documentazione.
9. **Prima di compattare il contesto** aggiorna lo stato (§13).
10. **Comandi di riferimento** (Node 24.18, npm 11.16):

```bash
npm run dev                 # server web di sviluppo (Vite)
npm run dev:electron        # app desktop Electron in sviluppo
npm run lint                # tsc --noEmit
npm test                    # tutti i test unitari (pretest: help:build)
npm run guard               # dependency-cruiser + madge + file-size
npm run check               # lint + test + guard (gate di ondata)
npm run test:samples        # dataset di prova
npm run locales:check       # parità delle 6 lingue
npx playwright test e2e/chart-editor.spec.ts --project=desktop
```

### 0.1 Come leggere questo piano (economia del contesto)

| Momento | Leggi | Non rileggere |
|---|---|---|
| Prima volta | §0, §1, §3, §4, §5, §6 (tutto), §7 (solo la prima fase), §8, §11 | §9, §10, §12–§16 |
| Inizio di ogni fase | la sezione `§7 F<id>`, la riga corrispondente di §6.2, §8 | §6.1, §6.3, §6.5 |
| Nuovo kind (eccezione) | §10, §9 (contratto dati) | il resto |
| Nuova stringa o help | §12 | §6 |
| Fine ondata | §11.3, §13.2, il documento di stato | §16 |
| Dubbio su un kind | §9 (tabella contratti) e il file `vega/<famiglia>Layers.ts` | §6 |

Il piano è lungo perché è autosufficiente: **non serve leggerlo tutto ogni
volta**. La riga di §6.2 e la sezione §7 della fase contengono già i dati, il
kind, il formato e i test richiesti.

---

## 1. Sintesi esecutiva

### 1.1 Cosa chiede il committente

Dopo l'ultima release (0.19.0) il prodotto ha **più di 70 procedure
statistiche**. Per ogni procedura servono **1–3 grafici statisticamente
appropriati**, scelti tra il formato **LazStats-like** e il formato
**JMP-like**, integrati nel run-report e nel chart editor.

### 1.2 Cosa c'è davvero nel repository (verificato il 2026-11-03)

| Fatto | Valore |
|---|---|
| Procedure nel registro | **72** (`src/analyses/registry.ts`) |
| Procedure che emettono almeno un grafico | **71** (solo `wizard` non ne ha, per scelta) |
| Modelli `AnalysisChart` emessi dai runner | **321** |
| Analisi con un solo grafico | **4**: `factorial`, `recurrent`, `tdcox`, `tost` |
| Analisi con 2 grafici | 21 |
| Analisi con ≥3 grafici | 46 |
| Varianti JMP-like esistenti | box, scatter, Q-Q, interval, dot, residual, histogram |
| Nuovi `kind` L4 esistenti | `tree`, `pareto`, `dendrogram`, `surface` + oggetti L2 |

**Conclusione onesta**: il problema non è "zero grafici". Il lavoro reale è:

1. colmare **29 grafici mancanti** e **sostituirne 1** statisticamente debole
   (tabella §6.2);
2. aggiungere **3 convenzioni JMP-like** per i kind che ne sono privi
   (`forest`, `survival`, `line`) e applicarle dove sono statisticamente
   migliori;
3. **integrare** ogni grafico in editor, gallery, help, export e test;
4. chiudere i **buchi di copertura dei test** che oggi non vedono i sub-runner.

### 1.3 Risultato atteso

- Ogni procedura ha **1–3 grafici canonici** dichiarati nella matrice §6.
- Ogni grafico è editabile, persistito, esportabile, tradotto e documentato.
- `npm run check` verde, `npm run locales:check` verde, e2e dell'editor verdi.
- Un documento di stato aggiornato a ogni fase, utilizzabile per ripartire
  senza rileggere tutto.

### 1.4 Stima

| Voce | Valore |
|---|---|
| Fasi | **31** (+2 di contingenza: F2.3, F9.4) |
| Durata media | 59 min (3 fasi da 90 min e 3 da 75 min, segnalate) |
| Totale | **~30 h** di modello |
| Calendario | **8 giorni** a 4 h/giorno |
| Gate intermedi | fine di ogni ondata (O0…O11) |

---

## 2. Perimetro e non-obiettivi

### 2.1 Perimetro

- Runner delle 72 procedure e relativi sub-runner (`*.ts`/`*.tsx` sotto
  `src/analyses/<id>/`).
- Dati derivati già calcolati o funzioni pure aggiunte ai kernel per il
  rendering.
- Opzioni dei grafici, stili della gallery, controlli dell'editor.
- Copy dei grafici (titoli, sottotitoli, note, assi), help `chartGuides`,
  documentazione.
- Test unitari e mirati; e2e solo per le fasi che toccano l'editor.

### 2.2 Non-obiettivi

- Nuove procedure o nuovi parametri di analisi.
- Nuovi `kind` decorativi o skin JMP (colori, font, loghi).
- Riscrittura dei kernel o dei report in prosa.
- Refactor non richiesti di runner esistenti.
- Modifica del contratto `.lzs` o bump di `PROJECT_VERSION`.
- Grafici interattivi nuovi (il linking L5 esiste già e non va esteso).
- Traduzione professionale: si usa il flusso di §12, con revisione a campione.

---

## 3. Baseline tecnica verificata

### 3.1 Contratto del grafico

`src/stats/charts.ts`:

```ts
{
  version: 1,
  id, kind, title, subtitle?, note?,
  layout: 'full' | 'half',
  data: Record<string, ChartRow[]>,   // layer già aggregati dal kernel
  fields: Record<string, string>,     // etichette leggibili
  stats?: Record<string, number | string | null>,
  options: ChartOptions,              // unione discriminata per kind
  sampled?: boolean
}
```

Regole:

- I dati sono **già aggregati**: il renderer non calcola statistica.
- `ChartRow` ammette solo `string | number | null`; `finiteRows` scarta
  l'intera riga se un valore non è finito. Niente `NaN` nei layer.
- Ogni grafico è serializzabile: attraversa il worker, il `.lzs` e l'export.
- Cap: `MAX_CHART_POINTS = 2000`, `MAX_CHARTS_PER_OUTPUT = 24`,
  `MAX_CHART_MODEL_CHARS = 120_000`.

### 3.2 Mappa dei file (dove si aggiunge cosa)

| Voglio… | File |
|---|---|
| Emettere un grafico da una procedura | `src/analyses/<id>/run.tsx` o sub-runner |
| Costruire il modello | `src/charts/kits/common.ts` → `makeChart` |
| Dichiarare i kind della procedura | `src/charts/analysisKinds.ts` |
| Raggruppare i grafici opzionali | `src/charts/outputs.ts` |
| Aggiungere un'opzione tipizzata | `src/stats/charts.ts` + `src/charts/defaults.ts` |
| Aggiungere un controllo nell'editor | `src/charts/features.ts` (o modulo split) |
| Aggiungere una variante di stile | `src/charts/styles.ts` |
| Compilare un kind in Vega-Lite | `src/charts/vega/buildSpec.ts` + layer |
| Copy dei grafici (EN) | `src/stats/reportCopy/catalog/en/charts-w10.ts` (nuovo) |
| Copy localizzate | `src/stats/reportCopy/catalog/<locale>/charts-w10.ts` (nuovo) |
| Etichette chrome (stili/controlli) | `src/i18n/catalog/<locale>/analysis.ts` |
| Help "grafici della procedura" | `src/help/content/<locale>/charts.ts` |
| Test di compilazione | `src/charts/vega/buildSpec.test.ts`, `styles.test.ts` |
| Test della procedura | `src/analyses/<id>/charts.test.ts` (nuovo) |
| Inventario | `scripts/chart-inventory.mjs` + `docs/analysis/` |

### 3.3 Flusso run → report → editor → export

1. Il runner restituisce `charts: AnalysisChart[]` (e `panels?`).
2. `OutputConsole` rende le card nell'ordine: titolo, tabelle, prosa, grafici.
3. `ChartCard` apre `ChartEditorDialog`; **Done** aggiorna le opzioni senza
   rilanciare l'analisi.
4. Autosave e `.lzs` salvano il modello; l'HTML statico conserva solo tabelle e
   prosa.
5. Export PNG/HTML/Word attende `data-chart-state` e ignora `data-no-export`.
6. Il worker trasporta i modelli; nessuna funzione nei dati.

### 3.4 Buchi di copertura trovati (da chiudere in F0.1)

1. `src/charts/analysisKinds.test.ts` legge solo `run.tsx`: i kind emessi dai
   sub-runner (`anova/nested.ts`, `anova/anom.ts`, `regression/polynomial.ts`,
   `regression/selection.ts`, `regression/penalized.ts`,
   `discriminant/mancova.ts`, `lmm/randomSlope.ts`, `timeseries/modes.tsx`)
   non sono verificati.
2. `src/charts/copy.test.ts` elenca a mano ~40 directory: le altre
   (`canonical`, `mds`, `correspondence`, `sem`, `latentclass`, `irt`,
   `conjoint`, `survey`, `ml`, `text`, `choice`, `meta`, `bayes`, `spatial`)
   non sono coperte.
3. `docs/analysis/2026-10-30-inventario-grafici-31-procedure.md` descrive 31
   procedure: è uno snapshot storico, non l'inventario attuale.
4. `docs/PROJECT-STATUS.md` è fermo a 72 procedure e `.lzs` v2: aggiornarlo a
   fine piano, non a ogni fase.

---

## 4. Invarianti da non rompere

1. **Un solo default per kind**: il default built-in riproduce
   `factoryOptions(kind)` (`styles.test.ts`).
2. **Eccezione Q-Q documentata**: `qq.probability` è il default JMP-like;
   `qq.classic` è LazStats. Non cambiare il default storico.
3. **Ordine di merge**:
   `factory < default comuni < stile < opzioni esplicite della card`.
   Uno stile non cambia dati o statistica.
4. **L'override esplicito del runner vince**: per abilitare una variante via
   stile bisogna togliere l'override, non invertire il merge.
5. **Niente `NaN`**: i campi non calcolabili si omettono.
6. **Stili utente**: `user: true`, `origin` assente.
7. **Niente nuovi `kind`** se basta uno esistente. I kind L4
   (`tree`, `pareto`, `dendrogram`, `surface`) e gli oggetti L2
   (`diamond`, `circles`, `shadowgram`, `scattermatrix`, `bubble`,
   `scatter3d`) non sono varianti di stile.
8. **Persistenza**: non salvare l'id dello stile nella card; le opzioni sono la
   fonte di verità. Nessun bump di `PROJECT_VERSION`.
9. **Jitter deterministico**, ciclo 101, nessun transform Vega aggiuntivo.
10. **Pannelli**: profondità 1, additivi, mai annidati.
11. **Report senza kernel**: `src/stats/reports/*` non importa i kernel.
12. **Linking**: cambia solo l'opacità dei simboli; dati e statistiche restano
    identici.
13. **Export pulito**: durante l'export niente selezione/attenuazione.
14. **Locale**: ogni nuova stringa va in tutte e 6 le lingue
    (`en, it, fr, es, de, pt-PT`).
15. **File size**: massimo 700 righe per file sorgente, salvo eccezioni
    motivate in `scripts/check-file-size.mjs`. I cataloghi `analysis.ts`,
    `charts.ts` e `charts-extra.ts` sono già al limite: **creare file nuovi per
    ondata**, non appendere.

---

## 5. Politica dei formati LazStats-like / JMP-like

### 5.1 Definizioni

- **LazStats-like**: default del motore. Card autonoma, titolo/sottotitolo/nota,
  palette dell'app, oggetti diagnostici espliciti, opzioni tutte visibili
  nell'editor.
- **JMP-like**: convenzione statistica documentata, non una skin. Esempi: baffi
  10°–90°, diamante della media con IC, punti jittered, banda ±2 SD dei
  residui, asse probabilità/z, forest su scala log per i rapporti.

### 5.2 Regola decisionale

| Situazione | Formato |
|---|---|
| Il default LazStats è già corretto e leggibile | **LazStats** |
| La convenzione JMP comunica meglio l'inferenza (media con IC, baffi percentile, residui ±2 SD, probabilità) | **JMP-like** come variante opt-in + eventuale preselezione della procedura |
| Il grafico è un rapporto (HR, OR, RR, IRR, rapporto di varianze) | **JMP-like**: forest su scala log, riferimento 1 |
| Il grafico è una curva di sopravvivenza | **JMP-like**: step, censure, IC, mediana |
| Il grafico è un piano di osservati vs predetti | **LazStats** finché la banda per `k ≥ 2` non è disponibile |

**Come si esprime la scelta**: la procedura emette le opzioni della variante
(`options: { logScale: true }`, `{ showMedian: true }`, ...). La gallery
riconosce lo stile applicato con `matchingChartStyle`; l'utente può cambiarlo.
Non si salva l'id dello stile.

### 5.3 Catalogo delle convenzioni JMP ammesse

| Kind | Convenzione JMP | Stato |
|---|---|---|
| `box` | baffi 10–90, media con IC, punti jittered, outlier | esistente (`jmp-oneway`, `jmp-outlier`) |
| `scatter` | OLS + banda CI 95 + linea della media | esistente (`jmp-regression`, solo `k=1`) |
| `qq` | asse probabilità/z, curve CI, riferimento continuo | esistente (`qq.probability`, default) |
| `histogram` | rug + linea della media | esistente (`jmp-basic`) |
| `interval` | diamante della media | esistente (`jmp-mean-diamond`) |
| `dot` | strip jitter | esistente (`jmp-strip`) |
| `residual` | banda ±2 SD | esistente (`jmp-residual`) |
| `forest` | scala log per rapporti, riferimento 1 | **nuovo** (`jmp-ratio`) |
| `survival` | step + censure + IC + mediana | **nuovo** (`jmp-km`) |
| `line` | punti osservati con marker | **nuovo** (`jmp-connected`) |
| `bar` | categorie ordinate + etichette | opzioni esistenti (`sort`, `valueLabels`) |
| `pareto` | barre decrescenti + cumulata | factory + sort del runner |
| `mosaic` | valori + colore per residuo | factory |
| `heatmap` | diverging + valori | stile esistente `diverging` (origine LazStats, usato anche da JMP) |
| `acf` | bande di confidenza | factory |
| `diamond`, `circles`, `shadowgram`, `scattermatrix`, `bubble`, `scatter3d` | oggetti JMP | già oggetti L2 |

**Divieti**: colori/font JMP, loghi, skin, nuovi kind per imitare JMP, stili che
cambiano dati o statistiche.

---

## 6. Matrice decisionale — grafici canonici per procedura

Legenda:

- ✅ esiste ed è adatto
- ➕ da aggiungere
- ♻️ da sostituire o correggere
- 🅹 variante/convenzione JMP consigliata
- — non previsto

### 6.1 Analisi senza gap (set canonico già completo)

| Analisi | Metodi coperti | Grafici canonici (1–3) | Formato |
|---|---|---|---|
| `agreement` | accordo | `agreement-bland`, `agreement-icc`, `agreement-kappa` ✅ | LZ |
| `ancova` | ANCOVA | `ancova-means`, `ancova-profile`, `ancova-residual-qq` ✅ | LZ |
| `correlation` | correlazione | `corr-raw-scatter`, `corr-box`, `corr-heatmap` ✅ | LZ/🅹 |
| `countreg` | conteggi | `count-observed-fitted`, `count-residual-qq`, `count-irr-forest` ✅ | LZ |
| `gee` | GEE | `gee-observed-fitted`, `gee-coefficient-forest`, `gee-cluster-means` ✅ | LZ |
| `glm` | GLM gamma/Tweedie | `glm-fitted`, `glm-residuals`, `glm-profile` ✅ | LZ |
| `lmm` | LMM | `lmm-observed-fitted`, `lmm-residual-qq`, `lmm-group-means` ✅ | LZ |
| `logistic` | logistica/probit | `logistic-curve`, `logistic-roc`, `logistic-confusion` ✅ | LZ/🅹 |
| `loglinear` | log-linear | `loglinear-residuals`, `loglinear-observed-expected` ✅ | LZ |
| `mars` | GAM/MARS | `mars-fitted`, `mars-profile`, `mars-residuals` ✅ | LZ |
| `mediation` | mediazione | `mediation-effects-forest`, `mediation-bootstrap` ✅ | LZ |
| `mixedanova` | mixed ANOVA | `mixed-interaction`, `mixed-trajectories` ✅ | LZ |
| `nonparamrm` | Friedman/McNemar/Cochran/Jonckheere | `friedman-ranks`, `mcnemar-discordant`, `jonckheere-groups` ✅ | LZ |
| `ordinal` | ordinale | `ordinal-probabilities`, `ordinal-or-forest`, `ordinal-probability-heatmap` ✅ | LZ |
| `panel` | panel FE/RE | `panel-observed-fitted`, `panel-entity-effects`, `panel-fe-re` ✅ | LZ |
| `partition` | CART | `partition-tree`, `partition-observed`, `partition-importance` ✅ | LZ |
| `propensity` | propensity score | `propensity-love`, `propensity-score-treated`, `propensity-att` ✅ | LZ |
| `repeatedanova` | misure ripetute | `repeated-means`, `repeated-trajectories`, `repeated-change` ✅ | LZ |
| `resampling` | bootstrap/permutazione | `resampling-bootstrap`, `resampling-permutation`, `resampling-bootstrap-qq` ✅ | LZ |
| `selection` | Tobit/Heckman | `tobit-observed-fitted`, `tobit-latent-observed`, `heckman-imr` ✅ | LZ |
| `samplesize` | sample size/potenza | `samplesize-power`, `samplesize-precision`, `samplesize-sensitivity` ✅ | LZ |
| `wizard` | guida | nessuno (per scelta) | — |

### 6.2 Gap da colmare (29 grafici + 1 sostituzione)

Legenda "Stato dati":

- ✅ il dato è già nel risultato del kernel o nel runner;
- 🔧 serve un helper puro (10–40 righe) con test, nel runner o nel kernel;
- 🧠 serve una funzione nuova nel kernel, più impegnativa (≥ 1 h);
- ♻️ sostituzione di un grafico esistente.

| # | id nuovo/corretto | Analisi | Metodo | kind | Dati necessari | Formato | Stato dati | Fase |
|---|---|---|---|---|---|---|---|---|
| 1 | `freq-cumulative` | `descriptive` | D-01 frequenze | `pareto` | conteggi + cumulata dal tally | JMP | ✅ | F2.1 |
| 2 | `outliers-strip` | `descriptive` | D-02 Grubbs/Dixon | `dot` | valori + flag outlier | JMP strip | ✅ | F2.1 |
| 3 | `msa-operator-profile` | `quality` | Q-01 Gage R&R | `line` | medie parte × operatore (righe già nel runner; `msa-variance` esiste già) | JMP | 🔧 | F2.2 |
| 4 | `mcontrol-contribution` | `quality` | Q-03 carte multivariate | `bar` | contributo per variabile ai punti fuori controllo | JMP | 🧠 | F2.2 |
| 5 | `var-ratio-forest` | `variances` | C-03 rapporto varianze | `forest` | rapporto + IC (`ratio`, `fLo`, `fHi`) | JMP log | ✅ | F3.1 |
| 6 | `sign-ci` | `ttest` | C-04 sign test | `interval` | mediana + IC (helper ordine-statistiche) | JMP | 🔧 | F3.1 |
| 7 | `ks-diff` | `distfit` | C-05 KS due campioni | `line` | differenza tra le due ECDF | JMP | 🔧 | F3.1 |
| 8 | `mood-median-ci` | `anova` | C-06 Mood | `interval` | mediane per gruppo + IC (stesso helper di #6) | JMP | 🔧 | F3.2 |
| 9 | `nested-variance` | `anova` | C-08 ANOVA nested | `bar` | `varianceComponents` del kernel | LZ | ✅ | F3.2 |
| 10 | `gof-contribution` | `chisquare` | C-07 GOF | `pareto` | (O−E)²/E per cella | JMP | ✅ | F3.2 |
| 11 | `selection-coefficients` | `regression` | R-01 stepwise | `bar` | coefficienti di `final` (`regressionStats`) | LZ | ✅ | F4.1 |
| 12 | `multinomial-confusion` | `multinomial` | R-04 | `heatmap` | matrice da `y` + `predicted` | JMP | 🔧 | F4.2 |
| 13 | `iv-first-stage` | `iv` | R-11 2SLS | `scatter` | strumento vs endogena (dati del runner) | LZ | ✅ | F4.2 |
| 14 | `pls-loadings` | `pls` | R-09 PLS | `heatmap` | loadings X per componente (`PlsComponent.loading`) | JMP | ✅ | F4.2 |
| 15 | `cluster-silhouette` | `cluster` | M-01 k-means | `bar` | silhouette per cluster (oggi solo media) | JMP | 🔧 | F5.1 |
| 16 | `cluster-scatter` | `cluster` | M-01 | `scatter` | prime due variabili standardizzate + `assignment` | JMP | ✅ | F5.1 |
| 17 | `canonical-corr` | `canonical` | M-02 | `bar` | `functions[].correlation` | JMP | ✅ | F5.1 |
| 18 | `sem-fit` | `sem` | M-05 | `bar` | CFI, RMSEA, SRMR | LZ | ✅ | F5.2 |
| 19 | `latentclass-entropy` | `latentclass` | M-06 | `bar` | entropia da `posterior` | JMP | 🔧 | F5.2 |
| 20 | `irt-icc` | `irt` | M-07 | `line` | curve da `alpha`/`b` | JMP | 🔧 | F5.2 |
| 21 | `exact-observed-expected` | `contingency` | K-04 esatti R×C | `bar` | osservati vs attesi | LZ | ✅ | F6.1 |
| 22 | `recurrent-mcf` | `recurrent` | S-04 eventi ricorrenti | `line` | MCF (mean cumulative function) | JMP | 🧠 | F1.1 |
| 23 | `alt-life-stress` | `alt` | S-07 ALT | `scatter` | vita vs stress + fit su griglia | JMP log | 🔧 | F7.3 |
| 24 | `garch-qq` | `garch` | T-06 GARCH | `qq` | `GarchFit.standardized` | JMP | ✅ | F8.2 |
| 25 | `doe-alias` | `doe` | Q-05 disegni | `heatmap` | correlazioni/alias dalla matrice del disegno | JMP | 🔧 | F9.1 |
| 26 | `survey-deff` | `survey` | N-02 | `bar` | `SurveyEstimate.deff` | JMP | ✅ | F9.2 |
| 27 | `bayes-ppc` | `bayes` | A-01 | `line` | repliche da `BayesResult.samples` | LZ | 🔧 | F9.3 |
| 28 | `spatial-variogram` | `spatial` | A-03 | `line` | variogramma sperimentale | JMP | 🧠 | F9.3 |
| 29 | `factorial-cells` | `factorial` | fattoriale | `interval` | medie di cella + IC (già in `series`) | LZ | ✅ | F1.1 |
| ♻️ | `tost-difference` | `tost` | equivalenza | `interval` | differenza + IC + margini | JMP | 🔧 | F1.2 |

**Nota sugli helper condivisi**: #6 e #8 usano lo stesso
`medianConfidenceInterval(values, level)` (intervallo di confidenza della
mediana per ordine-statistiche), da mettere in `src/charts/kits/common.ts` con
test dedicato. #4 è una modifica al kernel `mcontrol`; #12, #15, #19, #20, #25
e #27 sono helper locali al runner. Nessuno di questi introduce un nuovo kind.

**Nota sulle fasi kernel**: #22 e #28 richiedono una funzione pura nuova
(`meanCumulativeFunction`, `variogram`) con test. Sono le uniche due eccezioni
al vincolo "solo runner". Se il tempo non basta, la funzione si implementa in
una fase dedicata e il grafico si rimanda.

### 6.3 Analisi con gap già pianificati (riepilogo per fase)

| Analisi | Grafici esistenti principali | Gap | Fase |
|---|---|---|---|
| `descriptive` | `freq-bar`, `desc-hist`, `desc-box`, `desc-qq` | #1, #2 | F2.1 |
| `quality` | `control-chart`, `capab-histogram`, `pareto-chart`, `tolerance-interval` | #3, #4 | F2.2 |
| `proportions` | 4 interval | nessuno | F3.1 |
| `variances` | `var-one-interval`, `var-box` | #5 | F3.1 |
| `ttest` | 13 box/interval/diamond | #6 | F3.1 |
| `distfit` | `distfit-probability`, `ks-ecdf` | #7 | F3.1 |
| `anova` | 11 box/bar/interval | #8, #9 | F3.2 |
| `chisquare` | `chisq-observed-expected`, `chisq-mosaic`, `gof-bar` | #10 | F3.2 |
| `discriminant` | 4 (incl. `mancova-adjusted-means`) | nessuno | F3.2 |
| `glmm` | 4 | nessuno (solo polish) | F3.3 |
| `regression` | 14 (incl. polynomial/selection/penalized) | #11 | F4.1 |
| `multinomial` | 2 | #12 | F4.2 |
| `iv` | 2 | #13 | F4.2 |
| `pls` | 2 | #14 | F4.2 |
| `quantile`, `nonlinear`, `ordinal`, `countreg` | 2–6 | nessuno | F4.3 |
| `cluster` | 3 | #15, #16 | F5.1 |
| `canonical` | 2 | #17 | F5.1 |
| `mds`, `correspondence` | 2 ciascuna | nessuno | F5.1 |
| `sem` | 2 | #18 | F5.2 |
| `latentclass` | 2 | #19 | F5.2 |
| `irt` | 2 | #20 | F5.2 |
| `conjoint` | 2 | nessuno | F5.2 |
| `contingency` | 8 | #21 | F6.1 |
| `survival`, `stratcox` | 7 / 4 | nessuno (solo JMP) | F7.1/F7.2 |
| `cox` | 8 | JMP log default | F7.2 |
| `recurrent` | 1 | #22 | F1.1 |
| `tdcox` | 1 | nessuno (β(t) fuori perimetro) | F7.2 |
| `alt` | 2 | #23 | F7.3 |
| `parametric`, `reliability` | 7 / 2 | nessuno | F7.3 |
| `competing` | 2 | nessuno (2 grafici già canonici) | F7.1 |
| `timeseries` | 14 | nessuno | F8.1 |
| `var`, `statespace` | 3 / 3 | nessuno | F8.2 |
| `garch` | 2 | #24 | F8.2 |
| `doe` | 4 | #25 | F9.1 |
| `mi` | 13 | nessuno | F9.2 |
| `survey` | 2 | #26 | F9.2 |
| `ml`, `text`, `choice` | 5 / 4 / 4 | nessuno | F9.2 |
| `bayes` | 4 | #27 | F9.3 |
| `meta` | 3 | nessuno | F9.3 |
| `spatial` | 3 | #28 | F9.3 |
| `factorial` | 1 | #29 | F1.1 |
| `tost` | 1 | ♻️ | F1.2 |

---

### 6.4 Limiti accettati (documentati, non in piano)

| Limite | Motivo | Conseguenza |
|---|---|---|
| `tdcox` senza grafico β(t)/Schoenfeld | il kernel restituisce β costanti, non una griglia β(t) | resta 1 grafico canonico: `tdcox-forest` su scala log |
| `competing` senza CIF impilate | il modello è stimato per una causa alla volta | restano `competing-cif` + `competing-forest` (2 grafici) |
| Actual by Predicted con banda per `k ≥ 2` | richiede `seMean` per il profilo medio e una verifica statistica | resta punti + diagonale; banda solo per `k = 1` |
| MSA per operatore/parte | `MsaResult` espone le componenti aggregate, non la scomposizione per operatore | si aggiunge il profilo medie parte × operatore; non si scompone la varianza per operatore |
| `surface` mesh/contour nell'editor | controllo utente rimandato dalla Milestone F | la modalità resta scelta dal runner |

### 6.5 Aggiornamenti certi a `analysisKinds.ts`

Il test `analysisKinds.test.ts` fallisce se un runner emette un kind non
dichiarato. Queste sono le aggiunte necessarie (verificare comunque con il test
dopo ogni fase):

| Analisi | Kind da aggiungere |
|---|---|
| `descriptive` | `pareto` |
| `variances` | `forest` |
| `chisquare` | `pareto` |
| `pls` | `heatmap` |
| `cluster` | `scatter` |
| `recurrent` | `line` |
| `alt` | `scatter` |
| `garch` | `qq` |
| `doe` | `heatmap` |
| `spatial` | `line` |
| `factorial` | `interval` |

**Già presenti, nessuna modifica**: `quality` (`bar`), `ttest` (`interval`),
`distfit` (`line`), `anova` (`bar`, `interval`), `discriminant` (`line`),
`regression` (`bar`), `multinomial` (`heatmap`), `iv` (`scatter`),
`canonical` (`bar`), `sem` (`bar`), `latentclass` (`bar`), `irt` (`line`),
`contingency` (`forest`), `competing` (`line`), `survey` (`bar`),
`bayes` (`line`).

---

## 7. Fasi di implementazione

### Regole comuni a ogni fase

1. Leggi solo i file elencati (e i loro test).
2. Verifica l'inventario: `npm run chart:inventory -- --analysis <id>`.
3. Implementa i grafici; aggiorna `analysisKinds.ts`, `outputs.ts` se serve.
4. Aggiungi il test in `src/analyses/<id>/charts.test.ts`.
5. Aggiungi copy IT (sorgente) + EN; le altre lingue si fanno in F11.1.
6. Aggiorna `chartGuides` **solo in italiano e inglese** in fase; le altre
   lingue in F11.1.
7. Test mirati verdi.
8. Aggiorna lo stato e committa.

**Template di un grafico** (adattare, non copiare alla lettera):

```ts
makeChart({
  id: 'mood-median-ci',
  kind: 'interval',
  title: copy('Mediane per gruppo con intervallo'),
  subtitle: copy('IC {s1}% · {s2} gruppi', { s1: ciLevel, s2: groups.length }),
  note: copy('La linea centrale è la mediana; l’intervallo è la sua incertezza. Le mediane sono più robuste delle medie con code lunghe.'),
  data: {
    intervals: groups.map(group => ({
      category: group.label,
      estimate: group.median,
      lo: group.lo,
      hi: group.hi,
    })),
  },
  fields: { xLabel: copy('Gruppo'), yLabel: copy('Mediana') },
  options: { valueLabels: false, sort: 'none' } as never,
})
```

**Template del test**:

```ts
test('<id> è emesso e compila', () => {
  const charts = chartsOf(buildXOutput({ grid, params, ciLevel: 95 }));
  const chart = charts.find(item => item.id === '<id>');
  assert.ok(chart, 'missing <id>');
  assert.equal(chart.kind, '<kind>');
  assert.ok((chart.data.<layer> ?? []).length > 0);
});
```

---

### O0 — Fondazioni

#### F0.1 — Inventario, guardrail, stato (60 min)

**Obiettivo**: rendere visibile e verificabile ciò che esiste, prima di
aggiungere.

**Passi**

1. Creare `scripts/chart-inventory.mjs`:
   - scansione statica di tutti i `*.ts`/`*.tsx` sotto `src/analyses/*/`
     (esclusi test);
   - estrae `makeChart({ id, kind })` per file;
   - stampa una tabella markdown per analisi e un totale;
   - opzione `--analysis <id>` e `--json`.
2. Aggiungere `"chart:inventory": "node scripts/chart-inventory.mjs"` in
   `package.json`.
3. Creare `docs/analysis/2026-11-03-inventario-grafici-72-procedure.md` con
   l'output e la nota che sostituisce il documento del 2026-10-30.
4. Estendere `src/charts/analysisKinds.test.ts`: scansionare tutti i moduli
   runner, non solo `run.tsx`.
5. Estendere `src/charts/copy.test.ts`: sostituire la lista manuale con una
   scansione ricorsiva di `src/analyses/*/`, esclusi i test, e leggere il
   catalogo risolto `enChartCopy` da `catalog/charts.ts` (non il solo
   `catalog/en/charts.ts`). Se emergono stringhe senza inglese, aggiungerle al
   catalogo in questo stesso step.
6. Creare il documento di stato da template.
7. `npm run check` verde.

**Test**: `node --import tsx --test src/charts/analysisKinds.test.ts
src/charts/copy.test.ts`, poi `npm run check`.

**DoD**: inventario ripetibile, test che vedono i sub-runner, stato creato,
nessuna modifica ai grafici.

---

#### F0.2 — Contratto formati: tre varianti JMP (60 min)

**Obiettivo**: dare un nome e un contratto alle convenzioni mancanti.

**Passi**

1. In `src/charts/styles.ts` aggiungere:
   - `forest.jmp-ratio`: `{ logScale: true, reference: 'one' }`, origine `jmp`,
     descrizione "scala log e riferimento 1 per rapporti";
   - `survival.jmp-km`: `{ step: true, showCI: true, showCensoring: true,
     showMedian: true }`;
   - `line.jmp-connected`: `{ step: false, showMarkers: true }`.
2. Etichette e hint in `src/i18n/catalog/<6 lingue>/analysis.ts`:
   `chart.style.jmpForestRatio`, `chart.style.jmpForestRatioHint`,
   `chart.style.jmpSurvivalKm`, `chart.style.jmpSurvivalKmHint`,
   `chart.style.jmpLineConnected`, `chart.style.jmpLineConnectedHint`.
3. Aggiungere i vincoli in `src/charts/styles.test.ts` (test "pin" come per
   Milestone B).
4. `src/charts/vega/buildSpec.test.ts` compila già tutte le tile della gallery:
   verificare che i nuovi stili siano inclusi.
5. Documentare nella §5.3 e nello stato la mappa "procedura → stile JMP".

**Test**: `styles.test.ts`, `buildSpec.test.ts`, `locales:check` (solo chiavi
chrome; le copy report arrivano in F11.1).

**DoD**: tre tile selezionabili, un solo default per kind, nessun cambio ai
grafici esistenti.

---

### O1 — Ampiezza: le procedure con un solo grafico

#### F1.1 — `factorial`, `recurrent` (90 min)

**Obiettivo**: portare a 2 grafici le due procedure più povere rimaste
(`tdcox` resta a 1: vedi §6.4).

**Grafici**

1. `factorial-cells` [interval] — riusa `series` già calcolato in
   `src/analyses/factorial/run.tsx` (medie di cella + IC).
2. `recurrent-mcf` [line] — mean cumulative function. **Richiede** una funzione
   pura `meanCumulativeFunction(rows)` in `src/stats/kernels/recurrent.ts` (o
   file adiacente) con test: tempi ordinati, eventi cumulati / soggetti a
   rischio.

**File**: `factorial/run.tsx`, `recurrent/run.tsx`, `analysisKinds.ts`
(aggiungere `interval` a `factorial`, `line` a `recurrent`), `outputs.ts` se il
grafico è opzionale, `en/charts-w10.ts`, help IT/EN.

**Test**: `src/analyses/factorial/charts.test.ts`,
`recurrent/charts.test.ts` + test kernel MCF.

**DoD**: `factorial` e `recurrent` hanno 2 grafici compilati; il MCF ha un test
numerico (tempi noti, valore atteso calcolato a mano). `tdcox` resta a 1 con il
limite documentato.

---

#### F1.2 — `tost` e chiusura ampiezza (45 min)

**Obiettivo**: correggere il grafico TOST e verificare l'ampiezza raggiunta.

**Passi**

1. `tost-difference`: sostituire `bar` con `interval` (+ `rules` per i margini,
   se il layer li supporta) oppure mantenere `bar` solo se la regione di
   equivalenza resta leggibile. In entrambi i casi: titolo/nota che spiegano
   differenza, IC e margini.
2. Se `interval` non supporta la regione, aggiungere `regions` al layer
   `interval` con test di compilazione (modifica piccola e condivisa).
3. Eseguire `npm run chart:inventory` e verificare: nessuna analisi con 1 solo
   grafico **tranne `tdcox`** (limite accettato, §6.4).
4. Aggiornare `chartGuides` per `tost`.

**Test**: `src/analyses/tost/charts.test.ts`, `buildSpec.test.ts`.

**DoD**: TOST statisticamente corretto; `factorial` e `recurrent` a 2 grafici;
`tdcox` a 1 con limite documentato.

---

### O2 — Descrittive e qualità

#### F2.1 — `descriptive`: distribuzione categorica e outlier (60 min)

**Grafici**

1. `freq-cumulative` [pareto] — conteggi ordinati decrescenti + cumulata, per
   la prima variabile categorica (D-01). Dati dal tally già usato da
   `freq-bar`.
2. `outliers-strip` [dot] — valori con flag degli outlier Grubbs/Dixon (D-02),
   jitter deterministico, stile `jmp-strip`.

**Extra**: verificare che `desc-hist` usi `jmp-basic` come variante
selezionabile e che `desc-box` abbia `jmp-oneway` disponibile.

**File**: `descriptive/run.tsx`, `analysisKinds.ts` (già `pareto`? no:
aggiungere `pareto` a `descriptive`), `outputs.ts`, copy, help.

**Test**: `descriptive/charts.test.ts` (esiste `run.test.ts`: estendere quello
se già copre i grafici).

**DoD**: i due grafici compilano, compaiono nel run-report, sono editabili e
documentati.

---

#### F2.2 — `quality`: MSA e carte multivariate (60 min)

**Grafici**

1. `msa-operator-profile` [line] — medie parte × operatore, una serie per
   operatore. `msa-variance` esiste già e copre le componenti di varianza:
   non duplicarlo.
2. `mcontrol-contribution` [bar] — contributo per variabile ai punti fuori
   controllo. **Richiede** esporre i contributi dal kernel `mcontrol` (oggi
   calcola `delta`/`projected` internamente). Se il lavoro supera 30 min,
   chiudere la fase con `msa-operator-profile` e spostare il contributo in F2.3
   (fase kernel dedicata).

**Extra**: `cusum-chart` deve mostrare i limiti `h` e il riferimento; se manca,
aggiungere `rules` (dati già nel risultato).

**File**: `quality/run.tsx`, `src/stats/kernels/mcontrol.ts`,
`analysisKinds.ts`, `outputs.ts`, copy, help.

**Test**: `quality/charts.test.ts` + test del kernel per i contributi.

**DoD**: la procedura Quality ha i tre oggetti SPC canonici (controllo,
capacità, Pareto) più MSA; il contributo è chiuso o esplicitamente spostato a
F2.3. Il pannello `qualityPanel` resta opzionale e non duplica i grafici.

---

### O3 — Confronto gruppi

#### F3.1 — Proporzioni, varianze, sign, KS (60 min)

**Grafici**

1. `var-ratio-forest` [forest] — rapporto delle varianze + IC, scala log,
   riferimento 1 (C-03).
2. `sign-ci` [interval] — mediana delle differenze + IC (C-04).
3. `ks-diff` [line] — differenza tra le due ECDF con il punto di massimo
   evidenziato (C-05).

**File**: `variances/run.tsx`, `ttest/run.tsx`, `distfit/run.tsx`,
`analysisKinds.ts`, copy, help.

**Test**: un `charts.test.ts` per analisi.

**DoD**: i tre grafici compilano e sono statisticamente interpretabili; il
forest usa `jmp-ratio`.

---

#### F3.2 — Mood, GOF, nested (60 min)

**Grafici**

1. `mood-median-ci` [interval] (C-06).
2. `nested-variance` [bar] — componenti between/within (C-08).
3. `gof-contribution` [pareto] — contributi (O−E)²/E (C-07).

**Nota MANCOVA**: `mancova-adjusted-means` è già il profile plot delle medie
aggiustate; non si aggiunge un secondo grafico. Il limite è in §6.4.

**File**: `anova/run.tsx` + `anova/nested.ts`, `chisquare/run.tsx`,
`analysisKinds.ts`, copy, help.

**Test**: `anova/charts.test.ts`, `chisquare/charts.test.ts`.

**DoD**: ogni test copre il nuovo id e compila; nessuna regressione sui grafici
esistenti.

---

#### F3.3 — GLMM/GEE/LMM: polish e caterpillar (45 min)

**Obiettivo**: nessun grafico nuovo obbligatorio; allineare le convenzioni.

**Passi**

1. Verificare che i random effects (`glmm-random-effects`,
   `lmm-random-effects`) siano caterpillar plot leggibili: ordine per effetto,
   IC, linea dello zero.
2. Se manca, aggiungere `sort`/`reference` alle opzioni del runner (non nuovi
   kind).
3. Aggiornare `chartGuides` con la lettura corretta.

**Test**: test esistenti + compilazione.

**DoD**: i grafici dei modelli misti sono coerenti tra LMM, GLMM e GEE.

---

### O4 — Regressione

#### F4.1 — Stepwise, polynomial, penalized (60 min)

**Grafici**

1. `selection-coefficients` [bar] — coefficienti del modello scelto (R-01).
2. Verificare `polynomial-curve` e `polynomial-residuals`: se manca la banda CI,
   aggiungerla solo se `seMean` è già disponibile; altrimenti documentare.
3. Verificare `penalized-path` e `penalized-coefficients-chart`: aggiungere
   `penalized-cv` [line] solo se il kernel espone gli errori di
   cross-validazione.

**File**: `regression/selection.ts`, `regression/polynomial.ts`,
`regression/penalized.ts`, `analysisKinds.ts`, copy, help.

**Test**: `regression/charts.test.ts`.

**DoD**: la regressione ha un grafico per ogni modalità (OLS, polynomial,
stepwise, penalized) senza duplicare la diagnostica.

---

#### F4.2 — Multinomial, IV, PLS (60 min)

**Grafici**

1. `multinomial-confusion` [heatmap] (R-04).
2. `iv-first-stage` [scatter] — strumento vs variabile endogena (R-11).
3. `pls-loadings` [heatmap] — loadings X/Y (R-09).

**File**: `multinomial/run.tsx`, `iv/run.tsx`, `pls/run.tsx`,
`analysisKinds.ts`, copy, help.

**Test**: `charts.test.ts` per analisi.

**DoD**: i tre grafici compilano; le note spiegano cosa leggere.

---

#### F4.3 — Logistica, conteggi, ordinale: allineamento (45 min)

**Passi**

1. Verificare che probit usi la stessa curva della logistica e che la nota
   citi il link.
2. `countreg` e `ordinal` hanno già 6 e 4 grafici: controllare che il forest
   degli IRR/OR usi `jmp-ratio` (scala log, riferimento 1) e correggere se no.
3. Aggiornare `chartGuides`.

**Test**: test esistenti + compilazione.

**DoD**: i modelli a esito non continuo usano la stessa convenzione per i
rapporti.

---

#### F4.4 — Diagnostica di regressione (45 min)

**Passi**

1. Verificare `reg-observed-fitted`: per `k ≥ 2` resta punti + diagonale (la
   banda è un non-obiettivo documentato). Per `k = 1` usare `jmp-regression`.
2. Verificare che `reg-residual-fitted` usi `jmp-residual` come variante
   selezionabile e che la banda ±2 SD sia calcolata da `stats.residSd`.
3. Aggiornare il pannello `regressionDiagnosticPanel` se un grafico cambia id.

**Test**: `regression/charts.test.ts`, `panels.test.ts`.

**DoD**: la diagnostica resta completa e coerente con il pannello.

---

### O5 — Multivariata

#### F5.1 — Cluster, canonical, MDS, correspondence (60 min)

**Grafici**

1. `cluster-silhouette` [bar] — silhouette media per cluster (M-01;
   `ClusterResult.silhouette` esiste già come media globale: se serve il
   dettaglio per cluster, aggiungere una funzione pura con test).
2. `cluster-scatter` [scatter] — prime due variabili standardizzate, colore per
   cluster (non PCA: dichiararlo nella nota).
3. `canonical-corr` [bar] — correlazioni canoniche (M-02).

**File**: `cluster/run.tsx`, `canonical/run.tsx`, `analysisKinds.ts`, copy,
help.

**Test**: `cluster/charts.test.ts`, `canonical/charts.test.ts`.

**DoD**: i cluster sono leggibili come gruppi, non solo come dendrogramma.

---

#### F5.2 — SEM, latent class, IRT, conjoint (75 min)

**Grafici**

1. `sem-fit` [bar] — CFI, RMSEA, SRMR con soglie (M-05).
2. `latentclass-entropy` [bar] — entropia di classificazione o percentuale di
   casi assegnati con probabilità alta (M-06).
3. `irt-icc` [line] — curve caratteristiche degli item (M-07), calcolate dai
   parametri `alpha`/`b` con una funzione pura testata.

**File**: `sem/run.tsx`, `latentclass/run.tsx`, `irt/run.tsx`,
`analysisKinds.ts`, copy, help.

**Test**: `charts.test.ts` per analisi + test della funzione ICC.

**DoD**: i tre grafici compilano e hanno note interpretative corrette.

---

#### F5.3 — PCA/EFA/alpha e pannelli (45 min)

**Passi**

1. Verificare che `pca-scree`, `pca-score`, `pca-biplot` e i pannelli
   `pcaPanel` siano coerenti.
2. Se un grafico è ridondante (es. `pca-loadings` heatmap + `pca-loading-plot`
   scatter), non eliminarlo: è una scelta dell'utente. Documentare nel help.
3. Aggiornare `chartGuides`.

**Test**: test esistenti + `panels.test.ts`.

**DoD**: nessuna regressione; help aggiornato.

---

### O6 — Categoriche

#### F6.1 — Esatti, trend, verifica Mantel-Haenszel (45 min)

**Grafici**

1. `exact-observed-expected` [bar] — osservati vs attesi per le tabelle esatte
   (K-04).
2. `contingency-trend-line`: aggiungere banda/CI se i dati la supportano
   (K-02); altrimenti documentare.
3. `contingency-mh-forest` esiste già e mostra strati + pooled: verificare che
   la nota e l'asse (log-OR, riferimento 0) siano corretti. **Non** aggiungere
   un secondo forest.

**File**: `contingency/run.tsx`, copy, help.

**Test**: `contingency/charts.test.ts`.

**DoD**: i test esatti hanno un grafico osservati/attesi oltre alla heatmap;
il forest MH resta l'unico e corretto.

---

### O7 — Survival

#### F7.1 — Life table, competing, frailty, recurrent (45 min)

**Obiettivo**: nessun grafico nuovo; allineare le note e verificare i due
grafici di competing risks.

**Passi**

1. Verificare `survival-life-curve` + `survival-life-events`: la nota deve
   spiegare la differenza tra life table e KM.
2. Verificare `competing-cif` + `competing-forest`: il modello è stimato per una
   causa alla volta, quindi non si produce una CIF impilata (§6.4). La nota
   deve dirlo.
3. `recurrent-mcf` è in F1.1: qui si verifica l'integrazione con il forest.

**File**: `competing/run.tsx`, `survival/run.tsx`, copy, help.

**Test**: `competing/charts.test.ts`.

**DoD**: competing risks leggibile per causa; nessun grafico promesso e non
implementato.

---

#### F7.2 — Cox, stratified, time-dependent (45 min)

**Passi**

1. `cox-forest`, `stratcox-forest`, `tdcox-forest`: applicare `jmp-ratio`
   (scala log, riferimento 1) e verificare che gli IC non attraversino lo zero
   in modo ambiguo.
2. Verificare `cox-schoenfeld-*`: nota sull'ipotesi di rischi proporzionali.
3. `tdcox` resta a 1 grafico: il kernel non espone β(t); il limite è in
   §6.4. Non introdurre un grafico finto (β costante) per riempire il numero.

**File**: `cox/run.tsx`, `stratcox/run.tsx`, `tdcox/run.tsx`, copy, help.

**Test**: `charts.test.ts` per le tre analisi.

**DoD**: i forest dei rapporti sono su scala log; il limite di `tdcox` è
documentato in help e nello stato.

---

#### F7.3 — Parametric, ALT, reliability (75 min)

**Grafici**

1. `alt-life-stress` [scatter] — vita vs stress con fit su scala log; richiede
   una griglia di predizione (helper puro con test) se non già disponibile.
2. Verificare `parametric-*` (7 grafici): nessun nuovo grafico, solo coerenza
   delle note.
3. `reliability-growth` e `reliability-rbd`: verificare che il growth plot
   mostri i punti osservati e la curva fitted.

**File**: `alt/run.tsx`, `parametric/run.tsx`, `reliability/run.tsx`, copy,
help.

**Test**: `alt/charts.test.ts` + test dell'helper.

**DoD**: ALT ha il life-stress plot; parametric e reliability restano coerenti.

---

### O8 — Serie temporali

#### F8.1 — Holt-Winters, unit root, spettrale (45 min)

**Passi**

1. `hw-series` deve mostrare osservato, fitted e forecast con banda.
2. `unitroot-series` deve mostrare la serie con trend e la statistica ADF nella
   nota.
3. `spectral-density` deve avere una nota che spiega i picchi.

**File**: `timeseries/modes.tsx`, copy, help.

**Test**: `timeseries/charts.test.ts`.

**DoD**: le tre modalità hanno un grafico principale leggibile.

---

#### F8.2 — VAR, GARCH, state-space (60 min)

**Grafici**

1. `garch-qq` [qq] — residui standardizzati (`GarchFit.standardized`).
2. Verificare `var-irf-chart`, `var-fevd-chart`, `vecm-alpha`.
3. Verificare `statespace-*` (3 grafici).

**File**: `garch/run.tsx`, `var/run.tsx`, `statespace/run.tsx`, copy, help.

**Test**: `garch/charts.test.ts`.

**DoD**: GARCH ha la verifica di normalità dei residui standardizzati.

---

### O9 — Design, missing, ML, advanced

#### F9.1 — Sample size, resampling, DOE (60 min)

**Grafici**

1. `doe-alias` [heatmap] — correlazioni/alias tra colonne del disegno (Q-05).
2. Verificare `samplesize-*` (3) e `resampling-*` (3).

**File**: `doe/run.tsx`, copy, help.

**Test**: `doe/charts.test.ts`.

**DoD**: il disegno generato ha una mappa e una matrice di alias.

---

#### F9.2 — MI, survey, ML, text, choice (75 min)

**Grafici**

1. `survey-deff` [bar] — design effect per stima (N-02;
   `SurveyEstimate.deff` esiste).
2. Verificare `mi-*` (13): il cap di 24 grafici non è superato; se un nuovo
   grafico porta la card oltre il cap, ridurre i Q-Q o i pannelli, non
   aumentare il cap.
3. Verificare `ml-*`, `text-*`, `choice-*`.

**File**: `survey/run.tsx`, `mi/run.tsx`, copy, help.

**Test**: `survey/charts.test.ts`, `mi/charts.test.ts`.

**DoD**: survey mostra l'effetto del disegno; MI resta sotto il cap.

---

#### F9.3 — Bayes, meta, spatial (90 min)

**Grafici**

1. `bayes-ppc` [line] — repliche posteriori vs distribuzione osservata (A-01;
   `BayesResult.samples` esiste). Se la simulazione per tutte le modalità è
   troppo costosa, coprire `normal` e `proportion` e documentare le altre.
2. `spatial-variogram` [line] — variogramma sperimentale (A-03); richiede una
   funzione pura `variogram(points)` con test. Se il lavoro supera 45 min,
   spostarlo in F9.4 e chiudere la fase con Bayes + meta.
3. Verificare `meta-*` (3): funnel e forest su scala corretta.

**File**: `bayes/run.tsx`, `spatial/run.tsx`, `meta/run.tsx`, copy, help.

**Test**: `bayes/charts.test.ts`, `spatial/charts.test.ts` + test variogramma.

**DoD**: Bayes ha un controllo predittivo; spatial ha il variogramma (o F9.4
aperta con il solo variogramma).

---

### O10 — Formati JMP e integrazione editor

#### F10.1 — Forest, survival, line (45 min)

**Passi**

1. Applicare `jmp-ratio` a: `cox-forest`, `stratcox-forest`, `tdcox-forest`,
   `count-irr-forest`, `logistic-or-forest`, `ordinal-or-forest`,
   `gee-coefficient-forest`, `meta-forest` (dove il rapporto è il parametro).
2. Applicare `jmp-km` a: `survival-km`, `stratcox-km`, `parametric-survival`,
   `survival-life-curve`.
3. Applicare `jmp-connected` a: `ts-arima-chart`, `hw-series`, `var-irf-chart`.
4. Verificare che il forest con `logScale` non produca valori ≤ 0: se un IC
   contiene lo zero, il runner deve omettere la riga o usare la scala lineare
   e dichiararlo nella nota.

**Test**: `charts.test.ts` delle analisi toccate; `buildSpec.test.ts`.

**DoD**: le tre convenzioni sono applicate dove migliorano la lettura, senza
rompere i grafici esistenti.

---

#### F10.2 — Bar, Pareto, mosaico, heatmap, interval, dot (45 min)

**Passi**

1. `bar`: ordinamento e etichette per frequenze, GOF, pesi meta.
2. `pareto`: barre decrescenti + cumulata; verificare l'asse y secondario.
3. `mosaic`: valori e colore per residuo (factory).
4. `heatmap`: `diverging` per residui e correlazioni; `sequential` per
   loadings.
5. `interval`/`dot`: `jmp-mean-diamond` e `jmp-strip` disponibili dove ha senso.

**Test**: `buildSpec.test.ts` + test delle analisi toccate.

**DoD**: le convenzioni sono coerenti tra procedure che usano lo stesso kind.

---

#### F10.3 — Box, scatter, Q-Q: default per procedura (45 min)

**Passi**

1. Decidere per ogni procedura se il default del box è LazStats o JMP:
   - LazStats per la diagnostica (residui, robustezza);
   - JMP per Oneway/confronto gruppi (baffi 10–90, media con IC, jitter).
2. Se la procedura deve preselezionare JMP, emettere le opzioni nel runner
   (non cambiare il default del kind).
3. Stessa decisione per `scatter` (solo `regression` con `k = 1`) e `qq`
   (default già JMP).
4. Documentare la tabella delle scelte nello stato (registro decisioni).

**Test**: `styles.test.ts`, `charts.test.ts` delle analisi toccate.

**DoD**: nessuna procedura cambia formato per caso; ogni scelta è nel registro.

---

### O11 — Chiusura

#### F11.1 — Traduzioni batch (90 min)

**Passi**

1. Creare `src/stats/reportCopy/catalog/<locale>/charts-w10.ts` per
   `fr, es, de, pt-PT` con le stringhe dei nuovi grafici.
2. Mergiare in `src/stats/reportCopy/catalog/charts.ts` (non in
   `charts-extra.ts`, già al limite).
3. Tradurre `chartGuides` in `src/help/content/<locale>/charts.ts` per le
   procedure toccate.
4. Eseguire `npm run locales:check` per ogni lingua.
5. Revisione a campione: 10 stringhe per lingua, confronto con l'inglese.

**Nota**: usare lo skill `copy-translation` per le mappe JSON/TS, ma **non
fidarsi ciecamente**: le note statistiche vanno riviste a mano.

**Test**: `npm run locales:check`, `src/charts/copy.test.ts`,
`src/i18n.test.ts`.

**DoD**: nessuna stringa nuova resta in inglese in fr/es/de/pt-PT; i
placeholder sono identici.

---

#### F11.2 — Help, manuale, inventario (60 min)

**Passi**

1. Aggiornare `chartGuides` in tutte le lingue per ogni procedura toccata.
2. Aggiornare le pagine help delle procedure che citano i grafici (sezione
   "Charts").
3. Aggiornare `docs/analysis/2026-11-03-inventario-grafici-72-procedure.md`.
4. Aggiornare `docs/CHART-ENGINE.md` con le tre nuove varianti JMP e i nuovi
   kind se introdotti.
5. Aggiornare `docs/PROJECT-STATUS.md` solo a fine piano (conteggi, test).

**Test**: `src/help/content/content.test.ts` (o equivalente), `help:build`.

**DoD**: help e documentazione descrivono ciò che l'app fa davvero.

---

#### F11.3 — Gate finale e release (60 min)

**Passi**

1. `npm run check`.
2. `npm run test:samples`.
3. `npm run locales:check`.
4. `npx playwright test e2e/chart-editor.spec.ts e2e/chart-styles.spec.ts
   --project=desktop`.
5. `npm run build`.
6. Aggiornare `docs/PROJECT-STATUS.md` e il documento di stato con i numeri
   finali.
7. Preparare le note di release (grafici aggiunti per famiglia, convenzioni
   JMP, test).

**DoD**: tutti i gate verdi; stato chiuso; nessun debito non documentato.

---

## 8. Procedura standard per aggiungere un grafico (SOP)

1. **Verifica** che il grafico non esista: `npm run chart:inventory --
   --analysis <id>`.
2. **Scegli** il kind esistente più adatto (tabella §9). Non crearne uno nuovo
   se non è indispensabile.
3. **Verifica i dati**: apri il kernel e il runner; se il dato manca, aggiungi
   una funzione pura con test, oppure scarta il grafico.
4. **Scrivi il modello** con `makeChart` nel runner (o sub-runner).
5. **Aggiorna `analysisKinds.ts`** con il kind (il test lo pretende).
6. **Aggiorna `outputs.ts`** se il grafico è opzionale; se è obbligatorio, non
   inserirlo in nessun gruppo.
7. **Aggiungi il test** in `src/analyses/<id>/charts.test.ts`: id, kind,
   layer non vuoto, compilazione senza warning.
8. **Aggiungi la copy IT** (sorgente nel runner) e **EN** in
   `en/charts-w10.ts`.
9. **Aggiorna `chartGuides`** IT/EN.
10. **Esegui i test mirati**:
    ```bash
    node --import tsx --test src/analyses/<id>/charts.test.ts
    node --import tsx --test src/charts/analysisKinds.test.ts
    node --import tsx --test src/charts/copy.test.ts
    node --import tsx --test src/charts/vega/buildSpec.test.ts
    npm run lint
    ```
11. **Aggiorna lo stato** (fase, grafico, test, prossimi 3 passi) e committa.
12. **Solo a fine ondata**: `npm run check` completo.

### 8.1 Checklist dei file

- [ ] runner / sub-runner
- [ ] `src/charts/analysisKinds.ts`
- [ ] `src/charts/outputs.ts` (solo se opzionale)
- [ ] `src/charts/styles.ts` (solo se nuova variante)
- [ ] `src/charts/features.ts` (solo se nuova opzione)
- [ ] `src/stats/charts.ts` + `defaults.ts` (solo se nuova opzione)
- [ ] `src/charts/vega/buildSpec.ts` + layer (solo se nuovo kind)
- [ ] `src/stats/reportCopy/catalog/en/charts-w10.ts`
- [ ] `src/i18n/catalog/<6>/analysis.ts` (solo se nuove etichette chrome)
- [ ] `src/help/content/<6>/charts.ts`
- [ ] `src/analyses/<id>/charts.test.ts`
- [ ] `docs/analysis/2026-11-03-inventario-grafici-72-procedure.md`
- [ ] documento di stato

---

## 9. Contratti dati per kind (riferimento rapido)

| kind | Layer principali | Colonne tipiche | Note |
|---|---|---|---|
| `scatter` | `points`, `fit`, `robust`, `grid`, `band`, `rules`, `labels` | `x`, `y`, `group`, `lo`, `hi` | fit/band richiedono `grid` con `seMean`/`sePred` |
| `line` | `series`, `markers`, `rules`, `band` | `x`, `y`, `series`, `lo`, `hi` | step/marker da opzioni |
| `bar` | `bars`, `rules`, `regions` | `category`, `value`, `lo`, `hi` | sort e labels da opzioni |
| `box` | `summary`, `points`, `outliers`, `rules` | `category`, `min`, `q1`, `median`, `q3`, `max`, `mean`, `meanLo`, `meanHi`, `p10`, `p90` | `boxStats`/`boxRows` |
| `histogram` | `values`, `rules` | `value` | bin/KDE/rug da opzioni |
| `interval` | `intervals`, `rules` | `category`, `estimate`, `lo`, `hi` | `showMeanDiamond` |
| `dot` | `points` | `x`, `y`, `category`, `group` | jitter da opzioni |
| `ecdf` | `points` | `x`, `y`, `series` | `ecdfRows` |
| `qq` | `points`, `reference`, `band` | `theoretical`, `sample`, `lo`, `hi` | `qqPoints`/`qqBand` |
| `forest` | `points` | `label`, `estimate`, `lo`, `hi` | `logScale`, `reference` |
| `survival` | `curves`, `censored`, `medians`, `annotations` | `time`, `survival`, `lo`, `hi`, `series` | step/censure/CI |
| `risk` | `rows` | `time`, `atRisk`, `events`, `censored` | |
| `mosaic` | `cells` | `x`, `y`, `value`, `residual` | `mosaicCells` |
| `acf` | `bars`, `band` | `lag`, `value` | |
| `heatmap` | `cells` | `x`, `y`, `value` | `diverging`, `showValues` |
| `residual` | `points`, `rules` | `x`, `y`, `group` | ±2 SD da `stats.residSd` |
| `scree` | `points` | `component`, `eigenvalue`, `cumulative` | Kaiser |
| `score` | `points`, `vectors`, `ellipses` | `x`, `y`, `label` | |
| `bland` | `points`, `rules` | `x`, `y`, `mean`, `lo`, `hi` | |
| `power` | `line`, `markers`, `targets`, `design` | `x`, `y` | |
| `bootstrap` | `observed`, `ci`, `bca`, `values` | `value`, `lo`, `hi` | |
| `missingness` | `bars`/`cells` | `variable`, `missing`, `observed` | display bars/matrix |
| `diamond` | `intervals` | `category`, `estimate`, `lo`, `hi` | |
| `circles` | `intervals` | come `diamond` | |
| `shadowgram` | `values` | `value`, `group` | |
| `scattermatrix` | `panels`, `points`, `ellipses`, `labels` | coordinate normalizzate dal runner | |
| `bubble` | `points` | `x`, `y`, `size`, `label` | |
| `scatter3d` | `points` | `x`, `y`, `z`, `group` | proiezione dichiarata |
| `tree` | `links`, `nodes` | layout calcolato dal runner | |
| `pareto` | `bars`, `cumulative` | `category`, `value`, `cumulative` | |
| `dendrogram` | `links`, `leaves` | `x1`, `y1`, `x2`, `y2`, `label` | |
| `surface` | `lines`, `points` | `x`, `y`, `z` | mesh/contour |

**Regola**: se un layer non è in questa tabella, apri il file
`src/charts/vega/<famiglia>Layers.ts` e usa esattamente le chiavi che legge
`rowsOf`.

---

## 10. Aggiungere un nuovo kind (eccezione)

Ammesso solo se:

- nessun kind esistente può rappresentare il grafico senza inganni;
- il grafico è centrale per la procedura;
- il contratto dati è chiaro e serializzabile.

Procedura end-to-end (stimata 2–3 h, quindi **fase dedicata**):

1. `src/stats/charts.ts`: aggiungi il kind a `CHART_KINDS` e l'interfaccia
   opzioni.
2. `src/charts/defaults.ts`: `factoryOptions` + parse/merge.
3. `src/charts/features.ts` (o modulo split): controlli.
4. `src/charts/vega/<file>Layers.ts`: layer.
5. `src/charts/vega/buildSpec.ts`: case.
6. `src/charts/styles.ts`: default + eventuale variante.
7. `src/charts/analysisKinds.ts`: dichiara il kind.
8. `src/charts/vega/buildSpec.test.ts`: compilazione senza warning.
9. `src/charts/styles.test.ts`: default factory.
10. Copy/help/i18n.
11. Documenta in `docs/CHART-ENGINE.md`.

**Non** aggiungere un kind per: colori, temi, skin, layout che si possono
ottenere con opzioni esistenti.

---

## 11. Test e gate

### 11.1 Matrice dei test

| Test | Copre | Quando |
|---|---|---|
| `src/analyses/<id>/charts.test.ts` | id, kind, layer, compilazione | ogni fase che tocca l'analisi |
| `src/charts/analysisKinds.test.ts` | kind dichiarati vs runner | ogni nuovo kind |
| `src/charts/copy.test.ts` | copy EN | ogni nuova stringa |
| `src/charts/vega/buildSpec.test.ts` | compilazione di tutti i kind e stili | ogni modifica a opzioni/layer |
| `src/charts/styles.test.ts` | un default per kind, patch valide | ogni nuovo stile |
| `src/charts/outputs.test.ts` | gruppi opzionali | ogni nuovo grafico opzionale |
| `src/charts/panels.test.ts` | pannelli | se un id cambia |
| `src/charts/schema.test.ts` | parse/downsample | se cambia il contratto |
| `src/stats/reportCopy.test.ts` | prosa report | se cambia la prosa |
| `src/i18n.test.ts` | chiavi chrome | se cambiano etichette |
| `scripts/check-locale.mjs` | parità 6 lingue | fine ondata |
| `e2e/chart-editor.spec.ts` | editor | fine ondata con modifiche editor |
| `e2e/chart-styles.spec.ts` | gallery | se cambiano stili |

### 11.2 Comandi mirati

```bash
# un'analisi
node --import tsx --test src/analyses/meta/charts.test.ts

# contratti condivisi
node --import tsx --test src/charts/analysisKinds.test.ts src/charts/copy.test.ts
node --import tsx --test src/charts/vega/buildSpec.test.ts src/charts/styles.test.ts

# solo lint
npm run lint

# gate di ondata
npm run check
npm run locales:check
npx playwright test e2e/chart-editor.spec.ts --project=desktop
```

### 11.3 Regola dei gate

- **Fase**: test mirati + lint.
- **Fine ondata (O0…O11)**: `npm run check`.
- **Fine piano**: `check` + `test:samples` + `locales:check` + e2e + `build`.

---

## 12. Traduzioni e help

### 12.1 Dove va ogni stringa

| Tipo | Sorgente | EN | Altre lingue |
|---|---|---|---|
| Titolo/sottotitolo/nota/assi del grafico | `copy('...')` nel runner | `catalog/en/charts-w10.ts` | `catalog/<locale>/charts-w10.ts` |
| Etichetta di stile/controllo | chiave in `src/i18n/catalog/<locale>/analysis.ts` | idem | idem |
| Help "grafici della procedura" | `src/help/content/<locale>/charts.ts` | idem | idem |

**Punto di merge obbligatorio**: i file `charts-w10.ts` vanno importati e
spalmati in `src/stats/reportCopy/catalog/charts.ts`, che è il catalogo
risolto usato da `copy()`. `catalog/en/charts.ts` è già a 760 righe (eccezione
del file-size guard): **non aggiungere lì le nuove stringhe**. In F0.1,
allineare `src/charts/copy.test.ts` a `enChartCopy` (importato da
`catalog/charts.ts`) così ogni ondata futura è coperta automaticamente.

### 12.2 Flusso

1. Scrivi l'italiano nel runner (è la message id).
2. Aggiungi l'inglese a mano: è la fonte di verità per le altre lingue.
3. Per fr/es/de/pt-PT usa lo skill `copy-translation` o uno script una tantum;
   rivedi a campione.
4. Verifica i placeholder con `placeholdersOf` (i test lo fanno).
5. `npm run locales:check <locale>` per ogni lingua.

### 12.3 Regole di stesura

- Frasi brevi, voce attiva, niente gergo inutile.
- La nota dice **cosa leggere**, non ripete il titolo.
- Le unità e i livelli di confidenza sono espliciti.
- Non usare “JMP” nelle stringhe utente: si dice “stile JMP-like” solo nelle
  etichette della gallery, come già fatto.

---

## 13. Economia del contesto e checkpoint

### 13.1 Regole

1. Test mirati durante le fasi; gate completo a fine ondata.
2. Prima `grep -n`, `wc -l`, `git diff --stat`; poi `sed -n` sulle righe utili.
3. Output filtrati (`tail`, `grep`, `head`).
4. Call indipendenti in parallelo; niente ripetizioni.
5. Un solo scrittore; niente subagenti in scrittura.
6. Commit piccoli a fine fase.
7. Risposte finali brevi: cosa è cambiato, test, commit.

### 13.2 Aggiornamento dello stato

Dopo **ogni** fase, nel documento di stato:

- fase corrente e stato (fatto / in corso / bloccato);
- ultimo commit;
- grafici aggiunti/corretti (id);
- test eseguiti e esito;
- decisioni prese (formato, kind, dati);
- prossimi 3 passi;
- domande aperte e rischi.

### 13.3 Template di handoff (da incollare nello stato)

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

### 13.4 Quando compattare

- Solo a fine fase, con commit già creato.
- Mai a metà di una modifica.
- Non dichiarare verde un checkpoint con test rossi.

---

## 14. Rischi e mitigazioni

| Rischio | Impatto | Mitigazione |
|---|---|---|
| Copy inglese mancante nei sub-runner | stringhe italiane in UI EN | F0.1 estende `copy.test.ts`; ogni fase aggiunge EN |
| File oltre 700 righe | guardrail rosso | file per ondata (`charts-w10.ts`), split di `features.ts` |
| Stili che cambiano i dati | regressioni statistiche | test `styles.test.ts`; patch solo opzioni |
| Forest log con IC ≤ 0 | grafico vuoto/errato | omettere la riga o usare scala lineare con nota |
| Nuovi kind non necessari | costo e frammentazione | regola §10; preferire opzioni/layer esistenti |
| Cap 24 grafici superato (`mi`) | grafici mancanti | contare prima; ridurre Q-Q/pannelli, non alzare il cap |
| Worker non serializza | run heavy rotto | niente funzioni nei dati; test `schema` |
| Fase che sfora | contesto esaurito | split al primo blocco verde; commit |
| Traduzioni automatiche imprecise | note statistiche sbagliate | revisione a campione; inglese manuale |
| Perdita di coerenza tra procedure | grafici diversi per lo stesso kind | F10 applica le convenzioni in modo centralizzato |

---

## 15. Definition of Done globale

1. Ogni procedura del registro (escluso `wizard`) ha **1–3 grafici canonici**
   dichiarati nella matrice §6.
2. Ogni nuovo grafico:
   - compila in Vega-Lite senza warning;
   - è editabile, persistito, esportabile;
   - ha copy IT + EN + 4 lingue;
   - è in `chartGuides`;
   - ha un test dedicato.
3. Le tre varianti JMP (`jmp-ratio`, `jmp-km`, `jmp-connected`) sono
   selezionabili e applicate dove serve.
4. `npm run check` verde.
5. `npm run locales:check` verde.
6. `npm run test:samples` verde.
7. e2e editor/gallery verdi.
8. `docs/PROJECT-STATUS.md`, `docs/CHART-ENGINE.md` e l'inventario aggiornati.
9. Documento di stato chiuso con: fasi, commit, test, decisioni, debiti
   residui.

---

## 16. Appendici

### A. Riferimenti JMP (libri forniti)

| File | Libro | Capitoli utili |
|---|---|---|
| `jmp.pdf` | JMP Essentials, 2ª ed. | cap. 3 (catalogo grafici), 5.2 Distribution, 5.3 Fit Y by X, 6.2–6.4 Partition/Fit Model/Profiler |
| `jmp2.pdf` | JMP for Basic Univariate and Multivariate Statistics | cap. 4 Distribution, 5 associazione bivariata, 6 reliability, 7–8 t test, 10 MANOVA, 13 regressione, 14 PCA |
| `jmp3.pdf` | JMP Start Statistics, 6ª ed. | cap. 7 distribuzioni univariate, 8 differenza tra medie, 9 ANOVA, 10 curve, 11–12 categoriche, 13–14 modelli lineari, 15 DOE, 16 bivariate/multivariate, 17 exploratory modeling, 18 control chart |
| `jmp4.pdf` | Practical Data Analysis with JMP, 3ª ed. | control chart, variability chart, Pareto, regressione e profiler |

**Figure di riferimento già schedate**:
`docs/analysis/2026-11-02-confronto-grafici-jmp.md` (figure 5.6, 5.13, 5.21,
5.24, 5.26, 6.13, 6.16, 6.19, 6.41, 6.53, 6.55, 6.63, 6.67, 6.68, 6.75–6.78,
3.19–3.39, 4.1–4.56).

### B. Convenzioni dei nomi

- id grafico: `<prefisso-analisi>-<oggetto>` (`meta-forest`,
  `cox-forest`, `mi-trace`).
- id dinamici: `desc-hist-${name}`, `desc-qq-${name}`, `reg-partial-${n}`;
  nei gruppi si usa il pattern con `*`.
- id stile: `<kind>.<nome>` (`forest.jmp-ratio`,
  `survival.jmp-km`, `line.jmp-connected`).
- id fase: `F<ondata>.<progressivo>` (`F0.1`, `F10.3`).

### C. Comandi rapidi

```bash
# inventario
npm run chart:inventory
npm run chart:inventory -- --analysis cox

# test mirati
node --import tsx --test src/analyses/cox/charts.test.ts
node --import tsx --test src/charts/styles.test.ts src/charts/vega/buildSpec.test.ts

# gate
npm run check
npm run locales:check
npm run test:samples
npm run build

# e2e mirati
npx playwright test e2e/chart-editor.spec.ts --project=desktop
npx playwright test e2e/chart-styles.spec.ts --project=desktop
```

### D. Glossario

- **run-report**: output di una singola procedura (tabelle, prosa, grafici,
  metadati della card).
- **session-report**: insieme ordinato dei run-report nella finestra Output.
- **kind**: tipo semantico di grafico (`scatter`, `box`, `forest`, …).
- **layer**: insieme di righe già aggregate dentro `chart.data` (`points`,
  `bars`, `intervals`, …).
- **stile**: patch delle sole opzioni specifiche di un kind; non cambia dati.
- **LazStats-like**: default del motore.
- **JMP-like**: convenzione statistica documentata, opt-in.
- **pannello**: card composita L3 con figli `AnalysisChart` a profondità 1.

---

**Fine del piano.** Il documento di stato collegato è
`2026-11-03-grafici-procedure-stato.md`.
