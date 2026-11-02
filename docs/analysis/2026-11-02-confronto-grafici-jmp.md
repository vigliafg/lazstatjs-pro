# JMP Essentials vs LazStats Pro — confronto dei grafici per una, due e più variabili

- **Richiesta**: leggere `jmp.pdf`, andare ai capitoli delle procedure statistiche
  su una variabile, su più variabili e sulle regressioni, estrarre e analizzare
  i grafici prodotti da JMP rispetto ai nostri corrispondenti, e produrre un
  report su grafici uguali, diversi, migliori e mancanti.
- **Fonte JMP**: `jmp.pdf`, *JMP Essentials: An Illustrated Guide for New Users,
  Second Edition* (Hinrichs & Boiler, SAS Institute, 2014), 358 pagine.
  Capitoli letti: 3 (Index of Graphs), 5 (Problem Solving with One and Two
  Columns), 6 (Problem-Solving with Multiple Columns). Appendix B
  (Understanding Results) è citato dal libro come riferimento terminologico, ma
  non è stato analizzato figura per figura. Le figure sono state renderizzate
  dalle pagine PDF e lette direttamente, non solo dedotte dal testo.
- **Codice LazStats Pro**: albero di lavoro al commit `b3eaad0`, con modifiche
  locali non committate. I nomi dei grafici sono quelli dei `makeChart` nei
  runner e dei `kind` del motore Vega-Lite.
- **Metodo**: estrazione testo con `pdftotext`, rendering figure con
  `pdftoppm`, lettura delle figure, ispezione dei runner
  (`src/analyses/*/run.tsx`), del contratto `src/stats/charts.ts` e del motore
  `src/charts/vega/`.
- **Limiti**: il confronto è per **capacità grafiche e oggetti statistici**, non
  pixel-per-pixel e non sullo stesso dataset. Il libro usa `Financial.jmp`; noi
  non abbiamo eseguito le stesse procedure su quel file. JMP ha molte più
  piattaforme di quelle mostrate nel libro: quando scriviamo “JMP” intendiamo
  ciò che il libro documenta, salvo diversa indicazione.

## Sintesi esecutiva

**JMP vince soprattutto su:**

1. **Esplorazione univariata integrata**: una sola finestra Distribution
   contiene istogramma, outlier box, tabella dei quantili e, per le categorical,
   barre di frequenza. Da noi questi oggetti sono card separate e l’istogramma
   è solo per la prima variabile.
2. **Interattività**: dynamic linking, selezione per rettangolo, lasso, colori e
   marker di riga, Data Filter con animazione. Noi abbiamo un filtro statico
   prima del run, non un brushing collegato a tabelle e grafici.
3. **Modelli multi-variabile**: Partition (albero decisionale) e Prediction
   Profiler (what-if) non hanno un equivalente nel nostro registro.
4. **Scatterplot matrix** e **smoothing** (polinomiale, spline) con controllo
   interattivo del grado/lambda.

**Noi vinciamo soprattutto su:**

1. **Diagnostica di regressione**: residui vs stimati (modello multiplo),
   scale-location, residui standardizzati vs leverage, distanza di Cook,
   residui parziali, box e Q-Q dei residui, Theil-Sen, banda CI/PI selezionabile.
2. **Regressione logistica**: ROC, calibrazione, matrice di confusione, forest
   degli odds ratio, effetti marginali. Il libro mostra solo la curva logistica.
3. **Distribution Fit**: P-P plot, densità di più famiglie, confronto AIC/BIC.
4. **Correlazione**: heatmap della matrice, scatter dei ranghi di Spearman,
   coppie di scatter con ellisse.
5. **ANOVA**: forest post-hoc, residui vs medie di gruppo, Q-Q dei residui,
   box dei ranghi per Kruskal-Wallis.
6. **Varianti di distribuzione**: box notched, violin, raincloud, dotplot, ECDF,
   spread-vs-level.
