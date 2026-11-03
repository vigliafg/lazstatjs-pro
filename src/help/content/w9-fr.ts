import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Procédures de la vague 9 : enquête, apprentissage, texte, choix, Bayes, méta et spatial. */
export const w9Topics: HelpTopic[] = [
  procedureTopic({
    id: 'survey',
    title: 'Échantillon complexe',
    summary: 'Moyennes, totaux, proportions et régression basés sur le plan avec poids, strates et grappes.',
    goal: 'Estimer une quantité de population à partir d’un échantillon non aléatoire simple, en utilisant ses poids et son plan.',
    steps: [
      'Choisissez la variable et l’estimateur : moyenne, total, proportion ou régression pondérée.',
      'Dans la section avancée, indiquez les colonnes de poids, strate et grappe lorsque le plan les prévoit.',
      'Lancez et lisez l’estimation, son erreur standard, l’intervalle de confiance et l’effet de plan.',
    ],
    expected: 'Un tableau du plan, les estimations avec intervalles basés sur le plan et, pour la régression, les coefficients pondérés.',
    whenToUse: [
      'Quand les probabilités d’inclusion sont inégales ou que l’échantillon a été collecté par strates et grappes.',
      'Quand une moyenne brute serait biaisée par des groupes sur- ou sous-représentés.',
    ],
    reading: [
      'Un effet de plan supérieur à 1 indique un plan moins efficace qu’un échantillon aléatoire simple de même taille pondérée.',
      'La stratification réduit généralement la variance ; les grappes l’augmentent car les unités proches se ressemblent.',
    ],
    pitfalls: [
      'Traiter les poids d’échantillonnage comme des poids de fréquence : l’estimation change et l’erreur standard est fausse.',
      'Ignorer la colonne des grappes et supposer que chaque ligne est indépendante.',
    ],
    charts: ['Estimation et intervalle de confiance.', 'Forest plot des coefficients de régression pondérée.'],
    seeAlso: ['descriptive', 'regression'],
  }),
  procedureTopic({
    id: 'ml',
    title: 'Apprentissage automatique',
    summary: 'Forêt aléatoire, gradient boosting et réseau de neurones à une couche cachée pour un résultat numérique.',
    goal: 'Prédire un résultat numérique à partir de plusieurs prédicteurs sans imposer une forme linéaire ou paramétrique.',
    steps: [
      'Sélectionnez le résultat numérique et au moins un prédicteur numérique.',
      'Choisissez forêt aléatoire, gradient boosting ou réseau de neurones.',
      'Réglez arbres, taille minimale des nœuds, rétrécissement ou unités cachées et gardez une graine fixe.',
    ],
    expected: 'Des mesures d’ajustement, l’importance des variables pour les modèles à arbres, les prédictions et les graphiques des résidus.',
    whenToUse: [
      'Quand la relation est non linéaire ou contient des interactions qu’une régression manquerait.',
      'Quand l’objectif est la prédiction et que des coefficients interprétables ne sont pas nécessaires.',
    ],
    reading: [
      'Comparez le R² interne au R² out-of-bag : un grand écart indique un surajustement.',
      'L’importance mesure la réduction d’erreur dans les arbres ; ce n’est pas un effet causal.',
    ],
    pitfalls: [
      'Choisir le modèle sur les mêmes données que celles utilisées pour annoncer ses performances.',
      'Utiliser très peu de données : arbres et réseaux mémorisent vite le bruit.',
    ],
    charts: ['Observé et prédit.', 'Résidus et prédictions.', 'Importance des variables.'],
    seeAlso: ['regression', 'partition'],
  }),
  procedureTopic({
    id: 'text',
    title: 'Fouille de texte',
    summary: 'Fréquences des termes, TF-IDF, similarité des documents et modèle de sujets non négatif.',
    goal: 'Décrire un corpus de textes courts et trouver les termes et sujets qui distinguent les documents.',
    steps: [
      'Sélectionnez la colonne de texte et, si besoin, une colonne de groupe.',
      'Choisissez fréquences, TF-IDF, similarité des documents ou sujets.',
      'Réglez la taille du vocabulaire, la fréquence minimale dans les documents et le nombre de sujets.',
    ],
    expected: 'Un tableau des termes, une vue document-terme, une matrice de similarité ou un tableau de sujets avec leurs termes principaux.',
    whenToUse: [
      'Quand les données contiennent des réponses ouvertes, commentaires, titres ou documents courts.',
      'Quand il faut une carte exploratoire du vocabulaire avant de lire les textes un par un.',
    ],
    reading: [
      'Le TF-IDF réduit le poids des termes présents presque partout et fait ressortir les mots distinctifs.',
      'Sujets et similarités sont relatifs au corpus : ils ne valent pas automatiquement pour des textes filtrés autrement.',
    ],
    pitfalls: [
      'Oublier que les mots vides dépendent de la langue et des choix de nettoyage.',
      'Lire le nombre de sujets comme une vérité découverte plutôt que comme un choix de modèle.',
    ],
    charts: ['Termes les plus fréquents.', 'Prévalence des sujets.', 'Carte document-sujet ou similarité.'],
    seeAlso: ['descriptive', 'cluster'],
  }),
  procedureTopic({
    id: 'choice',
    title: 'Choix / MaxDiff',
    summary: 'Logit conditionnel pour ensembles de choix et scores best-worst pour les expériences MaxDiff.',
    goal: 'Expliquer quels attributs guident le choix entre alternatives ou classer des éléments à partir de tâches best-worst.',
    steps: [
      'Pour une expérience de choix, sélectionnez l’ensemble, l’alternative, l’indicateur de choix et les attributs qui varient.',
      'Pour MaxDiff, sélectionnez les colonnes bloc, élément, meilleur et pire.',
      'Lancez et lisez les coefficients, les parts prédites ou le classement MaxDiff.',
    ],
    expected: 'Un tableau de coefficients avec erreurs standard, les parts observées et prédites, ou un tableau de scores MaxDiff.',
    whenToUse: [
      'Quand le répondant choisit une alternative dans un ensemble et que les attributs varient entre alternatives.',
      'Quand une tâche best-worst ordonne de nombreux éléments sans demander un classement complet.',
    ],
    reading: [
      'Un coefficient positif augmente la probabilité de choisir l’alternative portant cet attribut.',
      'Le logit conditionnel n’utilise que la variation à l’intérieur de l’ensemble : les attributs constants s’annulent.',
    ],
    pitfalls: [
      'Inclure des attributs qui ne varient pas dans les ensembles : ils ne sont pas identifiés.',
      'Laisser des ensembles sans alternative choisie ou avec plusieurs choix.',
    ],
    charts: ['Forest plot des coefficients.', 'Parts observées et prédites.', 'Scores MaxDiff et intervalles.'],
    seeAlso: ['conjoint', 'logistic'],
  }),
  procedureTopic({
    id: 'bayes',
    title: 'Analyse bayésienne',
    summary: 'Résumés a posteriori et diagnostic MCMC pour modèles conjugués et régression gaussienne.',
    goal: 'Combiner la vraisemblance avec une loi a priori et décrire le paramètre par sa distribution a posteriori.',
    steps: [
      'Choisissez le modèle : moyenne normale, proportion binomiale, taux de Poisson ou régression linéaire.',
      'Sélectionnez le résultat et, pour la régression, les prédicteurs.',
      'Réglez la loi a priori, les itérations, le burn-in et le nombre de chaînes.',
    ],
    expected: 'Un tableau a posteriori avec moyenne, médiane, intervalle central, HDI, Rhat et ESS, plus un histogramme et un graphique des intervalles.',
    whenToUse: [
      'Quand des informations préalables ou peu de données rendent un résumé a posteriori plus naturel.',
      'Quand il faut l’incertitude complète du paramètre, pas seulement une estimation ponctuelle.',
    ],
    reading: [
      'L’HDI à 95 % est l’intervalle le plus court contenant 95 % de la masse a posteriori.',
      'Un Rhat proche de 1 et un ESS élevé indiquent des chaînes mélangées ; au-dessus de 1,05 il faut plus d’itérations.',
    ],
    pitfalls: [
      'Utiliser une loi a priori vague avec très peu d’observations et lire le résultat comme objectif.',
      'Rapporter des estimations issues de chaînes non convergées.',
    ],
    charts: ['Histogramme a posteriori.', 'Intervalles a posteriori avec HDI.', 'Posteriori jointes de deux paramètres.'],
    seeAlso: ['regression', 'samplesize'],
  }),
  procedureTopic({
    id: 'meta',
    title: 'Méta-analyse',
    summary: 'Pooling à effets fixes et aléatoires avec hétérogénéité, forest et funnel plots.',
    goal: 'Combiner les effets de plusieurs études et quantifier leur désaccord.',
    steps: [
      'Sélectionnez la colonne de l’effet et celle de son erreur standard ; éventuellement l’étiquette de l’étude.',
      'Choisissez DerSimonian–Laird, REML ou effets fixes pour la variance entre études.',
      'Lancez et lisez l’effet pooled, Q, I², τ², l’intervalle de prédiction et le test d’Egger.',
    ],
    expected: 'Un tableau pooled, un tableau d’hétérogénéité, le tableau des études, un forest plot et un funnel plot.',
    whenToUse: [
      'Quand plusieurs études estiment le même effet et qu’il faut un résumé avec son incertitude.',
      'Quand la question porte sur la cohérence des preuves, pas seulement sur la moyenne.',
    ],
    reading: [
      'I² est la part de variabilité totale due à l’hétérogénéité ; au-dessus de 50 % elle est souvent jugée substantielle.',
      'L’intervalle de prédiction décrit où tomberait l’effet d’une nouvelle étude, pas la précision de la moyenne.',
    ],
    pitfalls: [
      'Regrouper des effets mesurés sur des échelles différentes sans les convertir.',
      'Lire le test d’Egger comme une preuve de biais de publication : c’est une asymétrie, pas un verdict.',
    ],
    charts: ['Forest plot des études et de l’effet pooled.', 'Funnel plot.', 'Poids des études.'],
    seeAlso: ['regression', 'samplesize'],
  }),
  procedureTopic({
    id: 'spatial',
    title: 'Statistique spatiale',
    summary: 'Tests de Moran et Geary, indicateurs locaux et modèle à décalage spatial sur coordonnées.',
    goal: 'Vérifier si des unités proches se ressemblent plus qu’un arrangement aléatoire et modéliser la dépendance spatiale.',
    steps: [
      'Sélectionnez la variable numérique et les deux colonnes de coordonnées.',
      'Choisissez Moran I, Geary C, indicateurs locaux ou modèle à décalage spatial.',
      'Réglez les voisins les plus proches et les permutations ; pour le modèle SAR ajoutez les prédicteurs.',
    ],
    expected: 'Un tableau d’autocorrélation globale, une carte, les indicateurs locaux et, pour SAR, le coefficient de décalage et la régression.',
    whenToUse: [
      'Quand les observations sont géoréférencées et que la proximité peut créer de la dépendance.',
      'Quand il faut repérer des grappes ou des valeurs atypiques locales avant de modéliser.',
    ],
    reading: [
      'Un Moran I supérieur à sa valeur attendue indique une autocorrélation positive ; inférieur, une autocorrélation négative.',
      'Les p par permutation ne supposent pas la normalité mais dépendent du nombre de permutations.',
    ],
    pitfalls: [
      'Traiter la matrice de poids comme donnée : un autre k ou seuil de distance change les résultats.',
      'Lire l’autocorrélation spatiale comme un effet causal des voisins.',
    ],
    charts: ['Carte des valeurs ou des grappes LISA.', 'Indicateurs locaux.', 'Coefficients SAR.'],
    seeAlso: ['correlation', 'regression'],
  }),
];
