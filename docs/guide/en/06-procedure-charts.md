# 06 — Procedure charts

**Covers.** The charts each procedure produces, how they are built and why they
are not decoration.

## The catalogue

`CHART_KINDS` in `src/stats/charts.ts` lists 32 chart kinds. Each kind has a
default appearance (`src/charts/defaults.ts`), a set of editable properties
(`src/charts/features.ts`) and one or more builders in the shared kits
(`src/charts/kits/`). A new kind is added only when it has a clear statistical
purpose and a spec that compiles.

## A chart, not an image

A procedure chart is an `AnalysisChart`: `id`, `kind`, `title`, `subtitle?`,
`note?`, ready data (`data`), readable field names (`fields`), supporting
statistics (`stats?`) and options. It contains no React: the `buildVegaSpec`
adapter (`src/charts/vega/`) turns the model into Vega-Lite, and the same model
feeds the editor, export and tests.

The `note` explains how to read the chart (for example what the segment of a
forest plot means). It does not repeat numbers, which belong to tables.

## Which charts, for which procedure

The choice is not arbitrary: each procedure produces the charts needed to read
its result (residuals for a model, intervals for an estimate, a surface for an
experimental design). The full map is in
`docs/analysis/2026-11-04-mappa-procedure-grafici.md`; the per-procedure
inventory in `docs/analysis/2026-11-03-inventario-grafici-72-procedure.md`.

`src/analyses/chartsCoverage.test.ts` compiles the charts of covered procedures
with Vega-Lite, and `buildSpec.test.ts` guarantees every kind produces a valid
spec: a chart that does not compile never reaches the user.

## Composite charts

Some analyses add panels (`panels`) after single charts: cards that combine
several views of the same result (for example a surface and its contour
lines). They stay inside the same run-report.

**Does not cover.** Interactive chart editing: [07](07-chart-editor.md).

**Sources in the code.** `src/stats/charts.ts`, `src/charts/`,
`src/charts/vega/buildSpec.ts`, `src/analyses/*/run.tsx`.

**See also.** [`docs/CHART-ENGINE.md`](../../CHART-ENGINE.md),
[`docs/analysis/2026-11-02-confronto-grafici-jmp.md`](../../analysis/2026-11-02-confronto-grafici-jmp.md).
