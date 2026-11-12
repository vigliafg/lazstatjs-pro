/**
 * Canonical agent-facing guide for the MCP server.
 *
 * The server instructions, tool descriptions, help resources, prompt and the
 * generated repository reference all read from this module.
 */
export const MCP_HELP_VERSION = 1;

export interface McpToolGuide {
  id: string;
  title: string;
  purpose: string;
  when: string;
  arguments: string[];
  returns: string[];
  next?: string;
}

export interface McpErrorGuide {
  code: string;
  cause: string;
  recovery: string;
}

export interface McpHelpTopic {
  id: string;
  title: string;
  description: string;
  body: string;
}

export const MCP_TOOL_GUIDES: McpToolGuide[] = [
  {
    id: 'engine_info',
    title: 'Engine information',
    purpose:
      'Read engine version, runnable counts, MCP limits and documentation links; optionally return help text.',
    when:
      'Call first when you need capabilities, limits or versions. If your host does not expose resources or prompts, use help:true for the full guide or topic:\'errors\' for one section.',
    arguments: [
      'help?: true returns the full agent guide in documentation.guideText.',
      'topic?: one topic id; returns documentation.topic with its Markdown body.',
    ],
    returns: [
      'engine/version',
      'runners and chartKinds',
      'catalogVisible and hidden analyses',
      'limits',
      'documentation.guide and topics',
      'documentation.guideText when help is true',
      'documentation.topic when topic is provided',
    ],
    next: 'list_analyses',
  },
  {
    id: 'list_analyses',
    title: 'List analyses',
    purpose: 'List runnable analyses with id, label, family, description, cost and hidden flag.',
    when: 'Use to discover a procedure before describing or running it.',
    arguments: [
      'query?: case-insensitive text across id, label, description and family.',
      'family?: family id or family label.',
      'includeHidden?: include `wizard` (default false).',
      'limit?: 1..200, default 100.',
    ],
    returns: ['total and catalogTotal', 'shown and hasMore', 'analyses[]'],
    next: 'describe_analysis',
  },
  {
    id: 'describe_analysis',
    title: 'Describe analysis',
    purpose: 'Return one analysis contract: roles, fields, defaults and an exampleSettings string.',
    when: 'Call before run_analysis; never guess role keys or parameter names.',
    arguments: ['analysisId: required analysis id from list_analyses.'],
    returns: ['paramsKey', 'defaultParams', 'fields', 'roles with column indices', 'exampleSet', 'prerequisites'],
    next: 'inspect_dataset',
  },
  {
    id: 'inspect_dataset',
    title: 'Inspect dataset',
    purpose: 'Read dataset metadata and a small preview without running an analysis.',
    when: 'Use before choosing columns or building params; verify names, types and levels.',
    arguments: [
      'Provide exactly one of path/dataPath or data.',
      'path or dataPath: file confined to the MCP root.',
      'data: inline JSON table; at most 1 MiB and 2000 rows.',
      'format?, delimiter?, header?/hasHeader?, decimalComma?, sheet?, types?, missing?.',
      'maxRows?: up to 50000; previewRows?: 1..20, default 5.',
    ],
    returns: ['source, format, sha256', 'rows, columns, truncated', 'columnsMeta', 'preview'],
    next: 'run_analysis',
  },
  {
    id: 'run_analysis',
    title: 'Run analysis',
    purpose: 'Run one analysis and cache the result under a resultId.',
    when: 'Use after describing the analysis and inspecting the columns.',
    arguments: [
      'Provide exactly one of dataPath, projectPath or data.',
      'analysisId: required with dataPath/data; optional with projectPath (uses the saved active analysis).',
      'params?: partial ProjectParams merged over the project/base params.',
      'set?: role/parameter overrides; lists use arrays or comma-separated strings.',
      'ciLevel?: 0..100; values above 1 are divided by 100. Default 0.95 or project CI.',
      'reportLocale?: report language; default `it` or project language.',
      'include?: any of summary, tables, report, charts; default summary+tables+report.',
      'diagnostics?: none|summary|full; timeoutMs?: 100..600000, default 120000; workers?: auto|0|N.',
    ],
    returns: ['resultId (null if too large to cache)', 'summary', 'included tables/report/charts', 'warnings, timings, elapsedMs'],
    next: 'get_result or render_chart',
  },
  {
    id: 'get_result',
    title: 'Get result',
    purpose: 'Read one section of a cached result, with pagination.',
    when: 'Use after run_analysis when the initial payload omitted detail or you need another table/report page.',
    arguments: [
      'resultId: required id returned by run_analysis.',
      'section?: summary|tables|report|charts|all; default summary.',
      'tableId?: read one table when section=tables.',
      'offset?: zero-based row/section offset; limit?: 1..200, default 50.',
    ],
    returns: ['result metadata', 'requested section', 'pagination fields when applicable'],
    next: 'render_chart',
  },
  {
    id: 'render_chart',
    title: 'Render chart',
    purpose: 'Render one cached chart as SVG or return the compiled Vega-Lite specification.',
    when: 'Use after run_analysis or get_result(charts) to display or inspect a chart.',
    arguments: [
      'resultId: required cached result id.',
      'chartId: required id from the result chart list.',
      'format?: svg|spec; default svg.',
    ],
    returns: ['mediaType', 'svg or spec'],
  },
  {
    id: 'validate_project',
    title: 'Validate project',
    purpose: 'Validate a .lzs project and return its metadata without modifying or running it.',
    when: 'Use before projectPath runs, or to confirm a project is readable and which analysis it stores.',
    arguments: ['Provide exactly one of path or projectPath, confined to the MCP root.'],
    returns: ['valid', 'version and migration', 'shape', 'activeAnalysis', 'paramKeys', 'outputCount', 'sha256'],
    next: 'run_analysis with projectPath',
  },
];

