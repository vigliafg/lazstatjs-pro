/** English prose of the mi report and its tables. */
export const miCopy: Record<string, string> = {
  'Report di imputazione multipla':
    'Multiple imputation report',
  '{s1} celle imputate con {s2} dataset; FMI massimo {s3}.':
    '{s1} imputed cells with {s2} datasets; maximum FMI {s3}.',
  'Molte informazioni mancanti':
    'A lot of missing information',
  'Imputazione stabile':
    'Stable imputation',
  'Variabili: {s1}.':
    'Variables: {s1}.',
  'Modello di imputazione: regressione lineare a catene, {s1} iterazioni per dataset.':
    'Imputation model: linear regression by chained equations, {s1} iterations per dataset.',
  'Le stime pooled combinano la variabilità dentro e tra le imputazioni: i CI tengono conto dell’incertezza dovuta ai dati mancanti.':
    'The pooled estimates combine variability within and between imputations: the CIs account for the uncertainty due to the missing data.',
  'Una FMI alta indica che i dati mancanti dominano l’incertezza: interpreta le stime con cautela.':
    'A high FMI indicates that the missing data dominate the uncertainty: interpret the estimates with caution.',
  'La frazione di informazione mancante è contenuta: le stime sono relativamente stabili.':
    'The fraction of missing information is contained: the estimates are relatively stable.',
  'Il livello di confidenza delle stime pooled è {s1}%.':
    'The confidence level of the pooled estimates is {s1}%.',
  'Modello lineare pooled: R² medio = {s1} su {s2} predittori.':
    'Pooled linear model: mean R² = {s1} on {s2} predictors.',
  'Nessun modello di regressione pooled richiesto.':
    'No pooled regression model required.',
  'L’imputazione assume dati mancanti a caso (MAR) condizionatamente alle altre variabili.':
    'Imputation assumes data missing at random (MAR) conditional on the other variables.',
  'Con poche osservazioni o variabili molto correlate il modello di imputazione può essere instabile.':
    'With few observations or strongly correlated variables the imputation model can be unstable.',
  'Le stime pooled qui riportate riguardano media e SD, non modelli di regressione completi.':
    'The pooled estimates reported here concern mean and SD, not complete regression models.',
  'Dati mancanti':
    'Missing data',
  '{s1} righe · {s2} imputazioni · {s3} iterazioni':
    '{s1} rows · {s2} imputations · {s3} iterations',
  'Variabile':
    'Variable',
  'Osservati':
    'Observed',
  'Mancanti':
    'Missing',
  '% mancante':
    '% missing',
  'Le variabili selezionate vengono imputate con un modello lineare sulle altre variabili.':
    'The selected variables are imputed with a linear model on the other variables.',
  'Stime pooled (Rubin)':
    'Pooled estimates (Rubin)',
  'SD pooled':
    'Pooled SD',
  'df Rubin':
    'Rubin df',
  'FMI':
    'FMI',
  'Pooling di Rubin: varianza totale = varianza within + (1 + 1/m)·varianza between.':
    'Rubin pooling: total variance = within variance + (1 + 1/m)·between variance.',
  'Regressione pooled':
    'Pooled regression',
  'R² medio = {s1} · {s2}% CI':
    'mean R² = {s1} · {s2}% CI',
  'Coefficienti pooled con regole di Rubin; R² è la media delle imputazioni.':
    'Pooled coefficients with Rubin\'s rules; R² is the mean of the imputations.',
};
