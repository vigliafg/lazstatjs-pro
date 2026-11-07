# 10 — Comparison with classical statistics

**Covers.** Where the app stands compared with JMP, SPSS and R, and how the
comparison is documented without promising a parity that has not been verified.

## Contents

- [The method](#the-method)
- [What matches](#what-matches)
- [What differs](#what-differs)
- [The rule](#the-rule)
- [Strengths](#strengths)

## The method

The comparison is not done from memory. The same dataset is taken, the same
procedure is run in both programs, and the tables are compared entry by entry
and
the charts kind by kind. The results stay in `docs/analysis/`, with an inventory
of the tables for every procedure, a detail on the linear model, a chart
comparison and a document that widens the comparison to the other programs.

## What matches

The basic analyses — means and intervals, tests, analysis of variance,
regression, survival — follow the classical conventions: the same quantities,
the
same reference results, the same procedure names for people coming from JMP or
SPSS. Differences, where they exist, are documented and not hidden.

The order of things is designed for people arriving from another program: they
search for the procedure under the name they know, find the same entries in the
tables, and the in-app guide explains when to use them and when not to.

## What differs

- The prose is written to be read, not to imitate the sentences of the reference
  program.
- Some starting settings are different — confidence level, handling of missing
  values, default non-linear model — and they are declared choices, explained
  where they matter.
- Some procedures have a narrower or wider scope than the classical program, and
  the comparison document says so explicitly.

## The rule

A comparison is published only if it has been measured. If a procedure has not
been compared yet, that is written down; no verified parity is implied. The same
criterion applies to release notes: what changed in the comparison is what the
user needs to know.

## Strengths

- **Trust is built on evidence.** Every claim of similarity with the classical
  programs sits on a comparison that was run and a document that reports it.
- **The idea is to measure, not to declare.** The comparison is repeatable work:
  same dataset, same procedure, same list of entries to verify.
- **It reassures people arriving from other programs without asking them to
  believe.** People who know JMP or SPSS find the expected names and results and
  can read where the app behaves differently; people with less experience read
  the prose and the guide, without needing to know the reference program.

**Does not cover.** The details of individual procedures: the in-app guide
([09](09-languages-help-and-terminology.md)) and the documents in
`docs/analysis/`.

**Sources in the code and documents.** `docs/analysis/`, `samples/`, the in-app
guide `src/help/content/`.

**See also.** [`docs/ADVANCED-ROADMAP.md`](../../ADVANCED-ROADMAP.md).
