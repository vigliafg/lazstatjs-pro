# Riferimento CLI

<!-- Generato da scripts/export-docs.mjs: non modificare a mano. -->

Sorgente: `src/cli/spec.ts`. Headless LazStats statistical engine: catalog, datasets, analyses, batch runs and reports.

## Comandi

| Comando | Scopo |
| --- | --- |
| `analyses` | List the runnable analysis catalog. |
| `schema` | Show one analysis contract: roles, defaults and example parameters. |
| `inspect` | Inspect a dataset without running an analysis. |
| `run` | Run one analysis from a dataset or a project. |
| `project` | Inspect or run a `.lzs` project. |
| `project inspect` | Validate a project and print its metadata. |
| `project run` | Run the saved analysis of a project. |
| `batch` | Run multiple jobs from a JSON file into separate directories. |
| `render` | Render an existing successful JSON envelope. |

## Opzioni globali

Tutte le opzioni sono derivate dal catalogo usato dal parser. Ogni comando accetta solo le opzioni elencate nella propria sezione.

| Opzione | Descrizione |
| --- | --- |
| `--help` | Show this help or the help of the selected command, then exit. |
| `--version` | Print the CLI version and exit. |
| `--json` | Emit machine-readable JSON on stdout. |
| `--verbose` | Print stack traces for failures and parameter roles in `analyses`. |
| `--quiet` | Suppress non-essential console notices (written output paths). |
| `--family <id>` | Filter the catalog by family id or family label. |
| `--all` | Include hidden catalog entries (currently `wizard`). |
| `--rows <n>` | Preview rows for `inspect`; capped at 50000.; default: 5 |
| `--format-input <format>` | Force the input reader instead of detecting it from the extension.; scelte: csv, tsv, json, xlsx, sav, dta |
| `--delimiter <char>` | Delimiter for delimited text input. |
| `--header` | Treat the first row as the header when reading text input. |
| `--no-header` | Treat the first row as data when reading text input. |
| `--decimal-comma` | Read numeric values that use a comma as decimal separator. |
| `--sheet <name\|index>` | Select an Excel worksheet by name or zero-based index. |
| `--types <name:type,...>` | Override inferred column types, for example `Age:int,Score:num`. |
| `--missing <name:code,...>` | Declare missing-value codes per column, for example `Age:-9`. |
| `--max-rows <n>` | Keep at most n rows while inspecting a dataset (1..50000). |
| `--data <file>` | Dataset source for `run` (CSV, TSV, JSON, XLSX, SAV or DTA). |
| `--project <file.lzs>` | LazStats project source for `run`; alternative to `--data`. |
| `--analysis <id>` | Analysis id from `analyses`; required with `--data`. |
| `--params <json>` | Partial or full ProjectParams object merged over the project base. |
| `--params-file <file>` | Read the ProjectParams override from a JSON file instead of `--params`. |
| `--set <key=value>` | Repeatable parameter override applied after `--params`. Lists use commas; `@index` selects a column by position.; ripetibile |
| `--ci <90\|95\|99>` | Confidence level for the run.; scelte: 90, 95, 99; default: project value, else 95 |
| `--report-locale <locale>` | Language of the written report and table labels.; scelte: it, en, fr, es, de, pt-PT; default: project value, else it |
| `--format <format>` | Output format of the run or render command.; scelte: json, md, html, xlsx, svg; default: json for run; html for render |
| `--out <file\|directory>` | Write the output to this path. XLSX and SVG require it; a directory receives the standard filename. |
| `--charts <none\|svg>` | Include SVG charts in HTML/SVG output.; scelte: none, svg; default: svg for html/svg, else none |
| `--include-data` | Include the full grid in the JSON envelope. |
| `--include-data-sheet` | Add a data worksheet to XLSX output. |
| `--timestamps` | Add `generatedAt` to the envelope. |
| `--diagnostics <mode>` | Diagnostics detail included in failure envelopes.; scelte: none, summary, full; default: summary |
| `--include-row-numbers` | Add at most 20 incomplete row numbers to diagnostics. |
| `--timings` | Add load, parameter, run and render timings to the envelope. |
| `--timeout <seconds>` | Per-run timeout for heavy analyses.; default: 120 |
| `--workers <auto\|0\|N>` | Worker pool size; 0 runs on the main thread.; default: auto |
| `--jobs <file.json>` | Batch jobs file: `{ "jobs": [...] }` or a job array. |
| `--concurrency <n>` | Parallel batch jobs (1..64).; default: 2 |
| `--continue-on-error` | Keep running the remaining batch jobs after a failure. |
| `--result <file>` | Successful JSON envelope to render. |

