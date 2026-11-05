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
  'A differenza di un test sulla media, non richiede la normalità: descrive tutta la distribuzione, non solo il centro.':
    'Unlike a test on the mean, it does not require normality: it describes the whole distribution, not just the centre.',
  'Asymptotic':
    'Asymptotic',
  'Con molti valori uguali il p è approssimato: i ranghi con ties riducono la precisione.':
    'With many tied values p is approximate: tied ranks reduce precision.',
  'D':
    'D',
  'D = {s1}: la massima distanza verticale tra le due distribuzioni cumulative.':
    'D = {s1}: the maximum vertical distance between the two cumulative distributions.',
  'D = {s1}; p = {s2} ({s3}).':
    'D = {s1}; p = {s2} ({s3}).',
  'D è la distanza verticale massima tra le due curve: 0 significa distribuzioni identiche, 1 nessuna sovrapposizione.':
    'D is the maximum vertical distance between the two curves: 0 means identical distributions, 1 no overlap.',
  'Distanza massima tra {s1} e {s2} per {s3}: {s4} (p = {s5}).':
    'Maximum distance between {s1} and {s2} for {s3}: {s4} (p = {s5}).',
  'Exact':
    'Exact',
  'Group':
    'Group',
  'I due campioni devono essere indipendenti.':
    'The two samples must be independent.',
  'Il p esatto enumera i ranghi possibili; con campioni grandi si usa l’approssimazione di Kolmogorov.':
    'The exact p enumerates the possible ranks; with large samples the Kolmogorov approximation is used.',
  'Il p è {s1}.':
    'p is {s1}.',
  'Il test bilaterale confronta le due distribuzioni cumulative: un p piccolo indica che non provengono dalla stessa popolazione.':
    'The two-sided test compares the two cumulative distributions: a small p means they do not come from the same population.',
  'Il test di Kolmogorov–Smirnov confronta le due distribuzioni cumulative: è sensibile a differenze di posizione, dispersione e forma.':
    'The Kolmogorov–Smirnov test compares the two cumulative distributions: it is sensitive to differences in location, spread and shape.',
  'Il test è bilaterale: rifiuta sia uno spostamento sia una differenza di forma.':
    'The test is two-sided: it rejects both a shift and a difference in shape.',
  'Kolmogorov–Smirnov (due campioni)':
    'Kolmogorov–Smirnov (two samples)',
  'Method':
    'Method',
  'Report di lettura — Kolmogorov–Smirnov':
    'Reading report — Kolmogorov–Smirnov',
  'Statistica e p-value':
    'Statistic and p-value',
  'Un p piccolo non dice quale aspetto differisca: guarda le due curve cumulative.':
    'A small p does not say which aspect differs: look at the two cumulative curves.',
  'asintotico':
    'asymptotic',
  'asintotico (serie di Kolmogorov)':
    'asymptotic (Kolmogorov series)',
  'esatto':
    'exact',
  'esatto (enumerazione dei ranghi)':
    'exact (rank enumeration)',
  '{s1}: {s2} osservazioni; {s3}: {s4} osservazioni.':
    '{s1}: {s2} observations; {s3}: {s4} observations.',
  'Cramér–von Mises W²': 'Cramér–von Mises W²',
  'CvM è una distanza quadratica media tra le due cumulate: meno sensibile al singolo punto peggiore rispetto a KS, più stabile con N piccolo.': 'CvM is a mean squared distance between the two cumulative curves: less sensitive to the single worst point than KS and steadier with small N.',
  'CvM (Cramér–von Mises) è la distanza quadratica media tra le due cumulate: rispetto a KS pesa tutti gli scostamenti e non solo il peggiore, quindi è più stabile con pochi dati.': 'CvM (Cramér–von Mises) is the mean squared distance between the two cumulative curves: unlike KS it weighs every deviation, not only the worst one, so it is steadier with few data.',
};
