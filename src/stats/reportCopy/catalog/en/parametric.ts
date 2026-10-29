/** English prose of the parametric report and its tables. */
export const parametricCopy: Record<string, string> = {
  'Report di sopravvivenza parametrica':
    'Parametric survival report',
  '{s1} AFT su {s2} osservazioni e {s3} eventi.':
    '{s1} AFT on {s2} observations and {s3} events.',
  'Pochi eventi':
    'Few events',
  'Predictori: {s1}.':
    'Predictors: {s1}.',
  'Scala σ = {s1}; log-verosimiglianza = {s2}.':
    'Scale σ = {s1}; log-likelihood = {s2}.',
  'Il modello AFT stima l’effetto dei predittori sul log del tempo di sopravvivenza: un time ratio maggiore di 1 indica tempi più lunghi.':
    'The AFT model estimates the effect of the predictors on the log survival time: a time ratio greater than 1 indicates longer times.',
  'La forma della distribuzione (Weibull o esponenziale) è un’assunzione: va confrontata con KM e con l’AIC rispetto ad altre famiglie.':
    'The shape of the distribution (Weibull or exponential) is an assumption: it must be checked against KM and with AIC against other families.',
  'Il livello di confidenza è {s1}%; con pochi eventi le stime sono instabili.':
    'The confidence level is {s1}%; with few events the estimates are unstable.',
  'Non sono inclusi effetti casuali, fragilità o rischi competitivi.':
    'Random effects, frailty or competing risks are not included.',
  'La censura è assunta non informativa.':
    'Censoring is assumed non-informative.',
  'Sopravvivenza parametrica':
    'Parametric survival',
  '{s1} · CI {s2}%':
    '{s1} · CI {s2}%',
  'Weibull AFT':
    'Weibull AFT',
  'Exponenziale AFT':
    'Exponential AFT',
  'Intercetta (μ)':
    'Intercept (μ)',
  'Scala (σ)':
    'Scale (σ)',
  'Modello AFT: log(T) = μ + Xβ + σ·W, con W extreme-value.':
    'AFT model: log(T) = μ + Xβ + σ·W, with W extreme-value.',
  'Con la distribuzione esponenziale la scala è fissata a 1.':
    'With the exponential distribution the scale is fixed at 1.',
  'Time ratio e CI':
    'Time ratio and CI',
  'Time ratio':
    'Time ratio',
  'TR low':
    'TR low',
  'TR high':
    'TR high',
  'Time ratio > 1 indica tempi di sopravvivenza più lunghi per un’unità in più del predittore.':
    'Time ratio > 1 indicates longer survival times for one more unit of the predictor.',
};
