# 05 — Report, run-report e session-report

**Cosa copre.** La prosa che accompagna i numeri, la sua lingua e la differenza
tra il risultato di un singolo run e l'insieme dei risultati di una sessione.

## Indice

- [Due parole, due cose](#due-parole-due-cose)
- [Come è scritta la prosa](#come-è-scritta-la-prosa)
- [Lingua del report e lingua dell'interfaccia](#lingua-del-report-e-lingua-dellinterfaccia)
- [La sessione](#la-sessione)
- [Export](#export)
- [Punti di forza](#punti-di-forza)

## Due parole, due cose

- **run-report**: l'output di una singola procedura — tabelle, prosa e grafici
  di quel run.
- **session-report**: l'insieme ordinato dei run-report presenti nella finestra
  Output.

La distinzione è vincolante: "esporta il session-report" ed "esporta il
run-report" sono due azioni diverse, e il resto della documentazione usa i due
termini con questo significato.

## Come è scritta la prosa

Il report non è testo libero. È composto da frasi con un'identità stabile e,
dove serve, da spazi da riempire con i valori delle tabelle. Le frasi vivono in
cataloghi separati per lingua, e un controllo automatico impone che ogni lingua
abbia le stesse frasi con gli stessi spazi da riempire: una traduzione non può
dimenticare un numero né inventarne uno.

La prosa legge soltanto le tabelle, mai i calcoli. Se un valore cambia, cambia
nel punto in cui viene prodotto e la frase lo segue senza essere riscritta.

## Lingua del report e lingua dell'interfaccia

Sono due scelte indipendenti. L'interfaccia parte dalla lingua del sistema (o da
quella scelta dall'utente), mentre il report ha una propria lingua predefinita e
si può cambiare anche per il singolo run. Le lingue disponibili sono sei:
inglese, italiano, francese, spagnolo, tedesco e portoghese europeo.

Questa separazione serve a un caso concreto: un docente che lavora in inglese
può consegnare un report in italiano, oppure il contrario, senza cambiare tutta
l'applicazione.

## La sessione

Ogni run aggiunge un blocco alla finestra Output. Il contorno della sessione
tiene l'ordine, i titoli e i riferimenti, così l'elenco resta leggibile anche
dopo molte analisi. I blocchi si possono eliminare singolarmente o svuotare
tutti insieme, e l'export conserva l'ordine della sessione: il documento che si
consegna racconta la stessa storia che si è vista a schermo.

## Export

- Report testuale, HTML e PDF.
- Tabelle in CSV.
- Grafici come immagine o come SVG.
- Progetto completo, per riaprire dati, parametri e output insieme.

## Punti di forza

- **La prosa dice sempre la verità dei numeri.** Non è un commento scritto a
  parte: nasce dalle tabelle, quindi non può invecchiare rispetto al risultato.
- **L'idea è il testo come dato.** Ogni frase ha un'identità e ogni lingua ha il
  proprio catalogo, così traduzione e controllo qualità diventano verifiche
  automatiche invece di riletture a campione.
- **Leggibile a ogni livello.** Chi non conosce la statistica trova una
  spiegazione in parole semplici; chi la conosce ritrova le stesse quantità
  nelle tabelle, con la lingua che preferisce e senza doppio lavoro.

**Cosa non copre.** Le tabelle ([04](04-motore-e-tabelle.md)) e la costruzione
dei grafici ([06](06-grafici-delle-procedure.md)).

**Fonti nel codice.** `src/stats/reports/`, `src/stats/reportCopy/`,
`src/stats/report.ts`, `src/io/outputs.ts`, `src/io/reportExport.ts`,
`src/ui/analysis/sessionOutline.ts`.

**Vedi anche.**
[`docs/RUN-REPORT-SESSION-REPORT.md`](../RUN-REPORT-SESSION-REPORT.md),
[`docs/plans/2026-10-29-session-report-outline.md`](../plans/2026-10-29-session-report-outline.md)
