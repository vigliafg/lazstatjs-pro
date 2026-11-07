# 07 — Chart editor

**Covers.** What the user can change in a chart, what stays fixed by the
procedure and where the changes go.

## Contents

- [The principle](#the-principle)
- [The property registry](#the-property-registry)
- [Where edits happen](#where-edits-happen)
- [Export](#export)

## The principle

A chart is born from data and from the statistical result: the editor never
changes numbers, only how they are read. Title, subtitle, notes, axes, legend,
colours, ordering, labels, reference lines and annotations are editable; the
chart kind and the data are not.

## The property registry

`src/charts/features.ts` declares, for each chart kind, which properties exist
and what they are called. The property panel and its controls come from that
registry: adding a property means adding it there and in the chart model, not
writing a control by hand for every kind.

Above single properties sit:

- **presets** (`src/charts/presets.ts`): quick, recognisable combinations;
- **styles** (`src/charts/styles.ts`): palettes, fonts, grids, themes;
- **annotations**: text and reference marks anchored to the chart;
- **per-kind defaults** (`src/charts/defaults.ts`): what the user sees when the
  chart first appears.

## Where edits happen

The property panel and the style gallery live in the chart tab
(`src/ui/analysis/ChartStyles.tsx`). Edits apply to that chart in that run and
do not touch the procedure: a new run starts from defaults unless the user
saved a style or a preset.

## Export

A chart exports as image or SVG with the same options seen on screen
(`chartExport.ts`); the run-report and session-report include charts in the
order they appear.

**Does not cover.** Spec construction: [06](06-procedure-charts.md).

**Sources in the code.** `src/charts/features.ts`, `src/charts/defaults.ts`,
`src/charts/presets.ts`, `src/charts/styles.ts`,
`src/ui/analysis/ChartStyles.tsx`, `src/io/chartExport.ts`.

**See also.** [`docs/CHART-EDITOR-AUDIT.md`](../../CHART-EDITOR-AUDIT.md),
[`docs/analysis/2026-10-31-property-panel-editor.md`](../../analysis/2026-10-31-property-panel-editor.md).
