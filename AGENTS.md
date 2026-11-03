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

## Economia del contesto

Obiettivo: ridurre il consumo di token **senza** ridurre la qualità. Le regole
valgono per ogni ondata e ogni sessione.

1. **Test mirati durante gli step, gate completo solo alla fine.**
   - Durante l'implementazione eseguire solo i test dei file toccati.
   - `npm run check`, `npm run test:samples` e locale check si eseguono al gate
     di fine ondata o dopo una modifica ai contratti condivisi.
   - Non rieseguire il gate completo dopo modifiche solo a documentazione,
     help o cataloghi già coperti da un test mirato.
2. **Lettura selettiva.**
   - Prima `grep -n`, `wc -l`, `git diff --stat`; poi `sed -n` sulle sole righe
     utili.
   - Non rileggere file già visti e non stampare interi file oltre ~200 righe
     se basta un intervallo.
3. **Output filtrati.**
   - Usare `tail`, `grep`, `head` su test, build e diff.
   - Riportare solo esito ed errori reali; niente dump di log o diff enormi
     nella risposta finale.
4. **Call indipendenti in parallelo e niente ripetizioni.**
   - Raggruppare le verifiche indipendenti in una sola tornata.
   - Non rilanciare lo stesso comando "per sicurezza" se nulla è cambiato.
5. **Sample e generazioni massive.**
   - Non rigenerare tutti i sample se servono solo dataset nuovi.
   - Dopo `samples/generate.R` ripristinare i binari invariati e tenere solo i
     file nuovi più il manifest.
6. **Script per il lavoro ripetitivo.**
   - Translation, codemod e parsing di massa vanno fatti con uno script una
     tantum, revisionato, non con centinaia di edit manuali.
7. **Checkpoint frequenti.**
   - Commit piccoli a fine step significativo e stato aggiornato nel documento
     di handoff: il contesto si compatta senza rileggere tutto.
8. **Risposte finali brevi.**
   - Cosa è cambiato, test, commit. Il dettaglio resta nei documenti e nei
     commit.
9. **Fermarsi quando basta per agire.**
   - Evitare letture speculative e refactor non richiesti; riusare pattern e
     helper esistenti.
10. **Un solo scrittore.**
    - L'agente principale è l'unico che modifica i file. Vedi §Subagenti.

## Subagenti

**Niente subagenti paralleli in scrittura.** L'agente principale è l'unico
scrittore della sessione: questo elimina merge, ownership ambigua e rework di
integrazione, che sono la principale fonte di token sprecati.

1. I subagenti in **sola lettura** (`explore`, `council-*`) sono ammessi solo se
   costano meno della lettura diretta: al massimo un `explore` per mappare file
   che richiederebbero molte letture, e i `council-*` solo alla revisione del
   gate.
2. Non delegare a un subagente scrittura di kernel, tabelle, report, form,
   test, traduzioni, help o integrazione.
3. I file condivisi (registry, tipi/parse dei parametri, `params.ts`,
   `roles.ts`, `runners.ts`, `AnalysisForm.tsx`, cataloghi i18n, help, piano)
   sono **sempre** dell'agente principale.
4. Se un subagente in lettura viene usato, l'incarico dichiara perimetro,
   domanda e criterio di stop; la risposta richiesta è breve e l'agente
   principale verifica con test mirati.
5. Non delegare decisioni di prodotto/architettura, azioni distruttive, bump di
   versione o aggiornamento dello stato.
6. Worktree separati solo per rami davvero indipendenti; altrimenti stesso
   albero con un solo scrittore.

Dettagli nel piano, §17. In caso di conflitto, valgono le regole di questo
documento.

