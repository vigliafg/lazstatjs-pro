# Inventario dei grafici delle 31 procedure e gap rispetto ai migliori programmi

- **Richiesta**: «per ogni tipo procedura statistica individua tutti i tipi di grafici e oggetti presenti dentro un grafico per quella procedura. documentati con i migliori programmi di statistics. fai l'inventario di quello che abbiamo e quello che dobbiamo ancora implementare. non tralasciare nessuna delle 31 procedure del nostro programma»
- **Perimetro**: tutte le 31 procedure del registro (`src/analyses/registry.ts:52-301`), tutti i `makeChart` dei runner, il motore Vega-Lite (`src/charts/vega/`) e le opzioni dell'editor (`src/charts/features.ts`). Fuori perimetro: tabelle del report, prosa, export HTML/Word/PNG, valori statistici non grafici.
- **Data e revisione del codice**: 2026-10-30, commit `8e12f92` (dopo box con tacca/violin).
- **Confronto per programma**: la tabella procedura × Minitab/SPSS/Stata/Statgraphics/jamovi/JASP è in `docs/analysis/2026-10-30-confronto-grafici-programmi.md`.
- **Programmi di riferimento**: JASP e jamovi (plot ggplot2), IBM SPSS Statistics (Chart Builder/GPL, Explore, GLM, ROC, KM/Cox), SAS (ODS Graphics, SGPLOT/SGPANEL, UNIVARIATE, LIFETEST, PHREG, LOGISTIC, MIXED/GEE, FACTOR), Stata (`twoway`, `graph box`, `marginsplot`, `stcurve`, `lroc`, `rvfplot`, `qnorm`, `ac`, `pac`, `mi`), R (ggplot2, GGally, survminer, forestplot/metafor, corrplot, performance, emmeans, marginaleffects, factoextra, vcd, mice/VIM, forecast), Minitab (boxplot, interval plot, probability plot, residual plots, power and sample size, matrix plot) e GraphPad Prism (column scatter, violin, box, ROC, survival, Bland–Altman, forest, heatmap).
- **Documentazione ufficiale consultata (capacità dichiarate, non test pixel-per-pixel)**: JASP <https://jasp-stats.org/manual/>, jamovi <https://docs.jamovi.org/>, IBM SPSS <https://www.ibm.com/docs/en/spss-statistics>, SAS <https://documentation.sas.com/>, Stata Graphics <https://www.stata.com/features/graphics/>, R ggplot2 <https://ggplot2.tidyverse.org/>, Minitab <https://support.minitab.com/>, GraphPad Prism <https://www.graphpad.com/guides/prism/latest/user-guide/>. Le versioni dei prodotti cambiano: il confronto è per capacità documentate, non per una versione bloccata. Le capacità elencate sono una **checklist di confronto**, non un audit pagina-per-pagina: prima di un piano di implementazione ogni gap va verificato sulla pagina ufficiale del prodotto/modulo.

## Stato implementazione (2026-10-31)

- **Corretti**: bar sort asc/desc (ordine per valore), heatmap sort (medie marginali), score labels testuali + ellipse, residual `showPoints`, survival mediane (calcolate dalle curve se `medians` manca), scatter `pointLabels` (feature esposta quando i punti hanno `label`).
- **Aggiunti come opzioni**: KDE sovrapposta all’istogramma (`showKde`), Q-Q detrendizzato (`detrended`).
- **Aggiunti come kind**: `interval` (point-range con CI), `dot` (dotplot), `ecdf` (cumulativa), `risk` (tabella dei soggetti a rischio), con grafici in Descriptive/Survival/Cox stratificato.
- **Diagnostica regressione**: `reg-scale-location`, `reg-residual-leverage`, `reg-cooks` (soglia 4/n, etichette delle osservazioni influenti) e un grafico di residui parziali per predittore (max 4).
- **Logistica**: `logistic-roc` (AUC in sottotitolo, diagonale di non discriminazione) e `logistic-calibration` (decili di probabilità stimata).
- **Survival/Cox**: `survival-risk` e `stratcox-risk` con conteggi a rischio ed eventi cumulati; `cox-baseline-hazard`, `cox-baseline-survival` e `cox-schoenfeld-*` (residui di Schoenfeld per covariata).
- **Test**: 653 unit test verdi, `npm run lint`, `npm run guard` e build verdi; chart-editor e analysis e2e desktop restano verdi.
- **Categoriche**: opzione barre `grouped` (affiancate) usata in Chi-square, GEE e ANCOVA; nuovo kind `mosaic` con grafico in Chi-square e Contingency; grafico dei residui di associazione.
- **Multivariate**: `pca-loadings` heatmap e `pca-biplot` con vettori delle variabili; per EFA `efa-loadings`, `efa-parallel`, `efa-variance`, `efa-communalities`; per alpha `alpha-items`, `alpha-if-deleted`, `alpha-correlations`. Alpha ed EFA non restituiscono più `charts: []`.
- **Ancora aperti**: P1/P2 del backlog (cappucci delle barre d’errore, EMM/post-hoc, missingness matrix, PACF/decomposition, precision curve, resampling density/QQ).
- **Revisione delle modifiche (2026-10-31)**: il sort delle barre resta attivo anche con etichette e barre d’errore (stessa `sort` su tutti i layer); l’interval plot descrittivo usa la t di Student come la tabella; `alpha-if-deleted` è omesso quando nessun valore è finito (scala a 2 item); `showMarkers` ripiega sulle righe `series`; la diagonale ROC resta lineare mentre la curva è a gradini; le baseline Cox sono a gradini con origine (0,0)/(0,1); i residui di associazione non usano più il raggruppamento fittizio.
- **Blocco mancanti/serie temporali/design (2026-10-31)**: MI con matrice dei mancanti (`display: matrix`), overlay ECDF osservati/completati, trace delle catene e forest dei coefficienti pooled; Time Series con PACF, decomposizione in due pannelli, ACF dei residui ARIMA e accuratezza dei modelli; Sample Size con curva di precisione; Resampling con densità bootstrap e Q-Q. Il kind `line` ora disegna anche `data.rules`.
- **Blocco fit/confronti (2026-10-31)**: Distribution Fit con P-P plot, densità di tutte le famiglie e confronto AIC/BIC; T-Test con mean plot e IC per una media, due gruppi e differenza appaiata; cappucci delle barre d’errore; banda Q-Q punto per punto in Descriptive, Regression e Distribution Fit.
- **Blocco modelli misti (2026-10-31)**: LMM con caterpillar degli effetti casuali; interaction plot di Factorial e Mixed ANOVA con banda IC della media di cella; Q-Q LMM con banda.

