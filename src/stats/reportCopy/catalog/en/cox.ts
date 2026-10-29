/** English prose of the cox report and its tables. */
export const coxCopy: Record<string, string> = {
  'Concordanza (C di Harrell)':
    'Concordance (Harrell\'s C)',
  '{s1}: stima non disponibile.':
    '{s1}: estimate not available.',
  '{s1}: stima instabile (B = {s2}, errore standard = {s3}), coerente con separazione quasi completa: l’hazard ratio non è interpretabile.':
    '{s1}: unstable estimate (B = {s2}, standard error = {s3}), consistent with near-complete separation: the hazard ratio cannot be interpreted.',
  'non modifica':
    'does not change',
  '{s1}: HR = {s2} ({s3} – {s4}), {s5} → {s6}{s7}.':
    '{s1}: HR = {s2} ({s3} – {s4}), {s5} → {s6}{s7}.',
  'un aumento di una unità {s1} il rischio istantaneo di evento':
    'a one-unit increase {s1} the instantaneous risk of the event',
  'nessuna associazione affidabile con il rischio':
    'no reliable association with the risk',
  '; B = {s1}':
    '; B = {s1}',
  'Report di lettura — Regressione di Cox':
    'Reading report — Cox regression',
  'Stime instabili: {s1} separa quasi completamente gli eventi, quindi l’hazard ratio (B = {s2}) non è interpretabile.':
    'Unstable estimates: {s1} almost completely separates the events, so the hazard ratio (B = {s2}) cannot be interpreted.',
  'Il modello è significativo (LR χ² = {s1}, {s2}) e la covariata più forte è {s3} (HR = {s4}).':
    'The model is significant (LR χ² = {s1}, {s2}) and the strongest covariate is {s3} (HR = {s4}).',
  'Il modello non è significativo (LR χ² = {s1}, {s2}): le covariariate non spiegano i tempi di evento meglio del caso.':
    'The model is not significant (LR χ² = {s1}, {s2}): the covariates do not explain the event times better than chance.',
  'Il modello di Cox non è stimabile con i dati disponibili.':
    'The Cox model cannot be estimated with the available data.',
  'Stime instabili':
    'Unstable estimates',
  'Effetto rilevato':
    'Effect detected',
  'La regressione di Cox mette in relazione il tempo fino all’evento con una o più covariariate, senza assumere una forma specifica per il rischio di base.{s1}':
    'Cox regression relates the time to the event to one or more covariates, without assuming a specific shape for the baseline risk.{s1}',
  ' Qui ci sono {s1} osservazioni, {s2} eventi e {s3} censurati.':
    ' Here there are {s1} observations, {s2} events and {s3} censored.',
  'L’hazard ratio confronta il rischio istantaneo di evento per un incremento unitario della covariata, a parità delle altre: HR = 2 significa rischio doppio in ogni istante, non durata doppia.':
    'The hazard ratio compares the instantaneous risk of the event for a one-unit increase in the covariate, holding the others constant: HR = 2 means twice the risk at every instant, not twice the duration.',
  'Il modello nel suo insieme':
    'The model as a whole',
  'Rapporto di verosimiglianza: χ² = {s1} con {s2} gradi di libertà, {s3} (soglia α = {s4}).':
    'Likelihood ratio: χ² = {s1} with {s2} degrees of freedom, {s3} (α threshold = {s4}).',
  'Concordanza C = {s1}: {s2}.':
    'Concordance C = {s1}: {s2}.',
  'peggio del caso, controlla i segni':
    'worse than chance, check the signs',
  'discriminazione modesta':
    'modest discrimination',
  'discriminazione discreta':
    'fair discrimination',
  'buona capacità di ordinare i tempi':
    'good ability to order the times',
  'Eventi per covariata: {s1}. Sotto 10 le stime diventano fragili e il modello può essere sovra-adattato.':
    'Events per covariate: {s1}. Below 10 the estimates become fragile and the model can be overfitted.',
  'Eventi per covariata':
    'Events per covariate',
  'AIC = {s1}: utile solo per confrontare modelli stimati sugli stessi dati.':
    'AIC = {s1}: useful only to compare models estimated on the same data.',
  'Ogni covariata':
    'Each covariate',
  'Nessun coefficiente disponibile.':
    'No coefficient available.',
  'Rischi proporzionali':
    'Proportional hazards',
  'Il test globale dà {s1}: l’effetto di almeno una covariata sembra cambiare nel tempo. Il modello resta una sintesi media, ma HR unico e curve di sopravvivenza previste vanno presentati con prudenza; valuta interazioni con il tempo o modelli stratificati.':
    'The global test gives {s1}: the effect of at least one covariate seems to change over time. The model remains an average summary, but a single HR and the predicted survival curves should be presented with caution; consider interactions with time or stratified models.',
  'Il test globale dà {s1}: non emerge un cambiamento dell’effetto nel tempo, quindi l’ipotesi di rischi proporzionali è compatibile con i dati.':
    'The global test gives {s1}: no change of the effect over time emerges, so the proportional hazards assumption is compatible with the data.',
  'Il test confronta il modello con uno che aggiunge covariata × log(t): un p piccolo segnala che l’effetto non è costante.':
    'The test compares the model with one that adds covariate × log(t): a small p signals that the effect is not constant.',
  'HR = 1: nessun effetto. HR > 1: rischio maggiore per valori più alti della covariata. HR < 1: effetto protettivo.':
    'HR = 1: no effect. HR > 1: higher risk for higher values of the covariate. HR < 1: protective effect.',
  'IC dell’HR che non contiene 1 è coerente con un test di Wald significativo; l’intervallo è moltiplicativo, quindi 0,5 e 2 sono effetti simmetrici.':
    'An HR CI that does not contain 1 is consistent with a significant Wald test; the interval is multiplicative, so 0.5 and 2 are symmetric effects.',
  'I censurati restano a rischio finché sono osservati: Cox usa questa informazione, mentre scartarli o trattarli come eventi distorce le stime.':
    'Censored subjects stay at risk as long as they are observed: Cox uses this information, while discarding them or treating them as events distorts the estimates.',
  'La C di Harrell misura l’ordinamento dei tempi, non la calibrazione: un modello può ordinare bene e sbagliare le probabilità assolute.':
    'Harrell\'s C measures the ordering of the times, not calibration: a model can order well and still get the absolute probabilities wrong.',
  'La stima è al limite della regione ammissibile: una covariata predice quasi perfettamente chi ha l’evento. Il coefficiente e l’hazard ratio non vanno riportati come effetto; riduci le covariariate del modello, controlla se la variabile è una conseguenza dell’esito o usa un test esatto.':
    'The estimate sits at the edge of the admissible region: a covariate almost perfectly predicts who has the event. The coefficient and the hazard ratio should not be reported as an effect; reduce the covariates in the model, check whether the variable is a consequence of the outcome, or use an exact test.',
  'Il profilo di rischio cambia con {s1}: per ogni unità in più l’hazard ratio è {s2}. Riporta sempre l’IC e il numero di eventi, e verifica se l’effetto è stabile nei sottogruppi.':
    'The risk profile changes with {s1}: for each extra unit the hazard ratio is {s2}. Always report the CI and the number of events, and check whether the effect is stable across subgroups.',
  'Le covariariate non mostrano un’associazione affidabile con il tempo di evento. Con pochi eventi il modello ha poca potenza: l’assenza di significatività non dimostra l’assenza di effetto.':
    'The covariates show no reliable association with the event time. With few events the model has little power: absence of significance does not prove absence of effect.',
  'I tempi di evento uguali sono gestiti con l’approssimazione di Breslow, che con molti pareggi può sottostimare lievemente gli errori standard.':
    'Equal event times are handled with the Breslow approximation, which with many ties can slightly underestimate the standard errors.',
  'I rischi proporzionali sono un’assunzione del modello: il test riportato è asintotico e con pochi eventi ha poca potenza.':
    'Proportional hazards is an assumption of the model: the reported test is asymptotic and with few events has little power.',
  'La relazione tra covariata e log-rischio è assunta lineare: per effetti non lineari servono trasformazioni o spline.':
    'The relationship between covariate and log-risk is assumed linear: non-linear effects need transformations or splines.',
  'Non sono inclusi covariariate dipendenti dal tempo, effetti casuali, stratificazione o rischi competitivi.':
    'Time-dependent covariates, random effects, stratification and competing risks are not included.',
  'La sopravvivenza di base è valutata al profilo medio delle covariariate e può non corrispondere a un soggetto reale.':
    'The baseline survival is evaluated at the mean covariate profile and may not correspond to a real subject.',
  'non verificabile con questi dati':
    'not checkable with these data',
  'effetto che cambia nel tempo: l’ipotesi di rischi proporzionali è messa in discussione':
    'effect that changes over time: the proportional hazards assumption is called into question',
  'nessuna evidenza contro i rischi proporzionali':
    'no evidence against proportional hazards',
  'Sintesi del modello di Cox':
    'Cox model summary',
  '{s1} osservazioni · {s2} eventi · {s3} covariariate':
    '{s1} observations · {s2} events · {s3} covariates',
  'Voce':
    'Item',
  'Osservazioni':
    'Observations',
  'Eventi':
    'Events',
  'Censurati':
    'Censored',
  'Covariati':
    'Covariates',
  'Log-verosimiglianza nulla':
    'Null log-likelihood',
  'Iterazioni':
    'Iterations',
  'Convergenza':
    'Convergence',
  'Avviso {s1}':
    'Warning {s1}',
  'La verosimiglianza parziale di Cox non richiede di specificare la forma della funzione di rischio di base.':
    'Cox\'s partial likelihood does not require specifying the shape of the baseline risk function.',
  'Come regola pratica servono almeno 10 eventi per covariata: sotto questa soglia le stime sono instabili.':
    'As a rule of thumb at least 10 events per covariate are needed: below this threshold the estimates are unstable.',
  'La C di Harrell misura la capacità del modello di ordinare i tempi: 0,5 = caso, 1 = ordine perfetto.':
    'Harrell\'s C measures the model\'s ability to order the times: 0.5 = chance, 1 = perfect ordering.',
  'Test globali sul modello':
    'Global tests on the model',
  'ipotesi nulla: tutti i coefficienti uguali a zero':
    'null hypothesis: all coefficients equal to zero',
  'Rapporto di verosimiglianza':
    'Likelihood ratio',
  'il modello spiega i tempi meglio del nulla':
    'the model explains the times better than the null',
  'nessuna prova che le covariariate spieghino i tempi':
    'no evidence that the covariates explain the times',
  'almeno un coefficiente è diverso da zero':
    'at least one coefficient differs from zero',
  'nessun coefficiente distinguibile da zero':
    'no coefficient distinguishable from zero',
  'Score (log-rank generalizzato)':
    'Score (generalised log-rank)',
  'le covariariate sono associate al rischio già senza stima completa':
    'the covariates are associated with the risk even without a full estimate',
  'nessuna associazione iniziale rilevante':
    'no relevant initial association',
  'Con campioni grandi i tre test convergono; con pochi eventi il rapporto di verosimiglianza è il più affidabile.':
    'With large samples the three tests converge; with few events the likelihood ratio is the most reliable.',
  'Il test score valutato in β = 0 coincide, per una sola covariata dicotomica, con il log-rank.':
    'The score test evaluated at β = 0 coincides, for a single binary covariate, with the log-rank.',
  'Coefficienti e hazard ratio':
    'Coefficients and hazard ratios',
  'IC {s1}% · HR per un’unità di incremento della covariata':
    'CI {s1}% · HR per one-unit increase of the covariate',
  'Covariata':
    'Covariate',
  'Errore std.':
    'Std. error',
  'HR':
    'HR',
  'HR low':
    'HR low',
  'HR high':
    'HR high',
  'B è il logaritmo dell’hazard ratio: B > 0 indica rischio maggiore quando la covariata aumenta.':
    'B is the logarithm of the hazard ratio: B > 0 indicates higher risk as the covariate increases.',
  'HR = 1 significa nessun effetto; l’intervallo che contiene 1 è coerente con l’assenza di associazione.':
    'HR = 1 means no effect; an interval containing 1 is consistent with the absence of association.',
  'I p-value sono test di Wald e non tengono conto dell’incertezza sugli altri coefficienti.':
    'The p-values are Wald tests and do not account for uncertainty about the other coefficients.',
  'Verifica dei rischi proporzionali':
    'Proportional hazards check',
  'test di interazione con log(tempo)':
    'interaction test with log(time)',
  'χ²':
    'χ²',
  'Non calcolabile':
    'Not computable',
  'servono più eventi (o tempi tutti positivi) per stimare il modello con interazioni':
    'more events (or all-positive times) are needed to estimate the model with interactions',
  'Il test aggiunge un coefficiente per covariata × log(t): se quel coefficiente è diverso da zero l’effetto cambia con il tempo.':
    'The test adds a coefficient for covariate × log(t): if that coefficient differs from zero the effect changes with time.',
  'p grande è ciò che si vuole vedere: indica che l’ipotesi di rischio proporzionale regge.':
    'a large p is what you want to see: it indicates that the proportional hazards assumption holds.',
  'È un test asintotico e con pochi eventi ha poca potenza: l’assenza di significatività non prova i rischi proporzionali.':
    'It is an asymptotic test and with few events has little power: absence of significance does not prove proportional hazards.',
  'Rischio cumulato di base':
    'Baseline cumulative risk',
  'stimatore di Breslow · profilo medio delle covariariate':
    'Breslow estimator · mean covariate profile',
  'Tempo':
    'Time',
  'A rischio':
    'At risk',
  'H₀(t)':
    'H₀(t)',
  'S₀(t)':
    'S₀(t)',
  'H₀(t) è il rischio cumulato valutato al profilo medio delle covariariate: un profilo ipotetico ma stabile numericamente anche con età o punteggi lontani da zero.':
    'H₀(t) is the cumulative risk evaluated at the mean covariate profile: a hypothetical profile, but numerically stable even with ages or scores far from zero.',
  'Per un profilo x la sopravvivenza è S₀(t) elevato a exp((x − x̄)′B): la curva di base non va letta come la sopravvivenza media della coorte.':
    'For a profile x the survival is S₀(t) raised to exp((x − x̄)′B): the baseline curve should not be read as the average survival of the cohort.',
};
