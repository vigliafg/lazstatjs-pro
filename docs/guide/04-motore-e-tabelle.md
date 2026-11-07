# 04 — Motore e tabelle

**Cosa copre.** Come un risultato statistico diventa una tabella e perché il
calcolo non conosce né React né la prosa.

## Tre strati, una direzione

- `src/stats/kernels/`: numeri puri. Nessuna etichetta, nessun formato,
  nessun import da tabelle o report.
- `src/stats/tables/`: trasformano i numeri in `TableSpec`, cioè intestazioni,
  righe e note già leggibili.
- `src/stats/reports/`: leggono solo le tabelle e producono la prosa.

Le regole di dipendenza in `.dependency-cruiser.cjs` impediscono le frecce
all'indietro: un kernel non può formattare, una tabella non può scrivere
frasi. Il risultato è che un cambio di layout non tocca la matematica e un
cambio di formula non tocca il testo.

## La tabella

`TableSpec` (`src/stats/types.ts`) ha `id`, `title`, `subtitle?`, `columns`,
`rows` e `notes?`. L'`id` è stabile e unico nella card: serve all'export, ai
test e ai collegamenti della prosa. Le colonne dichiarano chiave, etichetta,
allineamento e formato (`dec3`, `p`, percentuale…); le note spiegano il
metodo, non ripetono i numeri.

Regola non negoziabile: **una tabella esiste solo se ha righe**. Se una stima
non è calcolabile, il runner rifiuta con un motivo invece di emettere una
tabella vuota (è esattamente il difetto corretto in `survey`).

## Determinismo

Le procedure con componenti casuali (bootstrap, permutazioni, imputazioni)
usano un generatore con seme fisso e lo dichiarano nel report. Lo stesso
dataset con gli stessi parametri produce gli stessi numeri, anche nel worker.

## Guardrail dimensionali

Prima di calcolare, i runner verificano di avere abbastanza righe complete,
abbastanza gruppi e una matrice non degenere; il controllo condiviso
`guardDimensions` limita i casi iterativi. Quando il controllo fallisce il
risultato è `{ ok: false, reason }`, con una frase che dice cosa manca e cosa
provare.

## Il risultato

`AnalysisRunResult` (`src/analyses/types.ts`) è l'unico contratto: `ok: true`
con `tables`, `report`, `charts?`, `panels?`, `warnings?`, `header?`,
`callout?`; oppure `ok: false` con `reason`. È serializzabile, quindi
attraversa il Web Worker senza adattatori.

**Cosa non copre.** La prosa: [05](05-report-e-session-report.md). I grafici:
[06](06-grafici-delle-procedure.md).

**Fonti nel codice.** `src/stats/kernels/`, `src/stats/tables/`,
`src/stats/reports/`, `src/stats/types.ts`, `src/analyses/types.ts`,
`src/stats/analysisResults.ts`.

**Vedi anche.**
[`docs/analysis/2026-11-05-inventario-procedure-tabelle.md`](../analysis/2026-11-05-inventario-procedure-tabelle.md),
[`ARCHITECTURE.md`](../../ARCHITECTURE.md).
