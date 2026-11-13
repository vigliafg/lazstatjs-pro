# Integrazione host

## Installazione da release

```bash
npm install -g ./lazstats-mcp-<versione>.tgz
```

Il comando globale è `lazstats-mcp`. Il pacchetto contiene `lazstats-mcp.mjs` e `worker-entry.mjs`; richiede Node.js 22.12+.

## Configurazione minima

```json
{
  "mcpServers": {
    "lazstats": {
      "command": "lazstats-mcp",
      "args": ["--root", "/assoluto/dati"]
    }
  }
}
```

In alternativa alla flag `--root`, usa la variabile `LAZSTATS_MCP_ROOT`. La root deve esistere ed essere una directory; tutti i path vengono risolti con `realpath`. Per il bundle non installato, usa `command: "node"` e il path assoluto di `dist-mcp/lazstats-mcp.mjs`.

## Build

```bash
npm run build:mcp
```

Il comando produce:

- `dist-mcp/lazstats-mcp.mjs` — entry point MCP;
- `dist-mcp/worker-entry.mjs` — worker delle analisi pesanti.

Mantieni i due file nella stessa directory. Il bundle non richiede `tsx` a runtime.

## Host supportati

Qualsiasi host MCP che supporti il trasporto stdio e la configurazione JSON. Per host con formati diversi, usa `command`/`args`/`env` equivalenti:

- comando: `node`;
- argomenti: path assoluto del bundle, eventuale `--root`;
- ambiente: `LAZSTATS_MCP_ROOT` se non usi `--root`.

Su Windows usa un path assoluto con la lettera di unità e verifica che `node` sia nel `PATH` dell'host.

## Verifica

```bash
npm run test:mcp
npm run smoke:mcp
```

Il test di integrazione avvia il bundle (se presente) o `src/mcp/main.ts` con `tsx`, controlla gli otto tool, le risorse, i prompt, la cache e la purezza di stdout.

## Troubleshooting

- **Il server non parte**: verifica che la root esista e che il path del bundle sia assoluto.
- **`E_DATA/file_not_found`**: il path è relativo alla root, non alla directory dell'host.
- **`E_DATA/path_outside_root`**: un symlink risolve fuori dalla root; sposta il file o cambia root.
- **Nessun risultato dopo un run**: controlla `isError`; un rifiuto non produce `resultId`.
- **`E_RESULT_EXPIRED`**: la cache dura 10 minuti; riesegui l'analisi.
- **Errori di import del worker**: assicurati che `worker-entry.mjs` sia accanto al bundle.
