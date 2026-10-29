/** English prose of the countreg report and its tables. */
export const countregCopy: Record<string, string> = {
  'Report di regressione per conteggi':
    'Count regression report',
  'Modello di Poisson su {s1} osservazioni; dispersione {s2}.':
    'Poisson model on {s1} observations; dispersion {s2}.',
  'Modello binomiale negativo su {s1} osservazioni (θ = {s2}).':
    'Negative binomial model on {s1} observations (θ = {s2}).',
  'Overdispersion da valutare':
    'Overdispersion to be assessed',
  'Modello stimato':
    'Model estimated',
  'LR vs modello nullo: χ² = {s1}, p = {s2}.':
    'LR vs null model: χ² = {s1}, p = {s2}.',
  'Il primo predittore ha IRR = {s1} (CI {s2}%: {s3} – {s4}).':
    'The first predictor has IRR = {s1} (CI {s2}%: {s3} – {s4}).',
  '{s1} predittore/i risultano significativi al livello scelto.':
    '{s1} predictor(s) are significant at the chosen level.',
  'Nessun predittore risulta significativo al livello scelto.':
    'No predictor is significant at the chosen level.',
  'IRR > 1 indica un tasso atteso più alto per un’unità in più del predittore; IRR < 1 un tasso più basso.':
    'IRR > 1 indicates a higher expected rate for one more unit of the predictor; IRR < 1 a lower rate.',
  'La dispersione è chiaramente sopra 1: il Poisson sottostima l’errore. Usa la negative binomiale.':
    'The dispersion is clearly above 1: Poisson underestimates the error. Use the negative binomial.',
  'La dispersione è compatibile con il modello scelto.':
    'The dispersion is compatible with the chosen model.',
  'La regressione per conteggi assume osservazioni indipendenti e una relazione log-lineare.':
    'Count regression assumes independent observations and a log-linear relationship.',
  'Con molti zeri può servire un modello zero-inflated, non disponibile.':
    'With many zeros a zero-inflated model may be needed, which is not available.',
  'Sintesi del modello':
    'Model summary',
  'Negative binomial (θ = {s1})':
    'Negative binomial (θ = {s1})',
  'Predittori':
    'Predictors',
  'Deviance':
    'Deviance',
  'df residui':
    'residual df',
  'Dispersione (Pearson/df)':
    'Dispersion (Pearson/df)',
  'Log-verosimiglianza':
    'Log-likelihood',
  'LR vs nullo':
    'LR vs null',
  'p LR':
    'p LR',
  'AIC':
    'AIC',
  'BIC':
    'BIC',
  'Conteggi non interi':
    'Non-integer counts',
  'Poisson assume varianza = media. Dispersione > 1 indica overdispersion: meglio negative binomial.':
    'Poisson assumes variance = mean. Dispersion > 1 indicates overdispersion: negative binomial is better.',
  'Il test LR confronta il modello con l’intercetta sola.':
    'The LR test compares the model with the intercept alone.',
  'Coefficienti':
    'Coefficients',
  'IRR e CI {s1}%':
    'IRR and CI {s1}%',
  'β':
    'β',
  'IRR':
    'IRR',
  'IRR low':
    'IRR low',
  'IRR high':
    'IRR high',
  'IRR = exp(β): moltiplicatore del tasso atteso per un’unità in più del predittore.':
    'IRR = exp(β): multiplier of the expected rate for one more unit of the predictor.',
  'p da z normale; con dispersione stimata i test sono approssimati.':
    'p from normal z; with estimated dispersion the tests are approximate.',
};
