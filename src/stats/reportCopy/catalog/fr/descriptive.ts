/** fr: report and table prose (normalised). */
export const descriptiveCopy: Record<string, string> = {
  '{s1} mancanti':
    '{s1} manquantes',
  '{s1} valori anomali ({s2}%)':
    '{s1} valeurs aberrantes ({s2} %)',
  '{s1}: {s2}. Distribuzione: {s3}; {s4}.':
    '{s1} : {s2}. Distribution : {s3} ; {s4}.',
  'asimmetria {s1}, coda a destra':
    'asymétrie {s1}, queue à droite',
  'asimmetria {s1}, coda a sinistra':
    'asymétrie {s1}, queue à gauche',
  'asimmetria {s1}, praticamente simmetrica':
    'asymétrie {s1}, pratiquement symétrique',
  'asimmetria non disponibile':
    'asymétrie non disponible',
  'Campione e misure di posizione':
    'Échantillon et mesures de position',
  'CI {s1}%':
    'IC {s1} %',
  'CI high':
    'IC haut',
  'CI low':
    'IC bas',
  'Come leggere i numeri':
    'Comment lire les nombres',
  'Con pochi dati i test di normalità hanno scarsa potenza; con molti dati sono iper-sensibili.':
    'Avec peu de données, les tests de normalité manquent de puissance ; avec beaucoup, ils sont hypersensibles.',
  'Cosa fare adesso':
    'Que faire maintenant',
  'CV {s1}%':
    'CV {s1} %',
  'CV %':
    'CV %',
  'D\'Agostino K²':
    'K² de D\'Agostino',
  'D\'Agostino–Pearson K² combina le trasformazioni normalizzanti di skewness e kurtosi; p da χ² con 2 df.':
    'Le K² de D\'Agostino–Pearson combine les transformations normalisantes de l’asymétrie et de l’aplatissement ; p issue d’un χ² à 2 dl.',
  'Da leggere con cautela: {s1} di {s2} {s3} dalla gaussiana e {s4} {s5} valori anomali oltre 1.5 IQR.':
    'À lire avec prudence : {s1} sur {s2} {s3} de la gaussienne et {s4} {s5} valeurs aberrantes au-delà de 1.5 IQR.',
  'Da verificare':
    'À vérifier',
  'Dati insufficienti':
    'Données insuffisantes',
  'Dati regolari':
    'Données régulières',
  'Definizione di Tukey: outlier se < Q1 − 1.5·IQR o > Q3 + 1.5·IQR; estremi oltre 3·IQR.':
    'Définition de Tukey : valeur aberrante si < Q1 − 1.5·IQR ou > Q3 + 1.5·IQR ; extrêmes au-delà de 3·IQR.',
  'Dispersione e valori anomali':
    'Dispersion et valeurs aberrantes',
  'Due gruppi indipendenti: t-test di Welch, oppure Mann–Whitney U se la normalità è rifiutata.':
    'Deux groupes indépendants : test t de Welch, ou Mann–Whitney U si la normalité est rejetée.',
  'Estremi 3 IQR':
    'Extrêmes 3 IQR',
  'Excess kurtosis':
    'Aplatissement excessif',
  'Forma e test di normalità':
    'Forme et tests de normalité',
  'IQR':
    'IQR',
  'Jarque–Bera':
    'Jarque–Bera',
  'JB p':
    'p JB',
  'K² p':
    'p K²',
  'KS con parametri stimati: p corretta con metodo Lilliefors (Monte Carlo, 1000 repliche, seed fisso). Il p grezzo di KS sarebbe anti-conservativo.':
    'KS avec paramètres estimés : p corrigée par la méthode de Lilliefors (Monte-Carlo, 1000 réplicats, graine fixe). La p brute du KS serait anti-conservatrice.',
  'KS D':
    'KS D',
  'KS p (Lilliefors)':
    'p KS (Lilliefors)',
  'Le celle vuote o non numeriche vengono escluse variabile per variabile, quindi gli N possono differire tra colonne.':
    'Les cellules vides ou non numériques sont exclues variable par variable, donc les N peuvent différer entre les colonnes.',
  'Le descrittive non dimostrano relazioni causali né differenze tra gruppi: sono una fotografia del campione.':
    'Les descriptives ne démontrent ni relations causales ni différences entre groupes : elles photographient l’échantillon.',
  'MAD':
    'MAD',
  'MAD scalata':
    'MAD mise à l’échelle',
  'MAD scalata = 1.4826 · MAD, stimatore consistente della SD sotto normalità.':
    'MAD mise à l’échelle = 1.4826 · MAD, estimateur convergent de la SD sous normalité.',
  'Max':
    'Max',
  'Mean':
    'Moyenne',
  'media {s1} (CI {s2}% {s3})':
    'moyenne {s1} (IC {s2} % {s3})',
  'Media e mediana: la media è il baricentro e risente degli estremi, la mediana è il valore centrale e resta stabile. Se differiscono molto, la distribuzione è asimmetrica.':
    'Moyenne et médiane : la moyenne est le barycentre et subit les valeurs extrêmes, la médiane est la valeur centrale et reste stable. Si elles diffèrent beaucoup, la distribution est asymétrique.',
  'Median':
    'Médiane',
  'Median CI high':
    'IC médiane haut',
  'Median CI low':
    'IC médiane bas',
  'mediana {s1}':
    'médiane {s1}',
  'Min':
    'Min',
  'Missing':
    'Manquantes',
  'Misure ripetute sulle stesse righe: t-test appaiato o Wilcoxon signed-rank.':
    'Mesures répétées sur les mêmes lignes : test t apparié ou Wilcoxon signed-rank.',
  'N':
    'N',
  'n = {s1}':
    'n = {s1}',
  'Nessuna variabile numerica valida: non c’è nulla da riassumere.':
    'Aucune variable numérique valide : il n’y a rien à résumer.',
  'normalità non rifiutata (JB {s1}, Lilliefors {s2}, K² {s3})':
    'normalité non rejetée (JB {s1}, Lilliefors {s2}, K² {s3})',
  'normalità rifiutata (JB {s1}, Lilliefors {s2}, K² {s3})':
    'normalité rejetée (JB {s1}, Lilliefors {s2}, K² {s3})',
  'Outlier %':
    '% aberrantes',
  'Outlier 1.5 IQR':
    'Valeurs aberrantes 1.5 IQR',
  'p':
    'p',
  'P1':
    'P1',
  'P10':
    'P10',
  'P25':
    'P25',
  'P5':
    'P5',
  'P50':
    'P50',
  'P75':
    'P75',
  'P90':
    'P90',
  'P95':
    'P95',
  'P99':
    'P99',
  'Q1':
    'Q1',
  'Q1/Q3 con il metodo Tukey hinges di jStat (lievemente diverso dal tipo 7 di R per N piccoli); lo stesso metodo è usato nei boxplot.':
    'Q1/Q3 avec la méthode des charnières de Tukey de jStat (légèrement différente du type 7 de R pour de petits N) ; la même méthode est utilisée dans les boîtes à moustaches.',
  'Q3':
    'Q3',
  'Quadro regolare: {s1} {s2} (fino a {s3} osservazioni), distribuzioni compatibili con la gaussiana e nessun valore anomalo.':
    'Tableau régulier : {s1} {s2} (jusqu’à {s3} observations), distributions compatibles avec la gaussienne et aucune valeur aberrante.',
  'Quantili':
    'Quantiles',
  'Quantili interpolati (metodo jStat.percentile).':
    'Quantiles interpolés (méthode jStat.percentile).',
  'Questa analisi non verifica ipotesi: fotografa ogni variabile per capire dove sta il centro dei dati, quanto sono dispersi e che forma ha la distribuzione.':
    'Cette analyse ne vérifie pas d’hypothèses : elle photographie chaque variable pour comprendre où se situe le centre des données, quelle est leur dispersion et quelle forme a la distribution.',
  'Range':
    'Étendue',
  'Relazione tra variabili: correlazione; per prevedere una variabile da altre, regressione lineare.':
    'Relation entre variables : corrélation ; pour prédire une variable à partir d’autres, régression linéaire.',
  'Report di lettura — Statistiche descrittive':
    'Rapport de lecture — Statistiques descriptives',
  'Risultato variabile per variabile':
    'Résultat variable par variable',
  'SD':
    'SD',
  'SD (deviazione standard) misura la dispersione nella stessa unità dei dati; il CV (SD/media) la rende confrontabile tra variabili con scale diverse. IQR e MAD sono alternative robuste agli outlier.':
    'La SD (écart-type) mesure la dispersion dans la même unité que les données ; le CV (SD/moyenne) la rend comparable entre variables d’échelles différentes. L’IQR et la MAD sont des alternatives robustes aux valeurs aberrantes.',
  'SD {s1}':
    'SD {s1}',
  'SE':
    'SE',
  'SE di skewness e kurtosi secondo le formule di Fisher; z = statistica / SE, p a due code normale.':
    'SE de l’asymétrie et de l’aplatissement selon les formules de Fisher ; z = statistique / SE, p bilatérale normale.',
  'Serve a scegliere i test successivi: se media e mediana coincidono e la forma è simmetrica i test parametrici sono adatti; in presenza di asimmetria o valori anomali conviene affiancarli a quelli non parametrici.':
    'Elle sert à choisir les tests suivants : si la moyenne et la médiane coïncident et que la forme est symétrique, les tests paramétriques conviennent ; en présence d’asymétrie ou de valeurs aberrantes, il vaut mieux les compléter par des tests non paramétriques.',
  'Skewness':
    'Asymétrie',
  'Sum':
    'Somme',
  'test di normalità non calcolabili con questo campione':
    'tests de normalité non calculables avec cet échantillon',
  'Test di normalità: p ≥ {s1} significa dati compatibili con una gaussiana, p < {s2} la esclude. Con molti dati anche scostamenti irrilevanti diventano significativi: guarda anche istogramma e Q-Q.':
    'Tests de normalité : p ≥ {s1} signifie des données compatibles avec une gaussienne, p < {s2} l’exclut. Avec beaucoup de données, des écarts sans importance deviennent significatifs : regardez aussi l’histogramme et le graphique Q-Q.',
  'Tre o più gruppi: ANOVA a una via con post-hoc, oppure Kruskal–Wallis.':
    'Trois groupes ou plus : ANOVA à un facteur avec post-hoc, ou Kruskal–Wallis.',
  'Trimmed mean 5%':
    'Moyenne élaguée 5 %',
  'Trimmed mean al 5%: media dopo aver rimosso il 5% delle osservazioni a ciascuna coda (0 se N < 20).':
    'Moyenne élaguée à 5 % : moyenne après avoir retiré 5 % des observations à chaque queue (0 si N < 20).',
  'Valori anomali: sono le osservazioni oltre 1.5 × IQR dalle cerniere (regola di Tukey). Controlla se sono errori di inserimento o casi reali da mantenere.':
    'Valeurs aberrantes : ce sont les observations au-delà de 1.5 × IQR des charnières (règle de Tukey). Vérifiez s’il s’agit d’erreurs de saisie ou de cas réels à conserver.',
  'variabile analizzata':
    'variable analysée',
  'variabile si discosta':
    'variable s’écarte',
  'variabili analizzate':
    'variables analysées',
  'variabili si discostano':
    'variables s’écartent',
  'Variable':
    'Variable',
  'Variance':
    'Variance',
  'z':
    'z',
  'Frequenze':
    'Fréquences',
  'Value':
    'Valeur',
  'Count':
    'Effectif',
  'Percent':
    'Pourcentage',
  'Cumulative count':
    'Effectif cumulé',
  'Cumulative %':
    '% cumulé',
  'Chi-square':
    'Khi-deux',
  'p-value':
    'valeur p',
  'Low':
    'Bas',
  'High':
    'Haut',
  'Outlier':
    'Valeur aberrante',
  'Regolare':
    'Régulier',
  'Test per valori anomali':
    'Tests de valeurs aberrantes',
  'Statistic':
    'Statistique',
  'Critical value':
    'Valeur critique',
  'Side':
    'Côté',
  'Verdict':
    'Verdict',
  'Test delle sequenze':
    'Test des séquences',
  'Cut point':
    'Point de coupure',
  'Above cut':
    'Au-dessus du seuil',
  'Below cut':
    'Au-dessous du seuil',
  'Runs':
    'Séquences',
  'Expected runs':
    'Séquences attendues',
  'Exact p':
    'p exact',
  'Conteggi':
    'Effectifs',
  'Risultato per variabile':
    'Résultat par variable',
  'Percentuali calcolate sulle osservazioni non mancanti ({s1} su {s2}).':
    'Pourcentages calculés sur les observations non manquantes ({s1} sur {s2}).',
  'Intervallo di Wilson al {s1}% per la proporzione di ogni modalità.':
    'Intervalle de Wilson à {s1} % pour la proportion de chaque modalité.',
  'Bontà di adattamento (quote uguali)':
    'Ajustement (parts égales)',
  'Confronta le frequenze osservate con quote uguali tra le modalità: un p piccolo indica modalità più rappresentate di altre.':
    'Compare les effectifs observés à des parts égales entre modalités : un p petit indique que certaines modalités sont plus représentées.',
  'Grubbs: test bilaterale sull’osservazione più lontana dalla media, con correzione per il numero di candidati.':
    'Grubbs : test bilatéral sur l’observation la plus éloignée de la moyenne, corrigé pour le nombre de candidats.',
  'Dixon: rapporto fra le differenze adiacenti; definito solo per 3–30 osservazioni e più robusto agli estremi.':
    'Dixon : rapport des différences adjacentes ; défini seulement pour 3–30 observations et plus robuste aux extrêmes.',
  'Le osservazioni sono divise in due lati rispetto al punto di taglio (mediana per default); un numero di sequenze troppo basso indica clustering, troppo alto alternanza.':
    'Les observations sont divisées de part et d’autre du point de coupure (médiane par défaut) ; trop peu de séquences indique un regroupement, trop de séquences une alternance.',
  'Il p asintotico usa l’approssimazione normale con correzione di continuità; il p esatto è disponibile fino a 50 osservazioni.':
    'Le p asymptotique utilise l’approximation normale avec correction de continuité ; le p exact est disponible jusqu’à 50 observations.',
  'Livello di confidenza: {s1}%.':
    'Niveau de confiance : {s1} %.',
  '{s1} modalità su {s2} osservazioni non mancanti':
    '{s1} modalités sur {s2} observations non manquantes',
  'la più frequente è “{s1}” con {s2} casi':
    'la plus fréquente est « {s1} » avec {s2} cas',
  'le quote uguali sono rifiutate (χ² = {s1}, p = {s2})':
    'les parts égales sont rejetées (χ² = {s1}, p = {s2})',
  'le quote uguali non sono rifiutate (χ² = {s1}, p = {s2})':
    'les parts égales ne sont pas rejetées (χ² = {s1}, p = {s2})',
  '{s1}: {s2}; {s3}{s4}.':
    '{s1} : {s2} ; {s3}{s4}.',
  'Report di lettura — Frequenze':
    'Rapport de lecture — Fréquences',
  'La variabile {s1} ha {s2} modalità distinte.':
    'La variable {s1} a {s2} modalités distinctes.',
  'Frequenze di {s1} variabili, {s2} modalità in tutto.':
    'Fréquences de {s1} variables, {s2} modalités au total.',
  'La tabella di frequenza conta quante volte compare ogni modalità e mostra la percentuale sul totale delle osservazioni valide.':
    'Le tableau de fréquences compte combien de fois chaque modalité apparaît et affiche son pourcentage sur les observations valides.',
  'L’intervallo di Wilson tiene conto della numerosità: con pochi casi è largo anche quando la percentuale sembra precisa.':
    'L’intervalle de Wilson tient compte de l’effectif : avec peu de cas il est large même si le pourcentage semble précis.',
  'Il conteggio ignora le celle vuote; la percentuale è calcolata sul totale non mancante, non sul numero di righe.':
    'Le décompte ignore les cellules vides ; le pourcentage est calculé sur le total non manquant, pas sur le nombre de lignes.',
  'Il test di bontà di adattamento confronta le modalità con quote uguali: serve a capire se una categoria domina, non a stimare la sua proporzione.':
    'Le test d’ajustement compare les modalités à des parts égales : il indique si une catégorie domine, pas quelle est sa proportion.',
  'Con molte modalità il test χ² diventa fragile: raggruppa le categorie rare prima di leggerlo.':
    'Avec beaucoup de modalités le test χ² devient fragile : regroupez les catégories rares avant de l’interpréter.',
  'Le frequenze descrivono il campione osservato: non dicono nulla sulla popolazione senza un modello o un disegno di campionamento.':
    'Les fréquences décrivent l’échantillon observé : elles ne disent rien de la population sans modèle ni plan d’échantillonnage.',
  'Una variabile continua con molti valori distinti non va conteggiata: usa la sintesi descrittiva o crea classi.':
    'Une variable continue à nombreuses valeurs distinctes ne se décompte pas : utilisez la synthèse descriptive ou créez des classes.',
  'Le percentuali non sono indipendenti tra loro: sommano a 100 e un intervallo alla volta non corregge per i confronti multipli.':
    'Les pourcentages ne sont pas indépendants : ils totalisent 100 et un intervalle à la fois ne corrige pas les comparaisons multiples.',
  '{s1}: nessuno dei due test segnala valori anomali.':
    '{s1} : aucun des deux tests ne signale de valeur aberrante.',
  '{s1}: Grubbs e Dixon segnalano entrambi un valore anomalo.':
    '{s1} : Grubbs et Dixon signalent tous deux une valeur aberrante.',
  '{s1}: Grubbs segnala un valore anomalo, Dixon no.':
    '{s1} : Grubbs signale une valeur aberrante, Dixon non.',
  '{s1}: Dixon segnala un valore anomalo, Grubbs no.':
    '{s1} : Dixon signale une valeur aberrante, Grubbs non.',
  'Grubbs G = {s1}, p = {s2}':
    'Grubbs G = {s1}, p = {s2}',
  'Dixon {s1} = {s2}, p = {s3}':
    'Dixon {s1} = {s2}, p = {s3}',
  'Dixon non applicabile (servono 3–30 osservazioni)':
    'Dixon non applicable (3–30 observations nécessaires)',
  'Report di lettura — Valori anomali':
    'Rapport de lecture — Valeurs aberrantes',
  'Test dei valori anomali per {s1}.':
    'Tests de valeurs aberrantes pour {s1}.',
  'Test dei valori anomali per {s1} variabili: {s2} con almeno un segnale.':
    'Tests de valeurs aberrantes pour {s1} variables : {s2} avec au moins un signal.',
  'Grubbs e Dixon rispondono alla stessa domanda — l’osservazione più estrema è compatibile con le altre? — ma con assunzioni diverse.':
    'Grubbs et Dixon répondent à la même question — l’observation la plus extrême est-elle compatible avec les autres ? — mais avec des hypothèses différentes.',
  'Un test significativo non prova che il dato sia un errore: dice che è improbabile estrarlo da una popolazione normale con la stessa media e dispersione.':
    'Un test significatif ne prouve pas que la donnée soit une erreur : il dit qu’il est improbable de la tirer d’une population normale de même moyenne et dispersion.',
  'Grubbs standardizza lo scarto dalla media con la deviazione standard: risente degli estremi e va usato con campioni non troppo piccoli.':
    'Grubbs standardise l’écart à la moyenne par l’écart-type : il est sensible aux extrêmes et demande des échantillons pas trop petits.',
  'Dixon confronta differenze adiacenti ed è più robusto, ma è definito solo tra 3 e 30 osservazioni.':
    'Dixon compare des différences adjacentes et est plus robuste, mais n’est défini qu’entre 3 et 30 observations.',
  'Il p-value è già corretto per il fatto che il candidato è il massimo scarto, non un’osservazione scelta a priori.':
    'La valeur p tient déjà compte du fait que le candidat est l’écart maximal, pas une observation choisie a priori.',
  'Entrambi i test assumono una popolazione normale: con distribuzioni asimmetriche il p-value non è affidabile.':
    'Les deux tests supposent une population normale : avec des distributions asymétriques la valeur p n’est pas fiable.',
  'Un outlier può essere un caso reale e importante: verifica la fonte prima di escluderlo.':
    'Une valeur aberrante peut être un cas réel et important : vérifiez la source avant de l’exclure.',
  'Con molti valori estremi il test segnala solo il più lontano: ripetilo dopo aver rimosso il caso o usa una regola robusta come MAD.':
    'Avec beaucoup de valeurs extrêmes le test ne signale que la plus éloignée : répétez-le après avoir retiré ce cas ou utilisez une règle robuste comme le MAD.',
  'meno sequenze del previsto: le osservazioni tendono a raggrupparsi':
    'moins de séquences que prévu : les observations tendent à se regrouper',
  'più sequenze del previsto: le osservazioni tendono ad alternarsi':
    'plus de séquences que prévu : les observations tendent à alterner',
  '; p esatto {s1}':
    ' ; p exact {s1}',
  '{s1}: {s2} sequenze su {s3} osservazioni (attese {s4}); {s5} (p = {s6}{s7}).':
    '{s1} : {s2} séquences sur {s3} observations (attendues {s4}) ; {s5} (p = {s6}{s7}).',
  'Report di lettura — Test delle sequenze':
    'Rapport de lecture — Test des séquences',
  'Sequenze di {s1} rispetto al punto di taglio {s2}.':
    'Séquences de {s1} autour du point de coupure {s2}.',
  'Test delle sequenze per {s1} variabili: {s2} con ordine non casuale.':
    'Test des séquences pour {s1} variables : {s2} avec un ordre non aléatoire.',
  'Il test delle sequenze controlla se l’ordine delle righe è casuale: conta quante volte il valore attraversa il punto di taglio.':
    'Le test des séquences vérifie si l’ordre des lignes est aléatoire : il compte combien de fois la valeur franchit le point de coupure.',
  'Serve per dati raccolti in sequenza — tempo, ordine di produzione, righe di un foglio — dove una tendenza o un ciclo rompe l’indipendenza.':
    'Il sert aux données recueillies en séquence — temps, ordre de production, lignes d’un tableur — où une tendance ou un cycle rompt l’indépendance.',
  'Il punto di taglio predefinito è la mediana, così i due lati hanno all’incirca lo stesso numero di osservazioni.':
    'Le point de coupure par défaut est la médiane, de sorte que les deux côtés comptent à peu près le même nombre d’observations.',
  'Il z confronta le sequenze osservate con quelle attese sotto casualità; la correzione di continuità rende il test più prudente.':
    'Le z compare les séquences observées à celles attendues sous hasard ; la correction de continuité rend le test plus prudent.',
  'Il p esatto enumera tutte le disposizioni possibili: è il riferimento quando il campione è piccolo e l’approssimazione normale è dubbia.':
    'Le p exact énumère toutes les dispositions possibles : c’est la référence quand l’échantillon est petit et l’approximation normale douteuse.',
  'Il test rileva dipendenza dall’ordine, non la forma della dipendenza: un p piccolo non distingue tendenza, ciclo e cluster.':
    'Le test détecte une dépendance à l’ordre, pas sa forme : un p petit ne distingue pas tendance, cycle et regroupement.',
  'Le osservazioni con valore uguale al punto di taglio finiscono nel lato basso: con molti pareggi il test diventa conservativo.':
    'Les observations égales au point de coupure vont du côté bas : avec beaucoup d’ex æquo le test devient conservateur.',
  'Il test assume che le osservazioni siano altrimenti identicamente distribuite: un cambiamento di livello a metà serie lo fa rifiutare anche senza vera dipendenza. Il livello usato è {s1}.':
    'Le test suppose que les observations sont par ailleurs identiquement distribuées : un changement de niveau au milieu de la série le fait rejeter même sans dépendance réelle. Le niveau utilisé est {s1}.',
};
