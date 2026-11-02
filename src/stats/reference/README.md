# Reference tests

Reference tests compare a kernel with an **independent** implementation (R,
NumPy, or a closed form). They are different from the colocated unit tests:
unit tests describe the contract, reference tests pin the numbers.

## Layout

```
src/stats/reference/
├── harness.ts              # assertClose / assertCloseVector / loadFixture / TOLERANCES
├── *.reference.test.ts     # the tests, one file per procedure or family
├── fixtures/*.json         # committed expected values
└── r/*.R                   # generators for the fixtures
```

`npm test` picks up `*.reference.test.ts` like any other test. The fixtures are
committed, so **R is not required to run the suite**.

## Workflow

1. Write or extend the generator in `r/`, using a fixed dataset and a fixed
   seed when the reference is stochastic.
2. Run it from the repository root:

   ```bash
   Rscript src/stats/reference/r/glm.R
   ```

3. Review the fixture diff and commit both the script and the JSON.
4. Write the test with `loadFixture` and explicit tolerances from
   `TOLERANCES` (or a documented custom tolerance).
5. Run the test:

   ```bash
   node --import tsx --test src/stats/reference/glm.reference.test.ts
   ```

## Tolerances

Never hide a difference behind a loose tolerance. Start from the narrowest
value that survives floating-point evaluation order:

| Preset | Value | Use for |
|---|---:|---|
| `exact` | `1e-12` | algebraic identities |
| `r` | `1e-8` | same formula, different evaluation order |
| `rProbability` | `1e-6` | R probability functions vs jStat CDFs |
| `rsm` | `1e-6` | response-surface fits |
| `monteCarlo` | `5e-3` | simulation against an exact enumeration |

If a reference cannot be met, first check whether the kernel is wrong (the
retrofit tests already found two real bugs: Ward.D2 heights and one-sided
DOE coefficient p-values). Only then widen the tolerance, and record why in
the test file and in `docs/plans/2026-11-02-gap-procedure-stato.md`.

## Current fixtures

| Fixture | Generator | Kernel |
|---|---|---|
| `glm.json` | `r/glm.R` | `kernels/glm.ts` |
