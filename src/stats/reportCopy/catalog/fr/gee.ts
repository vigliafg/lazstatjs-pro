/** Prose française du rapport GEE et de ses tableaux. */
export const geeCopy: Record<string, string> = {
  'Report GEE': 'Rapport GEE',
  'Modello {s1} con correlazione {s2} su {s3} cluster.':
    'Modèle {s1} avec corrélation {s2} sur {s3} grappes.',
  'Inferenza cluster-robusta': 'Inférence robuste par grappe',
  'Pochi cluster': 'Peu de grappes',
  'N = {s1}; dimensione massima cluster = {s2}.':
    'N = {s1} ; taille maximale de grappe = {s2}.',
  'Alpha = {s1}; phi = {s2}.': 'Alpha = {s1} ; phi = {s2}.',
  'GEE stima effetti marginali (population-averaged), non effetti condizionati al cluster come i modelli misti.':
    'GEE estime des effets marginaux (moyennés sur la population), et non des effets conditionnels à la grappe comme les modèles mixtes.',
  'Gli errori standard robusti tengono conto della correlazione dentro cluster; con pochi cluster sono instabili.':
    'Les erreurs standard robustes tiennent compte de la corrélation intra-grappe ; avec peu de grappes, elles sont instables.',
  'I coefficienti sono interpretabili come nel GLM corrispondente; il livello di confidenza è {s1}%.':
    'Les coefficients s’interprètent comme dans le GLM correspondant ; le niveau de confiance est de {s1} %.',
  'La correlazione di lavoro è exchangeable o independence, non AR(1) o non strutturata.':
    'La corrélation de travail est « exchangeable » ou « independence », pas AR(1) ni non structurée.',
  'Con meno di 10–15 cluster il sandwich può sottostimare l’errore.':
    'Avec moins de 10–15 grappes, l’estimateur sandwich peut sous-estimer l’erreur.',
  'GEE non fornisce previsioni specifiche per cluster né componenti di varianza.':
    'GEE ne fournit ni prévisions propres à chaque grappe ni composantes de variance.',
  GEE: 'GEE',
  '{s1} · {s2} · CI {s3}%': '{s1} · {s2} · IC {s3} %',
  Metrica: 'Métrique',
  Valore: 'Valeur',
  N: 'N',
  Cluster: 'Grappes',
  'Dimensione massima cluster': 'Taille maximale de grappe',
  'Alpha (correlazione di lavoro)': 'Alpha (corrélation de travail)',
  'Phi (dispersione)': 'Phi (dispersion)',
  Iterazioni: 'Itérations',
  'Gli errori standard sono robusti per cluster (sandwich), non model-based.':
    'Les erreurs standard sont robustes par grappe (sandwich), et non basées sur le modèle.',
  'La correlazione exchangeable assume la stessa correlazione tra tutte le coppie dentro cluster.':
    'La corrélation « exchangeable » suppose la même corrélation entre toutes les paires dans une grappe.',
  Coefficienti: 'Coefficients',
  'SE robusti per cluster': 'SE robustes par grappe',
  Termine: 'Terme',
  β: 'β',
  'SE robusto': 'SE robuste',
  z: 'z',
  p: 'p',
  'exp(β)': 'exp(β)',
  'CI low': 'IC bas',
  'CI high': 'IC haut',
  'Per la famiglia binomiale exp(β) è l’odds ratio; per la gaussiana è un rapporto di medie.':
    'Pour la famille binomiale, exp(β) est l’odds ratio ; pour la gaussienne, c’est un rapport de moyennes.',
};
