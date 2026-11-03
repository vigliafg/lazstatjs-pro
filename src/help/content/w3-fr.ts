import type { HelpTopic } from './types';

/** Vague 3 : modèles linéaires généralisés mixtes. */
export const w3Topics: HelpTopic[] = [
  {
    id: 'glmm',
    area: 'procedures',
    title: 'Modèle linéaire généralisé mixte (GLMM)',
    summary:
      'Ordonnées à l’origine et pentes aléatoires pour des critères binaires, de comptage et continus avec une famille non gaussienne.',
    tutorial: {
      goal: 'Estimer l’effet d’un traitement sur un critère binaire ou de comptage lorsque les observations sont groupées (visites répétées, centres, portées) et que ce regroupement ne peut pas être ignoré.',
      steps: [
        'Variable dépendante : le critère sur son échelle naturelle, par exemple une réponse 0/1 ou un nombre de comptages par visite.',
        'Famille et lien : binomiale avec logit pour 0/1, Poisson avec log pour les comptages, gaussienne avec identité pour un critère approximativement normal.',
        'Effets fixes : les prédicteurs dont l’effet dans la population vous intéresse, comme le traitement, le temps et leur interaction.',
        'Colonne de regroupement : l’identifiant du cluster (sujet, centre, lot). Chaque ligne doit porter le niveau auquel elle appartient.',
        'Effets aléatoires : commencez par une ordonnée à l’origine aléatoire pour la colonne de regroupement, puis ajoutez une pente aléatoire pour le temps seulement si le plan comporte assez de clusters et d’observations répétées.',
        'Lancez le modèle et lisez les coefficients fixes sur l’échelle du lien, les composantes de variance, l’ICC et les modes conditionnels (BLUP) par cluster.',
      ],
      expected:
        'Tableau des effets fixes avec erreurs standard, valeurs z et intervalles de confiance sur l’échelle du lien ; composantes de variance des effets aléatoires (variance de l’ordonnée à l’origine, variance de la pente, corrélation entre les deux) ; paramètre de dispersion ou résiduel lorsque la famille l’exige ; ICC ; BLUP pour chaque niveau de la colonne de regroupement ; critères d’information (AIC, BIC) pour comparer les modèles.',
    },
    advanced: {
      assumptions: [
        'Indépendance conditionnelle : conditionnellement à ses effets aléatoires, chaque observation suit la famille choisie et est indépendante des autres.',
        'Les effets aléatoires suivent une loi normale de moyenne nulle avec une matrice de covariance constante d’un cluster à l’autre.',
        'Les clusters sont indépendants entre eux et échangeables : aucune variable de niveau cluster ne manque dans la partie fixe.',
        'Le prédicteur linéaire est correctement spécifié sur l’échelle du lien : bon lien, bonne forme fonctionnelle, aucune interaction importante oubliée.',
        'Assez de clusters pour estimer une variance : 20 à 30 niveaux constituent un minimum pratique pour une ordonnée à l’origine aléatoire, et bien davantage pour une pente aléatoire.',
      ],
      whenToUse: [
        'Critères binaires, de comptage ou asymétriques mesurés de façon répétée chez les mêmes sujets, où un modèle marginal masquerait la corrélation intra-sujet.',
        'Plans multicentriques ou groupés où l’effet du cluster est une nuisance à modéliser et non un ensemble de contrastes fixes.',
        'Comptages avec surdispersion expliquée par le regroupement plutôt que par un terme de dispersion supplémentaire.',
        'Lorsque des prédictions propres à chaque cluster sont nécessaires, c’est-à-dire le BLUP de chaque sujet ou centre, à côté des effets moyens dans la population.',
      ],
      whenNotToUse: [
        'Critères continus approximativement normaux avec des données groupées : un modèle linéaire mixte est plus simple et ne demande aucune approximation.',
        'Un seul critère binaire ou de comptage par sujet sans regroupement : la régression logistique ou la régression de comptage ordinaire suffit.',
        'Très peu de clusters (moins d’une dizaine) : les composantes de variance sont mal estimées et les erreurs standard des effets fixes ne sont pas fiables ; envisagez des effets fixes pour le cluster ou une approche marginale avec correction pour petits échantillons.',
        'Lorsque seuls des effets moyens dans la population sont utiles et que la corrélation peut être modélisée directement : GEE est plus robuste face à des effets aléatoires mal spécifiés.',
      ],
      reading: [
        'Les coefficients fixes sont des effets conditionnels, propres au cluster : avec un lien logit, exp(β) est un odds ratio pour un sujet dont l’effet aléatoire est maintenu fixe, et il est plus grand en valeur absolue que l’odds ratio marginal d’une régression logistique simple.',
        'Avec un lien log, exp(β) est un rapport de taux ; avec un lien identité, le coefficient est une variation additive de la moyenne.',
        'La variance de l’ordonnée à l’origine σ²ᵤ mesure la variabilité du niveau de base entre clusters ; la variance de la pente mesure la variabilité de l’effet d’un prédicteur, et la corrélation entre ordonnée à l’origine et pente indique si les clusters qui partent plus haut évoluent aussi plus vite.',
        'L’ICC est la part de variance sur l’échelle latente attribuable au cluster : σ²ᵤ / (σ²ᵤ + π²/3) pour le logit, σ²ᵤ / (σ²ᵤ + 1) pour le log et σ²ᵤ / (σ²ᵤ + σ²) pour le modèle gaussien à identité. Il décrit le regroupement, pas la variance expliquée.',
        'Le BLUP est l’écart estimé d’un cluster par rapport à la droite de population, contracté vers zéro à proportion du peu d’information que ce cluster apporte : c’est une prédiction, pas un paramètre testé.',
      ],
      pitfalls: [
        'Lire un odds ratio conditionnel comme s’il s’agissait de l’odds ratio marginal de la régression logistique, ou l’inverse, et les comparer numériquement.',
        'Ajuster une pente aléatoire avec très peu de clusters : la variance s’effondre à zéro ou le modèle ne converge pas, et les erreurs standard perdent leur sens.',
        'Traiter les BLUP comme des données dans une analyse en deux étapes ; ce sont des estimations contractées qui portent leur propre incertitude.',
        'Oublier que l’approximation de Laplace reste une approximation : avec des données binaires et peu d’observations par cluster, les composantes de variance peuvent être biaisées vers le bas ; réajustez avec une quadrature de Gauss-Hermite adaptative ou vérifiez la sensibilité.',
        'Tester une composante de variance contre zéro avec un test du rapport de vraisemblance ordinaire ; l’hypothèse nulle est sur le bord de l’espace des paramètres et la p-valeur est conservatrice.',
      ],
      charts: [
        'Observés contre prédits : points colorés par cluster avec la diagonale comme référence, pour voir où le modèle est calibré et quels clusters s’écartent.',
        'Graphique en chenille des effets aléatoires : BLUP triés par taille avec des barres de confiance approximatives, pour repérer les clusters atypiques et l’ampleur de la contraction.',
        'Résidus contre prédits : résidus de Pearson ou quantiles aléatoires contre le prédicteur linéaire, pour révéler un mauvais lien, une courbure résiduelle ou de l’hétéroscédasticité.',
      ],
      glossary: [
        {
          term: 'Ordonnée à l’origine aléatoire',
          definition:
            'Décalage du niveau de base propre au cluster sur l’échelle du lien, tiré d’une loi normale dont la variance est estimée.',
        },
        {
          term: 'Pente aléatoire',
          definition:
            'Écart propre au cluster dans l’effet d’un prédicteur, avec sa variance et sa corrélation avec l’ordonnée à l’origine.',
        },
        {
          term: 'Composante de variance',
          definition:
            'Variance ou covariance estimée des effets aléatoires, décrivant la variabilité entre clusters.',
        },
        {
          term: 'ICC',
          definition:
            'Corrélation intraclasse : proportion de la variance sur l’échelle latente située entre les clusters.',
        },
        {
          term: 'BLUP',
          definition:
            'Meilleur prédicteur linéaire sans biais : estimation conditionnelle contractée de l’effet d’un cluster.',
        },
        {
          term: 'Approximation de Laplace',
          definition:
            'Développement de Taylor du second ordre autour du mode conditionnel des effets aléatoires, utilisé pour intégrer la vraisemblance.',
        },
        {
          term: 'Modèle conditionnel',
          definition:
            'Modèle dont les coefficients décrivent un seul cluster, par opposition au modèle marginal moyenné sur la population.',
        },
      ],
    },
    seeAlso: ['lmm', 'logistic', 'countreg', 'glm'],
  },
];
