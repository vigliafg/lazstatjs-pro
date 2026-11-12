# Piano — Server MCP stdio per LazStats

**Data:** 2026-11-11
**Repository:** `lazstatjs-pro`
**Versione di riferimento:** `0.32.0`
**Stato:** piano di progettazione; nessuna implementazione inclusa.

---

## 1. Scopo

Realizzare `lazstats-mcp`, un server MCP locale che espone il motore statistico di LazStats a host come Claude Desktop, Cursor, VS Code e altri client compatibili.

Il server deve:

1. girare su **stdio**, senza porta HTTP;
2. usare lo stesso engine della CLI;
3. esporre le 72 runner eseguibili, non una copia delle formule;
4. restituire risultati strutturati e leggibili;
5. proteggere l’accesso ai file locali;
6. restare reattivo durante le analisi pesanti.

Non è un’API remota e non è un secondo motore statistico.

---

## 2. Fattibilità verificata

### 2.1 Motore

- `ANALYSIS_RUNNERS` contiene 72 runner puri.
- Il registro contiene 73 voci: 72 schede visibili e `wizard` nascosto.
- `assistant` è una voce UI, non un runner.
- `CHART_KINDS` contiene 32 kind.
- I runner si importano in Node senza DOM.
- `descriptive` su `samples/descriptive/iris/data.csv` restituisce 4 tabelle.
- `buildVegaSpec` + `vega-lite.compile` + `vega.View(...).toSVG()` produce SVG in Node (verificato: grafico `bar`, 8.593 byte).

### 2.2 SDK MCP

- `@modelcontextprotocol/server` 2.4.0 è disponibile, ESM, Node ≥20.
- `@modelcontextprotocol/client` 2.4.0 è disponibile per i test.
- `zod` 4.6.7 è disponibile.
- API prevista: `McpServer`, `registerTool`, `serveStdio` da `@modelcontextprotocol/server/stdio`.
- I pacchetti **non sono ancora installati** nel repository.

### 2.3 Cosa resta da verificare in implementazione

- comportamento effettivo di `serveStdio` con il bundle esbuild;
- `outputSchema` e `structuredContent` per risultati grandi;
- cancellazione delle richieste e propagazione dell’`AbortSignal`;
- compatibilità di `zod/v4` con il TypeScript del repo;
- gestione dei path su Windows;
- eventuale necessità di esternalizzare l’SDK dal bundle.

---

## 3. Non-obiettivi

- Non creare un server HTTP o multi-tenant.
- Non aggiungere autenticazione: stdio eredita i permessi dell’utente.
- Non esporre un filesystem browser o un editor.
- Non scrivere file senza richiesta esplicita.
- Non duplicare la CLI come processo figlio per ogni tool call.
- Non implementare un secondo catalogo di analisi.
- Non generare PNG con dipendenze native nella prima versione.
- Non consentire rete, shell o esecuzione arbitraria.

---

## 4. Architettura

### 4.1 Struttura

```text
src/
  engine/                 condiviso con la CLI
  mcp/
    main.ts               entry point + serveStdio
    server.ts             createServer e registrazione
    tools/
      engineInfo.ts
      listAnalyses.ts
      describeAnalysis.ts
      inspectDataset.ts
      runAnalysis.ts
      getResult.ts
      renderChart.ts
      validateProject.ts
    resources.ts
    prompts.ts
    paths.ts              root, realpath, symlink, limiti
    resultCache.ts        resultId, TTL, sezioni
    limits.ts             righe, celle, byte, timeout
    errors.ts             mapping engine → MCP isError
```

`src/mcp/` importa solo `src/engine/` e l’SDK MCP. Non importa React, Electron o la CLI.

### 4.2 Flusso

```text
MCP host
  -> stdio JSON-RPC
  -> serveStdio(createServer)
  -> tool handler
  -> path validation
  -> engine.loadDataset / parseProject
  -> engine.runAnalysis
  -> RunEnvelope
  -> resultCache + structuredContent
  -> risposta MCP
```

La CLI e l’MCP condividono:

- catalogo;
- loader;
- binding dei parametri;
- worker;
- renderer;
- envelope;
- codici di errore.

### 4.3 Perché non lanciare la CLI