7. **Prodotto**: modelli grafici persistiti nel `.lzs`, export, editor con
   preset/annotazioni, localizzazione in sei lingue.

**Parità di base**: istogramma, box plot, Q-Q normale, scatter con fit lineare
e banda, Oneway per gruppi, curva logistica, mosaico, Actual by Predicted,
residui vs stimati. Su Actual by Predicted e residui JMP è però più ricco
(curve di confidenza e linea della media).

**Lacune maggiori**: Partition, Prediction Profiler, dynamic linking/Data
Filter/lasso, scatterplot matrix, fit polinomiale/spline, distribuzione
categorica univariata, jitter e colorazione per gruppo, diamante della media
con IC.

## 1. Cosa copre il libro

| Area | Capitolo / sezione | Piattaforme JMP | Figure chiave |
|---|---|---|---|
| Una variabile | Cap. 5.2, pp. 171-182 | Analyze > Distribution | 5.6, 5.13; 3.19-3.21 |
| Due variabili | Cap. 5.3, pp. 183-192 | Analyze > Fit Y by X | 5.21-5.29; 3.26-3.31 |
| Più variabili | Cap. 6.2-6.4, pp. 197-252 | Partition, Fit Model, Data Filter, Prediction Profiler | 6.13-6.21, 6.51-6.78 |
| Catalogo grafici | Cap. 3, pp. 69-131 | Graph Builder, Distribution, Fit Y by X | 3.19-3.39 |
| Grafici generici | Cap. 4, pp. 133-167 | Graph Builder, Tabulate | 4.1-4.56 |

Il libro insiste su un punto che è anche il suo principale vantaggio: **grafici
e tabelle stanno insieme nello stesso report** e sono **dinamicamente
collegati** ai dati. La selezione di punti in un grafico evidenzia le stesse
righe negli altri grafici e nella tabella dati. Questo è un modello di
esplorazione, non solo un elenco di grafici.

## 2. Inventario dei grafici JMP

