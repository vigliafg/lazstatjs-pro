# 08 — Validazione e guardrail

**Cosa copre.** I tre livelli di controllo che impediscono a un'analisi di
produrre un risultato sbagliato o una card vuota.

## Indice

- [Livello 1 — riferimenti di colonna](#livello-1-riferimenti-di-colonna)
- [Livello 2 — valori dei parametri](#livello-2-valori-dei-parametri)
- [Livello 3 — controlli della procedura](#livello-3-controlli-della-procedura)
- [La regola dell'output](#la-regola-delloutput)
- [La rete di test](#la-rete-di-test)
- [Punti di forza](#punti-di-forza)

## Livello 1 — riferimenti di colonna

Prima del run si verifica che ogni ruolo punti a una colonna esistente e di tipo
compatibile. Se l'utente ha eliminato o cambiato tipo a una colonna, l'analisi
si ferma e invita a riselezionare la variabile, invece di calcolare su un'altra
colonna. È il motivo per cui le colonne hanno un'identità stabile: senza quella,
"la terza colonna" sarebbe un riferimento che cambia significato da sola.

## Livello 2 — valori dei parametri

Prima di entrare nei calcoli, i parametri vengono riportati alla forma corretta:
si applicano i tipi, si impedisce che un indice esca dal dataset, si riempiono i
campi mancanti e si ricalcolano quelli derivati. Vale per i parametri scelti a
schermo, per quelli letti da un file di progetto e per quelli proposti da un
manifest.

Lo stesso controllo si ripete dopo un'operazione sulla griglia, così i
riferimenti seguono le colonne e i ruoli non più validi diventano vuoti con un
avviso.

## Livello 3 — controlli della procedura

Ogni procedura conosce i propri requisiti: quante righe complete servono come
minimo, quanti gruppi devono esserci, quando la situazione è degenere, quando le
classi sono troppo separate, quanti indicatori servono per ogni fattore. I
controlli comuni coprono i casi che richiedono più passaggi.

Quando un requisito manca, il risultato è un rifiuto con una frase che dice cosa
manca e cosa provare a fare: nessun numero calcolato su dati insufficienti.

## La regola dell'output

- Nessuna tabella vuota: se non ci sono righe, la tabella non si mostra e il run
  rifiuta se quel contenuto era obbligatorio.
- Nessuna frase con spazi lasciati aperti: la prosa esce completa o non esce.
- Nessun grafico che non si riesca a costruire.

## La rete di test

- I 153 esempi dei dataset di esempio passano dai veri motori di calcolo e
  verificano tabelle, grafici e prosa.
- Un controllo dedicato verifica l'elenco dei dataset, i formati e la loro
  coerenza.
- I test di interfaccia coprono i flussi visivi: analisi, editor, annotazioni,
  preset.
- I controlli di progetto verificano dipendenze, cicli, dimensione dei file,
  link della documentazione, e la guida in-app viene controllata su
  contaminazione linguistica e parità tra le traduzioni.

## Punti di forza

- **Meglio un rifiuto chiaro che un numero sbagliato.** Ogni livello ferma il
  calcolo prima che produca un risultato fuorviante, e spiega come procedere.
- **L'idea è controllare ai bordi.** I controlli stanno dove i dati entrano nel
  motore, non sparsi dentro le procedure: si scrivono una volta e valgono per
  tutte.
- **La protezione non richiede competenza.** Chi conosce poco la statistica non
  deve sapere quali requisiti ha una procedura: se qualcosa non torna, l'app lo
  dice in parole semplici; chi è esperto trova comunque il motivo tecnico.

**Cosa non copre.** La correttezza dei singoli calcoli: quella è verificata dai
test dei motori, non da questo livello.

**Fonti nel codice.** `src/hooks/useAnalysisRun.ts`, `src/io/project/parse.ts`,
`src/analyses/params.ts`, i runner in `src/analyses/*/run.tsx`,
`src/analyses/chain.test.ts`.

**Vedi anche.** [`docs/audit-funzionalita.md`](../audit-funzionalita.md),
[`docs/qa/`](../qa/).