## Sintesi esecutiva

- **31 procedure**: **30 hanno almeno una modalità con grafici**; **Wizard** non ne produce (è una guida alla scelta). **Multivariate** ora produce grafici in tutte e tre le modalità: PCA, EFA e alpha.
- **112 punti `makeChart` statici** nei runner. `Descriptive` ha 5 grafici fissi (bar, interval, dot, ECDF, box) + **1 istogramma per la sola prima variabile** + **fino a 8 Q-Q** se `qqData` esiste.
- **22 kind su 22 in uso**: scatter, line, bar, box, histogram, interval, dot, ecdf, qq, forest, survival, risk, mosaic, acf, heatmap, residual, scree, score, bland, power, bootstrap, missingness.
- Diagnostica, categoriche e multivariate hanno aggiunto rispettivamente 4 siti in Regression, 2 in Logistic, 2 baseline + fino a 4 Schoenfeld in Cox, 1 risk table in Survival, 1 in Stratified Cox, 1 mosaico in Chi-square, 1 mosaico + 1 associazione in Contingency e 10 grafici tra PCA/EFA/alpha.
- Il motore ha una buona base: box/notched/violin, barre con IC/SE/SD, scatter con fit/bande/equazione/R²/N, Q-Q, heatmap, forest, KM, ACF, power, bootstrap, missingness.
- I gap maggiori non sono “mancano i grafici base”, ma **oggetti di confronto**: EMM/post-hoc, random effects/caterpillar, missingness matrix/convergence, PACF/decomposizione, precision curve. Diagnostica, mosaic e loadings/biplot sono ora coperti.
- **Difetti risolti**: sort barre e heatmap, `score.ellipse`/`score.showLabels`, `residual.showPoints`, mediane survival, etichette scatter, sort con etichette/error bar, CI dell’interval plot, alpha a 2 item, marker di calibrazione/parallel analysis, diagonale ROC, step delle baseline Cox, raggruppamento dei residui di associazione, `line` che ora disegna `rules`. **Limiti ancora aperti**: barre d’errore senza cappucci, nessuna banda Q-Q prodotta dai runner. Dettaglio nella sezione «Difetti e limiti confermati».

## Mappa degli oggetti per kind

Le lettere sono usate nelle tabelle per procedura. Ogni oggetto è un mark o un’annotazione dentro il grafico, non una statistica del sottotitolo.

| Kind | Oggetti presenti oggi | Opzioni esposte | Standard nei migliori programmi e oggetti mancanti |
|---|---|---|---|
| **scatter** | punti; linea OLS; linea robusta; banda CI/PI; regole orizzontali; testo equazione/R²/N; (etichette punti solo se `data.labels`, non raggiungibili) | mostra punti, fit none/OLS/robust/both, banda none/CI/PI, livello 90/95/99, opacità banda, equazione none/short/full, R², N | Standard: etichette punti, densità marginale/rug, ellisse di confidenza, LOESS, residui colorati, influenza, hexbin/2D density |
| **line** | linee per serie; marker; banda CI se i dati hanno lo/hi; gradini | step, marker, banda | Standard: LOESS/smoothing, regole di riferimento (il renderer non le disegna), annotazioni, doppio asse, bande previsionali con livello esplicito |
| **bar** | barre; serie colorata (impilata, non affiancata); barre d’errore come rule senza cappucci; etichette valori; regole di riferimento; ordine | errore none/SE/CI/SD, etichette, sort, reference line | SPSS Chart Builder, SAS SGPLOT, Stata `graph bar`, R, JASP/jamovi, Prism, Minitab: dot/interval plot, cappucci, barre affiancate, stacked/100% controllato, orizzontali, log, bracket/lettere post-hoc |
| **box** | scatola, mediana, baffi, cappucci, outlier, punti, media, etichetta mediana, regole di riferimento; display box/notched/violin | display, punti, outlier, media, etichetta mediana, sort | Standard: jitter/strip, raincloud, box+violin sovrapposti, bracket di gruppo, n per gruppo, box orizzontale, pesi, IC della mediana |
| **histogram** | bin; conteggi; curva normale; rug; linea della media | classi, densità normale, rug, linea media | Standard: KDE, istogrammi sovrapposti per gruppo, ECDF/cumulativa, PDF fittata, asse densità/log, larghezza bin |
| **qq** | punti; retta di riferimento; banda CI solo se `data.band` | riferimento, banda CI (visibile solo con dati) | Standard: envelope di confidenza, Q-Q detrendizzato, P-P, confronto tra distribuzioni, code evidenziate |
| **heatmap** | celle; etichette valori; scala divergente; legenda colore; sort applicato | valori, divergente, sort | Standard: clustering/dendrogramma, annotazioni riga/colonna, bordi cella |
| **forest** | stima puntuale; segmento CI; linea di riferimento 1/0; scala log; sort | log, reference, sort | Standard: diamond pooled, pesi, eterogeneità I², tabella affiancata, intervallo di previsione, sottogruppi, tick log personalizzati |
| **survival** | gradini; banda CI; tick di censura; linee mediane calcolate dalle curve; legenda | CI, censura, mediana, step | Standard: p log-rank in chart, competing risks/CIF, RMST, hazard ratio inset |
| **risk** | tabella testuale: tempi sulle ascisse, gruppi sulle ordinate, numero a rischio; eventi cumulati opzionali | eventi cumulati | Standard: tabella a rischio sincronizzata alla KM, IC, pesi, colonne di censura |
| **mosaic** | rettangoli proporzionali ai totali di riga e alla distribuzione condizionata; etichette di cella, riga e colonna; colore per residuo o riga | valori, colore per residuo | Standard: mosaico con shuffling, associazione, fourfold, sparkline dei residui |
| **acf** | barre/stick; banda ± | banda | Standard: PACF, etichette stagionali, Ljung-Box, bande di confidenza multiple |
| **scree** | barre; regola Kaiser **opzionale, spenta di default**; etichette valori | Kaiser, valori | Standard: parallel analysis, varianza cumulata, ginocchio annotato, loadings |
| **score** | punti; `showLabels` aggiunge solo tooltip, `ellipse` non ha layer | etichette, ellisse | Standard: biplot con frecce, loadings, ellissi di confidenza, etichette casi |
| **bland** | punti; bias; limiti di accordo; linea zero/identità opzionale | bias, LoA, identità | MedCalc, SPSS, SAS, Stata, R, Prism, Minitab: IC dei limiti, trend/proportional bias, identity x=y, differenza percentuale, etichette outlier |
| **power** | linea; marker; target; design marker | target, design | G*Power, JASP/jamovi, R, SAS, Minitab, Prism: curva di precisione, sensitivity, tabella design, annotazioni |
| **bootstrap** | istogramma; linea osservata; linee CI | osservato, CI | R boot, Stata, SAS, JASP/jamovi, Minitab, Prism: densità, Q-Q, BCa, p annotato, distribuzione nulla sovrapposta |
| **missingness** | barre; etichette | etichette | JASP/jamovi, SPSS, SAS, Stata, R (mice/VIM), Minitab: matrice/pattern dei mancanti, convergenza/trace, overlay osservati/imputati, strip |
| **residual** | punti; linea zero; `showPoints` rispettato | punti, zero line | Standard: usato per residui vs fitted; scale-location, leverage, Cook e residui parziali sono ora grafici scatter dedicati nel runner Regression |

