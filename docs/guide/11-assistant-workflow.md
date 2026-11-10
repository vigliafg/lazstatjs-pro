# Assistant nel workflow

**Cosa copre.** Come usare l’**Assistant** per passare da una domanda a un
run-report completo, senza saltare i controlli: percorso guidato, variabili
richieste e opzionali, applicazione della procedura, catena di passi, diagramma
e report card. Non descrive i kernel statistici: quelli restano nei documenti
04 e 05.

## Due punti d’ingresso

L’Assistant è la stessa vista in due contesti:

- **vista completa**: la voce Assistant nella navigazione, con albero delle
  domande, diagramma e area di lavoro;
- **pannello laterale**: disponibile nelle schede Dati e Analisi, compatto e
  ridimensionabile. Il pannello può aprire il diagramma a tutta finestra.

Il percorso e le risposte sono condivisi: cambiare contesto non azzera le
domande già fatte.

## Dalla domanda al run-report

1. **Scegli il dominio.** Dati (import, pulizia, qualità) o analisi (confronto,
   relazione, previsione). L’albero mostra solo le domande pertinenti.
2. **Rispondi.** Ogni risposta aggiunge un passo al percorso e restringe le
   procedure candidate; “non lo so” resta disponibile quando la scelta non è
   ovvia.
3. **Leggi prontezza e raccomandazione.** L’Assistant elenca le variabili
   richieste e opzionali della foglia scelta e segnala quelle mancanti.
4. **Applica.** La procedura si apre con ruoli e variabili già assegnati;
   controlla il setup prima di eseguire.
5. **Esegui.** Il run produce un run-report con la report card dell’Assistant
   in cima: assunzioni, lettura del risultato e avvertenze.
6. **Ripeti o concatena.** Una nuova domanda può partire dallo stesso percorso
   oppure diventare un passo della catena.

Le azioni che richiedono una foglia pronta — Applica, aggiunta alla catena ed
esecuzione — restano disabilitate finché le variabili obbligatorie non sono
assegnate.

## Catena, diagramma e prontezza

La **catena** serve quando un’analisi richiede più passi, per esempio preparare
i dati e poi stimare un modello. Le foglie si aggiungono, si riordinano, si
rimuovono e si eseguono in sequenza; il preflight controlla tutte le foglie
prima di partire. Se un passo non è pronto, la catena non parte e indica quale
foglia completare.

Il **diagramma** mostra il percorso effettivo, non un albero teorico: le
domande scartate restano fuori e le foglie della catena compaiono in ordine. È
il modo più rapido per controllare “dove sono” prima di applicare o eseguire.

## Cosa arriva nel run-report

La report card dell’Assistant è parte del run-report, quindi resta nella card,
negli export HTML/Word e nel session-report. Contiene il percorso seguito, la
foglia scelta, la prontezza al momento dell’esecuzione e le note di lettura.
Le tabelle e i grafici restano quelli della procedura: l’Assistant non
ricalcola nulla e non sostituisce il report statistico.

## Punti di forza

- **Un solo punto di partenza.** Dati e analisi usano lo stesso albero e lo
  stesso linguaggio, invece di due guide separate.
- **La fattibilità è visibile prima del run.** Ruoli mancanti e foglie non
  pronte si vedono subito, non dopo un errore.
- **Il percorso è documentato.** La report card spiega perché quella procedura
  è stata scelta e con quali variabili.
- **Il lavoro in più passi resta ordinato.** La catena conserva l’ordine e
  ferma l’esecuzione quando un prerequisito manca.

## Cosa non copre

- Non verifica la qualità dei dati, i duplicati o i missing: quelli restano
  responsabilità del Data Editor e dei controlli di validazione.
- Non sceglie al posto tuo tra due procedure equivalenti: la raccomandazione è
  un punto di partenza documentato, non un verdetto.
- Non modifica i kernel né i parametri avanzati: dopo Applica, il form della
  procedura resta la fonte di verità.

## Fonti nel codice

- `src/ui/assistant/AssistantWorkspace.tsx` — vista completa e diagramma.
- `src/ui/assistant/AssistantPanel.tsx` — pannello laterale e overlay.
- `src/ui/assistant/chain.ts`, `src/hooks/useAssistantChain.ts` — catena,
  preflight ed esecuzione sequenziale.
- `src/ui/assistant/AssistantReportCard.tsx` — card dentro il run-report.
- `src/help/content/<locale>/procedures-more.ts` — pagina Assistant del libro
  di help, nelle sei lingue.

## Vedi anche

- [Libreria e scelta dell’analisi](02-libreria-e-scelta-analisi.md)
- [Ruoli, parametri e Form](03-ruoli-parametri-e-form.md)
- [Report, run-report e session-report](05-report-e-session-report.md)
- [Validazione e guardrail](08-validazione-e-guardrail.md)
