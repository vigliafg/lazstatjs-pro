/** English prose of the gee report and its tables. */
export const geeCopy: Record<string, string> = {
  'Report GEE':
    'GEE report',
  'Modello {s1} con correlazione {s2} su {s3} cluster.':
    '{s1} model with {s2} correlation on {s3} clusters.',
  'Inferenza cluster-robusta':
    'Cluster-robust inference',
  'Pochi cluster':
    'Few clusters',
  'N = {s1}; dimensione massima cluster = {s2}.':
    'N = {s1}; maximum cluster size = {s2}.',
  'Alpha = {s1}; phi = {s2}.':
    'Alpha = {s1}; phi = {s2}.',
  'GEE stima effetti marginali (population-averaged), non effetti condizionati al cluster come i modelli misti.':
    'GEE estimates marginal (population-averaged) effects, not effects conditional on the cluster like mixed models.',
  'Gli errori standard robusti tengono conto della correlazione dentro cluster; con pochi cluster sono instabili.':
    'Robust standard errors account for within-cluster correlation; with few clusters they are unstable.',
  'I coefficienti sono interpretabili come nel GLM corrispondente; il livello di confidenza è {s1}%.':
    'The coefficients are interpreted as in the corresponding GLM; the confidence level is {s1}%.',
  'La correlazione di lavoro è exchangeable o independence, non AR(1) o non strutturata.':
    'The working correlation is exchangeable or independence, not AR(1) or unstructured.',
  'Con meno di 10–15 cluster il sandwich può sottostimare l’errore.':
    'With fewer than 10–15 clusters the sandwich can underestimate the error.',
  'GEE non fornisce previsioni specifiche per cluster né componenti di varianza.':
    'GEE gives no cluster-specific predictions and no variance components.',
  'GEE':
    'GEE',
  '{s1} · {s2} · CI {s3}%':
    '{s1} · {s2} · CI {s3}%',
  'Cluster':
    'Cluster',
  'Dimensione massima cluster':
    'Maximum cluster size',
  'Alpha (correlazione di lavoro)':
    'Alpha (working correlation)',
  'Phi (dispersione)':
    'Phi (dispersion)',
  'Gli errori standard sono robusti per cluster (sandwich), non model-based.':
    'The standard errors are cluster-robust (sandwich), not model-based.',
  'La correlazione exchangeable assume la stessa correlazione tra tutte le coppie dentro cluster.':
    'Exchangeable correlation assumes the same correlation between all pairs within a cluster.',
  'SE robusti per cluster':
    'Cluster-robust SEs',
  'SE robusto':
    'Robust SE',
  'exp(β)':
    'exp(β)',
  'Per la famiglia binomiale exp(β) è l’odds ratio; per la gaussiana è un rapporto di medie.':
    'For the binomial family exp(β) is the odds ratio; for the Gaussian family it is a ratio of means.',
};