## analyses

List the runnable analysis catalog.

Uso: `lazstats analyses [--json] [--family <id>] [--all]`

Prints 71 visible procedures by default; `--all` adds the hidden `wizard`. Use `--json` for automation and `--verbose` to show role keys.

| Opzione | Descrizione |
| --- | --- |
| `--json` | Emit machine-readable JSON on stdout. |
| `--family <id>` | Filter the catalog by family id or family label. |
| `--all` | Include hidden catalog entries (currently `wizard`). |
| `--verbose` | Print stack traces for failures and parameter roles in `analyses`. |

Esempi:

- `lazstats analyses`
- `lazstats analyses --json`
- `lazstats analyses --family regression --json`
- `lazstats analyses --all --verbose`

Note:

- `assistant` is a UI workflow, not a runnable procedure and is never listed.
- Use the id with `schema` and `run`.

## schema

Show one analysis contract: roles, defaults and example parameters.

Uso: `lazstats schema <analysisId> [--json]`

Returns the parameter key, editable fields, default parameters, roles and an `exampleSet` string ready for `run --set`.

| Argomento | Obbligatorio | Descrizione |
| --- | --- | --- |
| `analysisId` | sì | Analysis id from `analyses`. |

| Opzione | Descrizione |
| --- | --- |
| `--json` | Emit machine-readable JSON on stdout. |
| `--verbose` | Print stack traces for failures and parameter roles in `analyses`. |

Esempi:

- `lazstats schema regression`
- `lazstats schema regression --json`

Note:

- Always read the schema before constructing `--set` overrides.

## inspect

Inspect a dataset without running an analysis.

Uso: `lazstats inspect <file> [options]`

Reads the dataset, reports shape, format, SHA-256, column types and metadata, and prints a bounded preview.

| Argomento | Obbligatorio | Descrizione |
| --- | --- | --- |
| `file` | sì | Dataset path. |

| Opzione | Descrizione |
| --- | --- |
| `--json` | Emit machine-readable JSON on stdout. |
| `--rows <n>` | Preview rows for `inspect`; capped at 50000.; default: 5 |
| `--max-rows <n>` | Keep at most n rows while inspecting a dataset (1..50000). |
| `--format-input <format>` | Force the input reader instead of detecting it from the extension.; scelte: csv, tsv, json, xlsx, sav, dta |
| `--delimiter <char>` | Delimiter for delimited text input. |
| `--header` | Treat the first row as the header when reading text input. |
| `--no-header` | Treat the first row as data when reading text input. |
| `--decimal-comma` | Read numeric values that use a comma as decimal separator. |
| `--sheet <name\|index>` | Select an Excel worksheet by name or zero-based index. |
| `--types <name:type,...>` | Override inferred column types, for example `Age:int,Score:num`. |
| `--missing <name:code,...>` | Declare missing-value codes per column, for example `Age:-9`. |
| `--verbose` | Print stack traces for failures and parameter roles in `analyses`. |

Esempi:

- `lazstats inspect samples/descriptive/iris/data.csv`
- `lazstats inspect data.xlsx --sheet Results --rows 10 --json`
- `lazstats inspect data.csv --types Age:int,Score:num --missing Age:-9`

Note:

- `--max-rows` limits how much of the file is loaded; `--rows` only limits the preview.
- Column names shown here are the names accepted by `--set`.

## run

