# 09 — Languages, help and terminology

**Covers.** The six app languages, the in-app guide and the writing rules that
keep interface, reports and documentation aligned.

## The languages

`ACTIVE_LOCALES` in `src/i18n/locales.ts` lists `en`, `it`, `fr`, `es`, `de`,
`pt-PT`. English is the source for the guide; the report has its own default
locale (`it`), independent from the interface language. A new language is added
by joining this list and providing a catalogue and a guide.

## The in-app guide

The guide is static content organised by procedure: 83 pages per book. Each
page explains when to use the procedure and when not to, the steps, the
assumptions, how to read the tables, the charts it produces, the pitfalls and a
glossary.

Building it is a pipeline:

1. per-locale content modules (`src/help/content/`) define the pages;
2. `npm run help:build` (`scripts/build-help.mjs`) generates the six books
   (83 × 6 = 498 pages);
3. `scripts/check-locale.mjs` checks that every locale is complete and
   coherent;
4. `npm run help:audit` (`scripts/help-audit.mts`) measures language
   contamination in the English book and structural parity of translations.

## Translating without breaking terms

Translations go through `scripts/translate-copy.py` (Google and Microsoft, with
a fallback). Technical terms are not translated by ear: after translation the
tokens are normalised (`ndc`, `%GRR`, `Steel–Dwass`, `Cramér–von Mises`) and the
charts mentioned in the page are checked against the ones the procedure
produces.

## Terminology

- **run-report** and **session-report** have the meaning fixed in `AGENTS.md`
  and are not synonyms.
- Role labels are localised through shared keys: changing a word in one language
  must not change the meaning of the role.
- The shared glossary is in
  [`docs/glossary/glossary.md`](../../glossary/glossary.md).

**Does not cover.** Comparison with other software:
[10](10-comparison-with-classical-statistics.md).

**Sources in the code.** `src/i18n/`, `src/help/content/`,
`src/stats/reportCopy/`, `scripts/translate-copy.py`, `scripts/build-help.mjs`,
`scripts/check-locale.mjs`, `scripts/help-audit.mts`.

**See also.**
[`docs/plans/2026-10-29-multilingua-e-manuale.md`](../../plans/2026-10-29-multilingua-e-manuale.md).
