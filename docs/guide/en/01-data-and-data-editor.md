# 01 — Data and Data Editor

**Covers.** How data enters the app, how it is typed and how it can be edited
without breaking analyses that are already configured.

## Contents

- [The model](#the-model)
- [Types, levels and reference](#types-levels-and-reference)
- [Missing values and validation](#missing-values-and-validation)
- [Formulas and computed columns](#formulas-and-computed-columns)
- [Structural operations](#structural-operations)
- [View](#view)
- [Import and export](#import-and-export)

## The model

The grid is not a generic spreadsheet: it is a dataset with typed columns and
stable identities. A column has an `id` that never changes, a visible name
(unique, with a `_2` suffix on duplicates) and a type chosen from the supported
set (`num`, `int`, `dec`, `cat`, `str`, `id`, `bol`, `dat`, `dtm`, `tim`,
`alp`, `chr`). Analyses read a read-only view of the dataset, not the cells:
a parameter points at the id, never at a position.

## Types, levels and reference

- The type declares how a column enters the computation; automatic detection
  proposes one on import and the user can correct it.
- A categorical column has **levels** with code, label and order, plus a
  **reference level** used by models (regression, ANOVA, logistic).
- Cells in a levelled column become dropdowns, while the stored value remains
  the code.
- The levels panel opens from the column and from analyses that ask for a
  factor, so labels and reference can be edited without leaving the analysis.

## Missing values and validation

Each column can declare **missing codes** (for example `-9`, `NA`). Cells
carrying them are excluded from every analysis, counted in the context bar and
flagged in the inspector. Per-cell regular-expression validation is available
for text data.

## Formulas and computed columns

A computed column keeps a persistent formula and is recalculated on every
edit. References follow renames; if a formula breaks, the column keeps its last
value instead of going blank.

## Structural operations

Inserting, deleting, moving, duplicating, splitting or merging columns must
never point an analysis at the wrong variable: ids are stable and parameters
are remapped. If a role is no longer compatible with the new type, the analysis
stops and asks to reselect the variable instead of running on another column.

## View

Row filter with type-aware operators (contains, equals, greater than, empty…),
choice between "view only" and "filter analyses too", frozen first column,
sticky header, virtualised rows above a threshold, fill handle and keyboard
(`Ctrl+D`, `Ctrl+R`), multi-cell paste.

## Import and export

- CSV with comma or semicolon delimiter, quoted fields, decimal commas.
- SPSS `.sav` and Stata `.dta` with variable and value labels, dates and
  user-missing values.
- Excel `.xlsx` and JSON.
- 52 sample datasets in `samples/`, each in the same 5 formats, with a
  machine-readable manifest and a regeneration script.

**Does not cover.** Computation and prose: see
[04 — Engine and tables](04-engine-and-tables.md) and
[05 — Reports](05-reports-and-session-report.md).

**Sources in the code.** `src/grid/` (model, levels, operations, history),
`src/io/` (readers, writers, manifest), `samples/README.md`.

**See also.** [`docs/GRID-STATE.md`](../../GRID-STATE.md),
[`docs/DATA-EDITING-ANALYSIS.md`](../../DATA-EDITING-ANALYSIS.md),
[`docs/DATAGRID-AUDIT.md`](../../DATAGRID-AUDIT.md).
