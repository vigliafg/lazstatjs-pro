# 03 — Roles, parameters and forms

**Covers.** The contract that lets 72 different procedures share the same model
for column selection and parameter storage.

## Column roles

Every procedure declares the roles it needs (`src/analyses/roles.ts` plus
`rolesW5.ts` and `rolesW7.ts` for the newer waves). A role has a stable key, a
localised label and a kind:

- `continuous`: a numeric variable that enters a computation;
- `group`: a categorical variable that defines groups or classes;
- `any`: accepts both, because the procedure decides based on the type.

The shared functions are few and are the single source of truth:
`analysisRoles(id)` lists roles, `roleStates(id, params)` returns the current
state, `assignRole(id, params, key, column)` assigns a column and
`validateRoleTypes` rejects incompatible pairings. An optional parameter is
`-1` when unassigned.

Some procedures have derived roles: in SEM, for example, every indicator
belongs to a factor and the grouping must stay consistent with the selection.
That derivation belongs to the role setter, not to the form.

## Parameters

Parameters for all procedures live in `src/io/project/types.ts`, with initial
values in `DEFAULT_PARAMS`. `parseParams(value, width)` is the only place that
normalises a raw object (from a project file or a manifest): it applies types,
clamps indexes to the dataset width, fills missing fields and recomputes derived
ones. A parameter coming from outside never reaches the engine without passing
through it.

`remapParams` (`src/analyses/params.ts`) rewrites references after a structural
grid operation: stable column ids keep an analysis from pointing at another
variable, and roles that are no longer valid become `-1` with a warning.

## Forms

Each procedure has its own `Form.tsx` in its folder, composed from the shared
controls in `AnalysisOptions.tsx`. The form computes nothing: it reads and
writes parameters, validates types and shows translated labels. Presets save a
named parameter combination, so a recurring analysis reopens in one click.

## The rule

When a new procedure has to behave like the others, add a registry entry, its
roles, its parameter type and its form. Do not duplicate selection, remapping
or persistence logic.

**Does not cover.** Computation and tables: [04](04-engine-and-tables.md).
Runtime rejections: [08](08-validation-and-guardrails.md).

**Sources in the code.** `src/analyses/roles.ts`, `rolesW5.ts`, `rolesW7.ts`,
`src/analyses/params.ts`, `src/io/project/types.ts`,
`src/io/project/parse.ts`, `src/ui/analysis/`.

**See also.** [`docs/FORMS-AUDIT.md`](../../FORMS-AUDIT.md).
