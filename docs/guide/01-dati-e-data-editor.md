# 01 — Dati e Data Editor

**Cosa copre.** Come entrano i dati nell'app, come vengono riconosciuti e
come si correggono senza rovinare le analisi già impostate.

## Indice

- [Un dataset con regole, non un foglio di calcolo](#un-dataset-con-regole-non-un-foglio-di-calcolo)
- [Tipi e livelli](#tipi-e-livelli)
- [Valori mancanti](#valori-mancanti)
- [Colonne calcolate](#colonne-calcolate)
- [Modificare la struttura senza perdere il filo](#modificare-la-struttura-senza-perdere-il-filo)
- [Filtri e vista](#filtri-e-vista)
- [Import ed export](#import-ed-export)
- [Punti di forza](#punti-di-forza)

## Un dataset con regole, non un foglio di calcolo

La griglia non è un foglio elettronico libero: è un dataset organizzato in
colonne, e ogni colonna ha un nome visibile, un tipo e un'identità interna che
non cambia mai — nemmeno quando la colonna viene rinominata, spostata o
duplicata.

La differenza si sente nell'uso quotidiano. Le analisi non leggono le singole
celle: leggono una fotografia in sola lettura del dataset. E un'analisi ricorda
l'identità della colonna, non la sua posizione, quindi riordinare le variabili
non sposta il significato di un risultato.

## Tipi e livelli

Il tipo di una colonna dice come quella colonna partecipa ai calcoli. All'import
l'app propone un tipo guardando i valori che trova, e l'utente può sempre
correggerlo. I tipi coprono i casi normali di un dataset: numeri continui e
interi, valori decimali, categorie, testi, identificativi, risposte sì/no,
date, date con l'ora e orari.

Le colonne categoriali hanno un valore in più: i **livelli**. Ogni livello ha
un codice, un'etichetta leggibile e un ordine, e uno dei livelli può essere
indicato come riferimento — quello rispetto al quale i modelli leggono le
differenze.

Nella griglia una cella categoriale diventa un menu a tendina con le etichette,
ma il dato salvato resta il codice: l'utente vede parole, l'analisi lavora su
valori stabili. Il pannello dei livelli si apre dalla colonna e anche dalle
analisi che chiedono un fattore, così un'etichetta si sistema senza cambiare
scheda e senza perdere il lavoro fatto.

## Valori mancanti

Ogni colonna può dichiarare quali valori vanno letti come mancanti. Da quel
momento una cella con quel contenuto non partecipa ad alcuna analisi: viene
contata nella barra del contesto e segnalata nell'ispettore, così l'utente sa
sempre quanti dati ha davvero a disposizione. Per le colonne di testo è
disponibile anche un controllo per singola cella, definito con una regola di
testo.

## Colonne calcolate

Una colonna calcolata conserva la regola che l'ha generata e si aggiorna a ogni
modifica dei dati. Se la regola non è più applicabile, la colonna mantiene
l'ultimo valore buono invece di svuotarsi: il dato non sparisce sotto gli occhi
dell'utente e resta evidente che c'è qualcosa da sistemare.

## Modificare la struttura senza perdere il filo

Inserire, eliminare, spostare, duplicare, dividere o unire colonne sono
operazioni normali quando si prepara un dataset. L'app le tratta come
manutenzione, non come un rischio: le analisi già configurate vengono
ricondotte alle colonne corrette. Se un ruolo non è più compatibile con il
nuovo tipo, l'analisi si ferma e chiede di riselezionare la variabile, invece
di calcolare in silenzio su una colonna diversa.

## Filtri e vista

Il filtro si costruisce in base al tipo di colonna (contiene, uguale, maggiore,
vuoto e così via) e può valere solo per la vista oppure anche per le analisi:
la differenza è esplicita, non un effetto collaterale. La vista offre prima
colonna congelata e intestazione fissa, righe virtualizzate sui dataset grandi,
riempimento con maniglia e da tastiera, e incolla su più celle in un colpo
solo.

## Import ed export

- **CSV** con delimitatore virgola o punto e virgola, campi quotati e decimali
  con la virgola.
- **SPSS e Stata**, con etichette di variabile e di valore, date e valori
  mancanti definiti dall'utente.
- **Excel** e **JSON**.
- 52 dataset di esempio, ciascuno negli stessi cinque formati, con un elenco
  leggibile da programma e uno script per rigenerarli.

## Punti di forza

- **Le analisi sopravvivono ai cambiamenti dei dati.** Rinominare, spostare o
  riscrivere una colonna non fa puntare un'analisi alla variabile sbagliata:
  quando un ruolo non è più valido l'app lo dice, invece di calcolare altro.
- **L'idea portante è semplice: identità stabili e tipi espliciti.** Ogni
  colonna sa cosa contiene e chi è; il resto dell'app si appoggia a queste due
  informazioni invece di indovinare.
- **Accessibile a ogni livello.** Chi conosce poco la statistica trova tipi
  proposti in automatico, etichette al posto dei codici e mancanti dichiarati
  una volta sola; chi lavora di fino ritrova livelli, riferimento, filtri e
  colonne calcolate esattamente dove li aspetta.

**Cosa non copre.** Il calcolo e la prosa: vedi
[04 — Motore e tabelle](04-motore-e-tabelle.md) e
[05 — Report](05-report-e-session-report.md).

**Fonti nel codice.** `src/grid/` (modello, livelli, operazioni, history),
`src/io/` (lettori, scrittori, manifest), `samples/README.md`.

**Vedi anche.** [`docs/GRID-STATE.md`](../GRID-STATE.md),
[`docs/DATA-EDITING-ANALYSIS.md`](../DATA-EDITING-ANALYSIS.md),
[`docs/DATAGRID-AUDIT.md`](../DATAGRID-AUDIT.md).