### Tooltip e legenda per kind

**Tooltip**: presente su scatter, line, bar, box (punti/area), histogram, qq, heatmap, acf, scree, score, bland, power, bootstrap, missingness e residual; assente su **forest** e sulle **linee survival**. **Legenda**: solo quando esiste una codifica serie/colore (line, bar, heatmap, survival); assente negli altri kind. `score.showLabels` riusa il tooltip: se il tooltip comune è già attivo (default) non aggiunge un effetto visibile; non crea etichette testuali.

Diversi grafici sono condizionali: T-Test e Non-parametric RM emettono una variante per branch; Regression observed/residual richiede più predittori; Correlation raw/rank dipende dal numero di variabili e da Spearman; Time Series ARIMA/simple dipende dal modello; Stratified Cox emette KM per strato. Le tabelle per procedura vanno lette con queste condizioni.

Nelle tabelle per procedura, **«Standard»** significa che il gap è coperto da almeno uno tra JASP/jamovi, SPSS, SAS, Stata, R, Minitab e Prism; sono nominati solo gli strumenti distintivi (MedCalc per Bland–Altman, G*Power per la potenza, Minitab per l’identificazione delle distribuzioni). La lista completa delle fonti è in testa al documento.

## Inventario per procedura

### Famiglia Guided

| # | Procedura | Grafici e oggetti presenti | Gap rispetto ai migliori programmi | Priorità |
|---|---|---|---|---|
| 1 | **Wizard** (`wizard`) | **Nessun grafico** (`src/analyses/wizard/run.tsx` non chiama `makeChart`). Non ci sono oggetti grafici. | Non è una lacuna statistica: è una guida alla scelta. Un eventuale diagramma decisionale non sarebbe un grafico statistico. | — |

### Famiglia Descriptive

| # | Procedura | Grafici e oggetti presenti | Gap rispetto ai migliori programmi | Priorità |
|---|---|---|---|---|
| 2 | **Descriptive** (`descriptive`) | `desc-means` **bar**, `desc-interval` **interval** (media + CI), `desc-box` **box** (box/notch/violin), `desc-dot` **dot**, `desc-ecdf` **ecdf** (prima variabile), `desc-hist-*` **histogram** (prima variabile, normale/KDE), `desc-qq-*` **qq** (max 8, normale/detrendizzato). | Standard: raincloud, stem-and-leaf, spread-vs-level, scatter matrix, tail areas, n per gruppo, etichette outlier. | P1: mancano raincloud, stem-and-leaf, spread-level, scatter matrix. |
| 3 | **Distribution Fit** (`distfit`) | `distfit-probability` **qq** con banda, `distfit-pp` **qq** (P-P), `distfit-density` **line** (densità di tutte le famiglie), `distfit-criteria` **bar** (AIC/BIC affiancati). | Minitab Individual Distribution Identification, JASP/jamovi, R fitdistrplus, SAS/SPSS: PDF/CDF fittata sovrapposta all’istogramma, P-P plot, confronto tra più famiglie, zoom delle code, KS/AD annotati sul grafico. | **P1 chiuso** per P-P, confronto famiglie e criteri. Restano overlay su istogramma e zoom delle code. |

### Famiglia Compare groups

