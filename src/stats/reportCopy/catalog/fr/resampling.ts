/** Prose française du rapport de rééchantillonnage et de ses tableaux. */
export const resamplingCopy: Record<string, string> = {
  'Report di resampling': 'Rapport de rééchantillonnage',
  'Differenza {s1} = {s2}; permutazione p = {s3}.':
    'Différence {s1} = {s2} ; p de permutation = {s3}.',
  'delle medie': 'des moyennes',
  'delle mediane': 'des médianes',
  'Differenza oltre il caso': 'Différence au-delà du hasard',
  'Differenza compatibile con il caso': 'Différence compatible avec le hasard',
  'Gruppi: {s1} (N = {s2}) e {s3} (N = {s4}).':
    'Groupes : {s1} (N = {s2}) et {s3} (N = {s4}).',
  'CI bootstrap {s1}%: {s2} – {s3}.':
    'IC bootstrap {s1} % : {s2} – {s3}.',
  'La permutazione rimescola le etichette di gruppo: se la differenza osservata è rara sotto rimescolamento, l’associazione con il gruppo è difficile da spiegare con il caso.':
    'La permutation mélange les étiquettes de groupe : si la différence observée est rare sous mélange, l’association avec le groupe est difficile à expliquer par le hasard.',
  'Il CI bootstrap non contiene lo zero: la direzione della differenza è coerente, ma il p e il CI rispondono a domande leggermente diverse.':
    'L’IC bootstrap ne contient pas zéro : la direction de la différence est cohérente, mais la p et l’IC répondent à des questions légèrement différentes.',
  'Il CI bootstrap contiene lo zero: la differenza osservata è compatibile con il caso.':
    'L’IC bootstrap contient zéro : la différence observée est compatible avec le hasard.',
  'Permutazione e bootstrap assumono scambiabilità tra gruppi e osservazioni indipendenti.':
    'La permutation et le bootstrap supposent l’échangeabilité entre groupes et des observations indépendantes.',
  'Con gruppi molto piccoli il p minimo raggiungibile è limitato dal numero di permutazioni.':
    'Avec des groupes très petits, la p minimale atteignable est limitée par le nombre de permutations.',
  'Statistiche per gruppo': 'Statistiques par groupe',
  'Differenza di medie': 'Différence de moyennes',
  'Differenza di mediane': 'Différence de médianes',
  Gruppo: 'Groupe',
  N: 'N',
  Statistica: 'Statistique',
  'Differenza osservata ({s1} − {s2}): {s3}.':
    'Différence observée ({s1} − {s2}) : {s3}.',
  'Inferenza di resampling': 'Inférence par rééchantillonnage',
  '{s1} permutazioni · {s2} bootstrap · CI {s3}%':
    '{s1} permutations · {s2} bootstrap · IC {s3} %',
  Metrica: 'Métrique',
  Valore: 'Valeur',
  'Differenza osservata': 'Différence observée',
  'p permutation (due code)': 'p de permutation (bilatérale)',
  'CI bootstrap low': 'IC bootstrap bas',
  'CI bootstrap high': 'IC bootstrap haut',
  'Il p di permutazione non assume normalità: confronta la differenza osservata con la distribuzione sotto etichette casuali.':
    'La p de permutation ne suppose pas la normalité : elle compare la différence observée à la distribution sous étiquettes aléatoires.',
  'Il CI bootstrap percentile ricampiona dentro ciascun gruppo; con pochi casi può essere instabile.':
    'L’IC bootstrap par percentiles rééchantillonne à l’intérieur de chaque groupe ; avec peu de cas, il peut être instable.',
};
