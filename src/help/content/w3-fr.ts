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
      'Les composantes de variance portent une erreur type et un IC de Wald sur l’échelle log, et les tests des effets fixes donnent le Wald par terme.'],
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
  {
    id: 'pls',
    area: 'procedures',
    title: 'Moindres carrés partiels (PLS)',
    summary:
      'Composantes latentes qui maximisent la covariance avec la réponse, pour de nombreux prédicteurs corrélés.',
    tutorial: {
      goal: 'Prédire une réponse continue à partir de nombreux prédicteurs fortement corrélés, là où la régression OLS donne des coefficients instables ou illisibles.',
      steps: [
        'Variable dépendante : la réponse continue à prédire.',
        'Prédicteurs : les mesures corrélées, comme des bandes spectrales, des canaux de capteurs ou des items de questionnaire.',
        'Composantes : commencez par deux ou trois et augmentez tant que le Q² en validation croisée progresse.',
        'Pliages de validation croisée : cinq est un choix courant ; zéro désactive le Q².',
        'Lancez le modèle et lisez les coefficients, la variance expliquée par composante, les R² et Q² cumulés et les scores VIP.',
      ],
      expected:
        'Un tableau des coefficients sur l’échelle d’origine, un tableau des composantes avec R², R² cumulé et Q², un tableau VIP avec le seuil à un, et des graphiques observé-prédit et de l’ajustement par composante.',
    },
    advanced: {
      whenToUse: [
        'De nombreux prédicteurs fortement colinéaires, comme en spectroscopie, chimiométrie, omique ou données de capteurs.',
        'L’objectif est la prédiction et les coefficients individuels ne sont pas l’objet de l’inférence.',
        'Le nombre de prédicteurs est proche ou supérieur au nombre d’observations.',
        'Vous voulez peu de directions latentes interprétables plutôt qu’un modèle boîte noire.',
      ],
      whenNotToUse: [
        'Il vous faut des valeurs p ou un effet causal par prédicteur : utilisez une régression au plan clair.',
        'Les prédicteurs sont peu nombreux et peu corrélés : l’OLS est plus simple et plus lisible.',
        'La relation est fortement non linéaire : des splines ou des arbres peuvent mieux ajuster.',
        'La validation croisée est impossible car l’échantillon est minuscule ou les observations sont groupées.',
      ],
      reading: [
        'Un coefficient est la variation de la réponse par unité de ce prédicteur, les autres étant maintenus à leurs valeurs observées via les composantes ; ce n’est pas un effet partiel au sens de la régression.',
        'R² est la part de variance de la réponse expliquée dans l’échantillon ; Q² est la même quantité en validation croisée et la mesure honnête de la valeur prédictive.',
        'Un VIP supérieur à un signale les prédicteurs qui contribuent plus que la moyenne ; c’est un critère de sélection, pas un test de signification.',
        'Choisissez le plus petit nombre de composantes après lequel Q² ne progresse plus ; au-delà, on ajuste surtout du bruit.',
      ],
      pitfalls: [
        'Choisir les composantes par R² seul, qui augmente toujours et masque le surajustement.',
        'Lire un coefficient PLS comme une pente partielle OLS ou un effet causal.',
        'Oublier de centrer les prédicteurs, la première composante capturant alors surtout la moyenne.',
        'Utiliser des pliages qui font fuiter l’information entre entraînement et test sur des données groupées.',
        'Présenter le VIP comme une valeur p ou une preuve d’importance.',
      ],
      charts: [
        'Observé contre prédit, avec la diagonale en référence et les points colorés par le résidu.',
        'R² et Q² par nombre de composantes, pour choisir le plus petit modèle utile.',
        'Scores VIP par prédicteur, avec la ligne à un.',
      ],
    },
    seeAlso: ['regression', 'glm', 'mars'],
  },
  {
    id: 'mars',
    area: 'procedures',
    title: 'GAM / MARS (splines adaptatives)',
    summary:
      'Fonctions charnières linéaires par morceaux choisies automatiquement, avec interactions optionnelles et élagage par GCV.',
    tutorial: {
      goal: 'Ajuster une relation non linéaire souple entre une réponse continue et un ou plusieurs prédicteurs sans fixer la forme fonctionnelle à l’avance.',
      steps: [
        'Variable dépendante : la réponse continue.',
        'Prédicteurs : les variables continues dont l’effet peut se courber ou changer de direction.',
        'Degré maximal : un pour les effets additifs, deux pour le produit de deux fonctions charnières.',
        'Termes maximaux : un budget pour les fonctions de base ; commencez autour de vingt et laissez l’élagage réduire le modèle.',
        'Pénalité et élagage : gardez la pénalité par défaut à deux et activez l’élagage GCV sauf si vous voulez le modèle avant complet.',
        'Lancez le modèle et lisez les termes sélectionnés, les nœuds, la GCV, le R² et l’importance des prédicteurs.',
      ],
      expected:
        'Un tableau des termes charnières avec nœuds et coefficients, un tableau d’ajustement avec RSS, GCV, R² et R² ajusté, un tableau d’importance, et des graphiques observé-prédit et de l’effet partiel du prédicteur principal.',
    },
    advanced: {
      whenToUse: [
        'La forme de l’effet est inconnue ou change de direction sur l’étendue du prédicteur.',
        'Vous voulez une alternative automatique au choix du degré d’un polynôme.',
        'Vous devez explorer de nombreux prédicteurs pour des effets non linéaires et des interactions.',
        'La prédiction compte plus qu’un coefficient unique interprétable.',
      ],
      whenNotToUse: [
        'Il vous faut un coefficient par prédicteur avec une interprétation causale claire.',
        'Vous devez extrapoler bien au-delà de la plage observée : les fonctions charnières sont locales.',
        'L’échantillon est très petit ou tous les prédicteurs sont catégoriels.',
        'Un modèle linéaire ou polynomial simple ajuste déjà et se communique plus facilement.',
      ],
      reading: [
        'Chaque terme charnière est un changement de pente à un nœud : un coefficient positif augmente la pente après le nœud, un négatif la diminue.',
        'La GCV équilibre la somme des carrés résiduels et le nombre de termes ; plus bas est mieux et elle guide l’élagage.',
        'Les termes sélectionnés sont les morceaux qui survivent à l’élagage ; un prédicteur sans terme n’a pas de contribution non linéaire détectable.',
        'Le graphique de l’effet partiel maintient les autres prédicteurs à leurs valeurs observées et montre la forme attribuée à un prédicteur.',
      ],
      pitfalls: [
        'Construire un très grand modèle avant et oublier l’élagage, l’ajustement suivant alors le bruit.',
        'Extrapoler au-delà des nœuds observés, où la forme par morceaux est arbitraire.',
        'Lire un coefficient charnière comme la pente globale plutôt qu’un changement local.',
        'Ignorer les interactions quand le graphique des résidus montre encore de la structure.',
        'Comparer des GCV entre modèles ajustés sur des nombres différents de lignes complètes.',
      ],
      charts: [
        'Observé contre prédit avec la diagonale, pour contrôler la calibration.',
        'Profil de l’effet partiel du premier prédicteur, les autres à leurs valeurs observées.',
        'Importance des prédicteurs, mesurée par la perte d’ajustement lorsqu’on les retire.',
      ],
    },
    seeAlso: ['regression', 'nonlinear', 'pls'],
  },
  {
    id: 'iv',
    area: 'procedures',
    title: 'Variables instrumentales (2SLS)',
    summary:
      'Un effet cohérent pour un régresseur endogène, avec des instruments qui l’affectent mais n’agissent pas directement sur la réponse.',
    tutorial: {
      goal: 'Estimer l’effet d’un prédicteur corrélé à l’erreur par des variables omises, une erreur de mesure ou une simultanéité.',
      steps: [
        'Réponse : la variable dépendante continue.',
        'Prédicteurs endogènes : les régresseurs dont vous voulez l’effet mais qui ne sont pas exogènes.',
        'Instruments : des variables qui prédisent les régresseurs endogènes et n’agissent sur la réponse qu’à travers eux.',
        'Prédicteurs exogènes : des contrôles déjà valides comme instruments d’eux-mêmes.',
        'Erreurs robustes : activez HC1 quand la variance des résidus n’est pas constante.',
        'Lancez le modèle et lisez les coefficients structurels, le F partiel de première étape, le test de Sargan et celui de Wu–Hausman.',
      ],
      expected:
        'Une équation structurelle avec coefficients, erreurs standard, t et intervalles, un tableau de première étape avec les instruments exclus et leur F partiel, un tableau de diagnostic avec Sargan et Wu–Hausman, et des graphiques observé-prédit et OLS contre 2SLS.',
    },
    advanced: {
      whenToUse: [
        'Variables omises non observées mais corrélées à un régresseur.',
        'Erreur de mesure sur un régresseur clé, lorsqu’une seconde mesure ou un instrument est disponible.',
        'Simultanéité, comme offre et demande ou prix et quantité.',
        'Expériences naturelles, plans d’encouragement aléatoire et instruments de politique.',
      ],
      whenNotToUse: [
        'Les instruments sont faibles : un F de première étape sous dix rend le 2SLS biaisé et ses erreurs standard peu fiables.',
        'La restriction d’exclusion n’est pas crédible : la validité d’un instrument ne se teste pas avec les seules données.',
        'Il vous faut l’effet moyen de la population et les effets sont hétérogènes.',
        'Aucun instrument crédible n’existe : une estimation IV avec un mauvais instrument est pire qu’une OLS honnête avec une réserve.',
      ],
      reading: [
        'Le coefficient 2SLS est l’effet d’une variation unitaire du régresseur endogène pour la part de variation portée par les instruments.',
        'Le F partiel de première étape teste si les instruments exclus ajoutent du pouvoir explicatif ; des valeurs sous dix signalent des instruments faibles.',
        'Sargan teste les restrictions de suridentification quand il y a plus d’instruments que de régresseurs endogènes ; un p élevé est compatible avec la validité, sans en être une preuve.',
        'Wu–Hausman compare OLS et 2SLS ; un p faible suggère que le régresseur est endogène et que le 2SLS est nécessaire.',
      ],
      pitfalls: [
        'Utiliser un instrument faible, qui biaise le 2SLS vers l’OLS et gonfle les erreurs standard.',
        'Inclure la réponse ou une variable post-traitement parmi les instruments.',
        'Traiter un Sargan non significatif comme une preuve de validité.',
        'Oublier que l’exclusion est une hypothèse, pas un test.',
        'Comparer OLS et 2SLS sans rapporter la première étape et les diagnostics.',
      ],
      charts: [
        'Observé contre prédit de l’équation structurelle.',
        'Coefficients OLS et 2SLS du régresseur endogène côte à côte, avec intervalles.',
        'Résidus contre prédits, pour contrôler la structure restante.',
      ],
    },
    seeAlso: ['regression', 'panel', 'selection'],
  },
  {
    id: 'panel',
    area: 'procedures',
    title: 'Modèle de panel (effets fixes et aléatoires)',
    summary:
      'Effets fixes within et effets aléatoires GLS pour des observations répétées sur les mêmes unités.',
    tutorial: {
      goal: 'Estimer l’effet de prédicteurs variables dans le temps en contrôlant les différences stables non observées entre unités.',
      steps: [
        'Réponse : la variable dépendante continue mesurée plusieurs fois.',
        'Prédicteurs : les régresseurs qui varient dans le temps.',
        'Entité : la colonne qui identifie l’unité (personne, entreprise, pays).',
        'Temps : la colonne qui ordonne les observations répétées dans chaque entité.',
        'Modèle : effets fixes, effets aléatoires, ou les deux pour les comparer avec le test de Hausman.',
        'Lancez le modèle et lisez les coefficients within, les composantes de variance, le test de Hausman et les effets par entité.',
      ],
      expected:
        'Un tableau à effets fixes avec coefficients within et erreurs groupées, un tableau à effets aléatoires avec coefficients GLS, les composantes de variance pour l’entité et l’erreur, le test de Hausman, et des graphiques observé-prédit et des effets par entité.',
    },
    advanced: {
      whenToUse: [
        'Données longitudinales avec observations répétées sur les mêmes unités.',
        'Vous voulez retirer tout le confondant stable entre unités, observé ou non.',
        'Données de panel agrégées, comme des pays ou des entreprises sur des années.',
        'Vous devez comparer la variation within et between.',
      ],
      whenNotToUse: [
        'Le prédicteur d’intérêt est invariant dans le temps : les effets fixes l’absorbent entièrement.',
        'Le test de Hausman rejette les effets aléatoires : l’estimation RE est incohérente.',
        'Il y a très peu d’entités, donc les composantes de variance et les erreurs groupées sont peu fiables.',
        'Le modèle est dynamique et inclut la réponse retardée : l’estimateur within est biaisé.',
      ],
      reading: [
        'Un coefficient à effets fixes est la variation moyenne au sein d’une entité quand son prédicteur change ; il identifie l’effet par la variation within.',
        'Un coefficient à effets aléatoires est une combinaison pondérée par la précision des variations within et between, plus efficace si l’hypothèse tient.',
        'Hausman compare les deux : un p faible indique des différences systématiques et favorise les effets fixes.',
        'La composante d’entité mesure la persistance de la variabilité entre unités ; la composante idiosyncratique est le bruit within restant.',
      ],
      pitfalls: [
        'Interpréter un coefficient à effets fixes comme une comparaison entre entités.',
        'Inclure un prédicteur invariant dans un modèle à effets fixes.',
        'Utiliser des effets aléatoires quand Hausman les rejette.',
        'Ignorer la corrélation sérielle et rapporter des erreurs non groupées.',
        'Traiter un panel court comme s’il avait beaucoup d’entités.',
      ],
      charts: [
        'Observé contre prédit pour contrôler la calibration du panel.',
        'Graphique caterpillar des effets par entité, triés.',
        'Coefficients à effets fixes et aléatoires avec intervalles.',
      ],
    },
    seeAlso: ['regression', 'lmm', 'iv'],
  },
  {
    id: 'selection',
    area: 'procedures',
    title: 'Tobit et sélection de Heckman',
    summary:
      'Régression censurée pour réponses limitées et correction en deux étapes pour la sélection d’échantillon.',
    tutorial: {
      goal: 'Estimer l’effet de prédicteurs quand la réponse n’est observée qu’au-dessus ou en dessous d’un seuil, ou seulement pour un sous-groupe sélectionné.',
      steps: [
        'Modèle : Tobit pour une réponse censurée, Heckman pour un échantillon sélectionné.',
        'Réponse : la variable censurée pour Tobit, ou la réponse observée pour Heckman.',
        'Prédicteurs : les régresseurs de l’équation de réponse.',
        'Limites de censure : le seuil inférieur et, si besoin, le supérieur pour Tobit.',
        'Indicateur de sélection et prédicteurs de sélection : la variable 0/1 d’inclusion et les variables qui expliquent l’inclusion ; incluez au moins une variable absente de l’équation de réponse.',
        'Lancez le modèle et lisez les coefficients, sigma, rho et le coefficient du ratio de Mills inverse.',
      ],
      expected:
        'Pour Tobit, des coefficients sur l’échelle latente avec erreurs standard, sigma, log-vraisemblance et AIC. Pour Heckman, une équation de réponse, une équation de sélection, sigma, rho, lambda, le ratio de Mills inverse et un test de Wald de la correction. Les graphiques montrent observé-prédit et le schéma de censure ou de sélection.',
    },
    advanced: {
      whenToUse: [
        'Salaires observés seulement pour ceux qui travaillent, avec la non-participation comme mécanisme de sélection.',
        'Dépenses ou heures avec une limite inférieure significative et une censure réelle.',
        'Limites de détection dans les mesures de laboratoire.',
        'Sélection sur des facteurs non observables que l’appariement sur covariables ne peut pas traiter.',
      ],
      whenNotToUse: [
        'Les zéros sont de vraies réponses et non des valeurs censurées : un modèle en deux parties ou hurdle est plus adapté.',
        'La sélection semble dépendre uniquement de covariables observées : l’appariement par propension est plus transparent.',
        'Il n’y a pas de restriction d’exclusion : Heckman n’est identifié que par la non-linéarité du ratio de Mills et est fragile.',
        'Les erreurs sont fortement non normales ou hétéroscédastiques : Tobit et Heckman sont incohérents.',
      ],
      reading: [
        'Les coefficients Tobit sont des effets sur la réponse latente non censurée, pas sur la moyenne observée ; l’effet sur la moyenne observée diminue avec la probabilité de ne pas être censuré.',
        'Sigma est l’écart-type de l’erreur latente ; un sigma élevé indique une censure importante.',
        'Dans Heckman, rho est la corrélation entre les erreurs de sélection et de réponse ; un rho non nul indique que la sélection compte.',
        'Lambda est le coefficient du ratio de Mills inverse dans l’équation de réponse ; c’est le terme de correction, pas un effet causal.',
        'L’équation de sélection devrait contenir un instrument qui prédit l’inclusion mais peut être exclu de la réponse ; sans lui, l’identification repose sur la seule forme fonctionnelle.',
      ],
      pitfalls: [
        'Lire les coefficients Tobit comme des effets sur la réponse observée.',
        'Utiliser Heckman sans restriction d’exclusion et traiter le résultat comme robuste.',
        'Utiliser l’OLS sur l’échantillon sélectionné en ignorant le biais de sélection.',
        'Confondre censure et troncature : les unités censurées restent dans l’échantillon à la limite, les tronquées disparaissent.',
        'Croire que Heckman en deux étapes est du maximum de vraisemblance : il est cohérent mais moins efficace et les erreurs demandent la correction.',
      ],
      charts: [
        'Observé contre prédit sur l’échelle observée.',
        'Tobit : moyenne latente contre réponse observée, avec la ligne de censure.',
        'Heckman : distribution du ratio de Mills inverse et probabilité de sélection par réponse.',
      ],
    },
    seeAlso: ['regression', 'iv', 'propensity'],
  },
  {
    id: 'mediation',
    area: 'procedures',
    title: 'Analyse de médiation',
    summary:
      'Effets indirects, directs et totaux d’un prédicteur via un médiateur, avec intervalles de Sobel et bootstrap.',
    tutorial: {
      goal: 'Quantifier quelle part de l’effet d’un prédicteur sur la réponse passe par une variable intermédiaire.',
      steps: [
        'Réponse : la réponse finale continue.',
        'Prédicteur : l’exposition ou variable indépendante.',
        'Médiateur : la variable intermédiaire supposée sur le chemin.',
        'Covariables : confondants optionnels des relations prédicteur–médiateur, prédicteur–réponse et médiateur–réponse.',
        'Réplications bootstrap : 1000 est un début raisonnable ; zéro ne garde que les intervalles de Sobel et delta.',
        'Lancez le modèle et lisez les chemins a, b et c′, les effets indirect et total, la proportion médiée et l’intervalle bootstrap.',
      ],
      expected:
        'Un tableau des chemins avec a, b et c′, un tableau des effets total, direct et indirect avec erreurs et intervalles, la proportion médiée, et un graphique des tailles d’effet et de la distribution bootstrap de l’effet indirect.',
    },
    advanced: {
      whenToUse: [
        'Questions de mécanisme : non seulement si X affecte Y, mais par quel chemin.',
        'Évaluation de processus et parcours cliniques ou psychologiques.',
        'Il existe un ordre temporel crédible et les principaux confondants ont été mesurés.',
        'L’effet indirect est la quantité d’intérêt.',
      ],
      whenNotToUse: [
        'Les données sont transversales et l’ordre temporel est seulement supposé : parlez d’association, pas de médiation.',
        'Il existe un confondant médiateur–réponse non mesuré et affecté par l’exposition.',
        'Prédicteur et médiateur interagissent : un modèle de médiation modérée est nécessaire.',
        'L’effet total est proche de zéro, ce qui rend la proportion médiée instable.',
      ],
      reading: [
        'L’effet indirect est a × b ; le total est c′ + a × b ; le direct est c′.',
        'La proportion médiée est l’effet indirect divisé par le total ; elle est instable quand le total est faible et peut sortir de 0–1.',
        'L’erreur standard de Sobel utilise la méthode delta et est conservatrice ; l’intervalle bootstrap percentile est souvent préféré.',
        'Un intervalle bootstrap qui exclut zéro est une preuve d’effet indirect ; ce n’est pas une probabilité a posteriori bayésienne.',
      ],
      pitfalls: [
        'Appeler médiation une association transversale sans ordre temporel crédible.',
        'Ignorer le confondant de la relation médiateur–réponse.',
        'Rapporter la proportion médiée quand l’effet total est proche de zéro.',
        'Utiliser le test de Sobel comme seule inférence quand l’effet indirect est asymétrique.',
        'Oublier de fixer la graine du bootstrap, l’intervalle changeant à chaque exécution.',
      ],
      charts: [
        'Tailles des effets direct, indirect et total avec intervalles.',
        'Distribution bootstrap de l’effet indirect avec l’intervalle percentile et le zéro marqué.',
        'Coefficients des chemins a, b et c′ pour lire le mécanisme.',
      ],
    },
    seeAlso: ['regression', 'propensity'],
  },
  {
    id: 'propensity',
    area: 'procedures',
    title: 'Score de propension',
    summary:
      'Appariement et pondération par probabilité inverse pour les effets du traitement en données observationnelles.',
    tutorial: {
      goal: 'Comparer un groupe traité et un groupe non traité quand le traitement n’était pas aléatoire mais que les confondants pertinents ont été mesurés.',
      steps: [
        'Traitement : l’indicateur 0/1 de recevoir le traitement.',
        'Réponse : la réponse continue.',
        'Covariables : les variables antérieures au traitement qui prédisent à la fois le traitement et la réponse.',
        'Méthode : appariement du plus proche voisin ou pondération par probabilité inverse.',
        'Caliper et ratio : pour l’appariement, la distance maximale en écarts-types du score logit et le nombre de contrôles par unité traitée.',
        'Lancez le modèle et lisez le modèle de propension, le tableau d’équilibre avant et après, l’ATT et le nombre d’observations appariées ou effectives.',
      ],
      expected:
        'Un tableau du modèle de propension, un tableau d’équilibre avec différences de moyennes standardisées avant et après, l’ATT avec erreur standard et intervalle, le nombre d’unités appariées ou la taille effective, et des graphiques de chevauchement et d’amélioration de l’équilibre.',
    },
    advanced: {
      whenToUse: [
        'Études observationnelles où l’assignation dépend de confondants mesurés.',
        'Évaluation de programmes et recherche d’efficacité comparative.',
        'Vous voulez rendre les groupes traités et non traités comparables avant d’estimer l’effet.',
        'L’estimand d’intérêt est l’effet sur les traités (ATT).',
      ],
      whenNotToUse: [
        'Un confondant non mesuré est plausible : l’appariement ne l’élimine pas.',
        'Les groupes se chevauchent peu, donc beaucoup d’unités traitées n’ont pas de contrôles comparables.',
        'Un instrument crédible est disponible : les variables instrumentales visent un autre effet, souvent plus crédible.',
        'Le traitement varie dans le temps ou les covariables sont mesurées après le traitement.',
      ],
      reading: [
        'L’ATT est l’effet moyen pour les unités traitées, pas pour toute la population ; l’ATE demande de pondérer tout l’échantillon.',
        'Une différence de moyennes standardisée inférieure à 0,1 après ajustement est la règle pratique d’un bon équilibre.',
        'Le caliper écarte les unités traitées sans contrôle proche ; un caliper plus petit améliore l’équilibre mais change l’estimand et réduit l’échantillon.',
        'La pondération par probabilité inverse donne un poids 1/e aux traités et 1/(1−e) aux contrôles ; des poids très grands signalent un faible chevauchement.',
      ],
      pitfalls: [
        'Juger l’équilibre avec des tests de signification au lieu de différences standardisées.',
        'Ignorer le support commun et extrapoler à des unités traitées sans contrôles comparables.',
        'Inclure des variables post-traitement ou la réponse dans le modèle de propension.',
        'Rapporter l’ATT comme s’il s’agissait de l’effet moyen pour tous.',
        'Utiliser l’appariement sans vérifier l’équilibre de l’échantillon apparié.',
      ],
      charts: [
        'Chevauchement des scores de propension entre traités et contrôles.',
        'Love plot des différences de moyennes standardisées avant et après ajustement.',
        'ATT avec intervalle de confiance et nombre d’observations appariées ou effectives.',
      ],
    },
    seeAlso: ['logistic', 'iv', 'regression'],
  },
];
