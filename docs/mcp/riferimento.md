# Riferimento MCP

<!-- Generato da scripts/export-docs.mjs: non modificare a mano. -->

Sorgente: `src/mcp/guide.ts`. La guida runtime è servita da `lazstats://help` e dai topic `lazstats://help/{topic}`.

## Workflow

1. Call engine_info when you need capabilities, limits or help topics.
2. Call list_analyses to choose a runnable analysis id; do not invent ids.
3. Call describe_analysis for the chosen id to read roles, defaults and exampleSet.
4. Call inspect_dataset to verify column names, types, levels and missing codes.
5. Call run_analysis with exactly one source and keep the returned resultId.
6. Use get_result for more tables/report pages and render_chart for a chart; validate_project before projectPath runs.

## Regole

- Read-only: the server never writes files, starts a shell, uses the network or evaluates code.
- run_analysis and inspect_dataset accept exactly one source: dataPath, projectPath or data (inspect uses path/dataPath or data).
- All paths are confined to LAZSTATS_MCP_ROOT (or --root); symlinks that escape it are rejected.
- Keep resultId values: tables, report sections and charts are read from the in-memory cache.
- The cache is LRU, holds at most 20 results / 20 MB for 10 minutes; only successful runs are cached.
- When an analysis is rejected, isError is true, no resultId is returned and nothing is cached.
- Use reportLocale and ciLevel explicitly when the user asks for a specific language or confidence level.

## Tool

### engine_info

Read engine version, runnable counts, MCP limits and documentation links; optionally return help text.

**Quando:** Call first when you need capabilities, limits or versions. If your host does not expose resources or prompts, use help:true for the full guide or topic:'errors' for one section.

**Argomenti:**
- help?: true returns the full agent guide in documentation.guideText.
- topic?: one topic id; returns documentation.topic with its Markdown body.

**Restituisce:**
- engine/version
- runners and chartKinds
- catalogVisible and hidden analyses
- limits
- documentation.guide and topics
- documentation.guideText when help is true
- documentation.topic when topic is provided

**Prossimo passo:** list_analyses

### list_analyses

List runnable analyses with id, label, family, description, cost and hidden flag.

**Quando:** Use to discover a procedure before describing or running it.

**Argomenti:**
- query?: case-insensitive text across id, label, description and family.
- family?: family id or family label.
- includeHidden?: include `wizard` (default false).
- limit?: 1..200, default 100.

**Restituisce:**
- total and catalogTotal
- shown and hasMore
- analyses[]

**Prossimo passo:** describe_analysis

### describe_analysis

Return one analysis contract: roles, fields, defaults and an exampleSettings string.

**Quando:** Call before run_analysis; never guess role keys or parameter names.

**Argomenti:**
- analysisId: required analysis id from list_analyses.

**Restituisce:**
- paramsKey
- defaultParams
- fields
- roles with column indices
- exampleSet
- prerequisites

**Prossimo passo:** inspect_dataset

### inspect_dataset

Read dataset metadata and a small preview without running an analysis.

**Quando:** Use before choosing columns or building params; verify names, types and levels.

**Argomenti:**
- Provide exactly one of path/dataPath or data.
- path or dataPath: file confined to the MCP root.
- data: inline JSON table; at most 1 MiB and 2000 rows.
- format?, delimiter?, header?/hasHeader?, decimalComma?, sheet?, types?, missing?.
- maxRows?: up to 50000; previewRows?: 1..20, default 5.

**Restituisce:**
- source, format, sha256
- rows, columns, truncated
- columnsMeta
- preview

**Prossimo passo:** run_analysis

### run_analysis

Run one analysis and cache the result under a resultId.

**Quando:** Use after describing the analysis and inspecting the columns.

**Argomenti:**
- Provide exactly one of dataPath, projectPath or data.
- analysisId: required with dataPath/data; optional with projectPath (uses the saved active analysis).
- params?: partial ProjectParams merged over the project/base params.
- set?: role/parameter overrides; lists use arrays or comma-separated strings.
- ciLevel?: 0..100; values above 1 are divided by 100. Default 0.95 or project CI.
- reportLocale?: report language; default `it` or project language.
- include?: any of summary, tables, report, charts; default summary+tables+report.
- diagnostics?: none|summary|full; timeoutMs?: 100..600000, default 120000; workers?: auto|0|N.

