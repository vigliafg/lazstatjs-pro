/** Prose française du rapport ANCOVA et de ses tableaux. */
export const ancovaCopy: Record<string, string> = {
  'p interazione': 'p interaction',
  '{s1} covariate': '{s1} covariables',
  'Report di lettura': 'Rapport de lecture',
  'Le pendenze differiscono tra i gruppi: l’ANCOVA classica non è affidabile.':
    'Les pentes diffèrent entre les groupes : l’ANCOVA classique n’est pas fiable.',
  'Il fattore {s1} ha un effetto dopo l’aggiustamento per {s2} (F = {s3}, p = {s4}).':
    'Le facteur {s1} a un effet après ajustement sur {s2} (F = {s3}, p = {s4}).',
  'Nessun effetto del fattore {s1} dopo l’aggiustamento per {s2} (F = {s3}, p = {s4}).':
    'Aucun effet du facteur {s1} après ajustement sur {s2} (F = {s3}, p = {s4}).',
  'Pendenze non omogenee': 'Pentes non homogènes',
  'Effetto del fattore': 'Effet du facteur',
  'Nessun effetto': 'Aucun effet',
  'L’ANCOVA confronta le medie dei gruppi dopo aver rimosso la parte di variabilità spiegata da una o più covariate continue.':
    'L’ANCOVA compare les moyennes des groupes après avoir retiré la part de variabilité expliquée par une ou plusieurs covariables continues.',
  'Modello: {s1} + {s2}. Le medie aggiustate sono valutate al valore medio delle covariate.':
    'Modèle : {s1} + {s2}. Les moyennes ajustées sont évaluées à la valeur moyenne des covariables.',
  'La lettura dei risultati': 'La lecture des résultats',
  'Fattore {s1}: F({s2}, {s3}) = {s4}, p = {s5}; η²p = {s6} ({s7}).':
    'Facteur {s1} : F({s2}, {s3}) = {s4}, p = {s5} ; η²p = {s6} ({s7}).',
  'La media aggiustata più alta è quella di {s1} ({s2}); la media grezza dello stesso gruppo era {s3}.':
    'La moyenne ajustée la plus élevée est celle de {s1} ({s2}) ; la moyenne brute de ce même groupe était {s3}.',
  'Medie aggiustate non disponibili.': 'Moyennes ajustées non disponibles.',
  'Covariate: {s1}.': 'Covariables : {s1}.',
  '{s1} (F = {s2}, p = {s3})': '{s1} (F = {s2}, p = {s3})',
  'Nessuna covariata nel modello.': 'Aucune covariables dans le modèle.',
  'Omogeneità delle pendenze: F({s1}, {s2}) = {s3}, p = {s4}. {s5}':
    'Homogénéité des pentes : F({s1}, {s2}) = {s3}, p = {s4}. {s5}',
  'df numeratore': 'dl numérateur',
  'df denominatore': 'dl dénominateur',
  'F interazione': 'F interaction',
  'L’ipotesi è violata: riporta il modello con interazione o analizza i gruppi separatamente.':
    'L’hypothèse est violée : rapportez le modèle avec interaction ou analysez les groupes séparément.',
  'Non ci sono prove che le pendenze differiscano tra i gruppi.':
    'Rien n’indique que les pentes diffèrent entre les groupes.',
  'Il test di omogeneità delle pendenze non è calcolabile (troppi pochi gradi di libertà).':
    'Le test d’homogénéité des pentes n’est pas calculable (trop peu de degrés de liberté).',
  'Restano richiesti indipendenza delle osservazioni, linearità della relazione con le covariate e normalità/omoschedasticità dei residui.':
    'L’indépendance des observations, la linéarité de la relation avec les covariables et la normalité/homoscédasticité des résidus restent exigées.',
  'Confronti tra gruppi': 'Comparaisons entre groupes',
  'Nessun confronto a coppie disponibile.': 'Aucune comparaison par paires disponible.',
  'Con correzione Holm risultano significativi: {s1}.':
    'Avec la correction de Holm, les comparaisons significatives sont : {s1}.',
  '{s1} (Δ = {s2}, p = {s3})': '{s1} (Δ = {s2}, p = {s3})',
  'Nessun confronto a coppie resta significativo dopo la correzione di Holm.':
    'Aucune comparaison par paires ne reste significative après la correction de Holm.',
  'Le differenze sono calcolate sulle medie aggiustate, non sulle medie grezze.':
    'Les différences sont calculées sur les moyennes ajustées, et non sur les moyennes brutes.',
  'Le covariate devono essere misurate prima del trattamento e non essere influenzate dal fattore.':
    'Les covariables doivent être mesurées avant le traitement et ne pas être influencées par le facteur.',
  'Una covariata con forte errore di misura attenua l’aggiustamento e può ridurre la potenza.':
    'Une covariables avec une forte erreur de mesure atténue l’ajustement et peut réduire la puissance.',
  'Le medie aggiustate dipendono dal valore medio delle covariate: con covariate molto sbilanciate l’estrapolazione può essere fragile.':
    'Les moyennes ajustées dépendent de la valeur moyenne des covariables : avec des covariables très déséquilibrées, l’extrapolation peut être fragile.',
  'L’ANCOVA non crea gruppi equivalenti: rimuove solo la parte di differenza lineare associata alle covariate osservate.':
    'L’ANCOVA ne crée pas de groupes équivalents : elle retire seulement la part de différence linéaire associée aux covariables observées.',
  'Un solo fattore categorico: per disegni fattoriali con covariate serve un modello più generale.':
    'Un seul facteur catégoriel : pour des plans factoriels avec covariables, il faut un modèle plus général.',
  'Nessuna selezione automatica del modello: tutte le covariate scelte restano nel modello.':
    'Aucune sélection automatique du modèle : toutes les covariables choisies restent dans le modèle.',
  'SS tipo III con codifica treatment: con interazioni il significato dei termini cambia.':
    'SS de type III avec codage par traitement : avec des interactions, le sens des termes change.',
  'Termine {s1}': 'Terme {s1}',
  '{s1} − {s2}': '{s1} − {s2}',
  'ANCOVA — effetti (SS tipo III)': 'ANCOVA — effets (SS de type III)',
  '{s1} ~ {s2} + {s3} · N = {s4}': '{s1} ~ {s2} + {s3} · N = {s4}',
  Sorgente: 'Source',
  SS: 'SS',
  df: 'dl',
  MS: 'MS',
  F: 'F',
  p: 'p',
  'η²p': 'η²p',
  'SS tipo III: ogni termine è testato togliendolo dal modello completo (fattore e covariate insieme).':
    'SS de type III : chaque terme est testé en le retirant du modèle complet (facteur et covariables ensemble).',
  'Modello: F({s1}, {s2}) = {s3}, p = {s4} · R² = {s5}, R²adj = {s6}, RMSE = {s7}.':
    'Modèle : F({s1}, {s2}) = {s3}, p = {s4} · R² = {s5}, R²aj = {s6}, RMSE = {s7}.',
  'Medie aggiustate per gruppo': 'Moyennes ajustées par groupe',
  'valutate alla media delle covariate · CI {s1}%':
    'évaluées à la moyenne des covariables · IC {s1} %',
  Gruppo: 'Groupe',
  N: 'N',
  'Media grezza': 'Moyenne brute',
  'Media aggiustata': 'Moyenne ajustée',
  SE: 'SE',
  'CI low': 'IC bas',
  'CI high': 'IC haut',
  'Media aggiustata = valore atteso del gruppo con tutte le covariate al loro valore medio.':
    'Moyenne ajustée = valeur attendue du groupe avec toutes les covariables à leur valeur moyenne.',
  'La differenza tra media grezza e aggiustata mostra quanto pesa lo sbilanciamento delle covariate tra i gruppi.':
    'La différence entre moyenne brute et moyenne ajustée montre le poids du déséquilibre des covariables entre les groupes.',
  'Coefficienti del modello': 'Coefficients du modèle',
  'codifica treatment · riferimento: {s1}':
    'codage par traitement · référence : {s1}',
  Termine: 'Terme',
  B: 'B',
  t: 't',
  'L’intercetta è la media aggiustata del gruppo di riferimento ({s1}).':
    'L’intercept est la moyenne ajustée du groupe de référence ({s1}).',
  'I coefficienti dei gruppi sono differenze aggiustate rispetto al riferimento; quelli delle covariate sono pendenze comuni.':
    'Les coefficients des groupes sont des différences ajustées par rapport à la référence ; ceux des covariables sont des pentes communes.',
  'Omogeneità delle pendenze': 'Homogénéité des pentes',
  Metrica: 'Métrique',
  Valore: 'Valeur',
  Dettaglio: 'Détail',
  '{s1} × covariate': '{s1} × covariables',
  '(k−1) × numero di covariate': '(k−1) × nombre de covariables',
  'residui del modello con interazioni': 'résidus du modèle avec interactions',
  'p > α: pendenze compatibili': 'p > α : pentes compatibles',
  'Se l’interazione è significativa le pendenze differiscono tra i gruppi: l’ANCOVA classica non è appropriata.':
    'Si l’interaction est significative, les pentes diffèrent entre les groupes : l’ANCOVA classique n’est pas appropriée.',
  'Il test confronta il modello completo con e senza tutti i prodotti gruppo × covariata.':
    'Le test compare le modèle complet avec et sans tous les produits groupe × covariables.',
  'Confronti a coppie (medie aggiustate)':
    'Comparaisons par paires (moyennes ajustées)',
  'correzione Holm': 'correction de Holm',
  Confronto: 'Comparaison',
  Differenza: 'Différence',
  'p Holm': 'p Holm',
  'Differenza = media aggiustata del primo gruppo − media aggiustata del secondo.':
    'Différence = moyenne ajustée du premier groupe − moyenne ajustée du second.',
  'p non corretti da t con df = {s1}; la colonna Holm controlla il numero di confronti.':
    'p non corrigées issues d’une loi t avec dl = {s1} ; la colonne Holm contrôle le nombre de comparaisons.',
};
