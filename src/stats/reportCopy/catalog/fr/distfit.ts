/** fr: report and table prose (normalised). */
export const distfitCopy: Record<string, string> = {
  ', {s1} della seconda ({s2}, ΔAIC = {s3})':
    ', {s1} de la seconde ({s2}, ΔAIC = {s3})',
  '{s1} = {s2}':
    '{s1} = {s2}',
  '95° percentile stimato: {s1} (il 5% delle osservazioni dovrebbe superarlo).':
    '95e percentile estimé : {s1} (5 % des observations devraient le dépasser).',
  'AD A²':
    'AD A²',
  'AIC':
    'AIC',
  'AIC = 2k − 2·logL: più basso è, meglio la distribuzione spiega i dati tenendo conto del numero di parametri.':
    'AIC = 2k − 2·logL : plus il est bas, mieux la distribution explique les données compte tenu du nombre de paramètres.',
  'Assunzioni e cautele':
    'Hypothèses et précautions',
  'BIC':
    'BIC',
  'Bontà di adattamento':
    'Qualité d’ajustement',
  'chiaramente migliore':
    'nettement meilleur',
  'CI {s1}% non applicabile ai percentili stimati':
    'IC {s1} % non applicable aux percentiles estimés',
  'Come leggere il confronto':
    'Comment lire la comparaison',
  'Con N piccolo le code sono le più incerte: evita di leggere P1 o P99 come limiti affidabili.':
    'Avec un petit N, les queues sont les plus incertaines : évitez de lire P1 ou P99 comme des limites fiables.',
  'Con N piccolo le stime delle code sono instabili: i percentili estremi vanno riportati con prudenza.':
    'Avec un petit N, les estimations des queues sont instables : les percentiles extrêmes doivent être rapportés avec prudence.',
  'Confronta solo le righe con la stessa AIC (stesso dataset): le differenze sotto 2 sono trascurabili, sopra 10 sono nette.':
    'Ne comparez que des lignes avec le même AIC (même jeu de données) : les différences inférieures à 2 sont négligeables, au-delà de 10 elles sont nettes.',
  'Cosa ci fai con questa distribuzione':
    'Ce que vous pouvez faire avec cette distribution',
  'Distribuzione':
    'Distribution',
  'Distribuzione stimata':
    'Distribution estimée',
  'Distribuzioni stimate':
    'Distributions estimées',
  'Fit non disponibile':
    'Ajustement non disponible',
  'I parametri stimati':
    'Les paramètres estimés',
  'I percentili sono quelli della distribuzione stimata, non i percentili osservati.':
    'Les percentiles sont ceux de la distribution estimée, et non les percentiles observés.',
  'Il fitting cerca la distribuzione teorica che rende più plausibile il campione osservato, e serve per descrivere la variabile, stimare percentili e alimentare carte di controllo o analisi di affidabilità.':
    'L’ajustement cherche la distribution théorique qui rend l’échantillon observé le plus plausible ; il sert à décrire la variable, à estimer des percentiles et à alimenter des cartes de contrôle ou des analyses de fiabilité.',
  'Il livello di confidenza scelto ({s1}%) non si applica ai percentili stimati da una distribuzione fittata.':
    'Le niveau de confiance choisi ({s1} %) ne s’applique pas aux percentiles estimés à partir d’une distribution ajustée.',
  'Il p del KS è asintotico e non corretto per i parametri stimati: tende a essere ottimistico, usalo come indicazione.':
    'La p du KS est asymptotique et non corrigée pour les paramètres estimés : elle tend à être optimiste, utilisez-la comme indication.',
  'Il p-value del test KS è calcolato con la formula asintotica e non corregge per i parametri stimati: è indicativo, non definitivo.':
    'La valeur p du test KS est calculée avec la formule asymptotique et ne corrige pas pour les paramètres estimés : elle est indicative, pas définitive.',
  'KS = Kolmogorov–Smirnov · AD = Anderson–Darling':
    'KS = Kolmogorov–Smirnov · AD = Anderson–Darling',
  'KS D':
    'KS D',
  'KS D = {s1} (p indicativo {s2}): {s3}.':
    'KS D = {s1} (p indicative {s2}) : {s3}.',
  'KS misura la distanza massima tra la cumulata empirica e quella teorica; AD dà più peso alle code.':
    'KS mesure la distance maximale entre la fonction de répartition empirique et la théorique ; AD donne plus de poids aux queues.',
  'L’AIC non dice che la distribuzione scelta sia “vera”: dice che è la meno peggiore tra quelle provate. Se le prime due sono a meno di 2 punti, i dati non distinguono tra loro e la scelta va fatta con criteri esterni (supporto, comportamento delle code, semplicità).':
    'L’AIC ne dit pas que la distribution choisie soit « vraie » : il dit qu’elle est la moins mauvaise parmi celles essayées. Si les deux premières sont à moins de 2 points, les données ne les distinguent pas et le choix doit se faire sur des critères externes (support, comportement des queues, simplicité).',
  'La bontà di adattamento non è calcolabile.':
    'La qualité d’ajustement n’est pas calculable.',
  'La distribuzione che descrive meglio i dati è la {s1} (AIC = {s2}).':
    'La distribution qui décrit le mieux les données est la {s1} (AIC = {s2}).',
  'la distribuzione non è un buon adattamento ai dati':
    'la distribution ne s’ajuste pas bien aux données',
  'La scelta qui è guidata dall’AIC, che premia l’adattamento e penalizza i parametri in più. La {s1} ha AIC = {s2}{s3}.':
    'Le choix est ici guidé par l’AIC, qui récompense l’ajustement et pénalise les paramètres supplémentaires. La {s1} a un AIC = {s2}{s3}.',
  'Le distribuzioni a supporto positivo (lognormale, esponenziale, gamma, Weibull) richiedono valori > 0; i valori nulli o negativi le escludono.':
    'Les distributions à support positif (lognormale, exponentielle, gamma, Weibull) exigent des valeurs > 0 ; les valeurs nulles ou négatives les excluent.',
  'Le osservazioni devono essere indipendenti e provenire dalla stessa popolazione.':
    'Les observations doivent être indépendantes et provenir de la même population.',
  'Le stime sono di massima verosimiglianza (MLE): scelgono i parametri che rendono i dati osservati più probabili.':
    'Les estimations sont de maximum de vraisemblance (MLE) : elles choisissent les paramètres qui rendent les données observées les plus probables.',
  'Log-verosimiglianza':
    'Log-vraisemblance',
  'Log-verosimiglianza = {s1}: valore assoluto poco interpretabile, utile solo per confrontare modelli.':
    'Log-vraisemblance = {s1} : valeur absolue peu interprétable, utile seulement pour comparer des modèles.',
  'Mediana stimata: {s1}.':
    'Médiane estimée : {s1}.',
  'moderatamente migliore':
    'modérément meilleur',
  'Nessuna distribuzione stimabile con questi dati.':
    'Aucune distribution estimable avec ces données.',
  'non c’è evidenza contraria all’adattamento':
    'aucune preuve ne s’oppose à l’ajustement',
  'non calcolabile':
    'non calculable',
  'Non sono inclusi modelli con dati censurati (Weibull su dati di sopravvivenza troncati).':
    'Les modèles avec données censurées ne sont pas inclus (Weibull sur des données de survie tronquées).',
  'ordinamento per AIC · N = {s1}':
    'tri par AIC · N = {s1}',
  'p KS (indicativo)':
    'p KS (indicative)',
  'P{s1}':
    'P{s1}',
  'Parametri':
    'Paramètres',
  'Parametri (MLE)':
    'Paramètres (MLE)',
  'Parametri: {s1}. Sono stime di massima verosimiglianza, non medie campionarie.':
    'Paramètres : {s1}. Ce sont des estimations de maximum de vraisemblance, pas des moyennes d’échantillon.',
  'Percentile':
    'Percentile',
  'Percentili della distribuzione migliore ({s1})':
    'Percentiles de la meilleure distribution ({s1})',
  'praticamente equivalente':
    'pratiquement équivalent',
  'Puoi usarla per definire limiti di specifica, stimare la probabilità di superare una soglia o generare dati simulati coerenti.':
    'Vous pouvez l’utiliser pour définir des limites de spécification, estimer la probabilité de dépasser un seuil ou générer des données simulées cohérentes.',
  'Report di lettura':
    'Rapport de lecture',
  'Servono almeno tre valori e, per le distribuzioni a supporto positivo, tutti i valori maggiori di zero.':
    'Il faut au moins trois valeurs et, pour les distributions à support positif, toutes les valeurs supérieures à zéro.',
  'Un buon AIC non compensa un disegno di campionamento distorto.':
    'Un bon AIC ne compense pas un plan d’échantillonnage biaisé.',
  'Valore stimato':
    'Valeur estimée',
  'A differenza di un test sulla media, non richiede la normalità: descrive tutta la distribuzione, non solo il centro.':
    'Contrairement à un test sur la moyenne, il n’exige pas la normalité : il décrit toute la distribution, pas seulement le centre.',
  'Asymptotic':
    'Asymptotique',
  'Con molti valori uguali il p è approssimato: i ranghi con ties riducono la precisione.':
    'Avec beaucoup de valeurs égales p est approximatif : les rangs ex æquo réduisent la précision.',
  'D':
    'D',
  'D = {s1}: la massima distanza verticale tra le due distribuzioni cumulative.':
    'D = {s1} : la distance verticale maximale entre les deux distributions cumulées.',
  'D = {s1}; p = {s2} ({s3}).':
    'D = {s1} ; p = {s2} ({s3}).',
  'D è la distanza verticale massima tra le due curve: 0 significa distribuzioni identiche, 1 nessuna sovrapposizione.':
    'D est la distance verticale maximale entre les deux courbes : 0 signifie des distributions identiques, 1 aucun chevauchement.',
  'Distanza massima tra {s1} e {s2} per {s3}: {s4} (p = {s5}).':
    'Distance maximale entre {s1} et {s2} pour {s3} : {s4} (p = {s5}).',
  'Exact':
    'Exact',
  'Group':
    'Groupe',
  'I due campioni devono essere indipendenti.':
    'Les deux échantillons doivent être indépendants.',
  'Il p esatto enumera i ranghi possibili; con campioni grandi si usa l’approssimazione di Kolmogorov.':
    'Le p exact énumère les rangs possibles ; avec de grands échantillons l’approximation de Kolmogorov est utilisée.',
  'Il p è {s1}.':
    'p est {s1}.',
  'Il test bilaterale confronta le due distribuzioni cumulative: un p piccolo indica che non provengono dalla stessa popolazione.':
    'Le test bilatéral compare les deux distributions cumulées : un p petit indique qu’elles ne proviennent pas de la même population.',
  'Il test di Kolmogorov–Smirnov confronta le due distribuzioni cumulative: è sensibile a differenze di posizione, dispersione e forma.':
    'Le test de Kolmogorov–Smirnov compare les deux distributions cumulées : il est sensible aux différences de position, de dispersion et de forme.',
  'Il test è bilaterale: rifiuta sia uno spostamento sia una differenza di forma.':
    'Le test est bilatéral : il rejette aussi bien un décalage qu’une différence de forme.',
  'Kolmogorov–Smirnov (due campioni)':
    'Kolmogorov–Smirnov (deux échantillons)',
  'Method':
    'Méthode',
  'Report di lettura — Kolmogorov–Smirnov':
    'Rapport de lecture — Kolmogorov–Smirnov',
  'Statistica e p-value':
    'Statistique et p-value',
  'Un p piccolo non dice quale aspetto differisca: guarda le due curve cumulative.':
    'Un p petit ne dit pas quel aspect diffère : regardez les deux courbes cumulées.',
  'asintotico':
    'asymptotique',
  'asintotico (serie di Kolmogorov)':
    'asymptotique (série de Kolmogorov)',
  'esatto':
    'exact',
  'esatto (enumerazione dei ranghi)':
    'exact (énumération des rangs)',
  '{s1}: {s2} osservazioni; {s3}: {s4} osservazioni.':
    '{s1} : {s2} observations ; {s3} : {s4} observations.',
  'Cramér–von Mises W²': 'Cramér–von Mises W²',
  'CvM è una distanza quadratica media tra le due cumulate: meno sensibile al singolo punto peggiore rispetto a KS, più stabile con N piccolo.': 'CvM est une distance quadratique moyenne entre les deux cumulées : moins sensible au point le plus mauvais que KS et plus stable pour un petit N.',
  'CvM (Cramér–von Mises) è la distanza quadratica media tra le due cumulate: rispetto a KS pesa tutti gli scostamenti e non solo il peggiore, quindi è più stabile con pochi dati.': 'CvM (Cramér–von Mises) est la distance quadratique moyenne entre les deux cumulées : contrairement à KS, elle pondère tous les écarts et pas seulement le plus grand, donc elle est plus stable avec peu de données.',
};