**Restituisce:**
- resultId (null if too large to cache)
- summary
- included tables/report/charts
- warnings, timings, elapsedMs

**Prossimo passo:** get_result or render_chart

### get_result

Read one section of a cached result, with pagination.

**Quando:** Use after run_analysis when the initial payload omitted detail or you need another table/report page.

**Argomenti:**
- resultId: required id returned by run_analysis.
- section?: summary|tables|report|charts|all; default summary.
- tableId?: read one table when section=tables.
- offset?: zero-based row/section offset; limit?: 1..200, default 50.

**Restituisce:**
- result metadata
- requested section
- pagination fields when applicable

**Prossimo passo:** render_chart

### render_chart

Render one cached chart as SVG or return the compiled Vega-Lite specification.

**Quando:** Use after run_analysis or get_result(charts) to display or inspect a chart.

**Argomenti:**
- resultId: required cached result id.
- chartId: required id from the result chart list.
- format?: svg|spec; default svg.

**Restituisce:**
- mediaType
- svg or spec

### validate_project

Validate a .lzs project and return its metadata without modifying or running it.

**Quando:** Use before projectPath runs, or to confirm a project is readable and which analysis it stores.

**Argomenti:**
- Provide exactly one of path or projectPath, confined to the MCP root.

**Restituisce:**
- valid
- version and migration
- shape
- activeAnalysis
- paramKeys
- outputCount
- sha256

**Prossimo passo:** run_analysis with projectPath

## Errori

| Codice | Causa | Recupero |
| --- | --- | --- |
| `E_ARGS` | Missing or conflicting arguments, unknown help/source/table/chart, invalid CI or an unknown command. | Re-read the tool schema and the relevant help topic; provide exactly one valid source and required ids. |
| `E_ANALYSIS` | Unknown or non-runnable analysis, including the UI-only `assistant`. | Call list_analyses and use an id returned there; verify with describe_analysis. |
| `E_PARAMS` | Unknown column or parameter, ambiguous column, wrong type or missing required role. | Call inspect_dataset and describe_analysis; use exact column names and role keys, then retry run_analysis. |
| `E_DATA` | Missing file, path outside root, symlink escape, unsupported format, too many columns or an oversized file. | Use a path inside LAZSTATS_MCP_ROOT, check the format/size limits and inspect the file again. |
| `E_RUN` | The analysis runner rejected the request (for example incompatible data or a failed preflight). | Read diagnostics and the error message, fix the data/parameters, then run again. No resultId is cached on rejection. |
| `E_INTERNAL` | Unexpected engine or server failure. | Retry once with the same requestId/resultId semantics; if it repeats, report the message and stage. |
| `E_TIMEOUT` | The analysis exceeded timeoutMs. | Retry with a larger timeoutMs (up to 600000) or a smaller dataset/worker count. |
| `E_CANCELLED` | The MCP client cancelled the request. | Re-issue the request only if the user still wants the result. |
| `E_BUSY` | More than 4 runs are active and the 16-slot queue is full. | Wait for an active run to finish and retry; do not start parallel duplicates. |
| `E_RESULT_EXPIRED` | The resultId is unknown or its 10-minute cache entry expired. | Run the analysis again to obtain a new resultId; results are never persisted. |

## Topic di help

| Topic | Contenuto |
| --- | --- |
| `overview` | Transport, scope, tool map and the eight-tool contract. |
| `workflow` | The recommended order from catalog discovery to chart rendering. |
| `data` | Accepted sources, inline data, path confinement and limits. |
| `run` | Parameters, source rules, CI, locale, workers, timeout and cancellation. |
| `results` | Sections, pagination, table/chart ids and result expiry. |
| `charts` | Chart discovery, SVG rendering and Vega-Lite specs. |
| `projects` | Validating and running .lzs projects. |
| `errors` | Every error code with its likely cause and recovery action. |
| `paths` | Root, absolute/relative paths, symlinks and file limits. |
| `limits` | Numeric limits for inputs, runs, outputs and cache. |
