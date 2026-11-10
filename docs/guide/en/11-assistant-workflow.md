# Assistant in the workflow

**Covers.** How to use the **Assistant** to move from a question to a complete
run-report without skipping the checks: guided path, required and optional
variables, applying the procedure, a chain of steps, the diagram and the report
card. It does not describe the statistical kernels: those stay in documents 04
and 05.

## Two entry points

The Assistant is the same view in two contexts:

- **full view**: the Assistant entry in the navigation, with the question tree,
  the diagram and the working area;
- **side panel**: available on the Data and Analysis tabs, compact and
  resizable. The panel can open the diagram in a full-window overlay.

The path and the answers are shared: switching context does not reset the
questions already answered.

## From the question to the run-report

1. **Choose the domain.** Data (import, cleaning, quality) or analysis
   (comparison, relationship, prediction). The tree only shows relevant
   questions.
2. **Answer.** Every answer adds a step to the path and narrows the candidate
   procedures; “I don’t know” remains available when the choice is not obvious.
3. **Read readiness and recommendation.** The Assistant lists the required and
   optional variables of the selected leaf and flags the missing ones.
4. **Apply.** The procedure opens with roles and variables already assigned;
   check the setup before running.
5. **Run.** The run produces a run-report with the Assistant report card at the
   top: assumptions, reading of the result and warnings.
6. **Repeat or chain.** A new question can start from the same path or become a
   step in the chain.

Actions that need a ready leaf — Apply, adding to the chain and running — stay
disabled until the required variables are assigned.

## Chain, diagram and readiness

The **chain** is for analyses that need more than one step, for example
preparing the data and then fitting a model. Leaves can be added, reordered,
removed and run in sequence; the preflight checks every leaf before starting.
If a step is not ready, the chain does not start and points to the leaf that
needs completing.

The **diagram** shows the actual path, not a theoretical tree: discarded
questions stay out and chain leaves appear in order. It is the quickest way to
check “where am I” before applying or running.

## What reaches the run-report

The Assistant report card is part of the run-report, so it stays in the card,
in the HTML/Word exports and in the session-report. It contains the path taken,
the selected leaf, the readiness at run time and the reading notes. Tables and
charts remain those of the procedure: the Assistant recomputes nothing and does
not replace the statistical report.

## Strengths

- **One starting point.** Data and analysis share the same tree and language
  instead of two separate guides.
- **Feasibility is visible before the run.** Missing roles and unready leaves
  appear immediately, not after an error.
- **The path is documented.** The report card explains why that procedure was
  chosen and with which variables.
- **Multi-step work stays ordered.** The chain keeps the order and stops the
  run when a prerequisite is missing.

## Does not cover

- It does not check data quality, duplicates or missing values: those remain
  the responsibility of the Data Editor and validation checks.
- It does not choose for you between two equivalent procedures: the
  recommendation is a documented starting point, not a verdict.
- It does not change kernels or advanced parameters: after Apply, the procedure
  form remains the source of truth.

## Sources in the code

- `src/ui/assistant/AssistantWorkspace.tsx` — full view and diagram.
- `src/ui/assistant/AssistantPanel.tsx` — side panel and overlay.
- `src/ui/assistant/chain.ts`, `src/hooks/useAssistantChain.ts` — chain,
  preflight and sequential execution.
- `src/ui/assistant/AssistantReportCard.tsx` — card inside the run-report.
- `src/help/content/<locale>/procedures-more.ts` — Assistant page of the help
  book, in all six languages.

## See also

- [Library and analysis selection](02-library-and-analysis-selection.md)
- [Roles, parameters and forms](03-roles-parameters-and-forms.md)
- [Reports and session report](05-reports-and-session-report.md)
- [Validation and guardrails](08-validation-and-guardrails.md)
