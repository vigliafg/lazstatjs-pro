/** English: W2 report and table prose. */
export const w2Copy: Record<string, string> = {
  'Sì':
    'Yes',
  'Nessun gruppo cade fuori dalle linee di decisione: le medie sono compatibili con la media generale.':
    'No group falls outside the decision lines: the means are compatible with the overall mean.',
  '{s1} gruppo/i cadono fuori dalle linee di decisione: {s2}.':
    '{s1} group(s) fall outside the decision lines: {s2}.',
  'Report di lettura — ANOM':
    'Reading report — ANOM',
  'L’ANOM (analisi delle medie) confronta ogni media di gruppo con la media generale, usando linee di decisione che tengono conto del numero di gruppi e della variabilità entro gruppo.':
    'ANOM (analysis of means) compares each group mean with the overall mean, using decision lines that account for the number of groups and the within-group variability.',
  'È la versione grafica e intuitiva dell’ANOVA: invece di un solo test globale mostra quali gruppi si allontanano.':
    'It is the graphical, intuitive version of ANOVA: instead of a single global test it shows which groups depart.',
  'Le linee sono costruite al livello α = {s1}%; un gruppo fuori dagli intervalli merita un controllo, non una conclusione automatica.':
    'The lines are built at the α = {s1}% level; a group outside the intervals deserves a check, not an automatic conclusion.',
  'Con gruppi sbilanciati ogni gruppo ha limiti propri, perché la sua media ha una precisione diversa.':
    'With unbalanced groups each group has its own limits, because its mean has a different precision.',
  'Cautele':
    'Cautions',
  'Il valore critico usa l’approssimazione Bonferroni-t: è leggermente conservativo rispetto alla distribuzione esatta del massimo modulo studentizzato.':
    'The critical value uses the Bonferroni-t approximation: it is slightly conservative relative to the exact distribution of the maximum studentized modulus.',
  'L’ANOM non sostituisce l’ANOVA: serve a localizzare le differenze, non a stimarne l’entità.':
    'ANOM does not replace ANOVA: it serves to locate differences, not to estimate their size.',
  'Con molti gruppi e pochi dati per gruppo la potenza resta bassa.':
    'With many groups and little data per group, power remains low.',
  'Il test presuppone osservazioni indipendenti e variabilità confrontabile tra i gruppi.':
    'The test assumes independent observations and comparable variability across groups.',
  'Report di lettura — Modello lineare generalizzato':
    'Reading report — Generalized linear model',
  '{s1} spiegato da {s2} predittore/i con famiglia {s3} e link {s4}; devianza = {s5}.':
    '{s1} explained by {s2} predictor(s) with family {s3} and link {s4}; deviance = {s5}.',
  'Il modello non ha raggiunto la convergenza: le stime non sono affidabili.':
    'The model did not converge: the estimates are not reliable.',
  'Regressione':
    'Regression',
  'Il GLM estende la regressione lineare a risposte non normali: la famiglia definisce la varianza, il link collega la media ai predittori.':
    'The GLM extends linear regression to non-normal responses: the family defines the variance, the link connects the mean to the predictors.',
  'La scelta di famiglia e link è parte del modello: non è un dettaglio tecnico, cambia il significato dei coefficienti.':
    'The choice of family and link is part of the model: it is not a technical detail, it changes the meaning of the coefficients.',
  'Devianza = {s1} su {s2} gradi di libertà; devianza nulla = {s3}.':
    'Deviance = {s1} on {s2} degrees of freedom; null deviance = {s3}.',
  'Log-verosimiglianza = {s1}; AIC = {s2}; iterazioni = {s3}.':
    'Log-likelihood = {s1}; AIC = {s2}; iterations = {s3}.',
  '{s1} predittore/i su {s2} risultano significativi al livello scelto.':
    '{s1} predictor(s) out of {s2} are significant at the chosen level.',
  '{s1}: B = {s2} (CI {s3} – {s4}), p = {s5}.':
    '{s1}: B = {s2} (CI {s3} – {s4}), p = {s5}.',
  'Come leggerlo':
    'How to read it',
  'Con link log i coefficienti sono differenze di log-media: exp(B) è un rapporto di medie, non di probabilità.':
    'With a log link the coefficients are differences in log-means: exp(B) is a ratio of means, not of probabilities.',
  'Con link logit/probit la risposta è una probabilità: B va letto sulla scala latente.':
    'With a logit/probit link the response is a probability: B must be read on the latent scale.',
  'Con famiglia Gamma la risposta deve essere strettamente positiva; con Poisson deve essere un conteggio.':
    'With the Gamma family the response must be strictly positive; with Poisson it must be a count.',
  'Controlla la devianza residua e i residui: un modello può convergere e restare mal specificato.':
    'Check the residual deviance and the residuals: a model can converge and still be misspecified.',
  'Il motore copre le famiglie gaussiana, binomiale, Poisson e Gamma; Tweedie e quasi-verosimiglianze non sono incluse.':
    'The engine covers the Gaussian, binomial, Poisson and Gamma families; Tweedie and quasi-likelihoods are not included.',
  'La bontà del modello non è riassunta da un R²: confronta devianza, AIC e diagnostica dei residui.':
    'Goodness of fit is not summarised by an R²: compare deviance, AIC and residual diagnostics.',
  'La regressione probit modella la probabilità di un esito binario (sì/no) tramite la funzione di ripartizione normale standard, invece del logit usato dalla regressione logistica.':
    'Probit regression models the probability of a binary outcome (yes/no) through the standard normal cumulative distribution function, instead of the logit used in logistic regression.',
  'Come leggere i coefficienti probit':
    'How to read probit coefficients',
  'B misura lo spostamento del predittore latente normale: exp(B) non è un odds ratio e non va letto come tale.':
    'B measures the shift of the normal latent predictor: exp(B) is not an odds ratio and must not be read as one.',
  'I coefficienti sono stimati al netto degli altri predittori e con un CI al {s1}%: un intervallo che contiene 0 corrisponde a un effetto non significativo.':
    'The coefficients are estimated net of the other predictors and with a {s1}% CI: an interval containing 0 corresponds to a non-significant effect.',
  '{s1}: {s2}% di classificazioni corrette ({s3} su {s4}).':
    '{s1}: {s2}% correct classifications ({s3} out of {s4}).',
  'Report di regressione multinomiale':
    'Multinomial regression report',
  'Il modello distingue {s1} classi con un’accuratezza del {s2}%; la classe di riferimento è “{s3}”.':
    'The model distinguishes {s1} classes with an accuracy of {s2}%; the reference class is “{s3}”.',
  'La regressione logistica multinomiale modella la probabilità di appartenenza a ciascuna di più classi nominali (non ordinate) a partire da uno o più predittori.':
    'Multinomial logistic regression models the probability of belonging to each of several nominal (unordered) classes from one or more predictors.',
  'Ogni classe è confrontata con la classe di riferimento “{s1}”: i coefficienti descrivono quanto il logit di quella classe cambia rispetto al riferimento per un’unità in più del predittore.':
    'Each class is compared with the reference class “{s1}”: the coefficients describe how much the logit of that class changes relative to the reference for one additional unit of the predictor.',
  'Sono state analizzate {s1} osservazioni complete su {s2} classi e {s3} predittore/i.':
    '{s1} complete observations were analysed across {s2} classes and {s3} predictor(s).',
  'Il modello classifica correttamente il {s1}% delle osservazioni; la classe con l’accuratezza più alta è {s2}.':
    'The model correctly classifies {s1}% of the observations; the class with the highest accuracy is {s2}.',
  '{s1} ({s2}%)':
    '{s1} ({s2}%)',
  'non disponibile':
    'not available',
  '{s1} predittore/i mostrano almeno un coefficiente significativo al livello scelto ({s2}).':
    '{s1} predictor(s) show at least one significant coefficient at the chosen level ({s2}).',
  'Nessun coefficiente raggiunge la significatività al livello scelto.':
    'No coefficient reaches significance at the chosen level.',
  'Convergenza del modello: {s1}.':
    'Model convergence: {s1}.',
  'Accuratezza per classe':
    'Accuracy by class',
  'La tabella di classificazione non è disponibile.':
    'The classification table is not available.',
  'Come leggere i coefficienti':
    'How to read the coefficients',
  'Un odds ratio maggiore di 1 indica che un’unità in più del predittore aumenta le probabilità della classe rispetto al riferimento; un valore minore di 1 le riduce.':
    'An odds ratio greater than 1 indicates that one additional unit of the predictor increases the odds of the class relative to the reference; a value below 1 decreases them.',
  'Gli odds ratio sono stimati al netto degli altri predittori e con un intervallo di confidenza al {s1}%: se l’intervallo contiene 1 l’effetto non è distinguibile da zero.':
    'The odds ratios are estimated net of the other predictors and with a {s1}% confidence interval: if the interval contains 1, the effect is not distinguishable from zero.',
  'I test sui coefficienti sono di Wald (z = B/SE): con campioni piccoli o classi rare possono essere meno affidabili di un confronto basato sulla verosimiglianza.':
    'The coefficient tests are Wald tests (z = B/SE): with small samples or rare classes they can be less reliable than a likelihood-based comparison.',
  'Le osservazioni devono essere indipendenti tra loro (una riga = una unità).':
    'Observations must be independent of one another (one row = one unit).',
  'Le classi dell’esito sono nominali: l’ordine alfabetico o numerico non implica una graduatoria.':
    'The outcome classes are nominal: alphabetical or numerical order does not imply a ranking.',
  'La relazione tra ogni predittore e il logit delle classi è lineare: controlla la forma o usa trasformazioni.':
    'The relationship between each predictor and the class logits is linear: check the shape or use transformations.',
  'Servono osservazioni sufficienti per ogni classe: classi rare o vuote rendono le stime instabili.':
    'Sufficient observations are needed for each class: rare or empty classes make the estimates unstable.',
  'La separazione perfetta (classi predette senza errori) gonfia i coefficienti e invalida i test.':
    'Perfect separation (classes predicted without errors) inflates the coefficients and invalidates the tests.',
  'Non sono inclusi effetti casuali, interazioni tra predittori o regressione penalizzata.':
    'Random effects, interactions between predictors and penalised regression are not included.',
  'L’accuratezza dipende dalla distribuzione delle classi: confrontala sempre con la frequenza della classe più comune.':
    'Accuracy depends on the class distribution: always compare it with the frequency of the most common class.',
  'Il modello non gestisce esiti ordinati: per categorie ordinate serve una regressione ordinale.':
    'The model does not handle ordered outcomes: ordered categories require an ordinal regression.',
  'Report di lettura — ANOVA gerarchica':
    'Reading report — Hierarchical ANOVA',
  '{s1} dentro {s2}: effetto esterno {s3}, effetto interno {s4}.':
    '{s1} within {s2}: outer effect {s3}, inner effect {s4}.',
  'L’ANOVA gerarchica tratta un fattore annidato dentro un altro: ogni livello del fattore interno appartiene a un solo livello del fattore esterno.':
    'Hierarchical ANOVA deals with a factor nested within another: each level of the inner factor belongs to a single level of the outer factor.',
  'È il disegno tipico di classi dentro scuole, soggetti dentro centri o lotti dentro fornitori.':
    'It is the typical design of classes within schools, subjects within centres or batches within suppliers.',
  'Fattore esterno {s1}: F = {s2}, p = {s3}.':
    'Outer factor {s1}: F = {s2}, p = {s3}.',
  'Fattore interno {s1}: F = {s2}, p = {s3}.':
    'Inner factor {s1}: F = {s2}, p = {s3}.',
  'Se il fattore esterno è significativo, i gruppi maggiori differiscono tra loro oltre la variabilità delle sottoclassi.':
    'If the outer factor is significant, the larger groups differ from one another beyond the variability of the subclasses.',
  'Se il fattore interno è significativo, le sottoclassi differiscono dentro i gruppi: la struttura annidata spiega una parte della variabilità.':
    'If the inner factor is significant, the subclasses differ within the groups: the nested structure explains part of the variability.',
  'Non interpretare il fattore interno come un effetto principale “pulito”: il suo significato dipende dal fattore esterno.':
    'Do not interpret the inner factor as a “clean” main effect: its meaning depends on the outer factor.',
  'Il modello assume normalità e varianza costante entro cella; con celle molto sbilanciate le stime dei componenti di varianza sono approssimate.':
    'The model assumes normality and constant variance within cells; with very unbalanced cells the variance component estimates are approximate.',
  '{s1}: {s2} (CI {s3} – {s4}), {s5}.':
    '{s1}: {s2} (CI {s3} – {s4}), {s5}.',
  'Report di lettura — Regressione non lineare':
    'Reading report — Nonlinear regression',
  'La curva {s1} aderisce bene ai dati: spiega il {s2}% della variabilità di {s3}.':
    'The {s1} curve fits the data well: it explains {s2}% of the variability of {s3}.',
  'La curva {s1} spiega il {s2}% della variabilità di {s3}: l’adattamento è parziale.':
    'The {s1} curve explains {s2}% of the variability of {s3}: the fit is partial.',
  'La curva {s1} spiega solo il {s2}% della variabilità di {s3}: la forma scelta non descrive bene i dati.':
    'The {s1} curve explains only {s2}% of the variability of {s3}: the chosen shape does not describe the data well.',
  'R² {s1}':
    'R² {s1}',
  'La regressione non lineare stima i parametri di una curva scelta a priori, invece di una retta: la forma del modello è un’ipotesi, non un risultato dei dati.':
    'Nonlinear regression estimates the parameters of a curve chosen a priori instead of a straight line: the model shape is a hypothesis, not a result of the data.',
  'Il confronto tra curve diverse non si fa con l’R²: modelli con un numero diverso di parametri vanno confrontati con criteri che penalizzano la complessità.':
    'Different curves are not compared with R²: models with a different number of parameters should be compared with criteria that penalise complexity.',
  'La curva e i suoi parametri':
    'The curve and its parameters',
  'Modello {s1} stimato su {s2} osservazioni, con {s3} gradi di libertà residui; la convergenza è stata raggiunta in {s4} iterazioni.':
    'Model {s1} estimated on {s2} observations, with {s3} residual degrees of freedom; convergence was reached in {s4} iterations.',
  'R² = {s1}, R² corretto = {s2}, RMSE = {s3} (nella unità di {s4}).':
    'R² = {s1}, adjusted R² = {s2}, RMSE = {s3} (in the unit of {s4}).',
  'Parametri stimati':
    'Estimated parameters',
  'La convergenza dice che l’algoritmo ha trovato un punto stabile, non che il modello sia quello giusto: controlla sempre i residui e la forma della curva.':
    'Convergence means the algorithm found a stable point, not that the model is right: always check the residuals and the shape of the curve.',
  'L’algoritmo non ha raggiunto la convergenza: le stime non sono affidabili e non vanno lette come risultato.':
    'The algorithm did not converge: the estimates are not reliable and should not be read as a result.',
  '{s1} parametri su {s2} hanno un p sotto il {s3}%: un parametro non significativo può comunque essere necessario alla forma della curva.':
    '{s1} out of {s2} parameters have p below {s3}%: a non-significant parameter may still be necessary for the shape of the curve.',
  'La curva interpolata tra i punti osservati è una sintesi del modello: fuori dall’intervallo dei dati la sua forma non è verificata.':
    'The curve interpolated between the observed points is a summary of the model: outside the data range its shape is not verified.',
  'La scelta della curva deve venire dalla conoscenza del fenomeno, non dal solo confronto degli R².':
    'The choice of curve must come from knowledge of the phenomenon, not from the comparison of R² alone.',
  'Le stime ai minimi quadrati sono sensibili ai valori estremi e ai punti con leva alta.':
    'Least-squares estimates are sensitive to extreme values and high-leverage points.',
  'Gli errori standard assumono residui indipendenti e a varianza costante: con dati nel tempo o misure ripetute vanno rivisti.':
    'Standard errors assume independent residuals with constant variance: with time-series data or repeated measures they must be revised.',
  'Con pochi punti rispetto ai parametri la stima è instabile: servono più osservazioni che parametri.':
    'With few points relative to the parameters the estimate is unstable: more observations than parameters are needed.',
  'Report di lettura — Regressione penalizzata':
    'Reading report — Penalised regression',
  '{s1}: {s2} coefficienti non nulli su {s3} (λ = {s4}, α = {s5}).':
    '{s1}: {s2} non-zero coefficients out of {s3} (λ = {s4}, α = {s5}).',
  'Ridge, LASSO ed elastic net aggiungono una penalità ai coefficienti per ridurre la varianza delle stime e gestire la collinearità.':
    'Ridge, LASSO and elastic net add a penalty to the coefficients to reduce the variance of the estimates and handle collinearity.',
  'LASSO può azzerare coefficienti, producendo un modello sparso; ridge li riduce senza azzerarli; elastic net combina i due comportamenti.':
    'LASSO can shrink coefficients to zero, producing a sparse model; ridge reduces them without setting them to zero; elastic net combines both behaviours.',
  'Variabili mantenute: {s1}.':
    'Variables retained: {s1}.',
  'nessuna':
    'none',
  'R² = {s1}; coefficienti non nulli = {s2}; iterazioni = {s3}.':
    'R² = {s1}; non-zero coefficients = {s2}; iterations = {s3}.',
  'Convergenza: {s1}.':
    'Convergence: {s1}.',
  'Come scegliere λ':
    'How to choose λ',
  'λ non va scelto guardando l’R² sul campione: serve validazione incrociata o un criterio esterno.':
    'λ should not be chosen by looking at the in-sample R²: cross-validation or an external criterion is needed.',
  'Valori grandi semplificano il modello ma possono escludere segnali reali; valori piccoli si avvicinano all’OLS e alla sua instabilità.':
    'Large values simplify the model but can exclude real signals; small values approach OLS and its instability.',
  'Le variabili sono standardizzate internamente: i coefficienti restano confrontabili tra loro solo dopo questa trasformazione.':
    'The variables are standardised internally: the coefficients are comparable with one another only after this transformation.',
  'Il livello di confidenza {s1}% è indicato per coerenza con le altre procedure, ma gli intervalli dei coefficienti penalizzati non sono interpretabili come quelli OLS.':
    'The {s1}% confidence level is reported for consistency with the other procedures, but intervals for penalised coefficients cannot be interpreted like OLS ones.',
  'La penalizzazione introduce distorsione: i coefficienti non sono stimatori non distorti e gli errori standard classici non si applicano.':
    'The penalty introduces bias: the coefficients are not unbiased estimators and classical standard errors do not apply.',
  'La selezione di λ e la stima della varianza richiedono ricampionamento, non incluso in questa procedura.':
    'Choosing λ and estimating the variance require resampling, which is not included in this procedure.',
  'Report di lettura — Regressione polinomiale':
    'Reading report — Polynomial regression',
  '{s1} spiegato da un polinomio di grado {s2} in {s3} (R² = {s4}).':
    '{s1} explained by a polynomial of degree {s2} in {s3} (R² = {s4}).',
  'La regressione polinomiale estende la retta a una curva: aggiunge potenze di {s1} per catturare andamenti non lineari.':
    'Polynomial regression extends the straight line to a curve: it adds powers of {s1} to capture nonlinear trends.',
  'Il grado misura la flessibilità della curva; un grado alto riduce i residui ma aumenta il rischio di overfitting.':
    'The degree measures the flexibility of the curve; a high degree reduces residuals but increases the risk of overfitting.',
  'R² = {s1}, R² adattato = {s2}, F = {s3}, p = {s4}.':
    'R² = {s1}, adjusted R² = {s2}, F = {s3}, p = {s4}.',
  'Il termine di grado più alto è {s1}: B = {s2}, p = {s3}.':
    'The highest-degree term is {s1}: B = {s2}, p = {s3}.',
  'RMSE = {s1}; AIC = {s2}; BIC = {s3}.':
    'RMSE = {s1}; AIC = {s2}; BIC = {s3}.',
  'Come scegliere il grado':
    'How to choose the degree',
  'Confronta R² adattato, AIC e BIC tra gradi diversi: il grado più alto non è automaticamente migliore.':
    'Compare adjusted R², AIC and BIC across degrees: the highest degree is not automatically better.',
  'Guarda il grafico: una curva che insegue ogni punto è un segnale di overfitting.':
    'Look at the plot: a curve that chases every point is a sign of overfitting.',
  'Non estrapolare fuori dall’intervallo osservato di {s1}: i polinomi divergono rapidamente.':
    'Do not extrapolate outside the observed range of {s1}: polynomials diverge rapidly.',
  'La collinearità tra potenze rende i singoli coefficienti instabili anche quando la curva è ben stimata: interpreta la forma, non solo i segni.':
    'Collinearity among powers makes individual coefficients unstable even when the curve is well estimated: interpret the shape, not just the signs.',
  'Quantile (τ)':
    'Quantile (τ)',
  'sì':
    'yes',
  'Funzione obiettivo':
    'Objective function',
  '{s1}: β = {s2} (CI 95% {s3}), {s4}.':
    '{s1}: β = {s2} (95% CI {s3}), {s4}.',
  'Report di lettura — Regressione quantilica':
    'Reading report — Quantile regression',
  'Il simplesso non ha raggiunto la convergenza: le stime non sono affidabili.':
    'The simplex did not converge: the estimates are not reliable.',
  'Al quantile τ = {s1}, nessun coefficiente di predittore è significativo (p < {s2}).':
    'At quantile τ = {s1}, no predictor coefficient is significant (p < {s2}).',
  'Al quantile τ = {s1}, 1 coefficiente di predittore su {s2} è significativo (p < {s3}).':
    'At quantile τ = {s1}, 1 predictor coefficient out of {s2} is significant (p < {s3}).',
  'Al quantile τ = {s1}, {s2} coefficienti di predittore su {s3} sono significativi (p < {s4}).':
    'At quantile τ = {s1}, {s2} predictor coefficients out of {s3} are significant (p < {s4}).',
  'Non convergente':
    'Not converged',
  'La regressione quantilica stima come cambia un quantile condizionale di Y, non la media: al posto della somma dei quadrati minimizza una perdita assoluta asimmetrica.':
    'Quantile regression estimates how a conditional quantile of Y changes, not the mean: instead of the sum of squares it minimises an asymmetric absolute loss.',
  'Con τ = 0,5 è una regressione mediana, robusta agli outlier; con τ vicino a 0 o 1 descrive la coda bassa o alta della distribuzione.':
    'With τ = 0.5 it is a median regression, robust to outliers; with τ near 0 or 1 it describes the lower or upper tail of the distribution.',
  'Il modello usa {s1} osservazioni complete e {s2} parametri (intercetta inclusa), con {s3} iterazioni del simplesso.':
    'The model uses {s1} complete observations and {s2} parameters (intercept included), with {s3} simplex iterations.',
  'Il simplesso ha raggiunto la convergenza e la perdita minima vale {s1}.':
    'The simplex converged and the minimum loss is {s1}.',
  'La convergenza non è stata raggiunta: aumenta il budget di iterazioni o riduci i predittori prima di leggere i coefficienti.':
    'Convergence was not reached: increase the iteration budget or reduce the predictors before reading the coefficients.',
  'β misura di quanto cambia il quantile τ di Y per una unità in più del predittore, mantenendo gli altri costanti.':
    'β measures how much the τ quantile of Y changes for one additional unit of the predictor, holding the others constant.',
  'L’intercetta è il quantile τ stimato quando tutti i predittori valgono zero: spesso non ha un’interpretazione sostantiva.':
    'The intercept is the estimated τ quantile when all predictors are zero: it often has no substantive interpretation.',
  'Un intervallo che contiene zero è compatibile con nessun effetto al livello scelto; il p è di Wald e usa errori standard approssimati.':
    'An interval containing zero is compatible with no effect at the chosen level; p is a Wald p-value based on approximate standard errors.',
  'Con più predittori il grafico a punti mostra il profilo del primo predittore alle medie degli altri, non una superficie completa.':
    'With several predictors the dot plot shows the profile of the first predictor at the means of the others, not a full surface.',
  'Perché scegliere un quantile':
    'Why choose a quantile',
  'La media è sensibile agli outlier e alle code pesanti; la mediana e gli altri quantili descrivono il centro o gli estremi della distribuzione condizionata.':
    'The mean is sensitive to outliers and heavy tails; the median and the other quantiles describe the centre or the extremes of the conditional distribution.',
  'Confrontare quantili diversi dello stesso modello mostra se l’effetto di un predittore cambia lungo la distribuzione, cosa che la regressione lineare non evidenzia.':
    'Comparing different quantiles of the same model shows whether a predictor\'s effect changes along the distribution, something linear regression does not reveal.',
  'Il prezzo è che ogni quantile va stimato separatamente: le rette di quantili vicini possono incrociarsi e non c’è una verosimiglianza unica da confrontare con un test LR.':
    'The price is that each quantile must be estimated separately: lines for nearby quantiles can cross, and there is no single likelihood to compare with an LR test.',
  'Il modello è lineare nei parametri per il quantile scelto: se la relazione cambia forma nelle code, servono trasformazioni o termini aggiunti.':
    'The model is linear in the parameters for the chosen quantile: if the relationship changes shape in the tails, transformations or added terms are needed.',
  'Servono osservazioni sufficienti vicino a τ: con code estreme e campioni piccoli le stime diventano instabili.':
    'Sufficient observations are needed near τ: with extreme tails and small samples the estimates become unstable.',
  'Gli errori standard usano l’approssimazione di Powell/Hall–Sheather (quantreg, se = "nid") e possono essere inaffidabili con pochi casi o residui degeneri.':
    'Standard errors use the Powell/Hall–Sheather approximation (quantreg, se = "nid") and can be unreliable with few cases or degenerate residuals.',
  'La convergenza del simplesso va controllata: un numero di iterazioni al limite indica un problema numerico, non un risultato.':
    'Simplex convergence must be checked: an iteration count at the limit indicates a numerical problem, not a result.',
  'Non sono inclusi intervalli bootstrap, test tra quantili o correzione per code estreme.':
    'Bootstrap intervals, tests between quantiles and extreme-tail corrections are not included.',
  'Il modello è lineare nei parametri: relazioni non lineari richiedono trasformazioni o termini aggiunti.':
    'The model is linear in the parameters: nonlinear relationships require transformations or added terms.',
  'La bontà di adattamento non è riassunta da un R²: valuta la perdita asimmetrica e il confronto tra quantili.':
    'Goodness of fit is not summarised by an R²: evaluate the asymmetric loss and the comparison across quantiles.',
  'Report di lettura — Selezione delle variabili':
    'Reading report — Variable selection',
  'Il modello scelto contiene {s1} predittore/i: {s2}.':
    'The selected model contains {s1} predictor(s): {s2}.',
  'Nessun predittore supera il criterio: resta il modello con la sola intercetta.':
    'No predictor passes the criterion: the intercept-only model remains.',
  'La selezione delle variabili cerca un modello più semplice senza perdere capacità esplicativa, confrontando sottoinsiemi di predittori.':
    'Variable selection looks for a simpler model without losing explanatory power, by comparing subsets of predictors.',
  'La ricerca esaustiva guarda tutti i sottoinsiemi; lo stepwise aggiunge o toglie una variabile alla volta seguendo il criterio scelto.':
    'Exhaustive search examines all subsets; stepwise adds or removes one variable at a time according to the chosen criterion.',
  'Il modello con il BIC più basso usa {s1} variabili: {s2}.':
    'The model with the lowest BIC uses {s1} variables: {s2}.',
  'Lo stepwise ha esaminato {s1} passi e si è fermato con {s2} predittore/i.':
    'Stepwise examined {s1} steps and stopped with {s2} predictor(s).',
  'Modello finale: R² = {s1}, R² adattato = {s2}, F = {s3}.':
    'Final model: R² = {s1}, adjusted R² = {s2}, F = {s3}.',
  'Il modello finale non contiene predittori significativi.':
    'The final model contains no significant predictors.',
  'La selezione automatica tende a sovrastimare la significatività: i p-value dopo la scelta non sono aggiustati.':
    'Automatic selection tends to overstate significance: p-values after selection are not adjusted.',
  'Con molti predittori la ricerca esaustiva è limitata: il numero di sottoinsiemi cresce in modo esponenziale.':
    'With many predictors exhaustive search is limited: the number of subsets grows exponentially.',
  'Usa la selezione per esplorare, poi conferma il modello su dati indipendenti o con validazione incrociata.':
    'Use selection for exploration, then confirm the model on independent data or with cross-validation.',
  'Il criterio BIC penalizza di più l’AIC: produce modelli più parsimoniosi.':
    'The BIC criterion penalises more than AIC: it produces more parsimonious models.',
  'I risultati dipendono dal criterio e dalla direzione scelti; riporta sempre entrambi insieme al livello di confidenza del {s1}%.':
    'Results depend on the chosen criterion and direction; always report both together with the {s1}% confidence level.',
  'Analisi delle medie (ANOM)':
    'Analysis of means (ANOM)',
  '{s1} per {s2} · α = {s3}':
    '{s1} by {s2} · α = {s3}',
  'Fuori limiti':
    'Out of limits',
  'No':
    'No',
  'Media generale = {s1}; media quadratica entro gruppi = {s2} con {s3} gradi di libertà.':
    'Overall mean = {s1}; within-group mean square = {s2} with {s3} degrees of freedom.',
  'Il valore critico h = {s1} usa l’approssimazione Bonferroni-t della distribuzione del massimo modulo studentizzato.':
    'The critical value h = {s1} uses the Bonferroni-t approximation of the distribution of the maximum studentized modulus.',
  '{s1} · famiglia {s2} · link {s3} · CI {s4}%':
    '{s1} · family {s2} · link {s3} · CI {s4}%',
  'I coefficienti sono sulla scala del link: la loro interpretazione cambia con famiglia e link.':
    'The coefficients are on the link scale: their interpretation changes with family and link.',
  'Il test z è di Wald; con campioni piccoli può divergere dal test di devianza.':
    'The z test is a Wald test; with small samples it can diverge from the deviance test.',
  'Devianza':
    'Deviance',
  'Devianza nulla':
    'Null deviance',
  'df nullo':
    'Null df',
  'Dispersione':
    'Dispersion',
  'La devianza misura la distanza dal modello saturo; la devianza nulla quella dal solo intercetta.':
    'Deviance measures the distance from the saturated model; null deviance that from the intercept-only model.',
  'Per famiglie con dispersione stimata (Gaussiana, Gamma) il rapporto devianza/df è una diagnostica, non un test.':
    'For families with estimated dispersion (Gaussian, Gamma) the deviance/df ratio is a diagnostic, not a test.',
  'Modello probit':
    'Probit model',
  'stima di massima verosimiglianza (probit)':
    'maximum likelihood estimate (probit)',
  'Coefficienti ed exp(B)':
    'Coefficients and exp(B)',
  'exp(B)':
    'exp(B)',
  'exp(B) CI low':
    'exp(B) CI low',
  'exp(B) CI high':
    'exp(B) CI high',
  'Nel modello probit B è il coefficiente sulla scala normale latente: exp(B) non è un odds ratio ma un fattore moltiplicativo sul predittore latente.':
    'In the probit model B is the coefficient on the latent normal scale: exp(B) is not an odds ratio but a multiplicative factor on the latent predictor.',
  'Un B positivo aumenta la probabilità dell’esito; l’effetto marginale dipende dal punto in cui viene valutato.':
    'A positive B increases the probability of the outcome; the marginal effect depends on where it is evaluated.',
  'Modello multinomiale':
    'Multinomial model',
  'stima di massima verosimiglianza · N = {s1}':
    'maximum likelihood estimate · N = {s1}',
  'Classi':
    'Classes',
  'Classe di riferimento':
    'Reference class',
  'Accuratezza complessiva (%)':
    'Overall accuracy (%)',
  'no':
    'no',
  'Il modello stima una probabilità per ogni classe; la classe di riferimento ha coefficienti fissati a zero.':
    'The model estimates a probability for each class; the reference class has coefficients fixed at zero.',
  'La deviance confronta la verosimiglianza del modello con quella di un modello saturo: valori più bassi indicano un adattamento migliore.':
    'The deviance compares the model likelihood with that of a saturated model: lower values indicate a better fit.',
  'Coefficienti per classe':
    'Coefficients by class',
  'Classe di riferimento: {s1} · CI {s2}%':
    'Reference class: {s1} · CI {s2}%',
  'Classe':
    'Class',
  'Ogni classe è confrontata con la classe di riferimento: OR > 1 aumenta le probabilità di quella classe rispetto al riferimento.':
    'Each class is compared with the reference class: OR > 1 increases the odds of that class relative to the reference.',
  'I coefficienti sono stimati al netto degli altri predittori; l’intercetta non ha un odds ratio interpretabile.':
    'The coefficients are estimated net of the other predictors; the intercept has no interpretable odds ratio.',
  'Classificazione per classe':
    'Classification by class',
  'Accuratezza complessiva: {s1}%':
    'Overall accuracy: {s1}%',
  'Corrette':
    'Correct',
  'Accuratezza (%)':
    'Accuracy (%)',
  'Probabilità media (%)':
    'Mean probability (%)',
  'La classe predetta è quella con la probabilità stimata più alta; l’accuratezza per classe è il rapporto tra classificazioni corrette e osservazioni di quella classe.':
    'The predicted class is the one with the highest estimated probability; accuracy per class is the ratio of correct classifications to observations of that class.',
  'Le classi rare possono avere un’accuratezza instabile perché calcolata su poche osservazioni.':
    'Rare classes can have unstable accuracy because it is computed on few observations.',
  'ANOVA gerarchica':
    'Hierarchical ANOVA',
  '{s1} per {s2} annidato in {s3}':
    '{s1} by {s2} nested in {s3}',
  'dentro':
    'within',
  'Errore':
    'Error',
  'Il fattore esterno è testato contro la media quadratica del fattore annidato, non contro il residuo.':
    'The outer factor is tested against the mean square of the nested factor, not against the residual.',
  'Il fattore interno è testato contro il residuo entro cella.':
    'The inner factor is tested against the within-cell residual.',
  'Descrittive per cella':
    'Descriptive statistics by cell',
  'Componenti di varianza':
    'Variance components',
  'Stime approssimate per il modello a effetti casuali; con celle sbilanciate sono indicative.':
    'Approximate estimates for the random-effects model; with unbalanced cells they are indicative.',
  'Esponenziale':
    'Exponential',
  'Logistica':
    'Logistic',
  'Gompertz':
    'Gompertz',
  'Michaelis–Menten':
    'Michaelis–Menten',
  'Parametri del modello':
    'Model parameters',
  'Le stime sono ai minimi quadrati sulla curva scelta; gli errori standard vengono dalla matrice jacobiana al punto di ottimo.':
    'The estimates are least squares on the chosen curve; standard errors come from the Jacobian matrix at the optimum.',
  'Il test t riguarda il singolo parametro: p piccolo indica che il parametro è distinto da zero nella scala della curva.':
    'The t test concerns the individual parameter: a small p indicates that the parameter differs from zero on the curve\'s scale.',
  '{s1} su {s2}':
    '{s1} of {s2}',
  'SSE':
    'SSE',
  'R² confronta la curva con la media di Y: non dice se la forma del modello è quella giusta, solo quanto spiega rispetto a una retta piatta.':
    'R² compares the curve with the mean of Y: it does not say whether the model shape is right, only how much it explains relative to a flat line.',
  'RMSE è nella stessa unità della variabile dipendente e riassume l’errore tipico della curva.':
    'RMSE is in the same unit as the dependent variable and summarises the typical error of the curve.',
  'Coefficienti penalizzati':
    'Penalised coefficients',
  '{s1} · {s2} · λ = {s3} · CI {s4}%':
    '{s1} · {s2} · λ = {s3} · CI {s4}%',
  'Coefficiente':
    'Coefficient',
  'I coefficienti sono sulla scala originale delle variabili; il modello è stato stimato su predittori standardizzati.':
    'The coefficients are on the original scale of the variables; the model was estimated on standardised predictors.',
  'Con LASSO i coefficienti esattamente nulli indicano variabili escluse dal modello.':
    'With LASSO, exactly zero coefficients indicate variables excluded from the model.',
  'Penalità':
    'Penalty',
  'Coefficienti non nulli':
    'Non-zero coefficients',
  'λ governa la forza della penalizzazione: valori più alti producono modelli più semplici.':
    'λ governs the strength of the penalty: higher values produce simpler models.',
  'α = 0 è ridge, α = 1 è LASSO, valori intermedi sono elastic net.':
    'α = 0 is ridge, α = 1 is LASSO, intermediate values are elastic net.',
  'Coefficienti del polinomio':
    'Polynomial coefficients',
  '{s1} su {s2} · grado {s3}':
    '{s1} of {s2} · degree {s3}',
  'Il modello usa la base polinomiale grezza: i coefficienti sono quelli di x, x², … senza ortogonalizzazione.':
    'The model uses the raw polynomial basis: the coefficients are those of x, x², … without orthogonalisation.',
  'CI al {s1}%.':
    '{s1}% CI.',
  'Gradi di libertà':
    'Degrees of freedom',
  '(Intercept)':
    '(Intercept)',
  'Coefficienti della regressione quantilica':
    'Quantile regression coefficients',
  '{s1} · τ = {s2}':
    '{s1} · τ = {s2}',
  'β misura la variazione del quantile τ della risposta per una unità in più del predittore, al netto degli altri.':
    'β measures the change in the τ quantile of the response for one additional unit of the predictor, net of the others.',
  'L’intercetta è il quantile τ stimato quando tutti i predittori valgono zero.':
    'The intercept is the estimated τ quantile when all predictors are zero.',
  'Gli intervalli sono normali al 95%; il p è di Wald a due code e usa errori standard approssimati.':
    'The intervals are normal 95% intervals; p is a two-sided Wald p-value using approximate standard errors.',
  'Adattamento del modello quantilico':
    'Fit of the quantile model',
  '{s1} osservazioni · {s2} parametri':
    '{s1} observations · {s2} parameters',
  'Residui assoluti medi':
    'Mean absolute residuals',
  'La funzione obiettivo è la somma della perdita asimmetrica ρτ: con τ = 0,5 coincide con la regressione mediana.':
    'The objective function is the sum of the asymmetric loss ρτ: with τ = 0.5 it coincides with median regression.',
  'Il numero di iterazioni conta i pivot del simplesso; un valore molto alto segnala un problema numerico.':
    'The number of iterations counts simplex pivots; a very high value signals a numerical problem.',
  'Aggiunta':
    'Addition',
  'Rimozione':
    'Removal',
  'Partenza':
    'Start',
  'Stop':
    'Stop',
  'Migliori sottoinsiemi':
    'Best subsets',
  'Un modello per dimensione · criterio: {s1}':
    'One model per size · criterion: {s1}',
  'La ricerca esaustiva valuta tutti i sottoinsiemi fino a un massimo di 8 predittori; oltre quella soglia il costo cresce rapidamente.':
    'Exhaustive search evaluates all subsets up to a maximum of 8 predictors; beyond that threshold the cost grows rapidly.',
  'Cp confronta ogni modello con il modello completo: valori vicini al numero di parametri indicano un buon compromesso.':
    'Cp compares each model with the full model: values close to the number of parameters indicate a good compromise.',
  'Percorso stepwise':
    'Stepwise path',
  'Direzione: {s1}':
    'Direction: {s1}',
  'Azione':
    'Action',
  'Modello selezionato':
    'Selected model',
  'R² = {s1}; R² adattato = {s2}; F = {s3}; p = {s4}.':
    'R² = {s1}; adjusted R² = {s2}; F = {s3}; p = {s4}.',
  'Report di lettura — MANCOVA': 'Reading report — MANCOVA',
  'Effetto di {s1} su {s2} variabili, al netto di {s3}: Wilk’s λ = {s4}, p = {s5}.': 'Effect of {s1} on {s2} variables, adjusted for {s3}: Wilks\' λ = {s4}, p = {s5}.',
  'nessuna covariata': 'no covariate',
  'La MANCOVA estende la MANOVA aggiungendo covariate continue: confronta i gruppi su più esiti simultaneamente, correggendo per variabili che potrebbero spiegare parte delle differenze.': 'MANCOVA extends MANOVA with continuous covariates: it compares groups on several outcomes at once while correcting for variables that may explain part of the differences.',
  'Il test multivariato risponde alla domanda “il gruppo conta, al netto delle covariate?”; i test univariati localizzano l’effetto sulle singole variabili.': 'The multivariate test answers “does the group matter, adjusted for the covariates?”; the univariate tests locate the effect on each variable.',
  'Wilk’s λ = {s1}, F = {s2} con {s3} e {s4} gradi di libertà, p = {s5}.': 'Wilks\' λ = {s1}, F = {s2} with {s3} and {s4} degrees of freedom, p = {s5}.',
  '{s1} variabili su {s2} mostrano un effetto di gruppo significativo al livello scelto.': '{s1} of {s2} variables show a significant group effect at the chosen level.',
  '{s1}: F = {s2}, p = {s3}.': '{s1}: F = {s2}, p = {s3}.',
  'Le medie aggiustate sono i valori attesi se tutti i gruppi avessero la stessa media delle covariate: servono a confrontare i gruppi “a parità di” covariate.': 'Adjusted means are the expected values if every group had the same covariate mean: they compare groups “holding the covariates constant”.',
  'Un effetto multivariato significativo può nascondere variabili non significative e viceversa: leggi insieme il test globale e quelli univariati.': 'A significant multivariate effect can hide non-significant variables and vice versa: read the global and univariate tests together.',
  'Le covariate devono essere misurate prima del trattamento e non essere conseguenze del gruppo: altrimenti la correzione toglie parte dell’effetto che vuoi stimare.': 'Covariates must be measured before treatment and must not be consequences of the group: otherwise the adjustment removes part of the effect you want to estimate.',
  'Il modello assume relazioni lineari tra covariate ed esiti e omogeneità delle pendenze tra gruppi; controlla questi punti prima di fidarti del p.': 'The model assumes linear covariate–outcome relations and homogeneous slopes across groups; check these points before trusting the p-value.',
  'Non sono inclusi termini di interazione gruppo × covariata, contrasti pianificati o correzioni per test multipli.': 'Interaction terms group × covariate, planned contrasts and multiple-testing corrections are not included.',
  'Con gruppi piccoli o covariate collineari le stime diventano instabili e il test multivariato perde potenza.': 'With small groups or collinear covariates the estimates become unstable and the multivariate test loses power.',
  'Test multivariato': 'Multivariate test',
  'Wilk’s lambda · CI {s1}%': 'Wilks\' lambda · CI {s1}%',
  'Wilk’s lambda': 'Wilks\' lambda',
  'Il test multivariato valuta l’effetto del gruppo su tutte le variabili dipendenti insieme, al netto delle covariate.': 'The multivariate test evaluates the group effect on all dependent variables together, adjusted for the covariates.',
  'L’approssimazione F di Rao è quella usata da car::Anova; con campioni piccoli il p può differire leggermente.': 'Rao\'s F approximation is the one used by car::Anova; with small samples the p-value may differ slightly.',
  'ANCOVA univariata per variabile': 'Univariate ANCOVA per variable',
  'Effetto del gruppo al netto delle covariate': 'Group effect adjusted for the covariates',
  'Medie aggiustate': 'Adjusted means',
  'Valori attesi alle medie delle covariate': 'Expected values at the covariate means',
};

