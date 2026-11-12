/**
 * Single source of truth for the CLI parser and its help.
 *
 * Adding an option here makes it visible to both `node:util` and every help
 * surface. The tests in `help.test.ts` fail when a command or option disappears
 * from one of them.
 */

export type CliOptionType = 'boolean' | 'string';

export interface CliOptionSpec {
  key: string;
  flag: string;
  type: CliOptionType;
  description: string;
  short?: string;
  multiple?: boolean;
  defaultValue?: string;
  choices?: readonly string[];
  repeatable?: boolean;
}

export interface CliArgumentSpec {
  name: string;
  required: boolean;
  description: string;
}

export interface CliCommandSpec {
  id: string;
  summary: string;
  usage: string;
  description: string;
  arguments: CliArgumentSpec[];
  optionKeys: string[];
  examples: string[];
  notes: string[];
  related?: string[];
}

export interface CliOptionGroup {
  title: string;
  keys: string[];
}

export interface CliExitCode {
  code: number;
  meaning: string;
}

export const CLI_NAME = 'lazstats';

export const CLI_DESCRIPTION =
  'Headless LazStats statistical engine: catalog, datasets, analyses, batch runs and reports.';

export const CLI_OPTIONS: CliOptionSpec[] = [
  {
    key: 'help',
    flag: '--help',
    short: 'h',
    type: 'boolean',
    description: 'Show this help or the help of the selected command, then exit.',
  },
  {
    key: 'version',
    flag: '--version',
    type: 'boolean',
    description: 'Print the CLI version and exit.',
  },
  {
    key: 'json',
    flag: '--json',
    type: 'boolean',
    description: 'Emit machine-readable JSON on stdout.',
  },
  {
    key: 'verbose',
    flag: '--verbose',
    type: 'boolean',
    description: 'Print stack traces for failures and parameter roles in `analyses`.',
  },
  {
    key: 'quiet',
    flag: '--quiet',
    type: 'boolean',
    description: 'Suppress non-essential console notices (written output paths).',
  },
  {
    key: 'family',
    flag: '--family <id>',
    type: 'string',
    description: 'Filter the catalog by family id or family label.',
  },
  {
    key: 'all',
    flag: '--all',
    type: 'boolean',
    description: 'Include hidden catalog entries (currently `wizard`).',
  },
  {
    key: 'rows',
    flag: '--rows <n>',
    type: 'string',
    defaultValue: '5',
    description: 'Preview rows for `inspect`; capped at 50000.',
  },
  {
    key: 'format-input',
    flag: '--format-input <format>',
    type: 'string',
    description: 'Force the input reader instead of detecting it from the extension.',
    choices: ['csv', 'tsv', 'json', 'xlsx', 'sav', 'dta'],
  },
  {
    key: 'delimiter',
    flag: '--delimiter <char>',
    type: 'string',
    description: 'Delimiter for delimited text input.',
  },
  {
    key: 'header',
    flag: '--header',
    type: 'boolean',
    description: 'Treat the first row as the header when reading text input.',
  },
  {
    key: 'no-header',
    flag: '--no-header',
    type: 'boolean',
    description: 'Treat the first row as data when reading text input.',
  },
  {
    key: 'decimal-comma',
    flag: '--decimal-comma',
    type: 'boolean',
    description: 'Read numeric values that use a comma as decimal separator.',
  },
  {
    key: 'sheet',
    flag: '--sheet <name|index>',
    type: 'string',
    description: 'Select an Excel worksheet by name or zero-based index.',
  },
  {
    key: 'types',
    flag: '--types <name:type,...>',
    type: 'string',
    description: 'Override inferred column types, for example `Age:int,Score:num`.',
  },
  {
    key: 'missing',
    flag: '--missing <name:code,...>',
    type: 'string',
    description: 'Declare missing-value codes per column, for example `Age:-9`.',
  },
  {
    key: 'max-rows',
    flag: '--max-rows <n>',
    type: 'string',
    description: 'Keep at most n rows while inspecting a dataset (1..50000).',
  },
  {
    key: 'data',
    flag: '--data <file>',
    type: 'string',
    description: 'Dataset source for `run` (CSV, TSV, JSON, XLSX, SAV or DTA).',
  },
  {
    key: 'project',
    flag: '--project <file.lzs>',
    type: 'string',
    description: 'LazStats project source for `run`; alternative to `--data`.',
  },
  {
    key: 'analysis',
    flag: '--analysis <id>',
    type: 'string',
    description: 'Analysis id from `analyses`; required with `--data`.',
  },
  {
    key: 'params',
    flag: '--params <json>',
    type: 'string',
    description: 'Partial or full ProjectParams object merged over the project base.',
  },
  {
    key: 'params-file',
    flag: '--params-file <file>',
    type: 'string',
    description: 'Read the ProjectParams override from a JSON file instead of `--params`.',
  },
  {
    key: 'set',
    flag: '--set <key=value>',
    type: 'string',
    multiple: true,
    repeatable: true,
    description:
      'Repeatable parameter override applied after `--params`. Lists use commas; `@index` selects a column by position.',
  },
  {
    key: 'ci',
    flag: '--ci <90|95|99>',
    type: 'string',
    defaultValue: 'project value, else 95',
    description: 'Confidence level for the run.',
    choices: ['90', '95', '99'],
  },
  {
    key: 'report-locale',
    flag: '--report-locale <locale>',
    type: 'string',
    defaultValue: 'project value, else it',
    description: 'Language of the written report and table labels.',
    choices: ['it', 'en', 'fr', 'es', 'de', 'pt-PT'],
  },
  {
    key: 'format',
    flag: '--format <format>',
    type: 'string',
    defaultValue: 'json for run; html for render',
    description: 'Output format of the run or render command.',
    choices: ['json', 'md', 'html', 'xlsx', 'svg'],
  },
  {
    key: 'out',
    flag: '--out <file|directory>',
    type: 'string',
    description:
      'Write the output to this path. XLSX and SVG require it; a directory receives the standard filename.',
  },
  {
    key: 'charts',
    flag: '--charts <none|svg>',
    type: 'string',
    defaultValue: 'svg for html/svg, else none',
    description: 'Include SVG charts in HTML/SVG output.',
    choices: ['none', 'svg'],
  },
  {
    key: 'include-data',
    flag: '--include-data',
    type: 'boolean',
    description: 'Include the full grid in the JSON envelope.',
  },
  {
    key: 'include-data-sheet',
    flag: '--include-data-sheet',
    type: 'boolean',
    description: 'Add a data worksheet to XLSX output.',
  },
  {
    key: 'timestamps',
    flag: '--timestamps',
    type: 'boolean',
    description: 'Add `generatedAt` to the envelope.',
  },
  {
    key: 'diagnostics',
    flag: '--diagnostics <mode>',
    type: 'string',
    defaultValue: 'summary',
    description: 'Diagnostics detail included in failure envelopes.',
    choices: ['none', 'summary', 'full'],
  },
  {
    key: 'include-row-numbers',
    flag: '--include-row-numbers',
    type: 'boolean',
    description: 'Add at most 20 incomplete row numbers to diagnostics.',
  },
  {
    key: 'timings',
    flag: '--timings',
    type: 'boolean',
    description: 'Add load, parameter, run and render timings to the envelope.',
  },
  {
    key: 'timeout',
    flag: '--timeout <seconds>',
    type: 'string',
    defaultValue: '120',
    description: 'Per-run timeout for heavy analyses.',
  },
  {
    key: 'workers',
    flag: '--workers <auto|0|N>',
    type: 'string',
    defaultValue: 'auto',
    description: 'Worker pool size; 0 runs on the main thread.',
  },
  {
    key: 'jobs',
    flag: '--jobs <file.json>',
    type: 'string',
    description: 'Batch jobs file: `{ "jobs": [...] }` or a job array.',
  },
  {
    key: 'concurrency',
    flag: '--concurrency <n>',
    type: 'string',
    defaultValue: '2',
    description: 'Parallel batch jobs (1..64).',
  },
  {
    key: 'continue-on-error',
    flag: '--continue-on-error',
    type: 'boolean',
    description: 'Keep running the remaining batch jobs after a failure.',
  },
  {
    key: 'result',
    flag: '--result <file>',
    type: 'string',
    description: 'Successful JSON envelope to render.',
  },
];

