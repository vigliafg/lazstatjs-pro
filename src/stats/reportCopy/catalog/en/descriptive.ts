/** English prose of the descriptive report and its tables. */
export const descriptiveCopy: Record<string, string> = {
  'n = {s1}':
    'n = {s1}',
  '{s1} mancanti':
    '{s1} missing',
  'media {s1} (CI {s2}% {s3})':
    'mean {s1} (CI {s2}% {s3})',
  'mediana {s1}':
    'median {s1}',
  'SD {s1}':
    'SD {s1}',
  'CV {s1}%':
    'CV {s1}%',
  '{s1} valori anomali ({s2}%)':
    '{s1} outliers ({s2}%)',
  'asimmetria non disponibile':
    'skewness not available',
  'asimmetria {s1}, praticamente simmetrica':
    'skewness {s1}, practically symmetric',
  'asimmetria {s1}, coda a destra':
    'skewness {s1}, right tail',
  'asimmetria {s1}, coda a sinistra':
    'skewness {s1}, left tail',
  'test di normalità non calcolabili con questo campione':
    'normality tests not computable with this sample',
  'normalità rifiutata (JB {s1}, Lilliefors {s2}, K² {s3})':
    'normality rejected (JB {s1}, Lilliefors {s2}, K² {s3})',
  'normalità non rifiutata (JB {s1}, Lilliefors {s2}, K² {s3})':
    'normality not rejected (JB {s1}, Lilliefors {s2}, K² {s3})',
  '{s1}: {s2}. Distribuzione: {s3}; {s4}.':
    '{s1}: {s2}. Distribution: {s3}; {s4}.',
  'Nessuna variabile numerica valida: non c’è nulla da riassumere.':
    'No valid numeric variable: there is nothing to summarise.',
  'Quadro regolare: {s1} {s2} (fino a {s3} osservazioni), distribuzioni compatibili con la gaussiana e nessun valore anomalo.':
    'Regular picture: {s1} {s2} (up to {s3} observations), distributions compatible with the Gaussian and no outliers.',
  'variabile analizzata':
    'variable analysed',
  'variabili analizzate':
    'variables analysed',
  'Da leggere con cautela: {s1} di {s2} {s3} dalla gaussiana e {s4} {s5} valori anomali oltre 1.5 IQR.':
    'To read with caution: {s1} of {s2} {s3} from the Gaussian and {s4} {s5} outliers beyond 1.5 IQR.',
  'variabile si discosta':
    'variable departs',
  'variabili si discostano':
    'variables depart',
  'Report di lettura — Statistiche descrittive':
    'Reading report — Descriptive statistics',
  'Dati insufficienti':
    'Insufficient data',
  'Dati regolari':
    'Regular data',
  'Da verificare':
    'To be checked',
  'Questa analisi non verifica ipotesi: fotografa ogni variabile per capire dove sta il centro dei dati, quanto sono dispersi e che forma ha la distribuzione.':
    'This analysis does not test hypotheses: it takes a snapshot of each variable to understand where the centre of the data lies, how dispersed it is and what shape the distribution has.',
  'Serve a scegliere i test successivi: se media e mediana coincidono e la forma è simmetrica i test parametrici sono adatti; in presenza di asimmetria o valori anomali conviene affiancarli a quelli non parametrici.':
    'It helps choose the next tests: if mean and median coincide and the shape is symmetric the parametric tests are suitable; with skewness or outliers they should be paired with non-parametric ones.',
  'Risultato variabile per variabile':
    'Result variable by variable',
  'Media e mediana: la media è il baricentro e risente degli estremi, la mediana è il valore centrale e resta stabile. Se differiscono molto, la distribuzione è asimmetrica.':
    'Mean and median: the mean is the centre of gravity and is affected by the extremes, the median is the central value and stays stable. If they differ a lot, the distribution is skewed.',
  'SD (deviazione standard) misura la dispersione nella stessa unità dei dati; il CV (SD/media) la rende confrontabile tra variabili con scale diverse. IQR e MAD sono alternative robuste agli outlier.':
    'SD (standard deviation) measures dispersion in the same unit as the data; the CV (SD/mean) makes it comparable between variables on different scales. IQR and MAD are robust alternatives to outliers.',
  'Valori anomali: sono le osservazioni oltre 1.5 × IQR dalle cerniere (regola di Tukey). Controlla se sono errori di inserimento o casi reali da mantenere.':
    'Outliers: these are observations beyond 1.5 × IQR from the hinges (Tukey\'s rule). Check whether they are entry errors or real cases to keep.',
  'Test di normalità: p ≥ {s1} significa dati compatibili con una gaussiana, p < {s2} la esclude. Con molti dati anche scostamenti irrilevanti diventano significativi: guarda anche istogramma e Q-Q.':
    'Normality tests: p ≥ {s1} means data compatible with a Gaussian, p < {s2} rules it out. With lots of data even irrelevant deviations become significant: also look at the histogram and the Q-Q plot.',
  'Cosa fare adesso':
    'What to do now',
  'Due gruppi indipendenti: t-test di Welch, oppure Mann–Whitney U se la normalità è rifiutata.':
    'Two independent groups: Welch t-test, or Mann–Whitney U if normality is rejected.',
  'Misure ripetute sulle stesse righe: t-test appaiato o Wilcoxon signed-rank.':
    'Repeated measures on the same rows: paired t-test or Wilcoxon signed-rank.',
  'Tre o più gruppi: ANOVA a una via con post-hoc, oppure Kruskal–Wallis.':
    'Three or more groups: one-way ANOVA with post-hoc, or Kruskal–Wallis.',
  'Relazione tra variabili: correlazione; per prevedere una variabile da altre, regressione lineare.':
    'Relationship between variables: correlation; to predict one variable from others, linear regression.',
  'Le descrittive non dimostrano relazioni causali né differenze tra gruppi: sono una fotografia del campione.':
    'Descriptives do not prove causal relationships or differences between groups: they are a snapshot of the sample.',
  'Le celle vuote o non numeriche vengono escluse variabile per variabile, quindi gli N possono differire tra colonne.':
    'Empty or non-numeric cells are excluded variable by variable, so the Ns can differ between columns.',
  'Con pochi dati i test di normalità hanno scarsa potenza; con molti dati sono iper-sensibili.':
    'With little data the normality tests have low power; with lots of data they are over-sensitive.',
  'Campione e misure di posizione':
    'Sample and measures of location',
  'Missing':
    'Missing',
  'Sum':
    'Sum',
  'Median CI low':
    'Median CI low',
  'Median CI high':
    'Median CI high',
  'Trimmed mean 5%':
    'Trimmed mean 5%',
  'Trimmed mean al 5%: media dopo aver rimosso il 5% delle osservazioni a ciascuna coda (0 se N < 20).':
    '5% trimmed mean: the mean after removing 5% of the observations from each tail (0 if N < 20).',
  'Dispersione e valori anomali':
    'Dispersion and outliers',
  'Variance':
    'Variance',
  'CV %':
    'CV %',
  'Q1':
    'Q1',
  'Q3':
    'Q3',
  'Range':
    'Range',
  'IQR':
    'IQR',
  'MAD':
    'MAD',
  'MAD scalata':
    'Scaled MAD',
  'Outlier 1.5 IQR':
    'Outlier 1.5 IQR',
  'Outlier %':
    'Outlier %',
  'Estremi 3 IQR':
    'Extremes 3 IQR',
  'Definizione di Tukey: outlier se < Q1 − 1.5·IQR o > Q3 + 1.5·IQR; estremi oltre 3·IQR.':
    'Tukey\'s definition: an outlier if < Q1 − 1.5·IQR or > Q3 + 1.5·IQR; extremes beyond 3·IQR.',
  'Q1/Q3 con il metodo Tukey hinges di jStat (lievemente diverso dal tipo 7 di R per N piccoli); lo stesso metodo è usato nei boxplot.':
    'Q1/Q3 with jStat\'s Tukey hinges method (slightly different from R\'s type 7 for small N); the same method is used in the boxplots.',
  'MAD scalata = 1.4826 · MAD, stimatore consistente della SD sotto normalità.':
    'Scaled MAD = 1.4826 · MAD, a consistent estimator of the SD under normality.',
  'Forma e test di normalità':
    'Shape and normality tests',
  'Skewness':
    'Skewness',
  'Excess kurtosis':
    'Excess kurtosis',
  'Jarque–Bera':
    'Jarque–Bera',
  'JB p':
    'JB p',
  'KS D':
    'KS D',
  'KS p (Lilliefors)':
    'KS p (Lilliefors)',
  'D\'Agostino K²':
    'D\'Agostino K²',
  'K² p':
    'K² p',
  'SE di skewness e kurtosi secondo le formule di Fisher; z = statistica / SE, p a due code normale.':
    'SE of skewness and kurtosis using Fisher\'s formulas; z = statistic / SE, two-sided normal p.',
  'KS con parametri stimati: p corretta con metodo Lilliefors (Monte Carlo, 1000 repliche, seed fisso). Il p grezzo di KS sarebbe anti-conservativo.':
    'KS with estimated parameters: p corrected with the Lilliefors method (Monte Carlo, 1000 replicates, fixed seed). The raw KS p would be anti-conservative.',
  'D\'Agostino–Pearson K² combina le trasformazioni normalizzanti di skewness e kurtosi; p da χ² con 2 df.':
    'D\'Agostino–Pearson K² combines the normalising transformations of skewness and kurtosis; p from χ² with 2 df.',
  'Quantili':
    'Quantiles',
  'P1':
    'P1',
  'P5':
    'P5',
  'P10':
    'P10',
  'P25':
    'P25',
  'P50':
    'P50',
  'P75':
    'P75',
  'P90':
    'P90',
  'P95':
    'P95',
  'P99':
    'P99',
  'Quantili interpolati (metodo jStat.percentile).':
    'Interpolated quantiles (jStat.percentile method).',
  'Frequenze':
    'Frequencies',
  'Value':
    'Value',
  'Count':
    'Count',
  'Percent':
    'Percent',
  'Cumulative count':
    'Cumulative count',
  'Cumulative %':
    'Cumulative %',
  'Chi-square':
    'Chi-square',
  'p-value':
    'p-value',
  'Low':
    'Low',
  'High':
    'High',
  'Outlier':
    'Outlier',
  'Regolare':
    'Regular',
  'Test per valori anomali':
    'Outlier tests',
  'Statistic':
    'Statistic',
  'Critical value':
    'Critical value',
  'Side':
    'Side',
  'Verdict':
    'Verdict',
  'Test delle sequenze':
    'Runs test',
  'Cut point':
    'Cut point',
  'Above cut':
    'Above cut',
  'Below cut':
    'Below cut',
  'Runs':
    'Runs',
  'Expected runs':
    'Expected runs',
  'Exact p':
    'Exact p',
  'Conteggi':
    'Counts',
  'Risultato per variabile':
    'Result by variable',
  'Percentuali calcolate sulle osservazioni non mancanti ({s1} su {s2}).':
    'Percentages are computed on the non-missing observations ({s1} of {s2}).',
  'Intervallo di Wilson al {s1}% per la proporzione di ogni modalità.':
    'Wilson {s1}% interval for the proportion of each level.',
  'Bontà di adattamento (quote uguali)':
    'Goodness of fit (equal shares)',
  'Confronta le frequenze osservate con quote uguali tra le modalità: un p piccolo indica modalità più rappresentate di altre.':
    'Compares the observed counts with equal shares across levels: a small p means some levels are more represented than others.',
  'Grubbs: test bilaterale sull’osservazione più lontana dalla media, con correzione per il numero di candidati.':
    'Grubbs: two-sided test on the observation farthest from the mean, corrected for the number of candidates.',
  'Dixon: rapporto fra le differenze adiacenti; definito solo per 3–30 osservazioni e più robusto agli estremi.':
    'Dixon: ratio of adjacent differences; defined only for 3–30 observations and more robust to extremes.',
  'Le osservazioni sono divise in due lati rispetto al punto di taglio (mediana per default); un numero di sequenze troppo basso indica clustering, troppo alto alternanza.':
    'Observations are split into two sides of the cut point (median by default); too few runs means clustering, too many means alternation.',
  'Il p asintotico usa l’approssimazione normale con correzione di continuità; il p esatto è disponibile fino a 50 osservazioni.':
    'The asymptotic p uses the normal approximation with continuity correction; the exact p is available up to 50 observations.',
  'Livello di confidenza: {s1}%.':
    'Confidence level: {s1}%.',
  '{s1} modalità su {s2} osservazioni non mancanti':
    '{s1} levels over {s2} non-missing observations',
  'la più frequente è “{s1}” con {s2} casi':
    'the most frequent is “{s1}” with {s2} cases',
  'le quote uguali sono rifiutate (χ² = {s1}, p = {s2})':
    'equal shares are rejected (χ² = {s1}, p = {s2})',
  'le quote uguali non sono rifiutate (χ² = {s1}, p = {s2})':
    'equal shares are not rejected (χ² = {s1}, p = {s2})',
  '{s1}: {s2}; {s3}{s4}.':
    '{s1}: {s2}; {s3}{s4}.',
  'Report di lettura — Frequenze':
    'Reading report — Frequencies',
  'La variabile {s1} ha {s2} modalità distinte.':
    'Variable {s1} has {s2} distinct levels.',
  'Frequenze di {s1} variabili, {s2} modalità in tutto.':
    'Frequencies of {s1} variables, {s2} levels in total.',
  'La tabella di frequenza conta quante volte compare ogni modalità e mostra la percentuale sul totale delle osservazioni valide.':
    'The frequency table counts how often each level appears and shows its percentage of the valid observations.',
  'L’intervallo di Wilson tiene conto della numerosità: con pochi casi è largo anche quando la percentuale sembra precisa.':
    'The Wilson interval accounts for sample size: with few cases it is wide even when the percentage looks precise.',
  'Il conteggio ignora le celle vuote; la percentuale è calcolata sul totale non mancante, non sul numero di righe.':
    'The count ignores empty cells; the percentage is computed on the non-missing total, not on the number of rows.',
  'Il test di bontà di adattamento confronta le modalità con quote uguali: serve a capire se una categoria domina, non a stimare la sua proporzione.':
    'The goodness-of-fit test compares levels with equal shares: it tells whether one category dominates, not what its proportion is.',
  'Con molte modalità il test χ² diventa fragile: raggruppa le categorie rare prima di leggerlo.':
    'With many levels the χ² test becomes fragile: group rare categories before reading it.',
  'Le frequenze descrivono il campione osservato: non dicono nulla sulla popolazione senza un modello o un disegno di campionamento.':
    'Frequencies describe the observed sample: they say nothing about the population without a model or a sampling design.',
  'Una variabile continua con molti valori distinti non va conteggiata: usa la sintesi descrittiva o crea classi.':
    'A continuous variable with many distinct values should not be tallied: use the descriptive summary or create classes.',
  'Le percentuali non sono indipendenti tra loro: sommano a 100 e un intervallo alla volta non corregge per i confronti multipli.':
    'Percentages are not independent: they add up to 100, and one interval at a time does not correct for multiple comparisons.',
  '{s1}: nessuno dei due test segnala valori anomali.':
    '{s1}: neither test flags an outlier.',
  '{s1}: Grubbs e Dixon segnalano entrambi un valore anomalo.':
    '{s1}: both Grubbs and Dixon flag an outlier.',
  '{s1}: Grubbs segnala un valore anomalo, Dixon no.':
    '{s1}: Grubbs flags an outlier, Dixon does not.',
  '{s1}: Dixon segnala un valore anomalo, Grubbs no.':
    '{s1}: Dixon flags an outlier, Grubbs does not.',
  'Grubbs G = {s1}, p = {s2}':
    'Grubbs G = {s1}, p = {s2}',
  'Dixon {s1} = {s2}, p = {s3}':
    'Dixon {s1} = {s2}, p = {s3}',
  'Dixon non applicabile (servono 3–30 osservazioni)':
    'Dixon not applicable (3–30 observations needed)',
  'Report di lettura — Valori anomali':
    'Reading report — Outliers',
  'Test dei valori anomali per {s1}.':
    'Outlier tests for {s1}.',
  'Test dei valori anomali per {s1} variabili: {s2} con almeno un segnale.':
    'Outlier tests for {s1} variables: {s2} with at least one signal.',
  'Grubbs e Dixon rispondono alla stessa domanda — l’osservazione più estrema è compatibile con le altre? — ma con assunzioni diverse.':
    'Grubbs and Dixon answer the same question — is the most extreme observation compatible with the others? — but with different assumptions.',
  'Un test significativo non prova che il dato sia un errore: dice che è improbabile estrarlo da una popolazione normale con la stessa media e dispersione.':
    'A significant test does not prove that the value is an error: it says that drawing it from a normal population with the same mean and spread is unlikely.',
  'Grubbs standardizza lo scarto dalla media con la deviazione standard: risente degli estremi e va usato con campioni non troppo piccoli.':
    'Grubbs standardises the deviation from the mean with the SD: it is sensitive to extremes and needs samples that are not too small.',
  'Dixon confronta differenze adiacenti ed è più robusto, ma è definito solo tra 3 e 30 osservazioni.':
    'Dixon compares adjacent differences and is more robust, but only defined for 3 to 30 observations.',
  'Il p-value è già corretto per il fatto che il candidato è il massimo scarto, non un’osservazione scelta a priori.':
    'The p-value already accounts for the candidate being the largest deviation, not an observation chosen in advance.',
  'Entrambi i test assumono una popolazione normale: con distribuzioni asimmetriche il p-value non è affidabile.':
    'Both tests assume a normal population: with skewed distributions the p-value is not reliable.',
  'Un outlier può essere un caso reale e importante: verifica la fonte prima di escluderlo.':
    'An outlier can be a real and important case: check the source before excluding it.',
  'Con molti valori estremi il test segnala solo il più lontano: ripetilo dopo aver rimosso il caso o usa una regola robusta come MAD.':
    'With many extreme values the test flags only the farthest: repeat it after removing that case or use a robust rule such as MAD.',
  'meno sequenze del previsto: le osservazioni tendono a raggrupparsi':
    'fewer runs than expected: observations tend to cluster',
  'più sequenze del previsto: le osservazioni tendono ad alternarsi':
    'more runs than expected: observations tend to alternate',
  '; p esatto {s1}':
    '; exact p {s1}',
  '{s1}: {s2} sequenze su {s3} osservazioni (attese {s4}); {s5} (p = {s6}{s7}).':
    '{s1}: {s2} runs over {s3} observations (expected {s4}); {s5} (p = {s6}{s7}).',
  'Report di lettura — Test delle sequenze':
    'Reading report — Runs test',
  'Sequenze di {s1} rispetto al punto di taglio {s2}.':
    'Runs of {s1} around the cut point {s2}.',
  'Test delle sequenze per {s1} variabili: {s2} con ordine non casuale.':
    'Runs test for {s1} variables: {s2} with non-random order.',
  'Il test delle sequenze controlla se l’ordine delle righe è casuale: conta quante volte il valore attraversa il punto di taglio.':
    'The runs test checks whether the row order is random: it counts how often the value crosses the cut point.',
  'Serve per dati raccolti in sequenza — tempo, ordine di produzione, righe di un foglio — dove una tendenza o un ciclo rompe l’indipendenza.':
    'It is meant for data collected in sequence — time, production order, spreadsheet rows — where a trend or a cycle breaks independence.',
  'Il punto di taglio predefinito è la mediana, così i due lati hanno all’incirca lo stesso numero di osservazioni.':
    'The default cut point is the median, so both sides hold roughly the same number of observations.',
  'Il z confronta le sequenze osservate con quelle attese sotto casualità; la correzione di continuità rende il test più prudente.':
    'The z compares the observed runs with those expected under randomness; the continuity correction makes the test more conservative.',
  'Il p esatto enumera tutte le disposizioni possibili: è il riferimento quando il campione è piccolo e l’approssimazione normale è dubbia.':
    'The exact p enumerates all possible arrangements: it is the reference when the sample is small and the normal approximation is doubtful.',
  'Il test rileva dipendenza dall’ordine, non la forma della dipendenza: un p piccolo non distingue tendenza, ciclo e cluster.':
    'The test detects dependence on order, not its shape: a small p does not distinguish trend, cycle and clustering.',
  'Le osservazioni con valore uguale al punto di taglio finiscono nel lato basso: con molti pareggi il test diventa conservativo.':
    'Observations equal to the cut point go to the lower side: with many ties the test becomes conservative.',
  'Il test assume che le osservazioni siano altrimenti identicamente distribuite: un cambiamento di livello a metà serie lo fa rifiutare anche senza vera dipendenza. Il livello usato è {s1}.':
    'The test assumes the observations are otherwise identically distributed: a level shift halfway through the series makes it reject even without true dependence. The level used is {s1}.',
};
