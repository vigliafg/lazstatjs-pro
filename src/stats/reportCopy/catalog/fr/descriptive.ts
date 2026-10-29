/** Prose française du rapport descriptif et de ses tableaux. */
export const descriptiveCopy: Record<string, string> = {
  'n = {s1}': 'n = {s1}',
  '{s1} mancanti': '{s1} manquantes',
  'media {s1} (CI {s2}% {s3})': 'moyenne {s1} (IC {s2} % {s3})',
  'mediana {s1}': 'médiane {s1}',
  'SD {s1}': 'SD {s1}',
  'CV {s1}%': 'CV {s1} %',
  '{s1} valori anomali ({s2}%)': '{s1} valeurs aberrantes ({s2} %)',
  'asimmetria non disponibile': 'asymétrie non disponible',
  'asimmetria {s1}, praticamente simmetrica': 'asymétrie {s1}, pratiquement symétrique',
  'asimmetria {s1}, coda a destra': 'asymétrie {s1}, queue à droite',
  'asimmetria {s1}, coda a sinistra': 'asymétrie {s1}, queue à gauche',
  'test di normalità non calcolabili con questo campione':
    'tests de normalité non calculables avec cet échantillon',
  'normalità rifiutata (JB {s1}, Lilliefors {s2}, K² {s3})':
    'normalité rejetée (JB {s1}, Lilliefors {s2}, K² {s3})',
  'normalità non rifiutata (JB {s1}, Lilliefors {s2}, K² {s3})':
    'normalité non rejetée (JB {s1}, Lilliefors {s2}, K² {s3})',
  '{s1}: {s2}. Distribuzione: {s3}; {s4}.':
    '{s1} : {s2}. Distribution : {s3} ; {s4}.',
  'Nessuna variabile numerica valida: non c’è nulla da riassumere.':
    'Aucune variable numérique valide : il n’y a rien à résumer.',
  'Quadro regolare: {s1} {s2} (fino a {s3} osservazioni), distribuzioni compatibili con la gaussiana e nessun valore anomalo.':
    'Tableau régulier : {s1} {s2} (jusqu’à {s3} observations), distributions compatibles avec la gaussienne et aucune valeur aberrante.',
  'variabile analizzata': 'variable analysée',
  'variabili analizzate': 'variables analysées',
  'Da leggere con cautela: {s1} di {s2} {s3} dalla gaussiana e {s4} {s5} valori anomali oltre 1.5 IQR.':
    'À lire avec prudence : {s1} sur {s2} {s3} de la gaussienne et {s4} {s5} valeurs aberrantes au-delà de 1.5 IQR.',
  'variabile si discosta': 'variable s’écarte',
  'variabili si discostano': 'variables s’écartent',
  'Report di lettura — Statistiche descrittive':
    'Rapport de lecture — Statistiques descriptives',
  'Dati insufficienti': 'Données insuffisantes',
  'Dati regolari': 'Données régulières',
  'Da verificare': 'À vérifier',
  'Questa analisi non verifica ipotesi: fotografa ogni variabile per capire dove sta il centro dei dati, quanto sono dispersi e che forma ha la distribuzione.':
    'Cette analyse ne vérifie pas d’hypothèses : elle photographie chaque variable pour comprendre où se situe le centre des données, quelle est leur dispersion et quelle forme a la distribution.',
  'Serve a scegliere i test successivi: se media e mediana coincidono e la forma è simmetrica i test parametrici sono adatti; in presenza di asimmetria o valori anomali conviene affiancarli a quelli non parametrici.':
    'Elle sert à choisir les tests suivants : si la moyenne et la médiane coïncident et que la forme est symétrique, les tests paramétriques conviennent ; en présence d’asymétrie ou de valeurs aberrantes, il vaut mieux les compléter par des tests non paramétriques.',
  'Risultato variabile per variabile': 'Résultat variable par variable',
  'Come leggere i numeri': 'Comment lire les nombres',
  'Media e mediana: la media è il baricentro e risente degli estremi, la mediana è il valore centrale e resta stabile. Se differiscono molto, la distribuzione è asimmetrica.':
    'Moyenne et médiane : la moyenne est le barycentre et subit les valeurs extrêmes, la médiane est la valeur centrale et reste stable. Si elles diffèrent beaucoup, la distribution est asymétrique.',
  'SD (deviazione standard) misura la dispersione nella stessa unità dei dati; il CV (SD/media) la rende confrontabile tra variabili con scale diverse. IQR e MAD sono alternative robuste agli outlier.':
    'La SD (écart-type) mesure la dispersion dans la même unité que les données ; le CV (SD/moyenne) la rend comparable entre variables d’échelles différentes. L’IQR et la MAD sont des alternatives robustes aux valeurs aberrantes.',
  'Valori anomali: sono le osservazioni oltre 1.5 × IQR dalle cerniere (regola di Tukey). Controlla se sono errori di inserimento o casi reali da mantenere.':
    'Valeurs aberrantes : ce sont les observations au-delà de 1.5 × IQR des charnières (règle de Tukey). Vérifiez s’il s’agit d’erreurs de saisie ou de cas réels à conserver.',
  'Test di normalità: p ≥ {s1} significa dati compatibili con una gaussiana, p < {s2} la esclude. Con molti dati anche scostamenti irrilevanti diventano significativi: guarda anche istogramma e Q-Q.':
    'Tests de normalité : p ≥ {s1} signifie des données compatibles avec une gaussienne, p < {s2} l’exclut. Avec beaucoup de données, des écarts sans importance deviennent significatifs : regardez aussi l’histogramme et le graphique Q-Q.',
  'Cosa fare adesso': 'Que faire maintenant',
  'Due gruppi indipendenti: t-test di Welch, oppure Mann–Whitney U se la normalità è rifiutata.':
    'Deux groupes indépendants : test t de Welch, ou Mann–Whitney U si la normalité est rejetée.',
  'Misure ripetute sulle stesse righe: t-test appaiato o Wilcoxon signed-rank.':
    'Mesures répétées sur les mêmes lignes : test t apparié ou Wilcoxon signed-rank.',
  'Tre o più gruppi: ANOVA a una via con post-hoc, oppure Kruskal–Wallis.':
    'Trois groupes ou plus : ANOVA à un facteur avec post-hoc, ou Kruskal–Wallis.',
  'Relazione tra variabili: correlazione; per prevedere una variabile da altre, regressione lineare.':
    'Relation entre variables : corrélation ; pour prédire une variable à partir d’autres, régression linéaire.',
  'Le descrittive non dimostrano relazioni causali né differenze tra gruppi: sono una fotografia del campione.':
    'Les descriptives ne démontrent ni relations causales ni différences entre groupes : elles photographient l’échantillon.',
  'Le celle vuote o non numeriche vengono escluse variabile per variabile, quindi gli N possono differire tra colonne.':
    'Les cellules vides ou non numériques sont exclues variable par variable, donc les N peuvent différer entre les colonnes.',
  'Con pochi dati i test di normalità hanno scarsa potenza; con molti dati sono iper-sensibili.':
    'Avec peu de données, les tests de normalité manquent de puissance ; avec beaucoup, ils sont hypersensibles.',
  'Campione e misure di posizione': 'Échantillon et mesures de position',
  'CI {s1}%': 'IC {s1} %',
  Variable: 'Variable',
  N: 'N',
  Missing: 'Manquantes',
  Sum: 'Somme',
  Mean: 'Moyenne',
  SE: 'SE',
  'CI low': 'IC bas',
  'CI high': 'IC haut',
  Median: 'Médiane',
  'Median CI low': 'IC médiane bas',
  'Median CI high': 'IC médiane haut',
  'Trimmed mean 5%': 'Moyenne élaguée 5 %',
  'Trimmed mean al 5%: media dopo aver rimosso il 5% delle osservazioni a ciascuna coda (0 se N < 20).':
    'Moyenne élaguée à 5 % : moyenne après avoir retiré 5 % des observations à chaque queue (0 si N < 20).',
  'Dispersione e valori anomali': 'Dispersion et valeurs aberrantes',
  SD: 'SD',
  Variance: 'Variance',
  'CV %': 'CV %',
  Min: 'Min',
  Q1: 'Q1',
  Q3: 'Q3',
  Max: 'Max',
  Range: 'Étendue',
  IQR: 'IQR',
  MAD: 'MAD',
  'MAD scalata': 'MAD mise à l’échelle',
  'Outlier 1.5 IQR': 'Valeurs aberrantes 1.5 IQR',
  'Outlier %': '% aberrantes',
  'Estremi 3 IQR': 'Extrêmes 3 IQR',
  'Definizione di Tukey: outlier se < Q1 − 1.5·IQR o > Q3 + 1.5·IQR; estremi oltre 3·IQR.':
    'Définition de Tukey : valeur aberrante si < Q1 − 1.5·IQR ou > Q3 + 1.5·IQR ; extrêmes au-delà de 3·IQR.',
  'Q1/Q3 con il metodo Tukey hinges di jStat (lievemente diverso dal tipo 7 di R per N piccoli); lo stesso metodo è usato nei boxplot.':
    'Q1/Q3 avec la méthode des charnières de Tukey de jStat (légèrement différente du type 7 de R pour de petits N) ; la même méthode est utilisée dans les boîtes à moustaches.',
  'MAD scalata = 1.4826 · MAD, stimatore consistente della SD sotto normalità.':
    'MAD mise à l’échelle = 1.4826 · MAD, estimateur convergent de la SD sous normalité.',
  'Forma e test di normalità': 'Forme et tests de normalité',
  Skewness: 'Asymétrie',
  z: 'z',
  p: 'p',
  'Excess kurtosis': 'Aplatissement excessif',
  'Jarque–Bera': 'Jarque–Bera',
  'JB p': 'p JB',
  'KS D': 'KS D',
  'KS p (Lilliefors)': 'p KS (Lilliefors)',
  "D'Agostino K²": "K² de D'Agostino",
  'K² p': 'p K²',
  'SE di skewness e kurtosi secondo le formule di Fisher; z = statistica / SE, p a due code normale.':
    'SE de l’asymétrie et de l’aplatissement selon les formules de Fisher ; z = statistique / SE, p bilatérale normale.',
  'KS con parametri stimati: p corretta con metodo Lilliefors (Monte Carlo, 1000 repliche, seed fisso). Il p grezzo di KS sarebbe anti-conservativo.':
    'KS avec paramètres estimés : p corrigée par la méthode de Lilliefors (Monte-Carlo, 1000 réplicats, graine fixe). La p brute du KS serait anti-conservatrice.',
  "D'Agostino–Pearson K² combina le trasformazioni normalizzanti di skewness e kurtosi; p da χ² con 2 df.":
    "Le K² de D'Agostino–Pearson combine les transformations normalisantes de l’asymétrie et de l’aplatissement ; p issue d’un χ² à 2 dl.",
  Quantili: 'Quantiles',
  P1: 'P1',
  P5: 'P5',
  P10: 'P10',
  P25: 'P25',
  P50: 'P50',
  P75: 'P75',
  P90: 'P90',
  P95: 'P95',
  P99: 'P99',
  'Quantili interpolati (metodo jStat.percentile).':
    'Quantiles interpolés (méthode jStat.percentile).',
};