export const CLI_OPTION_GROUPS: CliOptionGroup[] = [
  {
    title: 'Global options',
    keys: ['help', 'version', 'json', 'verbose', 'quiet'],
  },
  {
    title: 'Dataset input options',
    keys: [
      'format-input',
      'delimiter',
      'header',
      'no-header',
      'decimal-comma',
      'sheet',
      'types',
      'missing',
      'max-rows',
    ],
  },
  {
    title: 'Catalog and inspection options',
    keys: ['family', 'all', 'rows'],
  },
  {
    title: 'Analysis and parameter options',
    keys: ['data', 'project', 'analysis', 'params', 'params-file', 'set', 'ci', 'report-locale'],
  },
  {
    title: 'Run output options',
    keys: [
      'format',
      'out',
      'charts',
      'include-data',
      'include-data-sheet',
      'timestamps',
      'diagnostics',
      'include-row-numbers',
      'timings',
      'timeout',
      'workers',
    ],
  },
  {
    title: 'Batch options',
    keys: ['jobs', 'concurrency', 'continue-on-error'],
  },
  {
    title: 'Render options',
    keys: ['result'],
  },
];

const runOptionKeys = [
  'json',
  'data',
  'project',
  'analysis',
  'params',
  'params-file',
  'set',
  'ci',
  'report-locale',
  'format-input',
  'delimiter',
  'header',
  'no-header',
  'decimal-comma',
  'sheet',
  'types',
  'missing',
  'format',
  'out',
  'charts',
  'include-data',
  'include-data-sheet',
  'timestamps',
  'diagnostics',
  'include-row-numbers',
  'timings',
  'quiet',
  'verbose',
  'timeout',
  'workers',
];

