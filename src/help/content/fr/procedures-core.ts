import type { HelpTopic } from '../types';

/** Chapitres de procédure : description, comparaison de moyennes et modèles de régression. */
export const coreTopics: HelpTopic[] = [
  {
    id: 'descriptive',
    area: 'procedures',
    title: 'Statistiques descriptives',
    summary: 'Moyenne, dispersion, quantiles, valeurs manquantes et contrôles de normalité pour chaque variable.',
    tutorial: {
      goal: 'Résumer les variables numériques d’une étude avant de choisir un test.',
      dataset: 'score-groups.csv',
      steps: [
        'Ouvrez Descriptif dans la famille Descriptif.',
        'Sélectionnez les variables numériques (Score, Age) et laissez le niveau de confiance à 95 %.',
        'Appuyez sur Lancer l’analyse et lisez la ligne de chaque variable.',
        'Contrôlez la colonne des manquantes et le test de normalité avant de comparer des groupes.',
      ],
      expected: 'Une ligne par variable avec N, moyenne, écart-type, médiane, quartiles, minimum et maximum, plus le résultat du test de normalité.',
    },
    advanced: {
      assumptions: ['La moyenne et l’écart-type exigent une variable quantitative.'],
      whenToUse: [
        'Toujours, comme première étape : cela montre la forme des données et les valeurs étranges.',
        'Pour choisir entre tests paramétriques et non paramétriques.',
      ],
      whenNotToUse: ['Avec des variables catégorielles : utilisez les fréquences, pas la moyenne.'],
      reading: [
        'Une moyenne éloignée de la médiane suggère une asymétrie ou des valeurs extrêmes.',
        'Les tests de normalité sont indicatifs : avec un grand N ils sont trop sensibles, avec un petit N ils manquent de puissance.',
      ],
      pitfalls: [
        'Ne présentez jamais l’écart-type comme une erreur standard : ce sont des quantités différentes.',
        'Une seule valeur aberrante peut dominer la moyenne et l’écart-type.',
      ],
      glossary: [
        { term: 'Écart-type', definition: 'Dispersion moyenne des valeurs autour de la moyenne, dans la même unité que les données.' },
        { term: 'Quantile', definition: 'La valeur en dessous de laquelle se situe un pourcentage donné d’observations.' },
      ],
    },
    seeAlso: ['distfit', 'ttest'],
  },
  {
    id: 'distfit',
    area: 'procedures',
    title: 'Ajustement de distribution',
    summary: 'Comparez la distribution observée avec des familles théoriques et choisissez la meilleure.',
    tutorial: {
      goal: 'Savoir quelle distribution théorique décrit le mieux une variable.',
      dataset: 'score-groups.csv',
      steps: [
        'Ouvrez la procédure et sélectionnez la variable numérique.',
        'Cochez les distributions à comparer (normale, lognormale, gamma, Weibull…).',
        'Lancez-la et lisez le tableau d’adéquation.',
        'Relancez avec la seule meilleure distribution pour obtenir le graphique de comparaison.',
      ],
      expected: 'La distribution avec le meilleur critère est mise en évidence ; le graphique superpose la densité théorique et l’histogramme observé.',
    },
    advanced: {
      assumptions: ['Les observations doivent être indépendantes.'],
      whenToUse: ['Pour choisir une famille avant de modéliser des durées, des comptages ou des montants.'],
      whenNotToUse: ['Avec moins de quelques dizaines de cas, les familles sont difficiles à distinguer.'],
      reading: [
        'Un AIC/BIC plus bas signifie un meilleur ajustement.',
        'Une p-value d’adéquation ne prouve pas la normalité : elle mesure seulement la preuve contre elle.',
      ],
      pitfalls: ['Choisir la distribution à partir des données puis la tester sur ces mêmes données surestime l’ajustement.'],
      glossary: [
        { term: 'AIC', definition: 'Un critère qui récompense l’ajustement et pénalise le nombre de paramètres.' },
        { term: 'Lognormale', definition: 'Une distribution dont le logarithme est normal ; typique des montants et des durées.' },
      ],
    },
    seeAlso: ['descriptive', 'parametric'],
  },
  {
    id: 'ttest',
    area: 'procedures',
    title: 'Test t',
    summary: 'Comparez deux moyennes ou deux mesures appariées, avec une alternative non paramétrique.',
    tutorial: {
      goal: 'Vérifier si le score moyen diffère entre deux groupes indépendants.',
      dataset: 'score-groups.csv',
      steps: [
        'Ouvrez Test t et réglez Type de test = Échantillons indépendants.',
        'Variable 1 = Score, Variable 2 = Group.',
        'Gardez Variances sur Welch sauf si vous savez qu’elles sont égales.',
        'Lancez-le et lisez la différence, l’intervalle de confiance et la p-value.',
      ],
      expected: 'Deux lignes descriptives, le test t avec les degrés de liberté, la différence avec son IC et le rapport de lecture.',
    },
    advanced: {
      assumptions: [
        'Observations indépendantes ; pour le test apparié, un lien entre les deux mesures du même sujet.',
        'Avec un petit N, la normalité ou au moins l’absence d’asymétrie forte.',
      ],
      whenToUse: ['Deux groupes ou deux temps de mesure, réponse numérique.'],
      whenNotToUse: ['Plus de deux groupes (utilisez l’ANOVA) ou une réponse catégorielle.'],
      reading: [
        'La p-value répond à « dans quelle mesure ce résultat est-il compatible avec l’absence de différence », et non à la probabilité que l’hypothèse nulle soit vraie.',
        'L’intervalle de confiance montre aussi l’ampleur possible de la différence : jugez la pertinence pratique.',
      ],
      pitfalls: [
        'Comparer de nombreuses paires sans correction gonfle les faux positifs.',
        'Un résultat non significatif ne prouve pas l’égalité : regardez l’intervalle.',
      ],
      glossary: [
        { term: 'Welch', definition: 'La variante du test t qui ne suppose pas des variances égales.' },
        { term: "Cohen's d", definition: 'Taille d’effet exprimée en unités d’écart-type.' },
      ],
    },
    seeAlso: ['anova', 'nonparamrm', 'tost'],
  },
  {
    id: 'anova',
    area: 'procedures',
    title: 'ANOVA à un facteur',
    summary: 'Comparez les moyennes de deux groupes ou plus avec des tests post-hoc et Kruskal-Wallis.',
    tutorial: {
      goal: 'Savoir si le score moyen change entre trois groupes de traitement.',
      dataset: 'score-groups.csv',
      steps: [
        'Ouvrez ANOVA, réglez Variable dépendante = Score et Variable de groupe = Group.',
        'Gardez Post-hoc = Holm et activez l’alternative non paramétrique.',
        'Lancez-la et contrôlez le tableau principal, puis les comparaisons post-hoc.',
      ],
      expected: 'Tableau ANOVA avec F, degrés de liberté et p ; différences post-hoc avec IC ; Kruskal-Wallis comme contrôle.',
    },
    advanced: {
      assumptions: ['Indépendance, résidus normaux, variances similaires entre groupes.'],
      whenToUse: ['Un facteur inter-sujet avec trois niveaux ou plus.'],
      whenNotToUse: ['Mesures répétées (utilisez l’ANOVA à mesures répétées) ou deux groupes (le test t est équivalent).'],
      reading: [
        'Une p significative dit qu’au moins une moyenne diffère : le post-hoc dit laquelle.',
        'Un Levene significatif suggère des variances inégales : préférez Welch ou Kruskal-Wallis.',
      ],
      pitfalls: [
        'Choisissez le test post-hoc avant de regarder les données, pas après.',
        'Relancer une ANOVA sur des sous-groupes choisis après coup gonfle les faux positifs.',
      ],
      glossary: [
        { term: 'Post-hoc', definition: 'Comparaisons par paires effectuées après un test global significatif.' },
        { term: 'Holm', definition: 'Une correction des p-values qui contrôle l’erreur de type I sans être trop conservatrice.' },
      ],
    },
    seeAlso: ['factorial', 'ancova', 'nonparamrm'],
  },
  {
    id: 'factorial',
    area: 'procedures',
    title: 'ANOVA factorielle',
    summary: 'Deux facteurs inter-sujet, effets principaux et leur interaction.',
    tutorial: {
      goal: 'Vérifier si l’effet d’un traitement dépend du sexe des participants.',
      dataset: 'score-groups.csv',
      steps: [
        'Sélectionnez la variable dépendante et les deux facteurs (Facteur A, Facteur B).',
        'Activez « Inclure l’interaction A × B ».',
        'Lancez-la et lisez le tableau des effets : A, B et A × B.',
        'Si l’interaction est significative, discutez les moyennes des cellules plutôt que les seuls effets principaux.',
      ],
      expected: 'Une ligne par effet avec F, degrés de liberté, p et taille d’effet, plus les moyennes des cellules.',
    },
    advanced: {
      assumptions: ['Indépendance, résidus normaux, variances similaires dans les cellules.'],
      whenToUse: ['Deux facteurs catégoriels inter-sujet avec assez de cas par cellule.'],
      whenNotToUse: ['Des cellules avec très peu de cas rendent l’interaction instable.'],
      reading: [
        'Un effet principal significatif en présence d’une interaction significative doit être lu avec prudence.',
        'Les moyennes des cellules montrent le sens de l’interaction.',
      ],
      pitfalls: ['Dans les plans déséquilibrés, l’ordre des termes change les résultats : vérifiez le type de sommes des carrés.'],
      glossary: [
        { term: 'Interaction', definition: 'Lorsque l’effet d’un facteur change selon les niveaux de l’autre.' },
        { term: 'Effet principal', definition: 'L’effet moyen d’un facteur, en ignorant l’autre.' },
      ],
    },
    seeAlso: ['anova', 'mixedanova'],
  },
  {
    id: 'ancova',
    area: 'procedures',
    title: 'ANCOVA',
    summary: 'Comparez des groupes en ajustant sur des covariables continues, avec moyennes ajustées.',
    tutorial: {
      goal: 'Comparer des groupes en tenant compte de l’âge des participants.',
      dataset: 'score-groups.csv',
      steps: [
        'Choisissez la variable dépendante, le facteur de groupe et au moins une covariable.',
        'Lancez-la et contrôlez le test d’homogénéité des pentes.',
        'Lisez les moyennes ajustées avec intervalles de confiance et les comparaisons de Holm.',
      ],
      expected: 'Effet du groupe ajusté sur les covariables, moyennes ajustées et diagnostics des pentes.',
    },
    advanced: {
      assumptions: [
        'Une relation linéaire entre covariable et réponse à l’intérieur de chaque groupe.',
        'Pentes homogènes : si le test est significatif, l’ANCOVA classique n’est pas appropriée.',
      ],
      whenToUse: ['Groupes déséquilibrés sur une variable continue qui influence la réponse.'],
      whenNotToUse: ['Une covariable mesurée après le traitement : vous risquez d’ajuster l’effet lui-même.'],
      reading: ['Présentez les moyennes ajustées, pas les moyennes brutes.'],
      pitfalls: ['Une covariable corrélée au groupe rend l’interprétation fragile.'],
      glossary: [
        { term: 'Moyennes ajustées', definition: 'Des moyennes estimées comme si tous les groupes avaient la même valeur moyenne de covariable.' },
        { term: 'Pentes homogènes', definition: 'La relation covariable-réponse a la même pente dans chaque groupe.' },
      ],
    },
    seeAlso: ['anova', 'regression'],
  },
  {
    id: 'repeatedanova',
    area: 'procedures',
    title: 'ANOVA à mesures répétées',
    summary: 'Comparez des conditions mesurées sur les mêmes sujets, avec corrections de sphéricité.',
    tutorial: {
      goal: 'Comparer trois mesures prises sur les mêmes participants.',
      dataset: 'score-groups.csv',
      steps: [
        'Organisez les données au format large : une ligne par sujet, une colonne par condition.',
        'Sélectionnez les colonnes de condition (au moins trois).',
        'Lancez l’analyse et contrôlez Mauchly et les corrections de Greenhouse–Geisser ou Huynh–Feldt.',
        'Si le test global est significatif, lisez les comparaisons par paires corrigées.',
      ],
      expected: 'Tableau intra-sujet avec F, sphéricité et p corrigée, plus les comparaisons post-hoc.',
    },
    advanced: {
      assumptions: ['Sphéricité : les différences entre conditions ont la même variabilité.'],
      whenToUse: ['Les mêmes unités mesurées à trois occasions ou plus.'],
      whenNotToUse: ['Beaucoup de données manquantes : un modèle mixte est préférable.'],
      reading: [
        'Si Mauchly est significatif, utilisez les degrés de liberté corrigés.',
        'La correction change les degrés de liberté, pas les moyennes.',
      ],
      pitfalls: ['Un ordre de colonnes erroné compare les mauvaises conditions.'],
      glossary: [
        { term: 'Sphéricité', definition: 'L’hypothèse selon laquelle les variances des différences entre conditions sont égales.' },
        { term: 'Greenhouse–Geisser', definition: 'Une correction conservatrice des degrés de liberté lorsque la sphéricité est violée.' },
      ],
    },
    seeAlso: ['mixedanova', 'nonparamrm'],
  },
  {
    id: 'mixedanova',
    area: 'procedures',
    title: 'ANOVA mixte',
    summary: 'Un facteur inter-sujet et des conditions intra-sujet, avec leur interaction.',
    tutorial: {
      goal: 'Comparer la trajectoire de deux groupes sur trois temps.',
      dataset: 'score-groups.csv',
      steps: [
        'Préparez le format large : une ligne par sujet et une colonne par temps.',
        'Définissez le groupe inter-sujet et les colonnes de condition intra-sujet.',
        'Lancez l’analyse et lisez les effets temps, groupe et temps × groupe.',
      ],
      expected: 'Trois lignes d’effets avec p-values corrigées et moyennes par groupe et par temps.',
    },
    advanced: {
      assumptions: ['Sphéricité en intra-sujet, résidus normaux, indépendance entre sujets.'],
      whenToUse: ['Plan longitudinal avec un groupe de comparaison.'],
      whenNotToUse: ['Groupes très petits ou données manquantes structurelles.'],
      reading: ['Une interaction significative signifie que les groupes évoluent différemment dans le temps.'],
      pitfalls: ['Mélanger les formats large et long produit des colonnes erronées et des résultats sans sens.'],
      glossary: [
        { term: 'Inter-sujet', definition: 'Un facteur dont les niveaux sont attribués à des unités différentes.' },
        { term: 'Intra-sujet', definition: 'Un facteur mesuré de façon répétée sur la même unité.' },
      ],
    },
    seeAlso: ['repeatedanova', 'lmm'],
  },
  {
    id: 'nonparamrm',
    area: 'procedures',
    title: 'Tests non paramétriques pour mesures répétées',
    summary: 'Friedman, McNemar, Cochran Q et Jonckheere–Terpstra.',
    tutorial: {
      goal: 'Comparer trois conditions sans supposer la normalité.',
      dataset: 'score-groups.csv',
      steps: [
        'Choisissez le test adapté à votre plan : Friedman pour des conditions classées, McNemar pour deux mesures binaires appariées.',
        'Sélectionnez les colonnes ou variables nécessaires.',
        'Lancez-le et lisez la statistique avec sa p-value et, pour Friedman, le post-hoc de Nemenyi.',
      ],
      expected: 'Statistique, degrés de liberté et p ; pour Friedman, les comparaisons par paires avec les différences de rangs.',
    },
    advanced: {
      assumptions: ['Observations appariées ; Cochran Q exige une réponse binaire.'],
      whenToUse: ['Petits échantillons, réponses ordinales ou distributions fortement asymétriques.'],
      whenNotToUse: ['Grands échantillons continus avec une distribution régulière : les tests paramétriques sont plus puissants.'],
      reading: ['Une p significative signifie qu’au moins une condition diffère ; le post-hoc dit laquelle.'],
      pitfalls: ['Les rangs perdent l’information d’ampleur : présentez aussi les médianes.'],
      glossary: [
        { term: 'Friedman', definition: 'L’alternative non paramétrique à l’ANOVA à mesures répétées.' },
        { term: 'McNemar', definition: 'Un test pour deux mesures binaires appariées.' },
      ],
    },
    seeAlso: ['repeatedanova', 'ttest'],
  },
  {
    id: 'tost',
    area: 'procedures',
    title: 'Équivalence (TOST)',
    summary: 'Montrez que deux traitements sont équivalents dans une marge fixée à l’avance.',
    tutorial: {
      goal: 'Montrer qu’un médicament générique est équivalent à la référence dans ±0.5.',
      dataset: 'score-groups.csv',
      steps: [
        'Choisissez le plan (deux groupes ou mesures appariées).',
        'Fixez la marge d’équivalence (p. ex. 0.5) avant de regarder les données.',
        'Lancez l’analyse et lisez les deux tests unilatéraux et l’intervalle de confiance.',
      ],
      expected: 'Deux p-values unilatérales et une conclusion d’équivalence seulement si tout l’intervalle se situe dans la marge.',
    },
    advanced: {
      assumptions: ['Les mêmes que le test t correspondant ; la marge doit être justifiée cliniquement.'],
      whenToUse: ['Bioéquivalence, non-infériorité et comparaison de deux versions d’un instrument.'],
      whenNotToUse: ['Pour « prouver » l’absence de différence sans marge fixée à l’avance.'],
      reading: ['L’équivalence exige que tout l’intervalle reste dans ±marge.'],
      pitfalls: ['Choisir la marge après avoir vu les données invalide la procédure.'],
      glossary: [
        { term: 'TOST', definition: 'Deux tests unilatéraux qui, ensemble, évaluent l’équivalence.' },
        { term: 'Marge', definition: 'La plus grande différence considérée comme cliniquement acceptable.' },
      ],
    },
    seeAlso: ['ttest', 'samplesize'],
  },
  {
    id: 'correlation',
    area: 'procedures',
    title: 'Corrélation',
    summary: 'Pearson, Spearman et Kendall avec intervalles de confiance et matrice.',
    tutorial: {
      goal: 'Mesurer l’association entre deux variables continues.',
      dataset: 'score-groups.csv',
      steps: [
        'Sélectionnez deux variables ou plus.',
        'Choisissez la méthode principale : Pearson pour les relations linéaires, Spearman en présence de valeurs aberrantes ou de rangs.',
        'Lancez l’analyse et lisez le coefficient, l’IC et p ; la matrice montre chaque paire.',
      ],
      expected: 'Coefficient avec intervalle de confiance, p-value et matrice de corrélation avec des 1 sur la diagonale.',
    },
    advanced: {
      assumptions: ['Pearson : relation linéaire et pas de valeur aberrante dominante. Spearman : relation monotone seulement.'],
      whenToUse: ['Explorer des associations avant un modèle, ou vérifier la colinéarité.'],
      whenNotToUse: ['Pour une inférence causale : la corrélation n’identifie pas le sens.'],
      reading: [
        'Le signe donne la direction, la valeur absolue la force.',
        'Avec beaucoup de variables, les p-values non corrigées sont trop nombreuses : interprétez avec prudence.',
      ],
      pitfalls: ['Une corrélation forte peut disparaître ou s’inverser à l’intérieur de sous-groupes (paradoxe de Simpson).'],
      glossary: [
        { term: 'Pearson r', definition: 'Une mesure d’association linéaire entre deux variables quantitatives.' },
        { term: 'Spearman ρ', definition: 'Une corrélation de rangs, robuste aux valeurs aberrantes.' },
      ],
    },
    seeAlso: ['regression', 'multivariate'],
  },
  {
    id: 'regression',
    area: 'procedures',
    title: 'Régression linéaire',
    summary: 'Moindres carrés avec diagnostics, erreurs standard robustes et Theil-Sen.',
    tutorial: {
      goal: 'Estimer de combien le score change lorsque l’âge augmente.',
      dataset: 'score-groups.csv',
      steps: [
        'Variable dépendante = Score, indépendantes = Age.',
        'Gardez OLS et, sous Avancé, activez les erreurs standard robustes si vous soupçonnez une hétéroscédasticité.',
        'Lancez l’analyse et lisez le coefficient, l’erreur standard, l’IC et R².',
        'Contrôlez les graphiques de diagnostic des résidus.',
      ],
      expected: 'Tableau des coefficients avec IC, statistiques d’ajustement et diagnostics des résidus.',
    },
    advanced: {
      assumptions: [
        'Linéarité, erreurs indépendantes, homoscédasticité, résidus normaux (pour les tests).',
        'Pas de colinéarité extrême entre prédicteurs.',
      ],
      whenToUse: ['Réponse continue et relation approximativement linéaire.'],
      whenNotToUse: ['Réponse binaire (logistique), comptages (Poisson/NB), temps censurés (survie).'],
      reading: [
        'Un coefficient est le changement attendu de la réponse pour une unité de plus du prédicteur, toutes choses égales par ailleurs.',
        'R² décrit la variabilité expliquée, pas la qualité causale du modèle.',
      ],
      pitfalls: [
        'Extrapoler en dehors de la plage observée des prédicteurs.',
        'Lire un coefficient d’un modèle avec interaction comme un effet moyen.',
      ],
      glossary: [
        { term: 'HC3', definition: 'Un estimateur robuste de l’erreur standard, valable sous hétéroscédasticité.' },
        { term: 'Theil-Sen', definition: 'Une droite robuste fondée sur la médiane des pentes par paires.' },
      ],
    },
    seeAlso: ['correlation', 'logistic', 'ancova'],
  },
  {
    id: 'logistic',
    area: 'procedures',
    title: 'Régression logistique',
    summary: 'Réponse binaire avec odds ratios, analyse du seuil de décision et option Firth.',
    tutorial: {
      goal: 'Estimer l’effet de l’âge sur la probabilité d’un événement.',
      dataset: 'score-groups.csv',
      steps: [
        'Choisissez Réponse (0/1) et les prédicteurs.',
        'Lancez l’analyse et lisez les odds ratios avec intervalles de confiance.',
        'Regardez le tableau de classification et le seuil de décision suggéré.',
        'Activez Firth en cas de peu d’événements ou de séparation.',
      ],
      expected: 'Coefficients, odds ratios avec IC, mesures de discrimination et tableau de classification.',
    },
    advanced: {
      assumptions: ['Observations indépendantes ; logit linéaire dans les prédicteurs.'],
      whenToUse: ['Réponse dichotomique (oui/non, vivant/décédé, succès/échec).'],
      whenNotToUse: ['Réponse ordonnée avec plus de deux catégories (utilisez la logistique ordinale).'],
      reading: [
        'Odds ratio 1 = aucune association ; 2 = odds doublées, pas probabilité doublée.',
        'Avec des événements rares, l’odds ratio approche le risque relatif.',
      ],
      pitfalls: [
        'Peu d’événements par paramètre rend les estimations instables.',
        'Le seuil de décision qui maximise l’exactitude n’est pas forcément celui qui est utile en clinique.',
      ],
      glossary: [
        { term: 'Odds', definition: 'Le rapport entre la probabilité qu’un événement survienne et celle qu’il ne survienne pas.' },
        { term: 'Firth', definition: 'Une correction pénalisée qui réduit le biais en cas d’événements rares.' },
      ],
    },
    seeAlso: ['regression', 'ordinal', 'chisquare'],
  },
  {
    id: 'countreg',
    area: 'procedures',
    title: 'Régression de comptages',
    summary: 'Modèles de Poisson et binomiale négative pour les réponses de comptage.',
    tutorial: {
      goal: 'Modéliser le nombre d’événements en fonction d’un prédicteur.',
      dataset: 'score-groups.csv',
      steps: [
        'Choisissez la réponse de comptage et les prédicteurs.',
        'Commencez par Poisson ; si la dispersion estimée est nettement supérieure à 1, passez à la binomiale négative.',
        'Lancez l’analyse et lisez les rapports de taux avec IC.',
      ],
      expected: 'Coefficients, rapports de taux, un test de surdispersion et l’adéquation du modèle.',
    },
    advanced: {
      assumptions: ['Comptages non négatifs ; pour Poisson, moyenne égale à la variance.'],
      whenToUse: ['Nombre d’événements, d’appels ou de défauts par unité.'],
      whenNotToUse: ['Comptages avec beaucoup de zéros structurels : envisagez les modèles à inflation de zéros.'],
      reading: ['Un rapport de taux de 1.2 signifie une augmentation attendue de 20 % du nombre d’événements.'],
      pitfalls: ['Une régression linéaire sur de petits comptages produit des prédictions négatives.'],
      glossary: [
        { term: 'Surdispersion', definition: 'Une variance supérieure à la moyenne, typique des données de comptage réelles.' },
        { term: 'NB2', definition: 'Binomiale négative dont la variance est quadratique en la moyenne.' },
      ],
    },
    seeAlso: ['logistic', 'regression'],
  },
  {
    id: 'ordinal',
    area: 'procedures',
    title: 'Régression logistique ordinale',
    summary: 'Modèle logit cumulé pour les réponses ordonnées.',
    tutorial: {
      goal: 'Étudier comment un prédicteur décale la satisfaction entre des niveaux ordonnés.',
      dataset: 'score-groups.csv',
      steps: [
        'Choisissez la réponse ordinale (au moins trois catégories ordonnées).',
        'Sélectionnez les prédicteurs et vérifiez l’ordre des niveaux dans la colonne.',
        'Lancez l’analyse et lisez les odds ratios cumulés avec IC.',
      ],
      expected: 'Coefficients avec odds ratios cumulés et un test de l’hypothèse des odds proportionnelles.',
    },
    advanced: {
      assumptions: ['Odds proportionnelles : l’effet du prédicteur est le même pour tous les points de coupure.'],
      whenToUse: ['Échelles de Likert, gravité en classes ordonnées.'],
      whenNotToUse: ['Catégories non ordonnées : utilisez le modèle multinomial ou le khi-deux.'],
      reading: ['L’odds ratio cumulé décrit la probabilité de se situer dans une catégorie supérieure ou au-delà.'],
      pitfalls: ['Si la proportionnalité échoue, il faut d’autres modèles, pas une simple lecture des OR.'],
      glossary: [
        { term: 'Logit cumulé', definition: 'Un modèle qui compare chaque catégorie à toutes les catégories supérieures.' },
        { term: 'Proportionnalité', definition: 'L’hypothèse selon laquelle les effets des prédicteurs ne changent pas selon les points de coupure.' },
      ],
    },
    seeAlso: ['logistic', 'contingency'],
  },
  {
    id: 'lmm',
    area: 'procedures',
    title: 'Modèle linéaire mixte (LMM)',
    summary: 'Intercept aléatoire pour des mesures répétées ou des sujets regroupés.',
    tutorial: {
      goal: 'Analyser des mesures répétées en tenant compte de la corrélation intra-sujet.',
      dataset: 'score-groups.csv',
      steps: [
        'Choisissez la réponse, les prédicteurs fixes et la colonne de sujet ou de grappe.',
        'Lancez l’analyse et lisez les coefficients fixes avec IC.',
        'Comparez la variance résiduelle avec la variance de l’intercept aléatoire.',
      ],
      expected: 'Effets fixes avec erreurs standard, estimation de la variance aléatoire et critères d’ajustement.',
    },
    advanced: {
      assumptions: ['Résidus approximativement normaux ; structure de covariance correcte.'],
      whenToUse: ['Données longitudinales, grappes, mesures répétées avec données manquantes.'],
      whenNotToUse: ['Peu de grappes : les estimations de variance sont instables.'],
      reading: ['Les coefficients fixes se lisent comme dans une régression, mais les erreurs tiennent compte du regroupement.'],
      pitfalls: ['Traiter des mesures répétées comme indépendantes sous-estime les erreurs standard.'],
      glossary: [
        { term: 'Effet fixe', definition: 'Un effet moyen valable pour la population.' },
        { term: 'Effet aléatoire', definition: 'La variation entre unités (sujets ou grappes).' },
      ],
    },
    seeAlso: ['gee', 'repeatedanova'],
  },
];
