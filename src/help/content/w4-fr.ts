import type { HelpTopic } from './types';

/** Procédures de la vague 4 : modèles log-linéaires pour tableaux à deux dimensions. */
export const w4Topics: HelpTopic[] = [
  {
    id: 'loglinear',
    area: 'procedures',
    title: 'Modèle log-linéaire pour tableaux à deux dimensions',
    summary: 'Modèle de Poisson pour les effectifs d’un tableau à deux dimensions : indépendance ou interaction saturée.',
    tutorial: {
      goal: 'Décider si les catégories de ligne et de colonne d’un tableau à deux dimensions sont associées et quantifier l’association.',
      steps: [
        'Choisir les étiquettes de ligne et de colonne et saisir les effectifs observés cellule par cellule.',
        'Commencer par le modèle d’indépendance : il estime seulement les effets principaux de ligne et de colonne.',
        'Exécuter et lire G², ses degrés de liberté et la valeur p.',
        'Si le modèle d’indépendance ne convient pas, passer au modèle saturé pour voir à quel point les cellules s’écartent de l’indépendance.',
        'Lire les coefficients sur l’échelle log et exp(β) comme facteurs multiplicatifs.',
        'Pour un tableau 2×2, lire l’exponentielle de l’interaction comme odds ratio avec son intervalle de confiance.',
      ],
      expected:
        'Un tableau d’ajustement avec G², df, p, déviance nulle et AIC ; un tableau des coefficients avec β, SE, z, p, exp(β) et CI ; les effectifs attendus et les résidus standardisés ; une heatmap des résidus et des barres observé/attendu.',
    },
    advanced: {
      assumptions: [
        'Les effectifs sont des observations indépendantes, une par cellule, et chaque unité tombe dans une seule cellule.',
        'L’effectif attendu de chaque cellule est positif ; la variance de Poisson est égale à la moyenne.',
        'Le logarithme de l’effectif attendu est une fonction linéaire des effets de ligne et de colonne, et de leur interaction dans le modèle saturé.',
        'Avec de petits effectifs attendus, l’approximation χ² de G² est fragile.',
      ],
      whenToUse: [
        'Deux variables catégorielles croisées, lorsqu’on veut un test d’indépendance fondé sur un modèle.',
        'Lorsqu’on a besoin des effectifs attendus, des résidus et d’une lecture de l’association au niveau des coefficients.',
        'Pour comparer le modèle d’indépendance au modèle saturé dans un tableau 2×2 et obtenir l’odds ratio.',
      ],
      whenNotToUse: [
        'Trois facteurs catégoriels ou plus : des interactions d’ordre supérieur sont nécessaires et cette page ne couvre que les tableaux à deux dimensions.',
        'Tableaux très clairsemés avec de nombreuses cellules nulles : les méthodes exactes ou pénalisées sont plus sûres.',
      ],
      reading: [
        'G² est la statistique du rapport de vraisemblance : des valeurs grandes par rapport aux degrés de liberté indiquent que les effectifs attendus du modèle sont loin des effectifs observés.',
        'Dans un tableau à deux dimensions, le modèle d’indépendance a (R−1)(C−1) degrés de liberté résiduels ; le modèle saturé n’en a aucun et reproduit exactement les données.',
        'Les coefficients sont sur l’échelle log : exp(β) est le facteur par lequel l’effectif attendu change lorsque la catégorie change, l’autre facteur étant maintenu fixe.',
        'Pour un tableau 2×2, le coefficient d’interaction est le log odds ratio ; exp(β) = 1 signifie indépendance.',
      ],
      pitfalls: [
        'Lire la valeur p d’un coefficient comme un test du modèle entier : commencer par G² et les degrés de liberté résiduels.',
        'Interpréter l’association comme une causalité : l’ordre ligne/colonne est arbitraire et le modèle ne dit pas quelle variable influence l’autre.',
        'Ignorer les petits effectifs attendus : la valeur p de G² peut être anti-conservatrice.',
        'Utiliser le modèle saturé comme preuve : il s’ajuste toujours et n’a pas de test.',
      ],
      charts: [
        'Heatmap des résidus standardisés, avec les cellules loin de zéro mises en évidence.',
        'Barres observé/attendu par cellule, pour voir où le modèle se trompe.',
      ],
      glossary: [
        { term: 'G²', definition: 'Statistique du rapport de vraisemblance comparant les effectifs observés aux effectifs attendus du modèle.' },
        { term: 'Modèle saturé', definition: 'Modèle avec un paramètre par cellule ; il reproduit les données et a zéro degré de liberté résiduel.' },
        { term: 'Odds ratio', definition: 'Rapport des odds d’un groupe à ceux de l’autre ; exp(interaction) dans un modèle log-linéaire 2×2.' },
      ],
    },
    seeAlso: ['contingency', 'chisquare'],
  },
];