export const MCP_ERROR_GUIDES: McpErrorGuide[] = [
  {
    code: 'E_ARGS',
    cause: 'Missing or conflicting arguments, unknown help/source/table/chart, invalid CI or an unknown command.',
    recovery: 'Re-read the tool schema and the relevant help topic; provide exactly one valid source and required ids.',
  },
  {
    code: 'E_ANALYSIS',
    cause: 'Unknown or non-runnable analysis, including the UI-only `assistant`.',
    recovery: 'Call list_analyses and use an id returned there; verify with describe_analysis.',
  },
  {
    code: 'E_PARAMS',
    cause: 'Unknown column or parameter, ambiguous column, wrong type or missing required role.',
    recovery: 'Call inspect_dataset and describe_analysis; use exact column names and role keys, then retry run_analysis.',
  },
  {
    code: 'E_DATA',
    cause: 'Missing file, path outside root, symlink escape, unsupported format, too many columns or an oversized file.',
    recovery: 'Use a path inside LAZSTATS_MCP_ROOT, check the format/size limits and inspect the file again.',
  },
  {
    code: 'E_RUN',
    cause: 'The analysis runner rejected the request (for example incompatible data or a failed preflight).',
    recovery: 'Read diagnostics and the error message, fix the data/parameters, then run again. No resultId is cached on rejection.',
  },
  {
    code: 'E_INTERNAL',
    cause: 'Unexpected engine or server failure.',
    recovery: 'Retry once with the same requestId/resultId semantics; if it repeats, report the message and stage.',
  },
  {
    code: 'E_TIMEOUT',
    cause: 'The analysis exceeded timeoutMs.',
    recovery: 'Retry with a larger timeoutMs (up to 600000) or a smaller dataset/worker count.',
  },
  {
    code: 'E_CANCELLED',
    cause: 'The MCP client cancelled the request.',
    recovery: 'Re-issue the request only if the user still wants the result.',
  },
  {
    code: 'E_BUSY',
    cause: 'More than 4 runs are active and the 16-slot queue is full.',
    recovery: 'Wait for an active run to finish and retry; do not start parallel duplicates.',
  },
  {
    code: 'E_RESULT_EXPIRED',
    cause: 'The resultId is unknown or its 10-minute cache entry expired.',
    recovery: 'Run the analysis again to obtain a new resultId; results are never persisted.',
  },
];

