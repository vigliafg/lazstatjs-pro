/** Prose française du rapport de régression linéaire et de ses tableaux. */
export const regressionCopy: Record<string, string> = {
  'Adjusted R²': 'R² ajusté',
  'Breusch–Pagan p': 'p Breusch–Pagan',
  'Residui studentizzati |z| > 3': 'Résidus studentisés |z| > 3',
  'Jarque–Bera p': 'p Jarque–Bera',
  'Lilliefors p': 'p Lilliefors',
  'non cambia': 'ne change pas',
  'non stimabile': 'non estimable',
  '{s1}: B = {s2} (CI {s3}% {s4}), {s5} → {s6}. In media, un aumento di una unità di {s7} {s8} {s9} di {s10} a parità delle altre variabili{s11}{s12}.':
    '{s1} : B = {s2} (IC {s3} % {s4}), {s5} → {s6}. En moyenne, une augmentation d’une unité de {s7} {s8} {s9} de {s10}, toutes les autres variables constantes{s11}{s12}.',
  'predittore significativo': 'prédicteur significatif',
  'nessuna evidenza di effetto': 'aucune preuve d’effet',
  '; β standardizzato = {s1}': ' ; β standardisé = {s1}',
  '; VIF = {s1} segnala collinearità': ' ; VIF = {s1} signale une colinéarité',
  'Il modello non è stimabile con i dati disponibili.':
    'Le modèle n’est pas estimable avec les données disponibles.',
  'Il modello è significativo (F = {s1}, {s2}) e spiega il {s3}% della variabilità di {s4}.':
    'Le modèle est significatif (F = {s1}, {s2}) et explique {s3} % de la variabilité de {s4}.',
  'Il modello non è significativo (F = {s1}, {s2}): i predittori non spiegano {s3} meglio del caso.':
    'Le modèle n’est pas significatif (F = {s1}, {s2}) : les prédicteurs n’expliquent pas {s3} mieux que le hasard.',
  'Il modello nel suo insieme': 'Le modèle dans son ensemble',
  'Osservazioni usate: {s1} (solo righe complete su tutte le variabili del modello).':
    'Observations utilisées : {s1} (seulement les lignes complètes sur toutes les variables du modèle).',
  'R² = {s1} → il modello spiega il {s2}% della variabilità di {s3}.':
    'R² = {s1} → le modèle explique {s2} % de la variabilité de {s3}.',
  'R² corretto = {s1} → quota spiegata al netto del numero di predittori; se è molto più basso di R² il modello è sovra-adattato.':
    'R² ajusté = {s1} → part expliquée nette du nombre de prédicteurs ; s’il est très inférieur à R², le modèle est surajusté.',
  'Test globale: F = {s1}, {s2} (α = {s3}) → {s4}.':
    'Test global : F = {s1}, {s2} (α = {s3}) → {s4}.',
  'il modello nel complesso è utile': 'le modèle est globalement utile',
  'il modello nel complesso non è distinguibile dal caso':
    'le modèle n’est globalement pas distinguable du hasard',
  'Ogni predittore': 'Chaque prédicteur',
  'Nessun coefficiente disponibile.': 'Aucun coefficient disponible.',
  'Breusch–Pagan {s1} → {s2}.': 'Breusch–Pagan {s1} → {s2}.',
  'eteroschedasticità dei residui: gli errori standard e i p-value possono essere inaffidabili':
    'hétéroscédasticité des résidus : les erreurs standard et les valeurs p peuvent ne pas être fiables',
  'nessuna evidenza di eteroschedasticità': 'aucune preuve d’hétéroscédasticité',
  'Eteroschedasticità non verificabile.': 'Hétéroscédasticité non vérifiable.',
  'Normalità dei residui: Jarque–Bera {s1}{s2} → {s3}.':
    'Normalité des résidus : Jarque–Bera {s1}{s2} → {s3}.',
  ', Lilliefors {s1}': ', Lilliefors {s1}',
  'residui non gaussiani: gli intervalli di confidenza vanno letti con prudenza':
    'résidus non gaussiens : les intervalles de confiance doivent être lus avec prudence',
  'nessuna evidenza contro la normalità dei residui':
    'aucune preuve contre la normalité des résidus',
  '{s1} osservazioni con residuo studentizzato oltre 3 SD: verificane l’influenza sulle stime.':
    '{s1} observations avec un résidu studentisé au-delà de 3 SD : vérifiez leur influence sur les estimations.',
  'Nessun residuo studentizzato oltre 3 SD: nessun caso fortemente anomalo rispetto al modello.':
    'Aucun résidu studentisé au-delà de 3 SD : aucun cas fortement atypique par rapport au modèle.',
  'VIF massimo = {s1} {s2}.': 'VIF maximal = {s1} {s2}.',
  '→ collinearità problematica: i coefficienti dei predittori coinvolti sono instabili':
    '→ colinéarité problématique : les coefficients des prédicteurs concernés sont instables',
  '→ collinearità sotto la soglia di attenzione (5)':
    '→ colinéarité sous le seuil d’attention (5)',
  'Stima robusta Theil–Sen': 'Estimation robuste Theil–Sen',
  'Confronto tra OLS e stimatore robusto{s1}: se le due pendenze sono simili, gli outlier non stanno distorcendo il risultato.':
    'Comparaison entre OLS et estimateur robuste{s1} : si les deux pentes sont proches, les valeurs aberrantes ne faussent pas le résultat.',
  ' ({s1})': ' ({s1})',
  'Pendenza OLS = {s1}, pendenza Theil–Sen = {s2} (CI {s3}% {s4}).':
    'Pente OLS = {s1}, pente Theil–Sen = {s2} (IC {s3} % {s4}).',
  'Differenza percentuale: {s1}%.': 'Différence en pourcentage : {s1} %.',
  'Come leggere i numeri': 'Comment lire les nombres',
  'B è il cambiamento atteso nella variabile dipendente per una unità in più del predittore, tenendo fermi gli altri: l’unità conta, e molto.':
    'B est le changement attendu de la variable dépendante pour une unité de plus du prédicteur, les autres étant maintenues fixes : l’unité compte, et beaucoup.',
  'Il CI al {s1}% del coefficiente è la forbice dei valori plausibili: se contiene lo zero l’effetto non è distinguibile da nessun effetto.':
    'L’IC à {s1} % du coefficient est la fourchette des valeurs plausibles : s’il contient zéro, l’effet n’est pas distinguable d’une absence d’effet.',
  'R² alto non significa modello corretto: guarda sempre residui, diagnostica e senso delle variabili.':
    'Un R² élevé ne signifie pas que le modèle est correct : regardez toujours les résidus, les diagnostics et le sens des variables.',
  'In pratica': 'En pratique',
  'I predittori con effetto affidabile sono: {s1}. L’associazione stimata non è una prova di causa-effetto: serve un disegno che escluda fattori confondenti.':
    'Les prédicteurs avec un effet fiable sont : {s1}. L’association estimée n’est pas une preuve de causalité : il faut un plan qui exclue les facteurs de confusion.',
  'Nessun predittore mostra un effetto affidabile: il modello, così com’è, non è uno strumento di previsione utile su questi dati.':
    'Aucun prédicteur ne montre d’effet fiable : le modèle, tel quel, n’est pas un outil de prévision utile sur ces données.',
  'Equazione stimata: {s1} = {s2}{s3}.':
    'Équation estimée : {s1} = {s2}{s3}.',
  ' + ({s1}) × {s2}': ' + ({s1}) × {s2}',
  'Report di lettura — Regressione': 'Rapport de lecture — Régression',
  'Modello utile': 'Modèle utile',
  'Modello non utile': 'Modèle non utile',
  'Stima come {s1} cambia al variare di {s2} e quanto quella relazione spiega dei dati osservati.':
    'Estime comment {s1} change avec {s2} et quelle part de la relation explique les données observées.',
  'Il modello cerca la retta (o l’iperpiano) che rende minima la somma degli scarti al quadrato: i coefficienti indicano l’effetto di ogni variabile tenendo ferme le altre.':
    'Le modèle cherche la droite (ou l’hyperplan) qui rend minimale la somme des écarts au carré : les coefficients indiquent l’effet de chaque variable, les autres étant maintenues fixes.',
  'La regressione descrive associazioni, non cause: variabili omesse o invertite possono spiegare lo stesso pattern.':
    'La régression décrit des associations, pas des causes : des variables omises ou inversées peuvent expliquer le même motif.',
  'Le previsioni valgono solo dentro l’intervallo dei valori osservati: fuori da quel range l’estrapolazione è arbitraria.':
    'Les prévisions ne valent que dans l’intervalle des valeurs observées : au-delà de cette plage, l’extrapolation est arbitraire.',
  'Le righe incomplete vengono scartate per intero: se i dati mancanti non sono casuali il modello può essere distorto.':
    'Les lignes incomplètes sont écartées entièrement : si les données manquantes ne sont pas aléatoires, le modèle peut être biaisé.',
  'Sintesi del modello': 'Synthèse du modèle',
  '{s1} ~ {s2}': '{s1} ~ {s2}',
  Metrica: 'Métrique',
  Valore: 'Valeur',
  Dettaglio: 'Détail',
  N: 'N',
  'osservazioni complete (k = {s1} predittori)':
    'observations complètes (k = {s1} prédicteurs)',
  R: 'R',
  'R²': 'R²',
  'quota di varianza spiegata': 'part de variance expliquée',
  'corretto per numero di predittori': 'ajusté pour le nombre de prédicteurs',
  'SE of estimate': 'SE de l’estimation',
  '√(SSE / {s1})': '√(SSE / {s1})',
  F: 'F',
  'F({s1}, {s2})': 'F({s1}, {s2})',
  'p (F)': 'p (F)',
  'test globale del modello': 'test global du modèle',
  AIC: 'AIC',
  'n·ln(SSE/n) + 2(k+1)': 'n·ln(SSE/n) + 2(k+1)',
  BIC: 'BIC',
  'n·ln(SSE/n) + ln(n)(k+1)': 'n·ln(SSE/n) + ln(n)(k+1)',
  'Durbin–Watson': 'Durbin–Watson',
  '≈2 assenza di autocorrelazione; ordine righe':
    '≈2 absence d’autocorrélation ; ordre des lignes',
  'R² e F assumono un modello con intercetta. AIC/BIC sono definiti a meno di una costante additiva.':
    'R² et F supposent un modèle avec intercept. AIC/BIC sont définis à une constante additive près.',
  'ANOVA del modello': 'ANOVA du modèle',
  Source: 'Source',
  SS: 'SS',
  df: 'dl',
  MS: 'MS',
  p: 'p',
  Coefficienti: 'Coefficients',
  'CI {s1}% · stima OLS': 'IC {s1} % · estimation OLS',
  Predictor: 'Prédicteur',
  B: 'B',
  SE: 'SE',
  'β std.': 'β std.',
  t: 't',
  'CI low': 'IC bas',
  'CI high': 'IC haut',
  Tolerance: 'Tolérance',
  VIF: 'VIF',
  'CI: B ± t({s1}%, df = {s2})·SE. β std. = B·SD(x)/SD(y).':
    'IC : B ± t({s1} %, dl = {s2})·SE. β std. = B·SD(x)/SD(y).',
  'VIF = 1/(1−R²_aux) da regressione del predittore sugli altri; valori > 5 indicano collinearità problematica.':
    'VIF = 1/(1−R²_aux) à partir de la régression du prédicteur sur les autres ; des valeurs > 5 indiquent une colinéarité problématique.',
  'Diagnostica del modello': 'Diagnostics du modèle',
  Nota: 'Note',
  'Leverage massimo': 'Levier maximal',
  'h_ii = x_iᵀ(XᵀX)⁻¹x_i': 'h_ii = x_iᵀ(XᵀX)⁻¹x_i',
  "Cook's D massimo": 'D de Cook maximal',
  'valori > 1 indicano osservazioni influenti':
    'des valeurs > 1 indiquent des observations influentes',
  "Cook's D > 1": 'D de Cook > 1',
  'numero di osservazioni': 'nombre d’observations',
  'Breusch–Pagan LM': 'Breusch–Pagan LM',
  'eteroschedasticità dei residui': 'hétéroscédasticité des résidus',
  'χ² con {s1} df': 'χ² avec {s1} dl',
  'White LM': 'White LM',
  'quadrati e prodotti incrociati dei predittori':
    'carrés et produits croisés des prédicteurs',
  'White p': 'p White',
  'RESET F (ŷ²)': 'RESET F (ŷ²)',
  'non linearità da potenze dei valori adattati':
    'non-linéarité due aux puissances des valeurs ajustées',
  'RESET p': 'p RESET',
  'F con 1 e df del modello aumentato':
    'F avec 1 et les dl du modèle augmenté',
  '|DFBETAS| massimo': '|DFBETAS| maximal',
  'influenza su singolo coefficiente': 'influence sur un seul coefficient',
  'DFBETAS oltre 2/√n': 'DFBETAS au-delà de 2/√n',
  'soglia {s1}': 'seuil {s1}',
  'Condition index massimo': 'Indice de condition maximal',
  'X scalato a norma unitaria; > 30 collinearità':
    'X mis à l’échelle de norme unitaire ; > 30 colinéarité',
  'Condition index > 30': 'Indice de condition > 30',
  'numero di dimensioni coinvolte': 'nombre de dimensions concernées',
  'outlier sui residui studentizzati': 'valeurs aberrantes sur les résidus studentisés',
  'Breusch–Pagan richiede l’ipotesi di normalità dei residui; con N piccolo ha potenza limitata.':
    'Breusch–Pagan exige l’hypothèse de normalité des résidus ; avec un petit N, il a une puissance limitée.',
  'White usa n·R² della regressione ausiliaria (quadrati e prodotti incrociati); RESET2 aggiunge ŷ². DFBETAS misura il cambio standardizzato di un coefficiente eliminando un’osservazione.':
    'White utilise le n·R² de la régression auxiliaire (carrés et produits croisés) ; RESET2 ajoute ŷ². DFBETAS mesure le changement standardisé d’un coefficient en supprimant une observation.',
  'Condition index di Belsley calcolato sugli autovalori di XᵀX dopo scala a norma unitaria: valori > 30 suggeriscono collinearità, > 100 sono gravi.':
    'Indice de condition de Belsley calculé sur les valeurs propres de XᵀX après mise à l’échelle de norme unitaire : des valeurs > 30 suggèrent une colinéarité, > 100 sont graves.',
  Mean: 'Moyenne',
  Median: 'Médiane',
  SD: 'SD',
  Min: 'Min',
  Max: 'Max',
  Skewness: 'Asymétrie',
  'Excess kurtosis': 'Aplatissement excessif',
  'Residui oltre 3 SD': 'Résidus au-delà de 3 SD',
  'Diagnostica dei residui': 'Diagnostics des résidus',
  'OLS vs Theil–Sen': 'OLS vs Theil–Sen',
  'Residui OLS': 'Résidus OLS',
  'Residui Theil–Sen': 'Résidus Theil–Sen',
  'I residui Theil–Sen sono disponibili per la regressione semplice; con più predittori il TS è univariato e non definisce un modello congiunto.':
    'Les résidus Theil–Sen sont disponibles pour la régression simple ; avec plusieurs prédicteurs, le TS est univarié et ne définit pas un modèle conjoint.',
  'Stimatore robusto Theil–Sen': 'Estimateur robuste Theil–Sen',
  Parametro: 'Paramètre',
  OLS: 'OLS',
  'Theil–Sen': 'Theil–Sen',
  'TS CI low': 'IC TS bas',
  'TS CI high': 'IC TS haut',
  Slope: 'Pente',
  Intercept: 'Intercept',
  'Theil–Sen: mediana delle pendenze tra tutte le coppie di punti; CI bootstrap percentile (600 repliche, seed fisso).':
    'Theil–Sen : médiane des pentes entre toutes les paires de points ; IC bootstrap par percentiles (600 réplicats, graine fixe).',
  'Stimatori robusti univariati': 'Estimateurs robustes univariés',
  'OLS B': 'B OLS',
  'Theil–Sen slope': 'Pente Theil–Sen',
  'Con più predittori il Theil–Sen è calcolato separatamente per ciascun predittore e non controlla gli altri: usarlo solo come diagnostica descrittiva.':
    'Avec plusieurs prédicteurs, le Theil–Sen est calculé séparément pour chaque prédicteur et ne contrôle pas les autres : à utiliser seulement comme diagnostic descriptif.',
  'Errori standard robusti': 'Erreurs standard robustes',
  '{s1} · CI {s2}%': '{s1} · IC {s2} %',
  'SE robusto': 'SE robuste',
  'HC1 = n/(n−k−1); HC3 = 1/(1−h)². La matrice di covarianza robusta non assume varianza costante.':
    'HC1 = n/(n−k−1) ; HC3 = 1/(1−h)². La matrice de covariance robuste ne suppose pas une variance constante.',
  'I gradi di libertà restano n−k−1; con pochi casi i test robusti sono instabili.':
    'Les degrés de liberté restent n−k−1 ; avec peu de cas, les tests robustes sont instables.',
};
