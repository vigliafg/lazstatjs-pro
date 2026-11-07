# 02 — Libreria e scelta dell'analisi

**Cosa copre.** Come l'utente trova una procedura e cosa succede dal clic su
"Esegui" fino alla card del risultato.

## Indice

- [Il catalogo](#il-catalogo)
- [Dal clic al risultato](#dal-clic-al-risultato)
- [Live e manuale](#live-e-manuale)
- [La card](#la-card)

## Il catalogo

Le procedure sono dichiarate in un unico registro, `src/analyses/registry.ts`:
72 voci, ognuna con id stabile, etichetta e famiglia di appartenenza. Il id è
il contratto usato ovunque — parametri, report, grafici, guida in-app — quindi
non cambia quando cambia l'etichetta.

La libreria si apre a schede e offre ricerca per nome e descrizione,
preferiti salvati e l'elenco delle procedure recenti. Ogni voce mostra cosa
serve (dati o solo parametri) e porta al form già compilato con i valori
predefiniti della procedura.

## Dal clic al risultato

1. L'utente sceglie la procedura: il form legge i ruoli richiesti e i parametri
   correnti (`src/ui/analysis/AnalysisForm.tsx`, `AnalysisOptions.tsx`).
2. Il run valida i riferimenti di colonna: se un ruolo punta a una colonna
   sparita o di tipo incompatibile, si ferma e chiede di riselezionare.
3. Il runner viene caricato on demand (`ANALYSIS_RUNNERS` in
   `src/analyses/runners.ts`), così l'avvio dell'app non paga tutte le
   procedure.
4. Le procedure pesanti girano in un Web Worker dedicato
   (`src/analyses/worker/heavyRunners.ts`), con stato di avanzamento e
   possibilità di annullare; le altre girano in modo sincrono.
5. Il risultato è un `AnalysisRunResult`: o `ok: true` con titolo, tabelle,
   report, grafici e avvisi, oppure `ok: false` con un motivo leggibile.

## Live e manuale

Le procedure veloci possono ricalcolare mentre si cambiano i parametri; il
gate `liveGate.ts` decide quando è sicuro farlo. Le procedure pesanti e i run
su dataset grandi restano manuali: il pulsante Esegui è l'unico punto di
innesco.

## La card

La card del run-report mostra intestazione, eventuali avvisi di qualità dei
dati, tabelle, prosa e grafici nell'ordine deciso dalla procedura. Un run
rifiutato mostra solo il motivo: mai una card vuota o parziale.

**Cosa non copre.** Il significato dei singoli parametri e dei ruoli: vedi
[03 — Ruoli, parametri e Form](03-ruoli-parametri-e-form.md). La struttura
del risultato: [04 — Motore e tabelle](04-motore-e-tabelle.md).

**Fonti nel codice.** `src/analyses/registry.ts`, `src/analyses/runners.ts`,
`src/analyses/worker/`, `src/ui/analysis/` (`AnalysisLibrary.tsx`,
`AnalysisForm.tsx`, `RunControl.tsx`), `src/hooks/useAnalysisRun.ts`,
`src/ui/analysis/liveGate.ts`, `src/ui/analysis/favorites.ts`.

**Vedi anche.** [`docs/FORMS-AUDIT.md`](../FORMS-AUDIT.md),
[`docs/PROCEDURES-CHARTS-AUDIT.md`](../PROCEDURES-CHARTS-AUDIT.md).
