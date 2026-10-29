/** English prose of the stratcox report and its tables. */
export const stratcoxCopy: Record<string, string> = {
  'Report Cox stratificato':
    'Stratified Cox report',
  'Modello di Cox con {s1} strati e {s2} eventi.':
    'Cox model with {s1} strata and {s2} events.',
  'Predittori associati al rischio':
    'Predictors associated with the risk',
  'Nessuna associazione netta':
    'No clear association',
  'LR χ² = {s1}, p = {s2}; concordanza = {s3}.':
    'LR χ² = {s1}, p = {s2}; concordance = {s3}.',
  'La stratificazione permette una baseline di rischio diversa per strato, mantenendo un effetto comune dei predittori.':
    'Stratification allows a different baseline risk for each stratum, while keeping a common effect of the predictors.',
  'Il modello nel complesso è significativo: almeno un predittore è associato al rischio entro strato.':
    'The model as a whole is significant: at least one predictor is associated with the risk within stratum.',
  'Il modello non mostra un’associazione complessiva significativa.':
    'The model does not show an overall significant association.',
  'Gli hazard ratio sono comuni agli strati: la stratificazione non stima effetti diversi per strato.':
    'The hazard ratios are common across strata: stratification does not estimate different effects per stratum.',
  'Il livello di confidenza è {s1}%.':
    'The confidence level is {s1}%.',
  'Non sono incluse covariate tempo-dipendenti né fragilità.':
    'Time-dependent covariates and frailty are not included.',
  'La baseline per strato non è riportata.':
    'The baseline by stratum is not reported.',
  'Cox stratificato':
    'Stratified Cox',
  '{s1} strati · {s2} osservazioni · {s3} eventi':
    '{s1} strata · {s2} observations · {s3} events',
  'Strati':
    'Strata',
  'Wald':
    'Wald',
  'p Wald':
    'Wald p',
  'Score':
    'Score',
  'p score':
    'score p',
  'Concordanza':
    'Concordance',
  'La baseline è stimata separatamente per strato; i coefficienti sono condivisi.':
    'The baseline is estimated separately for each stratum; the coefficients are shared.',
  'La tabella della baseline non è riportata per il modello stratificato.':
    'The baseline table is not reported for the stratified model.',
  'Hazard ratio · CI {s1}%':
    'Hazard ratio · CI {s1}%',
  'HR > 1 indica un rischio maggiore per un’unità in più del predittore, a parità di strato.':
    'HR > 1 indicates a higher risk for one more unit of the predictor, within stratum.',
};