export const MCP_WORKFLOW = [
  'Call engine_info when you need capabilities, limits or help topics.',
  'Call list_analyses to choose a runnable analysis id; do not invent ids.',
  'Call describe_analysis for the chosen id to read roles, defaults and exampleSet.',
  'Call inspect_dataset to verify column names, types, levels and missing codes.',
  'Call run_analysis with exactly one source and keep the returned resultId.',
  'Use get_result for more tables/report pages and render_chart for a chart; validate_project before projectPath runs.',
];

export const MCP_RULES = [
  'Read-only: the server never writes files, starts a shell, uses the network or evaluates code.',
  'run_analysis and inspect_dataset accept exactly one source: dataPath, projectPath or data (inspect uses path/dataPath or data).',
  'All paths are confined to LAZSTATS_MCP_ROOT (or --root); symlinks that escape it are rejected.',
  'Keep resultId values: tables, report sections and charts are read from the in-memory cache.',
  'The cache is LRU, holds at most 20 results / 20 MB for 10 minutes; only successful runs are cached.',
  'When an analysis is rejected, isError is true, no resultId is returned and nothing is cached.',
  'Use reportLocale and ciLevel explicitly when the user asks for a specific language or confidence level.',
];

export const MCP_HELP_TOPICS: McpHelpTopic[] = [
  {
    id: 'overview',
    title: 'Overview',
    description: 'Transport, scope, tool map and the eight-tool contract.',
    body: `LazStats MCP exposes the shared statistical engine over stdio. It does not launch the CLI and never writes files.

The public surface is exactly eight tools: \`engine_info\`, \`list_analyses\`, \`describe_analysis\`, \`inspect_dataset\`, \`run_analysis\`, \`get_result\`, \`render_chart\` and \`validate_project\`.

Use \`lazstats://help/{topic}\` for the detailed contracts: \`workflow\`, \`data\`, \`run\`, \`results\`, \`charts\`, \`projects\`, \`errors\`, \`paths\` and \`limits\`.

If the host does not expose resources or prompts, call \`engine_info\` with \`{ "help": true }\` for the full guide or \`{ "topic": "errors" }\` for one section.
`
  },
  {
    id: 'workflow',
    title: 'Workflow',
    description: 'The recommended order from catalog discovery to chart rendering.',
    body: MCP_WORKFLOW.map((step, index) => `${index + 1}. ${step}`).join('\n'),
  },
  {
    id: 'data',
    title: 'Data and paths',
    description: 'Accepted sources, inline data, path confinement and limits.',
    body: `Paths are resolved with \`realpath\` and must remain inside the MCP root. The root comes from \`LAZSTATS_MCP_ROOT\` or \`--root\`; the default is the process working directory.

Accepted files: CSV, TSV, JSON, XLSX, SAV, DTA and \`.lzs\` projects. Text files may be at most 100 MB; binary files at most 25 MB. Datasets are capped at 50000 rows and 500 columns.

Inline \`data\` is a JSON table and is limited to 1 MiB and 2000 rows. Use a path for larger data.

\`inspect_dataset\` accepts exactly one of \`path\`/\`dataPath\` or \`data\`. \`run_analysis\` accepts exactly one of \`dataPath\`, \`projectPath\` or \`data\`.`,
  },
  {
    id: 'run',
    title: 'Running analyses',
    description: 'Parameters, source rules, CI, locale, workers, timeout and cancellation.',
    body: `Call \`describe_analysis\` before building parameters. \`set\` keys may be role keys or \`paramsKey.role\`; arrays are accepted directly.

Parameter precedence is project/base params, then \`params\`, then \`set\` entries. \`ciLevel\` accepts 0..100 and converts values above 1 to a fraction. The default is 0.95 for datasets and the project value for projects. \`reportLocale\` defaults to \`it\` or the project language.

At most 4 runs execute concurrently and 16 wait in the queue. A request exceeding \`timeoutMs\` (default 120000, maximum 600000) fails with \`E_TIMEOUT\`. Cancellation terminates the worker and returns \`E_CANCELLED\`.

Successful runs return a \`resultId\`; rejected runs return \`isError: true\`, diagnostics and no cached result.`,
  },
  {
    id: 'results',
    title: 'Results and cache',
    description: 'Sections, pagination, table/chart ids and result expiry.',
    body: `\`run_analysis\` returns summary, tables and report by default. Add \`charts\` to \`include\` when you need chart ids.

\`get_result\` sections: \`summary\`, \`tables\`, \`report\`, \`charts\`, \`all\`. Use \`tableId\` to read one table and \`offset\`/\`limit\` to paginate. The limit is 200.

\`render_chart\` needs a \`resultId\` and a \`chartId\` from the charts section. \`format: "svg"\` is the default; \`format: "spec"\` returns the compiled Vega-Lite spec.

The cache is in memory, LRU, at most 20 results and 20 MB for 10 minutes. An expired id returns \`E_RESULT_EXPIRED\`; run the analysis again.`,
  },
  {
    id: 'charts',
    title: 'Charts',
    description: 'Chart discovery, SVG rendering and Vega-Lite specs.',
    body: `Charts live inside a cached result. Request them with \`include: ["charts"]\` on \`run_analysis\` or \`section: "charts"\` on \`get_result\`.

Each chart has an \`id\`, \`title\`, \`kind\` and optional \`subtitle\`. Panel children are valid chart ids too.

\`render_chart({ resultId, chartId, format: "svg" })\` returns \`image/svg+xml\`; \`format: "spec"\` returns \`application/json\` with the compiled spec. Rendering never re-runs the analysis.`,
  },
  {
    id: 'projects',
    title: 'Projects',
    description: 'Validating and running .lzs projects.',
    body: `\`validate_project\` is read-only and accepts exactly one of \`path\` or \`projectPath\`. It reports version/migration, shape, active analysis, parameter keys, saved output count and SHA-256.

\`run_analysis\` with \`projectPath\` uses the saved grid, params, CI and report locale. \`analysisId\` is optional; without it the saved active analysis is used. The UI-only \`assistant\` cannot be run.

\`params\` and \`set\` override the saved parameters. A project is confined to the MCP root like any other file.`,
  },
  {
    id: 'errors',
    title: 'Errors and recovery',
    description: 'Every error code with its likely cause and recovery action.',
    body: MCP_ERROR_GUIDES.map(
      error => `- **${error.code}** — ${error.cause} Recovery: ${error.recovery}`
    ).join('\n'),
  },
  {
    id: 'paths',
    title: 'Path security',
    description: 'Root, absolute/relative paths, symlinks and file limits.',
    body: `Set the root with \`--root /absolute/path\` or \`LAZSTATS_MCP_ROOT=/absolute/path\`. Relative inputs are resolved against that root.

Every path goes through \`realpath\`; a path outside the root, including a symlink that resolves outside, fails with \`E_DATA/path_outside_root\`. Directories and missing files are rejected.

Text files: 100 MB. Binary files: 25 MB. Datasets: 50000 rows and 500 columns. Inline data: 1 MiB and 2000 rows.`,
  },
  {
    id: 'limits',
    title: 'Limits',
    description: 'Numeric limits for inputs, runs, outputs and cache.',
    body: `- Dataset rows: 50000
- Dataset columns: 500
- Text file size: 100 MB
- Binary file size: 25 MB
- Inline data: 1 MiB / 2000 rows
- Concurrent runs: 4
- Queue: 16
- Timeout: 120000 ms default, 600000 ms maximum
- Result cache: 20 results / 20 MB / 10 minutes
- Structured content: 256 KiB; text content: 8000 characters
- Preview rows: 20 maximum`,
  },
];