export const CLI_COMMANDS: CliCommandSpec[] = [
  {
    id: 'analyses',
    summary: 'List the runnable analysis catalog.',
    usage: 'lazstats analyses [--json] [--family <id>] [--all]',
    description:
      'Prints 71 visible procedures by default; `--all` adds the hidden `wizard`. Use `--json` for automation and `--verbose` to show role keys.',
    arguments: [],
    optionKeys: ['json', 'family', 'all', 'verbose'],
    examples: [
      'lazstats analyses',
      'lazstats analyses --json',
      'lazstats analyses --family regression --json',
      'lazstats analyses --all --verbose',
    ],
    notes: [
      '`assistant` is a UI workflow, not a runnable procedure and is never listed.',
      'Use the id with `schema` and `run`.',
    ],
    related: ['schema', 'run'],
  },
  {
    id: 'schema',
    summary: 'Show one analysis contract: roles, defaults and example parameters.',
    usage: 'lazstats schema <analysisId> [--json]',
    description:
      'Returns the parameter key, editable fields, default parameters, roles and an `exampleSet` string ready for `run --set`.',
    arguments: [
      { name: 'analysisId', required: true, description: 'Analysis id from `analyses`.' },
    ],
    optionKeys: ['json', 'verbose'],
    examples: ['lazstats schema regression', 'lazstats schema regression --json'],
    notes: ['Always read the schema before constructing `--set` overrides.'],
    related: ['analyses', 'run'],
  },
  {
    id: 'inspect',
    summary: 'Inspect a dataset without running an analysis.',
    usage: 'lazstats inspect <file> [options]',
    description:
      'Reads the dataset, reports shape, format, SHA-256, column types and metadata, and prints a bounded preview.',
    arguments: [{ name: 'file', required: true, description: 'Dataset path.' }],
    optionKeys: [
      'json',
      'rows',
      'max-rows',
      'format-input',
      'delimiter',
      'header',
      'no-header',
      'decimal-comma',
      'sheet',
      'types',
      'missing',
      'verbose',
    ],
    examples: [
      'lazstats inspect samples/descriptive/iris/data.csv',
      'lazstats inspect data.xlsx --sheet Results --rows 10 --json',
      'lazstats inspect data.csv --types Age:int,Score:num --missing Age:-9',
    ],
    notes: [
      '`--max-rows` limits how much of the file is loaded; `--rows` only limits the preview.',
      'Column names shown here are the names accepted by `--set`.',
    ],
    related: ['run', 'schema'],
  },
  {
    id: 'run',
    summary: 'Run one analysis from a dataset or a project.',
    usage:
      'lazstats run (--data <file> --analysis <id> | --project <file.lzs> [--analysis <id>]) [options]',
    description:
      'Loads exactly one source, builds parameters, runs the analysis and writes a JSON envelope or a rendered report.',
    arguments: [],
    optionKeys: runOptionKeys,
    examples: [
      'lazstats run --data samples/descriptive/iris/data.csv --analysis descriptive --set descVars=Sepal.Length,Sepal.Width',
      'lazstats run --data data.csv --analysis regression --set reg.y=Score --set reg.x=Age --json',
      'lazstats run --project project.lzs --format html --out report.html',
      'lazstats run --data data.csv --analysis ttest --format xlsx --out results/',
    ],
    notes: [
      'Provide exactly one of `--data` and `--project`.',
      'Parameters are resolved in this order: project base, `--params`/`--params-file`, then repeated `--set` in command-line order.',
      '`--params` and `--params-file` are mutually exclusive.',
      '`--format json` writes the envelope to stdout or `--out`; XLSX and SVG require `--out`.',
      'A rejected run exits with 2/3/4/5 and writes a failure envelope, never a fake result.',
    ],
    related: ['analyses', 'schema', 'inspect', 'render', 'batch'],
  },
  {
    id: 'project',
    summary: 'Inspect or run a `.lzs` project.',
    usage: 'lazstats project <inspect|run> <file.lzs> [options]',
    description:
      '`project inspect` validates and describes a project without running it; `project run` loads the saved grid, parameters and settings and runs one analysis.',
    arguments: [{ name: 'file.lzs', required: true, description: 'LazStats project file.' }],
    optionKeys: ['json', 'verbose'],
    examples: ['lazstats project inspect project.lzs --json', 'lazstats project run project.lzs --format html --out report.html'],
    notes: ['Use `project run` rather than `run --project`; both are equivalent.'],
    related: ['project inspect', 'project run'],
  },
  {
    id: 'project inspect',
    summary: 'Validate a project and print its metadata.',
    usage: 'lazstats project inspect <file.lzs> [--json]',
    description:
      'Reads the project, applies migrations in memory, and reports version, shape, active analysis, parameter keys, saved outputs and SHA-256.',
    arguments: [{ name: 'file.lzs', required: true, description: 'LazStats project file.' }],
    optionKeys: ['json', 'verbose'],
    examples: ['lazstats project inspect project.lzs', 'lazstats project inspect project.lzs --json'],
    notes: ['Read-only: the file is never modified.'],
    related: ['project run'],
  },
  {
    id: 'project run',
    summary: 'Run the saved analysis of a project.',
    usage: 'lazstats project run <file.lzs> [options]',
    description:
      'Loads the project grid, saved parameters, confidence level and report language, optionally overriding the analysis and parameters.',
    arguments: [{ name: 'file.lzs', required: true, description: 'LazStats project file.' }],
    optionKeys: runOptionKeys.filter(key => key !== 'data' && key !== 'project'),
    examples: [
      'lazstats project run project.lzs',
      'lazstats project run project.lzs --analysis regression --format md',
      'lazstats project run project.lzs --set descVars=Score --timings --json',
    ],
    notes: [
      'Without `--analysis`, the saved active analysis is used; the UI Assistant is rejected.',
      'Project settings supply the default CI level and report language.',
    ],
    related: ['project inspect', 'run'],
  },
  {
    id: 'batch',
    summary: 'Run multiple jobs from a JSON file into separate directories.',
    usage: 'lazstats batch --jobs <file.json> --out <directory> [options]',
    description:
      'Each job runs through the same `run` path and writes its own `result.json` or `failure.json` under `<out>/<job.id>/`.',
    arguments: [],
    optionKeys: [
      'jobs',
      'out',
      'concurrency',
      'continue-on-error',
      'workers',
      'timeout',
      'diagnostics',
      'include-row-numbers',
      'verbose',
    ],
    examples: [
      'lazstats batch --jobs jobs.json --out results',
      'lazstats batch --jobs jobs.json --out results --concurrency 4 --continue-on-error',
    ],
    notes: [
      'Jobs file: `{ "jobs": [{ "id": "descriptive", "data": "data.csv", "analysis": "descriptive", "set": { "descVars": ["Score"] } }] }` or a bare array.',
      'A job needs `data` or `project`; `id` must be unique and safe as a directory name.',
      'Exit codes: 0 all ok, 2 partial failure, 3 data failure, 4 internal failure, 5 timeout.',
    ],
    related: ['run', 'render'],
  },
  {
    id: 'render',
    summary: 'Render an existing successful JSON envelope.',
    usage: 'lazstats render --result <file> [--format md|html|xlsx|svg] [--out PATH]',
    description:
      'Reads a successful `run` envelope and produces Markdown, HTML, XLSX or SVG charts without recomputing the analysis.',
    arguments: [],
    optionKeys: ['result', 'format', 'out', 'charts', 'include-data-sheet', 'quiet', 'verbose'],
    examples: [
      'lazstats render --result result.json --format md',
      'lazstats render --result result.json --format xlsx --out report.xlsx',
      'lazstats render --result result.json --format svg --out charts/',
    ],
    notes: [
      'Only envelopes with `status: "ok"` are accepted.',
      'XLSX and SVG require `--out`; SVG writes one file per chart into a directory.',
    ],
    related: ['run', 'batch'],
  },
];

