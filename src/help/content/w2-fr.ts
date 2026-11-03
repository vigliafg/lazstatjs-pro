import type { HelpTopic } from './types';

/** Procédures de la vague 2 : GLM, quantile, non linéaire et multinomiale. */
export const w2Topics: HelpTopic[] = [
  {
    id: 'glm',
    area: 'procedures',
    title: 'Modèle linéaire généralisé (GLM)',
    summary: 'Familles gaussienne, binomiale, Poisson et Gamma avec choix du lien.',
    tutorial: {
      goal: 'Estimer comment un score change avec l’âge quand la réponse n’est pas une simple moyenne continue.',
      dataset: 'score-groups.csv',
      steps: [
        'Variable dépendante = Score, indépendantes = Age.',
        'Choisissez la famille : gaussienne pour un score continu, binomiale pour 0/1, Poisson pour les comptages, Gamma pour les montants positifs et dissymétriques.',
        'Choisissez un lien cohérent avec la famille : identité, log, logit, probit ou inverse.',
        'Lancez l’analyse et lisez les coefficients sur l’échelle du lien avec la déviance et l’AIC.',
      ],
      expected: 'Tableau des coefficients sur l’échelle du lien, qualité de l’ajustement (déviance, AIC), résidus et, avec un seul prédicteur, le profil de la moyenne estimée.',
    },
    advanced: {
      assumptions: [
        'Observations indépendantes et réponse dont la variance suit la famille choisie.',
        'Le lien relie la valeur attendue à un prédicteur linéaire : la partie linéaire doit être correcte.',
        'Binomial exige une réponse 0/1, Poisson des comptages non négatifs, Gamma des valeurs strictement positives.',
      ],
      whenToUse: [
        'Réponse continue mais dissymétrique ou hétéroscédastique, typiquement Gamma avec lien log.',
        'Réponse binaire quand il faut un lien probit ou une famille hors du menu logistique classique.',
        'Comptages quand vous voulez comparer le lien log de Poisson avec les diagnostics de déviance.',
      ],
      whenNotToUse: [
        'Réponse binaire qui relève de la procédure logistique dédiée, avec odds ratios et analyse du seuil.',
        'Comptages surdispersés : le binomial négatif de la régression pour comptages est généralement meilleur.',
        'Mesures répétées ou groupées : utilisez les modèles mixtes ou GEE.',
      ],
      reading: [
        'Les coefficients vivent sur l’échelle du lien : avec un lien log, exp(β) est un rapport multiplicatif ; avec un lien logit, c’est un odds ratio.',
        'Une déviance résiduelle très supérieure à ses degrés de liberté signale une surdispersion, surtout pour Poisson et binomiale.',
        'L’AIC compare des modèles sur la même réponse et la même famille ; ce n’est pas une mesure absolue d’ajustement.',
      ],
      pitfalls: [
        'Lire un coefficient à lien log comme une variation additive de la réponse.',
        'Garder la famille gaussienne avec une réponse 0/1 ou de comptage simplement parce que le modèle tourne.',
        'Choisir un lien probit puis interpréter les coefficients comme des odds ratios.',
      ],
      charts: [
        'Valeurs observées et estimées : des points proches de la diagonale indiquent une bonne calibration.',
        'Résidus contre valeurs estimées : un entonnoir ou une courbe révèlent une famille ou un lien erronés.',
        'Profil de la moyenne estimée : avec un seul prédicteur, la courbe ajustée sur la plage observée.',
      ],
      glossary: [
        { term: 'Lien', definition: 'La fonction qui relie la valeur attendue au prédicteur linéaire.' },
        { term: 'Déviance', definition: 'Une mesure de qualité d’ajustement : plus petite est meilleure et comparable entre modèles emboîtés.' },
        { term: 'Surdispersion', definition: 'Variance plus grande que celle prévue par la famille, qui gonfle les erreurs standard.' },
      ],
    },
    seeAlso: ['regression', 'logistic', 'countreg'],
  },
  {
    id: 'quantile',
    area: 'procedures',
    title: 'Régression quantile',
    summary: 'Modéliser un quantile conditionnel (τ) plutôt que la moyenne, robuste aux valeurs extrêmes.',
    tutorial: {
      goal: 'Voir si l’âge déplace le score médian, et pas seulement la moyenne.',
      dataset: 'score-groups.csv',
      steps: [
        'Variable dépendante = Score, indépendantes = Age.',
        'Fixez τ : 0,5 est la médiane ; 0,1 et 0,9 décrivent les queues inférieure et supérieure.',
        'Lancez l’analyse et lisez le coefficient de chaque prédicteur à ce quantile.',
        'Répétez avec un autre τ et comparez les deux droites ajustées.',
      ],
      expected: 'Coefficients, erreurs standard et IC pour le quantile choisi ; avec un seul prédicteur, la droite du quantile et le graphique des résidus.',
    },
    advanced: {
      assumptions: [
        'Observations indépendantes ; au τ choisi, le quantile conditionnel est linéaire dans les prédicteurs.',
        'Aucune exigence de résidus normaux ni de variance constante.',
      ],
      whenToUse: [
        'Réponses dissymétriques, valeurs extrêmes ou intérêt pour les queues (revenus, latences, scores).',
        'Quand l’effet d’un prédicteur peut varier le long de la distribution.',
      ],
      whenNotToUse: [
        'Quand il faut un seul effet moyen et que la moyenne est la cible.',
        'Avec de très petits échantillons : chaque quantile de queue utilise peu d’observations efficaces.',
      ],
      reading: [
        'Le coefficient est la variation du quantile τ pour une unité de plus du prédicteur.',
        'Des pentes différentes selon les τ indiquent que le prédicteur agit autrement au centre et dans les queues.',
        'Les erreurs standard viennent de la théorie des quantiles (type sandwich) ; avec peu de cas, les intervalles sont larges.',
      ],
      pitfalls: [
        'Lire un coefficient médian comme un effet moyen : la moyenne peut se situer ailleurs.',
        'Des droites de quantiles qui se croisent (τ1 < τ2 mais la droite de τ1 au-dessus) suggèrent un modèle mal spécifié.',
      ],
      charts: [
        'Droite du quantile : les observations avec la droite du τ ajusté ; la pente est l’effet sur le quantile.',
        'Résidus contre quantiles estimés : une structure indique que le modèle quantile linéaire est faux.',
      ],
      glossary: [
        { term: 'Quantile τ', definition: 'La valeur sous laquelle se trouve une proportion τ de la distribution conditionnelle.' },
        { term: 'Régression médiane', definition: 'Régression quantile avec τ = 0,5, robuste aux observations extrêmes.' },
      ],
    },
    seeAlso: ['regression', 'nonparamrm', 'lmm'],
  },
  {
    id: 'nonlinear',
    area: 'procedures',
    title: 'Régression non linéaire',
    summary: 'Courbes exponentielle, logistique, Gompertz, puissance et Michaelis–Menten par moindres carrés.',
    tutorial: {
      goal: 'Ajuster une courbe qui monte vite puis s’aplatit, et lire ses paramètres.',
      dataset: 'score-groups.csv',
      steps: [
        'Variable dépendante = Score, prédicteur = Time.',
        'Choisissez la forme : exponentielle, logistique, Gompertz, puissance ou Michaelis–Menten.',
        'Lancez l’analyse, vérifiez que l’ajustement converge, puis lisez les paramètres avec leurs IC.',
        'Regardez la courbe et les résidus ; essayez une autre forme si le motif est systématique.',
      ],
      expected: 'Tableau des paramètres avec SE, t, p et IC, R², RMSE, courbe ajustée et graphique des résidus.',
    },
    advanced: {
      assumptions: [
        'La forme fonctionnelle choisie est correcte ; les résidus sont indépendants et à peu près homoscédastiques.',
        'La plage du prédicteur couvre la partie de la courbe que vous voulez décrire.',
        'Assez de valeurs distinctes du prédicteur pour identifier tous les paramètres.',
      ],
      whenToUse: [
        'Formes de croissance, décroissance, saturation et dose–réponse qu’une droite ne décrit pas.',
        'Quand les paramètres ont un sens : asymptote, taux, demi-saturation.',
      ],
      whenNotToUse: [
        'Quand une transformation rend la relation linéaire et interprétable, comme log–log pour une loi de puissance.',
        'Avec peu de points ou une plage étroite du prédicteur : les paramètres sont faiblement identifiés.',
      ],
      reading: [
        'Exponentielle y = a·exp(b·x) : b > 0 est une croissance, b < 0 une décroissance.',
        'Logistique L/(1+exp(−k(x−x0))) : L est l’asymptote supérieure, k la pente, x0 le point d’inflexion.',
        'Gompertz a·exp(−b·exp(−c·x)) : croissance asymétrique qui approche plus lentement l’asymptote.',
        'Puissance a·x^b : b est l’exposant ; Michaelis–Menten vmax·x/(km+x) : km est la demi-saturation.',
      ],
      pitfalls: [
        'Comparer les R² de courbes différentes sans examiner le motif des résidus.',
        'Se fier à un ajustement convergé avec des intervalles de paramètres larges ou invraisemblables.',
        'Extrapoler au-delà de la plage observée du prédicteur, surtout pour la croissance exponentielle.',
      ],
      charts: [
        'Courbe estimée : les observations avec la courbe ajustée superposée.',
        'Résidus contre valeurs estimées : des arcs systématiques indiquent que la courbe choisie est fausse.',
      ],
      glossary: [
        { term: 'Asymptote', definition: 'La valeur vers laquelle tend la courbe quand le prédicteur augmente.' },
        { term: 'Demi-saturation', definition: 'La valeur du prédicteur à laquelle la réponse atteint la moitié de son maximum (km).' },
      ],
    },
    seeAlso: ['regression', 'glm', 'countreg'],
  },
  {
    id: 'multinomial',
    area: 'procedures',
    title: 'Régression logistique multinomiale',
    summary: 'Réponse nominale à trois classes ou plus, chacune comparée à une classe de référence.',
    tutorial: {
      goal: 'Estimer comment les prédicteurs changent la probabilité d’appartenir à chaque classe d’une réponse nominale.',
      steps: [
        'Réponse = la colonne catégorielle avec au moins trois classes, par exemple bas/moyen/haut.',
        'Sélectionnez les prédicteurs numériques.',
        'Lancez l’analyse et lisez un bloc de coefficients par classe contre la classe de référence.',
        'Vérifiez l’exactitude globale et celle par classe avant de faire confiance à la classification.',
      ],
      expected: 'Coefficients et rapports de risque relatif avec IC pour chaque classe contre la référence, exactitude globale et table de classification.',
    },
    advanced: {
      assumptions: [
        'Observations indépendantes ; le log-odds de chaque classe contre la référence est linéaire dans les prédicteurs.',
        'Indépendance des alternatives non pertinentes : ajouter ou retirer une classe ne doit pas changer les autres.',
        'Chaque classe a assez d’observations pour le nombre de paramètres.',
      ],
      whenToUse: [
        'Réponse nominale à plus de deux catégories non ordonnées, comme le mode de transport ou le choix d’un produit.',
        'Quand il faut des effets propres à chaque classe plutôt qu’un seul contraste binaire.',
      ],
      whenNotToUse: [
        'Classes ordonnées : la logistique ordinale est plus parcimonieuse.',
        'Réponse binaire : utilisez la régression logistique.',
        'Classes très rares : les estimations sont instables.',
      ],
      reading: [
        'Chaque classe est comparée à la référence : exp(β) est un rapport de risque relatif, pas une probabilité.',
        'Un rapport supérieur à 1 signifie que le prédicteur augmente les odds de cette classe par rapport à la référence.',
        'L’exactitude globale peut être élevée simplement parce qu’une classe domine : lisez aussi celle par classe.',
      ],
      pitfalls: [
        'Interpréter les rapports de risque relatif comme des probabilités ou des rapports de risque.',
        'Changer la classe de référence et attendre les mêmes chiffres : la comparaison change.',
        'Utiliser la multinomiale alors que les classes sont ordonnées.',
      ],
      charts: [
        'Distribution des classes prédites : chaque barre compte combien d’observations le modèle assigne à cette classe.',
        'Exactitude par classe : pourcentage correctement classé dans chaque classe, avec l’exactitude globale comme ligne de référence.',
      ],
      glossary: [
        { term: 'Classe de référence', definition: 'La classe à laquelle toutes les autres sont comparées.' },
        { term: 'Rapport de risque relatif', definition: 'La variation multiplicative des odds d’une classe contre la référence pour une unité de plus du prédicteur.' },
        { term: 'Softmax', definition: 'La fonction qui transforme les scores des classes en probabilités dont la somme vaut un.' },
      ],
    },
    seeAlso: ['logistic', 'multivariate', 'ordinal'],
  },
];