export const MCP_HELP_TOPIC_IDS = MCP_HELP_TOPICS.map(topic => topic.id);

export const MCP_TOOL_IDS = MCP_TOOL_GUIDES.map(tool => tool.id);

export const MCP_DOCUMENTATION = {
  version: MCP_HELP_VERSION,
  guide: 'lazstats://help',
  topics: MCP_HELP_TOPIC_IDS,
};

export const MCP_INSTRUCTIONS =
  'Read-only LazStats statistical engine over stdio. Follow this order: engine_info, list_analyses, describe_analysis, inspect_dataset, run_analysis, then get_result or render_chart. ' +
  'Pass exactly one source to run_analysis: dataPath, projectPath or data; inspect_dataset accepts path/dataPath or data. ' +
  'Never guess column names or role keys: read describe_analysis and inspect_dataset first. ' +
  'Keep resultId values for paginated tables, reports and charts. Paths are confined to the MCP root. ' +
  'Rejected analyses return isError true with diagnostics and no resultId. ' +
  'Read lazstats://help (or lazstats://help/{topic}) for full contracts, examples and error recovery. ' +
  'If your host does not expose resources or prompts, call engine_info with help:true or topic:\'errors\'.';

export const toolGuide = (id: string): McpToolGuide | undefined =>
  MCP_TOOL_GUIDES.find(tool => tool.id === id);

