/** English prose of the ordinal report and its tables. */
export const ordinalCopy: Record<string, string> = {
  'Report di regressione ordinale':
    'Ordinal regression report',
  'Modello a odds proporzionali su {s1} categorie e {s2} casi.':
    'Proportional odds model on {s1} categories and {s2} cases.',
  'Predittori associati all’esito':
    'Predictors associated with the outcome',
  'Nessun predittore significativo':
    'No significant predictor',
  'Predittori: {s1}.':
    'Predictors: {s1}.',
  '{s1} predittore/i spostano significativamente la probabilità verso le categorie più alte.':
    '{s1} predictor(s) significantly shift the probability towards the higher categories.',
  'Nessun predittore raggiunge la significatività al livello scelto.':
    'No predictor reaches significance at the chosen level.',
  'L’ipotesi di odds proporzionali assume che l’effetto di ogni predittore sia lo stesso su tutti i tagli: se non regge, servono modelli ordinali non proporzionali.':
    'The proportional odds assumption states that the effect of each predictor is the same across all cut points: if it fails, non-proportional ordinal models are needed.',
  'Con poche osservazioni per categoria le stime sono instabili.':
    'With few observations per category the estimates are unstable.',
  'Il modello assume categorie ordinate: l’ordine è quello alfabetico/numerico delle etichette.':
    'The model assumes ordered categories: the order is the alphabetical/numeric order of the labels.',
  'Modello ordinale':
    'Ordinal model',
  '{s1} categorie · {s2} casi · CI {s3}%':
    '{s1} categories · {s2} cases · CI {s3}%',
  'Categorie':
    'Categories',
  'Modello a odds proporzionali con link logit: l’effetto dei predittori è costante su tutti i tagli.':
    'Proportional odds model with logit link: the effect of the predictors is constant across all cut points.',
  'Le categorie sono ordinate alfabeticamente/numericamente in base alle etichette.':
    'The categories are ordered alphabetically/numerically by their labels.',
  'OR e CI':
    'OR and CI',
  'OR low':
    'OR low',
  'OR high':
    'OR high',
  'OR > 1 indica uno spostamento verso le categorie più alte.':
    'OR > 1 indicates a shift towards the higher categories.',
  'Soglie':
    'Thresholds',
  'Tagli tra categorie adiacenti':
    'Cut points between adjacent categories',
  'Taglio':
    'Cut point',
  'α':
    'α',
  'Le soglie sono in scala logit e devono restare ordinate.':
    'The thresholds are on the logit scale and must stay ordered.',
};
