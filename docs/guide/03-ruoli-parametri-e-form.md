# 03 — Ruoli, parametri e Form

**Cosa copre.** Il patto che permette a 72 procedure diverse di chiedere le
colonne e i parametri nello stesso modo, e di essere salvate e riaperte senza
sorprese.

## Indice

- [Ruoli di colonna](#ruoli-di-colonna)
- [Parametri](#parametri)
- [Il form](#il-form)
- [La regola](#la-regola)
- [Punti di forza](#punti-di-forza)

## Ruoli di colonna

Ogni procedura dichiara di cosa ha bisogno. Un ruolo è una casella con un nome
chiaro e un compito preciso: una variabile numerica da analizzare, una variabile
di gruppo, oppure una variabile che va bene in entrambi i casi perché è la
procedura a decidere in base al tipo.

Le regole comuni sono poche e valgono per tutte le procedure: elencare i ruoli,
leggere lo stato attuale, assegnare una colonna e rifiutare gli abbinamenti
incompatibili. Un ruolo lasciato vuoto resta vuoto: non esiste un valore
segnaposto da interpretare, e il form lo mostra come una casella da riempire.

Alcune procedure hanno ruoli che dipendono dagli altri: in un modello a fattori,
per esempio, ogni indicatore appartiene a un fattore e il gruppo deve restare
coerente con la selezione. Questa coerenza la gestisce l'assegnazione del ruolo,
non il form: l'utente non deve ricordarsene.

## Parametri

Tutti i parametri di tutte le procedure sono descritti in un unico posto e
partono da valori iniziali sensati. Prima di essere usati passano da un solo
passaggio di normalizzazione, che applica i tipi, impedisce indici fuori dal
dataset, riempie i campi mancanti e ricalcola quelli derivati.

Vale per ogni provenienza: parametri scelti a schermo, parametri letti da un
file di progetto, parametri proposti da un manifest. Nulla entra nei calcoli
senza questo controllo.

Quando la griglia cambia struttura, i riferimenti vengono ricondotti alle
colonne giuste; i ruoli non più validi diventano vuoti e l'app lo segnala,
invece di riutilizzare per errore un numero di colonna ormai diverso.

## Il form

Ogni procedura ha il proprio form, costruito con gli stessi controlli delle
altre. Il form non calcola nulla: legge e scrive parametri, controlla i tipi e
mostra le etichette tradotte. I preset salvano una combinazione di parametri con
un nome, così un'analisi ricorrente si riapre con un clic e non va ricostruita
ogni volta.

## La regola

Per aggiungere una procedura si aggiungono una voce nel catalogo, i ruoli, i
parametri e il form. Non si riscrive la logica di selezione, di rimappatura o di
salvataggio: quella è comune e resta una sola.

## Punti di forza

- **72 procedure, un solo modo di usarle.** La stessa casella, lo stesso
  linguaggio, la stessa gestione dei parametri: la competenza acquisita su
  un'analisi vale su tutte.
- **L'idea è separare il patto dal calcolo.** Ruoli e parametri descrivono cosa
  serve, il form lo raccoglie, il motore calcola: ogni parte può cambiare senza
  costringere le altre a seguire.
- **La soglia d'ingresso resta bassa.** Le caselle dicono cosa mettere, i
  controlli impediscono gli abbinamenti sbagliati, i preset tolgono il lavoro
  ripetitivo; chi è esperto ritrova comunque tutti i parametri, uno per uno.

**Cosa non copre.** Il calcolo e le tabelle: [04](04-motore-e-tabelle.md). I
rifiuti a runtime: [08](08-validazione-e-guardrail.md).

**Fonti nel codice.** `src/analyses/roles.ts`, `rolesW5.ts`, `rolesW7.ts`,
`src/analyses/params.ts`, `src/io/project/types.ts`, `src/io/project/parse.ts`,
`src/ui/analysis/`.

**Vedi anche.** [`docs/FORMS-AUDIT.md`](../FORMS-AUDIT.md).
