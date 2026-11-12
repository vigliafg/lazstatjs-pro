# `lazstats analyses`

Elenca le procedure eseguibili. Senza `--all` mostra 71 procedure visibili; `--all` aggiunge la voce nascosta `wizard`. `assistant` è un workflow dell'interfaccia e non compare mai.

```bash
lazstats analyses
lazstats analyses --json
lazstats analyses --family regression
lazstats analyses --all --verbose
```

`--json` restituisce `{ "total": n, "analyses": [...] }`; ogni voce contiene `id`, `label`, `family`, `familyLabel`, `description`, `cost`, `heavy`, `runnable` e `hidden`. `--verbose` aggiunge i ruoli nel testo.

Usa l'`id` con [`schema`](schema.md) e [`run`](run.md). Vedi il [riferimento](../riferimento.md).
