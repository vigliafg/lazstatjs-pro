# 02 — Library and analysis selection

**Covers.** How the right procedure is found and what happens from the click on
"Run" to the result card.

## Contents

- [The catalogue](#the-catalogue)
- [From click to result](#from-click-to-result)
- [Immediate or on demand](#immediate-or-on-demand)
- [The card](#the-card)
- [Strengths](#strengths)

## The catalogue

The app offers 72 procedures and they live in a single list: each one has a
name, a family it belongs to and a stable internal identity. The name may
change, the identity does not: saved parameters, reports, charts and the in-app
guide keep recognising the same procedure after a label change.

The library opens in tabs and lets people search by name and description, save
favourites and pick up recently used procedures. Every entry says up front what
it needs — data or parameters only — and opens the form already filled with the
procedure's defaults.

## From click to result

1. The user picks the procedure and the form shows the required roles and the
   current parameters.
2. Before computing, the app checks the column references: if a role points at a
   column that has disappeared or has an incompatible type, the run stops and
   asks for the variable to be selected again.
3. The procedure is loaded only when it is needed, so the app starts quickly
   even with 72 procedures available.
4. Heavy procedures run in a separate process, with visible progress and the
   option to cancel; fast ones run straight away.
5. The outcome is always one of two things: a result with title, tables, prose,
   charts and warnings, or a readable reason explaining why the computation was
   not possible.

## Immediate or on demand

Fast procedures can update while the parameters change, and the app decides when
that is safe. Heavy procedures and large datasets stay manual: the Run button is
the only starting point, so nothing starts unexpectedly while the user is still
choosing.

## The card

The run-report card brings together the header, any warnings about data quality,
tables, prose and charts in the order chosen by the procedure. A rejected run
shows the reason and nothing else: never an empty card, never a half-built one.

## Strengths

- **Finding the right procedure costs little.** Search, favourites and recents
  recognise that the first obstacle is not the computation but knowing where to
  start.
- **Behind it, one structure for 72 procedures.** Roles, parameters and forms
  follow the same rules, so learning to use one analysis means being able to use
  the others too.
- **Designed for every level.** People who know little statistics search for the
  problem to solve and find it described in words; people who know the field
  search for the exact name and land on a ready form.

**Does not cover.** The meaning of individual parameters and roles: see [03 —
Roles, parameters and forms](03-roles-parameters-and-forms.md). The shape of the
result: [04 — Engine and tables](04-engine-and-tables.md).

**Sources in the code.** `src/analyses/registry.ts`, `src/analyses/runners.ts`,
`src/analyses/worker/`, `src/ui/analysis/` (`AnalysisLibrary.tsx`,
`AnalysisForm.tsx`, `RunControl.tsx`), `src/hooks/useAnalysisRun.ts`,
`src/ui/analysis/liveGate.ts`, `src/ui/analysis/favorites.ts`.

**See also.** [`docs/FORMS-AUDIT.md`](../../FORMS-AUDIT.md),
[`docs/PROCEDURES-CHARTS-AUDIT.md`](../../PROCEDURES-CHARTS-AUDIT.md).
