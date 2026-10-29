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
};
