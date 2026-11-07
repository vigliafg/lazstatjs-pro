# 10 — Comparison with classical statistics

**Covers.** How the app positions itself against JMP, SPSS and R, and how the
comparison is documented without promising parity it does not have.

## The method

A comparison is not made from memory: take the same dataset, run the same
procedure in both programs and compare tables item by item and charts kind by
kind. Results are documented in `docs/analysis/`:

- `2026-11-05-confronto-tabelle-jmp-tutte-le-procedure.md` — table inventory for
  all procedures;
- `2026-11-05-confronto-tabelle-jmp-regressione.md` — linear model detail;
- `2026-11-02-confronto-grafici-jmp.md` — charts side by side;
- `2026-10-30-confronto-grafici-programmi.md` — comparison extended to other
  programs.

## What matches

Core statistics (means, intervals, tests, ANOVA, regression, survival) follow
classical conventions: same quantities, same degrees of freedom, same interval
formulas. Procedure names are the ones expected by people coming from JMP or
SPSS, and the in-app guide explains when to use them and when not to.

## What differs

- Prose is written to be read, not to replicate the wording of a reference
  program.
- Some defaults differ (confidence level, missing-value handling, default
  nonlinear model): they are declared choices, not surprises.
- Some procedures have a narrower or wider scope than the classical program,
  and the comparison document says so explicitly.

## The rule

A comparison is published only when it has been measured. If a procedure has
not been compared yet, say so; do not imply verified parity. This document also
feeds the release notes: what changed in the comparison is what the user needs
to know.

**Does not cover.** Details of individual procedures: the in-app guide
([09](09-languages-help-and-terminology.md)) and the documents in
`docs/analysis/`.

**Sources in the code and documents.** `docs/analysis/`, `samples/`, the
in-app guide `src/help/content/`.

**See also.** [`docs/ADVANCED-ROADMAP.md`](../../ADVANCED-ROADMAP.md).
