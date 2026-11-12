import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCli } from './run';
import type { CliIo } from './types';
import {
  DEFAULT_PARAMS,
  DEFAULT_SETTINGS,
  createProjectSnapshot,
  serializeProject,
} from '../io/project';
import { DEFAULT_PREFS } from '../io/prefs';
import { readXlsxSheets } from '../io/xlsx';

const writeProject = (directory: string, extra: Record<string, unknown> = {}): string => {
  const path = join(directory, 'project.lzs');
  const snapshot = createProjectSnapshot(
    {
      datasetId: 'fixture',
      dataRevision: 7,
      grid: {
        cols: [
          { name: 'Score', type: 'num' },
          { name: 'Group', type: 'int' },
          { name: 'Age', type: 'int' },
        ],
        rows: [
          ['12.5', '1', '30'],
          ['8', '2', '41'],
          ['10', '1', '35'],
        ],
      },
      prefs: DEFAULT_PREFS,
      settings: { ...DEFAULT_SETTINGS, activeAnalysis: 'descriptive' },
      params: DEFAULT_PARAMS,
    },
    '2026-10-19T10:00:00.000Z'
  );
  const raw = { ...JSON.parse(serializeProject(snapshot)), ...extra };
  writeFileSync(path, JSON.stringify(raw, null, 2), 'utf8');
  return path;
};

const capture = (): { io: CliIo; stdout: () => string; stderr: () => string } => {
  let out = '';
  let err = '';
  return {
    io: { out: text => { out += text; }, err: text => { err += text; } },
    stdout: () => out,
    stderr: () => err,
  };
};

test('analyses lists 71 visible procedures and --all adds wizard', async () => {
  const first = capture();
  assert.equal(await runCli(['analyses', '--json'], first.io), 0);
  const visible = JSON.parse(first.stdout()) as { total: number; analyses: { id: string }[] };
  assert.equal(visible.total, 71);
  assert.equal(visible.analyses.some(entry => entry.id === 'assistant'), false);

  const second = capture();
  assert.equal(await runCli(['analyses', '--all', '--json'], second.io), 0);
  const all = JSON.parse(second.stdout()) as { total: number; analyses: { id: string }[] };
  assert.equal(all.total, 72);
  assert.equal(all.analyses.some(entry => entry.id === 'wizard'), true);
});

test('schema prints the parameter key and roles', async () => {
  const sink = capture();
  assert.equal(await runCli(['schema', 'regression', '--json'], sink.io), 0);
  const schema = JSON.parse(sink.stdout()) as { paramsKey: string; roles: unknown[] };
  assert.equal(schema.paramsKey, 'reg');
  assert.ok(schema.roles.length > 0);
});

test('inspect reports the dataset shape and a bounded preview', async () => {
  const sink = capture();
  assert.equal(
    await runCli(['inspect', 'samples/descriptive/iris/data.csv', '--json', '--rows', '3'], sink.io),
    0
  );
  const inspected = JSON.parse(sink.stdout()) as {
    rows: number;
    columns: number;
    preview: string[][];
  };
  assert.equal(inspected.rows, 150);
  assert.equal(inspected.columns, 5);
  assert.equal(inspected.preview.length, 3);
});

test('run returns a successful JSON envelope and resolves column names', async () => {
  const sink = capture();
  assert.equal(
    await runCli(
      [
        'run',
        '--data',
        'samples/descriptive/iris/data.csv',
        '--analysis',
        'descriptive',
        '--set',
        'descVars=Sepal.Length,Sepal.Width',
      ],
      sink.io
    ),
    0
  );
  const envelope = JSON.parse(sink.stdout()) as {
    status: string;
    params: { descVars: number[] };
    result: { ok: boolean; tables: unknown[] };
  };
  assert.equal(envelope.status, 'ok');
  assert.deepEqual(envelope.params.descVars, [0, 1]);
  assert.equal(envelope.result.ok, true);
  assert.equal(envelope.result.tables.length, 4);
});

test('runner rejection preserves the exact reason and produces no artifacts', async () => {
  const sink = capture();
  assert.equal(
    await runCli(
      [
        'run',
        '--data',
        'samples/descriptive/iris/data.csv',
        '--analysis',
        'logistic',
        '--set',
        'logistic.outcome=Species',
        '--set',
        'logistic.predictors=Sepal.Length',
      ],
      sink.io
    ),
    2
  );
  const envelope = JSON.parse(sink.stdout()) as {
    status: string;
    error: { code: string; kind: string; message: string };
    result: { ok: boolean; reason: string };
    artifacts: unknown[];
  };
  assert.equal(envelope.status, 'rejected');
  assert.equal(envelope.error.code, 'E_RUN');
  assert.equal(envelope.error.kind, 'runner_rejected');
  assert.equal(envelope.error.message, envelope.result.reason);
  assert.equal(
    envelope.error.message,
    'The outcome needs exactly two distinct values (for example 0/1 or yes/no)'
  );
  assert.equal(envelope.result.ok, false);
  assert.deepEqual(envelope.artifacts, []);
});

