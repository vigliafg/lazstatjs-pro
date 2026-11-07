# 09 — Languages, help and terminology

**Covers.** The six languages of the app, the guide available inside the
program,
and the writing rules that keep interface, report and documentation aligned.

## Contents

- [The languages](#the-languages)
- [The in-app guide](#the-in-app-guide)
- [Translating without breaking the terms](#translating-without-breaking-the-terms)
- [Terminology](#terminology)
- [Strengths](#strengths)

## The languages

Six languages are active: English, Italian, French, Spanish, German and European
Portuguese. English is the source of the guide; the report has its own default
language, independent of the interface. Adding a language means joining this
list
and providing a catalogue and a guide: the rest of the app does not need to
change.

## The in-app guide

The guide is static content organised by procedure: 83 pages per book, 498 pages
in total. Each page covers when to use the procedure and when not to, the steps,
the assumptions, how to read the tables, which charts arrive, the usual pitfalls
and a glossary of the terms that appear.

Building it is a controlled chain:

1. the content for each language defines the pages;
2. a command generates the six books;
3. a check verifies that every language is complete and consistent;
4. an audit measures language contamination in the English book and the
   structural parity of the translations.

## Translating without breaking the terms

Translations go through an automatic tool with two services in cascade.
Technical
terms are not translated by ear: after translation, recurring names are brought
back to their correct form, and the charts cited in a page are checked against
the
page itself. A translation cannot introduce a chart that is not there or lose a
step.

## Terminology

- **run-report** and **session-report** have a fixed meaning and are not
  synonyms: the first is the result of a run, the second is the ordered set of
  run-reports in a session.
- Role labels are translated through shared keys: changing a word in one
  language
  must not change the meaning of the role.
- The shared glossary collects the terms used by the guide, the report and the
  interface.

## Strengths

- **Six languages without six different programs.** Interface, report and guide
  follow the same keys and the same checks: a correction is made once and holds
  everywhere.
- **The idea is to separate texts from codes.** The program uses stable
  identifiers, people read translated labels: language becomes a replaceable
  layer, not a part of the computation.
- **Understanding does not require English.** Every procedure has its own page
  in
  the chosen language, with a glossary and the usual pitfalls; experts can
switch
  the language of the report alone to hand in a result in the reader's language.

**Does not cover.** The comparison with other programs:
[10](10-comparison-with-classical-statistics.md).

**Sources in the code.** `src/i18n/`, `src/help/content/`,
`src/stats/reportCopy/`, `scripts/translate-copy.py`,
`scripts/build-help.mjs`, `scripts/check-locale.mjs`, `scripts/help-audit.mts`.

**See also.**
[`docs/plans/2026-10-29-multilingua-e-manuale.md`](../../plans/2026-10-29-multilingua-e-manuale.md).