| # | Procedura | Grafici e oggetti presenti | Gap rispetto ai migliori programmi | Priorità |
|---|---|---|---|---|
| 4 | **T-Test** (`ttest`) | Sei definizioni **box** condizionali; `ttest-one-mean`, `ttest-ind-means`, `ttest-dep-mean` **interval** (media o differenza media con IC e regola di riferimento). Oggetti: scatola, mediana, baffi, cappucci, outlier, punti, media, regola; display notched/violin. | Standard: bar/dot delle medie con IC, paired slope/line, distribuzione delle differenze con densità, forest degli effect size, bootstrap della differenza, assumption plot. | **P1 parziale**: aggiunto il mean plot con IC. Restano paired slope/line e forest degli effect size. |
| 5 | **ANOVA** (`anova`) | `anova-box` **box** (scatola, mediana, baffi, cappucci, outlier, punti; display notched/violin); `anova-means` **bar** (barre, IC, etichette valori); `anova-rank-box` **box** per Kruskal-Wallis. | JASP/jamovi, SPSS GLM, SAS, Stata `marginsplot`, R emmeans: bracket/lettere post-hoc, forest degli effect size, residui vs fitted, Q-Q dei residui, Levene, EMM con IC, n per gruppo. | P1: diagnostica residui e post-hoc sono i gap principali. |
| 6 | **Factorial ANOVA** (`factorial`) | `factorial-interaction` **line**: medie cellulari, marker, banda IC della media di cella. | JASP/jamovi, SPSS GPL, SAS LSMEANS, Stata `marginsplot`, R emmeans, Minitab: interaction plot con IC/SE, barre delle medie cellulari, simple-effects, residui, post-hoc. | **P1 parziale**: interaction plot con IC fatto. Restano simple-effects e diagnostica. |
| 7 | **ANCOVA** (`ancova`) | `ancova-means` **bar**: medie grezze/aggiustate, IC, etichette, serie/legenda. | JASP/jamovi, SPSS EMM, SAS LSMEANS, Stata `marginsplot`, R emmeans: adjusted means con IC e cappucci, profilo per covariate, interazione, residui. | P1. |
| 8 | **Repeated ANOVA** (`repeatedanova`) | `repeated-means` **bar**: medie per condizione, IC, etichette. `repeated-trajectories` **line**: traiettorie dei soggetti, marker. | JASP/jamovi, SPSS GLM profile, SAS, Stata, R: profile plot con IC within, error bars, sphericity diagnostics, change plot, effect size. | P1. |
| 9 | **Mixed ANOVA** (`mixedanova`) | `mixed-interaction` **line**: interazione gruppo × condizione, marker, banda IC della media di cella. `mixed-trajectories` **line**: traiettorie, marker, legenda off. | JASP/jamovi, SPSS MIXED, SAS GLIMMIX, Stata `marginsplot`, R emmeans/lme4: EMM con IC, barre per gruppo, random effects/caterpillar, residui. | **P1 parziale**: interaction plot con IC fatto. Restano EMM/barre per gruppo e residui. |
| 10 | **Non-parametric RM** (`nonparamrm`) | `friedman-ranks` **bar** (ranghi medi, etichette); `mcnemar-discordant` **bar** (conteggi, etichette); `cochran-proportions` **bar** (proporzioni, etichette, base zero); `jonckheere-groups` **box** (ranghi, punti; display notched/violin). | Standard: post-hoc comparison plot, distribuzioni dei ranghi, heatmap delle coppie discordanti, effect size forest, paired slope. | P2. |
| 11 | **Equivalence (TOST)** (`tost`) | `tost-difference` **bar**: una barra con CI, etichetta, regole ai margini ±. | R TOSTER/equivalence, jamovi TOST, SPSS, Prism: area di equivalenza, forest/interval, p one-sided annotati, curva di densità, sample-size/power. | P1: manca la rappresentazione esplicita della regione di equivalenza. |

### Famiglia Regression

| # | Procedura | Grafici e oggetti presenti | Gap rispetto ai migliori programmi | Priorità |
|---|---|---|---|---|
| 12 | **Regression** (`regression`) | `reg-scatter` **scatter**: punti, OLS, Theil-Sen, banda CI/PI opzionale, equazione/R²/N. `reg-observed-fitted` **scatter**: punti + diagonale. `reg-residual-fitted` **residual**: punti + zero line. `reg-scale-location`, `reg-residual-leverage` (±2), `reg-cooks` (soglia 4/n, etichette delle osservazioni influenti), `reg-partial-*` **scatter** (component-plus-residual, max 4). `reg-residual-box` **box**; `reg-residual-qq` **qq**. | JASP/jamovi, SPSS, SAS, Stata `acprplot`, R `performance`/`car`, Minitab: forest dei coefficienti, calibrazione, pannello diagnostico unico, residui parziali con banda. | **Ridotto**: il pannello diagnostico essenziale c’è; restano forest dei coefficienti e pannello unico. |
| 13 | **Correlation** (`correlation`) | `corr-raw-scatter` **scatter** (punti, nessun fit/banda); `corr-rank-scatter` **score** (punti; etichette/ellisse no-op); `corr-box` **box** (tutte le variabili); `corr-heatmap` **heatmap** (celle, valori, diverging). | JASP/jamovi, SPSS, SAS, Stata `graph matrix`, R GGally/corrplot, Minitab matrix plot, Prism: scatter matrix/pairs, fit/LOESS sul raw, ellisse, partial correlation network, significatività/stelle, n per cella. | P1: manca la matrice di scatter e l’ellisse (no-op). |
| 14 | **Logistic Regression** (`logistic`) | `logistic-curve` **line**: probabilità stimata, marker 0/1, serie predetta/osservata. `logistic-roc` **line** con AUC e diagonale; `logistic-calibration` **line** sui decili, con diagonale di calibrazione perfetta. | JASP/jamovi, SPSS, SAS, Stata `lroc`/`marginsplot`, R pROC/performance, Prism: matrice di confusione/heatmap, forest degli OR, marginal effects, banda CI sulla curva, influence. | **P1 residuo**: ROC e calibrazione ci sono; restano confusion matrix, OR forest e marginal effects. |
| 15 | **Count Regression** (`countreg`) | `count-observed-fitted` **scatter** (punti + diagonale); `count-residual-fitted` **scatter** (punti + zero line). | R performance/countreg, Stata `estat`/`marginsplot`, SAS, jamovi GAMLj: rootogram, predicted counts, marginal effects, overdispersion diagnostic, residual QQ, influence. | P1/P2. |
| 16 | **Ordinal Logistic** (`ordinal`) | `ordinal-probabilities` **line**: curve di probabilità per categoria; nessuna banda/marker. | R `ordinal`/effects, Stata `marginsplot`, SAS, SPSS, JASP/jamovi: CI bands, marker, heatmap delle probabilità, proportional-odds diagnostics, observed vs predicted. | P2. |
| 17 | **Mixed Model (LMM)** (`lmm`) | `lmm-observed-fitted` **scatter** (diagonale); `lmm-residual-fitted` **scatter** (zero); `lmm-group-means` **bar**; `lmm-random-effects` **interval** (caterpillar BLUP con IC); `lmm-residual-qq` **qq** con banda. | JASP/jamovi, SPSS MIXED, SAS, Stata, R lme4/sjPlot: caterpillar/random effects, EMM, ICC plot, residui per gruppo, prediction intervals, influence. | **P1 chiuso** per caterpillar e Q-Q con banda. Restano EMM e prediction intervals. |
| 18 | **GEE** (`gee`) | `gee-observed-fitted` **scatter** (diagonale); `gee-cluster-means` **bar** (osservato/predetto per cluster, serie, etichette). | SAS GEE, Stata `xtgee`/`marginsplot`, R geepack, SPSS GEE: profili per cluster, marginal effects, working correlation, forest dei coefficienti, caterpillar dei cluster. | P1/P2. |

