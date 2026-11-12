# LazStats MCP (stdio)

`lazstats-mcp` espone il motore LazStats tramite MCP su stdio. Non avvia la CLI, non usa rete, shell o `eval`, e non scrive file.

## Build e avvio

```bash
npm run build:mcp
node dist-mcp/lazstats-mcp.mjs --root /percorso/dati
```

La root può essere impostata anche con `LAZSTATS_MCP_ROOT`; il default è `process.cwd()`.
Tutti i path sono risolti con `realpath` e devono restare nella root, symlink inclusi.

## Configurazione host

```json
{
  "mcpServers": {
    "lazstats": {
      "command": "node",
      "args": ["/assoluto/lazstatjs-pro/dist-mcp/lazstats-mcp.mjs"],
      "env": { "LAZSTATS_MCP_ROOT": "/assoluto/dati" }
    }
  }
}
```

## Tool

| Tool | Uso |
| --- | --- |
| `engine_info` | Versione, runner, chart kind, schema e limiti |
| `list_analyses` | Catalogo: 71 visibili, 72 con `includeHidden` (`wizard`) |
| `describe_analysis` | Parametri, ruoli, default ed esempio |
| `inspect_dataset` | Metadati, colonne e preview (`path` oppure `data`) |
| `run_analysis` | Esecuzione con `dataPath`, `projectPath` o `data` |
| `get_result` | Sezioni e paginazione tramite `resultId` |
| `render_chart` | SVG o specifica Vega-Lite compilata |
| `validate_project` | Validazione read-only di un `.lzs` |

`run_analysis` usa esattamente una sorgente. I rifiuti del motore (`E_RUN`, `E_PARAMS`, …) sono `isError: true`, non producono `resultId` né cache e includono la diagnostica. I risultati riusciti restano in una cache LRU in memoria (10 minuti, 20 risultati, 20 MB).

## Verifica

```bash
npm run test:mcp
npm run smoke:mcp
```
