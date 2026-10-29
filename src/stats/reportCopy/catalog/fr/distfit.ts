/** Prose française du rapport d’ajustement de distribution et de ses tableaux. */
export const distfitCopy: Record<string, string> = {
  'non calcolabile': 'non calculable',
  'praticamente equivalente': 'pratiquement équivalent',
  'moderatamente migliore': 'modérément meilleur',
  'chiaramente migliore': 'nettement meilleur',
  'Report di lettura': 'Rapport de lecture',
  'Nessuna distribuzione stimabile con questi dati.':
    'Aucune distribution estimable avec ces données.',
  'Fit non disponibile': 'Ajustement non disponible',
  'Servono almeno tre valori e, per le distribuzioni a supporto positivo, tutti i valori maggiori di zero.':
    'Il faut au moins trois valeurs et, pour les distributions à support positif, toutes les valeurs supérieures à zéro.',
  'La distribuzione che descrive meglio i dati è la {s1} (AIC = {s2}).':
    'La distribution qui décrit le mieux les données est la {s1} (AIC = {s2}).',
  'Distribuzione stimata': 'Distribution estimée',
  'Il fitting cerca la distribuzione teorica che rende più plausibile il campione osservato, e serve per descrivere la variabile, stimare percentili e alimentare carte di controllo o analisi di affidabilità.':
    'L’ajustement cherche la distribution théorique qui rend l’échantillon observé le plus plausible ; il sert à décrire la variable, à estimer des percentiles et à alimenter des cartes de contrôle ou des analyses de fiabilité.',
  'La scelta qui è guidata dall’AIC, che premia l’adattamento e penalizza i parametri in più. La {s1} ha AIC = {s2}{s3}.':
    'Le choix est ici guidé par l’AIC, qui récompense l’ajustement et pénalise les paramètres supplémentaires. La {s1} a un AIC = {s2}{s3}.',
  ', {s1} della seconda ({s2}, ΔAIC = {s3})':
    ', {s1} de la seconde ({s2}, ΔAIC = {s3})',
  'I parametri stimati': 'Les paramètres estimés',
  'Parametri: {s1}. Sono stime di massima verosimiglianza, non medie campionarie.':
    'Paramètres : {s1}. Ce sont des estimations de maximum de vraisemblance, pas des moyennes d’échantillon.',
  'Log-verosimiglianza = {s1}: valore assoluto poco interpretabile, utile solo per confrontare modelli.':
    'Log-vraisemblance = {s1} : valeur absolue peu interprétable, utile seulement pour comparer des modèles.',
  'KS D = {s1} (p indicativo {s2}): {s3}.':
    'KS D = {s1} (p indicative {s2}) : {s3}.',
  'la distribuzione non è un buon adattamento ai dati':
    'la distribution ne s’ajuste pas bien aux données',
  'non c’è evidenza contraria all’adattamento':
    'aucune preuve ne s’oppose à l’ajustement',
  'La bontà di adattamento non è calcolabile.':
    'La qualité d’ajustement n’est pas calculable.',
  'Cosa ci fai con questa distribuzione':
    'Ce que vous pouvez faire avec cette distribution',
  'Mediana stimata: {s1}.': 'Médiane estimée : {s1}.',
  '95° percentile stimato: {s1} (il 5% delle osservazioni dovrebbe superarlo).':
    '95e percentile estimé : {s1} (5 % des observations devraient le dépasser).',
  'Puoi usarla per definire limiti di specifica, stimare la probabilità di superare una soglia o generare dati simulati coerenti.':
    'Vous pouvez l’utiliser pour définir des limites de spécification, estimer la probabilité de dépasser un seuil ou générer des données simulées cohérentes.',
  'Come leggere il confronto': 'Comment lire la comparaison',
  'L’AIC non dice che la distribuzione scelta sia “vera”: dice che è la meno peggiore tra quelle provate. Se le prime due sono a meno di 2 punti, i dati non distinguono tra loro e la scelta va fatta con criteri esterni (supporto, comportamento delle code, semplicità).':
    'L’AIC ne dit pas que la distribution choisie soit « vraie » : il dit qu’elle est la moins mauvaise parmi celles essayées. Si les deux premières sont à moins de 2 points, les données ne les distinguent pas et le choix doit se faire sur des critères externes (support, comportement des queues, simplicité).',
  'Assunzioni e cautele': 'Hypothèses et précautions',
  'Le osservazioni devono essere indipendenti e provenire dalla stessa popolazione.':
    'Les observations doivent être indépendantes et provenir de la même population.',
  'Le distribuzioni a supporto positivo (lognormale, esponenziale, gamma, Weibull) richiedono valori > 0; i valori nulli o negativi le escludono.':
    'Les distributions à support positif (lognormale, exponentielle, gamma, Weibull) exigent des valeurs > 0 ; les valeurs nulles ou négatives les excluent.',
  'Con N piccolo le stime delle code sono instabili: i percentili estremi vanno riportati con prudenza.':
    'Avec un petit N, les estimations des queues sont instables : les percentiles extrêmes doivent être rapportés avec prudence.',
  'Un buon AIC non compensa un disegno di campionamento distorto.':
    'Un bon AIC ne compense pas un plan d’échantillonnage biaisé.',
  'Il p-value del test KS è calcolato con la formula asintotica e non corregge per i parametri stimati: è indicativo, non definitivo.':
    'La valeur p du test KS est calculée avec la formule asymptotique et ne corrige pas pour les paramètres estimés : elle est indicative, pas définitive.',
  'Non sono inclusi modelli con dati censurati (Weibull su dati di sopravvivenza troncati).':
    'Les modèles avec données censurées ne sont pas inclus (Weibull sur des données de survie tronquées).',
  'Il livello di confidenza scelto ({s1}%) non si applica ai percentili stimati da una distribuzione fittata.':
    'Le niveau de confiance choisi ({s1} %) ne s’applique pas aux percentiles estimés à partir d’une distribution ajustée.',
  '{s1} = {s2}': '{s1} = {s2}',
  'Distribuzioni stimate': 'Distributions estimées',
  'ordinamento per AIC · N = {s1}': 'tri par AIC · N = {s1}',
  Distribuzione: 'Distribution',
  'Parametri (MLE)': 'Paramètres (MLE)',
  'Log-verosimiglianza': 'Log-vraisemblance',
  Parametri: 'Paramètres',
  AIC: 'AIC',
  BIC: 'BIC',
  'Le stime sono di massima verosimiglianza (MLE): scelgono i parametri che rendono i dati osservati più probabili.':
    'Les estimations sont de maximum de vraisemblance (MLE) : elles choisissent les paramètres qui rendent les données observées les plus probables.',
  'AIC = 2k − 2·logL: più basso è, meglio la distribuzione spiega i dati tenendo conto del numero di parametri.':
    'AIC = 2k − 2·logL : plus il est bas, mieux la distribution explique les données compte tenu du nombre de paramètres.',
  'Confronta solo le righe con la stessa AIC (stesso dataset): le differenze sotto 2 sono trascurabili, sopra 10 sono nette.':
    'Ne comparez que des lignes avec le même AIC (même jeu de données) : les différences inférieures à 2 sont négligeables, au-delà de 10 elles sont nettes.',
  'Bontà di adattamento': 'Qualité d’ajustement',
  'KS = Kolmogorov–Smirnov · AD = Anderson–Darling':
    'KS = Kolmogorov–Smirnov · AD = Anderson–Darling',
  'KS D': 'KS D',
  'p KS (indicativo)': 'p KS (indicative)',
  'AD A²': 'AD A²',
  'Il p del KS è asintotico e non corretto per i parametri stimati: tende a essere ottimistico, usalo come indicazione.':
    'La p du KS est asymptotique et non corrigée pour les paramètres estimés : elle tend à être optimiste, utilisez-la comme indication.',
  'KS misura la distanza massima tra la cumulata empirica e quella teorica; AD dà più peso alle code.':
    'KS mesure la distance maximale entre la fonction de répartition empirique et la théorique ; AD donne plus de poids aux queues.',
  'Percentili della distribuzione migliore ({s1})':
    'Percentiles de la meilleure distribution ({s1})',
  'CI {s1}% non applicabile ai percentili stimati':
    'IC {s1} % non applicable aux percentiles estimés',
  Percentile: 'Percentile',
  'Valore stimato': 'Valeur estimée',
  'P{s1}': 'P{s1}',
  'I percentili sono quelli della distribuzione stimata, non i percentili osservati.':
    'Les percentiles sont ceux de la distribution estimée, et non les percentiles observés.',
  'Con N piccolo le code sono le più incerte: evita di leggere P1 o P99 come limiti affidabili.':
    'Avec un petit N, les queues sont les plus incertaines : évitez de lire P1 ou P99 comme des limites fiables.',
};