export const CLI_EXIT_CODES: CliExitCode[] = [
  { code: 0, meaning: 'Success.' },
  { code: 2, meaning: 'Invalid arguments, unknown analysis, parameter rejection or a rejected run.' },
  { code: 3, meaning: 'Dataset, project or file error.' },
  { code: 4, meaning: 'Internal error.' },
  { code: 5, meaning: 'Analysis timeout.' },
];

export const CLI_AGENT_WORKFLOW = [
  'List procedures: lazstats analyses --json',
  'Read the contract: lazstats schema <analysisId> --json',
  'Inspect columns and types: lazstats inspect <file> --json',
  'Run and keep the JSON envelope: lazstats run --data <file> --analysis <id> --json',
  'Render later if needed: lazstats render --result result.json --format html --out report.html',
];

/** Parse options for `node:util`, derived from the public catalog. */
export const CLI_PARSE_OPTIONS: Record<
  string,
  { type: CliOptionType; short?: string; multiple?: boolean }
> = Object.fromEntries(
  CLI_OPTIONS.map(option => [
    option.key,
    {
      type: option.type,
      ...(option.short ? { short: option.short } : {}),
      ...(option.multiple ? { multiple: true } : {}),
    },
  ])
);

export const CLI_OPTION_BY_KEY = new Map(CLI_OPTIONS.map(option => [option.key, option]));
