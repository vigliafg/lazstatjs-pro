# 08 — Validazione e guardrail

**Cosa copre.** I tre livelli che impediscono a un'analisi di produrre un
risultato sbagliato o una card vuota.

## Indice

- [Livello 1 — riferimenti di colonna](#livello-1-riferimenti-di-colonna)
- [Livello 2 — normalizzazione dei parametri](#livello-2-normalizzazione-dei-parametri)
- [Livello 3 — guardrail del runner](#livello-3-guardrail-del-runner)
- [La regola dell'output](#la-regola-delloutput)
- [La rete di test](#la-rete-di-test)

## Livello 1 — riferimenti di colonna

Prima del run si verifica che ogni ruolo punti a una colonna esistente e di
tipo compatibile. Se l'utente ha eliminato o ritipizzato una colonna, il run
si ferma con un invito a riselezionare la variabile, invece di calcolare su
un'altra colonna. È il motivo per cui gli id delle colonne sono stabili.

## Livello 2 — normalizzazione dei parametri

`parseParams` applica i tipi, limita gli indici alla larghezza del dataset e
ricalcola i campi derivati. Un parametro che arriva da un file di progetto o
da un manifest non entra mai nel motore senza questo passaggio. `remapParams`
fa lo stesso dopo un'operazione strutturale sulla griglia.

## Livello 3 — guardrail del runner

Il runner conosce i requisiti della propria procedura: righe complete minime,
numero di gruppi, matrice non degenere, classi non separate, indicatori
sufficienti per fattore. Il controllo condiviso `guardDimensions` copre i casi
iterativi. Quando un requisito manca, il risultato è `{ ok: false, reason }`
con una frase che dice cosa manca e cosa provare.

## La regola dell'output

- Nessuna tabella vuota: se non ci sono righe, la tabella non si emette e il
  run rifiuta se quel contenuto era obbligatorio.
- Nessun report con segnaposto irrisolti.
- Nessun grafico che non compili.

## La rete di test

- `src/analyses/chain.test.ts` esegue i 153 esempi dei sample attraverso i
  runner reali e verifica tabelle, grafici compilati e prosa.
- `src/io/samples.test.ts` controlla manifest, formati e coerenza dei sample.
- Gli spec Playwright in `e2e/` coprono i flussi visivi (analisi, editor,
  annotazioni, preset).
- `npm run help:audit` controlla contaminazione e parità della guida;
  `npm run guard` controlla dipendenze, cicli e dimensione dei file.

**Cosa non copre.** La correttezza numerica delle singole formule: quella è
coperta dai test dei kernel, non da questo livello.

**Fonti nel codice.** `src/hooks/useAnalysisRun.ts`,
`src/io/project/parse.ts`, `src/analyses/params.ts`, i runner in
`src/analyses/*/run.tsx`, `src/analyses/chain.test.ts`.

**Vedi anche.** [`docs/audit-funzionalita.md`](../audit-funzionalita.md),
[`docs/qa/`](../qa/).
