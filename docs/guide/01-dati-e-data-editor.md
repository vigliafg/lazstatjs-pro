# 01 — Dati e Data Editor

**Cosa copre.** Come entrano i dati nell'app, come sono tipizzati e come si
modificano senza rompere le analisi già configurate.

## Indice

- [Il modello](#il-modello)
- [Tipi, livelli e riferimento](#tipi-livelli-e-riferimento)
- [Mancanti e validazione](#mancanti-e-validazione)
- [Formule e colonne calcolate](#formule-e-colonne-calcolate)
- [Operazioni strutturali](#operazioni-strutturali)
- [Vista](#vista)
- [Import ed export](#import-ed-export)

## Il modello

La griglia non è un foglio di calcolo generico: è un dataset con colonne
tipizzate e identità stabili. Una colonna ha un `id` che non cambia mai, un
nome visibile (unico, con suffisso `_2` in caso di duplicato) e un tipo scelto
tra quelli supportati (`num`, `int`, `dec`, `cat`, `str`, `id`, `bol`, `dat`,
`dtm`, `tim`, `alp`, `chr`). Le analisi leggono una vista readonly del dataset,
non le celle: per questo un parametro punta all'id, non alla posizione.

## Tipi, livelli e riferimento

- Il tipo dichiara come la colonna entra nei calcoli; il rilevamento
  automatico propone un tipo all'import, l'utente può correggerlo.
- Una colonna categoriale ha **livelli** con codice, etichetta e ordine, e un
  **livello di riferimento** usato dai modelli (regressione, ANOVA, logistico).
- Le celle di una colonna con livelli diventano menu a tendina, ma il valore
  memorizzato resta il codice.
- Il pannello dei livelli si apre dalla colonna e dalle analisi che chiedono un
  fattore, così etichette e riferimento si modificano senza cambiare scheda.

## Mancanti e validazione

Ogni colonna può dichiarare **codici di mancante** (per esempio `-9`, `NA`).
Le celle che li contengono sono escluse da ogni analisi, contate nella barra
del contesto e segnalate nell'ispettore. Il controllo con espressione regolare
per cella è disponibile per i dati testuali.

## Formule e colonne calcolate

Una colonna calcolata conserva una formula persistente e viene ricalcolata a
ogni modifica. I riferimenti seguono le rinomine; se la formula si rompe, la
colonna mantiene l'ultimo valore invece di svuotarsi.

## Operazioni strutturali

Inserire, eliminare, spostare, duplicare, dividere o unire colonne non deve
mai far puntare un'analisi alla variabile sbagliata: gli id sono stabili e i
parametri vengono rimappati. Se il ruolo non è più compatibile con il nuovo
tipo, l'analisi si blocca e chiede di riselezionare la variabile, invece di
girare su un'altra colonna.

## Vista

Filtro righe con operatori per tipo (contiene, uguale, maggiore, vuoto…),
scelta tra "solo vista" e "filtra anche le analisi", prima colonna congelata,
intestazione fissa, righe virtualizzate oltre una soglia, riempimento con
maniglia e tastiera (`Ctrl+D`, `Ctrl+R`), incolla multi-cella.

## Import ed export

- CSV con delimitatore virgola o punto e virgola, campi quotati, decimali con
  virgola.
- SPSS `.sav` e Stata `.dta` con etichette di variabile e di valore, date e
  valori mancanti definiti dall'utente.
- Excel `.xlsx` e JSON.
- 52 dataset di esempio in `samples/`, ciascuno negli stessi 5 formati, con un
  manifest machine-readable e uno script di rigenerazione.

**Cosa non copre.** Il calcolo e la prosa: vedi
[04 — Motore e tabelle](04-motore-e-tabelle.md) e
[05 — Report](05-report-e-session-report.md).

**Fonti nel codice.** `src/grid/` (modello, livelli, operazioni, history),
`src/io/` (lettori, scrittori, manifest), `samples/README.md`.

**Vedi anche.** [`docs/GRID-STATE.md`](../GRID-STATE.md),
[`docs/DATA-EDITING-ANALYSIS.md`](../DATA-EDITING-ANALYSIS.md),
[`docs/DATAGRID-AUDIT.md`](../DATAGRID-AUDIT.md).