L’MCP non deve eseguire `spawn('lazstats', ...)` per ogni richiesta:

- aggiunge latenza e problemi di quoting;
- duplica la gestione degli errori;
- rende difficile la cache e la cancellazione;
- introduce un processo figlio per ogni chiamata.

L’MCP importa direttamente l’engine.

---

## 5. SDK e trasporto

### 5.1 Dipendenze

Aggiungere:

```json
{
  "dependencies": {
    "@modelcontextprotocol/server": "2.4.0",
    "zod": "4.6.7"
  },
  "devDependencies": {
    "@modelcontextprotocol/client": "2.4.0"
  }
}
```

Le versioni vanno pinnate finché l’integrazione non è stabile.

### 5.2 Entry point

```ts
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';

serveStdio(() => createServer());
```

`serveStdio` possiede il trasporto, legge stdin e scrive stdout. Il server non deve chiamare `console.log`.

### 5.3 Regole stdio

- stdout: **solo** messaggi JSON-RPC.
- stderr: log, errori diagnostici, versione, tempi.
- `console.error` per l’avvio.
- Nessun banner su stdout.
- Nessun `process.stdout.write` fuori dal trasporto.
- Chiusura su EOF di stdin.
- `SIGINT`/`SIGTERM`: chiusura pulita del server e dei worker.
- `process.exitCode = 1` solo per errori fatali.

### 5.4 Errori

- Errori di schema: gestiti dall’SDK, `isError: true`.
- Errori di dominio: restituiti come tool result `isError: true` con codice e messaggio.
- Eccezioni impreviste: log su stderr, risultato generico, nessuno stack al client.
- Timeout: `E_TIMEOUT`.
- Annullamento: `E_CANCELLED`.

La semantica completa del rifiuto è quella di `PIANO-CLI.md` §8.5 e vale anche per l’MCP:

- `E_PARAMS`/`E_RUN` sono rifiuti: `isError: true`, nessun `resultId`, nessuna entry in cache, nessuna tabella o grafico.
- `E_DATA` è un errore di input: `isError: true`, nessun `resultId`.
- Per `E_RUN`, `error.message` è identico al `reason` del runner; il server non lo riscrive e non lo traduce.
- `error.kind`, `error.stage`, `error.details` e `error.retryable` seguono lo stesso contratto della CLI.
- Una risposta `isError` non contiene mai un finto run-report con tabelle vuote.

---

## 6. Tool

Il server espone otto tool. I nomi sono stabili e descrittivi.

### 6.1 `engine_info`

Nessun argomento.

Restituisce:

```json
{
  "name": "lazstats",
  "version": "0.32.0",
  "engineSchemaVersion": 1,
  "runners": 72,
  "chartKinds": 32,
  "node": "22.x"
}
```

Serve al client per verificare la compatibilità senza leggere il catalogo.

### 6.2 `list_analyses`

Input:

```ts
{
  query?: string;
  family?: string;
  includeHidden?: boolean;
  limit?: number; // default 100, max 200
}
```

Output:

```json
{
  "analyses": [
    {
      "id": "ttest",
      "label": "T-Test",
      "family": "compare",
      "description": "Compare two means or paired measurements.",
      "cost": "instant",
      "runnable": true,
      "hidden": false
    }
  ],
  "total": 71,
  "hiddenCount": 1
}
```

Regole:

- senza `includeHidden` il totale è 71; con `includeHidden: true` è 72;
- `assistant` è escluso perché non è un runner;
- `wizard` è incluso solo con `includeHidden: true`;
- `query` usa la ricerca del registry o una ricerca equivalente;
- l’output non include i default dei parametri: quelli stanno in `describe_analysis`.

### 6.3 `describe_analysis`

Input:

```ts
{ analysisId: string }
```

Output:

- metadati del registry;
- `paramsKey`;
- default della fetta di `ProjectParams`;
- campi e ruoli colonna;
- esempio minimo;
- `heavy: boolean`;
- eventuali prerequisiti (dataset, tabella manuale, parametri).

Se l’id non esiste o non è eseguibile, `isError: true`.

### 6.4 `inspect_dataset`

Input:

