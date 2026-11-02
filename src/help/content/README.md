# Help book — authoring a page

The book is data, not HTML: `book.ts` per locale assembles the topics and
`scripts/build-help.mjs` renders the printable edition into `public/help/`.

## Adding a procedure

1. Register the analysis id in `src/analyses/registry.ts` (label, family,
   description, keywords), then add `meta.analysis.<id>.label` and
   `.description` to every catalog under `src/i18n/catalog/<locale>/meta.ts`.
2. Write the page with `procedureTopic` from `template.ts`. The builder throws
   when a required section is empty, so a half-written page fails locally
   instead of at release time:

   ```ts
   import { procedureTopic } from './template';

   export const topics = [
     procedureTopic({
       id: 'proportions',
       title: 'Proportions',
       summary: 'Compare one or two proportions.',
       goal: 'Decide whether a proportion differs from a target.',
       dataset: 'matched_binary',
       steps: ['Pick the binary variable.', 'Set the null proportion.', 'Run it.'],
       expected: 'A test table and a one-line reading.',
       whenToUse: ['Independent binary observations.'],
       assumptions: ['Each observation is one trial.'],
       reading: ['The interval is on the proportion scale.'],
       pitfalls: ['Do not use the normal approximation with very few trials.'],
       charts: ['Interval plot'],
       glossary: [{ term: 'Proportion', definition: 'Successes divided by trials.' }],
       seeAlso: ['chisquare'],
     }),
   ];
   ```

3. Add the translated page to every locale (`en`, `it`, `fr`, `es`, `de`,
   `pt-PT`). Ids and order must match: the locale check compares both.
4. Build and check:

   ```bash
   npm run help:build
   for locale in en it fr es de pt-PT; do
     node --import tsx scripts/check-locale.mjs "$locale"
   done
   ```

   `check-locale` fails on a missing page, an empty tutorial, an empty
   `whenToUse`, a missing UI key, or a report sentence that has no translation.

## Rules

- Two levels per page: tutorial (goal → steps → expected) and advanced
  (assumptions, when to use, when to avoid, reading, pitfalls, glossary).
- One concept per glossary entry; the term must appear in the page text.
- Never copy a page across locales without translating it: the check reports
  strings identical to English for review.
- New families (`ml`, `advanced`) are declared in `analysis/registry.ts`; they
  stay hidden until the wave that adds their first procedure.
