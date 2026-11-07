# 02 — Library and analysis selection

**Covers.** How a procedure is found and what happens between clicking "Run"
and the result card.

## The catalogue

Procedures are declared in a single registry, `src/analyses/registry.ts`:
72 entries, each with a stable id, a label and a family. The id is the contract
used everywhere — parameters, reports, charts, in-app help — so it does not
change when the label does.

The library is organised in tabs and offers search by name and description,
saved favourites and the list of recent procedures. Each entry says what it
needs (data or parameters only) and opens the form pre-filled with the
procedure defaults.

## From click to result

1. The user picks a procedure: the form reads the required roles and the
   current parameters (`src/ui/analysis/AnalysisForm.tsx`,
   `AnalysisOptions.tsx`).
2. The run validates column references: if a role points at a column that is
   gone or has an incompatible type, it stops and asks to reselect.
3. The runner is loaded on demand (`ANALYSIS_RUNNERS` in
   `src/analyses/runners.ts`), so app startup does not pay for every
   procedure.
4. Heavy procedures run in a dedicated Web Worker
   (`src/analyses/worker/heavyRunners.ts`) with progress state and
   cancellation; the others run synchronously.
5. The result is an `AnalysisRunResult`: either `ok: true` with title, tables,
   report, charts and warnings, or `ok: false` with a readable reason.

## Live and manual

Fast procedures can recompute while parameters change; the gate `liveGate.ts`
decides when that is safe. Heavy procedures and large datasets stay manual:
the Run button is the only trigger.

## The card

The run-report card shows the header, any data-quality warnings, tables, prose
and charts in the order chosen by the procedure. A rejected run shows only the
reason: never an empty or partial card.

**Does not cover.** The meaning of individual parameters and roles: see
[03 — Roles, parameters and forms](03-roles-parameters-and-forms.md). The shape
of the result: [04 — Engine and tables](04-engine-and-tables.md).

**Sources in the code.** `src/analyses/registry.ts`, `src/analyses/runners.ts`,
`src/analyses/worker/`, `src/ui/analysis/` (`AnalysisLibrary.tsx`,
`AnalysisForm.tsx`, `RunControl.tsx`), `src/hooks/useAnalysisRun.ts`,
`src/ui/analysis/liveGate.ts`, `src/ui/analysis/favorites.ts`.

**See also.** [`docs/FORMS-AUDIT.md`](../../FORMS-AUDIT.md),
[`docs/PROCEDURES-CHARTS-AUDIT.md`](../../PROCEDURES-CHARTS-AUDIT.md).