| # | Figura (PDF / libro) | Piattaforma | Grafico | Oggetti grafici e codifiche | A cosa serve |
|---|---|---|---|---|---|
| 1 | 5.6 / p. 176 | Distribution | Distribution report | Istogramma orizzontale + outlier box + tabella quantili; barre di frequenza per il nominale | Descrivere una colonna continua o categorica |
| 2 | 5.13 / p. 180 | Distribution | Outlier box con row states | Box, mediana, diamante della media, baffi, outlier; marker X rossi collegati alla tabella | Individuare estremi e collegarli ai casi |
| 3 | 5.21 / p. 186 | Fit Y by X | Oneway | Punti grezzi jittered per gruppo, linea della media, gruppi sull’asse X | Confrontare distribuzioni tra gruppi |
| 4 | 5.24 / p. 188 | Oneway | Means and Std Dev | Barre d’errore della media, linee di deviazione standard, tabella Means and Std Dev | Quantificare media e variabilità per gruppo |
| 5 | 5.26 / p. 190 | Oneway | Means and Quantiles | Box Q1-Q3, baffi al 10°-90° percentile, punti, tabella quantili | Leggere forma, code e valori estremi per gruppo |
| 6 | 6.13 / p. 207 | Partition | Profits before split | Y 0/1 jittered vs ordine riga, linea di split, nodo radice | Mostrare la separazione prima della prima split |
| 7 | 6.16 / p. 210 | Partition | Probabilities for each split | Nodi con Count, G², LogWorth, barre Probabile/Non probabile | Albero decisionale con probabilità |
| 8 | 6.19 / p. 212 | Partition | Leaf Report | Tabella dei nodi foglia che rispecchia l’albero | Leggere le combinazioni migliori/peggiori |
| 9 | 6.41 / p. 226 | Fit Y by X | Oneway dopo Data Filter | Punti dei soli casi inclusi, gruppi filtrati | Confronto su un sottoinsieme |
| 10 | 6.53 / p. 234 | Bivariate Fit | Scatter + Fit Line + Fit Mean | Punti, retta OLS rossa, linea verde della media | Relazione lineare e riferimento della media |
| 11 | 6.55 / p. 235 | Bivariate Fit | Confid Shaded Fit | Banda di confidenza al 95% intorno alla retta, più larga lontano dalla media di X | Mostrare l’incertezza della stima |
| 12 | 6.63 / p. 240 | Fit Y by X + Data Filter | Small multiples per gruppo | Sei scatter Profit × #emp, uno per Type, ciascuno con fit e banda | Vedere se la relazione cambia per gruppo |
| 13 | 6.67 / p. 243 | Fit Model | Actual by Predicted | Punti osservati vs predetti, diagonale rossa, curve tratteggiate di confidenza, linea blu della media | Valutare bontà del modello multiplo |
| 14 | 6.68 / p. 244 | Fit Model | Prediction Profiler | Piccoli pannelli per predittore, retta fitted + banda, linea rossa del valore corrente, stima Y e IC | What-if su più predittori |
| 15 | 6.75-6.78 / pp. 249-252 | Fit Model + Data Filter | Profiler per gruppo | Profiler ricalcolato per Aerospace, Beverages, Computer, Soap | Vedere come cambiano i segni degli effetti per gruppo |
| 16 | 3.20 / p. 102 | Distribution | Outlier Box Plot | Box Tukey, mediana, diamante della media, baffi, outlier | Valori estremi di una distribuzione |
| 17 | 3.21 / p. 103 | Distribution | Normal Quantile Plot | Punti, retta rossa, curve tratteggiate di confidenza, asse probabilità in basso e z in alto, box a sinistra | Verificare la normalità |
| 18 | 3.26 / p. 109 | Fit Y by X | Scatterplot | Punti colorati per gruppo, fit lineare, banda di confidenza | Relazione bivariata |
| 19 | 3.27 / p. 111 | Bivariate Fit | Polynomial Fit | Curva polinomiale di grado scelto, equazione sotto il grafico | Catturare curvature |
| 20 | 3.28 / p. 113 | Bivariate Fit | Spline Fit | Curva spline con parametro lambda, R² e SSE | Smoothing non parametrico |
| 21 | 3.29 / p. 115 | Oneway | Tre varianti | (a) punti jittered, (b) diamanti delle medie con IC, (c) box quantili con punti | Esplorazione, stima, distribuzione |
| 22 | 3.30 / p. 117 | Fit Y by X | Logistic Fit | Punti binari jittered, curva sigmoide, asse probabilità 0-1 | Probabilità di un esito binario |
| 23 | 3.38 / p. 128 | Graph Builder | Scatterplot Matrix | Triangolo inferiore, ellissi di densità, assi condivisi | Molte relazioni bivariate insieme |
| 24 | 3.39 / p. 130 | Graph Builder / Fit Model | Prediction Profiler | Come la figura 6.68 | What-if |

## 3. Inventario dei nostri grafici corrispondenti

