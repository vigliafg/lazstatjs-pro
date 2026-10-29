/** Prose française du rapport de corrélation et de ses tableaux. */
export const correlationCopy: Record<string, string> = {
  'Spearman ρ': 'Spearman ρ',
  'Kendall τ': 'Kendall τ',
  'Pearson r': 'Pearson r',
  'non calcolabile': 'non calculable',
  'positiva (al crescere di una cresce l’altra)':
    'positive (quand l’une augmente, l’autre augmente)',
  'negativa (al crescere di una l’altra cala)':
    'négative (quand l’une augmente, l’autre diminue)',
  '{s1} × {s2}: {s3} = {s4}, {s5} → associazione {s6}; relazione {s7}; r² = {s8} ({s9}% di varianza condivisa){s10}.':
    '{s1} × {s2} : {s3} = {s4}, {s5} → association {s6} ; relation {s7} ; r² = {s8} ({s9} % de variance partagée){s10}.',
  '{s1} e significativa': '{s1} et significative',
  'non significativa': 'non significative',
  '; Pearson r = {s1} ({s2})': ' ; Pearson r = {s1} ({s2})',
  'Nessuna correlazione calcolabile con i dati disponibili.':
    'Aucune corrélation calculable avec les données disponibles.',
  'L’associazione più forte è {s1} × {s2}: {s3} = {s4}, {s5} e significativa ({s6}).':
    'L’association la plus forte est {s1} × {s2} : {s3} = {s4}, {s5} et significative ({s6}).',
  'Nessuna associazione raggiunge la significatività: la più forte è {s1} × {s2} ({s3} = {s4}, {s5}).':
    'Aucune association n’atteint la significativité : la plus forte est {s1} × {s2} ({s3} = {s4}, {s5}).',
  'Coppia per coppia': 'Paire par paire',
  'Quanto è forte il legame': 'Quelle est la force du lien',
  'Il coefficiente va da −1 a +1: {s1} corrisponde a un legame {s2}; il segno indica solo la direzione.':
    'Le coefficient va de −1 à +1 : {s1} correspond à un lien {s2} ; le signe n’indique que la direction.',
  'Coefficiente non disponibile.': 'Coefficient non disponible.',
  'r² = {s1}: le due variabili condividono circa il {s2}% della variabilità, il resto dipende da altro.':
    'r² = {s1} : les deux variables partagent environ {s2} % de la variabilité, le reste dépend d’autre chose.',
  'Nessuna coppia supera la soglia scelta: le oscillazioni osservate sono compatibili con il caso.':
    'Aucune paire ne dépasse le seuil choisi : les fluctuations observées sont compatibles avec le hasard.',
  '{s1} {s2} la soglia di significatività: con molti confronti qualche falso positivo è atteso, quindi dai priorità alle associazioni più forti e coerenti con l’ipotesi di partenza.':
    '{s1} {s2} le seuil de significativité : avec de nombreuses comparaisons, quelques faux positifs sont attendus, donnez donc la priorité aux associations les plus fortes et cohérentes avec l’hypothèse de départ.',
  'coppia supera': 'paire dépasse',
  'coppie superano': 'paires dépassent',
  'Correlazioni parziali': 'Corrélations partielles',
  'La correlazione parziale misura il legame tra due variabili togliendo l’effetto delle altre: se crolla rispetto a quella semplice, il legame era in buona parte spiegato dalle variabili controllate.':
    'La corrélation partielle mesure le lien entre deux variables en retirant l’effet des autres : si elle chute par rapport à la corrélation simple, le lien était en grande partie expliqué par les variables contrôlées.',
  '{s1} × {s2} controllando {s3}: r = {s4}, {s5} → {s6}.':
    '{s1} × {s2} en contrôlant {s3} : r = {s4}, {s5} → {s6}.',
  'legame residuo significativo': 'lien résiduel significatif',
  'nessun legame residuo affidabile': 'aucun lien résiduel fiable',
  'Come leggere i numeri': 'Comment lire les nombres',
  'Pearson misura un legame lineare: una relazione curva forte può dare r vicino a zero.':
    'Pearson mesure un lien linéaire : une relation courbe forte peut donner un r proche de zéro.',
  'Spearman lavora sui ranghi: misura un legame monotono e resiste agli outlier e alle scale non lineari.':
    'Spearman travaille sur les rangs : il mesure un lien monotone et résiste aux valeurs aberrantes et aux échelles non linéaires.',
  'Kendall confronta coppie concordanti e discordanti: è robusto e adatto a campioni piccoli con molti ranghi pari.':
    'Kendall compare les paires concordantes et discordantes : il est robuste et adapté aux petits échantillons avec beaucoup de rangs égaux.',
  'p < {s1} indica che il coefficiente è difficilmente spiegabile dal solo caso; non dice che il legame sia forte.':
    'p < {s1} indique que le coefficient est difficilement explicable par le seul hasard ; cela ne dit pas que le lien est fort.',
  'N varia tra le coppie quando alcune righe hanno valori mancanti: coefficienti con N molto diverso non sono direttamente confrontabili.':
    'N varie entre les paires lorsque certaines lignes ont des valeurs manquantes : des coefficients avec des N très différents ne sont pas directement comparables.',
  'Report di lettura — Correlazione': 'Rapport de lecture — Corrélation',
  'Associazione presente': 'Association présente',
  'Nessuna associazione': 'Aucune association',
  'Misura se due variabili si muovono insieme e con quale intensità, senza ipotizzare quale delle due influenzi l’altra.':
    'Mesure si deux variables évoluent ensemble et avec quelle intensité, sans supposer laquelle des deux influence l’autre.',
  'Il coefficiente è compreso tra −1 e +1: lo zero indica assenza di legame, i valori estremi un legame quasi perfetto in una direzione o nell’altra.':
    'Le coefficient est compris entre −1 et +1 : zéro indique l’absence de lien, les valeurs extrêmes un lien presque parfait dans un sens ou dans l’autre.',
  'Correlazione non è causalità: una terza variabile può spiegare entrambe, oppure la direzione può essere inversa.':
    'Corrélation n’est pas causalité : une troisième variable peut expliquer les deux, ou la direction peut être inverse.',
  'Gli outlier e le distribuzioni molto asimmetriche possono gonfiare o azzerare il coefficiente: controlla sempre il grafico a dispersione.':
    'Les valeurs aberrantes et les distributions très asymétriques peuvent gonfler ou annuler le coefficient : contrôlez toujours le nuage de points.',
  'Una correlazione calcolata su un intervallo ristretto di valori tende a sottostimare il legame reale.':
    'Une corrélation calculée sur un intervalle restreint de valeurs tend à sous-estimer le lien réel.',
  '{s1}-{s2}': '{s1}-{s2}',
  'Variabile A': 'Variable A',
  'Variabile B': 'Variable B',
  N: 'N',
  p: 'p',
  'CI low': 'IC bas',
  'CI high': 'IC haut',
  'r²': 'r²',
  'Correlazioni a coppie': 'Corrélations par paires',
  'Metodo primario: {s1} · CI {s2}% · eliminazione pairwise':
    'Méthode principale : {s1} · IC {s2} % · élimination pairwise',
  'Ogni coppia usa tutte le righe con entrambi i valori validi (pairwise deletion): N può variare tra le coppie.':
    'Chaque paire utilise toutes les lignes où les deux valeurs sont valides (pairwise deletion) : N peut varier entre les paires.',
  'p di Pearson e Spearman: t con df = N − 2. p di Kendall: approssimazione normale con correzione dei ranghi pari.':
    'p de Pearson et Spearman : t avec dl = N − 2. p de Kendall : approximation normale avec correction des rangs égaux.',
  'CI di Pearson: trasformazione z di Fisher, tanh(z ± z_crit/√(N−3)).':
    'IC de Pearson : transformation z de Fisher, tanh(z ± z_crit/√(N−3)).',
  Variable: 'Variable',
  'v{s1}': 'v{s1}',
  '{s1}{s2}': '{s1}{s2}',
  'n={s1}': 'n={s1}',
  'Triangolo inferiore: coefficiente con stelle di significatività (* p<.05, ** p<.01, *** p<.001). Triangolo superiore: N della coppia.':
    'Triangle inférieur : coefficient avec étoiles de significativité (* p<.05, ** p<.01, *** p<.001). Triangle supérieur : N de la paire.',
  'Matrice di correlazione di Spearman (ρ)':
    'Matrice de corrélation de Spearman (ρ)',
  'Rho di Spearman sui ranghi.': 'Rho de Spearman sur les rangs.',
  'Matrice di correlazione di Pearson (r)':
    'Matrice de corrélation de Pearson (r)',
  'Coefficiente lineare di Pearson.': 'Coefficient linéaire de Pearson.',
  'Matrice di correlazione di Kendall (τ-b)':
    'Matrice de corrélation de Kendall (τ-b)',
  'Tau-b di Kendall con correzione dei ranghi pari.':
    'Tau-b de Kendall avec correction des rangs égaux.',
  'Descrittive delle variabili': 'Descriptives des variables',
  Mean: 'Moyenne',
  SD: 'SD',
  Median: 'Médiane',
  Min: 'Min',
  Max: 'Max',
  'controllando per le altre {s1} variabili · CI {s2}%':
    'en contrôlant les autres {s1} variables · IC {s2} %',
  Controllate: 'Contrôlées',
  'r parziale': 'r partiel',
  df: 'dl',
  'Calcolate su casi completi per tutte le variabili selezionate (listwise deletion), per garantire una matrice invertibile.':
    'Calculées sur les cas complets pour toutes les variables sélectionnées (listwise deletion), afin de garantir une matrice inversible.',
  'r parziale da inversa della matrice di correlazione: r_ij·rest = −P_ij/√(P_ii·P_jj); p con t e df = N − q (q = numero di variabili selezionate).':
    'r partiel à partir de l’inverse de la matrice de corrélation : r_ij·rest = −P_ij/√(P_ii·P_jj) ; p avec t et dl = N − q (q = nombre de variables sélectionnées).',
};
