/** fr: report and table prose (normalised). */
export const timeseriesCopy: Record<string, string> = {
  ' · periodo stagionale = {s1}':
    ' · période saisonnière = {s1}',
  ' (ADF p ≈ {s1} resta solo informativo)':
    ' (la p ADF ≈ {s1} reste seulement informative)',
  ', compatibile con una successione casuale':
    ', compatible avec une succession aléatoire',
  ', la successione non è casuale':
    ', la succession n’est pas aléatoire',
  '{s1} = {s2} ({s3}): {s4}.':
    '{s1} = {s2} ({s3}) : {s4}.',
  'ACF':
    'ACF',
  'Attenzione: almeno una radice è vicina o dentro il cerchio unitario, quindi la stima è al limite della regione ammissibile e le previsioni vanno lette con prudenza.':
    'Attention : au moins une racine est proche ou à l’intérieur du cercle unité, donc l’estimation est à la limite de la région admissible et les prévisions doivent être lues avec prudence.',
  'Autocorrelazione e autocorrelazione parziale':
    'Autocorrélation et autocorrélation partielle',
  'autocorrelazione presente':
    'autocorrélation présente',
  'banda di confidenza ±1,96/√N = ±{s1}':
    'bande de confiance ±1,96/√N = ±{s1}',
  'Barre oltre la banda indicano autocorrelazione non spiegata dal caso.':
    'Des barres au-delà de la bande indiquent une autocorrélation non expliquée par le hasard.',
  'batte il riferimento più semplice (RMSE {s1})':
    'bat la référence la plus simple (RMSE {s1})',
  'c’è un {s1} (Mann–Kendall p = {s2})':
    'il y a une {s1} (p de Mann–Kendall = {s2})',
  'circa {s1} deviazioni standard':
    'environ {s1} écarts-types',
  'compatibile con il caso':
    'compatible avec le hasard',
  'Con orizzonti lunghi l’errore cresce: oltre un ciclo stagionale le previsioni vanno lette come indicazione di direzione.':
    'Avec de longs horizons, l’erreur augmente : au-delà d’un cycle saisonnier, les prévisions doivent être lues comme une indication de direction.',
  'Confronto dei modelli di previsione':
    'Comparaison des modèles de prévision',
  'Dettaglio':
    'Détail',
  'Deviazione standard':
    'Écart-type',
  'Differenziazione: {s1}; scelta {s2}. {s3}':
    'Différenciation : {s1} ; choix {s2}. {s3}',
  'è sostanzialmente equivalente al riferimento più semplice (RMSE {s1})':
    'est sensiblement équivalent à la référence la plus simple (RMSE {s1})',
  'Errore standard residuo':
    'Erreur standard résiduelle',
  'Errore standard residuo sulla scala modellata: {s1} su {s2} osservazioni efficaci.':
    'Erreur standard résiduelle sur l’échelle modélisée : {s1} sur {s2} observations efficaces.',
  'errore su un campione di validazione (ultimo 20% della serie)':
    'erreur sur un échantillon de validation (derniers 20 % de la série)',
  'Forza della stagionalità':
    'Force de la saisonnalité',
  'Forza della stagionalità = {s1} (0 = nessuna, 1 = stagionalità dominante).':
    'Force de la saisonnalité = {s1} (0 = aucune, 1 = saisonnalité dominante).',
  'Gli indici per posizione nel ciclo dicono quali periodi stanno sopra o sotto la tendenza: sono scostamenti medi, non valori assoluti.':
    'Les indices par position dans le cycle indiquent quelles périodes se situent au-dessus ou en dessous de la tendance : ce sont des écarts moyens, pas des valeurs absolues.',
  'Gli indici sono scostamenti medi dal trend, centrati su zero: valori positivi indicano periodi sopra la tendenza.':
    'Les indices sont des écarts moyens à la tendance, centrés sur zéro : des valeurs positives indiquent des périodes au-dessus de la tendance.',
  'Gli intervalli di previsione non includono l’incertezza sulla stima dei parametri né sulla scelta dell’ordine; volatilità condizionale (GARCH) e regressori esterni non sono modellati.':
    'Les intervalles de prévision n’incluent pas l’incertitude sur l’estimation des paramètres ni sur le choix de l’ordre ; la volatilité conditionnelle (GARCH) et les régresseurs externes ne sont pas modélisés.',
  'Gli intervalli includono l’accumulo di incertezza dovuto alla differenziazione, ma non l’incertezza sulla stima dei parametri né quella sulla scelta dell’ordine.':
    'Les intervalles incluent l’accumulation d’incertitude due à la différenciation, mais pas l’incertitude sur l’estimation des paramètres ni celle sur le choix de l’ordre.',
  'il distacco dal secondo classificato è Δ AICc = {s1}, quindi la scelta è netta':
    'l’écart avec le deuxième classé est Δ AICc = {s1}, donc le choix est net',
  'Il MAPE non è definito quando la serie contiene zeri.':
    'Le MAPE n’est pas défini lorsque la série contient des zéros.',
  'Il modello {s1} porta la previsione da {s2} al passo {s3} a {s4} al passo {s5}, su {s6} passi.':
    'Le modèle {s1} fait passer la prévision de {s2} au pas {s3} à {s4} au pas {s5}, sur {s6} pas.',
  'Il modello migliore in validazione è {s1} (RMSE = {s2}, MAE = {s3}): qualità {s4} rispetto alla variabilità della serie.':
    'Le meilleur modèle en validation est {s1} (RMSE = {s2}, MAE = {s3}) : qualité {s4} par rapport à la variabilité de la série.',
  'il secondo classificato è a Δ AICc = {s1}, quindi i dati non distinguono nettamente i due ordini':
    'le deuxième classé est à Δ AICc = {s1}, donc les données ne distinguent pas nettement les deux ordres',
  'Il test ADF non è calcolabile su questa serie: la differenziazione va decisa a mano.':
    'Le test ADF n’est pas calculable sur cette série : la différenciation doit être décidée manuellement.',
  'Il test ADF sulla serie dà p ≈ {s1}: {s2}.':
    'Le test ADF sur la série donne p ≈ {s1} : {s2}.',
  'Il test dei runs verifica che l’ordine dei valori sia casuale, non la loro distribuzione.':
    'Le test des runs vérifie que l’ordre des valeurs est aléatoire, pas leur distribution.',
  'Il test di autocorrelazione sui residui non è calcolabile.':
    'Le test d’autocorrélation sur les résidus n’est pas calculable.',
  'Imposta un periodo stagionale (per esempio 12 per dati mensili, 4 per trimestrali) per stimare gli indici e scomporre la serie.':
    'Définissez une période saisonnière (par exemple 12 pour des données mensuelles, 4 pour des trimestrielles) pour estimer les indices et décomposer la série.',
  'In validazione sugli ultimi {s1} valori l’RMSE è {s2} e il modello {s3}.':
    'En validation sur les {s1} dernières valeurs, le RMSE est {s2} et le modèle {s3}.',
  'Indice':
    'Indice',
  'Indici stagionali':
    'Indices saisonniers',
  'Intervallo al {s1}%: {s2} – {s3} al primo passo e {s4} – {s5} all’ultimo; l’ampiezza passa da {s6} a {s7}, come ci si aspetta quando l’orizzonte cresce.':
    'Intervalle à {s1} % : {s2} – {s3} au premier pas et {s4} – {s5} au dernier ; l’amplitude passe de {s6} à {s7}, comme attendu lorsque l’horizon augmente.',
  'L’ACF misura quanto un valore è correlato con quelli precedenti. Se le barre restano dentro la banda ±1,96/√N, la serie non mostra memoria temporale; se escono, il passato contiene informazione sul presente.':
    'L’ACF mesure dans quelle mesure une valeur est corrélée aux précédentes. Si les barres restent dans la bande ±1,96/√N, la série ne montre pas de mémoire temporelle ; si elles en sortent, le passé contient de l’information sur le présent.',
  'L’analisi descrittiva di una serie storica verifica se i valori sono indipendenti dal tempo: trend, autocorrelazione e stagionalità sono le tre strutture che rendono una serie diversa da un campione casuale.':
    'L’analyse descriptive d’une série temporelle vérifie si les valeurs sont indépendantes du temps : tendance, autocorrélation et saisonnalité sont les trois structures qui rendent une série différente d’un échantillon aléatoire.',
  'la componente stagionale domina la variabilità attorno al trend.':
    'la composante saisonnière domine la variabilité autour de la tendance.',
  'la componente stagionale è presente ma non domina la variabilità attorno al trend.':
    'la composante saisonnière est présente mais ne domine pas la variabilité autour de la tendance.',
  'La differenziazione è impostata a mano, quindi l’ordine non dipende dai test{s1}.':
    'La différenciation est réglée manuellement, donc l’ordre ne dépend pas des tests{s1}.',
  'La forza della stagionalità è {s1}: {s2}':
    'La force de la saisonnalité est {s1} : {s2}',
  'La PACF isola la correlazione al lag k al netto dei lag intermedi: un taglio netto dopo il lag 1 suggerisce un processo AR(1).':
    'La PACF isole la corrélation au décalage k, nette des décalages intermédiaires : une coupure nette après le décalage 1 suggère un processus AR(1).',
  'La pendenza di Sen è la mediana delle pendenze tra tutte le coppie di punti: è robusta agli outlier.':
    'La pente de Sen est la médiane des pentes entre toutes les paires de points : elle est robuste aux valeurs aberrantes.',
  'la radice unitaria non è rifiutata, quindi almeno una differenziazione serve':
    'la racine unitaire n’est pas rejetée, donc au moins une différenciation est nécessaire',
  'La ricerca automatica sull\'ordine ha scelto {s1} (AICc = {s2}): {s3}.':
    'La recherche automatique sur l’ordre a choisi {s1} (AICc = {s2}) : {s3}.',
  'La ricerca degli ordini è limitata a p e q ≤ 2 (≤ 1 con meno di 30 osservazioni) e a un termine stagionale AR e MA: ordini maggiori non vengono esplorati.':
    'La recherche des ordres est limitée à p et q ≤ 2 (≤ 1 avec moins de 30 observations) et à un terme saisonnier AR et MA : les ordres supérieurs ne sont pas explorés.',
  'La scomposizione è additiva; con ampiezza stagionale proporzionale al livello serve un modello moltiplicativo.':
    'La décomposition est additive ; avec une amplitude saisonnière proportionnelle au niveau, il faut un modèle multiplicatif.',
  'La serie è troppo corta per confrontare modelli di previsione.':
    'La série est trop courte pour comparer des modèles de prévision.',
  'La serie non permette di stimare un modello ARIMA: le previsioni restano quelle dei modelli semplici.':
    'La série ne permet pas d’estimer un modèle ARIMA : les prévisions restent celles des modèles simples.',
  'la stazionarietà non è rifiutata, quindi la serie non va differenziata':
    'la stationnarité n’est pas rejetée, donc la série ne doit pas être différenciée',
  'La stima ARIMA è condizionale (somma dei quadrati dei residui) e non a massima verosimiglianza esatta: con serie molto corte i primi residui pesano di più.':
    'L’estimation ARIMA est conditionnelle (somme des carrés des résidus) et non à maximum de vraisemblance exact : avec des séries très courtes, les premiers résidus pèsent davantage.',
  'Lag':
    'Décalage',
  'le autocorrelazioni non sono congiuntamente significative (Ljung–Box p = {s1}): non emerge una struttura temporale forte':
    'les autocorrélations ne sont pas conjointement significatives (p de Ljung–Box = {s1}) : aucune structure temporelle forte n’apparaît',
  'le autocorrelazioni sono congiuntamente significative (Ljung–Box p = {s1}): i valori dipendono dai precedenti':
    'les autocorrélations sont conjointement significatives (p de Ljung–Box = {s1}) : les valeurs dépendent des précédentes',
  'Le previsioni non hanno una validazione fuori campione: l’errore in campione è ottimista perché i parametri sono stati stimati sugli stessi dati.':
    'Les prévisions n’ont pas de validation hors échantillon : l’erreur dans l’échantillon est optimiste car les paramètres ont été estimés sur les mêmes données.',
  'Le previsioni sono puntuali: non incorporano l’incertezza del modello né quella dei dati.':
    'Les prévisions sont ponctuelles : elles n’intègrent ni l’incertitude du modèle ni celle des données.',
  'Le prime e le ultime osservazioni non hanno trend stimato: la media mobile centrata non è definita ai bordi.':
    'Les premières et dernières observations n’ont pas de tendance estimée : la moyenne mobile centrée n’est pas définie aux bords.',
  'Le prossime {s1} previsioni partono da {s2} e arrivano a {s3}.':
    'Les {s1} prochaines prévisions partent de {s2} et arrivent à {s3}.',
  'Le radici AR e MA stanno fuori dal cerchio unitario: il modello è stazionario e invertibile, quindi le previsioni convergono invece di divergere.':
    'Les racines AR et MA sont à l’extérieur du cercle unité : le modèle est stationnaire et inversible, donc les prévisions convergent au lieu de diverger.',
  'Lettura':
    'Lecture',
  'Limite alto':
    'Limite haute',
  'Limite basso':
    'Limite basse',
  'Ljung–Box (lag 1–{s1})':
    'Ljung–Box (décalage 1–{s1})',
  'Ljung–Box verifica se le prime autocorrelazioni sono congiuntamente nulle.':
    'Ljung–Box vérifie si les premières autocorrélations sont conjointement nulles.',
  'Ljung–Box: Q = {s1} con p = {s2}. {s3}.':
    'Ljung–Box : Q = {s1} avec p = {s2}. {s3}.',
  'MAE':
    'MAE',
  'Mann–Kendall (trend)':
    'Mann–Kendall (tendance)',
  'Mann–Kendall è non parametrico e resistente agli outlier: p piccolo indica una tendenza monotona.':
    'Mann–Kendall est non paramétrique et résistant aux valeurs aberrantes : une p petite indique une tendance monotone.',
  'MAPE %':
    'MAPE %',
  'Massimo':
    'Maximum',
  'Media':
    'Moyenne',
  'Metrica':
    'Métrique',
  'Minimo':
    'Minimum',
  'Modello':
    'Modèle',
  'Modello {s1}':
    'Modèle {s1}',
  'modello additivo · periodo {s1}':
    'modèle additif · période {s1}',
  'molto buona':
    'très bonne',
  'N = {s1}{s2}':
    'N = {s1}{s2}',
  'Nessun termine AR o MA significativo: il modello si riduce a una media (o a un drift) più rumore.':
    'Aucun terme AR ou MA significatif : le modèle se réduit à une moyenne (ou à une dérive) plus du bruit.',
  'nessun trend monotono':
    'aucune tendance monotone',
  'nessuna autocorrelazione residua, il modello ha catturato la memoria della serie':
    'aucune autocorrélation résiduelle, le modèle a capté la mémoire de la série',
  'nessuna autocorrelazione rilevante':
    'aucune autocorrélation notable',
  'non batte il riferimento più semplice (RMSE {s1}): la struttura aggiuntiva non ripaga':
    'ne bat pas la référence la plus simple (RMSE {s1}) : la structure supplémentaire ne se rentabilise pas',
  'non c’è evidenza di un {s1} (Mann–Kendall p = {s2})':
    'aucune preuve d’une {s1} (p de Mann–Kendall = {s2})',
  'non calcolabile':
    'non calculable',
  'non ci sono altri ordini confrontabili':
    'il n’y a pas d’autres ordres comparables',
  'Non è stato possibile stimare un modello ARIMA su questa serie: le previsioni mostrate sono quelle dei modelli semplici.':
    'Il n’a pas été possible d’estimer un modèle ARIMA sur cette série : les prévisions affichées sont celles des modèles simples.',
  'orizzonte {s1} passi':
    'horizon {s1} pas',
  'Osservazioni':
    'Observations',
  'Osservazioni efficaci':
    'Observations efficaces',
  'p':
    'p',
  'PACF':
    'PACF',
  'Passo':
    'Étape',
  'Pendenza di Sen':
    'Pente de Sen',
  'Pendenza di Sen = {s1} per passo: {s2} mediana, robusta agli outlier.':
    'Pente de Sen = {s1} par pas : {s2} médiane, robuste aux valeurs aberrantes.',
  'Posizione nel ciclo':
    'Position dans le cycle',
  'Previsione':
    'Prévision',
  'Previsioni ({s1})':
    'Prévisions ({s1})',
  'Primo valore':
    'Première valeur',
  'Questi modelli servono da riferimento: il migliore viene confrontato con l’ARIMA, che è il modello usato per le previsioni con intervalli.':
    'Ces modèles servent de référence : le meilleur est comparé à l’ARIMA, qui est le modèle utilisé pour les prévisions avec intervalles.',
  'Qui {s1}, e {s2}.':
    'Ici {s1}, et {s2}.',
  'Report di lettura':
    'Rapport de lecture',
  'Residui: Ljung–Box {s1} → {s2}.':
    'Résidus : Ljung–Box {s1} → {s2}.',
  'Residuo':
    'Résidu',
  'resta autocorrelazione non spiegata, l’ordine andrebbe rivisto':
    'il reste de l’autocorrélation non expliquée, l’ordre devrait être revu',
  'RMSE':
    'RMSE',
  'RMSE e MAE sono nella stessa unità della serie; il MAPE è percentuale e non è definito se la serie contiene zeri.':
    'RMSE et MAE sont dans la même unité que la série ; le MAPE est en pourcentage et n’est pas défini si la série contient des zéros.',
  'scala non calcolabile':
    'échelle non calculable',
  'scarsa (peggio della media)':
    'faible (pire que la moyenne)',
  'Scelta della differenziazione':
    'Choix de la différenciation',
  'Scomposizione':
    'Décomposition',
  'Serie':
    'Série',
  'serie = trend + stagionalità + residuo':
    'série = tendance + saisonnalité + résidu',
  'Serie di {s1} osservazioni: {s2}.':
    'Série de {s1} observations : {s2}.',
  'serie non casuale':
    'série non aléatoire',
  'Serie storica':
    'Série temporelle',
  'Serie troppo corta per una validazione fuori campione: l’errore disponibile è quello di adattamento.':
    'Série trop courte pour une validation hors échantillon : l’erreur disponible est celle de l’ajustement.',
  'Sintesi della serie':
    'Synthèse de la série',
  'Sono previsioni puntuali: l’intervallo di incertezza crescerebbe con l’orizzonte e non è incluso.':
    'Ce sont des prévisions ponctuelles : l’intervalle d’incertitude augmenterait avec l’horizon et n’est pas inclus.',
  'Stagionalità':
    'Saisonnalité',
  'Stagionalità non richiesta':
    'Saisonnalité non demandée',
  'Statistica':
    'Statistique',
  'Su questa base viene stimato un modello ARIMA/SARIMA: memoria e stagionalità stimate servono a costruire previsioni con intervalli, non solo a descrivere la serie.':
    'Sur cette base, un modèle ARIMA/SARIMA est estimé : la mémoire et la saisonnalité estimées servent à construire des prévisions avec intervalles, et pas seulement à décrire la série.',
  't':
    't',
  'termine non significativo, il suo contributo non si distingue dal caso':
    'terme non significatif, sa contribution ne se distingue pas du hasard',
  'termine significativo, aggiunge memoria al modello':
    'terme significatif, il ajoute de la mémoire au modèle',
  'Test':
    'Test',
  'Test ADF sulla serie':
    'Test ADF sur la série',
  'Test dei runs: p = {s1}{s2}.':
    'Test des runs : p = {s1}{s2}.',
  'Test di casualità e trend':
    'Tests de caractère aléatoire et de tendance',
  'Trend':
    'Tendance',
  'trend {s1}':
    'tendance {s1}',
  'trend crescente':
    'tendance croissante',
  'trend decrescente':
    'tendance décroissante',
  'Trend e casualità':
    'Tendance et caractère aléatoire',
  'Trend, stagionalità e previsioni assumono che il futuro continui il pattern osservato: cambi di regime non sono previsti.':
    'Tendance, saisonnalité et prévisions supposent que le futur poursuit le motif observé : les changements de régime ne sont pas prévus.',
  'Ultimo valore':
    'Dernière valeur',
  'Validazione fuori campione: RMSE = {s1}, MAE = {s2}; il modello {s3}.':
    'Validation hors échantillon : RMSE = {s1}, MAE = {s2} ; le modèle {s3}.',
  'Valore':
    'Valeur',
  'Variazione dal primo all’ultimo valore: {s1} ({s2}).':
    'Variation du premier au dernier valeur : {s1} ({s2}).',
  'Variazione totale':
    'Variation totale',
  'Wald–Wolfowitz (runs)':
    'Wald–Wolfowitz (runs)',
};
