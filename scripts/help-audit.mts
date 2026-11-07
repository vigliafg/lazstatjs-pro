/**
 * Help book audit: language contamination in the English source and structural
 * parity of every translated page against it.
 *
 * It reports, it does not fail the build: the English book is the source of
 * truth and the translated pages are brought in line with it wave by wave.
 */
import { BOOKS } from '../src/help/content/index';
import { ANALYSIS_IDS } from '../src/analyses/registry';

const reference = BOOKS.find(book => book.locale === 'en');
if (!reference) throw new Error('no English book');

const FIELDS = [
  'steps',
  'assumptions',
  'whenToUse',
  'whenNotToUse',
  'reading',
  'pitfalls',
  'charts',
  'glossary',
] as const;

const arrays = (topic: (typeof BOOKS)[number]['topics'][number]): Record<string, string[]> => ({
  steps: topic.tutorial.steps,
  assumptions: topic.advanced.assumptions ?? [],
  whenToUse: topic.advanced.whenToUse,
  whenNotToUse: topic.advanced.whenNotToUse ?? [],
  reading: topic.advanced.reading ?? [],
  pitfalls: topic.advanced.pitfalls ?? [],
  charts: topic.advanced.charts ?? [],
  glossary: (topic.advanced.glossary ?? []).map(entry => `${entry.term} — ${entry.definition}`),
});

const ITALIAN = /\b(che|della|delle|degli|sono|ogni|questo|questa|essere|anche|come|dopo|prima|senza|sulla|nel|nei|agli)\b/i;
const ENGLISH = /\b(the|and|with|that|this|from|when|which|should|would|each|than|into)\b/i;

let contaminated = 0;
for (const topic of reference.topics) {
  const values = [topic.summary, topic.tutorial.goal, topic.tutorial.expected, ...Object.values(arrays(topic)).flat()];
  for (const value of values) if (ITALIAN.test(value) && !ENGLISH.test(value)) contaminated += 1;
}

const parity: string[] = [];
const holes: string[] = [];
for (const book of BOOKS) {
  if (book.locale === 'en') continue;
  let pages = 0;
  let empty = 0;
  for (const id of ANALYSIS_IDS) {
    const topicId = id === 'guided' ? 'wizard' : id;
    const ref = reference.topics.find(t => t.id === topicId);
    const local = book.topics.find(t => t.id === topicId);
    if (!ref || !local) continue;
    const a = arrays(ref);
    const b = arrays(local);
    if (FIELDS.some(field => a[field].length !== b[field].length)) pages += 1;
    for (const field of FIELDS) if (a[field].length > 0 && b[field].length === 0) empty += 1;
  }
  parity.push(`${book.locale} ${pages}/${ANALYSIS_IDS.length}`);
  holes.push(`${book.locale} ${empty}`);
}

console.log('Help audit');
console.log(`  contaminazione inglese: ${contaminated}`);
console.log(`  pagine con struttura diversa: ${parity.join(', ')}`);
console.log(`  sezioni intere mancanti: ${holes.join(', ')}`);
