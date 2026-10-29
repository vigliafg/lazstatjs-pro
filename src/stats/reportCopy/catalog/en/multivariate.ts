/** English prose of the multivariate report and its tables. */
export const multivariateCopy: Record<string, string> = {
  '{s1} (PC{s2}: {s3})':
    '{s1} (PC{s2}: {s3})',
  'I {s1} componenti ritenuti spiegano il {s2} della varianza totale.':
    'The {s1} retained components explain {s2} of the total variance.',
  'Struttura leggibile':
    'Readable structure',
  'Campione debole':
    'Weak sample',
  'La PCA riduce un insieme di variabili correlate a pochi componenti non correlati, ordinati per varianza spiegata.':
    'PCA reduces a set of correlated variables to a few uncorrelated components, ordered by explained variance.',
  'Analisi su {s1} variabili e {s2} casi completi{s3}.':
    'Analysis on {s1} variables and {s2} complete cases{s3}.',
  ', matrice di correlazione (variabili standardizzate)':
    ', correlation matrix (standardised variables)',
  ', matrice di covarianza (unità originali)':
    ', covariance matrix (original units)',
  'Il primo componente spiega il {s1}; i primi {s2} arrivano al {s3}.':
    'The first component explains {s1}; the first {s2} reach {s3}.',
  'Le saturazioni più alte sono: {s1}.':
    'The highest loadings are: {s1}.',
  'Nessuna variabile raggiunge |saturazione| ≥ 0.40 sui componenti ritenuti: la struttura è debole o il numero di componenti è insufficiente.':
    'No variable reaches |loading| ≥ 0.40 on the retained components: the structure is weak or the number of components is insufficient.',
  'Comunalità medie: {s1} (quota di varianza di ogni variabile ripresa dai componenti ritenuti).':
    'Mean communalities: {s1} (share of each variable\'s variance captured by the retained components).',
  'Adeguatezza del campione':
    'Sample adequacy',
  'KMO = {s1} ({s2}): {s3}':
    'KMO = {s1} ({s2}): {s3}',
  'la matrice è adatta alla riduzione dimensionale.':
    'the matrix is suitable for dimension reduction.',
  'la correlazione parziale è alta rispetto a quella semplice: i componenti possono essere instabili.':
    'the partial correlation is high relative to the simple one: the components can be unstable.',
  'Bartlett χ²({s1}) = {s2}, p = {s3}: {s4}':
    'Bartlett χ²({s1}) = {s2}, p = {s3}: {s4}',
  'la matrice di correlazione non è sferica, quindi esiste struttura da estrarre.':
    'the correlation matrix is not spherical, so there is structure to extract.',
  'non si rifiuta la sfericità: la PCA potrebbe non aggiungere molto rispetto alle variabili originali.':
    'sphericity is not rejected: PCA may not add much over the original variables.',
  'La PCA descrive la varianza, non un modello causale: i componenti sono combinazioni lineari, non variabili latenti validate.':
    'PCA describes variance, not a causal model: the components are linear combinations, not validated latent variables.',
  'Non è applicata alcuna rotazione: i componenti sono quelli della soluzione ortogonale iniziale.':
    'No rotation is applied: the components are those of the initial orthogonal solution.',
  'Campioni piccoli e outlier possono cambiare le saturazioni; controlla il rapporto casi/variabili (almeno 5–10 casi per variabile).':
    'Small samples and outliers can change the loadings; check the cases/variables ratio (at least 5–10 cases per variable).',
  'Variabili su scale molto diverse richiedono la matrice di correlazione; con unità omogenee la covarianza conserva le differenze di scala.':
    'Variables on very different scales need the correlation matrix; with homogeneous units the covariance preserves the scale differences.',
  'La PCA non gestisce valori mancanti: i casi incompleti sono esclusi.':
    'PCA does not handle missing values: incomplete cases are excluded.',
  'KMO e Bartlett richiedono la matrice di correlazione; con la covarianza non sono riportati.':
    'KMO and Bartlett require the correlation matrix; with the covariance they are not reported.',
  'Saturazioni e punteggi sono calcolati sui dati osservati: non c’è inferenza né intervallo di confidenza.':
    'Loadings and scores are computed on the observed data: there is no inference and no confidence interval.',
  'Cronbach α = {s1} su {s2} item: affidabilità {s3}.':
    'Cronbach α = {s1} on {s2} items: {s3} reliability.',
  'Scala coerente':
    'Coherent scale',
  'Coerenza bassa':
    'Low coherence',
  'L’α di Cronbach stima la coerenza interna: quanto gli item di una scala misurano la stessa cosa in modo consistente.':
    'Cronbach\'s α estimates internal consistency: how consistently the items of a scale measure the same thing.',
  'Calcolato su {s1} casi completi e {s2} item; α standardizzato = {s3}.':
    'Computed on {s1} complete cases and {s2} items; standardised α = {s3}.',
  'α = {s1} ({s2}). La correlazione media tra item è {s3} ({s4}).':
    'α = {s1} ({s2}). The mean inter-item correlation is {s3} ({s4}).',
  'La scala supera la soglia convenzionale di 0.70: la somma degli item è sufficientemente coerente per essere usata come punteggio.':
    'The scale exceeds the conventional 0.70 threshold: the sum of the items is coherent enough to be used as a score.',
  'La scala è sotto la soglia convenzionale di 0.70: la somma degli item contiene molta varianza specifica di ciascun item.':
    'The scale is below the conventional 0.70 threshold: the sum of the items contains a lot of variance specific to each item.',
  'Diagnostica per item':
    'Item diagnostics',
  'Nessun item disponibile.':
    'No item available.',
  '{s1} item esaminati; {s2} hanno una correlazione item-totale ≥ 0.30.':
    '{s1} items examined; {s2} have an item-total correlation ≥ 0.30.',
  'Eliminando {s1} l’α aumenterebbe (fino a {s2}).':
    'Removing {s1} would increase α (up to {s2}).',
  'Nessun item, se eliminato, aumenta l’α in modo sostanziale.':
    'No item, if removed, increases α substantially.',
  'Item con r item-totale < 0.30: {s1}.':
    'Items with item-total r < 0.30: {s1}.',
  'Tutti gli item correlano almeno 0.30 con il resto della scala.':
    'All items correlate at least 0.30 with the rest of the scale.',
  'α assume item con la stessa direzione: item reverse-scored devono essere ricodificati prima dell’analisi.':
    'α assumes items with the same direction: reverse-scored items must be recoded before the analysis.',
  'α cresce meccanicamente con il numero di item: confronta scale con lo stesso numero di item.':
    'α grows mechanically with the number of items: compare scales with the same number of items.',
  'Un α alto non dimostra che la scala sia unidimensionale; per questo serve un’analisi fattoriale (es. PCA).':
    'A high α does not prove that the scale is one-dimensional; a factor analysis (e.g. PCA) is needed for that.',
  'I casi incompleti sono esclusi: se le omissioni non sono casuali, l’α può essere distorto.':
    'Incomplete cases are excluded: if the omissions are not random, α can be distorted.',
  'È riportato l’α di Cronbach; ω di McDonald non è calcolato.':
    'Cronbach\'s α is reported; McDonald\'s ω is not computed.',
  'Non sono inclusi intervalli di confidenza bootstrapped per α.':
    'Bootstrap confidence intervals for α are not included.',
  'Report di analisi fattoriale':
    'Factor analysis report',
  '{s1} fattori spiegano il {s2} della varianza; omega = {s3}.':
    '{s1} factors explain {s2} of the variance; omega = {s3}.',
  'Affidabilità accettabile':
    'Acceptable reliability',
  'Affidabilità da valutare':
    'Reliability to be assessed',
  'Soluzione {s1} su {s2} casi completi.':
    '{s1} solution on {s2} complete cases.',
  'non ruotata':
    'unrotated',
  'Bartlett χ²({s1}) = {s2}, p = {s3}.':
    'Bartlett χ²({s1}) = {s2}, p = {s3}.',
  'Ci sono {s1} loadings sostanziali (|λ| ≥ 0,40): controlla la tabella per attribuire i fattori alle variabili.':
    'There are {s1} substantial loadings (|λ| ≥ 0.40): check the table to attribute the factors to the variables.',
  'Nessun loading raggiunge 0,40: la struttura fattoriale è debole o il numero di fattori è insufficiente.':
    'No loading reaches 0.40: the factor structure is weak or the number of factors is insufficient.',
  'Omega totale = {s1}: stima la quota di varianza affidabile della scala complessiva.':
    'Total omega = {s1}: it estimates the share of reliable variance of the overall scale.',
  'La parallel analysis confronta gli autovalori osservati con quelli di dati casuali con la stessa numerosità.':
    'Parallel analysis compares the observed eigenvalues with those of random data with the same sample size.',
  'La soluzione fattoriale non è unica: rotazioni e numero di fattori cambiano l’interpretazione.':
    'The factor solution is not unique: rotations and number of factors change the interpretation.',
  'L’analisi fattoriale esplorativa non sostituisce una CFA con ipotesi pre-specificate.':
    'Exploratory factor analysis does not replace a CFA with pre-specified hypotheses.',
  'pc{s1}':
    'pc{s1}',
  'PC{s1}':
    'PC{s1}',
  'Autovalori e varianza spiegata':
    'Eigenvalues and explained variance',
  '{s1} casi completi · {s2} variabili · {s3} componenti ritenuti':
    '{s1} complete cases · {s2} variables · {s3} retained components',
  'Componente':
    'Component',
  'Autovalore':
    'Eigenvalue',
  '% varianza':
    '% variance',
  '% cumulata':
    '% cumulative',
  'Ritenuto':
    'Retained',
  'Criterio di Kaiser: si ritengono i componenti con autovalore > 1 (matrice di correlazione).':
    'Kaiser criterion: components with eigenvalue > 1 are retained (correlation matrix).',
  'Criterio della media: si ritengono i componenti con autovalore > media degli autovalori (matrice di covarianza).':
    'Mean criterion: components with eigenvalue > mean of the eigenvalues are retained (covariance matrix).',
  'Saturazioni e comunalità':
    'Loadings and communalities',
  'PCA su matrice di correlazione':
    'PCA on the correlation matrix',
  'PCA su matrice di covarianza':
    'PCA on the covariance matrix',
  'Comunalità':
    'Communality',
  'KMO item':
    'Item KMO',
  'Saturazione = autovettore × √autovalore. La comunalità è la quota di varianza spiegata dai componenti ritenuti.':
    'Loading = eigenvector × √eigenvalue. Communality is the share of variance explained by the retained components.',
  'Con |saturazione| ≥ 0.40 la variabile è di solito considerata associata al componente.':
    'With |loading| ≥ 0.40 the variable is usually considered associated with the component.',
  'KMO':
    'KMO',
  'Bartlett χ²':
    'Bartlett χ²',
  'df = {s1}':
    'df = {s1}',
  'solo con matrice di correlazione':
    'only with the correlation matrix',
  'Bartlett p':
    'Bartlett p',
  'struttura non sferica':
    'non-spherical structure',
  'nessuna struttura lineare rilevata':
    'no linear structure detected',
  'Determinante R':
    'R determinant',
  'valori prossimi a 0 indicano collinearità':
    'values close to 0 indicate collinearity',
  'N casi':
    'N cases',
  'casi completi sulle variabili selezionate':
    'complete cases on the selected variables',
  'KMO ≥ 0.70 è in genere considerato adeguato per la PCA.':
    'KMO ≥ 0.70 is generally considered adequate for PCA.',
  'Bartlett significativo indica che la matrice di correlazione non è un’identità: è una condizione necessaria, non sufficiente.':
    'A significant Bartlett indicates that the correlation matrix is not an identity: it is a necessary condition, not a sufficient one.',
  'Affidabilità della scala':
    'Scale reliability',
  '{s1} item · {s2} casi completi':
    '{s1} items · {s2} complete cases',
  'Cronbach α':
    'Cronbach α',
  'α standardizzato':
    'standardised α',
  'sulle correlazioni inter-item':
    'on the inter-item correlations',
  'r media inter-item':
    'mean inter-item r',
  'Media totale':
    'Total mean',
  'somma dei punteggi / casi':
    'sum of the scores / cases',
  'SD totale':
    'Total SD',
  'deviazione standard della somma':
    'standard deviation of the sum',
  'α = k/(k−1) · [1 − Σσ²item / σ²totale].':
    'α = k/(k−1) · [1 − Σσ²item / σ²total].',
  'α non misura l’unidimensionalità: una scala può avere α alto pur con più fattori.':
    'α does not measure one-dimensionality: a scale can have a high α even with several factors.',
  'Item':
    'Item',
  'r item-totale':
    'item-total r',
  'α se eliminato':
    'α if removed',
  'r item-totale = correlazione dell’item con la somma degli altri item (corretta).':
    'item-total r = correlation of the item with the sum of the other items (corrected).',
  'Un α-se-eliminato maggiore dell’α totale segnala un item che riduce la coerenza interna.':
    'An α-if-removed greater than the total α signals an item that reduces internal consistency.',
  'Correlazioni inter-item':
    'Inter-item correlations',
  'Correlazioni di Pearson sui casi completi; la diagonale è 1.':
    'Pearson correlations on the complete cases; the diagonal is 1.',
  'Adeguatezza della soluzione':
    'Adequacy of the solution',
  '{s1} casi · {s2} variabili · {s3} fattori':
    '{s1} cases · {s2} variables · {s3} factors',
  'Variabili':
    'Variables',
  'Fattori':
    'Factors',
  'Bartlett df':
    'Bartlett df',
  'Omega totale':
    'Total omega',
  'Bartlett verifica che la matrice di correlazione non sia un’identità: è una condizione necessaria, non sufficiente.':
    'Bartlett checks that the correlation matrix is not an identity: it is a necessary condition, not a sufficient one.',
  'Omega totale è calcolato dai loadings e dalle unicità della soluzione ruotata.':
    'Total omega is computed from the loadings and uniquenesses of the rotated solution.',
  'Autovalori e parallel analysis':
    'Eigenvalues and parallel analysis',
  'Soglia = 95° percentile dei dati casuali':
    'Threshold = 95th percentile of the random data',
  'Soglia parallela':
    'Parallel threshold',
  'I fattori ritenuti sono quelli con autovalore sopra la soglia della parallel analysis.':
    'The retained factors are those with an eigenvalue above the parallel analysis threshold.',
  'Loadings ({s1})':
    'Loadings ({s1})',
  'non ruotati':
    'unrotated',
  'f{s1}':
    'f{s1}',
  'F{s1}':
    'F{s1}',
  'Unicità':
    'Uniqueness',
  'Loadings ≥ 0,40 sono generalmente considerati sostanziali; il segno è arbitrario.':
    'Loadings ≥ 0.40 are generally considered substantial; the sign is arbitrary.',
};
