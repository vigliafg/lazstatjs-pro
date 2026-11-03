import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Procédures de la vague 7 : VAR/VECM, GARCH et modèles espace-état. */
export const w7Topics: HelpTopic[] = [
  procedureTopic({
    id: 'var',
    title: 'VAR / VECM',
    summary: 'Modéliser plusieurs séries temporelles ensemble, tester la causalité de Granger et estimer la correction d’erreur.',
    goal: 'Décrire comment chaque série dépend de son passé et de celui des autres, en séparant relations de long terme et dynamique de court terme.',
    steps: [
      'Sélectionner au moins deux séries numériques dans l’ordre temporel.',
      'Laisser les retards à 0 pour la sélection automatique par AIC ou saisir un ordre fixe.',
      'Choisir VAR pour des séries stationnaires ou VECM pour des séries I(1) cointégrées.',
      'Lire les coefficients, les tests de Granger, les réponses impulsionnelles et la décomposition de la variance.',
    ],
    expected:
      'Un résumé du VAR avec stabilité, tableau des coefficients, tests de Granger, réponses impulsionnelles et décomposition de la variance ; le VECM ajoute le vecteur de cointégration et les vitesses d’ajustement.',
    whenToUse: [
      'Quand plusieurs séries évoluent ensemble et que l’on veut modéliser leur dynamique jointe.',
      'Quand on veut tester si le passé d’une série améliore la prévision d’une autre.',
      'Quand on soupçonne une relation stable de long terme entre séries non stationnaires.',
    ],
    assumptions: [
      'Les séries sont stationnaires ou différenciées jusqu’à la stationnarité ; le VECM exige des séries I(1) cointégrées.',
      'Les résidus ne présentent pas d’autocorrélation après l’ordre choisi.',
      'Le nombre d’observations suffit au nombre de paramètres.',
    ],
    whenNotToUse: [
      'Avec des séries très courtes : le nombre de paramètres croît vite.',
      'Quand un seul résultat intéresse : un ARIMA ou une régression univariée est plus simple.',
      'Quand des ruptures structurelles non modélisées dominent.',
    ],
    reading: [
      'Un VAR stable a toutes ses racines caractéristiques hors du cercle unité.',
      'Un test de Granger significatif indique un pouvoir prédictif, pas une causalité structurelle.',
      'Les réponses impulsionnelles dépendent de l’ordre de Cholesky.',
      'Dans un VECM, un α négatif et significatif indique une correction de l’écart à la relation de long terme.',
    ],
    pitfalls: [
      'Estimer un VAR sur des niveaux tendanciels sans vérifier la stationnarité.',
      'Lire la causalité de Granger comme une causalité structurelle.',
      'Interpréter les réponses impulsionnelles sans déclarer l’ordre d’identification.',
      'Utiliser Engle–Granger alors que plusieurs relations de cointégration peuvent exister.',
    ],
    charts: ['Réponses impulsionnelles par choc et réponse.', 'Parts de la variance de l’erreur à l’horizon final.'],
    glossary: [
      { term: 'VAR', definition: 'Système d’autorégressions, une équation par série, avec les retards de toutes les séries.' },
      { term: 'Cointégration', definition: 'Combinaison linéaire stationnaire de séries non stationnaires.' },
      { term: 'Réponse impulsionnelle', definition: 'Variation des séries après un choc d’un écart-type.' },
    ],
    seeAlso: ['timeseries', 'statespace'],
  }),
  procedureTopic({
    id: 'garch',
    title: 'GARCH',
    summary: 'Estimer une volatilité conditionnelle qui se regroupe dans le temps avec un modèle GARCH(1,1).',
    goal: 'Séparer le niveau d’une série de sa volatilité variable et prévoir l’ampleur des fluctuations futures.',
    steps: [
      'Sélectionner la série de rendements ou de variations dans l’ordre temporel.',
      'Fixer l’horizon de prévision.',
      'Estimer le modèle et lire la persistance, la variance de long terme et la demi-vie.',
      'Vérifier le test de Ljung–Box sur les résidus standardisés.',
    ],
    expected:
      'Résumé du modèle, coefficients avec erreurs standard, diagnostic des résidus et prévisions de la variance conditionnelle.',
    whenToUse: [
      'Quand l’ampleur des fluctuations change dans le temps et se regroupe en périodes calmes et agitées.',
      'Quand il faut une prévision de volatilité ou une échelle variable pour des mesures de risque.',
      'Quand les résidus d’un modèle de moyenne montrent encore une autocorrélation des carrés.',
    ],
    assumptions: [
      'La variance conditionnelle suit la récursion GARCH avec ω, α, β positifs et α + β < 1.',
      'Les innovations standardisées sont approximativement non corrélées ; la normalité est commode mais pas nécessaire.',
      'La moyenne est constante ou déjà retirée.',
    ],
    whenNotToUse: [
      'Quand la volatilité réagit différemment aux chocs positifs et négatifs : utiliser un modèle asymétrique.',
      'Quand la série a une tendance ou une saisonnalité déterministe dans la moyenne.',
      'Avec moins d’une trentaine d’observations.',
    ],
    reading: [
      'α mesure la réaction à la dernière innovation ; β la mémoire de la volatilité passée.',
      'Une persistance proche de 1 indique des chocs durables ; la demi-vie est le nombre de périodes pour les réduire de moitié.',
      'La variance de long terme est ω/(1 − α − β) quand α + β < 1.',
      'L’écart-type conditionnel est l’échelle attendue des fluctuations, pas un intervalle de confiance pour la moyenne.',
    ],
    pitfalls: [
      'Confondre prévisions de variance et prévisions de prix.',
      'Ignorer l’autocorrélation résiduelle des carrés.',
      'Rapporter la demi-vie quand α + β ≥ 1, où elle n’est pas définie.',
      'Traiter le modèle comme une description complète des queues et des asymétries.',
    ],
    charts: ['Série avec l’écart-type conditionnel.', 'Autocorrélation des résidus standardisés.'],
    glossary: [
      { term: 'Effet ARCH', definition: 'Dépendance de la variance courante aux innovations carrées récentes.' },
      { term: 'Persistance', definition: 'α + β dans GARCH(1,1), vitesse de dissipation des chocs de volatilité.' },
    ],
    seeAlso: ['timeseries', 'var'],
  }),
  procedureTopic({
    id: 'statespace',
    title: 'Espace-état et Markov switching',
    summary: 'Estimer un niveau ou une tendance latente avec le filtre de Kalman, ou deux régimes avec un AR(1) à changements de Markov.',
    goal: 'Séparer signal et bruit et décrire des séries qui alternent entre régimes.',
    steps: [
      'Choisir le modèle local de niveau/tendance ou le Markov switching à deux régimes.',
      'Sélectionner la série et l’horizon de prévision.',
      'Pour le modèle local, décider d’inclure ou non la tendance stochastique.',
      'Lire les états lissés et la prévision, ou les probabilités de régime et la matrice de transition.',
    ],
    expected:
      'Modèle local : variances, états filtrés et lissés, prévisions avec intervalles. Markov switching : moyennes et variances des régimes, matrice de transition, probabilités lissées et prévisions.',
    whenToUse: [
      'Quand la série observée est une mesure bruitée d’une quantité latente plus lisse.',
      'Quand la série semble alterner des phases calmes et agitées, ou basses et hautes.',
      'Quand il faut une interpolation fondée d’un historique bruité ou manquant.',
    ],
    assumptions: [
      'Le modèle local est linéaire et gaussien avec des innovations indépendantes.',
      'Le modèle de Markov a deux régimes, des probabilités de transition constantes et une moyenne AR(1) par régime.',
      'Le nombre de régimes est connu et les étiquettes sont identifiées par les valeurs initiales.',
    ],
    whenNotToUse: [
      'Quand les changements de régime dépendent de covariables observées : un modèle à seuil est plus clair.',
      'Avec des séries très courtes, variances et étiquettes sont instables.',
      'Quand une simple régression de tendance répond à la question.',
    ],
    reading: [
      'L’état filtré n’utilise que le passé ; l’état lissé utilise toute la série.',
      'Dans le modèle local, une grande variance d’observation indique beaucoup de bruit de mesure.',
      'Dans le modèle de Markov, la durée attendue d’un régime est 1/(1 − p).',
      'La prévision moyenne moyenne les régimes avec leurs probabilités de transition.',
    ],
    pitfalls: [
      'Lire l’état filtré comme s’il utilisait des observations futures.',
      'Imposer une tendance stochastique alors que le modèle de niveau seul a un meilleur AIC/BIC.',
      'Interpréter les étiquettes de régime sans vérifier leur sens.',
      'Ignorer l’incertitude de la classification des régimes.',
    ],
    charts: ['Série observée, niveau lissé et prévision.', 'Probabilité lissée du second régime.'],
    glossary: [
      { term: 'Filtre de Kalman', definition: 'Mise à jour récursive d’un état latent à partir d’observations bruitées.' },
      { term: 'Lisseur', definition: 'Estimation de l’état latent qui utilise toute la série, passé et futur.' },
      { term: 'Markov switching', definition: 'Modèle où les paramètres changent selon une chaîne de Markov cachée.' },
    ],
    seeAlso: ['timeseries', 'var'],
  }),
];
