import type { HelpBook, HelpChapter } from '../types';
import { orderTopics } from '../order';
import { areaTopics } from './areas';
import { coreTopics } from './procedures-core';
import { moreTopics } from './procedures-more';

const chapters: HelpChapter[] = [
  { id: 'start', title: 'First steps', blurb: 'The whole loop in three moves, from grid to report.' },
  { id: 'data', title: 'The data', blurb: 'Import, edit, clean and give the groups readable names.' },
  { id: 'analysis', title: 'Analyses', blurb: 'Choose the procedure, set it up, run it again.' },
  { id: 'procedures', title: 'Procedures, one by one', blurb: 'A tutorial with an example and an advanced reading in plain words.' },
  { id: 'output', title: 'Results and project', blurb: 'Read the output, export it, save and reopen your work.' },
];

export const enBook: HelpBook = {
  locale: 'en',
  title: 'LazStats Handbook',
  subtitle: 'Applied statistics with the program, in two levels',
  preface:
    'Every page has two levels. Level A is a tutorial with a worked example; level B explains assumptions, when to use the procedure, how to read its output and which mistakes to avoid, in plain language even for advanced procedures. Pages can be read in sequence or printed as a book.',
  ui: {
    contents: 'Contents',
    tutorial: 'Tutorial',
    advanced: 'Advanced',
    tutorialHint: 'Step by step with a worked example',
    advancedHint: 'Assumptions, reading and pitfalls, in plain words',
    search: 'Search the handbook',
    searchEmpty: 'No page matches this search.',
    next: 'Next',
    previous: 'Previous',
    back: 'Back to contents',
    print: 'Print the book',
    openApp: 'Open the program',
    exampleData: 'Example data',
    expected: 'What you should see',
    assumptions: 'Assumptions',
    whenToUse: 'When to use it',
    whenNotToUse: 'When to avoid it',
    reading: 'How to read the output',
    pitfalls: 'Mistakes to avoid',
    glossary: 'Key terms',
    seeAlso: 'See also',
    updated: 'Handbook aligned with the current features of the program',
  },
  chapters,
  topics: orderTopics([...areaTopics, ...coreTopics, ...moreTopics]),
};