| Procedura | Grafici emessi (id / `kind`) | Oggetti presenti | Note |
|---|---|---|---|
| **Descriptive** | `desc-means` bar; `desc-box` box; `desc-interval` interval; `desc-dot` dot; `desc-spread-level` scatter; `desc-pair-*` scatter; `desc-ecdf` ecdf; `desc-hist-*` histogram; `desc-qq-*` qq | Medie, IC, box/notch/violin/raincloud, punti, outlier, densità normale/KDE, rug, media, ECDF, Q-Q con banda o curve | Istogramma solo per la prima variabile; Q-Q max 8; coppie max 6 |
| **Distribution Fit** | `distfit-probability` qq; `distfit-pp` qq; `distfit-density` line; `distfit-criteria` bar | Probability plot, P-P, densità delle famiglie, AIC/BIC | Il probability plot usa la famiglia migliore |
| **T-Test** | `ttest-*-box` box; `ttest-*-mean` interval; `ttest-*-rank` box | Box, punti, media, regola del valore test, IC della media/differenza, ranghi | Fino a nove definizioni condizionali (3 rami) |
| **ANOVA** | `anova-box` box; `anova-means` bar; `anova-posthoc-forest` forest; `anova-residual-fitted` scatter; `anova-residual-qq` qq; `anova-rank-box` box | Box con punti, barre con IC, forest delle differenze, residui, Q-Q, ranghi Kruskal-Wallis | Post-hoc e diagnostica solo se richiesti |
| **Regression** | `reg-scatter` scatter (solo 1 predittore); `reg-observed-fitted` e `reg-residual-fitted` (solo ≥2 predittori); `reg-scale-location`; `reg-residual-leverage`; `reg-cooks`; `reg-partial-*`; `reg-residual-box`; `reg-residual-qq` | Punti, OLS, Theil-Sen, banda CI/PI, equazione/R²/N, diagonale, residui, soglie, Cook, residui parziali, box, Q-Q | Diagnostica molto più ampia del libro |
| **Correlation** | `corr-raw-scatter` scatter; `corr-rank-scatter` score; `corr-box` box; `corr-pair-*` scatter; `corr-heatmap` heatmap | Punti, ellisse, ranghi, box, coppie, matrice di correlazione | La heatmap non è uno scatter matrix |
| **Logistic** | `logistic-curve` line; `logistic-roc` line; `logistic-calibration` line; `logistic-confusion` heatmap; `logistic-or-forest` forest; `logistic-marginal` bar | Curva con marker 0/1, ROC/AUC, calibrazione, matrice di confusione, OR con IC, effetti marginali | Più completo della curva del libro |
| **Multivariate** | PCA: `pca-scree`, `pca-score`, `pca-loadings`, `pca-loading-plot`, `pca-biplot`; EFA: `efa-loadings`, `efa-parallel`, `efa-variance`, `efa-communalities`; alpha: `alpha-items`, `alpha-if-deleted`, `alpha-correlations` | Scree, score, loadings, biplot, parallel analysis, comunalità, item-total | Non è un sostituto della Partition |
| **Chi-Square / Contingency** | `chisq-observed-expected` bar; `chisq-mosaic` mosaic; `contingency-residuals` heatmap; `contingency-mosaic` mosaic; `contingency-association` bar | Barre osservati/attesi, mosaico, residui, associazioni | Parità col mosaico JMP |

## 4. Confronto diretto

### 4.1 Grafici che abbiamo e che JMP mostra

| Grafico | JMP | Noi | Verdetto |
|---|---|---|---|
| Istogramma continuo | Distribution, orizzontale, con box e quantili accanto | `desc-hist-*`, verticale, con densità/KDE/rug/media opzionali, solo prima variabile | **Parità parziale**: JMP meglio nel contesto; noi meglio nelle opzioni |
| Box plot | Outlier box e Oneway quantile box, con media e baffi 10-90 nel Oneway | `desc-box`, `anova-box`, box con Tukey 1.5 IQR, notch/violin/raincloud, punti | **Parità con differenze**: noi più varianti; JMP più oggetti inferenziali |
| Q-Q normale | Normal Quantile Plot con box laterale, assi probabilità/z e curve di confidenza | `desc-qq-*`, `reg-residual-qq`, `distfit-probability`; asse `both` e curve CI disponibili | **Parità sostanziale** |
| Scatter + fit lineare | Bivariate Fit con retta rossa, linea della media, banda 95% | `reg-scatter` con OLS/Theil-Sen, banda CI/PI, equazione/R²/N; banda spenta di default | **Parità con vantaggi incrociati**: noi più opzioni, JMP più riferimento della media e colorazione per gruppo |
| Oneway per gruppi | Punti jittered, mean diamonds, quantile box, tabelle Means/Quantiles | `anova-box`, `anova-means` con IC, forest post-hoc, residui, Q-Q, ranghi | **JMP meglio nell’esplorazione; noi meglio nella diagnosi** |
| Curva logistica | Logistic Fit: punti binari jittered + sigmoide | `logistic-curve` + ROC, calibrazione, confusion, OR forest, marginal | **Noi più completi** |
| Mosaico | Mosaic plot per due categoriche | `chisq-mosaic`, `contingency-mosaic` con valori e colore per residuo | **Parità** |
| Actual by Predicted | Punti, diagonale, curve di confidenza, linea media | `reg-observed-fitted` (solo modello multiplo): punti + diagonale | **JMP più completo** |
| Residui vs predetti | Fit Model residual plot | `reg-residual-fitted` (solo modello multiplo) e diagnostica aggiuntiva | **Noi più completi nel complesso** |

