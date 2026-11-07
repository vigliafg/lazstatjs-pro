# 08 — Validation and guardrails

**Covers.** The three levels that stop an analysis from producing a wrong
result or an empty card.

## Level 1 — column references

Before the run, every role is checked against an existing column with a
compatible type. If the user deleted or retyped a column, the run stops and asks
to reselect the variable instead of computing on another column. That is why
column ids are stable.

## Level 2 — parameter normalisation

`parseParams` applies types, clamps indexes to the dataset width and recomputes
derived fields. A parameter coming from a project file or a manifest never
reaches the engine without this pass. `remapParams` does the same after a
structural grid operation.

## Level 3 — runner guardrails

Each runner knows its own requirements: minimum complete rows, number of
groups, non-degenerate matrix, classes that are not separated, enough
indicators per factor. The shared `guardDimensions` check covers iterative
cases. When a requirement is missing the result is `{ ok: false, reason }` with
a sentence saying what is missing and what to try.

## The output rule

- No empty tables: when there are no rows the table is not emitted, and the run
  rejects if that content was required.
- No report with unresolved placeholders.
- No chart that fails to compile.

## The test net

- `src/analyses/chain.test.ts` runs the 153 sample examples through the real
  runners and checks tables, compiled charts and prose.
- `src/io/samples.test.ts` checks manifest, formats and sample coherence.
- Playwright specs in `e2e/` cover visual flows (analysis, editor,
  annotations, presets).
- `npm run help:audit` checks guide contamination and parity; `npm run guard`
  checks dependencies, cycles and file size.

**Does not cover.** Numerical correctness of individual formulas: that is
covered by kernel tests, not by this level.

**Sources in the code.** `src/hooks/useAnalysisRun.ts`,
`src/io/project/parse.ts`, `src/analyses/params.ts`, runners in
`src/analyses/*/run.tsx`, `src/analyses/chain.test.ts`.

**See also.** [`docs/audit-funzionalita.md`](../../audit-funzionalita.md),
[`docs/qa/`](../../qa/).
