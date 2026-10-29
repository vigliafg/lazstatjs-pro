/** English prose of the ancova report and its tables. */
export const ancovaCopy: Record<string, string> = {
  'p interazione':
    'interaction p',
  '{s1} covariate':
    '{s1} covariates',
  'Report di lettura':
    'Reading report',
  'Le pendenze differiscono tra i gruppi: l’ANCOVA classica non è affidabile.':
    'The slopes differ between groups: the classical ANCOVA is not reliable.',
  'Il fattore {s1} ha un effetto dopo l’aggiustamento per {s2} (F = {s3}, p = {s4}).':
    'Factor {s1} has an effect after adjustment for {s2} (F = {s3}, p = {s4}).',
  'Nessun effetto del fattore {s1} dopo l’aggiustamento per {s2} (F = {s3}, p = {s4}).':
    'No effect of factor {s1} after adjustment for {s2} (F = {s3}, p = {s4}).',
  'Pendenze non omogenee':
    'Non-homogeneous slopes',
  'Effetto del fattore':
    'Effect of the factor',
  'Nessun effetto':
    'No effect',
  'L’ANCOVA confronta le medie dei gruppi dopo aver rimosso la parte di variabilità spiegata da una o più covariate continue.':
    'ANCOVA compares the group means after removing the part of the variability explained by one or more continuous covariates.',
  'Modello: {s1} + {s2}. Le medie aggiustate sono valutate al valore medio delle covariate.':
    'Model: {s1} + {s2}. Adjusted means are evaluated at the mean value of the covariates.',
  'La lettura dei risultati':
    'Reading the results',
  'Fattore {s1}: F({s2}, {s3}) = {s4}, p = {s5}; η²p = {s6} ({s7}).':
    'Factor {s1}: F({s2}, {s3}) = {s4}, p = {s5}; η²p = {s6} ({s7}).',
  'La media aggiustata più alta è quella di {s1} ({s2}); la media grezza dello stesso gruppo era {s3}.':
    'The highest adjusted mean is that of {s1} ({s2}); the raw mean of the same group was {s3}.',
  'Medie aggiustate non disponibili.':
    'Adjusted means not available.',
  'Covariate: {s1}.':
    'Covariates: {s1}.',
  '{s1} (F = {s2}, p = {s3})':
    '{s1} (F = {s2}, p = {s3})',
  'Nessuna covariata nel modello.':
    'No covariate in the model.',
  'Omogeneità delle pendenze: F({s1}, {s2}) = {s3}, p = {s4}. {s5}':
    'Homogeneity of slopes: F({s1}, {s2}) = {s3}, p = {s4}. {s5}',
  'df numeratore':
    'numerator df',
  'df denominatore':
    'denominator df',
  'F interazione':
    'interaction F',
  'L’ipotesi è violata: riporta il modello con interazione o analizza i gruppi separatamente.':
    'The assumption is violated: report the model with the interaction or analyse the groups separately.',
  'Non ci sono prove che le pendenze differiscano tra i gruppi.':
    'There is no evidence that the slopes differ between groups.',
  'Il test di omogeneità delle pendenze non è calcolabile (troppi pochi gradi di libertà).':
    'The homogeneity of slopes test cannot be computed (too few degrees of freedom).',
  'Restano richiesti indipendenza delle osservazioni, linearità della relazione con le covariate e normalità/omoschedasticità dei residui.':
    'Independence of observations, linearity of the relationship with the covariates and normality/homoscedasticity of the residuals are still required.',
  'Confronti tra gruppi':
    'Comparisons between groups',
  'Nessun confronto a coppie disponibile.':
    'No pairwise comparison available.',
  'Con correzione Holm risultano significativi: {s1}.':
    'With Holm correction these are significant: {s1}.',
  '{s1} (Δ = {s2}, p = {s3})':
    '{s1} (Δ = {s2}, p = {s3})',
  'Nessun confronto a coppie resta significativo dopo la correzione di Holm.':
    'No pairwise comparison remains significant after Holm correction.',
  'Le differenze sono calcolate sulle medie aggiustate, non sulle medie grezze.':
    'The differences are computed on the adjusted means, not on the raw means.',
  'Le covariate devono essere misurate prima del trattamento e non essere influenzate dal fattore.':
    'Covariates must be measured before the treatment and must not be influenced by the factor.',
  'Una covariata con forte errore di misura attenua l’aggiustamento e può ridurre la potenza.':
    'A covariate with a large measurement error weakens the adjustment and can reduce power.',
  'Le medie aggiustate dipendono dal valore medio delle covariate: con covariate molto sbilanciate l’estrapolazione può essere fragile.':
    'Adjusted means depend on the mean value of the covariates: with strongly unbalanced covariates the extrapolation can be fragile.',
  'L’ANCOVA non crea gruppi equivalenti: rimuove solo la parte di differenza lineare associata alle covariate osservate.':
    'ANCOVA does not create equivalent groups: it only removes the part of the difference linearly associated with the observed covariates.',
  'Un solo fattore categorico: per disegni fattoriali con covariate serve un modello più generale.':
    'A single categorical factor: factorial designs with covariates need a more general model.',
  'Nessuna selezione automatica del modello: tutte le covariate scelte restano nel modello.':
    'No automatic model selection: all the chosen covariates stay in the model.',
  'SS tipo III con codifica treatment: con interazioni il significato dei termini cambia.':
    'Type III SS with treatment coding: with interactions the meaning of the terms changes.',
  'Termine {s1}':
    'Term {s1}',
  '{s1} − {s2}':
    '{s1} − {s2}',
  'ANCOVA — effetti (SS tipo III)':
    'ANCOVA — effects (Type III SS)',
  '{s1} ~ {s2} + {s3} · N = {s4}':
    '{s1} ~ {s2} + {s3} · N = {s4}',
  'Sorgente':
    'Source',
  'SS':
    'SS',
  'df':
    'df',
  'MS':
    'MS',
  'η²p':
    'η²p',
  'SS tipo III: ogni termine è testato togliendolo dal modello completo (fattore e covariate insieme).':
    'Type III SS: each term is tested by removing it from the full model (factor and covariates together).',
  'Modello: F({s1}, {s2}) = {s3}, p = {s4} · R² = {s5}, R²adj = {s6}, RMSE = {s7}.':
    'Model: F({s1}, {s2}) = {s3}, p = {s4} · R² = {s5}, adj R² = {s6}, RMSE = {s7}.',
  'Medie aggiustate per gruppo':
    'Adjusted means by group',
  'valutate alla media delle covariate · CI {s1}%':
    'evaluated at the mean of the covariates · CI {s1}%',
  'Gruppo':
    'Group',
  'N':
    'N',
  'Media grezza':
    'Raw mean',
  'Media aggiustata':
    'Adjusted mean',
  'Media aggiustata = valore atteso del gruppo con tutte le covariate al loro valore medio.':
    'Adjusted mean = expected value of the group with all covariates at their mean value.',
  'La differenza tra media grezza e aggiustata mostra quanto pesa lo sbilanciamento delle covariate tra i gruppi.':
    'The difference between raw and adjusted mean shows how much covariate imbalance between groups weighs.',
  'Coefficienti del modello':
    'Model coefficients',
  'codifica treatment · riferimento: {s1}':
    'treatment coding · reference: {s1}',
  'Termine':
    'Term',
  'B':
    'B',
  't':
    't',
  'L’intercetta è la media aggiustata del gruppo di riferimento ({s1}).':
    'The intercept is the adjusted mean of the reference group ({s1}).',
  'I coefficienti dei gruppi sono differenze aggiustate rispetto al riferimento; quelli delle covariate sono pendenze comuni.':
    'Group coefficients are adjusted differences from the reference; covariate coefficients are common slopes.',
  'Omogeneità delle pendenze':
    'Homogeneity of slopes',
  '{s1} × covariate':
    '{s1} × covariates',
  '(k−1) × numero di covariate':
    '(k−1) × number of covariates',
  'residui del modello con interazioni':
    'residuals of the model with interactions',
  'p > α: pendenze compatibili':
    'p > α: compatible slopes',
  'Se l’interazione è significativa le pendenze differiscono tra i gruppi: l’ANCOVA classica non è appropriata.':
    'If the interaction is significant the slopes differ between groups: the classical ANCOVA is not appropriate.',
  'Il test confronta il modello completo con e senza tutti i prodotti gruppo × covariata.':
    'The test compares the full model with and without all group × covariate products.',
  'Confronti a coppie (medie aggiustate)':
    'Pairwise comparisons (adjusted means)',
  'correzione Holm':
    'Holm correction',
  'Confronto':
    'Comparison',
  'Differenza':
    'Difference',
  'p Holm':
    'p Holm',
  'Differenza = media aggiustata del primo gruppo − media aggiustata del secondo.':
    'Difference = adjusted mean of the first group − adjusted mean of the second.',
  'p non corretti da t con df = {s1}; la colonna Holm controlla il numero di confronti.':
    'Uncorrected p from t with df = {s1}; the Holm column controls for the number of comparisons.',
};