### Famiglia Multivariate

| # | Procedura | Grafici e oggetti presenti | Gap rispetto ai migliori programmi | Priorità |
|---|---|---|---|---|
| 19 | **Multivariate** (`multivariate`) | **PCA**: `pca-scree`, `pca-score`, `pca-loadings` **heatmap**, `pca-biplot` **score** con vettori delle variabili. **EFA**: `efa-loadings` **heatmap**, `efa-parallel` **line**, `efa-variance` **bar**, `efa-communalities` **bar**. **Alpha**: `alpha-items`, `alpha-if-deleted` **bar**, `alpha-correlations` **heatmap**. | JASP/jamovi, SPSS Factor, SAS, Stata, R factoextra/psych, Minitab, Prism: loading plot con IC, rotazioni multiple, diagnostica di adeguatezza, item-rest, omega gerarchico. | **P1 residuo**: loadings/biplot/parallel analysis ci sono; restano loading plot con IC e diagnostica avanzata. |

### Famiglia Categorical

| # | Procedura | Grafici e oggetti presenti | Gap rispetto ai migliori programmi | Priorità |
|---|---|---|---|---|
| 20 | **Chi-Square (χ²)** (`chisquare`) | `chisq-observed-expected` **bar** affiancata (osservati/attesi), `chisq-mosaic` **mosaic**. | JASP/jamovi, SPSS, SAS, Stata, R vcd, Minitab, Prism: association plot, fourfold, residui standardizzati heatmap, conteggi attesi/percentuali, annotazione Fisher. | **P1 ridotto**: mancano fourfold e annotazione Fisher nel grafico. |
| 21 | **Contingency (R×C)** (`contingency`) | `contingency-residuals` **heatmap**; `contingency-mosaic` **mosaic**; `contingency-association` **bar** dei residui standardizzati. | JASP/jamovi, SPSS, SAS, Stata, R vcd: mosaic con shuffling, fourfold, correspondence analysis, contributi delle celle. | **P1 ridotto**: mosaico e residui di associazione ci sono; restano fourfold e correspondence analysis. |
| 22 | **Agreement** (`agreement`) | `agreement-bland` **bland**: punti, bias, limiti di accordo; identità/zero opzionale. `agreement-kappa` **heatmap**: matrice di accordo, valori. `agreement-icc` **scatter**: punti + diagonale. | MedCalc, SPSS, SAS, Stata, R blandr/irr, Prism, Minitab: IC dei limiti di accordo, trend/proportional bias, identity x=y, ICC con CI/forest, kappa con CI, matrice con margini, etichette outlier. | P1. |

### Famiglia Survival

| # | Procedura | Grafici e oggetti presenti | Gap rispetto ai migliori programmi | Priorità |
|---|---|---|---|---|
| 23 | **Survival (KM)** (`survival`) | `survival-km` **survival**: gradini, banda CI, tick di censura, legenda, mediane calcolate dalle curve. `survival-risk` **risk**: numero a rischio per gruppo a 5 tempi, eventi cumulati opzionali. | JASP/jamovi, SPSS, SAS LIFETEST, Stata `sts graph`, R survminer, Prism, Minitab: p log-rank in chart, competing risks/CIF, RMST, hazard ratio inset, risk table con IC. | **P1 residuo**: risk table e mediane ci sono; restano log-rank annotato, CIF/RMST. |
| 24 | **Cox (PH)** (`cox`) | `cox-forest` **forest** (HR, CI, riferimento 1, scala log opzionale, sort). `cox-baseline-hazard` e `cox-baseline-survival` **line**; `cox-schoenfeld-*` **scatter** (max 4 covariati, linea zero). | SPSS Cox, SAS PHREG, Stata `stcox`/`estat phtest`/`stcurve`, R survival/survminer/cox.zph, JASP/jamovi: martingale residuals, predicted survival, coefficient table, spline/Schoenfeld smooth. | **Ridotto**: baseline e Schoenfeld ci sono; restano martingale e predicted survival. |
| 25 | **Stratified Cox** (`stratcox`) | `stratcox-forest` **forest**; `stratcox-km` **survival**; `stratcox-risk` **risk** con numero a rischio per strato. | SAS/Stata/R: baseline hazard per strato, Schoenfeld per strato, log-rank, forest con sottogruppi. | **P1/P2 ridotto**: resta baseline/Schoenfeld per strato. |
| 26 | **Time-Dependent Cox** (`tdcox`) | `tdcox-forest` **forest**: HR, CI, riferimento 1. | SAS/Stata/R: time-varying effect plot, Schoenfeld, baseline hazard, predicted survival, intervalli start-stop visualizzati. | P2. |
| 27 | **Parametric Survival** (`parametric`) | `parametric-survival` **survival** (curve per profilo; CI off, censura off, step off); `parametric-hazard` **line**; `parametric-cumhazard` **line**. | SAS LIFEREG, Stata `streg`/`stcurve`, R flexsurv, JASP/jamovi, Minitab: densità/istogramma con PDF fittata, Q-Q/probability plot, hazard con CI, median survival, AFT diagnostics. | P1/P2. |