Run one analysis from a dataset or a project.

Uso: `lazstats run (--data <file> --analysis <id> | --project <file.lzs> [--analysis <id>]) [options]`

Loads exactly one source, builds parameters, runs the analysis and writes a JSON envelope or a rendered report.

| Opzione | Descrizione |
| --- | --- |
| `--json` | Emit machine-readable JSON on stdout. |
| `--data <file>` | Dataset source for `run` (CSV, TSV, JSON, XLSX, SAV or DTA). |
| `--project <file.lzs>` | LazStats project source for `run`; alternative to `--data`. |
| `--analysis <id>` | Analysis id from `analyses`; required with `--data`. |
| `--params <json>` | Partial or full ProjectParams object merged over the project base. |
| `--params-file <file>` | Read the ProjectParams override from a JSON file instead of `--params`. |
| `--set <key=value>` | Repeatable parameter override applied after `--params`. Lists use commas; `@index` selects a column by position.; ripetibile |
| `--ci <90\|95\|99>` | Confidence level for the run.; scelte: 90, 95, 99; default: project value, else 95 |
| `--report-locale <locale>` | Language of the written report and table labels.; scelte: it, en, fr, es, de, pt-PT; default: project value, else it |
| `--format-input <format>` | Force the input reader instead of detecting it from the extension.; scelte: csv, tsv, json, xlsx, sav, dta |
| `--delimiter <char>` | Delimiter for delimited text input. |
| `--header` | Treat the first row as the header when reading text input. |
| `--no-header` | Treat the first row as data when reading text input. |
| `--decimal-comma` | Read numeric values that use a comma as decimal separator. |
| `--sheet <name\|index>` | Select an Excel worksheet by name or zero-based index. |
| `--types <name:type,...>` | Override inferred column types, for example `Age:int,Score:num`. |
| `--missing <name:code,...>` | Declare missing-value codes per column, for example `Age:-9`. |
| `--format <format>` | Output format of the run or render command.; scelte: json, md, html, xlsx, svg; default: json for run; html for render |
| `--out <file\|directory>` | Write the output to this path. XLSX and SVG require it; a directory receives the standard filename. |
| `--charts <none\|svg>` | Include SVG charts in HTML/SVG output.; scelte: none, svg; default: svg for html/svg, else none |
| `--include-data` | Include the full grid in the JSON envelope. |
| `--include-data-sheet` | Add a data worksheet to XLSX output. |
| `--timestamps` | Add `generatedAt` to the envelope. |
| `--diagnostics <mode>` | Diagnostics detail included in failure envelopes.; scelte: none, summary, full; default: summary |
| `--include-row-numbers` | Add at most 20 incomplete row numbers to diagnostics. |
| `--timings` | Add load, parameter, run and render timings to the envelope. |
| `--quiet` | Suppress non-essential console notices (written output paths). |
| `--verbose` | Print stack traces for failures and parameter roles in `analyses`. |
| `--timeout <seconds>` | Per-run timeout for heavy analyses.; default: 120 |
| `--workers <auto\|0\|N>` | Worker pool size; 0 runs on the main thread.; default: auto |

Esempi:

- `lazstats run --data samples/descriptive/iris/data.csv --analysis descriptive --set descVars=Sepal.Length,Sepal.Width`
- `lazstats run --data data.csv --analysis regression --set reg.y=Score --set reg.x=Age --json`
- `lazstats run --project project.lzs --format html --out report.html`
- `lazstats run --data data.csv --analysis ttest --format xlsx --out results/`

Note:

- Provide exactly one of `--data` and `--project`.
- Parameters are resolved in this order: project base, `--params`/`--params-file`, then repeated `--set` in command-line order.
- `--params` and `--params-file` are mutually exclusive.
- `--format json` writes the envelope to stdout or `--out`; XLSX and SVG require `--out`.
- A rejected run exits with 2/3/4/5 and writes a failure envelope, never a fake result.

## project

Inspect or run a `.lzs` project.

