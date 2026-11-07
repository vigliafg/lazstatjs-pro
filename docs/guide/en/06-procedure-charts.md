# 06 — Procedure charts

**Covers.** The charts each procedure produces, how they come about, and why
they
are not decoration.

## Contents

- [The catalogue](#the-catalogue)
- [A chart, not an image](#a-chart-not-an-image)
- [Which charts, for which procedure](#which-charts-for-which-procedure)
- [Composite charts](#composite-charts)
- [Strengths](#strengths)

## The catalogue

There are 32 chart kinds. Each one has a default appearance, a set of properties
that can be changed, and one or more builders shared with the other kinds. A new
kind is added only if it has a clear statistical use and the resulting chart can
actually be built: the catalogue does not grow for the sake of completeness.

## A chart, not an image

A procedure chart is not a drawing: it is an object with an identity, a title, a
note, the prepared data, the readable field names and the chosen settings. It
contains no interface elements: it is translated into a drawing format only when
it has to be shown.

The same object feeds the display, the editor, the export and the tests. A chart
that cannot be built never reaches the user: the check happens beforehand, not
in
front of someone who is working.

The note that accompanies the chart explains how to read it — for instance what
a
segment in an interval chart represents — and does not repeat the numbers, which
live in the tables.

## Which charts, for which procedure

The choice is not arbitrary. Each procedure produces the charts needed to read
its own result: residuals for a model, intervals for an estimate, a surface for
an
experimental design. The full map is documented in `docs/analysis/`, with an
inventory per procedure and a comparison with the classical programs.

Automatic checks build the charts of the covered procedures and verify that
every
kind produces a valid result: coverage is measured, not declared.

## Composite charts

Some analyses add panels after the individual charts: they are cards that bring
several views of the same result together, for instance a surface and its
contour
lines. They stay in the same run-report, because they tell a single outcome.

## Strengths

- **The right chart arrives ready.** The user does not have to pick a kind and
  build it: the procedure knows which views are needed to read its own result.
- **The idea is to separate content from rendering.** The chart describes what
  to
  show; the translation into a drawing happens later, so screen, export and
tests
  see the same thing.
- **Useful at every level.** People with little experience find a note
  explaining how to read the chart; people with a lot find the expected
  diagnostic charts, with the option to adjust the details in the chart editor.

**Does not cover.** Interactive editing of the chart: [07](07-chart-editor.md).

**Sources in the code.** `src/stats/charts.ts`, `src/charts/`,
`src/charts/vega/buildSpec.ts`, `src/analyses/*/run.tsx`.

**See also.** [`docs/CHART-ENGINE.md`](../../CHART-ENGINE.md),
[`docs/analysis/2026-11-02-confronto-grafici-jmp.md`](../../analysis/2026-11-02-confronto-grafici-jmp.md).
