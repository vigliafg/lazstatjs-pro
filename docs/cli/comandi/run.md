# `lazstats run`

Esegue una procedura da un dataset o da un progetto e produce un envelope JSON o un report.

```bash
lazstats run --data data.csv --analysis descriptive --set descVars=Score,Age --json
lazstats run --project project.lzs --format html --out report.html
lazstats run --data data.csv --analysis ttest --format xlsx --out results/
```

## Sorgente

Usa esattamente una tra `--data` e `--project`. Con `--data` serve `--analysis`; con `--project` l'analisi salvata è il default.

## Parametri

Precedenza: base del progetto, poi `--params`/`--params-file`, poi `--set` nell'ordine indicato. `--set` è ripetibile; le liste usano la virgola e `@indice` seleziona una colonna per posizione.

## Output

`--format json` (default) scrive l'envelope; `md`, `html`, `xlsx` e `svg` producono report. XLSX e SVG richiedono `--out`. `--charts svg` è il default di HTML/SVG.

Opzioni utili: `--ci`, `--report-locale`, `--include-data`, `--include-data-sheet`, `--timestamps`, `--diagnostics`, `--timings`, `--timeout`, `--workers`, `--quiet`, `--verbose`.

Un run rifiutato restituisce un envelope di errore e un exit code 2/3/4/5, senza risultato fittizio. Vedi la [guida agente](../guida-agente.md) e il [riferimento](../riferimento.md).