### Famiglia Time series

| # | Procedura | Grafici e oggetti presenti | Gap rispetto ai migliori programmi | Priorità |
|---|---|---|---|---|
| 28 | **Time Series** (`timeseries`) | `ts-acf-chart` **acf** (ACF, banda ±), `ts-pacf-chart` **acf** (PACF), `ts-decomposition-trend` e `ts-decomposition-components` **line** (osservato/trend, stagionalità/residuo), `ts-residual-acf` **acf**, `ts-model-accuracy` **bar** (RMSE/MAE affiancati), `ts-arima-chart` **line** (osservato, previsione, marker, banda), `ts-simple-chart` **line**. | JASP/jamovi, SPSS, SAS, Stata `tsline`/`ac`/`pac`, R forecast/feasts, Minitab: PACF, decomposizione, ACF dei residui, spectral density, rolling statistics, tabella accuratezza, intervallo per il modello semplice. | **P1 chiuso**: aggiunti PACF, decomposizione, ACF dei residui e accuratezza. Restano spectral density e rolling statistics. |

### Famiglia Missing data

| # | Procedura | Grafici e oggetti presenti | Gap rispetto ai migliori programmi | Priorità |
|---|---|---|---|---|
| 29 | **Missing Data (MI)** (`mi`) | `mi-observed-density` e `mi-completed-density` **histogram**; `mi-observed-completed` **ecdf** (due curve); `mi-missingness` **missingness** (barre) e `mi-missingness-matrix` **missingness** con display matrix; `mi-trace` **line** (convergenza); `mi-pooled-forest` **forest** (coefficienti pooled, solo modello lineare). | JASP/jamovi, SPSS MI, SAS MI, Stata `mi`, R mice/VIM, Minitab: missingness matrix/pattern, overlay osservati/imputati, convergence/trace, strip, pooled estimates forest, incertezza delle imputazioni. | **P1 chiuso**: matrice, overlay, trace e forest pooled. Restano strip/pattern aggregati e incertezza per imputazione. |

### Famiglia Design & power

| # | Procedura | Grafici e oggetti presenti | Gap rispetto ai migliori programmi | Priorità |
|---|---|---|---|---|
| 30 | **Sample Size / Power** (`samplesize`) | `samplesize-power` **power**: linea, marker, target, design marker; `samplesize-precision` **line**: semiampiezza dell’IC al variare di n, regola sul margine richiesto. | G*Power, JASP/jamovi, R pwr, SAS POWER, Minitab, Prism: curva di precisione, sensitivity, tabella design, annotazioni. | **P1 chiuso**: aggiunta la curva di precisione. Restano sensitivity e annotazioni. |
| 31 | **Resampling** (`resampling`) | `resampling-bootstrap` **bootstrap**: istogramma, densità KDE opzionale, osservato, CI; `resampling-permutation` **bootstrap**: istogramma, osservato; `resampling-bootstrap-qq` **qq** della distribuzione bootstrap. | R boot, Stata `bootstrap`/`permute`, SAS, JASP/jamovi, Minitab, Prism: densità/Q-Q, BCa, p annotato, distribuzione nulla sovrapposta, iterazioni/CI. | **P2 parziale**: aggiunti densità e Q-Q. Restano BCa e p annotato. |

## Difetti e limiti confermati

Criterio: **P0** = controllo esposto che non produce l’oggetto promesso, o grafico che rischia di essere fuorviante; **P1** = oggetto standard mancante in più procedure/famiglie; **P2** = arricchimento di nicchia.

