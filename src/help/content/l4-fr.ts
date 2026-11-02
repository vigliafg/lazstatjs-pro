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
    summary: 'Cartes de contrôle, capabilité, Pareto et variabilité dans une seule plateforme.',
    tutorial: {
      goal: 'Vérifier si un processus est stable et capable.',
      steps: [
        'Choisissez le mode : carte de contrôle, capabilité, Pareto ou variabilité.',
        'Sélectionnez la variable numérique (ou la catégorie pour le Pareto).',
        'Fixez les limites de spécification et la taille des sous-groupes si nécessaire.',
        'Lancez l’analyse et lisez la carte, les indices et le rapport de lecture.',
      ],
      expected: 'Une carte de contrôle avec ses limites, des indices de capabilité ou un diagramme de Pareto, plus les tableaux.',
    },
    advanced: {
      assumptions: ['Les observations sont dans leur ordre chronologique réel ; les sous-groupes ont un sens.'],
      whenToUse: ['Surveiller un processus, comparer la variabilité entre groupes, hiérarchiser les défauts.'],
      whenNotToUse: ['Juger la capabilité avant la stabilité ; un indice de capabilité sur un processus instable est trompeur.'],
      reading: [
        'Les points hors des limites de contrôle sont des signaux, pas la preuve d’un changement.',
        'Cp est la marge potentielle ; Cpk pénalise aussi une moyenne éloignée du centre des spécifications.',
        'La ligne cumulée du Pareto montre quelles catégories traiter en premier.',
      ],
      pitfalls: [
        'Les limites de contrôle ne sont pas des limites de spécification.',
        'La capabilité suppose la normalité et un processus stable.',
      ],
      charts: ['Carte de contrôle', 'Histogramme de capabilité', 'Diagramme de Pareto', 'Boîte à moustaches de variabilité'],
      glossary: [
        { term: 'UCL/LCL', definition: 'Limites de contrôle supérieure et inférieure à ±3 sigma du centre.' },
        { term: 'Cpk', definition: 'Indice de capabilité qui tient compte de la distance entre la moyenne et les limites de spécification.' },
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
      ],
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
    title: 'Surface de réponse (DOE)',
    summary: 'Surface quadratique et courbes de niveau pour deux facteurs continus.',
    tutorial: {
      goal: 'Trouver la combinaison de deux facteurs qui optimise une réponse.',
      steps: [
        'Sélectionnez la réponse numérique et deux facteurs numériques.',
        'Choisissez un modèle linéaire ou quadratique.',
        'Lancez l’analyse et lisez la surface, les courbes de niveau et le point stationnaire.',
      ],
      expected: 'Une surface projetée, des courbes de niveau, les coefficients du modèle et un point stationnaire.',
    },
    advanced: {
      assumptions: ['La réponse est continue ; les facteurs sont numériques ; les résidus sont indépendants.'],
      whenToUse: ['Optimisation de processus, courbure et interaction entre deux facteurs.'],
      whenNotToUse: ['Affirmations causales sans plan d’expérience, répétitions et randomisation.'],
      reading: [
        'Les courbes de niveau relient les combinaisons de facteurs de même réponse prédite.',
        'Un point col n’est pas un optimum : il monte dans une direction et descend dans l’autre.',
      ],
      pitfalls: [
        'La surface n’est valide qu’à l’intérieur de la plage observée des facteurs.',
        'Un ajustement quadratique ne remplace pas un plan d’expérience.',
      ],
      charts: ['Surface de réponse', 'Carte de contours', 'Coefficients du modèle'],
      glossary: [
        { term: 'Point stationnaire', definition: 'Point où le gradient de la surface est nul.' },
        { term: 'Courbe de niveau', definition: 'Ligne de réponse prédite constante.' },
      ],
    },
    seeAlso: ['factorial', 'regression'],
  },
];