```ts
{
  path?: string;
  data?: unknown;
  format?: 'csv' | 'tsv' | 'json' | 'xlsx' | 'sav' | 'dta';
  sheet?: string | number;
  hasHeader?: boolean;
  delimiter?: string;
  maxRows?: number;
  previewRows?: number;
}
```

Output:

```json
{
  "format": "csv",
  "rows": 150,
  "columns": 5,
  "sha256": "...",
  "columnsMeta": [
    {
      "name": "Sepal.Length",
      "type": "num",
      "label": null,
      "missing": [],
      "levels": []
    }
  ],
  "preview": [
    ["5.1", "3.5", "1.4", "0.2", "setosa"]
  ],
  "truncated": false
}
```

Regole:

- `path` e `data` sono alternativi;
- `previewRows` default 5, massimo 20;
- `maxRows` rispetta il limite globale;
- non restituisce l’intero dataset;
- i path passano dalla validazione della root.

### 6.5 `run_analysis`

Input:

```ts
{
  analysisId: string;
  dataPath?: string;
  projectPath?: string;
  data?: unknown;
  params?: unknown;
  set?: Record<string, string | number | boolean | string[]>;
  ciLevel?: 90 | 95 | 99;
  reportLocale?: string;
  include?: Array<'summary' | 'tables' | 'report' | 'charts'>;
  diagnostics?: 'none' | 'summary' | 'full';
  timeoutMs?: number;
}
```

Regole:

- esattamente uno tra `dataPath`, `projectPath`, `data`;
- `analysisId` deve essere un runner eseguibile;
- con `projectPath`, i parametri vengono dal progetto, poi `params`/`set` li sovrascrivono;
- `set` usa la stessa grammatica della CLI;
- `ciLevel` default 95;
- `include` default `["summary", "tables", "report"]`;
- i chart model sono restituiti solo se richiesti;
- il risultato completo viene salvato in cache con `resultId`;
- `structuredContent` contiene un envelope ridotto e `resultId`;
- `content` contiene un riassunto testuale leggibile;
- se il motore rifiuta, non viene creato `resultId`, non viene scritta la cache e non vengono restituiti tabelle o grafici: la risposta è `isError: true` con `code`, `kind`, `stage`, `message` esatto e `details`;
- la risposta include `diagnostics` secondo `PIANO-CLI.md` §8.5.8, con i check falliti, i problemi, i conteggi e i suggerimenti;
- `diagnostics` non contiene celle o valori liberi; `rowNumbers` non è esposto dall'MCP nella prima versione;
- il server non trasforma un rifiuto in un risultato `ok:true` con tabelle vuote.

Output schema (semplificato):

```json
{
  "resultId": "res_01...",
  "analysis": { "id": "descriptive", "label": "Descriptive" },
  "ok": true,
  "summary": "Descriptive: 2 variables, 4 tables, 3 charts.",
  "tables": [],
  "report": null,
  "charts": [],
  "warnings": [],
  "elapsedMs": 42
}
```

Se il runner restituisce `ok:false`:

```json
{
  "isError": true,
  "code": "E_RUN",
  "message": "Insufficient data for T-Test",
  "analysisId": "ttest"
}
```

### 6.6 `get_result`

Input:

```ts
{
  resultId: string;
  section?: 'summary' | 'tables' | 'report' | 'charts' | 'all';
  offset?: number;
  limit?: number;
}
```

Serve a leggere risultati grandi senza superare i limiti del messaggio.

Regole:

- `section` default `summary`;
- `offset`/`limit` applicati a tabelle, righe di report e grafici;
- `limit` massimo per sezione;
- `resultId` scade dopo TTL;
- risultato scaduto: `E_RESULT_EXPIRED`.

### 6.7 `render_chart`

Input:

```ts
{
  resultId: string;
  chartId: string;
  format?: 'svg' | 'spec';
}
```

Output:

- `svg`: testo SVG come `text` content o resource;
- `spec`: specifica Vega-Lite compilata.

Regole:

- niente PNG nella prima versione;
- il chart deve appartenere al risultato;
- i `PanelChart` non sono renderizzabili come singolo grafico: usare i child;
- nessun accesso a file arbitrari.

### 6.8 `validate_project`

Input:

```ts
{ path: string }
```

Output:

