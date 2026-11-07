# LazStats Pro guide

LazStats Pro is a statistical analysis application that runs entirely in the
browser (and ships as a desktop application through Electron). The path is
always the same: **data → choose a procedure → parameters → computation →
tables, report and charts → chart editor → session**.

This folder explains the feature blocks one at a time. It does not replace
`ARCHITECTURE.md`, which describes the code layers and their dependency rules:
the guide says *what the app does and why*, the architecture says *where it
lives and what it may import*.

Italiano: [../README.md](../README.md)

## The chain, one line per step

```
typed dataset            src/grid, src/io        → 01
analysis library         src/analyses/registry   → 02
roles and parameters     src/analyses/roles*     → 03
engine and tables        src/stats/kernels|tables→ 04
run report               src/stats/reports       → 05
procedure charts         src/charts              → 06
chart editor             src/charts/features     → 07
rejections and guardrails src/analyses/params    → 08
languages and in-app help src/help, src/i18n     → 09
comparison with JMP/SPSS/R docs/analysis         → 10
```

## Index

| # | Document | In one sentence |
|---|----------|-----------------|
| 01 | [Data and Data Editor](01-data-and-data-editor.md) | Typed grid, levels, missing codes, formulas, import and export. |
| 02 | [Library and analysis selection](02-library-and-analysis-selection.md) | The 72 procedures, how they are found and started. |
| 03 | [Roles, parameters and forms](03-roles-parameters-and-forms.md) | The contract that turns every procedure into a function of the same parts. |
| 04 | [Engine and tables](04-engine-and-tables.md) | Numbers, tables and the shape of a result. |
| 05 | [Reports and session report](05-reports-and-session-report.md) | The prose around the result and its language. |
| 06 | [Procedure charts](06-procedure-charts.md) | The 32 chart kinds and the procedure → chart map. |
| 07 | [Chart editor](07-chart-editor.md) | What can and cannot be changed in a chart. |
| 08 | [Validation and guardrails](08-validation-and-guardrails.md) | Three levels of checks and the "never an empty output" rule. |
| 09 | [Languages, help and terminology](09-languages-help-and-terminology.md) | Six locales, 83 pages per book, prose audit. |
| 10 | [Comparison with classical statistics](10-comparison-with-classical-statistics.md) | What matches JMP, SPSS and R and what does not. |

## Binding terminology

Two words have a precise meaning across the project (enforced by `AGENTS.md`):

- **run-report**: the output of a *single* procedure — tables, prose and
  charts from that run.
- **session-report**: the ordered set of run-reports currently in the Output
  window.

They are not synonyms and must not be used interchangeably.

## The numbers

These are reference values, meant to be cited rather than copied into every
document:

- 72 statistical procedures (`src/analyses/registry.ts`).
- 32 chart kinds (`CHART_KINDS` in `src/stats/charts.ts`).
- 6 locales: `en`, `it`, `fr`, `es`, `de`, `pt-PT`; report prose defaults to
  `it`.
- 83 in-app help pages per book, 83 × 6 = 498 generated pages.
- 52 sample datasets in `samples/`, each in 5 formats (CSV, SPSS, Stata,
  Excel, JSON).

## Keeping this guide honest

Every document has the same header: **Covers**, **Does not cover** (with a
link to the right document), **Sources in the code**, **See also**. Dated notes
and audits in `docs/plans/` and `docs/analysis/` remain as evidence and deep
dives: the guide cites them instead of rewriting them.

When a number changes (procedures, charts, pages, datasets), update it here and
let the other documents cite it by reference. Relative links must keep
resolving: they point at repository files, not external URLs.

## Development and release

- Layers and dependency rules: [`ARCHITECTURE.md`](../../../ARCHITECTURE.md).
- Project status and backlog: [`docs/PROJECT-STATUS.md`](../../PROJECT-STATUS.md).
- Quality gate: `npm run check` runs `tsc --noEmit`, the full suite
  (`node --test`) and `npm run guard` (dependency-cruiser, madge, file size).
  `npm run help:build` regenerates the six help books and `npm run help:audit`
  checks language contamination and structural parity.
- Release 0.30.0: green gate, `help:build` and `help:audit` re-run, Electron
  packages built, release notes aligned with documents 01–10.
