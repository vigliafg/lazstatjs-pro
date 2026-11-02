# Istruzioni per l'agente — lazstatjs-pro

## Terminologia: run-report e session-report

Usare sempre questi due termini con il significato seguente:

- **run-report**: l'output di **una singola procedura statistica**, cioè il
  risultato di un singolo run (tabelle, report discorsivo, grafici e metadati
  della card).
- **session-report**: l'**insieme degli output di più run-report consecutivi**
  presenti nella finestra Output/Report della sessione.

Non usare i due termini in modo intercambiabile: un run-report è il singolo
blocco, un session-report è la collezione ordinata dei blocchi.

## Esecuzione di procedure multi-step

Quando l'agente sta implementando una procedura composta da più step e l'utente
ha già approvato l'implementazione **senza chiedere conferme di proseguimento**,
l'agente deve:

1. Eseguire **tutti** gli step della procedura, uno dopo l'altro, seguendo la
   sequenza consigliata/pianificata, senza fermarsi a chiedere il permesso tra
   uno step e il successivo.
2. **Testare ogni step** appena implementato (test automatici, build, lint,
   verifica manuale mirata — quello che il progetto mette a disposizione) prima
   di passare allo step successivo.
3. Procedere solo se il test dello step corrente passa; se fallisce, correggere
   lo step corrente e ritestarlo prima di avanzare.
4. Fermarsi e chiedere all'utente **solo** se:
   - un test continua a fallire dopo un tentativo ragionevole di correzione;
   - lo step richiede una decisione di prodotto/architettura non coperta
     dall'approvazione ricevuta;
   - lo step successivo comporterebbe un'azione distruttiva o irreversibile
     (es. cancellare dati, force-push, modifiche fuori dal perimetro approvato).

La conferma di proseguimento va quindi considerata **implicita** nell'approvazione
iniziale: non ripetere domande tipo "procedo con lo step 2?".

## Checkpoint, handoff e compattazione

Prima di ogni compattazione del contesto e alla fine di ogni ondata/checkpoint,
l'agente deve:

1. Aggiornare `docs/plans/2026-11-02-gap-procedure-stato.md` con: ondata
   corrente, branch/worktree, ultimo commit, item chiusi/in corso/bloccati,
   test eseguiti, decisioni, prossimi 3 passi, domande aperte e rischi.
2. Aggiornare le checkbox e lo stato nel piano
   `docs/plans/2026-11-02-gap-procedure-piano.md`.
3. Non compattare a metà di una modifica senza WIP commit e non dichiarare
   verde un checkpoint con test rossi.
4. Considerare il documento di stato, i commit e i test come fonte di verità:
   non affidarsi alla memoria della chat.

Il protocollo completo è nel piano, §16.

## Subagenti

Quando i compiti sono separabili, usare **2–3 subagenti in parallelo**. Regole:

1. **Proprietario unico**: ogni file ha un solo scrittore per sessione.
2. I file condivisi (registry, tipi/parse dei parametri, `params.ts`,
   `roles.ts`, `runners.ts`, `AnalysisForm.tsx`, cataloghi i18n, help, piano)
   sono **solo dell'agente principale**.
3. I subagenti lavorano su file nuovi o dedicati: kernel + test, tabelle,
   report, script/fixture R, nuova voce di analisi.
4. Se due compiti toccano lo stesso file, si serializzano: niente merge
   creativo.
5. Ogni incarico dichiara perimetro file, reference, tolleranza, test e
   criterio di stop.
6. Un subagente non chiude un item: la chiusura passa dal gate dell'agente
   principale (`npm run check`, help/i18n, sample).
7. Non delegare decisioni di prodotto/architettura, azioni distruttive, bump di
   versione, aggiornamento dello stato.
8. Worktree separati solo per rami davvero indipendenti; altrimenti stesso
   albero con file ownership.

Dettagli nel piano, §17.