- versione, app, data di salvataggio;
- righe/colonne;
- analisi attiva;
- numero di output;
- errori di parsing;
- campi migrati o ignorati.

Non esegue analisi e non modifica il progetto.

---

## 7. Risorse e prompt

### 7.1 Risorse

Esporre:

- `lazstats://analyses` — catalogo JSON dei 72 runner;
- `lazstats://analyses/{id}` — metadati e schema di una procedura;
- `lazstats://engine` — versione, schemaVersion, limiti.

Le risorse sono read-only e non dipendono dal filesystem. I tool restano la fonte autorevole per l’esecuzione.

### 7.2 Prompt

Prompt opzionale `choose-analysis`:

- input: obiettivo dell’utente, nomi/tipi delle colonne, eventuale campione;
- usa il registry e la logica di raccomandazione già esistente, senza ricalcolare statistiche;
- restituisce una lista di procedure candidate con motivazione;
- non esegue automaticamente un’analisi.

Il prompt non sostituisce `list_analyses`/`describe_analysis`.

---

## 8. Cache e risultati grandi

### 8.1 Cache

- `Map<string, CachedResult>` in memoria;
- TTL default 10 minuti;
- massimo 20 risultati;
- massimo 20 MB complessivi;
- LRU per l’eliminazione;
- nessuna scrittura su disco;
- `resultId` opaco e non previsionale.

### 8.2 Limiti di risposta

- `content` breve: massimo 8.000 caratteri;
- `structuredContent` massimo 256 KB;
- `diagnostics` massimo 64 KB e comunque troncato prima del limite globale, con `truncated: true`;
- tabelle/report oltre il limite vengono troncati con `truncated: true`;
- `get_result` permette di recuperare il resto;
- i chart model non vengono inclusi per default;
- i dati di input non vengono riecheggiati.

### 8.3 Formato envelope

Riutilizzare `RunEnvelope` dell’engine:

- `schemaVersion`;
- `engine`;
- `analysis`;
- `input` (senza dati completi);
- `params`;
- `ciLevel`;
- `reportLocale`;
- `result`;
- `warnings`.

L’MCP può aggiungere:

- `resultId`;
- `summary`;
- `truncated`;
- `sections`.

---

## 9. Sicurezza

### 9.1 Root directory

- `LAZSTATS_MCP_ROOT` o `--root` definisce la directory consentita;
- default: `process.cwd()`;
- ogni path viene risolto con `realpath`;
- il path risolto deve restare dentro la root;
- symlink che escono dalla root vengono rifiutati;
- path assoluti fuori root rifiutati;
- `..` normalizzato e verificato.

### 9.2 Limiti

- file statistici: 25 MB;
- CSV/JSON: 100 MB;
- righe: 50.000;
- colonne: 500;
- dati inline: 1 MB e 2.000 righe;
- `maxToolInputElements: 10000`;
- timeout default 120 secondi;
- concorrenza massima 4;
- coda massima 16.

### 9.3 Divieti

- nessuna rete;
- nessuna shell;
- nessun `eval`;
- nessuna scrittura di default;
- nessun path arbitrario;
- nessun output HTML non sanificato verso il client;
- nessun log del contenuto delle celle;
- nessun segreto nell’envelope.

### 9.4 Dati sensibili

L’MCP è locale, ma i dataset possono contenere dati personali. Le regole:

- non loggare righe o valori;
- non includere dati completi in `structuredContent`;
- non salvare risultati su disco senza richiesta;
- documentare che l’host MCP può leggere i risultati restituiti.

---

## 10. Concorrenza e cancellazione

### 10.1 Modello

- Il server resta single-process.
- Le analisi heavy usano un pool di worker.
- Le analisi instant possono essere eseguite inline.
- Ogni richiesta ha un `AbortSignal`.
- `notifications/cancelled` termina il worker associato.
- Timeout e cancellazione restituiscono `E_TIMEOUT`/`E_CANCELLED`.

### 10.2 Coda

- massimo 4 esecuzioni contemporanee;
- massimo 16 richieste in coda;
- oltre il limite: `E_BUSY`, `isError: true`;
- priorità FIFO;
- nessuna crescita illimitata.

### 10.3 Progress

Per le analisi heavy:

