/** fr: report and table prose (normalised). */
export const coxCopy: Record<string, string> = {
  ' Qui ci sono {s1} osservazioni, {s2} eventi e {s3} censurati.':
    ' Ici, il y a {s1} observations, {s2} événements et {s3} censurés.',
  '; B = {s1}':
    ' ; B = {s1}',
  '{s1} osservazioni · {s2} eventi · {s3} covariariate':
    '{s1} observations · {s2} événements · {s3} covariables',
  '{s1}: HR = {s2} ({s3} – {s4}), {s5} → {s6}{s7}.':
    '{s1} : HR = {s2} ({s3} – {s4}), {s5} → {s6}{s7}.',
  '{s1}: stima instabile (B = {s2}, errore standard = {s3}), coerente con separazione quasi completa: l’hazard ratio non è interpretabile.':
    '{s1} : estimation instable (B = {s2}, erreur standard = {s3}), cohérente avec une séparation presque complète : l’hazard ratio n’est pas interprétable.',
  '{s1}: stima non disponibile.':
    '{s1} : estimation non disponible.',
  'A rischio':
    'À risque',
  'AIC':
    'AIC',
  'AIC = {s1}: utile solo per confrontare modelli stimati sugli stessi dati.':
    'AIC = {s1} : utile seulement pour comparer des modèles estimés sur les mêmes données.',
  'almeno un coefficiente è diverso da zero':
    'au moins un coefficient est différent de zéro',
  'Avviso {s1}':
    'Avertissement {s1}',
  'B':
    'B',
  'B è il logaritmo dell’hazard ratio: B > 0 indica rischio maggiore quando la covariata aumenta.':
    'B est le logarithme de l’hazard ratio : B > 0 indique un risque plus élevé lorsque la covariable augmente.',
  'buona capacità di ordinare i tempi':
    'bonne capacité à ordonner les temps',
  'Censurati':
    'Censurés',
  'Coefficienti e hazard ratio':
    'Coefficients et hazard ratios',
  'Come leggere i numeri':
    'Comment lire les nombres',
  'Come regola pratica servono almeno 10 eventi per covariata: sotto questa soglia le stime sono instabili.':
    'En règle pratique, il faut au moins 10 événements par covariable : en dessous de ce seuil, les estimations sont instables.',
  'Con campioni grandi i tre test convergono; con pochi eventi il rapporto di verosimiglianza è il più affidabile.':
    'Avec de grands échantillons, les trois tests convergent ; avec peu d’événements, le rapport de vraisemblance est le plus fiable.',
  'Concordanza (C di Harrell)':
    'Concordance (C de Harrell)',
  'Concordanza C = {s1}: {s2}.':
    'Concordance C = {s1} : {s2}.',
  'Convergenza':
    'Convergence',
  'Covariata':
    'Covariable',
  'Covariati':
    'Covariables',
  'df':
    'dl',
  'discriminazione discreta':
    'discrimination correcte',
  'discriminazione modesta':
    'discrimination modeste',
  'È un test asintotico e con pochi eventi ha poca potenza: l’assenza di significatività non prova i rischi proporzionali.':
    'C’est un test asymptotique et, avec peu d’événements, il a peu de puissance : l’absence de significativité ne prouve pas les risques proportionnels.',
  'effetto che cambia nel tempo: l’ipotesi di rischi proporzionali è messa in discussione':
    'effet qui change au cours du temps : l’hypothèse de risques proportionnels est remise en cause',
  'Effetto rilevato':
    'Effet détecté',
  'Errore std.':
    'Erreur std.',
  'Eventi':
    'Événements',
  'Eventi per covariata':
    'Événements par covariable',
  'Eventi per covariata: {s1}. Sotto 10 le stime diventano fragili e il modello può essere sovra-adattato.':
    'Événements par covariable : {s1}. En dessous de 10, les estimations deviennent fragiles et le modèle peut être surajusté.',
  'H₀(t)':
    'H₀(t)',
  'H₀(t) è il rischio cumulato valutato al profilo medio delle covariariate: un profilo ipotetico ma stabile numericamente anche con età o punteggi lontani da zero.':
    'H₀(t) est le risque cumulé évalué au profil moyen des covariables : un profil hypothétique mais numériquement stable même avec des âges ou des scores éloignés de zéro.',
  'HR':
    'HR',
  'HR = 1 significa nessun effetto; l’intervallo che contiene 1 è coerente con l’assenza di associazione.':
    'HR = 1 signifie aucun effet ; l’intervalle qui contient 1 est cohérent avec l’absence d’association.',
  'HR = 1: nessun effetto. HR > 1: rischio maggiore per valori più alti della covariata. HR < 1: effetto protettivo.':
    'HR = 1 : aucun effet. HR > 1 : risque plus élevé pour des valeurs plus hautes de la covariable. HR < 1 : effet protecteur.',
  'HR high':
    'HR haut',
  'HR low':
    'HR bas',
  'I censurati restano a rischio finché sono osservati: Cox usa questa informazione, mentre scartarli o trattarli come eventi distorce le stime.':
    'Les censurés restent à risque tant qu’ils sont observés : Cox utilise cette information, alors que les écarter ou les traiter comme des événements fausse les estimations.',
  'I p-value sono test di Wald e non tengono conto dell’incertezza sugli altri coefficienti.':
    'Les valeurs p sont des tests de Wald et ne tiennent pas compte de l’incertitude sur les autres coefficients.',
  'I rischi proporzionali sono un’assunzione del modello: il test riportato è asintotico e con pochi eventi ha poca potenza.':
    'Les risques proportionnels sont une hypothèse du modèle : le test rapporté est asymptotique et, avec peu d’événements, il a peu de puissance.',
  'I tempi di evento uguali sono gestiti con l’approssimazione di Breslow, che con molti pareggi può sottostimare lievemente gli errori standard.':
    'Les temps d’événement égaux sont gérés avec l’approximation de Breslow, qui avec beaucoup d’ex æquo peut légèrement sous-estimer les erreurs standard.',
  'IC {s1}% · HR per un’unità di incremento della covariata':
    'IC {s1} % · HR pour une unité d’incrément de la covariable',
  'IC dell’HR che non contiene 1 è coerente con un test di Wald significativo; l’intervallo è moltiplicativo, quindi 0,5 e 2 sono effetti simmetrici.':
    'Un IC du HR qui ne contient pas 1 est cohérent avec un test de Wald significatif ; l’intervalle est multiplicatif, donc 0,5 et 2 sont des effets symétriques.',
  'Il modello di Cox non è stimabile con i dati disponibili.':
    'Le modèle de Cox n’est pas estimable avec les données disponibles.',
  'Il modello è significativo (LR χ² = {s1}, {s2}) e la covariata più forte è {s3} (HR = {s4}).':
    'Le modèle est significatif (LR χ² = {s1}, {s2}) et la covariable la plus forte est {s3} (HR = {s4}).',
  'Il modello nel suo insieme':
    'Le modèle dans son ensemble',
  'Il modello non è significativo (LR χ² = {s1}, {s2}): le covariariate non spiegano i tempi di evento meglio del caso.':
    'Le modèle n’est pas significatif (LR χ² = {s1}, {s2}) : les covariables n’expliquent pas les temps d’événement mieux que le hasard.',
  'il modello spiega i tempi meglio del nulla':
    'le modèle explique les temps mieux que le modèle nul',
  'Il profilo di rischio cambia con {s1}: per ogni unità in più l’hazard ratio è {s2}. Riporta sempre l’IC e il numero di eventi, e verifica se l’effetto è stabile nei sottogruppi.':
    'Le profil de risque change avec {s1} : pour chaque unité de plus, l’hazard ratio est {s2}. Rapportez toujours l’IC et le nombre d’événements, et vérifiez si l’effet est stable dans les sous-groupes.',
  'Il test aggiunge un coefficiente per covariata × log(t): se quel coefficiente è diverso da zero l’effetto cambia con il tempo.':
    'Le test ajoute un coefficient pour covariable × log(t) : si ce coefficient est différent de zéro, l’effet change avec le temps.',
  'Il test confronta il modello con uno che aggiunge covariata × log(t): un p piccolo segnala che l’effetto non è costante.':
    'Le test compare le modèle à un modèle qui ajoute covariable × log(t) : une p petite signale que l’effet n’est pas constant.',
  'Il test globale dà {s1}: l’effetto di almeno una covariata sembra cambiare nel tempo. Il modello resta una sintesi media, ma HR unico e curve di sopravvivenza previste vanno presentati con prudenza; valuta interazioni con il tempo o modelli stratificati.':
    'Le test global donne {s1} : l’effet d’au moins une covariable semble changer au cours du temps. Le modèle reste une synthèse moyenne, mais un HR unique et les courbes de survie prévues doivent être présentés avec prudence ; envisagez des interactions avec le temps ou des modèles stratifiés.',
  'Il test globale dà {s1}: non emerge un cambiamento dell’effetto nel tempo, quindi l’ipotesi di rischi proporzionali è compatibile con i dati.':
    'Le test global donne {s1} : aucun changement de l’effet au cours du temps n’apparaît, donc l’hypothèse de risques proportionnels est compatible avec les données.',
  'Il test score valutato in β = 0 coincide, per una sola covariata dicotomica, con il log-rank.':
    'Le test du score évalué en β = 0 coïncide, pour une seule covariable dichotomique, avec le log-rank.',
  'In pratica':
    'En pratique',
  'ipotesi nulla: tutti i coefficienti uguali a zero':
    'hypothèse nulle : tous les coefficients égaux à zéro',
  'Iterazioni':
    'Itérations',
  'L’hazard ratio confronta il rischio istantaneo di evento per un incremento unitario della covariata, a parità delle altre: HR = 2 significa rischio doppio in ogni istante, non durata doppia.':
    'L’hazard ratio compare le risque instantané d’événement pour un incrément unitaire de la covariable, toutes choses égales par ailleurs : HR = 2 signifie un risque doublé à chaque instant, pas une durée doublée.',
  'La C di Harrell misura l’ordinamento dei tempi, non la calibrazione: un modello può ordinare bene e sbagliare le probabilità assolute.':
    'La C de Harrell mesure l’ordonnancement des temps, pas la calibration : un modèle peut bien ordonner et se tromper sur les probabilités absolues.',
  'La C di Harrell misura la capacità del modello di ordinare i tempi: 0,5 = caso, 1 = ordine perfetto.':
    'La C de Harrell mesure la capacité du modèle à ordonner les temps : 0,5 = hasard, 1 = ordre parfait.',
  'La regressione di Cox mette in relazione il tempo fino all’evento con una o più covariariate, senza assumere una forma specifica per il rischio di base.{s1}':
    'La régression de Cox relie le temps jusqu’à l’événement à une ou plusieurs covariables, sans supposer une forme précise pour le risque de base.{s1}',
  'La relazione tra covariata e log-rischio è assunta lineare: per effetti non lineari servono trasformazioni o spline.':
    'La relation entre covariable et log-risque est supposée linéaire : pour des effets non linéaires, il faut des transformations ou des splines.',
  'La sopravvivenza di base è valutata al profilo medio delle covariariate e può non corrispondere a un soggetto reale.':
    'La survie de base est évaluée au profil moyen des covariables et peut ne pas correspondre à un sujet réel.',
  'La stima è al limite della regione ammissibile: una covariata predice quasi perfettamente chi ha l’evento. Il coefficiente e l’hazard ratio non vanno riportati come effetto; riduci le covariariate del modello, controlla se la variabile è una conseguenza dell’esito o usa un test esatto.':
    'L’estimation est à la limite de la région admissible : une covariable prédit presque parfaitement qui a l’événement. Le coefficient et l’hazard ratio ne doivent pas être rapportés comme un effet ; réduisez les covariables du modèle, vérifiez si la variable est une conséquence de l’issue ou utilisez un test exact.',
  'La verosimiglianza parziale di Cox non richiede di specificare la forma della funzione di rischio di base.':
    'La vraisemblance partielle de Cox ne demande pas de préciser la forme de la fonction de risque de base.',
  'Le covariariate non mostrano un’associazione affidabile con il tempo di evento. Con pochi eventi il modello ha poca potenza: l’assenza di significatività non dimostra l’assenza di effetto.':
    'Les covariables ne montrent pas d’association fiable avec le temps d’événement. Avec peu d’événements, le modèle a peu de puissance : l’absence de significativité ne prouve pas l’absence d’effet.',
  'le covariariate sono associate al rischio già senza stima completa':
    'les covariables sont associées au risque même sans estimation complète',
  'Lettura':
    'Lecture',
  'Log-verosimiglianza':
    'Log-vraisemblance',
  'Log-verosimiglianza nulla':
    'Log-vraisemblance nulle',
  'Nessun coefficiente disponibile.':
    'Aucun coefficient disponible.',
  'nessun coefficiente distinguibile da zero':
    'aucun coefficient distinguable de zéro',
  'Nessun effetto':
    'Aucun effet',
  'nessuna associazione affidabile con il rischio':
    'aucune association fiable avec le risque',
  'nessuna associazione iniziale rilevante':
    'aucune association initiale notable',
  'nessuna evidenza contro i rischi proporzionali':
    'aucune preuve contre les risques proportionnels',
  'nessuna prova che le covariariate spieghino i tempi':
    'aucune preuve que les covariables expliquent les temps',
  'non calcolabile':
    'non calculable',
  'Non calcolabile':
    'Non calculable',
  'non modifica':
    'ne modifie pas',
  'Non sono inclusi covariariate dipendenti dal tempo, effetti casuali, stratificazione o rischi competitivi.':
    'Les covariables dépendantes du temps, les effets aléatoires, la stratification et les risques concurrents ne sont pas inclus.',
  'non verificabile con questi dati':
    'non vérifiable avec ces données',
  'Ogni covariata':
    'Chaque covariable',
  'Osservazioni':
    'Observations',
  'p':
    'p',
  'p grande è ciò che si vuole vedere: indica che l’ipotesi di rischio proporzionale regge.':
    'Une p grande est ce que l’on souhaite voir : elle indique que l’hypothèse de risque proportionnel tient.',
  'peggio del caso, controlla i segni':
    'pire que le hasard, vérifiez les signes',
  'Per un profilo x la sopravvivenza è S₀(t) elevato a exp((x − x̄)′B): la curva di base non va letta come la sopravvivenza media della coorte.':
    'Pour un profil x, la survie est S₀(t) élevé à exp((x − x̄)′B) : la courbe de base ne doit pas être lue comme la survie moyenne de la cohorte.',
  'Rapporto di verosimiglianza':
    'Rapport de vraisemblance',
  'Rapporto di verosimiglianza: χ² = {s1} con {s2} gradi di libertà, {s3} (soglia α = {s4}).':
    'Rapport de vraisemblance : χ² = {s1} avec {s2} degrés de liberté, {s3} (seuil α = {s4}).',
  'Report di lettura — Regressione di Cox':
    'Rapport de lecture — Régression de Cox',
  'Rischi proporzionali':
    'Risques proportionnels',
  'Rischio cumulato di base':
    'Risque cumulé de base',
  'S₀(t)':
    'S₀(t)',
  'Score (log-rank generalizzato)':
    'Score (log-rank généralisé)',
  'servono più eventi (o tempi tutti positivi) per stimare il modello con interazioni':
    'il faut plus d’événements (ou des temps tous positifs) pour estimer le modèle avec interactions',
  'Sintesi del modello di Cox':
    'Synthèse du modèle de Cox',
  'Statistica':
    'Statistique',
  'stimatore di Breslow · profilo medio delle covariariate':
    'estimateur de Breslow · profil moyen des covariables',
  'Stime instabili':
    'Estimations instables',
  'Stime instabili: {s1} separa quasi completamente gli eventi, quindi l’hazard ratio (B = {s2}) non è interpretabile.':
    'Estimations instables : {s1} sépare presque complètement les événements, donc l’hazard ratio (B = {s2}) n’est pas interprétable.',
  'Tempo':
    'Temps',
  'Termine':
    'Terme',
  'Test':
    'Test',
  'test di interazione con log(tempo)':
    'test d’interaction avec log(temps)',
  'Test globali sul modello':
    'Tests globaux sur le modèle',
  'un aumento di una unità {s1} il rischio istantaneo di evento':
    'une augmentation d’une unité {s1} le risque instantané d’événement',
  'Valore':
    'Valeur',
  'Verifica dei rischi proporzionali':
    'Vérification des risques proportionnels',
  'Voce':
    'Élément',
  'z':
    'z',
  'χ²':
    'χ²',
};
