# LazStats Pro guide

**Covers.** LazStats Pro is a statistical analysis application that runs
entirely in the browser (and is also available as a desktop application). The
path is always the same: **data → choose a procedure → parameters → computation
→ tables, report and charts → chart editor → session**.

This folder explains the feature blocks one at a time, in plain language: what
the app does, what makes the work easy, and why it is designed for people taking
their first steps in statistics as much as for those who use it every day. It
does not replace `ARCHITECTURE.md`, which describes the code layers and their
dependency rules: the guide says *what the app does and why*, the architecture
says *where it lives and what it may import*.

Italiano: [../README.md](../README.md)

## Contents

- [The chain, one line per step](#the-chain-one-line-per-step)
- [The documents](#the-documents)
- [Binding terminology](#binding-terminology)
- [The numbers](#the-numbers)
- [Strengths](#strengths)
- [Keeping this guide honest](#keeping-this-guide-honest)
- [Development and release](#development-and-release)

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

## The documents

| # | Document | In one sentence |
|---|----------|-----------------|
| 01 |
[Data and Data Editor](01-data-and-data-editor.md)
| 02 |
[Library and analysis selection](02-library-and-analysis-selection.md)
| 03 |
[Roles, parameters and forms](03-roles-parameters-and-forms.md)
| 04 |
[Engine and tables](04-engine-and-tables.md)
| 05 |
[Reports and session report](05-reports-and-session-report.md)
| 06 |
[Procedure charts](06-procedure-charts.md)
| 07 |
[Chart editor](07-chart-editor.md)
| 08 |
[Validation and guardrails](08-validation-and-guardrails.md)
| 09 |
[Languages, help and terminology](09-languages-help-and-terminology.md)
| 10 |
[Comparison with classical statistics](10-comparison-with-classical-statistics.md)

## Binding terminology

Two words have a precise meaning across the project (enforced by `AGENTS.md`):

- **run-report**: the output of a *single* procedure — the tables, prose and
  charts from that run.
- **session-report**: the ordered set of run-reports currently in the Output
  window.

They are not synonyms and must not be used interchangeably.

## The numbers

These are reference values, meant to be cited rather than copied into every
document:

- 72 statistical procedures (`src/analyses/registry.ts`).
- 32 chart kinds (`CHART_KINDS` in `src/stats/charts.ts`).
- 6 languages: `en` (source), `it`, `fr`, `es`, `de`, `pt-PT`; report prose
  defaults to `it`.
- 83 in-app help pages per book, 83 × 6 = 498 generated pages.
- 52 sample datasets in `samples/`, each in 5 formats (CSV, SPSS, Stata, Excel,
  JSON).

## Strengths

- **It reads without a statistics background.** No formulas and no symbols to
  decode: every technical term is explained in plain words the first time it is
  needed.
- **Every document says what the feature is for.** The *Strengths* section
  closes each chapter with the concrete benefit, the idea behind it and how the
  feature stays within reach of someone with little experience.
- **Designed for every level.** Learners find descriptions, warnings and
  glossaries; experts find numbers, code references and deeper documents without
  hunting for them elsewhere.

## Keeping this guide honest

Every document follows the same structure: **Covers**, **Strengths**, **Does not
cover** (with a link to the right document), **Sources in the code**, **See
also**. Dated notes and audits in `docs/plans/` and `docs/analysis/` remain as
evidence and deep dives: the guide cites them instead of rewriting them.

When a number changes (procedures, charts, pages, datasets), update it here and
let the other documents cite it by reference. Relative links must keep
resolving: they point at repository files, not external URLs, and `npm run
guard` checks that they really exist.

## Development and release

- Layers and dependency rules: [`ARCHITECTURE.md`](../../../ARCHITECTURE.md).
- Project status and backlog:
  [`docs/PROJECT-STATUS.md`](../../PROJECT-STATUS.md).
- Quality gate: `npm run check` runs `tsc --noEmit`, the full suite (`node
  --test`) and `npm run guard` (dependency-cruiser, madge, file size,
  documentation links). `npm run help:build` regenerates the six help books and
  `npm run help:audit` checks language contamination and structural parity.
- Release 0.30.0: green gate, `help:build` and `help:audit` re-run, Electron
  packages built, release notes aligned with documents 01–10.
