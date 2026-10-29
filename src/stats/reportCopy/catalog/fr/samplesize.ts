/** Prose française du rapport de taille d’échantillon et de ses tableaux. */
export const samplesizeCopy: Record<string, string> = {
  'n per gruppo': 'n par groupe',
  'N totale': 'N total',
  'Potenza raggiunta': 'Puissance atteinte',
  'Effect size': 'Taille d’effet',
  'Potenza target': 'Puissance cible',
  'Report di lettura': 'Rapport de lecture',
  'Piano {s1}: servono {s2} osservazioni per gruppo (N = {s3}) per una potenza dell’{s4}.':
    'Plan {s1} : il faut {s2} observations par groupe (N = {s3}) pour une puissance de {s4} %.',
  'Piano di campionamento': 'Plan d’échantillonnage',
  'Questo foglio non analizza dati: calcola quante osservazioni servono perché un test abbia una buona probabilità di trovare l’effetto che ti interessa.':
    'Cette feuille n’analyse pas de données : elle calcule combien d’observations sont nécessaires pour qu’un test ait une bonne probabilité de détecter l’effet qui vous intéresse.',
  'La potenza è la probabilità di rifiutare l’ipotesi nulla quando è falsa. Hai chiesto {s1}; con {s2} osservazioni per gruppo il calcolo ne garantisce {s3}. L’α scelto è {s4}: la probabilità di un falso positivo.':
    'La puissance est la probabilité de rejeter l’hypothèse nulle lorsqu’elle est fausse. Vous avez demandé {s1} ; avec {s2} observations par groupe, le calcul garantit {s3}. L’α choisi est {s4} : la probabilité d’un faux positif.',
  'Come si legge il risultato': 'Comment lire le résultat',
  'n per gruppo = {s1}: è il numero minimo di osservazioni valide in ciascun gruppo, non il numero di righe da inserire (le mancanti vanno sostituite).':
    'n par groupe = {s1} : c’est le nombre minimal d’observations valides dans chaque groupe, et non le nombre de lignes à saisir (les manquantes doivent être remplacées).',
  'N totale = {s1}: include tutti i gruppi del disegno.':
    'N total = {s1} : il inclut tous les groupes du plan.',
  'Effect size = {s1}: è la differenza espressa in unità di variabilità (o la dimensione dell’effetto del disegno). Più è piccolo, più osservazioni servono.':
    'Taille d’effet = {s1} : c’est la différence exprimée en unités de variabilité (ou la taille d’effet du plan). Plus elle est petite, plus il faut d’observations.',
  'La curva di potenza mostra quanto si guadagna aumentando n: se il punto richiesto è già sulla parte piatta, aumentare il campione serve a poco.':
    'La courbe de puissance montre ce que l’on gagne en augmentant n : si le point demandé est déjà sur la partie plate, augmenter l’échantillon sert peu.',
  'Da dove viene il numero': 'D’où vient le nombre',
  'La numerosità si ottiene imponendo che, sotto l’ipotesi alternativa, la statistica superi il valore critico con probabilità pari alla potenza scelta. Per i test t il calcolo viene iterato perché il valore critico dipende dai gradi di libertà, che dipendono da n.':
    'La taille d’échantillon s’obtient en imposant que, sous l’hypothèse alternative, la statistique dépasse la valeur critique avec une probabilité égale à la puissance choisie. Pour les tests t, le calcul est itéré car la valeur critique dépend des degrés de liberté, qui dépendent de n.',
  'La formula assume un effetto noto e una variabilità nota: se l’effect size viene da uno studio pilota, la numerosità è esso stesso una stima e va trattata con margine.':
    'La formule suppose un effet connu et une variabilité connue : si la taille d’effet provient d’une étude pilote, la taille d’échantillon est elle-même une estimation et doit être traitée avec une marge.',
  'Cosa controllare prima di usarlo': 'Ce qu’il faut vérifier avant de l’utiliser',
  'Il disegno deve essere quello giusto: due gruppi indipendenti, appaiati o una sola media non sono intercambiabili.':
    'Le plan doit être le bon : deux groupes indépendants, appariés ou une seule moyenne ne sont pas interchangeables.',
  'Se prevedi abbandoni, aumenta n dividendo per (1 − tasso di abbandono).':
    'Si vous prévoyez des abandons, augmentez n en divisant par (1 − taux d’abandon).',
  'Con più confronti o più esiti la potenza per singolo test non basta: correggi α o pianifica l’esito primario.':
    'Avec plusieurs comparaisons ou plusieurs critères, la puissance par test ne suffit pas : corrigez α ou planifiez le critère principal.',
  'Per differenze molto piccole la numerosità esplode: valuta se l’effetto è clinicamente rilevante prima di inseguirlo.':
    'Pour des différences très petites, la taille d’échantillon explose : demandez-vous si l’effet est cliniquement pertinent avant de le poursuivre.',
  'Le formule per i test t usano l’approssimazione normale per la potenza: il valore è accurato entro circa un’unità rispetto al calcolo esatto non centrale.':
    'Les formules pour les tests t utilisent l’approximation normale pour la puissance : la valeur est précise à environ une unité près par rapport au calcul exact non central.',
  'Per l’ANOVA la potenza usa la F non centrale esatta: il numero può differire di un’unità da software che arrotondano diversamente le iterazioni.':
    'Pour l’ANOVA, la puissance utilise la F non centrale exacte : le nombre peut différer d’une unité par rapport à des logiciels qui arrondissent différemment les itérations.',
  'Due medie indipendenti': 'Deux moyennes indépendantes',
  'Una media': 'Une moyenne',
  'Due medie appaiate': 'Deux moyennes appariées',
  'Due proporzioni': 'Deux proportions',
  'ANOVA a una via': 'ANOVA à un facteur',
  'TOST (equivalenza)': 'TOST (équivalence)',
  'Sopravvivenza (log-rank)': 'Survie (log-rank)',
  '{s1}%': '{s1}%',
  'Differenza attesa': 'Différence attendue',
  'Margine di equivalenza': 'Marge d’équivalence',
  'Hazard ratio': 'Hazard ratio',
  'Tasso di eventi': 'Taux d’événements',
  'Differenza da rilevare': 'Différence à détecter',
  'SD (dei differenziali se appaiato)': 'SD (des différences si apparié)',
  'Proporzione gruppo 1': 'Proportion groupe 1',
  'Proporzione gruppo 2': 'Proportion groupe 2',
  'r da rilevare': 'r à détecter',
  'Numero di gruppi': 'Nombre de groupes',
  "Cohen's f": "Cohen's f",
  'Parametri del piano': 'Paramètres du plan',
  Parametro: 'Paramètre',
  Valore: 'Valeur',
  'Numerosità richiesta': 'Taille d’échantillon requise',
  Voce: 'Élément',
  'n per un margine di errore richiesto': 'n pour une marge d’erreur demandée',
  'Il calcolo è iterativo: la numerosità viene aumentata finché la potenza raggiunge quella richiesta.':
    'Le calcul est itératif : la taille d’échantillon augmente jusqu’à ce que la puissance atteigne celle demandée.',
  'La potenza riportata è quella approssimata del disegno, non il target: arrotondando a n intero può superarlo di poco.':
    'La puissance rapportée est celle approximée du plan, pas la cible : en arrondissant à un n entier, elle peut la dépasser légèrement.',
  'Potenza al variare di n': 'Puissance selon n',
  'per gruppo': 'par groupe',
  n: 'n',
  Potenza: 'Puissance',
  'La curva si appiattisce: oltre il punto calcolato ogni osservazione in più compra sempre meno potenza.':
    'La courbe s’aplatit : au-delà du point calculé, chaque observation supplémentaire apporte de moins en moins de puissance.',
};
