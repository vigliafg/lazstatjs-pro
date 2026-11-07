# 01 — Data and Data Editor

**Covers.** How data gets into the app, how it is recognised, and how to correct
it without breaking the analyses already set up.

## Contents

- [A dataset with rules, not a spreadsheet](#a-dataset-with-rules-not-a-spreadsheet)
- [Types and levels](#types-and-levels)
- [Missing values](#missing-values)
- [Computed columns](#computed-columns)
- [Changing the structure without losing the thread](#changing-the-structure-without-losing-the-thread)
- [Filters and view](#filters-and-view)
- [Import and export](#import-and-export)
- [Strengths](#strengths)

## A dataset with rules, not a spreadsheet

The grid is not a free-form spreadsheet: it is a dataset organised in columns,
and every column has a visible name, a type and an internal identity that never
changes — not even when the column is renamed, moved or duplicated.

The difference shows in daily use. Analyses do not read individual cells: they
read a read-only picture of the dataset. And an analysis remembers the identity
of the column, not its position, so reordering the variables does not move the
meaning of a result.

## Types and levels

A column's type says how that column takes part in the computations. On import
the app proposes a type by looking at the values it finds, and the user can
always correct it. The types cover the usual cases in a dataset: continuous and
integer numbers, decimal values, categories, text, identifiers, yes/no answers,
dates, dates with a time, and times.

Categorical columns have one more thing: **levels**. Each level has a code, a
readable label and an order, and one of the levels can be marked as the
reference — the one models compare against.

In the grid a categorical cell becomes a drop-down with the labels, but the
stored value remains the code: the user sees words, the analysis works on stable
values. The levels panel opens from the column and also from the analyses that
ask for a factor, so a label can be fixed without changing screen and without
losing the work already done.

## Missing values

Every column can declare which values must be read as missing. From that moment
a cell with that content takes part in no analysis: it is counted in the context
bar and reported in the inspector, so the user always knows how much data is
really available. Text columns also offer a per-cell check, defined with a text
rule.

## Computed columns

A computed column keeps the rule that generated it and updates on every change
to
the data. If the rule can no longer be applied, the column keeps the last good
value instead of emptying itself: the data does not disappear in front of the
user, and it stays clear that something needs fixing.

## Changing the structure without losing the thread

Inserting, deleting, moving, duplicating, splitting or merging columns are
normal
operations when preparing a dataset. The app treats them as maintenance, not as
a risk: analyses already configured are pointed back at the right columns. If a
role is no longer compatible with the new type, the analysis stops and asks for
the variable to be selected again, instead of quietly computing on a different
column.

## Filters and view

A filter is built according to the column type (contains, equals, greater than,
empty and so on) and can apply to the view only or to the analyses as well: the
difference is explicit, not a side effect. The view offers a frozen first column
and a fixed header, virtualised rows on large datasets, fill by dragging the
handle or from the keyboard, and pasting into several cells at once.

## Import and export

- **CSV** with comma or semicolon separators, quoted fields and decimal commas.
- **SPSS and Stata**, with variable and value labels, dates and user-defined
  missing values.
- **Excel** and **JSON**.
- 52 sample datasets, each in the same five formats, with a manifest that
  programs can read and a script that regenerates them.

## Strengths

- **Analyses survive changes to the data.** Renaming, moving or rewriting a
  column does not make an analysis point at the wrong variable: when a role is
no
  longer valid the app says so, instead of computing something else.
- **The underlying idea is simple: stable identities and explicit types.** Every
  column knows what it holds and who it is; the rest of the app leans on those
  two facts instead of guessing.
- **Accessible at every level.** People who know little statistics get
  automatically proposed types, labels instead of codes, and missing values
  declared once for all; people who work in detail find levels, reference,
  filters and computed columns exactly where they expect them.

**Does not cover.** The computation and the prose: see
[04 — Engine and tables](04-engine-and-tables.md) and
[05 — Reports](05-reports-and-session-report.md).

**Sources in the code.** `src/grid/` (model, levels, operations, history),
`src/io/` (readers, writers, manifest), `samples/README.md`.

**See also.** [`docs/GRID-STATE.md`](../../GRID-STATE.md),
[`docs/DATA-EDITING-ANALYSIS.md`](../../DATA-EDITING-ANALYSIS.md),
[`docs/DATAGRID-AUDIT.md`](../../DATAGRID-AUDIT.md).
