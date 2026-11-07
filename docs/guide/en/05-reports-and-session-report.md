# 05 — Reports and session report

**Covers.** The prose around the numbers, its translation, and the difference
between one run and the session.

## Two words, two things

- **run-report**: the output of a single procedure — tables, prose and charts
  from that run.
- **session-report**: the ordered set of run-reports in the Output window.

The distinction is binding (`AGENTS.md`): "export the session-report" and
"export the run-report" are different actions.

## How the prose is built

A report is not free text: it is a `ReportSpec` made of sentences with a stable
id and, where needed, placeholders (`{s1}`, `{s2}`) filled from table values.
Sentences live in per-locale catalogues (`src/stats/reportCopy/`) and
`reportCopy.test.ts` requires every language to have the same sentences with
the same placeholders: a translation cannot drop a number or invent one.

Reports read tables only, never kernels: when a number changes, it changes where
it is computed and the sentence follows.

## Report language and interface language

They are independent. The interface starts from `en` (or the chosen language),
the report has its own default locale (`it`) and can be changed per run. The six
active locales are `en`, `it`, `fr`, `es`, `de`, `pt-PT`.

## The session

Each run appends a block to the Output window; the session outline
(`sessionOutline.ts`) keeps order, titles and references. Blocks can be removed
one by one or cleared together, and export preserves session-report order.

## Export

- Text/HTML/PDF report through `reportExport.ts`.
- Tables as CSV.
- Charts as image or SVG (`chartExport.ts`).
- Full `.lzs` project to reopen data, parameters and output.

**Does not cover.** Tables ([04](04-engine-and-tables.md)) and chart building
([06](06-procedure-charts.md)).

**Sources in the code.** `src/stats/reports/`, `src/stats/reportCopy/`,
`src/stats/report.ts`, `src/io/outputs.ts`, `src/io/reportExport.ts`,
`src/ui/analysis/sessionOutline.ts`.

**See also.**
[`docs/RUN-REPORT-SESSION-REPORT.md`](../../RUN-REPORT-SESSION-REPORT.md),
[`docs/plans/2026-10-29-session-report-outline.md`](../../plans/2026-10-29-session-report-outline.md).
