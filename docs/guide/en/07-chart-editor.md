# 07 — Chart editor

**Covers.** What can be changed in a chart, what stays fixed by the procedure,
and where the changes end up.

## Contents

- [The principle](#the-principle)
- [The catalogue of properties](#the-catalogue-of-properties)
- [Where edits happen](#where-edits-happen)
- [Axes, zoom and pan](#axes-zoom-and-pan)
- [Export](#export)
- [Strengths](#strengths)

## The principle

A chart is born from the data and from the result of the analysis: the editor
does not allow changing the numbers, only reading them better. Title, subtitle,
notes, axes, legend, colours, ordering, labels, reference lines and annotations
can be edited; the chart kind and the data cannot.

This is a decision of substance: a chart whose values could be edited would be a
second way of computing, and therefore a second way of being wrong.

## The catalogue of properties

Every chart kind declares which properties it has and what they are called. The
properties panel and its controls are generated from that list, so adding a
property means adding it in one place, not writing a control by hand for every
chart kind.

Above the individual properties sit four tools that save time:

- **presets**: quick, recognisable combinations, to start again from a known
  view;
- **styles**: palettes, fonts, grids and themes;
- **annotations**: texts and references anchored to the chart;
- **per-kind defaults**: what the user sees as soon as the chart appears.

## Where edits happen

The properties panel and the style gallery sit in the chart tab. Edits apply to
that chart in that run and do not touch the procedure: a new run starts again
from the defaults, unless the user has saved a style or a preset to reuse.

## Axes, zoom and pan

The **Axis** section of the editor governs how numbers are read, not the numbers
themselves:

- **ticks**: how many values to show (2 to 50, or automatic);
- **limits**: fixed minimum and maximum for the axis, to compare charts with
  different scales;
- **scale**: automatic, linear, logarithmic or square root;
- **label format**: decimal, percentage or compact notation.

With **Zoom and pan** on, the wheel narrows the domain and dragging slides it;
**Reset zoom** restores the initial window. While row linking is on, the brush
surface covers the plot: the wheel still zooms, a plain drag selects and
**Shift+drag** pans the view; the cursor turns into a hand as soon as Shift is
held.

Everything applies to that card and that run: it changes neither the data nor
the statistical results. Limits and scale remain the right way to compare two
charts without zooming them by hand.

## Export

A chart is exported as an image or as SVG with the same options seen on screen.
The run-report and the session-report include the charts in the order they
appear, so the exported document keeps the sequence in which the result was
read.

## Strengths

- **Reading can be improved without touching the numbers.** Anyone who wants a
  clearer chart has every tool to do it, and none to alter the result.
- **The idea is a shared list of properties.** Every chart kind declares what it
  offers, and the interface is built from that list: uniform behaviour and fewer
  chances to go wrong.
- **Simple for those who only want to export, deep for those who want to
  refine.** A preset or a style is enough in two clicks; people working on the
  details find axes, legends, annotations and colours one by one.

**Does not cover.** How a chart is built: [06](06-procedure-charts.md).

**Sources in the code.** `src/charts/features.ts`, `src/charts/defaults.ts`,
`src/charts/presets.ts`, `src/charts/styles.ts`,
`src/ui/analysis/ChartStyles.tsx`, `src/io/chartExport.ts`.

**See also.** [`docs/CHART-EDITOR-AUDIT.md`](../../CHART-EDITOR-AUDIT.md),
[`docs/analysis/2026-10-31-property-panel-editor.md`](../../analysis/2026-10-31-property-panel-editor.md)
