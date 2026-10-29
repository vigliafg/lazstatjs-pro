/** Prose française du rapport de régression de comptages et de ses tableaux. */
export const countregCopy: Record<string, string> = {
  'Report di regressione per conteggi': 'Rapport de régression pour comptages',
  'Modello di Poisson su {s1} osservazioni; dispersione {s2}.':
    'Modèle de Poisson sur {s1} observations ; dispersion {s2}.',
  'Modello binomiale negativo su {s1} osservazioni (θ = {s2}).':
    'Modèle binomial négatif sur {s1} observations (θ = {s2}).',
  'Overdispersion da valutare': 'Surdispersion à évaluer',
  'Modello stimato': 'Modèle estimé',
  'LR vs modello nullo: χ² = {s1}, p = {s2}.':
    'LR vs modèle nul : χ² = {s1}, p = {s2}.',
  'Il primo predittore ha IRR = {s1} (CI {s2}%: {s3} – {s4}).':
    'Le premier prédicteur a IRR = {s1} (IC {s2} % : {s3} – {s4}).',
  '{s1} predittore/i risultano significativi al livello scelto.':
    '{s1} prédicteur(s) sont significatifs au seuil choisi.',
  'Nessun predittore risulta significativo al livello scelto.':
    'Aucun prédicteur n’est significatif au seuil choisi.',
  'IRR > 1 indica un tasso atteso più alto per un’unità in più del predittore; IRR < 1 un tasso più basso.':
    'IRR > 1 indique un taux attendu plus élevé pour une unité de plus du prédicteur ; IRR < 1 un taux plus faible.',
  'La dispersione è chiaramente sopra 1: il Poisson sottostima l’errore. Usa la negative binomiale.':
    'La dispersion est nettement supérieure à 1 : le modèle de Poisson sous-estime l’erreur. Utilisez la binomiale négative.',
  'La dispersione è compatibile con il modello scelto.':
    'La dispersion est compatible avec le modèle choisi.',
  'La regressione per conteggi assume osservazioni indipendenti e una relazione log-lineare.':
    'La régression de comptages suppose des observations indépendantes et une relation log-linéaire.',
  'Con molti zeri può servire un modello zero-inflated, non disponibile.':
    'Avec beaucoup de zéros, un modèle à inflation de zéros pourrait être nécessaire, mais il n’est pas disponible.',
  'Sintesi del modello': 'Synthèse du modèle',
  'Negative binomial (θ = {s1})': 'Binomiale négative (θ = {s1})',
  Metrica: 'Métrique',
  Valore: 'Valeur',
  N: 'N',
  Predittori: 'Prédicteurs',
  Deviance: 'Déviance',
  'df residui': 'dl résiduels',
  'Dispersione (Pearson/df)': 'Dispersion (Pearson/dl)',
  'Log-verosimiglianza': 'Log-vraisemblance',
  'LR vs nullo': 'LR vs nul',
  'p LR': 'p LR',
  AIC: 'AIC',
  BIC: 'BIC',
  'Conteggi non interi': 'Comptages non entiers',
  'Poisson assume varianza = media. Dispersione > 1 indica overdispersion: meglio negative binomial.':
    'Poisson suppose une variance égale à la moyenne. Une dispersion > 1 indique une surdispersion : préférez la binomiale négative.',
  'Il test LR confronta il modello con l’intercetta sola.':
    'Le test LR compare le modèle au modèle avec l’intercept seul.',
  Coefficienti: 'Coefficients',
  'IRR e CI {s1}%': 'IRR et IC {s1} %',
  Termine: 'Terme',
  β: 'β',
  SE: 'SE',
  z: 'z',
  p: 'p',
  IRR: 'IRR',
  'IRR low': 'IRR bas',
  'IRR high': 'IRR haut',
  'IRR = exp(β): moltiplicatore del tasso atteso per un’unità in più del predittore.':
    'IRR = exp(β) : multiplicateur du taux attendu pour une unité de plus du prédicteur.',
  'p da z normale; con dispersione stimata i test sono approssimati.':
    'p à partir de z normal ; avec une dispersion estimée, les tests sont approchés.',
};
