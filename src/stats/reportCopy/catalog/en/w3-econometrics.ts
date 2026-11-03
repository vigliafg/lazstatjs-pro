/** English prose of the W3 panel, selection, mediation and propensity reports. */
export const w3EconometricsCopy: Record<string, string> = {
  'ATT':
    'ATT',
  'ATT = differenza delle medie pesate (trattati 1, controlli e/(1−e)); SE dalla regressione WLS.':
    'ATT = difference of weighted means (treated 1, controls e/(1−e)); SE from the WLS regression.',
  'ATT = media delle differenze appaiate; SE = errore standard di tali differenze. {s1}.':
    'ATT = mean of the matched differences; SE = standard error of those differences. {s1}.',
  'ATT = {s1} (SE {s2}, CI {s3}%: {s4}).':
    'ATT = {s1} (SE {s2}, CI {s3}%: {s4}).',
  'ATT di {s1} su {s2} = {s3} (CI {s4}%), {s5}.':
    'ATT of {s1} on {s2} = {s3} (CI {s4}%), {s5}.',
  'Adattamento (Heckman)':
    'Fit (Heckman)',
  'Adattamento (Tobit)':
    'Fit (Tobit)',
  'Adattamento dei modelli':
    'Model fit',
  'Adattamento del modello panel':
    'Panel model fit',
  'Almeno un predittore della selezione dovrebbe essere escluso dall’equazione dell’esito: senza esclusione la correzione è identificata solo dalla forma funzionale.':
    'At least one selection predictor should be excluded from the outcome equation: without exclusion the correction is identified only by functional form.',
  'Attenzione: c − (c′ + a·b) = {s1}, quindi la scomposizione non è coerente. Controlla collinearità e convergenza dei modelli.':
    'Warning: c − (c′ + a·b) = {s1}, so the decomposition is not consistent. Check collinearity and model convergence.',
  'Bilanciamento delle covariabili':
    'Covariate balance',
  'Bilanciamento e stima':
    'Balance and estimate',
  'Bootstrap dell’effetto indiretto':
    'Bootstrap of the indirect effect',
  'CI {s1}% · indiretto = a·b':
    'CI {s1}% · indirect = a·b',
  'Campione e supporto comune':
    'Sample and common support',
  'Censurati a destra':
    'Censored above',
  'Censurati a sinistra':
    'Censored below',
  'Coefficienti latenti e valori osservati':
    'Latent coefficients and observed values',
  'Coerenza c = c′ + a·b':
    'Consistency c = c′ + a·b',
  'Come leggere lambda e rho':
    'How to read lambda and rho',
  'Con campioni piccoli le stime dei percorsi e gli errori standard possono essere instabili, anche quando il bootstrap converge.':
    'With small samples the path estimates and standard errors can be unstable, even when the bootstrap converges.',
  'Con p basso la stima RE non è coerente e conviene il modello a effetti fissi.':
    'With a low p the RE estimate is not consistent and the fixed-effects model is preferable.',
  'Con panel non bilanciati la decomposizione usa la media armonica dei periodi; software diversi possono adottare correzioni dei gradi di libertà differenti.':
    'With unbalanced panels the decomposition uses the harmonic mean of the periods; different software may apply different degrees-of-freedom corrections.',
  'Con pochi casi selezionati la correzione di prima fase diventa instabile: controlla il numero di righe selezionate e la diagnostica.':
    'With few selected cases the first-stage correction becomes unstable: check the number of selected rows and the diagnostics.',
  'Con reimmissione lo stesso controllo può essere usato più volte: “controlli analizzati” conta gli appaiamenti, non le unità distinte.':
    'With replacement the same control can be used more than once: “controls analysed” counts matches, not distinct units.',
  'Confounding non misurato: nessun metodo basato sul propensity score può correggere variabili non osservate o mal misurate.':
    'Unmeasured confounding: no method based on the propensity score can correct unobserved or badly measured variables.',
  'Controlli analizzati':
    'Controls analysed',
  'Correzione SE':
    'SE correction',
  'Correzione prima fase':
    'First-stage correction',
  'Covariabile':
    'Covariate',
  'Diagnostica (Heckman)':
    'Diagnostics (Heckman)',
  'Diagnostica (Tobit)':
    'Diagnostics (Tobit)',
  'Differenza standardizzata prima e dopo · {s1}':
    'Standardised difference before and after · {s1}',
  'Differenza tra le covarianze definita positiva':
    'Covariance difference positive definite',
  'Differenza tra le covarianze non definita positiva':
    'Covariance difference not positive definite',
  'Due passi · {s1}':
    'Two-step · {s1}',
  'Effective sample size':
    'Effective sample size',
  'Effective sample size = {s1}: pesi estremi riducono l’informazione disponibile.':
    'Effective sample size = {s1}: extreme weights reduce the available information.',
  'Effective sample size non calcolabile.':
    'Effective sample size not computable.',
  'Effetti casuali (Swamy–Arora)':
    'Random effects (Swamy–Arora)',
  'Effetti e proporzione mediata':
    'Effects and proportion mediated',
  'Effetti fissi (within)':
    'Fixed effects (within)',
  'Effetto':
    'Effect',
  'Effetto diretto (c′)':
    'Direct effect (c′)',
  'Effetto diretto c′':
    'Direct effect c′',
  'Effetto indiretto (a·b)':
    'Indirect effect (a·b)',
  'Effetto indiretto a·b = {s1} ({s2} al {s3}%: {s4}); effetto diretto c′ = {s5}; effetto totale c = {s6}.':
    'Indirect effect a·b = {s1} ({s2} at {s3}%: {s4}); direct effect c′ = {s5}; total effect c = {s6}.',
  'Effetto medio sul trattato (ATT)':
    'Average effect on the treated (ATT)',
  'Effetto totale (c)':
    'Total effect (c)',
  'Effetto totale c':
    'Total effect c',
  'Entità':
    'Entity',
  'Equazione dell’esito (Heckman)':
    'Outcome equation (Heckman)',
  'Equazione dell’esito (Tobit)':
    'Outcome equation (Tobit)',
  'Equazione di selezione (Heckman)':
    'Selection equation (Heckman)',
  'Esito':
    'Outcome',
  'FE':
    'FE',
  'FE + RE':
    'FE + RE',
  'FE contro RE · χ² con {s1} gradi di libertà':
    'FE versus RE · χ² with {s1} degrees of freedom',
  'Gli effetti fissi eliminano il livello medio di ogni entità: i coefficienti misurano solo la variazione entro entità, al netto delle differenze stabili nel tempo.':
    'Fixed effects remove the average level of each entity: the coefficients measure only within-entity variation, net of stable differences over time.',
  'Gli effetti fissi eliminano ogni caratteristica stabile dell’entità, anche non osservata; gli effetti casuali la trattano come un effetto casuale non correlato con i regressori e guadagnano efficienza se questa ipotesi regge.':
    'Fixed effects remove every stable characteristic of the entity, even unobserved ones; random effects treat it as a random effect uncorrelated with the regressors and gain efficiency if that assumption holds.',
  'Gli errori standard della prima fase sono corretti con la formula di Murphy–Topel/Greene; se la matrice di informazione non è invertibile la tabella segnala che la correzione non è stata applicata.':
    'The first-stage standard errors are corrected with the Murphy–Topel/Greene formula; if the information matrix is not invertible the table reports that the correction was not applied.',
  'Gli errori standard includono la correzione di prima fase (Murphy–Topel/Greene).':
    'The standard errors include the first-stage correction (Murphy–Topel/Greene).',
  'Gli errori standard principali sono cluster-robust per entità (HC1, tipo Arellano): correggono l’autocorrelazione dentro la stessa entità.':
    'The main standard errors are cluster-robust by entity (HC1, Arellano type): they correct autocorrelation within the same entity.',
  'Gli errori standard sono delta/ML (varianza residua divisa per n), come nella reference lavaan; p e intervalli sono normali a due code.':
    'The standard errors are delta/ML (residual variance divided by n), as in the lavaan reference; p-values and intervals are two-sided normal.',
  'Gli errori standard sono normali e basati sull’Hessiana numerica; con pochi casi o molta censura possono essere instabili.':
    'The standard errors are normal and based on the numerical Hessian; with few cases or heavy censoring they can be unstable.',
  'Hausman confronta FE e RE: sotto l’ipotesi nulla gli effetti di entità non sono correlati con i regressori e il modello RE è il più efficiente.':
    'Hausman compares FE and RE: under the null the entity effects are uncorrelated with the regressors and the RE model is the most efficient.',
  'Hausman non rifiuta il modello a effetti casuali (χ² = {s1}, {s2}): il RE resta l’opzione più efficiente.':
    'Hausman does not reject the random-effects model (χ² = {s1}, {s2}): RE remains the more efficient option.',
  'Hausman rifiuta il modello a effetti casuali (χ² = {s1}, {s2}): gli effetti di entità sono correlati con i regressori.':
    'Hausman rejects the random-effects model (χ² = {s1}, {s2}): the entity effects are correlated with the regressors.',
  'Hausman verifica se gli effetti di entità sono correlati con i regressori: sotto l’ipotesi nulla il modello a effetti casuali è coerente ed efficiente.':
    'Hausman tests whether the entity effects are correlated with the regressors: under the null the random-effects model is consistent and efficient.',
  'I coefficienti degli altri regressori sono interpretabili come nell’equazione strutturale, condizionatamente alla correzione per la selezione.':
    'The coefficients of the other regressors are interpreted as in the structural equation, conditional on the selection correction.',
  'I coefficienti descrivono la media latente y* = xβ: una unità in più del predittore sposta la media latente di β, non necessariamente la media osservata.':
    'The coefficients describe the latent mean y* = xβ: one more unit of the predictor shifts the latent mean by β, not necessarily the observed mean.',
  'I residui confrontano la risposta osservata con la media condizionata al lato della censura: non sono residui latenti.':
    'The residuals compare the observed response with the mean conditional on the censoring side: they are not latent residuals.',
  'I residui sono calcolati solo sulle righe selezionate, dove l’esito è osservato.':
    'Residuals are computed only on the selected rows, where the outcome is observed.',
  'I tre R² non sono confrontabili tra loro: un modello può spiegare bene le differenze tra entità e male la dinamica dentro le entità, o viceversa.':
    'The three R² values are not comparable with each other: a model can explain differences between entities well and within-entity dynamics poorly, or vice versa.',
  'IC bootstrap percentile':
    'Percentile bootstrap CI',
  'IC di Sobel':
    'Sobel CI',
  'IC high':
    'CI high',
  'IC low':
    'CI low',
  'IMR (λ)':
    'IMR (λ)',
  'Il Tobit di tipo I stima una regressione lineare su una risposta latente che osserviamo solo entro i limiti di censura: sotto (o sopra) il limite registriamo il limite, non il valore vero.':
    'Type-I Tobit estimates a linear regression on a latent response that we observe only within the censoring limits: below (or above) the limit we record the limit, not the true value.',
  'Il bootstrap ha usato {s1} replicazioni con seme {s2}; l’intervallo percentile è {s3}.':
    'The bootstrap used {s1} replications with seed {s2}; the percentile interval is {s3}.',
  'Il bootstrap non è disponibile: l’intervallo dell’effetto indiretto è quello di Sobel.':
    'The bootstrap is not available: the interval of the indirect effect is the Sobel one.',
  'Il bootstrap percentile dell’effetto indiretto è riportato nella tabella dedicata e non coincide necessariamente con l’intervallo di Sobel.':
    'The percentile bootstrap of the indirect effect is reported in the dedicated table and does not necessarily coincide with the Sobel interval.',
  'Il bootstrap ricampiona righe complete con reimmissione e rifitta entrambe le equazioni; le replicazioni non finite vengono scartate.':
    'The bootstrap resamples complete rows with replacement and refits both equations; non-finite replications are discarded.',
  'Il bootstrap è percentile: non corregge il bias e non sostituisce il disegno causale.':
    'The bootstrap is percentile: it does not correct bias and does not replace a causal design.',
  'Il coefficiente di lambda non è disponibile.':
    'The lambda coefficient is not available.',
  'Il disegno trasversale non distingue la direzione causale: un modello alternativo con esito e mediatore scambiati può adattarsi ugualmente bene.':
    'The cross-sectional design does not identify the causal direction: an alternative model with outcome and mediator swapped may fit equally well.',
  'Il due passi non massimizza la verosimiglianza congiunta di Heckman: non si riporta una log-verosimiglianza e non si confronta con modelli stimati per massima verosimiglianza.':
    'The two-step estimator does not maximise Heckman\'s joint likelihood: no log-likelihood is reported and it is not compared with maximum-likelihood models.',
  'Il due passi richiede sia righe selezionate sia righe escluse: senza le seconde il probit non è identificato.':
    'The two-step estimator requires both selected and excluded rows: without the latter the probit is not identified.',
  'Il due passi è meno efficiente della massima verosimiglianza congiunta e può produrre rho fuori dall’intervallo ammissibile.':
    'The two-step estimator is less efficient than joint maximum likelihood and can produce rho outside the admissible range.',
  'Il grafico confronta la media latente con la media osservata e mostra la linea del limite: le righe appiattite sul limite sono quelle censurate.':
    'The chart compares the latent mean with the observed mean and shows the limit line: rows flattened at the limit are the censored ones.',
  'Il matching 1:k con reimmissione riusa i controlli; con rapporto maggiore di 1 l’ATT resta una media di differenze appaiate, non un campione indipendente.':
    '1:k matching with replacement reuses controls; with a ratio above 1 the ATT remains a mean of matched differences, not an independent sample.',
  'Il matching confronta unità con punteggi simili; l’IPW ricostruisce un campione pseudo-trattato con pesi. Entrambi richiedono che le covariabili osservate bastino a controllare il confounding.':
    'Matching compares units with similar scores; IPW reconstructs a pseudo-treated sample with weights. Both require the observed covariates to be enough to control confounding.',
  'Il modello RE assume che gli effetti di entità non siano correlati con i regressori: se l’ipotesi è falsa la stima è distorta, e il test di Hausman può non essere informativo.':
    'The RE model assumes that entity effects are uncorrelated with the regressors: if the assumption is false the estimate is biased, and the Hausman test may not be informative.',
  'Il modello a effetti casuali tratta il livello di ogni entità come una estrazione casuale da una popolazione: usa la variazione tra entità e quella entro entità.':
    'The random-effects model treats each entity\'s level as a random draw from a population: it uses both between-entity and within-entity variation.',
  'Il modello di Heckman a due passi stima prima chi entra nel campione (probit di selezione) e poi l’esito sulle sole righe selezionate, inserendo l’inverse Mills ratio come correzione per la selezione.':
    'The Heckman two-step model first estimates who enters the sample (selection probit) and then the outcome on the selected rows only, inserting the inverse Mills ratio as the selection correction.',
  'Il modello mediatore spiega il mediatore con il predittore e le covariate; il modello esito aggiunge il mediatore.':
    'The mediator model explains the mediator with the predictor and covariates; the outcome model adds the mediator.',
  'Il modello non gestisce censura dell’esito oltre alla selezione: per un esito censurato e selezionato servirebbe un modello più generale.':
    'The model does not handle outcome censoring beyond selection: a censored and selected outcome would require a more general model.',
  'Il modello panel non contiene regressori oltre all’intercetta.':
    'The panel model contains no regressors beyond the intercept.',
  'Il modello serve a bilanciare i gruppi, non a spiegare l’esito: non interpretarlo come un modello causale.':
    'The model is meant to balance the groups, not to explain the outcome: do not read it as a causal model.',
  'Il modello usa {s1} osservazioni su {s2} entità e {s3} periodi; il panel è {s4}.':
    'The model uses {s1} observations on {s2} entities and {s3} periods; the panel is {s4}.',
  'Il modello usa {s1} osservazioni: {s2} censurate a sinistra, {s3} a destra e {s4} non censurate.':
    'The model uses {s1} observations: {s2} censored below, {s3} above and {s4} uncensored.',
  'Il modello è a effetti individuali: shock comuni a tutti i periodi (effetti temporali) non sono inclusi e possono distorcere stime e test.':
    'The model has individual effects: shocks common to all periods (time effects) are not included and can distort estimates and tests.',
  'Il modello è lineare e additivo: il predittore entra nell’equazione del mediatore (a), il mediatore e il predittore in quella dell’esito (b e c′), mentre c è l’effetto totale senza mediatore.':
    'The model is linear and additive: the predictor enters the mediator equation (a), the mediator and predictor enter the outcome equation (b and c′), while c is the total effect without the mediator.',
  'Il modello è lineare e normale sulla scala latente; non copre selezione campionaria né effetti casuali.':
    'The model is linear and normal on the latent scale; it does not cover sample selection or random effects.',
  'Il predittore deve precedere il mediatore e il mediatore deve precedere l’esito: la mediazione è un’ipotesi causale, non una conseguenza automatica della regressione.':
    'The predictor must precede the mediator and the mediator must precede the outcome: mediation is a causal hypothesis, not an automatic consequence of regression.',
  'Il probit deve essere specificato correttamente: se manca un predittore rilevante della selezione, la correzione non basta.':
    'The probit must be correctly specified: if a relevant selection predictor is missing, the correction is not enough.',
  'Il probit di selezione non ha raggiunto la convergenza: le stime non sono affidabili.':
    'The selection probit did not converge: the estimates are not reliable.',
  'Il probit modella la probabilità di essere selezionato; i suoi coefficienti sono su scala latente normale e non sono effetti marginali sulla probabilità.':
    'The probit models the probability of being selected; its coefficients are on the latent normal scale and are not marginal effects on the probability.',
  'Il probit usa {s1} osservazioni e {s2} predittori di selezione; l’equazione dell’esito è stimata su {s3} righe selezionate, con {s4} righe escluse.':
    'The probit uses {s1} observations and {s2} selection predictors; the outcome equation is estimated on {s3} selected rows, with {s4} excluded rows.',
  'Il punteggio di propensione è la probabilità stimata di trattamento; i coefficienti sono sulla scala logit.':
    'The propensity score is the estimated probability of treatment; the coefficients are on the logit scale.',
  'Il run usa {s1} osservazioni complete; il modello mediatore ha R² = {s2} e il modello esito R² = {s3} (totale: {s4}).':
    'The run uses {s1} complete observations; the mediator model has R² = {s2} and the outcome model R² = {s3} (total: {s4}).',
  'Il supporto comune è descritto dall’intervallo dei punteggi, non da un test formale di sovrapposizione.':
    'Common support is described by the score interval, not by a formal overlap test.',
  'Il test di Hausman non è definito positivamente: la scelta tra FE e RE va argomentata dal disegno, non dal test.':
    'The Hausman test is not positive definite: the choice between FE and RE must be argued from the design, not from the test.',
  'Il test di Wald su lambda riguarda la media dell’esito, non la probabilità di selezione: un p alto non dimostra che la selezione sia assente.':
    'The Wald test on lambda concerns the mean outcome, not the selection probability: a high p does not prove that selection is absent.',
  'Il test di Wald verifica H0: lambda = 0, cioè assenza di selezione nella media dell’esito osservato. Un p alto non dimostra assenza di selezione, soprattutto con pochi casi.':
    'The Wald test checks H0: lambda = 0, that is no selection in the mean observed outcome. A high p does not prove the absence of selection, especially with few cases.',
  'Il test non rifiuta l’ipotesi nulla: il modello a effetti casuali resta preferibile per efficienza, se le assunzioni sul disegno sono credibili.':
    'The test does not reject the null: the random-effects model remains preferable for efficiency, if the design assumptions are credible.',
  'Il test rifiuta l’ipotesi nulla: il modello a effetti fissi è la scelta coerente, perché il RE sarebbe distorto dalla correlazione tra effetti e regressori.':
    'The test rejects the null: the fixed-effects model is the consistent choice, because RE would be biased by the correlation between effects and regressors.',
  'Il valore assoluto più alto degli SMD dopo l’aggiustamento è {s1}.':
    'The highest absolute SMD after adjustment is {s1}.',
  'La SE classica assume residui indipendenti e omoschedastici ed è riportata per confronto: è la base del test di Hausman.':
    'The classical SE assumes independent homoscedastic residuals and is reported for comparison: it is the basis of the Hausman test.',
  'La bontà del modello di propensione si valuta dal bilanciamento prodotto, non dall’AUC o dai p dei coefficienti.':
    'The quality of the propensity model is judged by the balance it produces, not by the AUC or the p-values of its coefficients.',
  'La censura deve essere di tipo I, con il limite noto e uguale per tutte le righe; limiti diversi richiedono un modello diverso.':
    'Censoring must be type I, with a known limit equal for all rows; different limits require a different model.',
  'La censura è bilaterale: limite inferiore {s1}, limite superiore {s2} ({s3}% delle osservazioni al limite).':
    'Censoring is two-sided: lower limit {s1}, upper limit {s2} ({s3}% of observations at a limit).',
  'La censura è di tipo I: non distingue tra “zero vero” e “zero per mancata osservazione”.':
    'Censoring is type I: it does not distinguish a “true zero” from a “zero because unobserved”.',
  'La censura è di tipo I: tutte le osservazioni oltre il limite sono registrate esattamente al limite, senza informazione sulla distanza.':
    'Censoring is type I: all observations beyond the limit are recorded exactly at the limit, with no information on the distance.',
  'La censura è solo inferiore, al limite {s1} ({s2}% delle osservazioni).':
    'Censoring is lower only, at limit {s1} ({s2}% of observations).',
  'La coerenza algebrica è rispettata: c coincide con c′ + a·b entro errore numerico.':
    'The algebraic consistency holds: c coincides with c′ + a·b within numerical error.',
  'La componente non spiegata deve essere normale e omoschedastica: code pesanti o eteroschedasticità distortono le stime.':
    'The unexplained component must be normal and homoscedastic: heavy tails or heteroscedasticity bias the estimates.',
  'La convergenza non è stata raggiunta: controlla collinearità, scala delle colonne e numero di righe prima di leggere i coefficienti.':
    'Convergence was not reached: check collinearity, column scales and the number of rows before reading the coefficients.',
  'La convergenza è quella dell’ottimizzatore BFGS; un numero di iterazioni al limite richiede di controllare scala delle colonne e collinearità.':
    'Convergence is that of the BFGS optimiser; a number of iterations at the limit requires checking column scales and collinearity.',
  'La correzione di prima fase non era calcolabile: gli errori standard riportati sono quelli OLS e vanno letti come limite inferiore.':
    'The first-stage correction was not computable: the reported standard errors are the OLS ones and should be read as a lower bound.',
  'La differenza tra le due matrici di covarianza non è definita positiva: il test non è affidabile e la statistica va letta solo come diagnostica.':
    'The difference between the two covariance matrices is not positive definite: the test is unreliable and the statistic should be read only as a diagnostic.',
  'La differenza tra le due matrici di covarianza è definita positiva: la statistica è un’autentica forma quadratica.':
    'The difference between the two covariance matrices is positive definite: the statistic is a genuine quadratic form.',
  'La differenza tra le matrici di covarianza non è definita positiva: la statistica ({s1}) non ha una distribuzione χ² valida e va letta solo come diagnostica.':
    'The difference between the covariance matrices is not positive definite: the statistic ({s1}) has no valid χ² distribution and should be read only as a diagnostic.',
  'La log-verosimiglianza del Tobit non è confrontabile con quella di una regressione lineare sugli stessi dati: cambia il modello di probabilità.':
    'The Tobit log-likelihood cannot be compared with that of a linear regression on the same data: the probability model is different.',
  'La log-verosimiglianza e l’AIC non sono definiti per il due passi e non vengono riportati.':
    'The log-likelihood and AIC are not defined for the two-step estimator and are not reported.',
  'La log-verosimiglianza è quella del modello censurato, quindi non è confrontabile con quella di una regressione lineare sugli stessi dati non censurati.':
    'The log-likelihood is that of the censored model, so it cannot be compared with that of a linear regression on the same uncensored data.',
  'La mediazione scompone l’effetto di un predittore sull’esito in una via diretta e in una via che passa per un mediatore.':
    'Mediation decomposes the effect of a predictor on the outcome into a direct path and a path through a mediator.',
  'La normalità congiunta delle due componenti è assunta; deviazioni forti rendono fragili le stime e gli errori standard.':
    'Joint normality of the two components is assumed; strong departures make the estimates and standard errors fragile.',
  'La procedura richiede righe complete e una cella entità-periodo per osservazione: dati mancanti o duplicati vanno sistemati prima del run.':
    'The procedure requires complete rows and one entity-period cell per observation: missing or duplicated data must be fixed before the run.',
  'La proporzione mediata è indiretto / totale: se il totale è vicino a zero il rapporto non è stabile e viene riportato come non calcolabile.':
    'The proportion mediated is indirect / total: if the total is close to zero the ratio is unstable and is reported as not computable.',
  'La proporzione mediata è instabile quando l’effetto totale è vicino a zero e non ha un intervallo affidabile in quel caso.':
    'The proportion mediated is unstable when the total effect is close to zero and has no reliable interval in that case.',
  'La proporzione mediata è {s1}: indica quanta parte dell’effetto totale passa dal mediatore.':
    'The proportion mediated is {s1}: it indicates how much of the total effect passes through the mediator.',
  'La riga IMR (λ) è il coefficiente dell’inverse Mills ratio: se è diverso da zero la selezione sposta la media dell’esito osservato.':
    'The IMR (λ) row is the coefficient of the inverse Mills ratio: if it differs from zero, selection shifts the mean observed outcome.',
  'La riga di coerenza è la differenza numerica tra l’effetto totale stimato e la somma c′ + a·b: deve essere circa zero.':
    'The consistency row is the numerical difference between the estimated total effect and c′ + a·b: it should be about zero.',
  'La selezione sposta la media dell’esito osservato: lambda è significativo (p < {s1}).':
    'Selection shifts the mean observed outcome: lambda is significant (p < {s1}).',
  'La selezione è binaria e il probit è lineare nei predittori; non copre selezione multi-stadio né variabili strumentali aggiuntive.':
    'Selection is binary and the probit is linear in the predictors; it does not cover multi-stage selection or additional instrumental variables.',
  'La trasformazione (quasi-demeaning) sottrae a ogni osservazione una quota θ della media di entità; θ vale zero quando la varianza tra entità è nulla e uno quando è dominante.':
    'The quasi-demeaning transformation subtracts a share θ of the entity mean from each observation; θ is zero when between-entity variance is zero and one when it dominates.',
  'La variabile dipendente ritardata tra i regressori introduce una distorsione (bias di Nickell) che né FE né RE correggono: servono stimatori GMM dinamici, non disponibili in questa procedura.':
    'A lagged dependent variable among the regressors introduces a bias (Nickell bias) that neither FE nor RE corrects: dynamic GMM estimators are needed, not available in this procedure.',
  'Lambda (δ)':
    'Lambda (δ)',
  'Lambda (δ) = {s1} (CI {s6}% {s2}), {s3}; il test di Wald vale {s4} con p = {s5}.':
    'Lambda (δ) = {s1} (CI {s6}% {s2}), {s3}; the Wald test is {s4} with p = {s5}.',
  'Lambda (δ) è il coefficiente dell’inverse Mills ratio: se è positivo la selezione aumenta la media dell’esito osservato, se è negativo la riduce.':
    'Lambda (δ) is the coefficient of the inverse Mills ratio: if positive, selection raises the mean observed outcome; if negative, it lowers it.',
  'Le osservazioni devono essere indipendenti e il limite va scelto prima di guardare i risultati.':
    'Observations must be independent and the limit must be chosen before looking at the results.',
  'Le righe al limite di censura non sono valori mancanti: contribuiscono alla verosimiglianza con la probabilità di trovarsi oltre il limite.':
    'Rows at the censoring limit are not missing values: they contribute to the likelihood with the probability of being beyond the limit.',
  'Log-verosimiglianza: {s1}. Il due passi non è un estimatore di massima verosimiglianza e non produce un AIC confrontabile.':
    'Log-likelihood: {s1}. The two-step estimator is not a maximum-likelihood estimator and does not produce a comparable AIC.',
  'L’ATT non è calcolabile con i dati e i parametri scelti.':
    'The ATT cannot be computed with the chosen data and parameters.',
  'L’IPW può produrre pesi estremi quando i punteggi sono vicini a 1; l’effective sample size segnala la perdita di informazione.':
    'IPW can produce extreme weights when scores are close to 1; the effective sample size signals the loss of information.',
  'L’effective sample size misura quanta informazione resta dopo la ponderazione; valori molto inferiori al campione indicano pesi estremi.':
    'The effective sample size measures how much information remains after weighting; values much lower than the sample indicate extreme weights.',
  'L’effetto indiretto è il prodotto a·b; il suo errore standard è quello di Sobel e l’intervallo è normale.':
    'The indirect effect is the product a·b; its standard error is the Sobel one and its interval is normal.',
  'L’effetto indiretto è {s1} e l’{s2} al {s3}% ({s4}) non contiene lo zero.':
    'The indirect effect is {s1} and the {s2} at {s3}% ({s4}) does not contain zero.',
  'L’effetto indiretto è {s1}, ma l’{s2} al {s3}% ({s4}) contiene lo zero.':
    'The indirect effect is {s1}, but the {s2} at {s3}% ({s4}) contains zero.',
  'L’intervallo di confidenza contiene lo zero: i dati non escludono un effetto nullo.':
    'The confidence interval contains zero: the data do not exclude a null effect.',
  'L’intervallo di confidenza non contiene lo zero: la direzione dell’effetto è coerente, ma resta un’associazione aggiustata, non una prova automatica di causalità.':
    'The confidence interval does not contain zero: the direction of the effect is consistent, but it remains an adjusted association, not automatic proof of causation.',
  'L’intervallo è percentile (2,5–97,5%): non usa la normalità e può essere asimmetrico.':
    'The interval is percentile (2.5–97.5%): it does not assume normality and can be asymmetric.',
  'L’ottimizzatore ha raggiunto la convergenza in {s1} iterazioni; la log-verosimiglianza vale {s2} e l’AIC {s3}.':
    'The optimiser converged in {s1} iterations; the log-likelihood is {s2} and the AIC {s3}.',
  'L’ottimizzatore non ha raggiunto la convergenza: le stime non sono affidabili.':
    'The optimiser did not converge: the estimates are not reliable.',
  'Media controlli dopo':
    'Control mean after',
  'Media controlli prima':
    'Control mean before',
  'Media trattati':
    'Treated mean',
  'Mediazione compatibile':
    'Mediation supported',
  'Mediazione non conclusiva':
    'Mediation inconclusive',
  'Metodo: {s1}. Trattati: {s2}; controlli: {s3}.':
    'Method: {s1}. Treated: {s2}; controls: {s3}.',
  'Modello di propensione':
    'Propensity model',
  'N controlli':
    'N controls',
  'N trattati':
    'N treated',
  'Nessun coefficiente di predittore è significativo (p < {s1}).':
    'No predictor coefficient is significant (p < {s1}).',
  'Nessun coefficiente di regressore è significativo al livello scelto (p < {s1}).':
    'No regressor coefficient is significant at the chosen level (p < {s1}).',
  'Nessun percorso risulta significativo al livello scelto: la scomposizione va letta con cautela.':
    'No path is significant at the chosen level: read the decomposition with caution.',
  'Nessun predittore della selezione è significativo (p < {s1}): il meccanismo di ingresso è debole o poco informativo.':
    'No selection predictor is significant (p < {s1}): the entry mechanism is weak or uninformative.',
  'Nessuna covariabile supera la soglia convenzionale di 0.1 dopo l’aggiustamento.':
    'No covariate exceeds the conventional 0.1 threshold after adjustment.',
  'Non censurati':
    'Uncensored',
  'Non emerge un effetto di selezione sulla media dell’esito (p = {s1}).':
    'No selection effect on the mean outcome emerges (p = {s1}).',
  'Non selezionati':
    'Not selected',
  'Non sono inclusi effetti moderati, interazioni predittore × mediatore, variabili latenti o modelli SEM completi.':
    'Moderated effects, predictor × mediator interactions, latent variables and full SEM models are not included.',
  'Non sono inclusi effetti temporali a due vie, panel dinamici (GMM di Arellano–Bond) né stimatori per variabili strumentali panel.':
    'Two-way time effects, dynamic panels (Arellano–Bond GMM) and panel instrumental-variable estimators are not included.',
  'Panel bilanciato':
    'Balanced panel',
  'Parametri di varianza (Heckman)':
    'Variance parameters (Heckman)',
  'Parametri di varianza (Tobit)':
    'Variance parameters (Tobit)',
  'Percorsi della mediazione':
    'Mediation paths',
  'Percorso':
    'Path',
  'Percorso a (predittore → mediatore)':
    'Path a (predictor → mediator)',
  'Percorso b (mediatore → esito)':
    'Path b (mediator → outcome)',
  'Periodi':
    'Periods',
  'Ponderazione per probabilità inversa (IPW)':
    'Inverse probability weighting (IPW)',
  'Propensity':
    'Propensity',
  'Proporzione mediata':
    'Proportion mediated',
  'Quando il test non è utilizzabile, la scelta dipende dal disegno: effetti fissi se le differenze tra entità sono sistematiche, effetti casuali se le entità sono un campione casuale.':
    'When the test cannot be used, the choice depends on the design: fixed effects if between-entity differences are systematic, random effects if entities are a random sample.',
  'Relazione':
    'Relationship',
  'Replicazioni':
    'Replications',
  'Report di lettura — Mediazione':
    'Reading report — Mediation',
  'Report di lettura — Modelli panel (FE/RE)':
    'Reading report — Panel models (FE/RE)',
  'Report di lettura — Propensity score':
    'Reading report — Propensity score',
  'Report di lettura — Regressione Tobit (censurata)':
    'Reading report — Tobit regression (censored)',
  'Report di lettura — Selezione campionaria (Heckman, due passi)':
    'Reading report — Sample selection (Heckman, two-step)',
  'Resta uno squilibrio superiore a 0.1: l’ATT va letto con cautela e il modello di propensione può essere rivisto.':
    'One imbalance above 0.1 remains: read the ATT with caution and consider revising the propensity model.',
  'Rho (ρ)':
    'Rho (ρ)',
  'Rho = δ / σ riassume la correlazione tra selezione ed esito; valori vicini a zero indicano che la selezione non sposta la media condizionata.':
    'Rho = δ / σ summarises the correlation between selection and outcome; values near zero indicate that selection does not shift the conditional mean.',
  'Rho può uscire da (-1, 1) e viene riportato senza forzature, con la nota di instabilità.':
    'Rho can fall outside (-1, 1) and is reported without forcing it, with a note of instability.',
  'Rho stimato è fuori dall’intervallo (-1, 1): con campioni piccoli o selezione debole il due passi può produrre un valore non ammissibile. Va letto come segnale di instabilità, non corretto a forza.':
    'The estimated rho is outside (-1, 1): with small samples or weak selection the two-step estimator can produce an inadmissible value. Read it as a sign of instability, not forced back.',
  'Rho è fuori da (-1, 1): con campioni piccoli o selezione debole il due passi può produrre un valore non ammissibile, segnale di instabilità più che di un effetto reale.':
    'Rho is outside (-1, 1): with small samples or weak selection the two-step estimator can produce an inadmissible value, a sign of instability rather than a real effect.',
  'R² between ({s1})':
    'R² between ({s1})',
  'R² modello esito':
    'Outcome model R²',
  'R² modello mediatore':
    'Mediator model R²',
  'R² modello totale':
    'Total model R²',
  'R² overall ({s1})':
    'R² overall ({s1})',
  'R² within ({s1})':
    'R² within ({s1})',
  'R² within = {s1}, R² between = {s2}, R² overall = {s3} per il modello a effetti {s4}.':
    'R² within = {s1}, R² between = {s2}, R² overall = {s3} for the {s4} effects model.',
  'R² within usa solo la variazione entro entità, R² between solo le medie di entità, R² overall l’intera variabilità rispetto alla media generale.':
    'R² within uses only within-entity variation, R² between only entity means, R² overall the whole variability around the grand mean.',
  'SE bootstrap':
    'Bootstrap SE',
  'SE cluster':
    'Cluster SE',
  'SE di lambda':
    'SE of lambda',
  'SE di sigma':
    'SE of sigma',
  'SMD = differenza delle medie divisa per la deviazione standard pooled calcolata sull’intero campione prima del matching.':
    'SMD = difference of means divided by the pooled standard deviation computed on the whole sample before matching.',
  'SMD prima':
    'SMD before',
  'Scelta tra effetti fissi e casuali':
    'Choice between fixed and random effects',
  'Scomposizione degli effetti':
    'Effect decomposition',
  'Selezionati':
    'Selected',
  'Selezione non rilevata':
    'Selection not detected',
  'Selezione rilevante':
    'Selection relevant',
  'Seme':
    'Seed',
  'Senza righe censurate il Tobit coincide con una regressione lineare e il modello non è identificato come censurato: la procedura lo segnala come errore.':
    'Without censored rows Tobit coincides with a linear regression and the model is not identified as censored: the procedure reports it as an error.',
  'Serve almeno una variabile che entra nella selezione e non nell’esito (esclusione): senza di essa l’identificazione poggia solo sulla non linearità dell’inverse Mills ratio.':
    'At least one variable must enter selection but not the outcome (exclusion): without it identification rests only on the nonlinearity of the inverse Mills ratio.',
  'Serve quando l’esito è osservato solo per un sottoinsieme non casuale delle unità: una regressione sulle sole righe osservate confonderebbe l’effetto dei predittori con il meccanismo di selezione.':
    'It is needed when the outcome is observed only for a non-random subset of units: a regression on the observed rows alone would confuse the predictor effect with the selection mechanism.',
  'Servono assenza di confondimento non misurato, specificazione corretta delle covariate e relazioni lineari senza interazione predittore × mediatore.':
    'No unmeasured confounding, correct covariate specification and linear relationships without predictor × mediator interaction are required.',
  'Sigma (σ)':
    'Sigma (σ)',
  'Sigma = {s1}, rho = {s2}: rho misura la correlazione tra le due equazioni; con rho vicino a zero la correzione cambia poco le stime.':
    'Sigma = {s1}, rho = {s2}: rho measures the correlation between the two equations; with rho near zero the correction changes the estimates little.',
  'Sigma stimato: {s1}; è la deviazione standard della parte non spiegata sulla scala latente.':
    'Estimated sigma: {s1}; it is the standard deviation of the unexplained part on the latent scale.',
  'Sigma è la deviazione standard dei residui dell’equazione dell’esito sul campione selezionato; rho = lambda / sigma misura la correlazione tra le due equazioni.':
    'Sigma is the standard deviation of the outcome-equation residuals on the selected sample; rho = lambda / sigma measures the correlation between the two equations.',
  'Sigma è la deviazione standard della componente non spiegata sulla scala latente: non è l’errore standard di una singola previsione osservata.':
    'Sigma is the standard deviation of the unexplained component on the latent scale: it is not the standard error of a single observed prediction.',
  'Solo stimatore a due passi: non è implementata la massima verosimiglianza congiunta di Heckman.':
    'Two-step estimator only: Heckman\'s joint maximum likelihood is not implemented.',
  'Statistica χ² = {s1} con {s2} gradi di libertà, {s3}.':
    'χ² statistic = {s1} with {s2} degrees of freedom, {s3}.',
  'Stima indiretta':
    'Indirect estimate',
  'Supporto comune':
    'Common support',
  'Test di Hausman':
    'Hausman test',
  'Trattati analizzati':
    'Treated analysed',
  'Trattati scartati (fuori caliper)':
    'Treated dropped (outside caliper)',
  'Trattati scartati per assenza di controlli nel caliper: {s1}. Supporto comune: {s2}.':
    'Treated dropped for lack of controls within the caliper: {s1}. Common support: {s2}.',
  'Un panel osserva le stesse entità in più periodi: separare la variabilità dentro ciascuna entità da quella tra entità è il problema centrale di questi modelli.':
    'A panel observes the same entities over several periods: separating within-entity variability from between-entity variability is the central problem of these models.',
  'Una variazione di β non si traduce in una variazione uguale del valore atteso osservato, perché il troncamento cambia con i predittori.':
    'A change in β does not translate into an equal change in the observed expected value, because truncation changes with the predictors.',
  'Usare una regressione lineare sui valori censurati mescolerebbe il limite con i valori reali e sottostimerebbe la pendenza; il Tobit usa l’informazione “almeno il limite” correttamente.':
    'Using a linear regression on the censored values would mix the limit with the real values and underestimate the slope; Tobit uses the “at least the limit” information correctly.',
  'Valori assoluti sotto 0.1 indicano uno squilibrio trascurabile; la soglia è una convenzione, non un test.':
    'Absolute values below 0.1 indicate negligible imbalance; the threshold is a convention, not a test.',
  'Verosimiglianza e residui · {s1}':
    'Likelihood and residuals · {s1}',
  'Vicinino più prossimo (1:{s1})':
    'Nearest neighbour (1:{s1})',
  'a è la pendenza del mediatore sul predittore; b è il coefficiente del mediatore nell’equazione dell’esito; c′ è l’effetto diretto del predittore al netto del mediatore.':
    'a is the slope of the mediator on the predictor; b is the coefficient of the mediator in the outcome equation; c′ is the direct effect of the predictor net of the mediator.',
  'c è l’effetto totale del predittore sull’esito, stimato senza il mediatore. Nel modello lineare senza interazione deve coincidere con c′ + a·b.':
    'c is the total effect of the predictor on the outcome, estimated without the mediator. In the linear model without interaction it must coincide with c′ + a·b.',
  'caliper {s1} DP del punteggio':
    'caliper {s1} SD of the score',
  'matching per vicinino più prossimo':
    'nearest-neighbour matching',
  'nessun caliper':
    'no caliper',
  'nessuno':
    'none',
  'non bilanciato':
    'unbalanced',
  'non definita per il due passi':
    'not defined for the two-step estimator',
  'p(Wald)':
    'p(Wald)',
  '{s1} coefficiente/i di regressore su {s2} sono significativi al livello scelto (p < {s3}).':
    '{s1} regressor coefficient(s) out of {s2} are significant at the chosen level (p < {s3}).',
  '{s1} coefficienti di predittore su {s2} sono significativi (p < {s3}).':
    '{s1} predictor coefficients out of {s2} are significant (p < {s3}).',
  '{s1} covariabili nel modello; {s2} risultano associate al trattamento al livello scelto.':
    '{s1} covariates in the model; {s2} are associated with treatment at the chosen level.',
  '{s1} osservazioni · censura a {s2}':
    '{s1} observations · censoring at {s2}',
  '{s1} osservazioni · {s2} selezionate':
    '{s1} observations · {s2} selected',
  '{s1} percorsi su 4 sono significativi (p < {s2}).':
    '{s1} paths out of 4 are significant (p < {s2}).',
  '{s1} predittori della selezione su {s2} sono significativi (p < {s3}), quindi l’ingresso nel campione non è casuale rispetto a quelle variabili.':
    '{s1} selection predictors out of {s2} are significant (p < {s3}), so entry into the sample is not random with respect to those variables.',
  '{s1} replicazioni · IC percentile {s2}%':
    '{s1} replications · percentile CI {s2}%',
  '{s1} spiegato da {s2} regressore/i nel modello a effetti {s3}.':
    '{s1} explained by {s2} regressor(s) in the {s3} effects model.',
  '{s1} su {s2} · {s3} · CI {s4}%':
    '{s1} on {s2} · {s3} · CI {s4}%',
  '{s1} ~ covariabili · logit · CI {s2}%':
    '{s1} ~ covariates · logit · CI {s2}%',
  '{s1} · ML · CI {s2}%':
    '{s1} · ML · CI {s2}%',
  '{s1} · SE cluster per entità · CI {s2}%':
    '{s1} · cluster SE by entity · CI {s2}%',
  '{s1} · due passi · CI {s2}%':
    '{s1} · two-step · CI {s2}%',
  '{s1} · probit · CI {s2}%':
    '{s1} · probit · CI {s2}%',
  '{s1} · quasi-demeaning · CI {s2}%':
    '{s1} · quasi-demeaning · CI {s2}%',
  '{s1} · sigma e limiti di censura':
    '{s1} · sigma and censoring limits',
  '{s1} · sigma, rho e lambda':
    '{s1} · sigma, rho and lambda',
  '{s1} · {s2} entità · {s3} periodi':
    '{s1} · {s2} entities · {s3} periods',
  '{s1} → {s2}':
    '{s1} → {s2}',
  '{s1} → {s2} (diretto)':
    '{s1} → {s2} (direct)',
  '{s1} → {s2} (totale)':
    '{s1} → {s2} (total)',
  '{s1} → {s2} → {s3} · CI {s4}%':
    '{s1} → {s2} → {s3} · CI {s4}%',
  '{s1}% del totale':
    '{s1}% of the total',
  '{s1}: B = {s2} (CI {s3}), {s4}.':
    '{s1}: B = {s2} (CI {s3}), {s4}.',
  '{s1}: β = {s2} (CI {s3}%), {s4}.':
    '{s1}: β = {s2} (CI {s3}%), {s4}.',
  '{s1}: β = {s2} (CI {s5}% {s3}), {s4}.':
    '{s1}: β = {s2} (CI {s5}% {s3}), {s4}.',
  'β descrive come cambia la media latente y*, non la media dei valori osservati: vicino al limite la seconda è compressa dalla censura.':
    'β describes how the latent mean y* changes, not the mean of the observed values: near the limit the latter is compressed by censoring.',
  'θ (quasi-demeaning)':
    'θ (quasi-demeaning)',
  'θ = {s1}: è il peso della media di entità nella trasformazione del modello RE; con θ vicino a uno il RE si avvicina al FE.':
    'θ = {s1}: it is the weight of the entity mean in the RE transformation; with θ near one RE approaches FE.',
  'θ combina le due componenti con il numero di periodi: serve alla trasformazione del modello a effetti casuali.':
    'θ combines the two components with the number of periods: it is needed for the random-effects transformation.',
  'σ² entità (tra entità)':
    'σ² entity (between entities)',
  'σ² entità = {s1}: misura quanto i livelli medi delle entità differiscono tra loro.':
    'σ² entity = {s1}: it measures how much the average levels of entities differ.',
  'σ² idiosincratico (entro entità)':
    'σ² idiosyncratic (within entities)',
  'σ² idiosincratico = {s1}: è la variabilità che resta dentro ogni entità dopo i regressori.':
    'σ² idiosyncratic = {s1}: it is the variability left within each entity after the regressors.',
  'σ² idiosincratico misura la variabilità non spiegata dentro ogni entità; σ² entità misura quanto i livelli medi differiscono tra loro.':
    'σ² idiosyncratic measures the unexplained variability within each entity; σ² entity measures how much average levels differ.',
  'Effetti casuali':
    'Random effects',
  'Matching':
    'Matching',
  'RE':
    'RE',
  'SE classica':
    'Classical SE',
  'SMD dopo':
    'SMD after',
  'applicata':
    'applied',
  'bilanciato':
    'balanced',
  'casuali':
    'random',
  'fissi':
    'fixed',
  '{s1} osservazioni complete':
    '{s1} complete observations',
  'Le osservazioni della stessa entità sono correlate nel tempo: il FE riporta errori standard cluster-robust per entità e il RE li affianca a quelli classici, che non correggono l’autocorrelazione.': 'Observations on the same entity are correlated over time: FE reports cluster-robust standard errors by entity and RE places them next to the classical ones, which do not correct autocorrelation.',
  'Gli errori standard principali sono quelli classici di plm: la scala è la varianza residua del modello trasformato, non la varianza entro entità.': 'The main standard errors are plm\'s classical ones: the scale is the residual variance of the transformed model, not the within-entity variance.',
  'La SE cluster per entità è riportata per confronto: corregge l’autocorrelazione dentro l’entità e rende le inferenze più prudenti.': 'The cluster SE by entity is reported for comparison: it corrects autocorrelation within the entity and makes inference more conservative.',
};
