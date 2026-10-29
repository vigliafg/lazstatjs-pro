/** English prose of the lmm report and its tables. */
export const lmmCopy: Record<string, string> = {
  'Report del modello misto':
    'Mixed model report',
  'ICC = {s1}: il {s2}% della variabilità è tra gruppi ({s3}).':
    'ICC = {s1}: {s2}% of the variability is between groups ({s3}).',
  'Struttura di gruppo rilevante':
    'Relevant group structure',
  'Struttura di gruppo modesta':
    'Modest group structure',
  'Modello: esito ~ {s1} + (1 | {s2}), {s3} gruppi, {s4} osservazioni.':
    'Model: outcome ~ {s1} + (1 | {s2}), {s3} groups, {s4} observations.',
  'Varianza dell’intercetta = {s1}; varianza residua = {s2}.':
    'Intercept variance = {s1}; residual variance = {s2}.',
  'Solo intercetta casuale: non sono stimati slope casuali.':
    'Random intercept only: random slopes are not estimated.',
  'Con meno di 5–10 gruppi la varianza tra gruppi è imprecisa.':
    'With fewer than 5–10 groups the between-group variance is imprecise.',
  'Modello lineare misto':
    'Linear mixed model',
  '{s1} ~ {s2} + (1 | {s3}) · CI {s4}%':
    '{s1} ~ {s2} + (1 | {s3}) · CI {s4}%',
  'Gruppi':
    'Groups',
  'Varianza intercetta':
    'Intercept variance',
  'Varianza residua':
    'Residual variance',
  'ICC':
    'ICC',
  'REML logLik (a meno di costante)':
    'REML logLik (up to a constant)',
  'Stima REML con intercetta casuale per gruppo.':
    'REML estimate with a random intercept per group.',
  'ICC = varianza tra gruppi / varianza totale.':
    'ICC = between-group variance / total variance.',
  'Effetti fissi':
    'Fixed effects',
  'CI {s1}% · t con df = {s2}':
    'CI {s1}% · t with df = {s2}',
  'p e CI usano una t con df = N − parametri; con pochi gruppi sono approssimati.':
    'p and CIs use a t with df = N − parameters; with few groups they are approximate.',
};
