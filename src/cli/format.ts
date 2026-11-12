import { analysisSchema } from '../engine';
import type {
  AnalysisSchema,
  CatalogEntry,
  LoadedDataset,
  ProjectInspection,
} from '../engine';
import type { CliIo } from './types';

export const printHelp = (io: CliIo, version: string): void => {
  io.out(`lazstats ${version} — statistical engine CLI

Usage:
  lazstats analyses [--json] [--family <id>] [--all]
  lazstats schema <analysisId> [--json]
  lazstats inspect <file> [--json] [--rows N] [--sheet NAME|INDEX]
  lazstats project inspect <file.lzs> [--json]
  lazstats project run <file.lzs> [options]
  lazstats run --data <file> --analysis <id> [options]
  lazstats run --project <file.lzs> [--analysis <id>] [options]
  lazstats batch --jobs <file.json> --out <directory> [options]
  lazstats render --result <file> [--format md|html|xlsx|svg] [--out PATH]

Input options:
  --format-input <format>    Force csv|tsv|json|xlsx|sav|dta
  --max-rows <n>             Keep at most n rows for inspect

Run options:
  --set <key=value>          Repeatable parameter override
  --params <json>            Partial/full ProjectParams object
  --params-file <file>       JSON parameter file
  --ci 90|95|99              Confidence level (default 95)
  --format json|md|html|xlsx|svg  Output format (default json)
  --out <file|directory>     Write the result; required for xlsx/svg
  --charts none|svg          Charts in HTML/SVG (default svg for html/svg)
  --include-data             Include the grid in the JSON envelope
  --include-data-sheet       Add the data sheet to XLSX output
  --timestamps               Add generatedAt
  --diagnostics <mode>       none|summary|full (default summary)
  --include-row-numbers      Add at most 20 incomplete row numbers to diagnostics
  --timings                  Add phase timings to the envelope
  --quiet                    Suppress non-essential console notices
  --verbose                  Print stack traces for errors
  --timeout <seconds>        Per-run timeout for heavy analyses (default 120)
  --workers auto|0|N         Worker pool size (default auto; 0 = main thread)

Batch options:
  --jobs <file>              JSON object {"jobs":[...]} or a job array
  --out <directory>          Required output root; each job gets a subdirectory
  --concurrency <n>          Parallel jobs (default 2)
  --continue-on-error        Keep running after a failed job

Examples:
  lazstats analyses --json
  lazstats schema regression --json
  lazstats inspect samples/descriptive/iris/data.csv
  lazstats project inspect project.lzs --json
  lazstats project run project.lzs --format html --out report.html
  lazstats run --data samples/descriptive/iris/data.csv --analysis descriptive --set descVars=Sepal.Length,Sepal.Width
  lazstats run --data samples/descriptive/iris/data.csv --analysis descriptive --format html --out report.html
  lazstats batch --jobs jobs.json --out results --concurrency 2 --continue-on-error
  lazstats render --result result.json --format svg --out charts/
`);
};

export const printAnalyses = (
  entries: CatalogEntry[],
  json: boolean,
  io: CliIo,
  verbose = false
): void => {
  if (json) {
    io.out(`${JSON.stringify({ total: entries.length, analyses: entries }, null, 2)}\n`);
    return;
  }
  for (const entry of entries) {
    const schema = verbose ? analysisSchema(entry.id) : null;
    const roles = schema?.roles.map(role => role.key).join(', ') || '(none)';
    io.out(
      `${entry.id.padEnd(18)} ${entry.label.padEnd(28)} ${entry.family.padEnd(14)} ${entry.cost}${
        verbose ? `  params: ${roles}` : ''
      }\n`
    );
  }
};

export const printSchema = (schema: AnalysisSchema | null, json: boolean, io: CliIo): void => {
  if (!schema) return;
  if (json) {
    io.out(`${JSON.stringify(schema, null, 2)}\n`);
    return;
  }
  io.out(`${schema.id} — ${schema.label}\n`);
  io.out(`Family: ${schema.family}   Cost: ${schema.cost}\n`);
  io.out(`${schema.description}\n\n`);
  io.out(`Params key: ${schema.paramsKey ?? '(none)'}\n`);
  io.out(`Editable fields: ${schema.fields.join(', ') || '(none)'}\n`);
  io.out(`Example: ${schema.exampleSet}\n`);
  io.out(`Defaults: ${JSON.stringify(schema.defaultParams)}\n`);
  if (schema.roles.length > 0) {
    io.out('Roles:\n');
    for (const role of schema.roles) {
      io.out(`  ${role.key.padEnd(14)} ${role.kind.padEnd(10)} ${role.label}\n`);
    }
  }
};