| # | Difetto / limite | Evidenza | Scenario, atteso vs reale | Stato | P |
|---|---|---|---|---|---|
| 1 | **Sort barre asc/desc non ordina per valore** | `src/charts/vega/layers.ts:159-205` | A=10, B=1. Atteso asc B,A e desc A,B; ora l’asse usa l’ordine per valore. | **CORRETTO** (test in `layers.test.ts`) | P0 |
| 2 | **Barre con serie impilate, non affiancate** | `barLayers` ora legge `grouping` e usa `xOffset` + `stack: null` quando è `grouped` | Chi-square, GEE e ANCOVA usano barre affiancate; il default resta impilato per compatibilità. | **CORRETTO** (test in `layers.test.ts`) | P1 |
| 3 | **Heatmap sort no-op** | `heatmapLayers` ora ordina x/y per media marginale | Asc/desc cambia l’ordine di righe/colonne. | **CORRETTO** (test in `layers.test.ts`) | P0 |
| 4 | **Score: etichette solo tooltip, ellisse no-op** | `scatterOnly` ora aggiunge testo da `points.label` e una linea ellittica (`confidenceEllipse`) | Etichette ed ellisse sono rese; la feature etichette è visibile solo con label nei punti. | **CORRETTO** (test in `layers.test.ts`, `common.test.ts`) | P0 |
| 5 | **Residual showPoints no-op** | `scatterOnly` ora salta il layer punti se `showPoints` è falso | Togliendo “Punti” restano la linea zero e gli altri oggetti. | **CORRETTO** (test in `layers.test.ts`) | P0 |
| 6 | **Survival showMedian senza dati** | `survivalLayers` calcola le mediane da `curves` quando `medians` manca (`survivalMedians`) | Le linee mediane compaiono sul punto in cui S(t) attraversa 0.5. | **CORRETTO** (test in `layers.test.ts`, `common.test.ts`) | P0 |
| 7 | **Scatter pointLabels non raggiungibile** | Feature `pointLabels` esposta quando i punti hanno `label`; il renderer usa `labels` o fallback `points.label` | Il controllo è raggiungibile solo con dati etichettati. | **CORRETTO** (feature + test in `features.test.ts`) | P1 |
| 8 | **Barre d’errore senza cappucci** | `barLayers` aggiunge due `tick` ai limiti oltre alla regola verticale | IC/SE/SD ora hanno terminazioni leggibili. | **CORRETTO** (test in `layers.test.ts`) | P1 |
| 9 | **Line non disegna `rules`** | `lineLayers` ora legge `data.rules` e disegna una regola per riga | Una reference line passata a un line chart compare (usata dalla curva di precisione). | **CORRETTO** (test in `layers.test.ts`) | P1 |
| 10 | **Q-Q CI non disponibile nei runner** | `qqBand` produce la banda punto per punto; Descriptive, Regression e Distribution Fit la passano al grafico con `showCI` | La feature ora è raggiungibile e visibile. | **CORRETTO** (test in `common.test.ts`) | P1 |
| 11 | **Sort barre perso con etichette/error bar** | `barLayers` ripete `sort` sui layer rule/text | Il dominio compilato non torna alfabetico e non emette il warning di sort in conflitto. | **CORRETTO** (test in `layers.test.ts`, `buildSpec.test.ts`) | P0 |
| 12 | **Interval plot descrittivo con z** | `buildDescriptiveOutput` usa `meanCI` (t, df = n−1) | Con n piccolo l’intervallo coincide con quello della tabella. | **CORRETTO** (test in `chartsCoverage.test.ts`) | P1 |
| 13 | **Alpha a 2 item senza barre** | Il grafico `alpha-if-deleted` è creato solo con almeno un valore finito | La card vuota non compare; scala a 2 item e item costanti non producono barre fantasma. | **CORRETTO** (test in `multivariate/run.test.ts`) | P1 |
| 14 | **`showMarkers` senza punti** | `lineLayers` ripiega sulle righe `series` quando `markers` manca | Calibrazione e parallel analysis mostrano i punti promessi dalla nota. | **CORRETTO** (test in `layers.test.ts`, `buildSpec.test.ts`) | P1 |
| 15 | **Diagonale ROC a gradini** | Le righe con `step: 0` restano in un layer lineare separato | La diagonale è retta, la curva ROC resta a gradini. | **CORRETTO** (test in `layers.test.ts`, `buildSpec.test.ts`, `logistic/run.test.ts`) | P1 |
| 16 | **Baseline Cox lineari** | `cox-baseline-hazard/survival` hanno `step: true` e origine (0,0)/(0,1) | Le curve sono funzioni a gradini. | **CORRETTO** (test in `cox/run.test.ts`) | P2 |
| 17 | **Residui di associazione raggruppati** | `contingency-association` non imposta più `grouping` | Le barre restano centrate sul tick della cella. | **CORRETTO** (test in `contingency/run.test.ts`) | P2 |

## Backlog prioritizzato (cosa implementare)

### P0 — oggetti già promessi dall’editor

Sono le voci **1, 3, 4, 5, 6** della tabella difetti: bar sort, heatmap sort, score labels/ellipse, residual showPoints, survival mediane; tutte chiuse con test. La **7** (scatter `pointLabels`) è chiusa esponendo la feature quando i punti hanno `label`.

### P1 — diagnostica e confronti standard

1. **Barre**: grouped/dodged e cappucci (difetti 2 e 8) **fatti**; point-range/dot plot già disponibili.
2. **Regression diagnostics**: **fatto** scale-location, residui vs leverage, Cook, residui parziali; restano forest dei coefficienti e pannello unico.
3. **Logistic**: **fatto** ROC e calibrazione; restano matrice di confusione/heatmap e forest OR.
4. **Survival**: **fatti** risk table, mediane, Schoenfeld e baseline; restano p log-rank annotato e CIF/competing risks.
5. **ANOVA/ANCOVA/RM/mixed**: EMM con IC, bracket/lettere post-hoc, diagnostica residui, profile plot con incertezza.
6. **Categorical**: **fatto** barre affiancate, mosaico e residui di associazione; restano fourfold e correspondence analysis.
7. **Multivariate**: **fatto** loadings heatmap, biplot, parallel analysis e grafici alpha/EFA; restano loading plot con IC e diagnostica avanzata.
8. **Missing data**: missingness matrix/pattern, convergenza/trace, overlay osservati/imputati, pooled forest.
9. **Time series**: PACF, decomposizione, ACF dei residui, accuratezza.
10. **Sample size**: precision curve.
11. **Q-Q**: envelope di confidenza (dati `band` nei runner).

Criterio di ordine: massimo impatto sul maggior numero di procedure; Regression, Survival e ANOVA/ANCOVA/RM/mixed vengono prima perché coprono più procedure e più gap diagnostici.

### P2 — arricchimento

1. Raincloud/jitter/ridge per box, box+violin sovrapposti, bracket di gruppo.
2. Cluster/dendrogramma per heatmap.
3. Scatter matrix/pairs per correlazione.
4. Resampling: densità/Q-Q, p annotato, BCa (procedura singola, fuori dal criterio P1).

## Copertura test e residui non verificati

