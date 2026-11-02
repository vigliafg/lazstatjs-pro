/**
 * Template for a procedure page of the help book.
 *
 * Every locale ships the same topic ids in the same order, and each topic must
 * carry a tutorial (goal, steps, expected result) and an advanced reading
 * (when to use it, assumptions, pitfalls). Writing that shape by hand invites
 * omissions that `scripts/check-locale.mjs` only catches at the end; this
 * builder validates the required pieces up front and fills the optional ones.
 */
import type { HelpGlossaryEntry, HelpTopic } from './types';

export interface ProcedureTopicInput {
  /** Registry id of the analysis. */
  id: string;
  title: string;
  summary: string;
  goal: string;
  /** Sample dataset used by the worked example. */
  dataset?: string;
  steps: string[];
  expected: string;
  whenToUse: string[];
  assumptions?: string[];
  whenNotToUse?: string[];
  reading?: string[];
  pitfalls?: string[];
  charts?: string[];
  glossary?: HelpGlossaryEntry[];
  seeAlso?: string[];
}

const required = (value: string, field: string, id: string): string => {
  const trimmed = value.trim();
  if (trimmed.length === 0) throw new Error(`${id}: ${field} must not be empty`);
  return trimmed;
};

const requiredList = (values: string[], field: string, id: string): string[] => {
  if (values.length === 0) throw new Error(`${id}: ${field} must have at least one entry`);
  return values.map(value => required(value, field, id));
};

/** Build a validated procedure topic in the book's two-level contract. */
export const procedureTopic = (input: ProcedureTopicInput): HelpTopic => {
  const id = required(input.id, 'id', 'topic');

  return {
    id,
    area: 'procedures',
    title: required(input.title, 'title', id),
    summary: required(input.summary, 'summary', id),
    tutorial: {
      goal: required(input.goal, 'goal', id),
      ...(input.dataset ? { dataset: input.dataset } : {}),
      steps: requiredList(input.steps, 'steps', id),
      expected: required(input.expected, 'expected', id),
    },
    advanced: {
      ...(input.assumptions ? { assumptions: requiredList(input.assumptions, 'assumptions', id) } : {}),
      whenToUse: requiredList(input.whenToUse, 'whenToUse', id),
      ...(input.whenNotToUse
        ? { whenNotToUse: requiredList(input.whenNotToUse, 'whenNotToUse', id) }
        : {}),
      ...(input.charts ? { charts: requiredList(input.charts, 'charts', id) } : {}),
      ...(input.reading ? { reading: requiredList(input.reading, 'reading', id) } : {}),
      ...(input.pitfalls ? { pitfalls: requiredList(input.pitfalls, 'pitfalls', id) } : {}),
      ...(input.glossary
        ? {
            glossary: input.glossary.map(entry => ({
              term: required(entry.term, 'glossary term', id),
              definition: required(entry.definition, 'glossary definition', id),
            })),
          }
        : {}),
    },
    ...(input.seeAlso ? { seeAlso: [...input.seeAlso] } : {}),
  };
};

/** Contract checked by `scripts/check-locale.mjs` for every page. */
export const missingHelpContract = (topic: HelpTopic): string[] => {
  const problems: string[] = [];
  if (topic.tutorial.steps.length === 0) problems.push(`${topic.id}: empty tutorial`);
  if (topic.advanced.whenToUse.length === 0) problems.push(`${topic.id}: empty advanced section`);
  return problems;
};