test('unknown column fails as E_PARAMS before the runner', async () => {
  const sink = capture();
  assert.equal(
    await runCli(
      [
        'run',
        '--data',
        'samples/descriptive/iris/data.csv',
        '--analysis',
        'descriptive',
        '--set',
        'descVars=Missing',
      ],
      sink.io
    ),
    2
  );
  const envelope = JSON.parse(sink.stdout()) as {
    status: string;
    error: { code: string; kind: string };
  };
  assert.equal(envelope.status, 'rejected');
  assert.equal(envelope.error.code, 'E_PARAMS');
  assert.equal(envelope.error.kind, 'column_not_found');
});

test('unknown parameter is rejected instead of being written into ProjectParams', async () => {
  const sink = capture();
  assert.equal(
    await runCli(
      [
        'run',
        '--data',
        'samples/descriptive/iris/data.csv',
        '--analysis',
        'regression',
        '--set',
        'reg.notAParameter=1',
      ],
      sink.io
    ),
    2
  );
  const envelope = JSON.parse(sink.stdout()) as {
    status: string;
    error: { code: string; kind: string };
  };
  assert.equal(envelope.status, 'rejected');
  assert.equal(envelope.error.code, 'E_PARAMS');
  assert.equal(envelope.error.kind, 'unknown_parameter');
});