- `src/charts/vega/buildSpec.test.ts` compila **tutti i 22 kind** e le tre modalità box (box/notched/violin) senza warning; verifica anche matrice dei mancanti, barre ordinate con etichette/error bar e linee a gradini con diagonale lineare.
- `src/charts/features.test.ts` verifica il registro feature, display box e la visibilità dei controlli; non copre i no-op elencati.
- `src/charts/kits/common.test.ts` e `src/charts/vega/boxLayers.test.ts` coprono n, KDE, notch e ordine categorie.
- Playwright `e2e/chart-editor.spec.ts` copre editor, pannello specifico, display notched/violin, screenshot chiaro/scuro, reload; non copre ogni ramo condizionale delle 31 procedure.
- **Residui non verificati**: ordine barre realmente reso (serve test su A=10/B=1); heatmap sort, score labels/ellipse, residual showPoints, survival mediane; capacità dei programmi esterni (checklist, non audit pagina-per-pagina); copertura runtime di tutti i rami dei runner (Multivariate, Descriptive, T-Test, Non-parametric RM, Time Series).

## Panel dei critici e riconciliazione

Domande poste a entrambi i critici: copertura delle 31 procedure; corrispondenza id/kind e oggetti; condizioni e grafici dinamici; gap vs programmi di riferimento; veridicità dei no-op; priorità; conteggi; Wizard; test mancanti; affermazioni non verificabili. I critici hanno lavorato in parallelo sulla stessa mappa e sulle stesse domande.

| # | Rilievo | Chi | Decisione | Esito |
|---|---|---|---|---|
| 1 | Multivariate: alpha ed EFA non producono grafici; la sintesi non lo diceva | Luna | accettato | Aggiunta la distinzione PCA/alpha/EFA e la nota “30 procedure hanno almeno una modalità con grafici”. |
| 2 | Conteggi: 68 siti, non 66; qq=4, histogram=3 | GLM, Luna | accettato | Sintesi, frequenze e sezione Descriptive corrette; 68 è la somma verificata. |
| 3 | Descriptive: un solo istogramma (prima variabile), fino a 8 Q-Q | Luna | accettato | Riga 2 e sintesi corrette. |
| 4 | Bar sort: lo scenario B=10/A=1 non distingueva alfabetico e valore | Luna | accettato | Scenario corretto A=10/B=1; stato `CONFERMATO (compile)`, test reso ancora da aggiungere. |
| 5 | Score: `showLabels` è solo tooltip, non etichette; `ellipse` no-op | Luna, GLM | accettato | Difetto 4 e matrice corretti; caveat sul tooltip comune già attivo. |
| 6 | Fonti dei programmi non tracciabili | Luna | accettato con limite | Aggiunte le documentazioni ufficiali e la nota “checklist, non audit pagina-per-pagina”; restano da verificare le pagine specifiche. |
| 7 | Tooltip/legenda non censiti sistematicamente | Luna | accettato | Aggiunta la sintesi tooltip/legenda per kind; tabella ridotta a 3 righe. |
| 8 | Ripetizione matrice kind ↔ tabelle per procedura | GLM | parzialmente accettato | La matrice resta la checklist degli oggetti; le tabelle per procedura restano perché la richiesta è per procedura. Ridotta la prosa, non la copertura. |
| 9 | Sezioni test/non verificate duplicate | GLM | accettato | Accorpate in “Copertura test e residui non verificati”. |
| 10 | Difetto 7 (`pointLabels`) violava il criterio P0 | GLM, Luna | accettato | Spostato a P1; P0 = 1,3,4,5,6; P1 include pointLabels. |
| 11 | PCA: Kaiser è spento di default | Luna | accettato | Matrice e riga PCA dicono “Kaiser opzionale, spento di default”. |
| 12 | P2 con tabelle/annotazioni fuori perimetro e BCa di nicchia | GLM | accettato | Rimossi tabelle/annotazioni; BCa spostato a P2; P1 resta per oggetti multi-procedura. |
| 13 | Grafici condizionali non sempre esplicitati | Luna | accettato | Aggiunta la nota sulle condizioni (T-Test, Non-parametric RM, Regression, Correlation, Time Series, Stratified Cox). |
| 14 | Ordine barre non testato nel rendering | Luna | accettato come limite | Dichiarato in “residui non verificati”; il test e2e/render è un passo successivo. |

Nessun BLOCKER resta aperto. Le modifiche richieste nel secondo giro sono state applicate; restano solo le verifiche runtime e la tracciabilità puntuale delle fonti esterne.

## Verdetti dei critici (verbatim)

- **Luna, primo giro: REJECT** — «la copertura per modalità e i conteggi non sono affidabili, e il confronto richiesto con i programmi esterni non è documentato in modo verificabile».
- **Luna, secondo giro: APPROVE_WITH_CHANGES** — «le correzioni principali del primo giro sono recepite: conteggi e Descriptive, modalità Multivariate e diagnosi dello sort sono sostanzialmente corretti; le fonti e la tabella tooltip/legenda sono migliorate. Non approverei il documento senza ritocchi: correggere lo stato della regola di Kaiser e la coerenza delle priorità».
- **GLM, primo giro: APPROVE_WITH_CHANGES** — «inventario sostanzialmente valido e già scritto senza sprechi maggiori, ma i due conteggi sbagliati (68≠66, qq 4, histogram 3) vanno corretti: sono i fatti carrelli».
- **GLM, secondo giro: APPROVE_WITH_CHANGES** — «il report risponde già a tutte e tre le parti della richiesta (per-procedura, oggetti per kind, gap vs standard); le modifiche residue sono compressioni, una riclassificazione P0→P1 (difetto 7) e due tagli P2 YAGNI. Nessun BLOCKER».

**Nota di processo**: non c’è un terzo giro (limite di due). Le correzioni del secondo giro sono state applicate; le verifiche runtime e le fonti puntuali restano elencate come residui, non come consenso implicito.