Uso: `lazstats project <inspect|run> <file.lzs> [options]`

`project inspect` validates and describes a project without running it; `project run` loads the saved grid, parameters and settings and runs one analysis.

| Argomento | Obbligatorio | Descrizione |
| --- | --- | --- |
| `file.lzs` | sì | LazStats project file. |

| Opzione | Descrizione |
| --- | --- |
| `--json` | Emit machine-readable JSON on stdout. |
| `--verbose` | Print stack traces for failures and parameter roles in `analyses`. |

Esempi:

- `lazstats project inspect project.lzs --json`
- `lazstats project run project.lzs --format html --out report.html`

Note:

- Use `project run` rather than `run --project`; both are equivalent.

## project inspect

Validate a project and print its metadata.

Uso: `lazstats project inspect <file.lzs> [--json]`

Reads the project, applies migrations in memory, and reports version, shape, active analysis, parameter keys, saved outputs and SHA-256.

| Argomento | Obbligatorio | Descrizione |
| --- | --- | --- |
| `file.lzs` | sì | LazStats project file. |

| Opzione | Descrizione |
| --- | --- |
| `--json` | Emit machine-readable JSON on stdout. |
| `--verbose` | Print stack traces for failures and parameter roles in `analyses`. |

Esempi:

- `lazstats project inspect project.lzs`
- `lazstats project inspect project.lzs --json`

Note:

- Read-only: the file is never modified.

## project run

Run the saved analysis of a project.

Uso: `lazstats project run <file.lzs> [options]`

Loads the project grid, saved parameters, confidence level and report language, optionally overriding the analysis and parameters.

| Argomento | Obbligatorio | Descrizione |
| --- | --- | --- |
| `file.lzs` | sì | LazStats project file. |

| Opzione | Descrizione |
| --- | --- |
| `--json` | Emit machine-readable JSON on stdout. |
| `--analysis <id>` | Analysis id from `analyses`; required with `--data`. |
| `--params <json>` | Partial or full ProjectParams object merged over the project base. |
| `--params-file <file>` | Read the ProjectParams override from a JSON file instead of `--params`. |
| `--set <key=value>` | Repeatable parameter override applied after `--params`. Lists use commas; `@index` selects a column by position.; ripetibile |
| `--ci <90\|95\|99>` | Confidence level for the run.; scelte: 90, 95, 99; default: project value, else 95 |
| `--report-locale <locale>` | Language of the written report and table labels.; scelte: it, en, fr, es, de, pt-PT; default: project value, else it |
| `--format-input <format>` | Force the input reader instead of detecting it from the extension.; scelte: csv, tsv, json, xlsx, sav, dta |
| `--delimiter <char>` | Delimiter for delimited text input. |
| `--header` | Treat the first row as the header when reading text input. |
| `--no-header` | Treat the first row as data when reading text input. |
| `--decimal-comma` | Read numeric values that use a comma as decimal separator. |
| `--sheet <name\|index>` | Select an Excel worksheet by name or zero-based index. |
| `--types <name:type,...>` | Override inferred column types, for example `Age:int,Score:num`. |
| `--missing <name:code,...>` | Declare missing-value codes per column, for example `Age:-9`. |
| `--format <format>` | Output format of the run or render command.; scelte: json, md, html, xlsx, svg; default: json for run; html for render |
| `--out <file\|directory>` | Write the output to this path. XLSX and SVG require it; a directory receives the standard filename. |
| `--charts <none\|svg>` | Include SVG charts in HTML/SVG output.; scelte: none, svg; default: svg for html/svg, else none |
| `--include-data` | Include the full grid in the JSON envelope. |
| `--include-data-sheet` | Add a data worksheet to XLSX output. |
| `--timestamps` | Add `generatedAt` to the envelope. |
| `--diagnostics <mode>` | Diagnostics detail included in failure envelopes.; scelte: none, summary, full; default: summary |
| `--include-row-numbers` | Add at most 20 incomplete row numbers to diagnostics. |
| `--timings` | Add load, parameter, run and render timings to the envelope. |
| `--quiet` | Suppress non-essential console notices (written output paths). |
| `--verbose` | Print stack traces for failures and parameter roles in `analyses`. |
| `--timeout <seconds>` | Per-run timeout for heavy analyses.; default: 120 |
| `--workers <auto\|0\|N>` | Worker pool size; 0 runs on the main thread.; default: auto |

