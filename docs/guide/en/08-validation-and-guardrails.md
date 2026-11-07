# 08 — Validation and guardrails

**Covers.** The three levels of checks that stop an analysis from producing a
wrong result or an empty card.

## Contents

- [Level 1 — column references](#level-1-column-references)
- [Level 2 — parameter values](#level-2-parameter-values)
- [Level 3 — checks inside the procedure](#level-3-checks-inside-the-procedure)
- [The output rule](#the-output-rule)
- [The test net](#the-test-net)
- [Strengths](#strengths)

## Level 1 — column references

Before the run, every role is checked against a column that exists and has a
compatible type. If the user has deleted a column or changed its type, the
analysis stops and invites a new selection, instead of computing on another
column. This is why columns have a stable identity: without it, "the third
column" would be a reference that changes meaning on its own.

## Level 2 — parameter values

Before reaching the computations, parameters are brought back to the correct
shape: types are applied, an index is prevented from falling outside the
dataset, missing fields are filled and derived ones are recomputed. This holds
for parameters chosen on screen, read from a project file, or proposed by a
manifest.

The same check runs again after an operation on the grid, so references follow
the columns and roles that are no longer valid become empty with a warning.

## Level 3 — checks inside the procedure

Every procedure knows its own requirements: how many complete rows are needed at
minimum, how many groups must exist, when the situation is degenerate, when
classes are too separated, how many indicators each factor needs. Shared checks
cover the cases that require several steps.

When a requirement is missing, the outcome is a rejection with a sentence saying
what is missing and what to try: no number computed on insufficient data.

## The output rule

- No empty table: if there are no rows, the table is not shown and the run
  rejects when that content was mandatory.
- No sentence with open gaps: the prose comes out complete or not at all.
- No chart that cannot be built.

## The test net

- The 153 samples of the example datasets go through the real computation
  engines and check tables, charts and prose.
- A dedicated check verifies the dataset list, the formats and their
  consistency.
- Interface tests cover the visual flows: analyses, editor, annotations,
  presets.
- Project checks verify dependencies, cycles, file size and documentation links,
  and the in-app guide is checked for language contamination and translation
  parity.

## Strengths

- **A clear rejection is better than a wrong number.** Every level stops the
  computation before it can produce a misleading result, and explains how to
  proceed.
- **The idea is to check at the borders.** Checks sit where data enters the
  engine, not scattered inside the procedures: they are written once and hold
  for all of them.
- **Protection does not require expertise.** People who know little statistics
  do not need to know what a procedure requires: if something is off, the app
  says it in plain words; experts still find the technical reason.

**Does not cover.** The correctness of individual computations: that is verified
by the engine tests, not by this level.

**Sources in the code.** `src/hooks/useAnalysisRun.ts`,
`src/io/project/parse.ts`, `src/analyses/params.ts`, the runners in
`src/analyses/*/run.tsx`, `src/analyses/chain.test.ts`.

**See also.** [`docs/audit-funzionalita.md`](../../audit-funzionalita.md),
[`docs/qa/`](../../qa/).
