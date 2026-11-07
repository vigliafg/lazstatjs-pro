# 04 — Engine and tables

**Covers.** How a result becomes a readable table, and why the computation, the
presentation and the text stay apart.

## Contents

- [Three steps, one direction](#three-steps-one-direction)
- [The table](#the-table)
- [Repeatable results](#repeatable-results)
- [Checks before the computation](#checks-before-the-computation)
- [The result](#the-result)
- [Strengths](#strengths)

## Three steps, one direction

A result always follows the same path:

1. the **computation** produces numbers, without labels and without formatting;
2. the **tables** turn those numbers into headings, rows and notes that are
   already readable;
3. the **prose** reads only the tables and writes the sentences that go with
   them.

The direction never reverses: the computation cannot format, the tables cannot
write sentences. It is a technical rule, but the effect is practical: changing
the look of a table leaves the numbers alone, and fixing a computation does not
force a rewrite of the texts.

## The table

A table has a title, sometimes a subtitle, a list of columns and rows, and
notes. Every column declares its label, its alignment and how the values should
be shown; the notes explain the method and do not repeat the numbers visible
above.

Every table also has a stable identity inside the card: it serves export, tests
and references from the prose, so a sentence can cite "the coefficients table"
and stay correct even when the order of tables changes.

One rule is non-negotiable: **a table exists only if it has rows**. If an
estimate cannot be computed, the analysis rejects and explains why, instead of
showing an empty table.

## Repeatable results

Procedures with a random part — simulations, repeated sampling, resampling
estimates — use an always-identical sequence and say so in the report. The same
dataset with the same parameters produces the same numbers, even when the
computation happens in the separate process: two people redoing the same
analysis get the same result and can compare it.

## Checks before the computation

Before computing, every procedure verifies that it has what it needs: enough
complete rows, enough groups, a non-degenerate situation, classes that are not
separated, enough indicators for every factor. Shared checks cover the cases
that require several steps.

When a requirement is missing, the outcome is neither a wrong number nor a
silent table: it is a rejection with a sentence saying what is missing and what
to try.

## The result

The outcome of a run is a single object, always of the same shape: either a
successful result with tables, prose, any charts, panels, warnings and header,
or a rejection with its reason. Because it can be described as plain data, it
crosses the computation process without adapters: what is shown on screen is
what was computed.

## Strengths

- **Numbers and words cannot drift apart.** The prose is born from the tables,
  not from a second computation: when a value changes, the sentence commenting
  on it changes too.
- **The idea is the separation of duties.** Computation, presentation and text
  have clear boundaries, so an error is located quickly and a change does not
  spread unexpected effects.
- **A result that does not mislead anyone.** No empty tables and no numbers
  without an explanation: people with little experience read a clear sentence,
  people with a lot find the same quantities as always in the tables.

**Does not cover.** The prose: [05](05-reports-and-session-report.md). The
charts: [06](06-procedure-charts.md).

**Sources in the code.** `src/stats/kernels/`, `src/stats/tables/`,
`src/stats/reports/`, `src/stats/types.ts`, `src/analyses/types.ts`,
`src/stats/analysisResults.ts`.

**See also.**
[`docs/analysis/2026-11-05-inventario-procedure-tabelle.md`](../../analysis/2026-11-05-inventario-procedure-tabelle.md),
[`ARCHITECTURE.md`](../../../ARCHITECTURE.md).
