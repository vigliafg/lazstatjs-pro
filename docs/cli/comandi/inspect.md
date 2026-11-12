# `lazstats inspect`

Legge un dataset senza eseguire analisi e riporta forma, formato, SHA-256, tipi e metadati delle colonne, più una preview limitata.

```bash
lazstats inspect samples/descriptive/iris/data.csv
lazstats inspect data.xlsx --sheet Results --rows 10 --json
lazstats inspect data.csv --types Age:int,Score:num --missing Age:-9
```

Opzioni di input: `--format-input`, `--delimiter`, `--header`/`--no-header`, `--decimal-comma`, `--sheet`, `--types`, `--missing`. `--max-rows` limita il caricamento; `--rows` limita solo la preview (default 5).

I nomi restituiti sono quelli da usare con `--set` in [`run`](run.md). Vedi il [riferimento](../riferimento.md).
