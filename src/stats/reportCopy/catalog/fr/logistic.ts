/** fr: report and table prose (normalised). */
export const logisticCopy: Record<string, string> = {
  '{s1} · N = {s2}':
    '{s1} · N = {s2}',
  '{s1} predittori pesano':
    '{s1} prédicteurs pèsent',
  '{s1}: OR = {s2} (CI {s3} – {s4}), p = {s5}: un’unità in più {s6} le probabilità dell’esito di circa {s7}%.':
    '{s1} : OR = {s2} (IC {s3} – {s4}), p = {s5} : une unité de plus {s6} les probabilités de l’événement d’environ {s7} %.',
  '{s1}%':
    '{s1}%',
  '1 predittore pesa':
    '1 prédicteur pèse',
  'Accuratezza':
    'Exactitude',
  'AIC':
    'AIC',
  'Almeno un coefficiente è molto grande: i dati separano quasi perfettamente gli esiti e le stime/SE non sono affidabili.':
    'Au moins un coefficient est très grand : les données séparent presque parfaitement les issues et les estimations/SE ne sont pas fiables.',
  'Assunzioni e cautele':
    'Hypothèses et précautions',
  'Attenzione: separazione':
    'Attention : séparation',
  'AUC':
    'AUC',
  'AUC = {s1}: probabilità che un caso con esito positivo riceva un punteggio più alto di un caso negativo. Accuratezza alla soglia scelta: {s2}.':
    'AUC = {s1} : probabilité qu’un cas avec issue positive reçoive un score plus élevé qu’un cas négatif. Exactitude au seuil choisi : {s2}.',
  'B':
    'B',
  'BIC':
    'BIC',
  'CI {s1}%':
    'IC {s1} %',
  'Classificazione':
    'Classification',
  'Coefficienti e odds ratio':
    'Coefficients et odds ratios',
  'Come leggere gli odds ratio':
    'Comment lire les odds ratios',
  'Cox–Snell R²':
    'Cox–Snell R²',
  'df':
    'dl',
  'Diagnostica':
    'Diagnostics',
  'Eventi (Y = 1)':
    'Événements (Y = 1)',
  'Eventi per parametro':
    'Événements par paramètre',
  'Firth penalized likelihood':
    'Vraisemblance pénalisée de Firth',
  'Gli esiti devono essere indipendenti tra loro (una riga = una unità).':
    'Les issues doivent être indépendantes entre elles (une ligne = une unité).',
  'Gli OR sono stimati al netto degli altri predittori e con un CI al {s1}%: un intervallo che contiene 1 corrisponde a un effetto non significativo.':
    'Les OR sont estimés toutes choses égales par ailleurs et avec un IC à {s1} % : un intervalle qui contient 1 correspond à un effet non significatif.',
  'I dati separano quasi perfettamente gli esiti: le stime non sono affidabili.':
    'Les données séparent presque parfaitement les issues : les estimations ne sont pas fiables.',
  'Il modello contiene {s1} predittore/i su {s2} osservazioni e {s3} eventi.':
    'Le modèle contient {s1} prédicteur(s) sur {s2} observations et {s3} événements.',
  'Il modello è significativo (LR p = {s1}) e {s2} sul risultato.':
    'Le modèle est significatif (p LR = {s1}) et {s2} sur le résultat.',
  'Il modello non è significativo (LR p = {s1}).':
    'Le modèle n’est pas significatif (p LR = {s1}).',
  'Il p è di Wald (z = B/SE): con campioni piccoli o effetti forti può essere meno affidabile del test LR.':
    'La p est celle de Wald (z = B/SE) : avec de petits échantillons ou des effets forts, elle peut être moins fiable que le test LR.',
  'Il test LR confronta il modello con quello che contiene solo l’intercetta: p piccolo = almeno un predittore aggiunge informazione.':
    'Le test LR compare le modèle à celui qui ne contient que l’intercept : une p petite = au moins un prédicteur ajoute de l’information.',
  'Il test LR vale {s1} con {s2} gradi di libertà: {s3}':
    'Le test LR vaut {s1} avec {s2} degrés de liberté : {s3}',
  'L’accuratezza dipende dalla soglia: riportala sempre insieme a sensibilità e specificità.':
    'L’exactitude dépend du seuil : rapportez-la toujours avec la sensibilité et la spécificité.',
  'L’AUC non dipende dalla soglia: 0,5 è il caso, 0,7 accettabile, 0,8 buono, 0,9 eccellente.':
    'L’AUC ne dépend pas du seuil : 0,5 correspond au hasard, 0,7 est acceptable, 0,8 bon, 0,9 excellent.',
  'L’intervallo dell’OR è calcolato su scala logaritmica: exp(B ± z·SE). Se contiene 1, l’effetto non è significativo.':
    'L’intervalle de l’OR est calculé sur l’échelle logarithmique : exp(B ± z·SE). S’il contient 1, l’effet n’est pas significatif.',
  'L’ipotesi nulla del test LR è “nessun predittore aggiunge informazione rispetto alla sola intercetta”; ogni coefficiente risponde invece alla domanda “questo predittore pesa, al netto degli altri?”.':
    'L’hypothèse nulle du test LR est « aucun prédicteur n’ajoute d’information par rapport à l’intercept seul » ; chaque coefficient répond en revanche à la question « ce prédicteur pèse-t-il, toutes choses égales par ailleurs ? ».',
  'L’odds ratio non è un rischio relativo: OR = 2 significa che gli odds raddoppiano, non che la probabilità raddoppia. Con esiti frequenti la differenza tra le due letture è grande, con esiti rari è piccola.':
    'L’odds ratio n’est pas un risque relatif : OR = 2 signifie que les odds doublent, pas que la probabilité double. Avec des issues fréquentes, la différence entre les deux lectures est grande ; avec des issues rares, elle est petite.',
  'La bontà di adattamento è riassunta da pseudo-R² e AUC: non sostituiscono un controllo dei residui per la forma della relazione.':
    'La qualité d’ajustement est résumée par les pseudo-R² et l’AUC : cela ne remplace pas un contrôle des résidus pour la forme de la relation.',
  'La lettura dei risultati':
    'La lecture des résultats',
  'La regressione logistica modella la probabilità di un esito binario (sì/no) in funzione di uno o più predittori, invece di modellare direttamente il valore medio come fa la regressione lineare.':
    'La régression logistique modélise la probabilité d’une issue binaire (oui/non) en fonction d’un ou plusieurs prédicteurs, au lieu de modéliser directement la valeur moyenne comme le fait la régression linéaire.',
  'La relazione tra predittore e logit della probabilità è lineare: con predittori continui controlla la forma o usa trasformazioni.':
    'La relation entre prédicteur et logit de la probabilité est linéaire : avec des prédicteurs continus, contrôlez la forme ou utilisez des transformations.',
  'La separazione (outcome predetto perfettamente) gonfia i coefficienti e invalida i test.':
    'La séparation (issue prédite parfaitement) gonfle les coefficients et invalide les tests.',
  'La soglia 0,5 è arbitraria: se il costo di un falso negativo è alto, abbassala e guarda come cambiano sensibilità e specificità.':
    'Le seuil de 0,5 est arbitraire : si le coût d’un faux négatif est élevé, abaissez-le et regardez comment la sensibilité et la spécificité changent.',
  'La verosimiglianza penalizzata di Firth mantiene finite le stime; gli errori standard restano approssimati.':
    'La vraisemblance pénalisée de Firth maintient les estimations finies ; les erreurs standard restent approchées.',
  'Le pseudo-R² non hanno il significato dell’R² lineare: valori intorno a 0,2–0,4 indicano già un buon adattamento.':
    'Les pseudo-R² n’ont pas la signification de l’R² linéaire : des valeurs autour de 0,2–0,4 indiquent déjà un bon ajustement.',
  'Log-verosimiglianza':
    'Log-vraisemblance',
  'Log-verosimiglianza nulla':
    'Log-vraisemblance nulle',
  'LR χ² (vs modello nullo)':
    'LR χ² (vs modèle nul)',
  'McFadden R²':
    'McFadden R²',
  'McFadden R² = {s1}: valori sopra 0,2 indicano un modello con potere esplicativo reale, ma non vanno confrontati con l’R² della regressione lineare.':
    'McFadden R² = {s1} : des valeurs supérieures à 0,2 indiquent un modèle au pouvoir explicatif réel, mais elles ne doivent pas être comparées à l’R² de la régression linéaire.',
  'Metrica':
    'Métrique',
  'Modello debole':
    'Modèle faible',
  'Modello informativo':
    'Modèle informatif',
  'Modello logistico':
    'Modèle logistique',
  'Nagelkerke R²':
    'Nagelkerke R²',
  'non calcolabile.':
    'non calculable.',
  'non rifiuta l’ipotesi che nessun predittore conti.':
    'ne rejette pas l’hypothèse qu’aucun prédicteur ne compte.',
  'Non sono inclusi modelli con effetti casuali, interazioni, regressione penalizzata o aggiustamento per dati sbilanciati.':
    'Les modèles avec effets aléatoires, interactions, régression pénalisée ou ajustement pour données déséquilibrées ne sont pas inclus.',
  'OR':
    'OR',
  'OR > 1 aumenta le probabilità dell’esito per un’unità in più del predittore; OR < 1 le riduce. OR = 1 non ha effetto.':
    'OR > 1 augmente les probabilités de l’événement pour une unité de plus du prédicteur ; OR < 1 les réduit. OR = 1 n’a pas d’effet.',
  'OR CI high':
    'IC OR haut',
  'OR CI low':
    'IC OR bas',
  'Osservazioni':
    'Observations',
  'p':
    'p',
  'p del modello':
    'p du modèle',
  'Predittore':
    'Prédicteur',
  'Quanto discrimina il modello':
    'Quelle est la discrimination du modèle',
  'Raccogli più casi, riduci i predittori o usa una regressione penalizzata (Firth).':
    'Recueillez plus de cas, réduisez les prédicteurs ou utilisez une régression pénalisée (Firth).',
  'Report di lettura':
    'Rapport de lecture',
  'rifiuta l’ipotesi che nessun predittore conti.':
    'rejette l’hypothèse qu’aucun prédicteur ne compte.',
  'SE':
    'SE',
  'Sensibilità':
    'Sensibilité',
  'Separazione gestita da Firth':
    'Séparation gérée par Firth',
  'Servono eventi sufficienti: meno di 10 eventi per parametro rende le stime instabili (regola pratica EPV).':
    'Il faut suffisamment d’événements : moins de 10 événements par paramètre rend les estimations instables (règle pratique EPV).',
  'soglia p ≥ {s1} → Y = 1':
    'seuil p ≥ {s1} → Y = 1',
  'Specificità':
    'Spécificité',
  'stima di massima verosimiglianza':
    'estimation de maximum de vraisemblance',
  'Valore':
    'Valeur',
  'Wald z':
    'Wald z',
};
