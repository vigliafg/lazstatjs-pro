/** English prose of the distfit report and its tables. */
export const distfitCopy: Record<string, string> = {
  'praticamente equivalente':
    'practically equivalent',
  'moderatamente migliore':
    'moderately better',
  'chiaramente migliore':
    'clearly better',
  'Nessuna distribuzione stimabile con questi dati.':
    'No distribution can be estimated with these data.',
  'Fit non disponibile':
    'Fit not available',
  'Servono almeno tre valori e, per le distribuzioni a supporto positivo, tutti i valori maggiori di zero.':
    'At least three values are needed and, for distributions with positive support, all values above zero.',
  'La distribuzione che descrive meglio i dati è la {s1} (AIC = {s2}).':
    'The distribution that describes the data best is {s1} (AIC = {s2}).',
  'Distribuzione stimata':
    'Estimated distribution',
  'Il fitting cerca la distribuzione teorica che rende più plausibile il campione osservato, e serve per descrivere la variabile, stimare percentili e alimentare carte di controllo o analisi di affidabilità.':
    'Fitting looks for the theoretical distribution that makes the observed sample most plausible, and is used to describe the variable, estimate percentiles and feed control charts or reliability analysis.',
  'La scelta qui è guidata dall’AIC, che premia l’adattamento e penalizza i parametri in più. La {s1} ha AIC = {s2}{s3}.':
    'The choice here is guided by AIC, which rewards fit and penalises extra parameters. {s1} has AIC = {s2}{s3}.',
  ', {s1} della seconda ({s2}, ΔAIC = {s3})':
    ', {s1} of the second ({s2}, ΔAIC = {s3})',
  'I parametri stimati':
    'The estimated parameters',
  'Parametri: {s1}. Sono stime di massima verosimiglianza, non medie campionarie.':
    'Parameters: {s1}. They are maximum likelihood estimates, not sample means.',
  'Log-verosimiglianza = {s1}: valore assoluto poco interpretabile, utile solo per confrontare modelli.':
    'Log-likelihood = {s1}: little interpretable in absolute terms, useful only to compare models.',
  'KS D = {s1} (p indicativo {s2}): {s3}.':
    'KS D = {s1} (indicative p {s2}): {s3}.',
  'la distribuzione non è un buon adattamento ai dati':
    'the distribution is not a good fit to the data',
  'non c’è evidenza contraria all’adattamento':
    'there is no evidence against the fit',
  'La bontà di adattamento non è calcolabile.':
    'Goodness of fit cannot be computed.',
  'Cosa ci fai con questa distribuzione':
    'What you can do with this distribution',
  'Mediana stimata: {s1}.':
    'Estimated median: {s1}.',
  '95° percentile stimato: {s1} (il 5% delle osservazioni dovrebbe superarlo).':
    'Estimated 95th percentile: {s1} (5% of the observations should exceed it).',
  'Puoi usarla per definire limiti di specifica, stimare la probabilità di superare una soglia o generare dati simulati coerenti.':
    'You can use it to set specification limits, estimate the probability of exceeding a threshold or generate consistent simulated data.',
  'Come leggere il confronto':
    'How to read the comparison',
  'L’AIC non dice che la distribuzione scelta sia “vera”: dice che è la meno peggiore tra quelle provate. Se le prime due sono a meno di 2 punti, i dati non distinguono tra loro e la scelta va fatta con criteri esterni (supporto, comportamento delle code, semplicità).':
    'AIC does not say the chosen distribution is “true”: it says it is the least bad among those tried. If the top two are within 2 points, the data do not distinguish between them and the choice must be made with external criteria (support, tail behaviour, simplicity).',
  'Assunzioni e cautele':
    'Assumptions and cautions',
  'Le osservazioni devono essere indipendenti e provenire dalla stessa popolazione.':
    'The observations must be independent and come from the same population.',
  'Le distribuzioni a supporto positivo (lognormale, esponenziale, gamma, Weibull) richiedono valori > 0; i valori nulli o negativi le escludono.':
    'Distributions with positive support (lognormal, exponential, gamma, Weibull) require values > 0; zero or negative values rule them out.',
  'Con N piccolo le stime delle code sono instabili: i percentili estremi vanno riportati con prudenza.':
    'With small N the tail estimates are unstable: extreme percentiles should be reported with caution.',
  'Un buon AIC non compensa un disegno di campionamento distorto.':
    'A good AIC does not make up for a biased sampling design.',
  'Il p-value del test KS è calcolato con la formula asintotica e non corregge per i parametri stimati: è indicativo, non definitivo.':
    'The KS test p-value is computed with the asymptotic formula and does not correct for the estimated parameters: it is indicative, not definitive.',
  'Non sono inclusi modelli con dati censurati (Weibull su dati di sopravvivenza troncati).':
    'Models with censored data are not included (Weibull on truncated survival data).',
  'Il livello di confidenza scelto ({s1}%) non si applica ai percentili stimati da una distribuzione fittata.':
    'The chosen confidence level ({s1}%) does not apply to percentiles estimated from a fitted distribution.',
  '{s1} = {s2}':
    '{s1} = {s2}',
  'Distribuzioni stimate':
    'Estimated distributions',
  'ordinamento per AIC · N = {s1}':
    'ordered by AIC · N = {s1}',
  'Distribuzione':
    'Distribution',
  'Parametri (MLE)':
    'Parameters (MLE)',
  'Parametri':
    'Parameters',
  'Le stime sono di massima verosimiglianza (MLE): scelgono i parametri che rendono i dati osservati più probabili.':
    'The estimates are maximum likelihood (MLE): they choose the parameters that make the observed data most likely.',
  'AIC = 2k − 2·logL: più basso è, meglio la distribuzione spiega i dati tenendo conto del numero di parametri.':
    'AIC = 2k − 2·logL: the lower it is, the better the distribution explains the data, allowing for the number of parameters.',
  'Confronta solo le righe con la stessa AIC (stesso dataset): le differenze sotto 2 sono trascurabili, sopra 10 sono nette.':
    'Compare only rows with the same AIC (same dataset): differences below 2 are negligible, above 10 are clear-cut.',
  'Bontà di adattamento':
    'Goodness of fit',
  'KS = Kolmogorov–Smirnov · AD = Anderson–Darling':
    'KS = Kolmogorov–Smirnov · AD = Anderson–Darling',
  'p KS (indicativo)':
    'KS p (indicative)',
  'AD A²':
    'AD A²',
  'Il p del KS è asintotico e non corretto per i parametri stimati: tende a essere ottimistico, usalo come indicazione.':
    'The KS p is asymptotic and not corrected for the estimated parameters: it tends to be optimistic, use it as an indication.',
  'KS misura la distanza massima tra la cumulata empirica e quella teorica; AD dà più peso alle code.':
    'KS measures the maximum distance between the empirical and theoretical cumulative curves; AD gives more weight to the tails.',
  'Percentili della distribuzione migliore ({s1})':
    'Percentiles of the best distribution ({s1})',
  'CI {s1}% non applicabile ai percentili stimati':
    'CI {s1}% not applicable to the estimated percentiles',
  'Percentile':
    'Percentile',
  'Valore stimato':
    'Estimated value',
  'P{s1}':
    'P{s1}',
  'I percentili sono quelli della distribuzione stimata, non i percentili osservati.':
    'The percentiles are those of the estimated distribution, not the observed percentiles.',
  'Con N piccolo le code sono le più incerte: evita di leggere P1 o P99 come limiti affidabili.':
    'With small N the tails are the most uncertain: avoid reading P1 or P99 as reliable limits.',
};
