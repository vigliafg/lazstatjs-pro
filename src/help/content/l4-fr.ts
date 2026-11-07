import type { HelpTopic } from './types';

/**
 * Pages de procédure L4 (version française).
 *
 * Elles reprennent la structure de `l4.ts` : même identifiants, même ordre,
 * même contrat à deux niveaux (tutoriel puis lecture avancée).
 */
export const l4Topics: HelpTopic[] = [
  {
    id: 'partition',
    area: 'procedures',
    title: 'Partition (arbre de régression)',
    summary: 'Répartir les données en feuilles homogènes avec un arbre de régression.',
    tutorial: {
      goal: 'Expliquer une réponse numérique par un petit ensemble de règles si-alors.',
      steps: [
        'Choisissez la réponse numérique et un ou plusieurs prédicteurs numériques.',
        'Fixez la profondeur maximale et le nombre minimal de cas par division.',
        'Lancez l’analyse et lisez l’arbre, la liste des divisions et le rapport des feuilles.',
      ],
      expected: 'Un arbre de partition, les règles de division, les moyennes des feuilles et l’importance des variables.',
    },
    advanced: {
      assumptions: ['La réponse est numérique ; les prédicteurs sont numériques et complets.'],
      whenToUse: ['Explication exploratoire, segmentation et effets non linéaires.'],
      whenNotToUse: ['Inférence formelle ou affirmations causales ; utilisez plutôt un modèle de régression.'],
      reading: [
        'Chaque nœud interne est un seuil ; la moyenne de la feuille est la prédiction.',
        'L’importance des variables additionne la réduction d’erreur attribuée à chaque prédicteur.',
      ],
      pitfalls: [
        'Les arbres profonds surajustent : validez sur un échantillon séparé avant de faire confiance aux règles.',
        'Les seuils dépendent des données et peuvent changer avec un autre échantillon.',
      ],
      charts: ['Arbre de partition', 'Observés vs prédits', 'Importance des variables'],
      glossary: [
        { term: 'Feuille', definition: 'Groupe final dont la moyenne constitue la prédiction.' },
        { term: 'SSE', definition: 'Somme des carrés des écarts entre valeurs observées et prédites.' },
      ],
    },
    seeAlso: ['regression', 'cluster'],
  },
  {
    id: 'quality',
    area: 'procedures',
    title: 'Qualité (SPC)',
    summary: 'Cartes de contrôle, capabilité, Pareto, systèmes de mesure, échantillonnage d’acceptation et contrôle multivarié.',
    tutorial: {
      goal: 'Vérifier si un processus est stable, capable et mesuré de façon fiable.',
      steps: [
        'Choisissez le mode : carte de contrôle, capabilité, Pareto, variabilité, intervalle de tolérance, CUSUM, Gage R&R, échantillonnage d’acceptation ou carte T².',
        'Sélectionnez la variable numérique (ou la catégorie pour le Pareto).',
        'Pour Gage R&R choisissez les colonnes pièce et opérateur ; pour l’échantillonnage fixez n, c et la taille du lot ; pour T² sélectionnez au moins deux variables mesurées ensemble.',
        'Fixez les limites de spécification, la taille des sous-groupes et la proportion de population de l’intervalle de tolérance si nécessaire.',
        'Lancez l’analyse et lisez la carte, les indices et le rapport de lecture.',
      ],
      expected: 'Une carte de contrôle avec ses limites, des indices de capabilité, un tableau Gage R&R, une courbe OC ou une carte T², plus les tableaux.',
    },
    advanced: {
      assumptions: ['Les observations sont dans leur ordre chronologique réel ; les sous-groupes ont un sens.'],
      whenToUse: ['Surveiller un processus, comparer la variabilité entre groupes, hiérarchiser les défauts.'],
      whenNotToUse: ['Juger la capabilité avant la stabilité ; un indice de capabilité sur un processus instable est trompeur.'],
      reading: [
        'Les points hors des limites de contrôle sont des signaux, pas la preuve d’un changement.',
        'Cp est la marge potentielle ; Cpk pénalise aussi une moyenne éloignée du centre des spécifications.',
        'La ligne cumulée du Pareto montre quelles catégories traiter en premier.',
        'L’intervalle de tolérance couvre une part de la population, pas la moyenne ; la CUSUM accumule les petits décalages persistants.',
        'Un Gage R&R sous 10 % est acceptable, entre 10 % et 30 % il est marginal et au-delà de 30 % les décisions sur les pièces sont risquées.',
        'Sur la courbe OC, l’AQL est la qualité acceptée dans 95 % des cas et la LTPD celle acceptée seulement dans 10 %.',
        'Un point T² hors limite indique une combinaison inhabituelle des variables, pas laquelle a bougé.',
        'Gage R&R rapporte %GRR, la part de la variation totale due à la jauge, et ndc, le nombre de catégories distinctes qu\'elle sépare : en dessous de 10 % avec cinq catégories ou plus, le système est utilisable, au-dessus de 30 % ou en dessous de deux catégories, il ne l\'est pas.',
        'Lorsque les sous-groupes ont des tailles différentes, les limites de contrôle sont calculées point par point au lieu d\'une seule fois pour l\'ensemble du graphique : une étape dans les limites reflète la taille de l\'échantillon et non un changement dans le processus.',
      ],
      pitfalls: [
        'Les limites de contrôle ne sont pas des limites de spécification.',
        'La capabilité suppose la normalité et un processus stable.',
        'Une étude Gage R&R exige un plan croisé équilibré : chaque pièce mesurée par chaque opérateur.',
        'La carte T² suppose des observations indépendantes et approximativement normales.',
      ],
      charts: ['Carte de contrôle', 'Histogramme de capabilité', 'Diagramme de Pareto', 'Boîte à moustaches de variabilité', 'Intervalle de tolérance', 'Composantes de variance Gage R&R', 'Courbes OC et AOQ', 'Carte T² de Hotelling'],
      glossary: [
        { term: 'UCL/LCL', definition: 'Limites de contrôle supérieure et inférieure à ±3 sigma du centre.' },
        { term: 'Cpk', definition: 'Indice de capabilité qui tient compte de la distance entre la moyenne et les limites de spécification.' },
        { term: 'Gage R&R', definition: 'Part de la variabilité totale due au système de mesure : répétabilité plus reproductibilité.' },
        { term: 'AQL', definition: 'Niveau de qualité acceptable : défaut entrant accepté avec une probabilité de 95 %.' },
        { term: 'ndc', definition: 'Nombre de catégories distinctes : combien de niveaux différents de la quantité mesurée la jauge peut distinguer.' },
      ],
    },
    seeAlso: ['descriptive', 'distfit'],
  },
  {
    id: 'cluster',
    area: 'procedures',
    title: 'Analyse de clusters',
    summary: 'Regroupement hiérarchique avec dendrogramme et profils de clusters.',
    tutorial: {
      goal: 'Trouver des groupes d’observations similaires sur plusieurs variables numériques.',
      steps: [
        'Sélectionnez au moins deux variables numériques.',
        'Choisissez la méthode d’agrégation et le nombre de clusters.',
        'Lancez l’analyse et lisez le dendrogramme, les moyennes des clusters et les profils.',
      ],
      expected: 'Un dendrogramme, les tailles des clusters, leurs moyennes et les profils standardisés.',
    },
    advanced: {
      assumptions: ['Les variables sont sur des échelles comparables, ou la standardisation est activée.'],
      whenToUse: ['Segmentation, typologies exploratoires, recherche de groupes naturels.'],
      whenNotToUse: ['Tester si des groupes existent ; la classification n’a pas de p-value pour cela.'],
      reading: [
        'La hauteur d’une fusion est la distance entre les groupes réunis.',
        'Les profils standardisés montrent quelles variables caractérisent chaque cluster.',
      'Le tableau des fusions donne pseudo-F et CCC à chaque étape : on voit où les clusters commencent à se mélanger.'],
      pitfalls: [
        'Des méthodes d’agrégation ou des coupures différentes produisent des clusters différents.',
        'Les clusters très petits peuvent être des valeurs aberrantes plutôt que de vrais groupes.',
      ],
      charts: ['Dendrogramme', 'Profils des clusters', 'Taille des clusters'],
      glossary: [
        { term: 'Méthode d’agrégation', definition: 'La règle qui mesure la distance entre deux clusters.' },
        { term: 'Dendrogramme', definition: 'Un arbre montrant l’ordre et la hauteur des fusions.' },
      ],
    },
    seeAlso: ['multivariate', 'partition'],
  },
  {
    id: 'discriminant',
    area: 'procedures',
    title: 'Analyse discriminante / MANOVA',
    summary: 'Séparer des groupes connus et tester leur différence de moyennes multivariée.',
    tutorial: {
      goal: 'Vérifier si des groupes diffèrent sur plusieurs variables numériques prises ensemble.',
      steps: [
        'Sélectionnez la colonne de regroupement et au moins un prédicteur numérique.',
        'Lancez l’analyse et lisez le lambda de Wilks, les tests univariés et le graphique canonique.',
        'Consultez la matrice de confusion pour voir la qualité de classification des groupes.',
      ],
      expected: 'Table MANOVA, coefficients discriminants, nuage canonique et graphique des profils.',
    },
    advanced: {
      assumptions: ['Observations indépendantes, covariances de groupe similaires, prédicteurs continus.'],
      whenToUse: ['Groupes connus, règles de classification, comparaison multivariée de groupes.'],
      whenNotToUse: ['Découverte de groupes inconnus (utilisez la classification) ou plus de variables que de cas.'],
      reading: [
        'Un lambda de Wilks faible et un p faible indiquent une séparation des groupes.',
        'Les axes canoniques sont les directions qui séparent le mieux les groupes.',
        'L’exactitude d’entraînement est optimiste : validez sur un échantillon séparé.',
      ],
      pitfalls: [
        'Des groupes déséquilibrés peuvent dominer l’exactitude.',
        'Des prédicteurs colinéaires rendent la matrice de covariance singulière.',
      ],
      charts: ['Nuage canonique', 'Profils des groupes', 'Carte de chaleur des coefficients'],
      glossary: [
        { term: 'Lambda de Wilks', definition: 'Statistique de test multivariée proche de zéro lorsque les groupes diffèrent.' },
        { term: 'Fonction canonique', definition: 'Combinaison linéaire de variables qui maximise la séparation des groupes.' },
      ],
    },
    seeAlso: ['multivariate', 'anova'],
  },
  {
    id: 'doe',
    area: 'procedures',
    title: 'Surface de réponse et plans DOE',
    summary: 'Surface quadratique pour deux facteurs et générateur de plans factoriels et de surface de réponse.',
    tutorial: {
      goal: 'Trouver la combinaison de deux facteurs qui optimise une réponse, ou planifier les essais à réaliser.',
      steps: [
        'Choisissez le mode : surface de réponse pour analyser des données existantes, générateur de plans pour créer une matrice d’essais.',
        'Pour la surface, sélectionnez la réponse et deux facteurs numériques puis un modèle linéaire ou quadratique.',
        'Pour le générateur, choisissez le type de plan, le nombre de facteurs et les points centraux.',
        'Lancez l’analyse et lisez la surface et le point stationnaire, ou la matrice et la carte du plan.',
      ],
      expected: 'Une surface projetée avec son point stationnaire, ou une matrice avec essais, points axiaux, points centraux et alias.',
    },
    advanced: {
      assumptions: ['La réponse est continue ; les facteurs sont numériques ; les résidus sont indépendants.'],
      whenToUse: ['Optimisation de processus, courbure et interaction entre deux facteurs.'],
      whenNotToUse: ['Affirmations causales sans plan d’expérience, répétitions et randomisation.'],
      reading: [
        'Les courbes de niveau relient les combinaisons de facteurs de même réponse prédite.',
        'Un point col n’est pas un optimum : il monte dans une direction et descend dans l’autre.',
        'Un plan factoriel complet énumère tous les coins ; une demi-fraction échange certains effets contre moins d’essais.',
        'Dans un plan composite central, les points axiaux estiment la courbure et les points centraux l’erreur pure.',
      ],
      pitfalls: [
        'La surface n’est valide qu’à l’intérieur de la plage observée des facteurs.',
        'Un ajustement quadratique ne remplace pas un plan d’expérience.',
        'Les essais générés doivent encore être randomisés et protégés des facteurs de nuisance.',
      ],
      charts: ['Surface de réponse', 'Carte de contours', 'Coefficients du modèle', 'Carte du plan'],
      glossary: [
        { term: 'Point stationnaire', definition: 'Point où le gradient de la surface est nul.' },
        { term: 'Courbe de niveau', definition: 'Ligne de réponse prédite constante.' },
        { term: 'CCD', definition: 'Plan composite central : coins factoriels, points axiaux et points centraux.' },
        { term: 'Résolution', definition: 'Degré de confusion des effets principaux avec les interactions dans une fraction.' },
      ],
    },
    seeAlso: ['factorial', 'regression'],
  },
  {
    id: 'proportions',
    area: 'procedures',
    title: 'Proportions et taux',
    summary: 'Tests à un ou deux échantillons pour proportions et taux de Poisson.',
    tutorial: {
      goal: 'Décider si une proportion ou un taux d’événements diffère d’une cible ou entre deux groupes.',
      dataset: 'two_groups_binary.csv',
      steps: [
        'Choisissez une ou deux proportions, ou un ou deux taux de Poisson.',
        'Sélectionnez l’issue binaire (ou la colonne de comptage) et la colonne de groupe pour les modes à deux échantillons.',
        'Choisissez le niveau de succès, la valeur nulle et l’exposition par ligne si nécessaire.',
        'Lancez l’analyse et lisez le test exact, l’intervalle et la taille d’effet.',
      ],
      expected: 'Un tableau avec succès, essais, estimation, p exact et intervalle, plus la différence ou le rapport de taux pour deux groupes.',
    },
    advanced: {
      assumptions: [
        'Les observations sont indépendantes dans et entre les groupes.',
        'Les comptages de Poisson sont des événements entiers avec une exposition connue et une variance égale à la moyenne.',
      ],
      whenToUse: ['Comparer des taux de conversion, de défauts, d’incidence ou des comptages par unité d’exposition.'],
      whenNotToUse: ['Mesures répétées ou données en grappes : l’indépendance est violée.'],
      reading: [
        'Le p exact est la référence avec de petits effectifs ; le p asymptotique est une approximation normale.',
        'L’intervalle de Wilson est plus stable que celui de Wald ; Clopper–Pearson garantit la couverture nominale.',
        'Le risque relatif et l’odds ratio ne remplacent pas la différence absolue.',
      ],
      pitfalls: [
        'Un odds ratio élevé peut masquer une différence absolue minime quand les événements sont rares.',
        'L’exposition doit être déclarée : le même nombre d’événements sur des expositions différentes donne des taux différents.',
      ],
      charts: ['Graphique d’intervalle'],
      glossary: [
        { term: 'p exact', definition: 'Probabilité de tous les résultats au moins aussi improbables que celui observé sous l’hypothèse nulle.' },
        { term: 'Rapport de taux', definition: 'Rapport entre deux taux d’événements ; 1 signifie des taux égaux.' },
      ],
    },
    seeAlso: ['chisquare', 'ttest'],
  },
  {
    id: 'variances',
    area: 'procedures',
    title: 'Variances',
    summary: 'Une variance, le test F et Bartlett/Levene pour l’égalité des dispersions.',
    tutorial: {
      goal: 'Vérifier si une variance diffère d’une cible ou entre groupes.',
      dataset: 'plantgrowth.csv',
      steps: [
        'Choisissez une variance ou deux variances ou plus.',
        'Sélectionnez la variable numérique et, pour deux groupes ou plus, la colonne de groupe.',
        'Saisissez la variance nulle pour le test à un échantillon.',
        'Lancez l’analyse et comparez F, Bartlett et Levene avant de choisir un test sur les moyennes.',
      ],
      expected: 'Un tableau de variance avec intervalle exact et les p de F/Bartlett/Levene en présence de groupes.',
    },
    advanced: {
      assumptions: [
        'Les observations sont indépendantes et, pour le χ² et les intervalles F, normalement distribuées.',
        'Levene sur les médianes est plus robuste mais exige des groupes indépendants.',
      ],
      whenToUse: ['Vérifier l’homoscédasticité avant un t-test ou une ANOVA, ou comparer la dispersion d’un processus.'],
      whenNotToUse: ['Avec de très petits groupes les tests ont peu de puissance ; préférez les procédures de Welch.'],
      reading: [
        'Le test F concerne deux groupes ; avec plus de groupes utilisez Bartlett ou Levene.',
        'Bartlett est puissant sous normalité mais faussé par les valeurs aberrantes et les queues épaisses.',
        'Levene sur les médianes réduit l’influence des extrêmes et constitue le choix par défaut le plus sûr.',
        'O’Brien ajoute un test robuste d\'égalité des variances : il maintient son niveau lorsque des valeurs aberrantes ou des queues lourdes fausseraient Bartlett.',
      ],
      pitfalls: [
        'Un test non significatif ne prouve pas l’égalité des variances : regardez l’intervalle et les boîtes.',
        'La variance est sur l’échelle au carré : rapportez l’écart-type pour l’interprétation.',
      ],
      charts: ['Boîte à moustaches', 'Graphique d’intervalle'],
      glossary: [
        { term: 'Homoscédasticité', definition: 'Égalité des variances entre groupes, une hypothèse du t pooled et de l’ANOVA.' },
        { term: 'Test de Levene', definition: 'ANOVA sur les écarts absolus à un centre de groupe ; la version médiane est Brown–Forsythe.' },
      ],
    },
    seeAlso: ['ttest', 'anova'],
  },
];
