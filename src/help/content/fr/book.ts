import type { HelpBook, HelpChapter } from '../types';
import { orderTopics } from '../order';
import { areaTopics } from './areas';
import { coreTopics } from './procedures-core';
import { moreTopics } from './procedures-more';

const chapters: HelpChapter[] = [
  { id: 'start', title: 'Premiers pas', blurb: 'Toute la boucle en trois gestes, de la grille au rapport.' },
  { id: 'data', title: 'Les données', blurb: 'Importer, modifier, nettoyer et donner des noms lisibles aux groupes.' },
  { id: 'analysis', title: 'Analyses', blurb: 'Choisir la procédure, la configurer, la relancer.' },
  { id: 'procedures', title: 'Les procédures, une par une', blurb: 'Un tutoriel avec un exemple et une lecture avancée en langage simple.' },
  { id: 'output', title: 'Résultats et projet', blurb: 'Lire la sortie, l’exporter, enregistrer et rouvrir votre travail.' },
];

export const frBook: HelpBook = {
  locale: 'fr',
  title: 'Manuel LazStats',
  subtitle: 'La statistique appliquée avec le programme, en deux niveaux',
  preface:
    'Chaque page a deux niveaux. Le niveau A est un tutoriel avec un exemple guidé ; le niveau B explique les hypothèses, quand utiliser la procédure, comment lire sa sortie et quelles erreurs éviter, en langage simple même pour les procédures avancées. Les pages se lisent dans l’ordre ou s’impriment comme un livre.',
  ui: {
    contents: 'Sommaire',
    tutorial: 'Tutoriel',
    advanced: 'Avancé',
    tutorialHint: 'Pas à pas avec un exemple guidé',
    advancedHint: 'Hypothèses, lecture et pièges, en langage simple',
    search: 'Rechercher dans le manuel',
    searchEmpty: 'Aucune page ne correspond à cette recherche.',
    next: 'Suivant',
    previous: 'Précédent',
    back: 'Retour au sommaire',
    print: 'Imprimer le manuel',
    openApp: 'Ouvrir le programme',
    exampleData: 'Données d’exemple',
    expected: 'Ce que vous devriez voir',
    assumptions: 'Hypothèses',
    whenToUse: 'Quand l’utiliser',
    whenNotToUse: 'Quand l’éviter',
    reading: 'Comment lire la sortie',
    pitfalls: 'Erreurs à éviter',
    glossary: 'Termes clés',
    seeAlso: 'Voir aussi',
    updated: 'Manuel aligné sur les fonctionnalités actuelles du programme',
  },
  chapters,
  topics: orderTopics([...areaTopics, ...coreTopics, ...moreTopics]),
};
