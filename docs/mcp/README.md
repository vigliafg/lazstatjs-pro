# LazStats MCP (stdio)

`lazstats-mcp` espone il motore LazStats tramite MCP su stdio. Non avvia la CLI, non usa rete, shell o `eval`, e non scrive file.

## Installazione da release

```bash
npm install -g ./lazstats-mcp-<versione>.tgz
lazstats-mcp --root /percorso/dati
```

Il tarball è allegato alla release GitHub e richiede Node.js 22.12+. Non è un binario nativo: installa il bundle ESM e il comando `lazstats-mcp` nel prefix npm.

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

Il bundle MCP richiede il worker sibling `worker-entry.mjs` nella stessa directory di `lazstats-mcp.mjs`. Non copiare solo il file principale. Per creare il tarball: `npm run pack:mcp`; per verificarlo con installazione temporanea: `npm run smoke:mcp:package`.

## Tool

| Tool | Uso |
| --- | --- |
| `engine_info` | Versione, runner, chart kind, schema, limiti e documentazione |
| `list_analyses` | Catalogo: 71 visibili, 72 con `includeHidden` (`wizard`) |
| `describe_analysis` | Parametri, ruoli, default ed esempio |
| `inspect_dataset` | Metadati, colonne e preview (`path` oppure `data`) |
| `run_analysis` | Esecuzione con `dataPath`, `projectPath` o `data` |
| `get_result` | Sezioni e paginazione tramite `resultId` |
| `render_chart` | SVG o specifica Vega-Lite compilata |
| `validate_project` | Validazione read-only di un `.lzs` |

`run_analysis` usa esattamente una sorgente. I rifiuti del motore (`E_RUN`, `E_PARAMS`, …) sono `isError: true`, non producono `resultId` né cache e includono la diagnostica. I risultati riusciti restano in una cache LRU in memoria (10 minuti, 20 risultati, 20 MB).

## Help per l'agente

- `instructions` del server: workflow, regole e limiti essenziali.
- `lazstats://help`: guida completa in Markdown.
- `lazstats://help/{topic}`: `overview`, `workflow`, `data`, `run`, `results`, `charts`, `projects`, `errors`, `paths`, `limits`.
- `engine_info.documentation`: URI della guida e topic disponibili.
- `engine_info` con `{ "help": true }`: restituisce la guida completa in `documentation.guideText`.
- `engine_info` con `{ "topic": "errors" }`: restituisce un singolo topic in `documentation.topic`.
- prompt `agent-guide`: inietta la guida completa, con un task opzionale.

Il fallback tramite `engine_info` serve agli host che non espongono risorse o prompt: l'agente può comunque leggere tutta la guida usando solo i tool.

## Documentazione

- [Guida agente](guida-agente.md): flusso, contratti e recupero.
- [Riferimento](riferimento.md): tool, errori e topic, generato da `src/mcp/guide.ts`.
- [Errori](errori.md): tabella di recupero.
- [Integrazione](integrazione.md): host, root e troubleshooting.

## Verifica

```bash
npm run test:mcp
npm run smoke:mcp
```
