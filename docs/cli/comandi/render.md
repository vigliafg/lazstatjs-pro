# `lazstats render`

Renderizza un envelope JSON già prodotto da `run`, senza ricalcolare l'analisi.

```bash
lazstats render --result result.json --format md
lazstats render --result result.json --format html --out report.html
lazstats render --result result.json --format xlsx --out report.xlsx
lazstats render --result result.json --format svg --out charts/
```

Accetta solo envelope con `status: "ok"`. Il formato predefinito è `html`. `xlsx` e `svg` richiedono `--out`; `svg` scrive una directory con un file per grafico e richiede `--charts svg`. `--include-data-sheet` aggiunge il foglio dati all'XLSX se l'envelope contiene i dati.

Vedi [`run`](run.md) e il [riferimento](../riferimento.md).