export const toolDescription = (id: string): string => {
  const guide = toolGuide(id);
  if (!guide) throw new Error(`Unknown MCP tool guide: ${id}`);
  return `${guide.purpose} ${guide.when}`;
};

export const helpTopic = (id: string): McpHelpTopic | undefined =>
  MCP_HELP_TOPICS.find(topic => topic.id === id);

export const renderToolGuide = (guide: McpToolGuide): string => {
  const lines = [
    `### ${guide.id} — ${guide.title}`,
    '',
    guide.purpose,
    '',
    `**When:** ${guide.when}`,
    '',
    '**Arguments:**',
    ...guide.arguments.map(argument => `- ${argument}`),
    '',
    '**Returns:**',
    ...guide.returns.map(item => `- ${item}`),
  ];
  if (guide.next) lines.push('', `**Next:** ${guide.next}`);
  return lines.join('\n');
};

export const renderGuide = (): string => {
  const lines = [
    '# LazStats MCP agent guide',
    '',
    'LazStats MCP exposes the shared statistical engine over stdio. It is read-only: no network, shell, eval or file writes.',
    '',
    '## Workflow',
    '',
    ...MCP_WORKFLOW.map((step, index) => `${index + 1}. ${step}`),
    '',
    '## Rules',
    '',
    ...MCP_RULES.map(rule => `- ${rule}`),
    '',
    '## Tools',
    '',
    ...MCP_TOOL_GUIDES.flatMap(tool => [renderToolGuide(tool), '']),
    '## Errors',
    '',
    ...MCP_ERROR_GUIDES.map(
      error => `- **${error.code}** — ${error.cause} Recovery: ${error.recovery}`
    ),
    '',
    '## Topics',
    '',
    ...MCP_HELP_TOPICS.map(topic => `- [${topic.title}](lazstats://help/${topic.id}): ${topic.description}`),
    '',
    `Help version: ${MCP_HELP_VERSION}`,
  ];
  return lines.join('\n');
};

export const renderTopic = (id: string): string => {
  const topic = helpTopic(id);
  if (!topic) throw new Error(`Unknown MCP help topic: ${id}`);
  return `# ${topic.title}\n\n${topic.body}\n`;
};
