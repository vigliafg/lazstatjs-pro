# 04 — Motore e tabelle

**Cosa copre.** Come un risultato diventa una tabella leggibile e perché il
calcolo, la presentazione e il testo restano separati.

## Indice

- [Tre passaggi, una sola direzione](#tre-passaggi-una-sola-direzione)
- [La tabella](#la-tabella)
- [Risultati ripetibili](#risultati-ripetibili)
- [Controlli prima del calcolo](#controlli-prima-del-calcolo)
- [Il risultato](#il-risultato)
- [Punti di forza](#punti-di-forza)

## Tre passaggi, una sola direzione

Il percorso di un risultato è sempre lo stesso:

1. il **calcolo** produce numeri, senza etichette e senza formato;
2. le **tabelle** trasformano quei numeri in intestazioni, righe e note già
   leggibili;
3. la **prosa** legge soltanto le tabelle e scrive le frasi che le accompagnano.

La direzione non si inverte: il calcolo non può formattare, le tabelle non
possono scrivere frasi. È una regola tecnica, ma l'effetto è pratico: cambiare
l'aspetto di una tabella non tocca i numeri, e correggere un calcolo non
costringe a riscrivere i testi.

## La tabella

Una tabella ha un titolo, a volte un sottotitolo, un elenco di colonne e di
righe, e delle note. Ogni colonna dichiara la propria etichetta, l'allineamento
e il modo in cui i valori vanno mostrati; le note spiegano il metodo e non
ripetono i numeri che si vedono sopra.

Ogni tabella ha anche un'identità stabile all'interno della card: serve
all'export, ai test e ai rimandi della prosa, così una frase può citare "la
tabella dei coefficienti" e restare corretta anche se l'ordine delle tabelle
cambia.

La regola non negoziabile è una: **una tabella esiste solo se ha righe**. Se una
stima non è calcolabile, l'analisi rifiuta e spiega il motivo invece di mostrare
una tabella vuota.

## Risultati ripetibili

Le procedure che hanno una parte casuale — simulazioni, campionamenti ripetuti,
stime per ricampionamento — usano una sequenza sempre uguale e lo dichiarano nel
report. Lo stesso dataset con gli stessi parametri produce gli stessi numeri,
anche quando il calcolo avviene nel processo separato: due persone che rifanno
la stessa analisi ottengono lo stesso risultato e possono confrontarlo.

## Controlli prima del calcolo

Prima di calcolare, ogni procedura verifica di avere ciò che le serve:
abbastanza righe complete, abbastanza gruppi, una situazione non degenere,
classi non separate, indicatori sufficienti per ogni fattore. I controlli comuni
coprono i casi che richiedono più passaggi.

Quando un requisito manca, il risultato non è un numero sbagliato né una tabella
muta: è un rifiuto con una frase che dice cosa manca e cosa provare a fare.

## Il risultato

Il risultato di un run è un oggetto unico, sempre della stessa forma: o un esito
positivo con tabelle, prosa, eventuali grafici, pannelli, avvisi e intestazione,
oppure un rifiuto con il suo motivo. Poiché è descrivibile come dati, attraversa
il processo di calcolo senza adattamenti: quello che si vede a schermo è quello
che è stato calcolato.

## Punti di forza

- **Numeri e parole non possono divergere.** La prosa nasce dalle tabelle, non
  da un secondo calcolo: se un valore cambia, cambia anche la frase che lo
  commenta.
- **L'idea è la separazione dei compiti.** Calcolo, presentazione e testo hanno
  confini netti, quindi un errore si localizza in fretta e una modifica non
  propaga effetti inattesi.
- **Un risultato che non illude nessuno.** Niente tabelle vuote e niente numeri
  senza spiegazione: chi ha poca esperienza legge una frase chiara, chi ne ha
  molta ritrova le stesse quantità di sempre nelle tabelle.

**Cosa non copre.** La prosa: [05](05-report-e-session-report.md). I grafici:
[06](06-grafici-delle-procedure.md).

**Fonti nel codice.** `src/stats/kernels/`, `src/stats/tables/`,
`src/stats/reports/`, `src/stats/types.ts`, `src/analyses/types.ts`,
`src/stats/analysisResults.ts`.

**Vedi anche.**
[`docs/analysis/2026-11-05-inventario-procedure-tabelle.md`](../analysis/2026-11-05-inventario-procedure-tabelle.md),
[`ARCHITECTURE.md`](../../ARCHITECTURE.md).
