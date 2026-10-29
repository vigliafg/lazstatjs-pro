/** English prose of the regression report and its tables. */
export const regressionCopy: Record<string, string> = {
  'Adjusted R²':
    'Adjusted R²',
  'Breusch–Pagan p':
    'Breusch–Pagan p',
  'Residui studentizzati |z| > 3':
    'Studentised residuals |z| > 3',
  'Jarque–Bera p':
    'Jarque–Bera p',
  'Lilliefors p':
    'Lilliefors p',
  'non cambia':
    'unchanged',
  aumenta:
    'increases',
  diminuisce:
    'decreases',
  'non stimabile':
    'not estimable',
  '{s1}: B = {s2} (CI {s3}% {s4}), {s5} → {s6}. In media, un aumento di una unità di {s7} {s8} {s9} di {s10} a parità delle altre variabili{s11}{s12}.':
    '{s1}: B = {s2} (CI {s3}% {s4}), {s5} → {s6}. On average, a one-unit increase in {s7} is associated with a {s10} change in {s9} ({s8}), holding the other variables constant{s11}{s12}.',
  'predittore significativo':
    'significant predictor',
  'nessuna evidenza di effetto':
    'no evidence of an effect',
  '; β standardizzato = {s1}':
    '; standardised β = {s1}',
  '; VIF = {s1} segnala collinearità':
    '; VIF = {s1} flags collinearity',
  'Il modello non è stimabile con i dati disponibili.':
    'The model cannot be estimated with the available data.',
  'Il modello è significativo (F = {s1}, {s2}) e spiega il {s3}% della variabilità di {s4}.':
    'The model is significant (F = {s1}, {s2}) and explains {s3}% of the variability of {s4}.',
  'Il modello non è significativo (F = {s1}, {s2}): i predittori non spiegano {s3} meglio del caso.':
    'The model is not significant (F = {s1}, {s2}): the predictors do not explain {s3} better than chance.',
  'Osservazioni usate: {s1} (solo righe complete su tutte le variabili del modello).':
    'Observations used: {s1} (only rows complete on all model variables).',
  'R² = {s1} → il modello spiega il {s2}% della variabilità di {s3}.':
    'R² = {s1} → the model explains {s2}% of the variability of {s3}.',
  'R² corretto = {s1} → quota spiegata al netto del numero di predittori; se è molto più basso di R² il modello è sovra-adattato.':
    'Adjusted R² = {s1} → share explained net of the number of predictors; if it is much lower than R² the model is overfitted.',
  'Test globale: F = {s1}, {s2} (α = {s3}) → {s4}.':
    'Global test: F = {s1}, {s2} (α = {s3}) → {s4}.',
  'il modello nel complesso è utile':
    'the model as a whole is useful',
  'il modello nel complesso non è distinguibile dal caso':
    'the model as a whole cannot be told apart from chance',
  'Ogni predittore':
    'Each predictor',
  'Breusch–Pagan {s1} → {s2}.':
    'Breusch–Pagan {s1} → {s2}.',
  'eteroschedasticità dei residui: gli errori standard e i p-value possono essere inaffidabili':
    'heteroscedasticity of the residuals: the standard errors and p-values can be unreliable',
  'nessuna evidenza di eteroschedasticità':
    'no evidence of heteroscedasticity',
  'Eteroschedasticità non verificabile.':
    'Heteroscedasticity cannot be checked.',
  'Normalità dei residui: Jarque–Bera {s1}{s2} → {s3}.':
    'Normality of the residuals: Jarque–Bera {s1}{s2} → {s3}.',
  ', Lilliefors {s1}':
    ', Lilliefors {s1}',
  'residui non gaussiani: gli intervalli di confidenza vanno letti con prudenza':
    'non-Gaussian residuals: the confidence intervals should be read with caution',
  'nessuna evidenza contro la normalità dei residui':
    'no evidence against the normality of the residuals',
  '{s1} osservazioni con residuo studentizzato oltre 3 SD: verificane l’influenza sulle stime.':
    '{s1} observations with a studentised residual beyond 3 SD: check their influence on the estimates.',
  'Nessun residuo studentizzato oltre 3 SD: nessun caso fortemente anomalo rispetto al modello.':
    'No studentised residual beyond 3 SD: no case strongly anomalous with respect to the model.',
  'VIF massimo = {s1} {s2}.':
    'Maximum VIF = {s1} {s2}.',
  '→ collinearità problematica: i coefficienti dei predittori coinvolti sono instabili':
    '→ problematic collinearity: the coefficients of the predictors involved are unstable',
  '→ collinearità sotto la soglia di attenzione (5)':
    '→ collinearity below the attention threshold (5)',
  'Stima robusta Theil–Sen':
    'Robust Theil–Sen estimate',
  'Confronto tra OLS e stimatore robusto{s1}: se le due pendenze sono simili, gli outlier non stanno distorcendo il risultato.':
    'Comparison between OLS and the robust estimator{s1}: if the two slopes are similar, outliers are not distorting the result.',
  ' ({s1})':
    '({s1})',
  'Pendenza OLS = {s1}, pendenza Theil–Sen = {s2} (CI {s3}% {s4}).':
    'OLS slope = {s1}, Theil–Sen slope = {s2} (CI {s3}% {s4}).',
  'Differenza percentuale: {s1}%.':
    'Percentage difference: {s1}%.',
  'B è il cambiamento atteso nella variabile dipendente per una unità in più del predittore, tenendo fermi gli altri: l’unità conta, e molto.':
    'B is the expected change in the dependent variable for one more unit of the predictor, holding the others fixed: the unit matters, and a lot.',
  'Il CI al {s1}% del coefficiente è la forbice dei valori plausibili: se contiene lo zero l’effetto non è distinguibile da nessun effetto.':
    'The {s1}% CI of the coefficient is the range of plausible values: if it contains zero the effect cannot be told apart from no effect.',
  'R² alto non significa modello corretto: guarda sempre residui, diagnostica e senso delle variabili.':
    'A high R² does not mean a correct model: always look at the residuals, the diagnostics and whether the variables make sense.',
  'I predittori con effetto affidabile sono: {s1}. L’associazione stimata non è una prova di causa-effetto: serve un disegno che escluda fattori confondenti.':
    'The predictors with a reliable effect are: {s1}. The estimated association is not proof of cause and effect: a design that rules out confounders is needed.',
  'Nessun predittore mostra un effetto affidabile: il modello, così com’è, non è uno strumento di previsione utile su questi dati.':
    'No predictor shows a reliable effect: as it stands, the model is not a useful prediction tool on these data.',
  'Equazione stimata: {s1} = {s2}{s3}.':
    'Estimated equation: {s1} = {s2}{s3}.',
  ' + ({s1}) × {s2}':
    '+ ({s1}) × {s2}',
  'Report di lettura — Regressione':
    'Reading report — Regression',
  'Modello utile':
    'Useful model',
  'Modello non utile':
    'Not a useful model',
  'Stima come {s1} cambia al variare di {s2} e quanto quella relazione spiega dei dati osservati.':
    'It estimates how {s1} changes with {s2} and how much that relationship explains of the observed data.',
  'Il modello cerca la retta (o l’iperpiano) che rende minima la somma degli scarti al quadrato: i coefficienti indicano l’effetto di ogni variabile tenendo ferme le altre.':
    'The model looks for the line (or hyperplane) that minimises the sum of squared deviations: the coefficients indicate the effect of each variable holding the others fixed.',
  'La regressione descrive associazioni, non cause: variabili omesse o invertite possono spiegare lo stesso pattern.':
    'Regression describes associations, not causes: omitted or reversed variables can explain the same pattern.',
  'Le previsioni valgono solo dentro l’intervallo dei valori osservati: fuori da quel range l’estrapolazione è arbitraria.':
    'Predictions hold only within the range of observed values: outside that range extrapolation is arbitrary.',
  'Le righe incomplete vengono scartate per intero: se i dati mancanti non sono casuali il modello può essere distorto.':
    'Incomplete rows are discarded entirely: if the missing data are not random the model can be biased.',
  '{s1} ~ {s2}':
    '{s1} ~ {s2}',
  'osservazioni complete (k = {s1} predittori)':
    'complete observations (k = {s1} predictors)',
  'R':
    'R',
  'quota di varianza spiegata':
    'share of variance explained',
  'corretto per numero di predittori':
    'adjusted for the number of predictors',
  'SE of estimate':
    'SE of estimate',
  '√(SSE / {s1})':
    '√(SSE / {s1})',
  'F({s1}, {s2})':
    'F({s1}, {s2})',
  'p (F)':
    'p (F)',
  'test globale del modello':
    'global test of the model',
  'n·ln(SSE/n) + 2(k+1)':
    'n·ln(SSE/n) + 2(k+1)',
  'n·ln(SSE/n) + ln(n)(k+1)':
    'n·ln(SSE/n) + ln(n)(k+1)',
  'Durbin–Watson':
    'Durbin–Watson',
  '≈2 assenza di autocorrelazione; ordine righe':
    '≈2 no autocorrelation; row order',
  'R² e F assumono un modello con intercetta. AIC/BIC sono definiti a meno di una costante additiva.':
    'R² and F assume a model with an intercept. AIC/BIC are defined up to an additive constant.',
  'ANOVA del modello':
    'Model ANOVA',
  'CI {s1}% · stima OLS':
    'CI {s1}% · OLS estimate',
  'Predictor':
    'Predictor',
  'β std.':
    'std. β',
  'Tolerance':
    'Tolerance',
  'VIF':
    'VIF',
  'CI: B ± t({s1}%, df = {s2})·SE. β std. = B·SD(x)/SD(y).':
    'CI: B ± t({s1}%, df = {s2})·SE. std. β = B·SD(x)/SD(y).',
  'VIF = 1/(1−R²_aux) da regressione del predittore sugli altri; valori > 5 indicano collinearità problematica.':
    'VIF = 1/(1−R²_aux) from regressing the predictor on the others; values > 5 indicate problematic collinearity.',
  'Leverage massimo':
    'Maximum leverage',
  'h_ii = x_iᵀ(XᵀX)⁻¹x_i':
    'h_ii = x_iᵀ(XᵀX)⁻¹x_i',
  'Cook\'s D massimo':
    'Maximum Cook\'s D',
  'valori > 1 indicano osservazioni influenti':
    'values > 1 indicate influential observations',
  'Cook\'s D > 1':
    'Cook\'s D > 1',
  'numero di osservazioni':
    'number of observations',
  'Breusch–Pagan LM':
    'Breusch–Pagan LM',
  'eteroschedasticità dei residui':
    'heteroscedasticity of the residuals',
  'χ² con {s1} df':
    'χ² with {s1} df',
  'White LM':
    'White LM',
  'quadrati e prodotti incrociati dei predittori':
    'squares and cross-products of the predictors',
  'White p':
    'White p',
  'RESET F (ŷ²)':
    'RESET F (ŷ²)',
  'non linearità da potenze dei valori adattati':
    'non-linearity from powers of the fitted values',
  'RESET p':
    'RESET p',
  'F con 1 e df del modello aumentato':
    'F with 1 and df of the augmented model',
  '|DFBETAS| massimo':
    'Maximum |DFBETAS|',
  'influenza su singolo coefficiente':
    'influence on a single coefficient',
  'DFBETAS oltre 2/√n':
    'DFBETAS beyond 2/√n',
  'soglia {s1}':
    'threshold {s1}',
  'Condition index massimo':
    'Maximum condition index',
  'X scalato a norma unitaria; > 30 collinearità':
    'X scaled to unit norm; > 30 collinearity',
  'Condition index > 30':
    'Condition index > 30',
  'numero di dimensioni coinvolte':
    'number of dimensions involved',
  'outlier sui residui studentizzati':
    'outliers on the studentised residuals',
  'Breusch–Pagan richiede l’ipotesi di normalità dei residui; con N piccolo ha potenza limitata.':
    'Breusch–Pagan requires the normality of the residuals; with small N it has limited power.',
  'White usa n·R² della regressione ausiliaria (quadrati e prodotti incrociati); RESET2 aggiunge ŷ². DFBETAS misura il cambio standardizzato di un coefficiente eliminando un’osservazione.':
    'White uses n·R² of the auxiliary regression (squares and cross-products); RESET2 adds ŷ². DFBETAS measures the standardised change of a coefficient when one observation is removed.',
  'Condition index di Belsley calcolato sugli autovalori di XᵀX dopo scala a norma unitaria: valori > 30 suggeriscono collinearità, > 100 sono gravi.':
    'Belsley\'s condition index computed on the eigenvalues of XᵀX after scaling to unit norm: values > 30 suggest collinearity, > 100 are serious.',
  'Residui oltre 3 SD':
    'Residuals beyond 3 SD',
  'Diagnostica dei residui':
    'Residual diagnostics',
  'OLS vs Theil–Sen':
    'OLS vs Theil–Sen',
  'Residui OLS':
    'OLS residuals',
  'Residui Theil–Sen':
    'Theil–Sen residuals',
  'I residui Theil–Sen sono disponibili per la regressione semplice; con più predittori il TS è univariato e non definisce un modello congiunto.':
    'Theil–Sen residuals are available for simple regression; with more predictors TS is univariate and does not define a joint model.',
  'Stimatore robusto Theil–Sen':
    'Robust Theil–Sen estimator',
  'Parametro':
    'Parameter',
  'OLS':
    'OLS',
  'Theil–Sen':
    'Theil–Sen',
  'TS CI low':
    'TS CI low',
  'TS CI high':
    'TS CI high',
  'Slope':
    'Slope',
  'Intercept':
    'Intercept',
  'Theil–Sen: mediana delle pendenze tra tutte le coppie di punti; CI bootstrap percentile (600 repliche, seed fisso).':
    'Theil–Sen: median of the slopes between all pairs of points; percentile bootstrap CI (600 replicates, fixed seed).',
  'Stimatori robusti univariati':
    'Univariate robust estimators',
  'OLS B':
    'OLS B',
  'Theil–Sen slope':
    'Theil–Sen slope',
  'Con più predittori il Theil–Sen è calcolato separatamente per ciascun predittore e non controlla gli altri: usarlo solo come diagnostica descrittiva.':
    'With more predictors Theil–Sen is computed separately for each predictor and does not control for the others: use it only as a descriptive diagnostic.',
  'Errori standard robusti':
    'Robust standard errors',
  'HC1 = n/(n−k−1); HC3 = 1/(1−h)². La matrice di covarianza robusta non assume varianza costante.':
    'HC1 = n/(n−k−1); HC3 = 1/(1−h)². The robust covariance matrix does not assume constant variance.',
  'I gradi di libertà restano n−k−1; con pochi casi i test robusti sono instabili.':
    'The degrees of freedom remain n−k−1; with few cases the robust tests are unstable.',
};