### 4.2 Stesso grafico, implementazione diversa

| Aspetto | JMP | Noi | Effetto pratico |
|---|---|---|---|
| Baffi del box | Oneway Quantiles: 10°-90° percentile; Outlier Box: convenzione Tukey | Sempre Tukey 1.5 IQR (`boxStats`) | Con code lunghe i due box mostrano baffi diversi; va dichiarato nel report |
| Media nel box | Diamante della media con intervallo di confronto | Punto/diamante della media, senza IC | JMP comunica l’incertezza della media; noi no |
| Punti nel box | Jitter orizzontale per gruppi | Punti sovrapposti al centro della categoria | Con molti casi i punti si nascondono; JMP è più leggibile |
| Layout Distribution | Istogramma + box + quantili + frequenze nello stesso pannello | Card separate, ordine titolo → tabelle → prosa → grafici | JMP favorisce la lettura congiunta; noi favoriamo l’export e l’editing |
| Q-Q | Box laterale + assi probabilità/z + curve | Q-Q standalone, asse `both` e curve disponibili | Quasi parità; manca solo la lettura congiunta col box |
| Retta di fit | Rossa, con linea verde della media | OLS tratteggiata rossa, Theil-Sen verde, banda opzionale | Stili diversi; noi offriamo il robusto, JMP il riferimento della media |
| Actual by Predicted | Curve tratteggiate di confidenza + linea blu della media | Solo diagonale | JMP mostra meglio la calibrazione globale |
| Scatter per gruppo | Colore per gruppo e fit per gruppo | Nessuna codifica colore/serie nei punti; nessun facet | JMP rende visibili le differenze tra gruppi |
| Istogrammi multipli | Un istogramma per ogni colonna selezionata | Solo la prima variabile | Per un’analisi descrittiva multipla JMP è più completo |
| Q-Q multipli | Uno per ogni colonna | Fino a 8 | Differenza pratica solo con molte variabili |
| Distribuzione categorica | Barre di frequenza nella stessa Distribution | Non c’è una procedura univariata per nominale/ordinale; le barre compaiono in chi-square/contingency | Lacuna funzionale, non solo grafica |
| Scelta della procedura | Il modeling type seleziona automaticamente Oneway/Bivariate/Contingency/Logistic | L’utente sceglie la procedura e i ruoli | JMP è più guidato; noi siamo più espliciti e flessibili |

### 4.3 Grafici che JMP ha e noi non abbiamo

