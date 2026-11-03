/** English prose of the W3 PLS, MARS and IV reports and tables. */
export const w3RegressionCopy: Record<string, string> = {
  'A differenza della regressione lineare, le componenti sono estratte in ordine di capacità predittiva: le prime bastano spesso a descrivere il segnale, le ultime possono solo aggiungere rumore.':
    'Unlike linear regression, the components are extracted in order of predictive power: the first ones often capture the signal, the last ones may only add noise.',
  'Aumento di RSS quando il predittore è rimosso dal modello selezionato':
    'Increase in RSS when the predictor is removed from the selected model',
  'Coefficienti PLS':
    'PLS coefficients',
  'Coefficienti degli strumenti esclusi e F parziale':
    'Coefficients of the excluded instruments and partial F',
  'Come leggere coefficienti e VIP':
    'How to read coefficients and VIP',
  'Come scegliere il numero di componenti':
    'How to choose the number of components',
  'Componenti latenti':
    'Latent components',
  'Con grado 1 il modello è additivo; con grado 2 i prodotti tra cerniere permettono interazioni, purché ogni termine non ripeta lo stesso predittore.':
    'With degree 1 the model is additive; with degree 2 products between hinges allow interactions, provided each term does not repeat the same predictor.',
  'Con identificazione esatta (numero di strumenti uguale al numero di endogeni) i due test non sono calcolabili e compaiono come “—”.':
    'With exact identification (as many instruments as endogenous regressors) the two tests cannot be computed and appear as “—”.',
  'Con identificazione esatta Sargan e Wu–Hausman non sono calcolabili; con strumenti deboli l’inferenza asintotica è fragile.':
    'With exact identification Sargan and Wu–Hausman cannot be computed; with weak instruments asymptotic inference is fragile.',
  'Con pochi casi e molti predittori il PLS resta stabile, ma la scelta delle componenti va validata su dati nuovi.':
    'With few cases and many predictors PLS remains stable, but the choice of components must be validated on new data.',
  'Endogeno':
    'Endogenous',
  'Equazione strutturale':
    'Structural equation',
  'Espressione':
    'Expression',
  'F e p(F) si riferiscono agli strumenti esclusi e compaiono sulla prima riga di ciascun regressore endogeno.':
    'F and p(F) refer to the excluded instruments and appear on the first row of each endogenous regressor.',
  'GCV':
    'GCV',
  'Gli errori standard sono omoschedastici: se la varianza dei residui non è costante, attiva gli errori robusti HC1.':
    'The standard errors are homoscedastic: if the residual variance is not constant, enable HC1 robust errors.',
  'Grado':
    'Degree',
  'Guarda il R² cumulato e il Q²: aggiungere una componente conviene finché il Q² non peggiora.':
    'Look at cumulative R² and Q²: adding a component helps as long as Q² does not get worse.',
  'I coefficienti sono stimati con i minimi quadrati a due stadi: ogni regressore endogeno è sostituito dai valori stimati nel primo stadio.':
    'Coefficients are estimated by two-stage least squares: each endogenous regressor is replaced by the values predicted in the first stage.',
  'I coefficienti sono sulla scala originale: descrivono l’effetto complessivo di un predittore su Y attraverso tutte le componenti, non l’effetto di una singola componente.':
    'Coefficients are on the original scale: they describe the overall effect of a predictor on Y through all components, not the effect of a single component.',
  'I nodi non sono stimati come parametri: sono valori osservati scelti dal passaggio in avanti, quindi non hanno un errore standard né un p-value.':
    'Knots are not estimated as parameters: they are observed values chosen by the forward pass, so they have no standard error or p-value.',
  'Il GCV penalizza il numero di nodi: serve a confrontare modelli MARS sullo stesso insieme di osservazioni, non a produrre un p-value.':
    'GCV penalises the number of knots: it is meant to compare MARS models on the same set of observations, not to produce a p-value.',
  'Il GCV è calcolato come (RSS / n) / (1 − costo)², con costo = (p + penalità × nodi) / n: penalizza i nodi, non solo i termini.':
    'GCV is computed as (RSS / n) / (1 − cost)², with cost = (p + penalty × knots) / n: it penalises knots, not just terms.',
  'Il VIP misura la partecipazione di un predittore alle componenti che spiegano Y: è utile per ordinare le variabili, non è un test di significatività.':
    'VIP measures how much each predictor contributes to the components that explain Y; it is useful for ranking variables, not a significance test.',
  'Il VIP non ha un test di significatività: serve a ordinare le variabili, non a decidere automaticamente quali escludere.':
    'VIP has no significance test: it ranks variables, it does not automatically decide which ones to drop.',
  'Il grado massimo è 2 e ogni termine usa un predittore al massimo una volta; interazioni di ordine superiore non sono incluse.':
    'The maximum degree is 2 and each term uses a predictor at most once; higher-order interactions are not included.',
  'Il modello MARS spiega il {s1}% della variabilità di {s2} con {s3} termini e {s4} nodi.':
    'The MARS model explains {s1}% of the variability of {s2} with {s3} terms and {s4} knots.',
  'Il modello MARS spiega il {s1}% della variabilità di {s2}: l’adattamento è parziale.':
    'The MARS model explains {s1}% of the variability of {s2}: the fit is partial.',
  'Il modello MARS spiega solo il {s1}% della variabilità di {s2}: le cerniere selezionate descrivono poco i dati.':
    'The MARS model explains only {s1}% of the variability of {s2}: the selected hinges describe the data poorly.',
  'Il modello PLS spiega il {s1}% della varianza di Y con {s2} componenti.':
    'The PLS model explains {s1}% of the variance of Y with {s2} components.',
  'Il modello PLS spiega il {s1}% della varianza di Y: il segnale c’è, ma resta molto non spiegato.':
    'The PLS model explains {s1}% of the variance of Y: there is signal, but much remains unexplained.',
  'Il modello PLS spiega solo il {s1}% della varianza di Y: le componenti estratte non riassumono bene la risposta.':
    'The PLS model explains only {s1}% of the variance of Y: the extracted components do not summarise the response well.',
  'Il modello non ha raggiunto una soluzione stabile: le stime non sono affidabili.':
    'The model did not reach a stable solution: the estimates are not reliable.',
  'Il modello non produce un R² leggibile: controlla i dati e il numero di componenti.':
    'The model does not produce a readable R²: check the data and the number of components.',
  'Il modello usa {s1} predittori e {s2} componenti; il R² cumulato finale vale {s3}.':
    'The model uses {s1} predictors and {s2} components; the final cumulative R² is {s3}.',
  'Il modello è centrato ma non standardizzato: l’unità di misura dei predittori conta per l’interpretazione dei coefficienti, non per l’estrazione delle componenti.':
    'The model is centred but not standardised: the unit of measurement of the predictors matters for interpreting coefficients, not for extracting components.',
  'Il modello è stato potato con il criterio GCV: {s1}.':
    'The model was pruned with the GCV criterion: {s1}.',
  'Il motore non riporta errori standard, intervalli o p-value per i coefficienti delle cerniere: la selezione dei nodi rende l’inferenza classica non valida senza correzioni.':
    'The engine does not report standard errors, intervals or p-values for the hinge coefficients: knot selection makes classical inference invalid without corrections.',
  'Il motore stima modelli lineari; con più regressori endogeni la diagnostica è riportata per ciascun primo stadio, ma il test di Sargan resta congiunto.':
    'The engine estimates linear models; with several endogenous regressors the diagnostics are reported for each first stage, but Sargan remains joint.',
  'Il nodo t è un valore osservato del predittore, scelto dal passaggio in avanti; non è un parametro stimato con un errore standard.':
    'The knot t is an observed value of the predictor, chosen by the forward pass; it is not a parameter estimated with a standard error.',
  'Il numero di componenti è scelto dall’utente: la procedura non lo ottimizza né confronta automaticamente tutti i modelli.':
    'The number of components is chosen by the user: the procedure does not optimise it or automatically compare all models.',
  'Il predittore con VIP più alto è {s1} (VIP = {s2}).':
    'The predictor with the highest VIP is {s1} (VIP = {s2}).',
  'Il predittore con la riduzione di RSS più alta è {s1} ({s2}% della riduzione attribuibile).':
    'The predictor with the largest RSS reduction is {s1} ({s2}% of the attributable reduction).',
  'Il test di Sargan non è calcolabile con identificazione esatta.':
    'The Sargan test cannot be computed with exact identification.',
  'Il test di Wu–Hausman non è calcolabile con identificazione esatta.':
    'The Wu–Hausman test cannot be computed with exact identification.',
  'Importanza dei predittori':
    'Predictor importance',
  'Importanza delle variabili (VIP)':
    'Variable importance (VIP)',
  'La coerenza della stima dipende da due ipotesi non verificabili con i soli dati: gli strumenti devono essere rilevanti per i regressori endogeni ed esclusi dall’equazione strutturale.':
    'Consistency of the estimate depends on two assumptions that cannot be verified from the data alone: the instruments must be relevant for the endogenous regressors and excluded from the structural equation.',
  'La griglia dei nodi segue la regola di earth (ogni minspan-esima osservazione dopo un margine endspan): nodi molto vicini agli estremi possono non essere candidati.':
    'The knot grid follows earth\'s rule (every minspan-th observation after an endspan margin): knots very close to the extremes may not be candidates.',
  'La potatura è un passo all’indietro goloso basato sul GCV; non esplora tutti i sottoinsiemi possibili.':
    'Pruning is a greedy backward step based on GCV; it does not explore all possible subsets.',
  'La quota di importanza è descrittiva: somma le riduzioni positive e non sostituisce un test sui singoli coefficienti.':
    'The importance share is descriptive: it sums the positive reductions and does not replace a test on individual coefficients.',
  'La quota normalizza le riduzioni positive: è una lettura descrittiva, non un test di significatività.':
    'The share normalises the positive reductions: it is a descriptive reading, not a significance test.',
  'La regressione PLS costruisce componenti latenti che riassumono insieme la variabilità dei predittori e la loro relazione con Y, utile quando i predittori sono molti e correlati tra loro.':
    'PLS regression builds latent components that summarise both the variability of the predictors and their relationship with Y, useful when predictors are many and correlated.',
  'La riduzione è la differenza tra la RSS del modello senza tutte le cerniere del predittore e la RSS del modello completo.':
    'The reduction is the difference between the RSS of the model without all hinges of the predictor and the RSS of the full model.',
  'La stima 2SLS sostituisce i regressori endogeni con la parte spiegata dagli strumenti: il coefficiente misura l’effetto della variazione esogena, non della variabile osservata.':
    'The 2SLS estimate replaces the endogenous regressors with the part explained by the instruments: the coefficient measures the effect of exogenous variation, not of the observed variable.',
  'La validazione incrociata qui è deterministica per riga; con campioni piccoli il Q² può essere instabile.':
    'Cross-validation here is deterministic by row; with small samples Q² can be unstable.',
  'La validità degli strumenti non è verificabile dai dati: rilevanza ed esclusione vanno argomentate dal disegno dello studio.':
    'Instrument validity cannot be verified from the data: relevance and exclusion must be argued from the study design.',
  'L’equazione strutturale non contiene regressori oltre all’intercetta.':
    'The structural equation contains no regressors beyond the intercept.',
  'L’intercetta riporta il valore atteso di Y quando tutti i predittori valgono zero.':
    'The intercept is the expected value of Y when all predictors are zero.',
  'L’interpretazione è quella di una regressione lineare, ma la validità dipende dagli strumenti: devono essere rilevanti ed esclusi dal modello strutturale.':
    'The interpretation is that of a linear regression, but validity depends on the instruments: they must be relevant and excluded from the structural model.',
  'MARS costruisce una regressione flessibile sommando funzioni cerniera scelte dai dati; è un caso additive di GAM con knot selezionati automaticamente.':
    'MARS builds a flexible regression by summing hinge functions chosen from the data; it is an additive case of GAM with automatically selected knots.',
  'Nessun predittore supera un VIP di 1: il contributo è distribuito o il modello ha poca struttura.':
    'No predictor exceeds a VIP of 1: the contribution is spread out or the model has little structure.',
  'Nessuna componente':
    'No component',
  'Nodi':
    'Knots',
  'Nodo':
    'Knot',
  'Non ci sono componenti latenti da interpretare.':
    'There are no latent components to interpret.',
  'Non sono inclusi intervalli di confidenza, test di significatività o selezione automatica delle variabili.':
    'Confidence intervals, significance tests and automatic variable selection are not included.',
  'Ogni termine è una funzione cerniera h(x − t) = max(0, x − t) o h(t − x) = max(0, t − x); le interazioni di grado 2 sono prodotti di due cerniere.':
    'Each term is a hinge function h(x − t) = max(0, x − t) or h(t − x) = max(0, t − x); degree-2 interactions are products of two hinges.',
  'Osservazioni = {s1}; R² = {s2}; R² corretto = {s3}; sigma = {s4}.':
    'Observations = {s1}; R² = {s2}; adjusted R² = {s3}; sigma = {s4}.',
  'PLS assume relazioni lineari tra predittori e risposta: curve e interazioni vanno aggiunte come termini espliciti.':
    'PLS assumes linear relationships between predictors and response: curves and interactions must be added as explicit terms.',
  'PLS1 gestisce una sola variabile dipendente: più risposte richiedono PLS2, non coperto da questa procedura.':
    'PLS1 handles a single dependent variable: multiple responses require PLS2, not covered by this procedure.',
  'Penale GCV':
    'GCV penalty',
  'Potatura':
    'Pruning',
  'Primo stadio':
    'First stage',
  'Primo stadio di {s1}: F = {s2} (df {s3}), {s4}.':
    'First stage of {s1}: F = {s2} (df {s3}), {s4}.',
  'Quota':
    'Share',
  'Q²':
    'Q²',
  'Q² è la versione in validazione incrociata di R²: valori negativi indicano che il modello predice peggio della media.':
    'Q² is the cross-validated version of R²: negative values mean the model predicts worse than the mean.',
  'RSS':
    'RSS',
  'Report di lettura — GAM / MARS':
    'Reading report — GAM / MARS',
  'Report di lettura — Regressione PLS':
    'Reading report — PLS regression',
  'Report di lettura — Variabili strumentali (2SLS)':
    'Reading report — Instrumental variables (2SLS)',
  'Riduzione RSS':
    'RSS reduction',
  'R² = {s1}; R² corretto = {s2}; RSS = {s3}; GCV = {s4}.':
    'R² = {s1}; adjusted R² = {s2}; RSS = {s3}; GCV = {s4}.',
  'R² cumulato':
    'Cumulative R²',
  'R² è la quota di varianza di Y spiegata dalla singola componente; R² cumulato somma le componenti fino a quella riga.':
    'R² is the share of Y variance explained by the single component; cumulative R² sums the components up to that row.',
  'Sargan non rifiuta la validità congiunta degli strumenti.':
    'Sargan does not reject the joint validity of the instruments.',
  'Sargan richiede più strumenti che regressori endogeni e verifica solo l’ortogonalità congiunta: un p alto non dimostra che gli strumenti siano validi.':
    'Sargan requires more instruments than endogenous regressors and only checks joint orthogonality: a high p does not prove that the instruments are valid.',
  'Sargan rifiuta la validità degli strumenti: la specificazione va discussa.':
    'Sargan rejects the validity of the instruments: the specification must be discussed.',
  'Sargan verifica la validità congiunta degli strumenti quando il modello è sovraidentificato; Wu–Hausman verifica l’esogeneità dei regressori endogeni.':
    'Sargan checks the joint validity of the instruments when the model is overidentified; Wu–Hausman checks the exogeneity of the endogenous regressors.',
  'Sargan: {s1}. {s2}':
    'Sargan: {s1}. {s2}',
  'Segnale moderato':
    'Moderate signal',
  'Sigma':
    'Sigma',
  'Sono riportati errori standard HC1 robusti all’eteroschedasticità: cambiano le inferenze, non i coefficienti.':
    'HC1 standard errors robust to heteroscedasticity are reported: they change the inferences, not the coefficients.',
  'Strumento':
    'Instrument',
  'Termini della base MARS':
    'MARS basis terms',
  'Termini selezionati':
    'Selected terms',
  'Un F parziale basso segnala strumenti deboli: le stime 2SLS diventano distorte e gli errori standard troppo piccoli.':
    'A low partial F signals weak instruments: 2SLS estimates become biased and standard errors too small.',
  'Un F parziale del primo stadio inferiore a 10 è un segnale convenzionale di strumenti deboli: la stima può essere molto imprecisa e gli errori standard ingannevoli.':
    'A first-stage partial F below 10 is a conventional signal of weak instruments: the estimate may be very imprecise and the standard errors misleading.',
  'Un GCV più basso è preferibile nel confronto tra modelli MARS con lo stesso numero di osservazioni.':
    'A lower GCV is preferable when comparing MARS models with the same number of observations.',
  'Un coefficiente piccolo con VIP alto indica una variabile importante per costruire le componenti ma con effetto netto contenuto.':
    'A small coefficient with a high VIP indicates a variable that is important for building the components but has a small net effect.',
  'Una cerniera h(x − t) è zero sotto il nodo e cresce linearmente sopra; h(t − x) fa il contrario. Insieme descrivono un ginocchio in t.':
    'A hinge h(x − t) is zero below the knot and grows linearly above; h(t − x) does the opposite. Together they describe a knee at t.',
  'Una componente che aumenta il R² ma abbassa il Q² sta adattando il rumore del campione.':
    'A component that increases R² but lowers Q² is fitting sample noise.',
  'VIP':
    'VIP',
  'VIP misura quanto ogni predittore contribuisce alle componenti che spiegano Y; valori sopra 1 indicano un contributo superiore alla media.':
    'VIP measures how much each predictor contributes to the components that explain Y; values above 1 indicate an above-average contribution.',
  'Varianza X':
    'X variance',
  'Varianza X è la quota di variabilità dei predittori assorbita dalla componente; un valore piccolo segnala una componente poco informativa.':
    'X variance is the share of predictor variability absorbed by the component; a small value signals an uninformative component.',
  'Wu–Hausman confronta OLS e 2SLS: un p basso suggerisce che il regressore sia effettivamente endogeno e che l’OLS sia distorto.':
    'Wu–Hausman compares OLS and 2SLS: a low p suggests that the regressor is indeed endogenous and that OLS is biased.',
  'Wu–Hausman indica endogeneità: la stima 2SLS è preferibile all’OLS.':
    'Wu–Hausman indicates endogeneity: the 2SLS estimate is preferable to OLS.',
  'Wu–Hausman non rifiuta l’esogeneità dei regressori strumentati.':
    'Wu–Hausman does not reject the exogeneity of the instrumented regressors.',
  'Wu–Hausman: {s1}. {s2}':
    'Wu–Hausman: {s1}. {s2}',
  'p(F)':
    'p(F)',
  'strumenti potenzialmente deboli':
    'potentially weak instruments',
  'strumenti sufficientemente forti':
    'sufficiently strong instruments',
  '{s1} componenti · R² finale = {s2}':
    '{s1} components · final R² = {s2}',
  '{s1} osservazioni, {s2} termini selezionati ({s3} coefficienti) e {s4} nodi distinti.':
    '{s1} observations, {s2} selected terms ({s3} coefficients) and {s4} distinct knots.',
  '{s1} predittori hanno VIP sopra 1: {s2}.':
    '{s1} predictors have VIP above 1: {s2}.',
  '{s1} predittori · {s2} componenti':
    '{s1} predictors · {s2} components',
  '{s1} spiegato con 2SLS da {s2} regressore/i; R² = {s3}, sigma = {s4}.':
    '{s1} explained by 2SLS with {s2} regressor(s); R² = {s3}, sigma = {s4}.',
  '{s1} · 2SLS':
    '{s1} · 2SLS',
  '{s1} · 2SLS · CI {s2}%':
    '{s1} · 2SLS · CI {s2}%',
  '{s1} · grado {s2}':
    '{s1} · degree {s2}',
  '{s1} · grado {s2} · {s3} termini':
    '{s1} · degree {s2} · {s3} terms',
  '{s1} · {s2} predittori · {s3} componenti':
    '{s1} · {s2} predictors · {s3} components',
  '{s1}: B = {s2} (CI {s3} – {s4}), {s5}.':
    '{s1}: B = {s2} (CI {s3} – {s4}), {s5}.',
  '{s1}: coefficiente {s2}.':
    '{s1}: coefficient {s2}.',
  'β è il coefficiente sulla scala originale del predittore, ottenuto dalla combinazione delle componenti latenti.':
    'β is the coefficient on the original predictor scale, obtained by combining the latent components.',
};
