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
  'Riepilogo per variabile': 'Summary by variable',
  'Codici osservati': 'Observed codes',
  'Le variabili categoriche sono imputate con una regressione logistica (due categorie) o multinomiale (più categorie) sulle altre variabili e sulle covariabili numeriche.': 'Categorical variables are imputed with logistic regression (two categories) or multinomial regression (more than two) on the other variables and the numeric covariates.',
  'Le categorie sono i codici interi osservati, ordinati numericamente; l’imputazione non può produrre codici nuovi.': 'Categories are the observed integer codes, sorted numerically; imputation cannot produce new codes.',
  'Conteggi osservati e completati per categoria': 'Observed and completed counts by category',
  'Dopo l’ultima delle {s1} imputazioni': 'After the last of {s1} imputations',
  'Completati': 'Completed',
  'Prop. osservata': 'Observed prop.',
  'Prop. completata': 'Completed prop.',
  'I conteggi completati sono quelli dell’ultimo dataset imputato: servono a confrontare la distribuzione osservata con quella ricostruita.': 'Completed counts come from the last imputed dataset: they compare the observed distribution with the reconstructed one.',
  'Una differenza sistematica tra proporzione osservata e completata segnala che il modello di imputazione sta spostando la distribuzione.': 'A systematic difference between observed and completed proportions signals that the imputation model is shifting the distribution.',
  'Proporzioni pooled (Rubin)': 'Pooled proportions (Rubin)',
  'CI {s1}% · pooling sulle {s2} imputazioni': 'CI {s1}% · pooling over {s2} imputations',
  'Pooling di Rubin sulle proporzioni: varianza totale = varianza within + (1 + 1/m)·varianza between.': 'Rubin pooling on proportions: total variance = within variance + (1 + 1/m)·between variance.',
  'Le proporzioni di ciascuna variabile sommano a 1; gli intervalli di categorie rare possono essere molto ampi.': 'The proportions of each variable sum to 1; intervals for rare categories can be very wide.',
  'Report di imputazione multipla categorica': 'Categorical multiple imputation report',
  '{s1} celle categoriche imputate con {s2} dataset; FMI massimo {s3}.': '{s1} categorical cells imputed with {s2} datasets; maximum FMI {s3}.',
  'Variabili categoriche: {s1}.': 'Categorical variables: {s1}.',
  'Modello di imputazione: catene con regressione logistica o multinomiale, {s1} iterazioni per dataset.': 'Imputation model: chained logistic or multinomial regression, {s1} iterations per dataset.',
  'Categorie osservate: {s1} in totale; le proporzioni pooled sono combinate con le regole di Rubin.': 'Observed categories: {s1} in total; pooled proportions are combined with Rubin\'s rules.',
  'Le proporzioni pooled sono la media delle proporzioni di categoria nelle {s1} imputazioni; gli intervalli combinano la variabilità dentro e tra le imputazioni.': 'Pooled proportions are the mean of the category proportions across the {s1} imputations; the intervals combine within- and between-imputation variability.',
  'Ogni variabile mantiene solo le categorie osservate: l’imputazione non inventa codici nuovi, ma redistribuisce le righe mancanti tra le categorie esistenti.': 'Each variable keeps only its observed categories: imputation does not invent new codes, but redistributes missing rows among existing categories.',
  'Una FMI alta indica che i dati mancanti dominano l’incertezza delle proporzioni: interpreta le stime con cautela.': 'A high FMI indicates that the missing data dominate the uncertainty of the proportions: interpret the estimates with caution.',
  'La frazione di informazione mancante è contenuta: le proporzioni pooled sono relativamente stabili.': 'The fraction of missing information is contained: the pooled proportions are relatively stable.',
  'Il modello assume che i dati manchino a caso (MAR) condizionatamente alle altre variabili categoriche e alle covariabili numeriche incluse.': 'The model assumes data missing at random (MAR) conditional on the other categorical variables and the numeric covariates included.',
  'Le altre variabili categoriche entrano nel modello come dummy (K−1 per variabile) usando i valori correnti della catena; le covariabili numeriche entrano come effetti lineari.': 'The other categorical variables enter as dummies (K−1 per variable) using the current chain values; numeric covariates enter as linear effects.',
  'Le righe usate per stimare ciascun modello condizionale sono quelle in cui la variabile da imputare è osservata; le altre variabili possono essere già state imputate nella stessa iterazione.': 'The rows used to fit each conditional model are those where the variable to impute is observed; the other variables may already have been imputed in the same iteration.',
  'Categorie con proporzione pooled inferiore al 5%: {s1}. Queste stime sono le più sensibili al modello e al numero di imputazioni.': 'Categories with pooled proportion below 5%: {s1}. These estimates are the most sensitive to the model and the number of imputations.',
  'Nessuna categoria pooled scende sotto il 5%: le proporzioni stimate sono distribuite in modo non estremo.': 'No pooled category falls below 5%: the estimated proportions are not extreme.',
  'Con categorie rare gli errori standard possono essere instabili anche quando il modello converge.': 'With rare categories standard errors can be unstable even when the model converges.',
  'L’imputazione assume dati mancanti a caso (MAR) condizionatamente alle variabili osservate: se il meccanismo è MNAR le stime possono essere distorte.': 'Imputation assumes data missing at random (MAR) conditional on the observed variables: if the mechanism is MNAR the estimates may be biased.',
  'Il percorso categorico non usa la massima verosimiglianza a informazione completa (FIML): l’incertezza è quella del pooling di Rubin sulle imputazioni.': 'The categorical path does not use full-information maximum likelihood (FIML): uncertainty comes from Rubin pooling over imputations.',
  'Non è disponibile un modello gerarchico o multilivello per le categorie: strutture di clustering non vengono modellate.': 'No hierarchical or multilevel model is available for categories: clustering structures are not modelled.',
  'Categorie rare e variabili quasi separate rendono instabili i coefficienti logistici e quindi le proporzioni imputate.': 'Rare categories and quasi-separated variables make the logistic coefficients unstable and therefore the imputed proportions too.',
  'Le stime pooled qui riportate riguardano le proporzioni di categoria, non modelli di regressione categorica completi.': 'The pooled estimates reported here concern category proportions, not complete categorical regression models.',
};
