/** English prose of the variance reports. */
export const variancesCopy: Record<string, string> = {
  'Bartlett assume la normalità ed è sensibile agli outlier; Levene sulle mediane è più robusto.':
    'Bartlett assumes normality and is sensitive to outliers; Levene on medians is more robust.',
  'Bartlett è potente sotto normalità ma falsato da outlier e code pesanti.':
    'Bartlett is powerful under normality but distorted by outliers and heavy tails.',
  'Con pochi casi l’intervallo è molto largo: servono più osservazioni per stimare una varianza con precisione.':
    'With few cases the interval is very wide: more observations are needed to estimate a variance precisely.',
  'Confronto delle varianze di {s1} tra i gruppi di {s2}.':
    'Comparison of the variances of {s1} across the groups of {s2}.',
  'F test (first two groups)':
    'F test (first two groups)',
  'F, Bartlett e Levene rispondono alla stessa domanda con assunzioni diverse: le varianze dei gruppi sono uguali?':
    'F, Bartlett and Levene answer the same question with different assumptions: are the group variances equal?',
  'F: p = {s1}; Bartlett: χ² = {s2}, p = {s3}; Levene: F = {s4}, p = {s5}.':
    'F: p = {s1}; Bartlett: χ² = {s2}, p = {s3}; Levene: F = {s4}, p = {s5}.',
  'F: rapporto tra le varianze dei primi due gruppi, intervallo esatto.':
    'F: ratio of the variances of the first two groups, exact interval.',
  'I gruppi devono essere indipendenti e le osservazioni dentro ogni gruppo indipendenti.':
    'Groups must be independent and the observations within each group independent.',
  'Il test F è definito per due gruppi; con più gruppi usa Bartlett o Levene.':
    'The F test is defined for two groups; with more groups use Bartlett or Levene.',
  'Il test confronta la varianza osservata con il valore nullo; l’intervallo dice quanto è incerta la stima.':
    'The test compares the observed variance with the null value; the interval shows how uncertain the estimate is.',
  'Il test χ² sulla varianza assume una popolazione normale: con distribuzioni asimmetriche il p non è affidabile.':
    'The χ² variance test assumes a normal population: with skewed distributions p is not reliable.',
  'Intervallo della varianza: {s1}.':
    'Variance interval: {s1}.',
  'Intervallo esatto della varianza ottenuto invertendo la χ².':
    'Exact variance interval obtained by inverting the χ².',
  'La varianza è nella scala al quadrato: per leggere l’intervallo nella scala dei dati usa la deviazione standard.':
    'Variance is on the squared scale: to read the interval on the data scale use the standard deviation.',
  'La varianza è sensibile agli outlier: un solo valore estremo può dominarla.':
    'Variance is sensitive to outliers: a single extreme value can dominate it.',
  'Le osservazioni devono essere indipendenti e normali.':
    'Observations must be independent and normal.',
  'Levene (median)':
    'Levene (median)',
  'Levene sulle mediane riduce l’effetto degli estremi ed è il default più sicuro.':
    'Levene on medians reduces the effect of extremes and is the safer default.',
  'Levene sulle mediane è la scelta più robusta quando i gruppi sono piccoli o la distribuzione non è normale.':
    'Levene on medians is the most robust choice when groups are small or the distribution is not normal.',
  'L’intervallo è asimmetrico: la varianza stimata non sta al centro, perché la distribuzione di s² è asimmetrica.':
    'The interval is asymmetric: the estimated variance is not at the centre, because the distribution of s² is skewed.',
  'Nessuno dei tre test sostituisce l’ispezione grafica della dispersione: guarda le scatole.':
    'None of the three tests replaces a graphical inspection of the spread: look at the boxes.',
  'Null variance':
    'Null variance',
  'Report di lettura — Uguaglianza delle varianze':
    'Reading report — Equality of variances',
  'Report di lettura — Varianza':
    'Reading report — Variance',
  'Test di uguaglianza delle varianze':
    'Equality of variances tests',
  'Varianza (un campione)':
    'Variance (one sample)',
  'Varianza di {s1}: {s2} ({s3}).':
    'Variance of {s1}: {s2} ({s3}).',
  'Varianza nulla {s1}: χ² = {s2}, df = {s3}, p = {s4}.':
    'Null variance {s1}: χ² = {s2}, df = {s3}, p = {s4}.',
  'Varianze per gruppo':
    'Variances by group',
  'Varianze: {s1} e {s2}; rapporto {s3} (CI {s4}).':
    'Variances: {s1} and {s2}; ratio {s3} (CI {s4}).',
  '{s1} osservazioni: varianza {s2}, deviazione standard {s3}.':
    '{s1} observations: variance {s2}, standard deviation {s3}.',
  'χ² = (n − 1)·s²/σ₀² con n − 1 gradi di libertà; il p è a due code.':
    'χ² = (n − 1)·s²/σ₀² with n − 1 degrees of freedom; p is two-sided.',
};
