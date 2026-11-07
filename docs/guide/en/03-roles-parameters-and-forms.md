# 03 — Roles, parameters and forms

**Covers.** The agreement that lets 72 different procedures ask for columns and
parameters in the same way, and be saved and reopened without surprises.

## Contents

- [Column roles](#column-roles)
- [Parameters](#parameters)
- [The form](#the-form)
- [The rule](#the-rule)
- [Strengths](#strengths)

## Column roles

Every procedure declares what it needs. A role is a slot with a clear name and a
precise job: a numeric variable to analyse, a grouping variable, or a variable
that works in both cases because the procedure decides according to its type.

The shared rules are few and hold for every procedure: list the roles, read the
current state, assign a column, reject incompatible pairings. A role left empty
stays empty: there is no placeholder value to interpret, and the form shows it
as
a slot to fill.

Some procedures have roles that depend on the others: in a factor model, for
instance, each indicator belongs to a factor and the grouping must stay
consistent with the selection. That consistency is handled by the role
assignment, not by the form: the user does not have to remember it.

## Parameters

Every parameter of every procedure is described in one place and starts from
sensible defaults. Before being used, parameters go through a single
normalisation step that applies the types, prevents indices from falling outside
the dataset, fills the missing fields and recomputes the derived ones.

This holds for every origin: parameters chosen on screen, read from a project
file, or proposed by a manifest. Nothing reaches the computation without that
check.

When the grid changes structure, references are pointed back at the right
columns; roles that are no longer valid become empty and the app says so,
instead
of reusing a column number that now means something else.

## The form

Every procedure has its own form, built with the same controls as the others.
The form computes nothing: it reads and writes parameters, checks the types and
shows translated labels. Presets save a combination of parameters under a name,
so a recurring analysis reopens in one click instead of being rebuilt each time.

## The rule

Adding a procedure means adding an entry to the catalogue, its roles, its
parameters and its form. The logic for selection, remapping and saving is not
rewritten: it is shared and stays in one place.

## Strengths

- **72 procedures, one way to use them.** The same slot, the same wording, the
  same parameter handling: the skill learned on one analysis carries over to all
  of them.
- **The idea is to separate the agreement from the computation.** Roles and
  parameters describe what is needed, the form collects it, the engine computes:
  each part can change without forcing the others to follow.
- **The entry threshold stays low.** Slots say what to put in, checks prevent
  wrong pairings, presets remove repetitive work; experts still find every
single
  parameter.

**Does not cover.** The computation and the tables:
[04](04-engine-and-tables.md).
Runtime rejections: [08](08-validation-and-guardrails.md).

**Sources in the code.** `src/analyses/roles.ts`, `rolesW5.ts`, `rolesW7.ts`,
`src/analyses/params.ts`, `src/io/project/types.ts`,
`src/io/project/parse.ts`, `src/ui/analysis/`.

**See also.** [`docs/FORMS-AUDIT.md`](../../FORMS-AUDIT.md).
