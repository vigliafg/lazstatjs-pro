/**
 * Shape of the help book.
 *
 * The book is authored as data so the same source produces the HTML pages, the
 * search index and the printable edition. Every topic carries two explicit
 * levels: a tutorial with a worked example and an advanced reading written in
 * plain language.
 */
export interface HelpGlossaryEntry {
  term: string;
  definition: string;
}

export interface HelpTutorial {
  /** What the reader wants to obtain. */
  goal: string;
  /** Name of the example dataset shipped with the book. */
  dataset?: string;
  /** Numbered walkthrough of the application, button by button. */
  steps: string[];
  /** What the output should look like. */
  expected: string;
}

export interface HelpAdvanced {
  assumptions?: string[];
  whenToUse: string[];
  whenNotToUse?: string[];
  reading?: string[];
  pitfalls?: string[];
  glossary?: HelpGlossaryEntry[];
}

export interface HelpTopic {
  /** Registry id for procedures, or a stable area id (`data-editor`, ...). */
  id: string;
  area: HelpAreaId;
  title: string;
  summary: string;
  tutorial: HelpTutorial;
  advanced: HelpAdvanced;
  seeAlso?: string[];
}

export type HelpAreaId =
  | 'start'
  | 'data'
  | 'analysis'
  | 'output'
  | 'procedures';

export interface HelpChapter {
  id: HelpAreaId;
  title: string;
  blurb: string;
}

export interface HelpBook {
  locale: string;
  title: string;
  subtitle: string;
  preface: string;
  /** Labels of the book chrome, translated with the content. */
  ui: HelpBookUi;
  chapters: HelpChapter[];
  topics: HelpTopic[];
}

export interface HelpBookUi {
  contents: string;
  tutorial: string;
  advanced: string;
  tutorialHint: string;
  advancedHint: string;
  search: string;
  searchEmpty: string;
  next: string;
  previous: string;
  back: string;
  print: string;
  openApp: string;
  exampleData: string;
  expected: string;
  assumptions: string;
  whenToUse: string;
  whenNotToUse: string;
  reading: string;
  pitfalls: string;
  glossary: string;
  seeAlso: string;
  updated: string;
}