- notifiche di progresso `starting`, `computing`, `finishing` quando il client fornisce un progress token;
- elapsed time nel risultato;
- nessun polling;
- nessuna notifica se il client non la supporta.

---

## 11. Build e configurazione

### 11.1 Build

`scripts/build-mcp.mjs` con esbuild:

- entry `src/mcp/main.ts`;
- `bundle: true`;
- `platform: 'node'`;
- `format: 'esm'`;
- `target: 'node22'`;
- `outfile: 'dist-mcp/lazstats-mcp.mjs'`;
- shebang in banner;
- esternalizzare `@modelcontextprotocol/server` e `@modelcontextprotocol/server/stdio` se il bundling causa problemi con gli export;
- `zod` può essere bundlato o esternalizzato, da decidere in implementazione.

### 11.2 `package.json`

```json
{
  "bin": {
    "lazstats-mcp": "dist-mcp/lazstats-mcp.mjs"
  },
  "scripts": {
    "build:mcp": "node scripts/build-mcp.mjs",
    "mcp": "node --import tsx src/mcp/main.ts",
    "test:mcp": "node --import tsx --test \"src/mcp/**/*.test.ts\""
  }
}
```

### 11.3 Configurazione host

Claude Desktop / Cursor:

```json
{
  "mcpServers": {
    "lazstats": {
      "command": "node",
      "args": ["/absolute/path/to/lazstatjs-pro/dist-mcp/lazstats-mcp.mjs"],
      "env": {
        "LAZSTATS_MCP_ROOT": "/absolute/path/to/data"
      }
    }
  }
}
```

Note:

- usare un path assoluto;
- `LAZSTATS_MCP_ROOT` limita i file leggibili;
- non mettere segreti nella configurazione;
- il server non richiede rete.

---

## 12. Test

### 12.1 Unit

- schema dei tool e default;
- mapping errori engine → `isError`;
- path validation e symlink;
- cache TTL/LRU;
- troncamento e paginazione;
- selezione delle sezioni;
- `render_chart` con chart id valido/non valido.

### 12.2 Integrazione MCP

Usare `Client` + `StdioClientTransport` dell’SDK 2.4.0 per avviare il server costruito:

1. handshake;
2. `tools/list` contiene gli 8 tool;
3. `engine_info`;
4. `list_analyses` conta 71 procedure visibili di default e 72 con `includeHidden`; `assistant` è nascosto;
5. `describe_analysis` per `ttest`;
6. `inspect_dataset` su iris;
7. `run_analysis` descrittiva;
8. `get_result` con sezioni e paginazione;
9. `render_chart` SVG;
10. `validate_project`.

### 12.3 Errori

- analisi sconosciuta;
- parametri invalidi;
- dataset mancante;
- path fuori root;
- symlink fuori root;
- file troppo grande;
- runner `ok:false`;
- timeout;
- cancellazione;
- risultato scaduto;
- due richieste concorrenti.

Per ogni rifiuto verificare esplicitamente:

- `isError: true` e nessun `resultId`;
- `error.message` identico al `reason` del runner per `E_RUN`;
- `error.kind`, `stage` e `details` presenti quando disponibili;
- `diagnostics` presente e coerente con il `kind` (check fallito, colonne e conteggi);
- nessuna tabella, report o grafico nel payload;
- nessuna entry aggiunta alla cache.

### 12.4 Purezza stdio

Testare che:

- stdout contenga solo JSON-RPC;
- nessun banner;
- log su stderr;
- il processo termini su EOF;
- `SIGINT` chiuda i worker.

### 12.5 Comandi

```bash
npm run lint
npm test
npm run build:mcp
npm run test:mcp
npm run check
```

### 12.6 Accettazione

1. Il server si avvia via `node dist-mcp/lazstats-mcp.mjs`.
2. L’handshake MCP riesce.
3. `tools/list` espone gli 8 tool.
4. `run_analysis` esegue una procedura reale.
5. `structuredContent` rispetta `outputSchema`.
6. Un errore statistico produce `isError`, non un crash.
7. Un path fuori root viene rifiutato.
8. Due chiamate concorrenti non si bloccano.
9. La cancellazione termina il worker.
10. stdout resta pulito.
11. Nessuna scrittura implicita.
12. Un rifiuto `E_RUN` conserva il messaggio esatto e non crea `resultId` né cache.
13. Un rifiuto non restituisce mai tabelle o grafici vuoti come se fosse un successo.
14. Un rifiuto include `diagnostics` con check, problemi e conteggi, senza celle o valori liberi.
15. `npm run check` e `npm run test:mcp` verdi.

