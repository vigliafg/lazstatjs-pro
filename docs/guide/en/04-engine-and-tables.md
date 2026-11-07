# 04 — Engine and tables

**Covers.** How a statistical result becomes a table, and why computation knows
neither React nor prose.

## Contents

- [Three layers, one direction](#three-layers-one-direction)
- [The table](#the-table)
- [Determinism](#determinism)
- [Dimensional guardrails](#dimensional-guardrails)
- [The result](#the-result)

## Three layers, one direction

- `src/stats/kernels/`: pure numbers. No labels, no formatting, no imports from
  tables or reports.
- `src/stats/tables/`: turn numbers into `TableSpec`, that is headers, rows and
  notes that can already be read.
- `src/stats/reports/`: read only tables and produce prose.

The dependency rules in `.dependency-cruiser.cjs` forbid backward arrows: a
kernel cannot format, a table cannot write sentences. A layout change never
touches the maths, and a formula change never touches the text.

## The table

`TableSpec` (`src/stats/types.ts`) has `id`, `title`, `subtitle?`, `columns`,
`rows` and `notes?`. The `id` is stable and unique within the card: it is used
by exports, tests and prose references. Columns declare key, label, alignment
and format (`dec3`, `p`, percentage…); notes explain the method instead of
repeating numbers.

Non-negotiable rule: **a table exists only if it has rows**. When an estimate
cannot be computed, the runner rejects with a reason instead of emitting an
empty table (exactly the defect fixed in `survey`).

## Determinism

Procedures with random components (bootstrap, permutations, imputation) use a
seeded generator and state it in the report. The same dataset with the same
parameters produces the same numbers, including inside the worker.

## Dimensional guardrails

Before computing, runners check that they have enough complete rows, enough
groups and a non-degenerate matrix; the shared `guardDimensions` check bounds
iterative cases. When a check fails the result is `{ ok: false, reason }`, with
a sentence saying what is missing and what to try.

## The result

`AnalysisRunResult` (`src/analyses/types.ts`) is the only contract: `ok: true`
with `tables`, `report`, `charts?`, `panels?`, `warnings?`, `header?`,
`callout?`; or `ok: false` with `reason`. It is serialisable, so it crosses the
Web Worker without adapters.

**Does not cover.** Prose: [05](05-reports-and-session-report.md). Charts:
[06](06-procedure-charts.md).

**Sources in the code.** `src/stats/kernels/`, `src/stats/tables/`,
`src/stats/reports/`, `src/stats/types.ts`, `src/analyses/types.ts`,
`src/stats/analysisResults.ts`.

**See also.**
[`docs/analysis/2026-11-05-inventario-procedure-tabelle.md`](../../analysis/2026-11-05-inventario-procedure-tabelle.md),
[`ARCHITECTURE.md`](../../../ARCHITECTURE.md).