| Gap | Figura JMP | Perché conta | Sforzo stimato |
|---|---|---|---|
| **Partition / albero decisionale** | 6.13-6.21 | Trova interazioni e soglie su molte X; gestisce missing informativo; produce leaf report | Medio-alto: nuovo kernel + nuovo `kind` |
| **Prediction Profiler** | 6.68, 6.75-6.78, 3.39 | What-if su più predittori; mostra segno e sensibilità degli effetti | Medio: `kind` a small multiples, prima statico poi interattivo |
| **Data Filter + animazione** | 6.63 | Sottoinsiemi dinamici senza rifare il run | Alto: richiede row state e ricalcolo |
| **Lasso / brushing / dynamic linking** | 5.7-5.13, 6.45 | Selezionare punti e vederli ovunque | Alto: architettura di selezione condivisa |
| **Scatterplot matrix** | 3.38 | Molte relazioni bivariate in un colpo d’occhio | Basso-medio: composizione di scatter/ellissi |
| **Fit polinomiale** | 3.27 | Curvatura non lineare con grado controllabile | Basso-medio: opzione del fit |
| **Fit spline** | 3.28 | Trend flessibile senza forma imposta | Medio: smoothing e lambda |
| **Parallel plot** | 3.32 | Confronto di profili su molte colonne | Medio |
| **Bubble / treemap / 3D scatter** | 3.34-3.36 | Visualizzazioni multi-colonna alternative | Medio |
| **Control chart / Pareto / variability / overlay** | 3.3 | Famiglia SPC e qualità | Alto: nuove procedure |
| **Mappe tematiche** | 3.2 | Dati geografici | Alto e fuori perimetro |
| **Grafico generico drag-and-drop** | Cap. 4 | Costruire grafici non previsti dalle procedure | Molto alto: è un prodotto diverso |
| **Diamante della media con IC** | 5.24, 3.29b | Inferenza visiva immediata sulla media | Basso: opzione del box |
| **Jitter e colore per gruppo** | 5.21, 3.26 | Evita overplotting e mostra i gruppi | Basso: codifica Vega-Lite |
| **Distribuzione categorica** | 3.19b | Base dell’analisi univariata per nominale/ordinale | Basso-medio: estensione Descriptive |

### 4.4 Grafici che abbiamo solo noi, o che sono più completi dei corrispondenti JMP

| Nostro punto di forza | Cosa facciamo | Cosa mostra il libro JMP | Perché è un vantaggio |
|---|---|---|---|
| Diagnostica di regressione | Scale-location, residui vs leverage, Cook, residui parziali, box e Q-Q dei residui | Solo Actual by Predicted e fit lineare nel capitolo | Più capacità di scoprire eteroschedasticità, outlier e non linearità |
| Fit robusto | Theil-Sen oltre a OLS, banda CI/PI 90/95/99 | Fit lineare e, fuori dal capitolo, robustezza | Utile con outlier e code pesanti |
| Logistica | ROC, AUC, calibrazione, confusion matrix, OR forest, effetti marginali | Solo curva logistica | Valutazione completa della classificazione |
| Distribution Fit | P-P, densità di più famiglie, AIC/BIC | Non è il focus del libro | Confronto esplicito tra famiglie |
| Correlazione | Heatmap, ranghi di Spearman, coppie con ellisse | Scatter matrix, senza heatmap | Sintesi numerica e confronto tra metodi |
| ANOVA | Forest post-hoc, residui, Q-Q, ranghi KW | Punti, medie, quantili | Più diagnosi e più test |
| Varianti distributive | Notched, violin, raincloud, dot, ECDF, spread-level | Box, histogram, normal quantile | Più rappresentazioni della stessa distribuzione |
| Persistenza e export | Modello grafico nel `.lzs`, PNG/HTML/Word, editor con preset e annotazioni | Script JMP e export, ma non lo stesso modello serializzato | Riproducibilità e condivisione più semplici |
| Localizzazione | UI e prosa in sei lingue | Libro e output JMP in inglese | Accessibilità per utenti non anglofoni |

## 5. Chi è migliore, dimensione per dimensione