---

## 13. Fasi di implementazione

### Fase 0 — Engine condiviso

- completare `src/engine/`;
- test di import Node;
- nessuna dipendenza MCP.

**Gate:** CLI e test engine verdi.

### Fase 1 — MCP MVP

- installare SDK e Zod;
- `serveStdio`;
- `engine_info`, `list_analyses`, `describe_analysis`, `inspect_dataset`;
- test handshake e tools/list.

**Gate:** server avviabile e cataloghi corretti.

### Fase 2 — Esecuzione

- `run_analysis`;
- cache e `resultId`;
- errori;
- test su iris e plantgrowth.

**Gate:** risultato strutturato e `isError` corretti.

### Fase 3 — Risultati grandi e grafici

- `get_result`;
- paginazione/troncamento;
- `render_chart` SVG;
- `validate_project`.

**Gate:** risultati grandi senza superare i limiti; SVG valido.

### Fase 4 — Worker, sicurezza e packaging

- pool heavy;
- cancellazione;
- root/symlink/limiti;
- build esbuild;
- configurazione host;
- CI.

**Gate:** concorrenza, path, stdout pulito, build verde.

---

## 14. Rischi e mitigazioni

| Rischio | Mitigazione |
|---|---|
| SDK v2 non compatibile col bundle | esternalizzare l’SDK; testare `serveStdio` |
| stdout contaminato | vietare `console.log`; test che cattura stdout |
| richieste heavy bloccano stdio | worker pool; timeout; coda |
| risultati troppo grandi | cache, sezioni, limiti, `get_result` |
| path traversal | realpath + root + symlink check |
| dati sensibili nei log | log strutturato senza celle |
| cache incontrollata | TTL, LRU, max 20 MB |
| cancellazione non affidabile | terminate worker; test dedicato |
| differenze Windows | CI Windows e test path |
| doppia logica CLI/MCP | engine unico; nessun spawn della CLI |

---

## 15. Sequenza commit consigliata

1. `feat(engine): API condivisa e catalog`
2. `feat(mcp): server stdio e catalogo`
3. `feat(mcp): run_analysis e structuredContent`
4. `feat(mcp): cache e get_result`
5. `feat(mcp): render_chart e validazione progetto`
6. `feat(mcp): worker, cancellazione e limiti`
7. `build(mcp): bundle e bin`
8. `test(mcp): integrazione SDK`
9. `docs(mcp): configurazione host`

---

## 16. Decisioni aperte

1. Il server deve accettare solo path o anche dataset inline?
2. Il default di `include` deve contenere le tabelle o solo il summary?
3. Quanti risultati tenere in cache e per quanto tempo?
4. Il server deve poter scrivere report su disco con un opt-in esplicito?
5. `wizard` va esposto come tool nascosto o solo come compatibilità?
6. Il prompt `choose-analysis` è necessario nella prima versione?
7. PNG è un requisito o l’SVG basta?
8. Il server deve essere pubblicato come pacchetto separato?

---

## 17. Riferimenti

- `src/analyses/runners.ts` — 72 runner.
- `src/analyses/registry.ts` — catalogo e metadati.
- `src/analyses/types.ts` — `AnalysisRunResult`.
- `src/analyses/params.ts` — validazione riferimenti.
- `src/analyses/paramsSnapshot.ts` — chiavi dei parametri.
- `src/io/project/index.ts` — `parseProject`.
- `src/io/project/parse.ts` — `parseParams`.
- `src/io/readers.ts` — loader tabellari.
- `src/io/statfiles.ts` — SPSS/Stata.
- `src/stats/charts.ts` — modelli grafici.
- `src/charts/vega/buildSpec.ts` — compilazione Vega-Lite.
- `src/io/reportExport.ts` — documento HTML.
- `src/analyses/worker/heavyIds.ts` — analisi heavy.
- `docs/CHART-ENGINE.md` — contratto del motore grafico.
