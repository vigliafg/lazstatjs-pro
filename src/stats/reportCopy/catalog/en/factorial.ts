/** English prose of the factorial report and its tables. */
export const factorialCopy: Record<string, string> = {
  '{s1}: F({s2}, {s3}) = {s4}, {s5}, η² parziale = {s6}':
    '{s1}: F({s2}, {s3}) = {s4}, {s5}, partial η² = {s6}',
  'p < 0.001':
    'p < 0.001',
  'p = {s1}':
    'p = {s1}',
  'Dati insufficienti per stimare il modello.':
    'Not enough data to estimate the model.',
  'L’interazione {s1} è significativa: l’effetto di un fattore dipende dal livello dell’altro.':
    'The {s1} interaction is significant: the effect of one factor depends on the level of the other.',
  '{s1} effetto/i {s2} al livello {s3}.':
    '{s1} effect(s) {s2} at level {s3}.',
  'è significativo':
    'is significant',
  'sono significativi':
    'are significant',
  'Nessun effetto raggiunge la significatività al livello {s1}.':
    'No effect reaches significance at level {s1}.',
  'Interazione presente':
    'Interaction present',
  'Effetti significativi':
    'Significant effects',
  'L’ANOVA a due fattori separa la variabilità della risposta in tre pezzi: quanto dipende dal primo fattore, quanto dal secondo e quanto dalla loro combinazione.':
    'Two-way ANOVA splits the variability of the response into three parts: how much depends on the first factor, how much on the second and how much on their combination.',
  'L’ipotesi nulla di ogni riga è “nessun effetto”: se il p scende sotto la soglia, quel termine spiega più variabilità di quanto il caso saprebbe produrre.':
    'The null hypothesis of each row is “no effect”: if the p drops below the threshold, that term explains more variability than chance could produce.',
  'L’interazione è significativa ({s1}): gli effetti principali non vanno letti da soli, perché l’effetto di ciascun fattore cambia a seconda del livello dell’altro. Guarda le medie per cella e il grafico: le linee non parallele sono la firma dell’interazione.':
    'The interaction is significant ({s1}): the main effects should not be read on their own, because the effect of each factor changes with the level of the other. Look at the cell means and the plot: non-parallel lines are the signature of the interaction.',
  'L’interazione non è significativa: gli effetti dei due fattori possono essere letti separatamente, come se agissero in modo additivo.':
    'The interaction is not significant: the effects of the two factors can be read separately, as if they acted additively.',
  'Quanto pesa ogni effetto':
    'How much each effect weighs',
  'η² parziale dice quale quota della variabilità residua (dopo gli altri termini) spiega quel termine: 0,01 è piccolo, 0,06 medio, 0,14 grande secondo i riferimenti di Cohen. ω² corregge il bias verso l’alto e può essere più piccolo, soprattutto con pochi df.':
    'Partial η² says what share of the remaining variability (after the other terms) that term explains: 0.01 is small, 0.06 medium, 0.14 large according to Cohen\'s benchmarks. ω² corrects the upward bias and can be smaller, especially with few df.',
  '{s1}: η² parziale = {s2}, ω² = {s3}':
    '{s1}: partial η² = {s2}, ω² = {s3}',
  'Assunzioni e diagnostica':
    'Assumptions and diagnostics',
  'R² = {s1}: il modello spiega questa quota della variabilità totale.':
    'R² = {s1}: the model explains this share of the total variability.',
  'Levene sulle celle: p = {s1}. Se è sotto 0,05 le varianze non sono omogenee e l’F può essere distorto, soprattutto con gruppi di dimensione diversa.':
    'Levene on the cells: p = {s1}. If it is below 0.05 the variances are not homogeneous and the F can be distorted, especially with groups of different size.',
  'Levene (celle)':
    'Levene (cells)',
  'Lilliefors sui residui: p = {s1}. Con residui non normali valuta una trasformazione (log, radice) o un’analisi per ranghi.':
    'Lilliefors on the residuals: p = {s1}. With non-normal residuals consider a transformation (log, root) or a rank analysis.',
  'Lilliefors (residui)':
    'Lilliefors (residuals)',
  'Osservazioni indipendenti: nessuna struttura di misure ripetute o di blocchi è modellata qui.':
    'Independent observations: no repeated-measures or block structure is modelled here.',
  'Cosa non dice il test':
    'What the test does not say',
  'Una F significativa dice che almeno una media differisce, non quale coppia: per quello servono i confronti post-hoc. E nessuna F stabilisce la direzione causale degli effetti.':
    'A significant F says that at least one mean differs, not which pair: post-hoc comparisons are needed for that. And no F establishes the causal direction of the effects.',
  'Le SS sequenziali dipendono dall’ordine dei termini quando il disegno non è bilanciato; in quel caso un software che riporta Type III può dare numeri diversi.':
    'Sequential SS depend on the order of the terms when the design is unbalanced; in that case software that reports Type III can give different numbers.',
  'Il modello è additivo a due fattori: non gestisce blocchi, covariate, misure ripetute o tre fattori.':
    'The model is a two-factor additive one: it does not handle blocks, covariates, repeated measures or three factors.',
  'Con celle singole la variabilità interna non è stimabile e il test non è calcolabile.':
    'With single-observation cells the within variability cannot be estimated and the test cannot be computed.',
  '{s1} × {s2}':
    '{s1} × {s2}',
  'ANOVA a due fattori':
    'Two-way ANOVA',
  '{s1} x {s2}{s3} · N = {s4}':
    '{s1} x {s2}{s3} · N = {s4}',
  ' · con interazione':
    ' · with interaction',
  ' · solo effetti principali':
    ' · main effects only',
  'η² parziale':
    'partial η²',
  'Le somme dei quadrati sono sequenziali (Type I) nell’ordine indicato: in un disegno bilanciato coincidono con le Type III.':
    'The sums of squares are sequential (Type I) in the order shown: in a balanced design they coincide with Type III.',
  'F = MS_effetto / MS_residui, con df residui = {s1} (N − numero di celle).':
    'F = MS_effect / MS_residual, with residual df = {s1} (N − number of cells).',
  'η² parziale = SS_effetto / (SS_effetto + SS_residui): quota di variabilità non spiegata dal resto del modello.':
    'Partial η² = SS_effect / (SS_effect + SS_residual): share of variability not explained by the rest of the model.',
  'Il modello spiega {s1} delle {s2} unità di SS totale; il resto sono i residui.':
    'The model explains {s1} of the {s2} units of total SS; the rest are the residuals.',
  'Medie per cella':
    'Means by cell',
  '{s1} combinazioni · {s2}':
    '{s1} combinations · {s2}',
  'disegno bilanciato':
    'balanced design',
  'disegno non bilanciato':
    'unbalanced design',
  'Media':
    'Mean',
  'Sono le medie che alimentano il grafico dell’interazione: se le linee non sono parallele, l’effetto di un fattore cambia a seconda del livello dell’altro.':
    'These are the means that feed the interaction plot: if the lines are not parallel, the effect of one factor changes with the level of the other.',
  'Medie marginali · {s1}':
    'Marginal means · {s1}',
  '{s1}\\\\u0000{s2}':
    '{s1}\\u0000{s2}',
  'Diagnostica del modello':
    'Model diagnostics',
  'R²':
    'R²',
  'quota di variabilità spiegata dal modello':
    'share of variability explained by the model',
  'R² aggiustato':
    'adjusted R²',
  'penalizza il numero di parametri':
    'penalises the number of parameters',
  'RMSE':
    'RMSE',
  'deviazione standard dei residui':
    'standard deviation of the residuals',
  'F = {s1}, df = {s2}, {s3}: {s4}':
    'F = {s1}, df = {s2}, {s3}: {s4}',
  'varianze non omogenee':
    'variances not homogeneous',
  'varianze compatibili':
    'compatible variances',
  'residui non normali: valuta la trasformazione':
    'non-normal residuals: consider the transformation',
  'residui compatibili con la normalità':
    'residuals compatible with normality',
  'Celle con N = 1':
    'Cells with N = 1',
  'una cella con una sola osservazione non permette di stimare la variabilità interna':
    'a cell with a single observation does not allow the within variability to be estimated',
  'Con una cella per combinazione il disegno non è stimabile: servono repliche.':
    'With one cell per combination the design cannot be estimated: replicates are needed.',
  'Livello di confidenza scelto: {s1}% (usato nel report).':
    'Chosen confidence level: {s1}% (used in the report).',
};
