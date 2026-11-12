# `lazstats project`

Gestisce i progetti `.lzs`.

## `project inspect`

```bash
lazstats project inspect project.lzs
lazstats project inspect project.lzs --json
```

È read-only: riporta versione e migrazione, righe/colonne, analisi attiva, chiavi dei parametri, output salvati e SHA-256. Non esegue la procedura.

## `project run`

```bash
lazstats project run project.lzs
lazstats project run project.lzs --analysis regression --format html --out report.html
```

Equivale a `run --project project.lzs`. Usa griglia, parametri, CI e lingua salvati; `--analysis`, `--params` e `--set` possono sovrascriverli. L'analisi attiva `assistant` viene rifiutata perché non è una procedura eseguibile.

Vedi [`run`](run.md) e il [riferimento](../riferimento.md).