Esempi:

- `lazstats project run project.lzs`
- `lazstats project run project.lzs --analysis regression --format md`
- `lazstats project run project.lzs --set descVars=Score --timings --json`

Note:

- Without `--analysis`, the saved active analysis is used; the UI Assistant is rejected.
- Project settings supply the default CI level and report language.

## batch

Run multiple jobs from a JSON file into separate directories.

Uso: `lazstats batch --jobs <file.json> --out <directory> [options]`

Each job runs through the same `run` path and writes its own `result.json` or `failure.json` under `<out>/<job.id>/`.

| Opzione | Descrizione |
| --- | --- |
| `--jobs <file.json>` | Batch jobs file: `{ "jobs": [...] }` or a job array. |
| `--out <file\|directory>` | Write the output to this path. XLSX and SVG require it; a directory receives the standard filename. |
| `--concurrency <n>` | Parallel batch jobs (1..64).; default: 2 |
| `--continue-on-error` | Keep running the remaining batch jobs after a failure. |
| `--workers <auto\|0\|N>` | Worker pool size; 0 runs on the main thread.; default: auto |
| `--timeout <seconds>` | Per-run timeout for heavy analyses.; default: 120 |
| `--diagnostics <mode>` | Diagnostics detail included in failure envelopes.; scelte: none, summary, full; default: summary |
| `--include-row-numbers` | Add at most 20 incomplete row numbers to diagnostics. |
| `--verbose` | Print stack traces for failures and parameter roles in `analyses`. |

Esempi:

- `lazstats batch --jobs jobs.json --out results`
- `lazstats batch --jobs jobs.json --out results --concurrency 4 --continue-on-error`

Note:

- Jobs file: `{ "jobs": [{ "id": "descriptive", "data": "data.csv", "analysis": "descriptive", "set": { "descVars": ["Score"] } }] }` or a bare array.
- A job needs `data` or `project`; `id` must be unique and safe as a directory name.
- Exit codes: 0 all ok, 2 partial failure, 3 data failure, 4 internal failure, 5 timeout.

## render

Render an existing successful JSON envelope.

Uso: `lazstats render --result <file> [--format md|html|xlsx|svg] [--out PATH]`

Reads a successful `run` envelope and produces Markdown, HTML, XLSX or SVG charts without recomputing the analysis.

| Opzione | Descrizione |
| --- | --- |
| `--result <file>` | Successful JSON envelope to render. |
| `--format <format>` | Output format of the run or render command.; scelte: json, md, html, xlsx, svg; default: json for run; html for render |
| `--out <file\|directory>` | Write the output to this path. XLSX and SVG require it; a directory receives the standard filename. |
| `--charts <none\|svg>` | Include SVG charts in HTML/SVG output.; scelte: none, svg; default: svg for html/svg, else none |
| `--include-data-sheet` | Add a data worksheet to XLSX output. |
| `--quiet` | Suppress non-essential console notices (written output paths). |
| `--verbose` | Print stack traces for failures and parameter roles in `analyses`. |

Esempi:

- `lazstats render --result result.json --format md`
- `lazstats render --result result.json --format xlsx --out report.xlsx`
- `lazstats render --result result.json --format svg --out charts/`

Note:

- Only envelopes with `status: "ok"` are accepted.
- XLSX and SVG require `--out`; SVG writes one file per chart into a directory.

## Codici di uscita

| Codice | Significato |
| --- | --- |
| 0 | Success. |
| 2 | Invalid arguments, unknown analysis, parameter rejection or a rejected run. |
| 3 | Dataset, project or file error. |
| 4 | Internal error. |
| 5 | Analysis timeout. |