export const printProjectInspect = (
  inspection: ProjectInspection,
  json: boolean,
  io: CliIo
): void => {
  if (json) {
    io.out(`${JSON.stringify(inspection, null, 2)}\n`);
    return;
  }
  io.out(`Project: ${inspection.source}\n`);
  io.out(
    `Version: ${inspection.version}${
      inspection.fileVersion !== null && inspection.fileVersion !== inspection.version
        ? ` (file: ${inspection.fileVersion}, migrated)`
        : ''
    }\n`
  );
  io.out(`Saved: ${inspection.savedAt}\n`);
  io.out(`Rows: ${inspection.rows}   Columns: ${inspection.columns}\n`);
  if (inspection.datasetId || inspection.dataRevision !== undefined) {
    io.out(
      `Dataset: ${inspection.datasetId ?? '(none)'}${
        inspection.dataRevision !== undefined ? `  Revision: ${inspection.dataRevision}` : ''
      }\n`
    );
  }
  io.out(`Active analysis: ${inspection.activeAnalysis}\n`);
  io.out(`Params keys: ${inspection.paramKeys.join(', ') || '(none)'}\n`);
  io.out(`Saved outputs: ${inspection.outputCount}\n`);
  if (inspection.ignoredFields.length > 0) {
    io.out(`Ignored fields: ${inspection.ignoredFields.join(', ')}\n`);
  }
  io.out(`SHA-256: ${inspection.sha256}\n`);
};

export const printInspect = (
  loaded: LoadedDataset,
  previewRows: number,
  json: boolean,
  io: CliIo
): void => {
  const columns = loaded.grid.cols.map((col, index) => ({
    index,
    name: col.name,
    type: col.type,
    ...(col.label ? { label: col.label } : {}),
    ...(col.missing ? { missing: col.missing } : {}),
    ...(col.levels ? { levels: col.levels } : {}),
    ...(col.reference ? { reference: col.reference } : {}),
  }));
  const preview = loaded.table.rows.slice(0, previewRows).map(row => [...row]);
  if (json) {
    io.out(
      `${JSON.stringify(
        {
          source: loaded.source,
          format: loaded.format,
          sha256: loaded.sha256,
          rows: loaded.grid.rows.length,
          columns: loaded.grid.cols.length,
          skippedEmpty: loaded.table.skippedEmpty,
          renamedDupes: loaded.table.renamedDupes,
          truncated: loaded.truncated ?? false,
          columnsMeta: columns,
          preview,
        },
        null,
        2
      )}\n`
    );
    return;
  }
  io.out(`Source: ${loaded.source}\n`);
  io.out(`Format: ${loaded.format}   Rows: ${loaded.grid.rows.length}   Columns: ${loaded.grid.cols.length}\n`);
  io.out(`SHA-256: ${loaded.sha256}\n`);
  if (loaded.truncated) io.out('Rows limited by --max-rows\n');
  if (loaded.table.skippedEmpty > 0) io.out(`Skipped empty rows: ${loaded.table.skippedEmpty}\n`);
  if (loaded.table.renamedDupes > 0) io.out(`Renamed duplicate columns: ${loaded.table.renamedDupes}\n`);
  io.out('\nColumns:\n');
  for (const column of columns) {
    io.out(
      `  ${String(column.index).padStart(2)}  ${column.name.padEnd(24)} ${column.type.padEnd(6)}${
        column.label ? `  ${column.label}` : ''
      }${column.reference ? `  ref=${column.reference}` : ''}\n`
    );
  }
  if (preview.length > 0) {
    io.out('\nPreview:\n');
    io.out(`${loaded.grid.cols.map(col => col.name).join('\t')}\n`);
    for (const row of preview) io.out(`${row.join('\t')}\n`);
  }
};