| Dimensione | JMP | LazStats Pro | Verdetto |
|---|---|---|---|
| **Esplorazione univariata** | Distribution integrata, categoriche incluse, una finestra per più colonne | Grafici separati, istogramma solo prima variabile, Q-Q max 8 | **JMP** |
| **Confronto tra gruppi** | Jitter, mean diamond, quantili, tabelle contestuali | Box, barre con IC, forest post-hoc, residui, Q-Q | **Pareggio con vantaggi incrociati** |
| **Regressione lineare** | Fit lineare, banda, polinomiale, spline, Actual by Predicted | OLS/robusto, banda, diagnostica completa | **Noi sulla diagnosi; JMP sulla flessibilità del fit** |
| **Regressione logistica** | Curva; ROC e altre piattaforme non nel capitolo | Curva + ROC + calibrazione + confusion + OR + marginal | **Noi** |
| **Modelli multi-variabile** | Partition, Fit Model, Profiler, Data Filter | PCA/EFA/alpha, ma niente Partition/Profiler | **JMP** |
| **Interattività** | Brushing, lasso, filtri animati, linking | Filtro statico prima del run | **JMP** |
| **Leggibilità del report** | Grafici e tabelle nello stesso contesto | Card ordinate, ma grafici dopo le tabelle | **JMP per l’esplorazione; noi per l’export** |
| **Riproducibilità** | Script JMP, ma l’output è legato alla sessione | Modello grafico persistito, export e reload | **Noi** |
| **Accessibilità/localizzazione** | Inglese | Sei lingue | **Noi** |
| **Trasparenza statistica** | Molte opzioni dietro il triangolo rosso | Opzioni esplicite nell’editor, note e didascalie | **Pareggio** |

## 6. Priorità consigliate

### P0 — quick win, alto impatto e basso costo

1. **Scatterplot matrix** come composizione di scatter con ellissi, triangolo
   inferiore e assi condivisi. Riusa `scatter` + `ellipse` e colma un gap molto
   visibile del capitolo 3.
2. **Jitter e colore per gruppo** nei box e negli scatter. È una codifica
   Vega-Lite, non un nuovo motore.
3. **Diamante della media con IC** come opzione del box, per avvicinare il
   Oneway JMP senza perdere Tukey/notch/violin.
4. **Distribuzione categorica univariata**: barre di frequenza per
   nominale/ordinale, oggi assenti fuori da chi-square/contingency.
5. **Istogrammi per tutte le variabili** (con cap) invece del solo primo
   variabile; opzionale un pannello Distribution unico.

### P1 — oggetti statistici che cambiano il prodotto

6. **Prediction Profiler statico** per la regressione multipla: un pannello per
   predittore, retta fitted + banda, linea del valore corrente, stima Y e IC.
   La versione interattiva può arrivare dopo.
7. **Partition / albero decisionale** con split, probabilità, leaf report e
   gestione esplicita dei missing.
8. **Fit polinomiale e spline** nello scatter, con grado/lambda controllabili.
9. **Curve di confidenza e linea della media** nell’Actual by Predicted.
10. **Box laterale nel Q-Q** per replicare il layout JMP.

### P2 — architettura e famiglie nuove

11. **Row state, brushing, lasso e dynamic linking** tra grafici e tabella.
12. **Data Filter con animazione** e ricalcolo automatico.
13. **Graph Builder generico** drag-and-drop.
14. **Parallel plot, bubble, treemap, 3D scatter, control chart, Pareto,
    variability/overlay, mappe**.

## 7. Raccomandazione finale

Non conviene inseguire JMP sul terreno in cui è più forte da vent’anni:
l’interazione esplorativa e il grafico generico. Conviene invece:

1. **Portare dentro il nostro modello i tre oggetti statistici che oggi mancano
   davvero**: scatterplot matrix, Prediction Profiler, Partition.
2. **Correggere i quattro dettagli che fanno sembrare i nostri grafici “meno
   JMP” di quanto siano**: jitter, colore per gruppo, diamante della media con
   IC, distribuzione categorica.
3. **Difendere il vantaggio che già abbiamo**: diagnostica di regressione,
   logistico completo, Distribution Fit, ANOVA post-hoc, persistenza e
   localizzazione. Sono cose che il libro JMP non mostra e che i nostri
   corrispondenti fanno meglio.

In sintesi: **JMP è migliore come ambiente di esplorazione interattiva**;
**LazStats Pro è migliore come report statistico riproducibile e diagnosticamente
completo**. La priorità non è copiare JMP, ma aggiungere gli oggetti JMP che
mancano senza perdere la profondità diagnostica che abbiamo già.
