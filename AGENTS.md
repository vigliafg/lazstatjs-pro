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
