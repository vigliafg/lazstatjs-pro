/** English prose of the resampling report and its tables. */
export const resamplingCopy: Record<string, string> = {
  'Report di resampling':
    'Resampling report',
  'Differenza {s1} = {s2}; permutazione p = {s3}.':
    'Difference {s1} = {s2}; permutation p = {s3}.',
  'delle medie':
    'of the means',
  'delle mediane':
    'of the medians',
  'Differenza oltre il caso':
    'Difference beyond chance',
  'Differenza compatibile con il caso':
    'Difference compatible with chance',
  'Gruppi: {s1} (N = {s2}) e {s3} (N = {s4}).':
    'Groups: {s1} (N = {s2}) and {s3} (N = {s4}).',
  'CI bootstrap {s1}%: {s2} – {s3}.':
    'Bootstrap CI {s1}%: {s2} – {s3}.',
  'La permutazione rimescola le etichette di gruppo: se la differenza osservata è rara sotto rimescolamento, l’associazione con il gruppo è difficile da spiegare con il caso.':
    'Permutation reshuffles the group labels: if the observed difference is rare under reshuffling, the association with the group is hard to explain by chance.',
  'Il CI bootstrap non contiene lo zero: la direzione della differenza è coerente, ma il p e il CI rispondono a domande leggermente diverse.':
    'The bootstrap CI does not contain zero: the direction of the difference is consistent, but the p and the CI answer slightly different questions.',
  'Il CI bootstrap contiene lo zero: la differenza osservata è compatibile con il caso.':
    'The bootstrap CI contains zero: the observed difference is compatible with chance.',
  'Permutazione e bootstrap assumono scambiabilità tra gruppi e osservazioni indipendenti.':
    'Permutation and bootstrap assume exchangeability between groups and independent observations.',
  'Con gruppi molto piccoli il p minimo raggiungibile è limitato dal numero di permutazioni.':
    'With very small groups the minimum reachable p is limited by the number of permutations.',
  'Statistiche per gruppo':
    'Statistics by group',
  'Differenza di medie':
    'Difference of means',
  'Differenza di mediane':
    'Difference of medians',
  'Differenza osservata ({s1} − {s2}): {s3}.':
    'Observed difference ({s1} − {s2}): {s3}.',
  'Inferenza di resampling':
    'Resampling inference',
  '{s1} permutazioni · {s2} bootstrap · CI {s3}%':
    '{s1} permutations · {s2} bootstrap · CI {s3}%',
  'Differenza osservata':
    'Observed difference',
  'p permutation (due code)':
    'permutation p (two-sided)',
  'CI bootstrap low':
    'bootstrap CI low',
  'CI bootstrap high':
    'bootstrap CI high',
  'CI BCa low':
    'BCa CI low',
  'CI BCa high':
    'BCa CI high',
  'Il p di permutazione non assume normalità: confronta la differenza osservata con la distribuzione sotto etichette casuali.':
    'The permutation p does not assume normality: it compares the observed difference with the distribution under random labels.',
  'Il CI bootstrap percentile ricampiona dentro ciascun gruppo; con pochi casi può essere instabile.':
    'The percentile bootstrap CI resamples within each group; with few cases it can be unstable.',
  'Il CI BCa corregge bias e asimmetria della distribuzione bootstrap ed è preferibile quando la distribuzione è sbilanciata.':
    'The BCa CI corrects bootstrap bias and skewness and is preferable when the distribution is unbalanced.',
};
