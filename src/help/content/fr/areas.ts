import type { HelpTopic } from '../types';

/** Chapitres qui expliquent l’application elle-même, avant les procédures. */
export const areaTopics: HelpTopic[] = [
  {
    id: 'start-tour',
    area: 'start',
    title: 'Premiers pas : données, analyse, résultats',
    summary: 'Toute la boucle en trois gestes, pour savoir où se trouve chaque chose.',
    tutorial: {
      goal: 'Lancer une première analyse de bout en bout sans rien connaître au programme.',
      dataset: 'score-groups.csv',
      steps: [
        'Ouvrez DONNÉES : c’est un tableur avec une ligne d’en-tête et une colonne par variable.',
        'Appuyez sur Importer et choisissez score-groups.csv : le délimiteur et les décimales sont détectés automatiquement.',
        'Vérifiez le type sous chaque en-tête : num pour les nombres, cat pour les groupes.',
        'Passez à ANALYSE, cherchez « Test t », remplissez le panneau de configuration et appuyez sur Lancer l’analyse.',
        'Lisez le rapport de lecture qui clôt chaque exécution et téléchargez le rapport HTML depuis la barre de sortie.',
      ],
      expected: 'Des tableaux, les graphiques éventuels et un commentaire en langage simple apparaissent dans la sortie ; une nouvelle exécution n’écrase jamais la carte précédente.',
    },
    advanced: {
      whenToUse: [
        'Lorsque vous voulez un seul flux pour les données, le calcul et la restitution, sans déplacer de fichiers entre programmes.',
        'Lorsque vous avez besoin d’un résultat reproductible : les données et les paramètres restent dans le projet .lzs.',
      ],
      reading: [
        'Les cartes de sortie sont des instantanés : elles restent telles qu’elles ont été produites même si les données changent ensuite.',
        'Le badge « obsolète » signifie que la grille a changé après la production de ce résultat.',
      ],
      pitfalls: [
        'Ne modifiez jamais les nombres dans le rapport : corrigez les données et relancez.',
        'Enregistrez le projet avant les longues expérimentations : la sauvegarde automatique vit dans le navigateur.',
      ],
      glossary: [
        { term: 'Procédure', definition: 'Une analyse statistique unique, par exemple le test t.' },
        { term: 'Carte de résultat', definition: 'Le bloc qui contient les tableaux, les graphiques et le rapport d’une exécution.' },
      ],
    },
    seeAlso: ['data-import', 'analysis-workflow', 'output-console'],
  },
  {
    id: 'data-import',
    area: 'data',
    title: 'Importer des fichiers CSV, TSV et Excel',
    summary: 'Faire entrer des données sans abîmer les nombres ni les catégories.',
    tutorial: {
      goal: 'Importer un fichier avec des décimales à virgule et des groupes textuels.',
      dataset: 'score-groups.csv',
      steps: [
        'Depuis DONNÉES, appuyez sur Importer et choisissez le fichier : l’aperçu montre les premières lignes.',
        'Vérifiez le délimiteur détecté (virgule, point-virgule, tabulation) et le séparateur décimal.',
        'Indiquez si la première ligne est l’en-tête et choisissez Appliquer en = Remplacer la grille.',
        'Appuyez sur Importer et lisez combien de lignes et de colonnes sont entrées.',
      ],
      expected: 'La grille montre une colonne par variable et une ligne par observation, avec des types de colonne pertinents.',
    },
    advanced: {
      assumptions: [
        'Chaque ligne est une observation complète ; les variables sont les colonnes.',
        'Les codes de valeur manquante doivent être déclarés après l’import (p. ex. -9, NA).',
      ],
      whenToUse: [
        'Fichiers exportés depuis Excel, R, SPSS ou une enquête en ligne.',
        'Plusieurs fichiers avec les mêmes colonnes à empiler verticalement (Ajouter des lignes).',
      ],
      whenNotToUse: ['Données non organisées avec une ligne par cas : remodelez-les d’abord.'],
      reading: [
        '« lignes et colonnes importées » confirme la taille ; « en-têtes en double renommés » signale des noms répétés.',
        '« BOM supprimé » est normal dans les fichiers enregistrés par Excel.',
      ],
      pitfalls: [
        'Un mauvais séparateur décimal transforme les nombres en texte : vérifiez le type après l’import.',
        'Les cellules vides sont toujours manquantes ; aucun code spécial n’est nécessaire.',
      ],
      glossary: [
        { term: 'Délimiteur', definition: 'Le caractère qui sépare les colonnes dans un fichier texte.' },
        { term: 'Code de valeur manquante', definition: 'Une valeur conventionnelle comme -9 qui doit être lue comme absente.' },
      ],
    },
    seeAlso: ['data-editor', 'data-clean', 'projects'],
  },
  {
    id: 'data-editor',
    area: 'data',
    title: 'Modifier les données dans la grille',
    summary: 'Types de colonne, validation, annulation et remplissage rapide.',
    tutorial: {
      goal: 'Corriger une valeur et transformer une colonne de texte en nombres.',
      dataset: 'score-groups.csv',
      steps: [
        'Double-cliquez sur une cellule et saisissez la nouvelle valeur ; Entrée confirme et descend d’une ligne.',
        'Changez le type dans la liste sous l’en-tête (num, int, cat, str).',
        'Appuyez sur Valider pour lister les cellules invalides ; Corriger auto. tente la conversion.',
        'Utilisez Ctrl+Z pour annuler, Ctrl+Y pour rétablir ; sélectionnez une plage et appuyez sur Ctrl+D pour remplir vers le bas.',
      ],
      expected: 'La cellule affiche la nouvelle valeur, la barre d’état met à jour le nombre d’invalides et l’annulation restaure l’état précédent.',
    },
    advanced: {
      whenToUse: [
        'Corrections petites ou systématiques avant une analyse.',
        'Ajout de colonnes calculées avec une formule (p. ex. Score_Post - Score_Pre).',
      ],
      reading: [
        'Le type de colonne pilote la validation, la correction automatique et l’export Excel ; les analyses déduisent toujours les nombres à partir des valeurs.',
        'L’inspecteur de variables montre les valeurs manquantes, les valeurs distinctes et les rôles.',
      ],
      pitfalls: [
        'Renommer une colonne met à jour les formules, mais les paramètres d’analyse qui l’utilisent doivent être resélectionnés.',
        'Trier la grille change l’ordre des lignes : les analyses appariées en dépendent.',
      ],
      glossary: [
        { term: 'Validation', definition: 'Le contrôle que chaque cellule est compatible avec le type déclaré.' },
        { term: 'Colonne calculée', definition: 'Une colonne dont la valeur est une formule, recalculée à chaque modification.' },
      ],
    },
    seeAlso: ['data-import', 'data-clean', 'levels'],
  },
  {
    id: 'data-clean',
    area: 'data',
    title: 'Nettoyer et transformer les données',
    summary: 'Rechercher et remplacer, valeurs manquantes, lignes vides et doublons.',
    tutorial: {
      goal: 'Unifier une étiquette écrite de plusieurs façons et remplir les cellules vides par la moyenne.',
      dataset: 'score-groups.csv',
      steps: [
        'Appuyez sur Nettoyer et ouvrez Rechercher / Remplacer ; choisissez une colonne ou Toutes les col.',
        'Saisissez le texte à rechercher et le remplacement, puis Appliquer.',
        'Dans la section Manquantes, choisissez Moyenne et appuyez sur Remplir pour la colonne numérique.',
        'Dans Ranger, supprimez les lignes vides et les doublons une par une, en lisant le message de résultat.',
      ],
      expected: 'Un message indique combien de remplacements ou de cellules ont changé ; chaque opération peut être annulée avec Ctrl+Z.',
    },
    advanced: {
      whenToUse: [
        'Avant toute analyse, pour éviter les catégories en double (Oui/oui, SI/si).',
        'Pour supprimer les lignes qui sont des copies exactes et gonflent les effectifs.',
      ],
      whenNotToUse: ['N’imputez pas par la moyenne quand beaucoup de valeurs manquent ou ne manquent pas au hasard : envisagez l’imputation multiple.'],
      reading: [
        '« Aucune correspondance » signifie que le texte n’existe pas, et non que l’opération a échoué.',
        '« cellules remplies avec » indique la valeur utilisée pour l’imputation.',
      ],
      pitfalls: [
        'Le remplacement par expression régulière est puissant : testez-le d’abord sur une colonne.',
        'L’imputation par la moyenne réduit la variabilité et sous-estime les erreurs standard.',
      ],
      glossary: [
        { term: 'Imputation simple', definition: 'Remplacer une valeur manquante par la moyenne, la médiane, le mode ou une constante.' },
        { term: 'Doublon', definition: 'Une ligne identique à une autre dans toutes les colonnes.' },
      ],
    },
    seeAlso: ['data-editor', 'levels', 'mi'],
  },
  {
    id: 'levels',
    area: 'data',
    title: 'Niveaux et étiquettes des groupes',
    summary: 'Donner des noms lisibles aux codes, choisir l’ordre et le niveau de référence.',
    tutorial: {
      goal: 'Afficher « Traitement » et « Témoin » au lieu de 1 et 0 dans les tableaux.',
      dataset: 'score-groups.csv',
      steps: [
        'Ouvrez le menu de la colonne de groupe et choisissez Modifier les niveaux.',
        'Saisissez une étiquette à côté de chaque code et ordonnez-les avec les flèches.',
        'Marquez le groupe que vous voulez comme référence du modèle.',
        'Appuyez sur Appliquer les niveaux et relancez l’analyse.',
      ],
      expected: 'Les tableaux, les graphiques et les rapports utilisent les étiquettes ; les analyses basées sur un modèle comparent à la référence.',
    },
    advanced: {
      whenToUse: [
        'Chaque fois qu’un groupe a des codes numériques cryptiques.',
        'Dans les modèles avec intercept : la référence décide de la lecture des coefficients.',
      ],
      reading: [
        'Le code reste dans les cellules ; l’étiquette n’est qu’une présentation.',
        'Les cellules qui contiennent des valeurs hors de la liste apparaissent comme « hors liste » et restent dans les données.',
      ],
      pitfalls: [
        'Supprimer un niveau ne supprime jamais d’observations : cela change seulement leur affichage.',
        'Changer la référence change les coefficients, pas la qualité du modèle.',
      ],
      glossary: [
        { term: 'Niveau de référence', definition: 'La catégorie à laquelle les autres groupes sont comparés dans le modèle.' },
        { term: 'Codage par traitement', definition: 'Un schéma où chaque groupe est comparé à la référence.' },
      ],
    },
    seeAlso: ['data-editor', 'anova', 'regression'],
  },
  {
    id: 'analysis-workflow',
    area: 'analysis',
    title: 'Choisir et lancer une analyse',
    summary: 'Bibliothèque, recherche, panneau de configuration, niveau de confiance et relances.',
    tutorial: {
      goal: 'Trouver la bonne procédure et obtenir un résultat complet.',
      dataset: 'score-groups.csv',
      steps: [
        'Ouvrez ANALYSE : la bibliothèque liste les procédures par famille.',
        'Saisissez le nom du test ou le problème dans la zone de recherche (p. ex. « comparer deux groupes »).',
        'Sélectionnez la procédure : le panneau de configuration n’affiche que les paramètres nécessaires.',
        'Choisissez les variables, réglez le niveau de confiance et appuyez sur Lancer l’analyse (Ctrl/⌘+Entrée).',
        'Utilisez Direct pour relancer automatiquement quand les données ou les paramètres changent.',
      ],
      expected: 'Une nouvelle carte s’ajoute à la sortie ; la précédente reste pour comparaison.',
    },
    advanced: {
      whenToUse: [
        'Toujours : c’est le seul chemin vers les tableaux, les graphiques et le rapport écrit.',
        'Direct est pratique pendant l’exploration mais doit rester désactivé pour les procédures lourdes.',
      ],
      reading: [
        'Le badge « lourd » marque les procédures à lancer explicitement.',
        'Si une colonne a changé, la procédure demande de resélectionner les variables concernées.',
      ],
      pitfalls: [
        'Changer le niveau de confiance ne change pas les données, mais change chaque estimation.',
        'Relancer sans modification crée des cartes en double : utilisez Appliquer pour réutiliser les paramètres.',
      ],
      glossary: [
        { term: 'Niveau de confiance', definition: 'La couverture des intervalles : 95 % est le choix habituel.' },
        { term: 'Instantané', definition: 'Une copie statique d’un résultat, indépendante des données ultérieures.' },
      ],
    },
    seeAlso: ['choosing-test', 'output-console', 'start-tour'],
  },
  {
    id: 'choosing-test',
    area: 'analysis',
    title: 'Quel test utiliser ?',
    summary: 'Une carte rapide de la question à la procédure, plus l’assistant guidé.',
    tutorial: {
      goal: 'Choisir une procédure à partir du type de question et de données.',
      dataset: 'score-groups.csv',
      steps: [
        'Ouvrez la procédure guidée (famille Guidé).',
        'Choisissez la question : décrire, comparer des groupes ou prédire une réponse.',
        'Définissez la réponse, les groupes et si les mesures sont indépendantes ou appariées.',
        'Lisez la recommandation et appuyez sur Ouvrir pour charger la procédure avec les paramètres prêts.',
      ],
      expected: 'La procédure suggérée s’ouvre dans le panneau avec les variables déjà sélectionnées ; il ne reste qu’à la lancer.',
    },
    advanced: {
      whenToUse: ['Au début, quand vous ne voulez pas vous tromper de famille.'],
      reading: [
        'Réponse numérique + 2 groupes indépendants → test t ou Mann-Whitney ; plus de groupes → ANOVA ou Kruskal-Wallis.',
        'Réponse numérique + mesures appariées → test t apparié ou Wilcoxon.',
        'Réponse binaire → logistique ou khi-deux ; temps jusqu’à un événement → survie.',
      ],
      pitfalls: [
        'La recommandation ne vérifie jamais les hypothèses : contrôlez la normalité, l’indépendance et la taille d’échantillon.',
        'Avec peu de cas, les tests non paramétriques conviennent souvent mieux.',
      ],
      glossary: [
        { term: 'Apparié', definition: 'Mesures répétées sur la même unité (avant/après).' },
        { term: 'Non paramétrique', definition: 'Un test qui ne suppose pas une forme de distribution précise.' },
      ],
    },
    seeAlso: ['analysis-workflow', 'ttest', 'nonparamrm'],
  },
  {
    id: 'output-console',
    area: 'output',
    title: 'Lire et exporter les résultats',
    summary: 'Cartes, plan, copie, graphiques PNG, rapports HTML/Word et classeurs Excel.',
    tutorial: {
      goal: 'Sortir les résultats dans un format utilisable.',
      dataset: 'score-groups.csv',
      steps: [
        'Lancez une analyse et regardez la carte : les tableaux, puis les graphiques, puis le rapport de lecture.',
        'Ouvrez le Plan pour sauter à une carte ou la réduire avec le chevron.',
        'Appuyez sur Rapport pour télécharger un fichier HTML imprimable, ou sur Word pour une version modifiable.',
        'Utilisez XLSX pour obtenir données et tableaux dans un classeur ; Graphiques télécharge les fichiers PNG.',
      ],
      expected: 'Les fichiers téléchargés contiennent les mêmes nombres que l’écran, avec des titres et des en-têtes cohérents.',
    },
    advanced: {
      whenToUse: [
        'Pour partager un résultat avec une personne qui n’utilise pas le programme.',
        'Pour archiver une version figée d’une analyse.',
      ],
      reading: [
        '« obsolète » signifie que les données ont changé après l’exécution : relancez avant d’exporter.',
        'Les cartes restaurées depuis un projet sont statiques : la copie et l’export fonctionnent, le recalcul non.',
      ],
      pitfalls: [
        'Exporter une carte obsolète produit un rapport formellement correct mais dépassé.',
        'Le filtre de lignes « affichage seulement » ne change pas les nombres utilisés par les analyses.',
      ],
      glossary: [
        { term: 'Rapport de lecture', definition: 'Le commentaire en langage simple qui clôt chaque analyse.' },
        { term: 'Classeur', definition: 'Le fichier .xlsx avec plusieurs feuilles, une par tableau.' },
      ],
    },
    seeAlso: ['analysis-workflow', 'projects'],
  },
  {
    id: 'projects',
    area: 'output',
    title: 'Enregistrer et rouvrir un projet',
    summary: 'Fichiers .lzs, sauvegarde automatique et restauration d’une sauvegarde.',
    tutorial: {
      goal: 'Conserver les données, les réglages et les paramètres pour reprendre demain.',
      dataset: 'score-groups.csv',
      steps: [
        'Depuis DONNÉES, appuyez sur Enregistrer le projet et nommez le fichier .lzs.',
        'Rechargez la page : la sauvegarde automatique restaure la session depuis le navigateur.',
        'Appuyez sur Ouvrir un projet et choisissez le fichier pour remplacer la session en cours.',
        'Depuis Paramètres, vous pouvez restaurer une sauvegarde IndexedDB si la sauvegarde automatique a échoué.',
      ],
      expected: 'Après l’ouverture, vous retrouvez la grille, les niveaux, les paramètres et les cartes de sortie enregistrées.',
    },
    advanced: {
      whenToUse: [
        'Avant de changer de jeu de données ou de tenter des expériences risquées.',
        'Pour partager un cas avec un collègue, avec les données et les paramètres.',
      ],
      reading: [
        'Le projet contient aussi des instantanés de sortie : lisibles mais non recalculables.',
        'Les champs ajoutés dans les versions plus récentes sont facultatifs : les anciens fichiers s’ouvrent avec des valeurs par défaut.',
      ],
      pitfalls: [
        'La sauvegarde automatique vit dans le navigateur : effacer les données du site la supprime.',
        'Un fichier .lzs n’est pas une sauvegarde des données d’origine : gardez aussi le CSV source.',
      ],
      glossary: [
        { term: '.lzs', definition: 'Le format de projet : du JSON avec les données, les réglages et les paramètres.' },
        { term: 'Sauvegarde IndexedDB', definition: 'Une copie de sécurité locale utilisée par la sauvegarde automatique.' },
      ],
    },
    seeAlso: ['data-import', 'output-console'],
  },
];
