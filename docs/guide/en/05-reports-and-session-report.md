# 05 — Reports and session report

**Covers.** The prose around the numbers, its language, and the difference
between the result of a single run and the set of results in a session.

## Contents

- [Two words, two things](#two-words-two-things)
- [How the prose is written](#how-the-prose-is-written)
- [Report language and interface language](#report-language-and-interface-language)
- [The session](#the-session)
- [Export](#export)
- [Strengths](#strengths)

## Two words, two things

- **run-report**: the output of a single procedure — the tables, prose and
  charts of that run.
- **session-report**: the ordered set of run-reports currently in the Output
  window.

The distinction is binding: "export the session-report" and "export the
run-report" are two different actions, and the rest of the documentation uses
the two terms with this meaning.

## How the prose is written

The report is not free text. It is made of sentences with a stable identity and,
where needed, of gaps to fill with the values from the tables. The sentences
live in separate catalogues per language, and an automatic check requires every
language to have the same sentences with the same gaps: a translation cannot
forget a number or invent one.

The prose reads only the tables, never the computations. When a value changes,
it changes where it is produced and the sentence follows without being
rewritten.

## Report language and interface language

They are two independent choices. The interface starts from the system language
(or the one chosen by the user), while the report has its own default language
and can be changed for a single run too. Six languages are available: English,
Italian, French, Spanish, German and European Portuguese.

This separation serves a concrete case: a teacher working in English can hand in
an Italian report, or the other way round, without switching the whole
application.

## The session

Every run adds a block to the Output window. The session outline keeps the
order, the titles and the references, so the list stays readable even after many
analyses. Blocks can be deleted one by one or cleared all at once, and export
keeps the order of the session: the document handed over tells the same story
that was seen on screen.

## Export

- Text, HTML and PDF report.
- Tables as CSV.
- Charts as an image or as SVG.
- The full project, to reopen data, parameters and output together.

## Strengths

- **The prose always tells the truth of the numbers.** It is not a comment
  written elsewhere: it is born from the tables, so it cannot age against the
  result.
- **The idea is text as data.** Every sentence has an identity and every
  language has its own catalogue, so translation and quality control become
  automatic checks instead of spot re-readings.
- **Readable at every level.** People who do not know statistics get an
  explanation in plain words; people who do find the same quantities in the
  tables, in the language they prefer and without double work.

**Does not cover.** The tables ([04](04-engine-and-tables.md)) and how charts
are built ([06](06-procedure-charts.md)).

**Sources in the code.** `src/stats/reports/`, `src/stats/reportCopy/`,
`src/stats/report.ts`, `src/io/outputs.ts`, `src/io/reportExport.ts`,
`src/ui/analysis/sessionOutline.ts`.

**See also.**
[`docs/RUN-REPORT-SESSION-REPORT.md`](../../RUN-REPORT-SESSION-REPORT.md),
[`docs/plans/2026-10-29-session-report-outline.md`](../../plans/2026-10-29-session-report-outline.md).
