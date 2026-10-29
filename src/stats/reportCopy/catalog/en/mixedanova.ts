/** English prose of the mixedanova report and its tables. */
export const mixedanovaCopy: Record<string, string> = {
  'Report ANOVA mista':
    'Mixed ANOVA report',
  'Fattore {s1}: F({s2}, {s3}) = {s4}, p = {s5}.':
    'Factor {s1}: F({s2}, {s3}) = {s4}, p = {s5}.',
  'Effetto between significativo':
    'Significant between effect',
  'Effetto between non significativo':
    'Non-significant between effect',
  '{s1} soggetti, {s2} gruppi, {s3} condizioni within.':
    '{s1} subjects, {s2} groups, {s3} within conditions.',
  'Within: F({s1}, {s2}) = {s3}, p = {s4}; interazione F({s5}, {s6}) = {s7}, p = {s8}.':
    'Within: F({s1}, {s2}) = {s3}, p = {s4}; interaction F({s5}, {s6}) = {s7}, p = {s8}.',
  'Sfericità: Mauchly p = {s1}, ε GG = {s2}; p corretti GG: tempo {s3}, interazione {s4}.':
    'Sphericity: Mauchly p = {s1}, GG ε = {s2}; GG-corrected p: time {s3}, interaction {s4}.',
  'Il fattore between confronta i gruppi sulle medie delle condizioni; il fattore within confronta le condizioni dentro soggetto.':
    'The between factor compares the groups on the condition means; the within factor compares the conditions within subject.',
  'L’interazione è significativa: l’effetto del tempo cambia tra i gruppi, quindi vanno lette le medie cella più che gli effetti principali.':
    'The interaction is significant: the effect of time changes between groups, so the cell means should be read rather than the main effects.',
  'L’interazione non è significativa: gli effetti principali sono interpretabili separatamente.':
    'The interaction is not significant: the main effects can be interpreted separately.',
  'Il modello assume sfericità per il fattore within con più di due livelli; la tabella riporta Mauchly, epsilon e p corrette GG.':
    'The model assumes sphericity for the within factor with more than two levels; the table reports Mauchly, epsilon and GG-corrected p.',
  'Le EM means marginali non pesate valgono {s1} come media complessiva; in caso di gruppi sbilanciati sono la lettura corretta degli effetti principali.':
    'The unweighted marginal EM means give {s1} as the overall mean; with unbalanced groups they are the correct reading of the main effects.',
  'Una sola osservazione per soggetto e condizione: nessun effetto casuale oltre al soggetto.':
    'A single observation per subject and condition: no random effect beyond the subject.',
  'Con gruppi sbilanciati l’ANOVA split-plot classica non è banale: qui è riportata la decomposizione standard.':
    'With unbalanced groups the classical split-plot ANOVA is not trivial: the standard decomposition is reported here.',
  'Medie cella':
    'Cell means',
  '{s1} gruppi × {s2} condizioni':
    '{s1} groups × {s2} conditions',
  'Fattore between: {s1}. Fattore within: condizioni selezionate.':
    'Between factor: {s1}. Within factor: selected conditions.',
  'Una riga per soggetto; ogni soggetto deve avere tutte le condizioni.':
    'One row per subject; each subject must have all the conditions.',
  'EM means (marginali non pesate)':
    'EM means (unweighted marginals)',
  'Stime bilanciate sui livelli dei fattori':
    'Estimates balanced over the factor levels',
  'Fattore':
    'Factor',
  'Livello':
    'Level',
  'EM mean':
    'EM mean',
  'Le EM means mediano i livelli dell’altro fattore con pesi uguali, quindi non coincidono con le medie grezze in un disegno sbilanciato.':
    'EM means average the levels of the other factor with equal weights, so they do not coincide with the raw means in an unbalanced design.',
  'Media marginale complessiva = {s1}.':
    'Overall marginal mean = {s1}.',
  'ANOVA mista split-plot':
    'Mixed split-plot ANOVA',
  'Fonte':
    'Source',
  'Il fattore between è testato sui soggetti within-groups; il fattore within e l’interazione sull’errore within.':
    'The between factor is tested on the within-group subjects; the within factor and the interaction on the within error.',
  'Con più di due condizioni within l’assunzione di sfericità è controllata nella tabella dedicata.':
    'With more than two within conditions the sphericity assumption is checked in the dedicated table.',
  'Sfericità e correzioni':
    'Sphericity and corrections',
  'Mauchly · CI {s1}%':
    'Mauchly · CI {s1}%',
  'Mauchly W':
    'Mauchly W',
  'Mauchly χ²':
    'Mauchly χ²',
  'p Mauchly':
    'Mauchly p',
  'GG epsilon':
    'GG epsilon',
  'HF epsilon':
    'HF epsilon',
  'p Time (GG)':
    'p Time (GG)',
  'p Group×Time (GG)':
    'p Group×Time (GG)',
  'Mauchly testa la sfericità della matrice di covarianza within.':
    'Mauchly tests the sphericity of the within covariance matrix.',
  'Le p corrette GG usano epsilon di Greenhouse–Geisser; con epsilon vicino a 1 la correzione è minima.':
    'The GG-corrected p values use the Greenhouse–Geisser epsilon; with epsilon close to 1 the correction is minimal.',
  'Contrasti pairwise (Holm)':
    'Pairwise contrasts (Holm)',
  'A':
    'A',
  'Confronti tra gruppi sulle medie marginali e tra condizioni within; p aggiustati con Holm.':
    'Comparisons between groups on the marginal means and between within conditions; p adjusted with Holm.',
};
