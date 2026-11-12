# `lazstats schema`

Mostra il contratto di una procedura: `paramsKey`, `fields`, `defaultParams`, `roles` e `exampleSet`.

```bash
lazstats schema regression
lazstats schema regression --json
```

`exampleSet` è una stringa pronta per `--set`, per esempio `--set reg.y=Score`. I ruoli riportano `key`, `kind`, `label` e gli indici delle colonne ammesse.

Leggi lo schema prima di costruire override con [`run`](run.md). Vedi il [riferimento](../riferimento.md).
