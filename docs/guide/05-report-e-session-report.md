# 05 — Report, run-report e session-report

**Cosa copre.** La prosa che accompagna i numeri, la sua traduzione e la
differenza tra il risultato di un run e la sessione.

## Indice

- [Due parole, due cose](#due-parole-due-cose)
- [Come è fatta la prosa](#come-è-fatta-la-prosa)
- [Lingua del report e lingua dell'interfaccia](#lingua-del-report-e-lingua-dellinterfaccia)
- [La sessione](#la-sessione)
- [Export](#export)

## Due parole, due cose

- **run-report**: l'output di una singola procedura — tabelle, prosa e grafici
  di quel run.
- **session-report**: l'insieme ordinato dei run-report presenti nella finestra
  Output.

La distinzione è vincolante (`AGENTS.md`): "esporta il session-report" e
"esporta il run-report" sono due azioni diverse.

## Come è fatta la prosa

Il report non è testo libero: è un `ReportSpec` composto da frasi con un id
stabile e, dove servono, segnaposto (`{s1}`, `{s2}`) riempiti con i valori
delle tabelle. Le frasi vivono in cataloghi per locale
(`src/stats/reportCopy/`) e il test `reportCopy.test.ts` impone che ogni
lingua abbia le stesse frasi con gli stessi segnaposto: una traduzione non può
dimenticare un numero o inventarne uno.

Il report legge solo le tabelle, mai i kernel: se un numero cambia, cambia nel
punto in cui è calcolato e la frase lo segue.

## Lingua del report e lingua dell'interfaccia

Sono indipendenti. L'interfaccia parte da `en` (o dalla lingua scelta), il
report ha una propria locale predefinita (`it`) e si può cambiare per singolo
run. Le sei locale attive sono `en`, `it`, `fr`, `es`, `de`, `pt-PT`.

## La sessione

Ogni run aggiunge un blocco alla finestra Output; il contorno della sessione
(`sessionOutline.ts`) tiene l'ordine, i titoli e i riferimenti. I blocchi si
possono eliminare singolarmente o svuotare insieme, e l'export conserva
l'ordine del session-report.

## Export

- Report testuale/HTML/PDF tramite `reportExport.ts`.
- Tabelle in CSV.
- Grafici come immagine o SVG (`chartExport.ts`).
- Progetto completo `.lzs` per riaprire dati, parametri e output.

**Cosa non copre.** Le tabelle ([04](04-motore-e-tabelle.md)) e la costruzione
dei grafici ([06](06-grafici-delle-procedure.md)).

**Fonti nel codice.** `src/stats/reports/`, `src/stats/reportCopy/`,
`src/stats/report.ts`, `src/io/outputs.ts`, `src/io/reportExport.ts`,
`src/ui/analysis/sessionOutline.ts`.

**Vedi anche.**
[`docs/RUN-REPORT-SESSION-REPORT.md`](../RUN-REPORT-SESSION-REPORT.md),
[`docs/plans/2026-10-29-session-report-outline.md`](../plans/2026-10-29-session-report-outline.md).
