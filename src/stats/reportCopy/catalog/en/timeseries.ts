/** English prose of the timeseries report and its tables. */
export const timeseriesCopy: Record<string, string> = {
  'Deviazione standard':
    'Standard deviation',
  'Pendenza di Sen':
    'Sen slope',
  'Variazione totale':
    'Total change',
  'trend {s1}':
    '{s1} trend',
  'nessun trend monotono':
    'no monotonic trend',
  'c’è un {s1} (Mann–Kendall p = {s2})':
    'there is a {s1} (Mann–Kendall p = {s2})',
  'non c’è evidenza di un {s1} (Mann–Kendall p = {s2})':
    'there is no evidence of a {s1} (Mann–Kendall p = {s2})',
  'le autocorrelazioni sono congiuntamente significative (Ljung–Box p = {s1}): i valori dipendono dai precedenti':
    'the autocorrelations are jointly significant (Ljung–Box p = {s1}): the values depend on the previous ones',
  'le autocorrelazioni non sono congiuntamente significative (Ljung–Box p = {s1}): non emerge una struttura temporale forte':
    'the autocorrelations are not jointly significant (Ljung–Box p = {s1}): no strong temporal structure emerges',
  'batte il riferimento più semplice (RMSE {s1})':
    'it beats the simplest benchmark (RMSE {s1})',
  'non batte il riferimento più semplice (RMSE {s1}): la struttura aggiuntiva non ripaga':
    'it does not beat the simplest benchmark (RMSE {s1}): the extra structure does not pay off',
  'è sostanzialmente equivalente al riferimento più semplice (RMSE {s1})':
    'it is broadly equivalent to the simplest benchmark (RMSE {s1})',
  '{s1} = {s2} ({s3}): {s4}.':
    '{s1} = {s2} ({s3}): {s4}.',
  'termine significativo, aggiunge memoria al modello':
    'significant term, it adds memory to the model',
  'termine non significativo, il suo contributo non si distingue dal caso':
    'non-significant term, its contribution cannot be told apart from chance',
  'Test ADF sulla serie':
    'ADF test on the series',
  'Scelta della differenziazione':
    'Choice of differencing',
  'La differenziazione è impostata a mano, quindi l’ordine non dipende dai test{s1}.':
    'Differencing is set by hand, so the order does not depend on the tests{s1}.',
  ' (ADF p ≈ {s1} resta solo informativo)':
    '(ADF p ≈ {s1} remains informative only)',
  'Il test ADF sulla serie dà p ≈ {s1}: {s2}.':
    'The ADF test on the series gives p ≈ {s1}: {s2}.',
  'la radice unitaria non è rifiutata, quindi almeno una differenziazione serve':
    'the unit root is not rejected, so at least one difference is needed',
  'la stazionarietà non è rifiutata, quindi la serie non va differenziata':
    'stationarity is not rejected, so the series should not be differenced',
  'Il test ADF non è calcolabile su questa serie: la differenziazione va decisa a mano.':
    'The ADF test cannot be computed on this series: differencing must be decided by hand.',
  'Modello {s1}':
    '{s1} model',
  'La ricerca automatica sull\'ordine ha scelto {s1} (AICc = {s2}): {s3}.':
    'The automatic order search chose {s1} (AICc = {s2}): {s3}.',
  'il secondo classificato è a Δ AICc = {s1}, quindi i dati non distinguono nettamente i due ordini':
    'the runner-up is at Δ AICc = {s1}, so the data do not clearly separate the two orders',
  'il distacco dal secondo classificato è Δ AICc = {s1}, quindi la scelta è netta':
    'the gap from the runner-up is Δ AICc = {s1}, so the choice is clear-cut',
  'non ci sono altri ordini confrontabili':
    'there are no other comparable orders',
  'Differenziazione: {s1}; scelta {s2}. {s3}':
    'Differencing: {s1}; choice {s2}. {s3}',
  'Le radici AR e MA stanno fuori dal cerchio unitario: il modello è stazionario e invertibile, quindi le previsioni convergono invece di divergere.':
    'The AR and MA roots lie outside the unit circle: the model is stationary and invertible, so forecasts converge instead of diverging.',
  'Attenzione: almeno una radice è vicina o dentro il cerchio unitario, quindi la stima è al limite della regione ammissibile e le previsioni vanno lette con prudenza.':
    'Warning: at least one root is close to or inside the unit circle, so the estimate is at the edge of the admissible region and the forecasts should be read with caution.',
  'Nessun termine AR o MA significativo: il modello si riduce a una media (o a un drift) più rumore.':
    'No significant AR or MA term: the model reduces to a mean (or a drift) plus noise.',
  'Residui: Ljung–Box {s1} → {s2}.':
    'Residuals: Ljung–Box {s1} → {s2}.',
  'resta autocorrelazione non spiegata, l’ordine andrebbe rivisto':
    'unexplained autocorrelation remains, the order should be revisited',
  'nessuna autocorrelazione residua, il modello ha catturato la memoria della serie':
    'no residual autocorrelation, the model has captured the memory of the series',
  'Il test di autocorrelazione sui residui non è calcolabile.':
    'The autocorrelation test on the residuals cannot be computed.',
  'Validazione fuori campione: RMSE = {s1}, MAE = {s2}; il modello {s3}.':
    'Out-of-sample validation: RMSE = {s1}, MAE = {s2}; the model {s3}.',
  'Serie troppo corta per una validazione fuori campione: l’errore disponibile è quello di adattamento.':
    'Series too short for an out-of-sample validation: the available error is the in-sample one.',
  'Errore standard residuo sulla scala modellata: {s1} su {s2} osservazioni efficaci.':
    'Residual standard error on the modelled scale: {s1} on {s2} effective observations.',
  'Errore standard residuo':
    'Residual standard error',
  'Osservazioni efficaci':
    'Effective observations',
  'Il modello {s1} porta la previsione da {s2} al passo {s3} a {s4} al passo {s5}, su {s6} passi.':
    'Model {s1} takes the forecast from {s2} at step {s3} to {s4} at step {s5}, over {s6} steps.',
  'Intervallo al {s1}%: {s2} – {s3} al primo passo e {s4} – {s5} all’ultimo; l’ampiezza passa da {s6} a {s7}, come ci si aspetta quando l’orizzonte cresce.':
    'Interval at {s1}%: {s2} – {s3} at the first step and {s4} – {s5} at the last; the width goes from {s6} to {s7}, as expected when the horizon grows.',
  'In validazione sugli ultimi {s1} valori l’RMSE è {s2} e il modello {s3}.':
    'In validation on the last {s1} values the RMSE is {s2} and the model {s3}.',
  'Le previsioni non hanno una validazione fuori campione: l’errore in campione è ottimista perché i parametri sono stati stimati sugli stessi dati.':
    'The forecasts have no out-of-sample validation: the in-sample error is optimistic because the parameters were estimated on the same data.',
  'Gli intervalli includono l’accumulo di incertezza dovuto alla differenziazione, ma non l’incertezza sulla stima dei parametri né quella sulla scelta dell’ordine.':
    'The intervals include the accumulation of uncertainty due to differencing, but not the uncertainty in the parameter estimates nor in the choice of the order.',
  'Il modello migliore in validazione è {s1} (RMSE = {s2}, MAE = {s3}): qualità {s4} rispetto alla variabilità della serie.':
    'The best model in validation is {s1} (RMSE = {s2}, MAE = {s3}): {s4} quality relative to the variability of the series.',
  'Le prossime {s1} previsioni partono da {s2} e arrivano a {s3}.':
    'The next {s1} forecasts start at {s2} and reach {s3}.',
  'Sono previsioni puntuali: l’intervallo di incertezza crescerebbe con l’orizzonte e non è incluso.':
    'These are point forecasts: the uncertainty interval would grow with the horizon and is not included.',
  'La serie è troppo corta per confrontare modelli di previsione.':
    'The series is too short to compare forecasting models.',
  'Serie di {s1} osservazioni: {s2}.':
    'Series of {s1} observations: {s2}.',
  'Serie storica':
    'Time series',
  'L’analisi descrittiva di una serie storica verifica se i valori sono indipendenti dal tempo: trend, autocorrelazione e stagionalità sono le tre strutture che rendono una serie diversa da un campione casuale.':
    'The descriptive analysis of a time series checks whether the values are independent of time: trend, autocorrelation and seasonality are the three structures that make a series different from a random sample.',
  'Qui {s1}, e {s2}.':
    'Here {s1}, and {s2}.',
  'Su questa base viene stimato un modello ARIMA/SARIMA: memoria e stagionalità stimate servono a costruire previsioni con intervalli, non solo a descrivere la serie.':
    'On this basis an ARIMA/SARIMA model is estimated: the estimated memory and seasonality serve to build forecasts with intervals, not just to describe the series.',
  'La serie non permette di stimare un modello ARIMA: le previsioni restano quelle dei modelli semplici.':
    'The series does not allow an ARIMA model to be estimated: the forecasts remain those of the simple models.',
  'Trend e casualità':
    'Trend and randomness',
  'Pendenza di Sen = {s1} per passo: {s2} mediana, robusta agli outlier.':
    'Sen slope = {s1} per step: {s2} median, robust to outliers.',
  'Variazione dal primo all’ultimo valore: {s1} ({s2}).':
    'Change from the first to the last value: {s1} ({s2}).',
  'circa {s1} deviazioni standard':
    'about {s1} standard deviations',
  'scala non calcolabile':
    'scale not computable',
  'Test dei runs: p = {s1}{s2}.':
    'Runs test: p = {s1}{s2}.',
  ', la successione non è casuale':
    ', the sequence is not random',
  ', compatibile con una successione casuale':
    ', compatible with a random sequence',
  'L’ACF misura quanto un valore è correlato con quelli precedenti. Se le barre restano dentro la banda ±1,96/√N, la serie non mostra memoria temporale; se escono, il passato contiene informazione sul presente.':
    'The ACF measures how much a value is correlated with the previous ones. If the bars stay within the ±1.96/√N band, the series shows no temporal memory; if they go outside, the past contains information about the present.',
  'Ljung–Box: Q = {s1} con p = {s2}. {s3}.':
    'Ljung–Box: Q = {s1} with p = {s2}. {s3}.',
  'Stagionalità non richiesta':
    'Seasonality not requested',
  'La forza della stagionalità è {s1}: {s2}':
    'The strength of seasonality is {s1}: {s2}',
  'Forza della stagionalità':
    'Strength of seasonality',
  'la componente stagionale domina la variabilità attorno al trend.':
    'the seasonal component dominates the variability around the trend.',
  'la componente stagionale è presente ma non domina la variabilità attorno al trend.':
    'the seasonal component is present but does not dominate the variability around the trend.',
  'Gli indici per posizione nel ciclo dicono quali periodi stanno sopra o sotto la tendenza: sono scostamenti medi, non valori assoluti.':
    'The indices by position in the cycle say which periods are above or below the trend: they are average deviations, not absolute values.',
  'Imposta un periodo stagionale (per esempio 12 per dati mensili, 4 per trimestrali) per stimare gli indici e scomporre la serie.':
    'Set a seasonal period (for example 12 for monthly data, 4 for quarterly) to estimate the indices and decompose the series.',
  'La stima ARIMA è condizionale (somma dei quadrati dei residui) e non a massima verosimiglianza esatta: con serie molto corte i primi residui pesano di più.':
    'The ARIMA estimate is conditional (sum of squared residuals) and not exact maximum likelihood: with very short series the first residuals weigh more.',
  'Non è stato possibile stimare un modello ARIMA su questa serie: le previsioni mostrate sono quelle dei modelli semplici.':
    'An ARIMA model could not be estimated on this series: the forecasts shown are those of the simple models.',
  'La ricerca degli ordini è limitata a p e q ≤ 2 (≤ 1 con meno di 30 osservazioni) e a un termine stagionale AR e MA: ordini maggiori non vengono esplorati.':
    'The order search is limited to p and q ≤ 2 (≤ 1 with fewer than 30 observations) and to one seasonal AR and MA term: higher orders are not explored.',
  'Gli intervalli di previsione non includono l’incertezza sulla stima dei parametri né sulla scelta dell’ordine; volatilità condizionale (GARCH) e regressori esterni non sono modellati.':
    'The forecast intervals do not include the uncertainty in the parameter estimates nor in the choice of the order; conditional volatility (GARCH) and external regressors are not modelled.',
  'La scomposizione è additiva; con ampiezza stagionale proporzionale al livello serve un modello moltiplicativo.':
    'The decomposition is additive; with seasonal amplitude proportional to the level a multiplicative model is needed.',
  'Trend, stagionalità e previsioni assumono che il futuro continui il pattern osservato: cambi di regime non sono previsti.':
    'Trend, seasonality and forecasts assume that the future continues the observed pattern: regime changes are not anticipated.',
  'Il MAPE non è definito quando la serie contiene zeri.':
    'The MAPE is not defined when the series contains zeros.',
  'Sintesi della serie':
    'Series summary',
  'N = {s1}{s2}':
    'N = {s1}{s2}',
  ' · periodo stagionale = {s1}':
    '· seasonal period = {s1}',
  'Minimo':
    'Minimum',
  'Massimo':
    'Maximum',
  'Primo valore':
    'First value',
  'Ultimo valore':
    'Last value',
  'La pendenza di Sen è la mediana delle pendenze tra tutte le coppie di punti: è robusta agli outlier.':
    'The Sen slope is the median of the slopes between all pairs of points: it is robust to outliers.',
  'Autocorrelazione e autocorrelazione parziale':
    'Autocorrelation and partial autocorrelation',
  'banda di confidenza ±1,96/√N = ±{s1}':
    'confidence band ±1.96/√N = ±{s1}',
  'Lag':
    'Lag',
  'ACF':
    'ACF',
  'PACF':
    'PACF',
  'Limite basso':
    'Lower limit',
  'Limite alto':
    'Upper limit',
  'Barre oltre la banda indicano autocorrelazione non spiegata dal caso.':
    'Bars beyond the band indicate autocorrelation not explained by chance.',
  'La PACF isola la correlazione al lag k al netto dei lag intermedi: un taglio netto dopo il lag 1 suggerisce un processo AR(1).':
    'The PACF isolates the correlation at lag k net of the intermediate lags: a sharp cut after lag 1 suggests an AR(1) process.',
  'trend crescente':
    'increasing trend',
  'trend decrescente':
    'decreasing trend',
  'Test di casualità e trend':
    'Tests of randomness and trend',
  'Mann–Kendall (trend)':
    'Mann–Kendall (trend)',
  'Wald–Wolfowitz (runs)':
    'Wald–Wolfowitz (runs)',
  'serie non casuale':
    'non-random series',
  'compatibile con il caso':
    'compatible with chance',
  'Ljung–Box (lag 1–{s1})':
    'Ljung–Box (lag 1–{s1})',
  'autocorrelazione presente':
    'autocorrelation present',
  'nessuna autocorrelazione rilevante':
    'no relevant autocorrelation',
  'Mann–Kendall è non parametrico e resistente agli outlier: p piccolo indica una tendenza monotona.':
    'Mann–Kendall is non-parametric and resistant to outliers: a small p indicates a monotonic tendency.',
  'Il test dei runs verifica che l’ordine dei valori sia casuale, non la loro distribuzione.':
    'The runs test checks that the order of the values is random, not their distribution.',
  'Ljung–Box verifica se le prime autocorrelazioni sono congiuntamente nulle.':
    'Ljung–Box checks whether the first autocorrelations are jointly zero.',
  'Indici stagionali':
    'Seasonal indices',
  'modello additivo · periodo {s1}':
    'additive model · period {s1}',
  'Posizione nel ciclo':
    'Position in the cycle',
  'Indice':
    'Index',
  'Gli indici sono scostamenti medi dal trend, centrati su zero: valori positivi indicano periodi sopra la tendenza.':
    'The indices are average deviations from the trend, centred on zero: positive values indicate periods above the trend.',
  'Forza della stagionalità = {s1} (0 = nessuna, 1 = stagionalità dominante).':
    'Strength of seasonality = {s1} (0 = none, 1 = dominant seasonality).',
  'Scomposizione':
    'Decomposition',
  'serie = trend + stagionalità + residuo':
    'series = trend + seasonality + residual',
  'Serie':
    'Series',
  'Trend':
    'Trend',
  'Stagionalità':
    'Seasonality',
  'Residuo':
    'Residual',
  'Le prime e le ultime osservazioni non hanno trend stimato: la media mobile centrata non è definita ai bordi.':
    'The first and last observations have no estimated trend: the centred moving average is not defined at the edges.',
  'Confronto dei modelli di previsione':
    'Comparison of forecasting models',
  'errore su un campione di validazione (ultimo 20% della serie)':
    'error on a validation sample (last 20% of the series)',
  'Modello':
    'Model',
  'MAE':
    'MAE',
  'MAPE %':
    'MAPE %',
  'RMSE e MAE sono nella stessa unità della serie; il MAPE è percentuale e non è definito se la serie contiene zeri.':
    'RMSE and MAE are in the same unit as the series; the MAPE is a percentage and is not defined if the series contains zeros.',
  'Questi modelli servono da riferimento: il migliore viene confrontato con l’ARIMA, che è il modello usato per le previsioni con intervalli.':
    'These models serve as benchmarks: the best one is compared with ARIMA, which is the model used for forecasts with intervals.',
  'Previsioni ({s1})':
    'Forecasts ({s1})',
  'orizzonte {s1} passi':
    'horizon {s1} steps',
  'Passo':
    'Step',
  'Previsione':
    'Forecast',
  'Le previsioni sono puntuali: non incorporano l’incertezza del modello né quella dei dati.':
    'The forecasts are point forecasts: they incorporate neither the uncertainty of the model nor that of the data.',
  'Con orizzonti lunghi l’errore cresce: oltre un ciclo stagionale le previsioni vanno lette come indicazione di direzione.':
    'With long horizons the error grows: beyond one seasonal cycle the forecasts should be read as an indication of direction.',
  'molto buona':
    'very good',
  'scarsa (peggio della media)':
    'poor (worse than the mean)',
};