test('run writes Markdown, HTML, XLSX and SVG outputs, and render reads a JSON envelope', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'lazstats-cli-render-'));
  const base = [
    'run',
    '--data',
    'samples/descriptive/iris/data.csv',
    '--analysis',
    'descriptive',
  ];
  try {
    const markdown = capture();
    assert.equal(await runCli([...base, '--format', 'md'], markdown.io), 0);
    assert.match(markdown.stdout(), /## Tables/);
    assert.match(markdown.stdout(), /### Campione e misure di posizione/);

    const htmlPath = join(directory, 'report.html');
    const html = capture();
    assert.equal(
      await runCli([...base, '--format', 'html', '--out', htmlPath], html.io),
      0
    );
    const htmlText = readFileSync(htmlPath, 'utf8');
    assert.match(htmlText, /<!doctype html>/i);
    assert.match(htmlText, /<svg/);
    assert.match(htmlText, /<table>/);

    const xlsxPath = join(directory, 'report.xlsx');
    const xlsx = capture();
    assert.equal(
      await runCli([...base, '--format', 'xlsx', '--out', xlsxPath], xlsx.io),
      0
    );
    assert.equal(readFileSync(xlsxPath).subarray(0, 2).toString(), 'PK');

    const svgDirectory = join(directory, 'charts');
    const svg = capture();
    assert.equal(
      await runCli([...base, '--format', 'svg', '--out', svgDirectory], svg.io),
      0
    );
    const svgFiles = readdirSync(svgDirectory).filter(name => name.endsWith('.svg'));
    assert.ok(svgFiles.length > 0);
    assert.match(readFileSync(join(svgDirectory, svgFiles[0]), 'utf8'), /<svg/);

    const jsonPath = join(directory, 'result.json');
    assert.equal(await runCli([...base, '--out', jsonPath], capture().io), 0);
    const rendered = capture();
    assert.equal(
      await runCli(['render', '--result', jsonPath, '--format', 'md'], rendered.io),
      0
    );
    assert.match(rendered.stdout(), /## Tables/);

    const rejectedPath = join(directory, 'rejected.json');
    assert.equal(
      await runCli([...base, '--set', 'descVars=Missing', '--out', rejectedPath], capture().io),
      2
    );
    const rejectedRender = capture();
    assert.equal(
      await runCli(
        ['render', '--result', `${rejectedPath}.failure.json`, '--format', 'md'],
        rejectedRender.io
      ),
      2
    );
    assert.match(rejectedRender.stderr(), /only a successful run envelope/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('diagnostics defaults to summary and stays free of cell values', async () => {
  const sink = capture();
  assert.equal(
    await runCli(
      [
        'run',
        '--data',
        'samples/descriptive/iris/data.csv',
        '--analysis',
        'logistic',
        '--set',
        'logistic.outcome=Species',
        '--set',
        'logistic.predictors=Sepal.Length',
      ],
      sink.io
    ),
    2
  );
  const envelope = JSON.parse(sink.stdout()) as {
    diagnostics: {
      level: string;
      columns?: unknown[];
      dataset: { rowsTotal: number; requiredColumns: number; completeCases: number };
      checks: { id: string; status: string }[];
      problems: { kind: string; observed?: number; required?: number }[];
      suggestions: { action: string }[];
      rowNumbers: number[];
      truncated: boolean;
    };
  };
  const diagnostics = envelope.diagnostics;
  assert.equal(diagnostics.level, 'summary');
  assert.equal(diagnostics.dataset.rowsTotal, 150);
  assert.equal(diagnostics.dataset.requiredColumns, 2);
  assert.equal(diagnostics.dataset.completeCases, 150);
  assert.equal(diagnostics.columns, undefined);
  assert.ok(diagnostics.checks.some(item => item.id === 'outcome.binary' && item.status === 'failed'));
  assert.ok(diagnostics.checks.some(item => item.id === 'runner.precondition' && item.status === 'failed'));
  assert.equal(diagnostics.problems[0].kind, 'invalid_binary');
  assert.equal(diagnostics.problems[0].observed, 3);
  assert.equal(diagnostics.problems[0].required, 2);
  assert.equal(diagnostics.suggestions[0].action, 'select_binary_outcome');
  assert.deepEqual(diagnostics.rowNumbers, []);
  assert.equal(diagnostics.truncated, false);
  assert.equal(JSON.stringify(diagnostics).includes('setosa'), false);
});

test('full diagnostics add column profiles and aggregated levels', async () => {
  const sink = capture();
  assert.equal(
    await runCli(
      [
        'run',
        '--data',
        'samples/descriptive/iris/data.csv',
        '--analysis',
        'logistic',
        '--set',
        'logistic.outcome=Species',
        '--set',
        'logistic.predictors=Sepal.Length',
        '--diagnostics',
        'full',
      ],
      sink.io
    ),
    2
  );
  const diagnostics = (JSON.parse(sink.stdout()) as {
    diagnostics: {
      level: string;
      columns: {
        name: string;
        role?: string;
        distinct: number;
        levels?: { value: string; n: number }[];
      }[];
    };
  }).diagnostics;
  assert.equal(diagnostics.level, 'full');
  assert.equal(diagnostics.columns.length, 2);
  const outcome = diagnostics.columns.find(column => column.name === 'Species');
  assert.equal(outcome?.role, 'outcome');
  assert.equal(outcome?.distinct, 3);
  assert.deepEqual(outcome?.levels, [
    { value: 'setosa', n: 50 },
    { value: 'versicolor', n: 50 },
    { value: 'virginica', n: 50 },
  ]);
});

test('--diagnostics none omits the block', async () => {
  const sink = capture();
  assert.equal(
    await runCli(
      [
        'run',
        '--data',
        'samples/descriptive/iris/data.csv',
        '--analysis',
        'descriptive',
        '--set',
        'descVars=Missing',
        '--diagnostics',
        'none',
      ],
      sink.io
    ),
    2
  );
  const envelope = JSON.parse(sink.stdout()) as { diagnostics?: unknown };
  assert.equal(Object.prototype.hasOwnProperty.call(envelope, 'diagnostics'), false);
});

test('--include-row-numbers reports at most 20 incomplete rows', async () => {
  const base = [
    'run',
    '--data',
    'samples/missing/airquality/data.csv',
    '--analysis',
    'logistic',
    '--set',
    'logistic.outcome=Ozone',
    '--set',
    'logistic.predictors=Wind',
  ];
  const without = capture();
  assert.equal(await runCli(base, without.io), 2);
  const withoutDiagnostics = (JSON.parse(without.stdout()) as {
    diagnostics: { rowNumbers: number[] };
  }).diagnostics;
  assert.deepEqual(withoutDiagnostics.rowNumbers, []);

  const withNumbers = capture();
  assert.equal(await runCli([...base, '--include-row-numbers'], withNumbers.io), 2);
  const diagnostics = (JSON.parse(withNumbers.stdout()) as {
    diagnostics: {
      rowNumbers: number[];
      dataset: { droppedRows: number; completeCases: number; dropReasons: { empty: number } };
    };
  }).diagnostics;
  assert.equal(diagnostics.dataset.completeCases, 116);
  assert.equal(diagnostics.dataset.droppedRows, 37);
  assert.equal(diagnostics.dataset.dropReasons.empty, 37);
  assert.equal(diagnostics.rowNumbers.length, 20);
  assert.deepEqual(diagnostics.rowNumbers.slice(0, 3), [5, 10, 25]);
});

test('a dataset load failure still exposes partial diagnostics', async () => {
  const sink = capture();
  assert.equal(
    await runCli(
      ['run', '--data', 'samples/descriptive/iris/missing.csv', '--analysis', 'descriptive'],
      sink.io
    ),
    3
  );
  const envelope = JSON.parse(sink.stdout()) as {
    diagnostics: {
      dataset: { rowsTotal: number; requiredColumns: number };
      checks: { id: string; status: string }[];
    };
  };
  assert.equal(envelope.diagnostics.dataset.rowsTotal, 0);
  assert.equal(envelope.diagnostics.dataset.requiredColumns, 0);
  assert.equal(envelope.diagnostics.checks[0].id, 'input.parse');
  assert.equal(envelope.diagnostics.checks[0].status, 'failed');
});

test('invalid diagnostics mode is rejected as E_ARGS', async () => {
  const sink = capture();
  assert.equal(
    await runCli(
      [
        'run',
        '--data',
        'samples/descriptive/iris/data.csv',
        '--analysis',
        'descriptive',
        '--diagnostics',
        'bogus',
      ],
      sink.io
    ),
    2
  );
  assert.match(sink.stderr(), /--diagnostics must be none, summary or full/);
});

test('inspect supports forced input format, row limit and reference metadata', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'lazstats-cli-inspect-'));
  try {
    const path = join(directory, 'iris.data');
    writeFileSync(path, readFileSync('samples/descriptive/iris/data.csv'));
    const sink = capture();
    assert.equal(
      await runCli(
        ['inspect', path, '--format-input', 'csv', '--max-rows', '9', '--rows', '2', '--json'],
        sink.io
      ),
      0
    );
    const inspected = JSON.parse(sink.stdout()) as {
      rows: number;
      truncated: boolean;
      preview: string[][];
      columnsMeta: { name: string; reference?: string }[];
    };
    assert.equal(inspected.rows, 9);
    assert.equal(inspected.truncated, true);
    assert.equal(inspected.preview.length, 2);
    assert.equal(inspected.columnsMeta.length, 5);
    assert.equal(inspected.columnsMeta[0].name, 'Sepal_Length');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('schema exposes editable fields and analyses --verbose exposes roles', async () => {
  const schemaSink = capture();
  assert.equal(await runCli(['schema', 'ttest', '--json'], schemaSink.io), 0);
  const schema = JSON.parse(schemaSink.stdout()) as {
    fields: string[];
    exampleSet: string;
  };
  assert.ok(schema.fields.includes('var1'));
  assert.equal(schema.exampleSet, '--set ttest.var1=<column>');

  const analysesSink = capture();
  assert.equal(await runCli(['analyses', '--verbose'], analysesSink.io), 0);
  assert.match(analysesSink.stdout(), /descriptive\s+Descriptive\s+descriptive\s+instant\s+params: vars/);
});

test('--timings adds phase timings without changing a successful run', async () => {
  const sink = capture();
  assert.equal(
    await runCli(
      [
        'run',
        '--data',
        'samples/descriptive/iris/data.csv',
        '--analysis',
        'descriptive',
        '--set',
        'descVars=Sepal.Length',
        '--timings',
      ],
      sink.io
    ),
    0
  );
  const envelope = JSON.parse(sink.stdout()) as {
    status: string;
    timings: { totalMs: number; loadMs: number; paramsMs: number; runMs: number };
  };
  assert.equal(envelope.status, 'ok');
  assert.ok(envelope.timings.totalMs >= 0);
  assert.ok(envelope.timings.loadMs >= 0);
  assert.ok(envelope.timings.paramsMs >= 0);
  assert.ok(envelope.timings.runMs >= 0);
});

test('XLSX data sheet is opt-in and render can reuse embedded data', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'lazstats-cli-xlsx-data-'));
  try {
    const output = join(directory, 'with-data.xlsx');
    const quiet = capture();
    assert.equal(
      await runCli(
        [
          'run',
          '--data',
          'samples/descriptive/iris/data.csv',
          '--analysis',
          'descriptive',
          '--set',
          'descVars=Sepal.Length',
          '--format',
          'xlsx',
          '--out',
          output,
          '--include-data-sheet',
          '--quiet',
        ],
        quiet.io
      ),
      0
    );
    assert.equal(quiet.stdout(), '');
    assert.ok(readXlsxSheets(readFileSync(output)).some(sheet => sheet.name === 'Data'));

    const resultPath = join(directory, 'result.json');
    assert.equal(
      await runCli(
        [
          'run',
          '--data',
          'samples/descriptive/iris/data.csv',
          '--analysis',
          'descriptive',
          '--set',
          'descVars=Sepal.Length',
          '--include-data',
          '--out',
          resultPath,
        ],
        capture().io
      ),
      0
    );
    const rendered = join(directory, 'rendered.xlsx');
    assert.equal(
      await runCli(
        [
          'render',
          '--result',
          resultPath,
          '--format',
          'xlsx',
          '--out',
          rendered,
          '--include-data-sheet',
        ],
        capture().io
      ),
      0
    );
    assert.ok(readXlsxSheets(readFileSync(rendered)).some(sheet => sheet.name === 'Data'));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('project inspect reports metadata without running or modifying the project', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'lazstats-project-inspect-'));
  try {
    const path = writeProject(directory, { legacyField: true });
    const before = readFileSync(path, 'utf8');
    const sink = capture();
    assert.equal(await runCli(['project', 'inspect', path, '--json'], sink.io), 0);
    const inspected = JSON.parse(sink.stdout()) as {
      source: string;
      version: number;
      fileVersion: number;
      savedAt: string;
      rows: number;
      columns: number;
      datasetId?: string;
      dataRevision?: number;
      activeAnalysis: string;
      paramKeys: string[];
      outputCount: number;
      ignoredFields: string[];
      migration?: unknown;
    };
    assert.equal(inspected.source, path);
    assert.equal(inspected.version, 3);
    assert.equal(inspected.fileVersion, 3);
    assert.equal(inspected.savedAt, '2026-10-19T10:00:00.000Z');
    assert.equal(inspected.rows, 3);
    assert.equal(inspected.columns, 3);
    assert.equal(inspected.datasetId, 'fixture');
    assert.equal(inspected.dataRevision, 7);
    assert.equal(inspected.activeAnalysis, 'descriptive');
    assert.ok(inspected.paramKeys.includes('descVars'));
    assert.equal(inspected.outputCount, 0);
    assert.deepEqual(inspected.ignoredFields, ['legacyField']);
    assert.equal(inspected.migration, undefined);
    assert.equal(readFileSync(path, 'utf8'), before);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('project inspect reports version migration from older files', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'lazstats-project-migrate-'));
  try {
    const path = writeProject(directory, { version: 2 });
    const sink = capture();
    assert.equal(await runCli(['project', 'inspect', path, '--json'], sink.io), 0);
    const inspected = JSON.parse(sink.stdout()) as {
      fileVersion: number;
      version: number;
      migration?: { fromVersion: number; toVersion: number };
    };
    assert.equal(inspected.fileVersion, 2);
    assert.equal(inspected.version, 3);
    assert.deepEqual(inspected.migration, { fromVersion: 2, toVersion: 3 });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('project run is an alias of run --project', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'lazstats-project-run-'));
  try {
    const path = writeProject(directory);
    const sink = capture();
    assert.equal(
      await runCli(['project', 'run', path, '--set', 'descVars=Score'], sink.io),
      0
    );
    const envelope = JSON.parse(sink.stdout()) as {
      status: string;
      input: { source: string; format: string };
      analysis: { id: string };
      params: { descVars: number[] };
    };
    assert.equal(envelope.status, 'ok');
    assert.equal(envelope.input.source, path);
    assert.equal(envelope.input.format, 'lzs');
    assert.equal(envelope.analysis.id, 'descriptive');
    assert.deepEqual(envelope.params.descVars, [0]);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('project commands reject unknown actions and missing paths', async () => {
  const unknown = capture();
  assert.equal(await runCli(['project', 'explode', 'x.lzs'], unknown.io), 2);
  assert.match(unknown.stderr(), /Unknown project command: explode/);

  const missing = capture();
  assert.equal(await runCli(['project', 'inspect'], missing.io), 2);
  assert.match(missing.stderr(), /project inspect requires a \.lzs path/);
});

test('failed --out writes only the failure envelope', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'lazstats-cli-'));
  try {
    const out = join(directory, 'result.json');
    const sink = capture();
    assert.equal(
      await runCli(
        [
          'run',
          '--data',
          'samples/descriptive/iris/data.csv',
          '--analysis',
          'descriptive',
          '--set',
          'descVars=Missing',
          '--out',
          out,
        ],
        sink.io
      ),
      2
    );
    assert.equal(existsSync(out), false);
    const failure = JSON.parse(readFileSync(`${out}.failure.json`, 'utf8')) as {
      status: string;
      error: { kind: string };
    };
    assert.equal(failure.status, 'rejected');
    assert.equal(failure.error.kind, 'column_not_found');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
