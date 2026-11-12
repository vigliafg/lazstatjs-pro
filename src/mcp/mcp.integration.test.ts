import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  truncateSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import {
  DEFAULT_PARAMS,
  DEFAULT_SETTINGS,
  createProjectSnapshot,
  serializeProject,
} from '../io/project';
import { DEFAULT_PREFS } from '../io/prefs';

let directory = '';
let outsideDirectory = '';
let client: Client;
let transport: StdioClientTransport;

const call = async (name: string, args: Record<string, unknown>) => {
  const result = await client.callTool({ name, arguments: args });
  return result as {
    isError?: boolean;
    content: { type: string; text?: string }[];
    structuredContent?: Record<string, any>;
  };
};

before(async () => {
  directory = mkdtempSync(join(tmpdir(), 'lazstats-mcp-'));
  outsideDirectory = mkdtempSync(join(tmpdir(), 'lazstats-mcp-outside-'));
  copyFileSync('samples/descriptive/iris/data.csv', join(directory, 'iris.csv'));
  writeFileSync(join(outsideDirectory, 'secret.csv'), 'x\n1\n', 'utf8');
  symlinkSync(join(outsideDirectory, 'secret.csv'), join(directory, 'link-outside.json'));
  const snapshot = createProjectSnapshot(
    {
      datasetId: 'fixture',
      dataRevision: 1,
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
  writeFileSync(join(directory, 'project.lzs'), serializeProject(snapshot), 'utf8');
  writeFileSync(join(directory, 'huge.csv'), '', 'utf8');
  truncateSync(join(directory, 'huge.csv'), 100 * 1024 * 1024 + 1);
  const built = join(process.cwd(), 'dist-mcp', 'lazstats-mcp.mjs');
  const useBuilt = existsSync(built);
  transport = new StdioClientTransport({
    command: process.execPath,
    args: [useBuilt ? built : join(process.cwd(), 'src/mcp/main.ts'), '--root', directory],
    cwd: process.cwd(),
    ...(useBuilt ? {} : { env: { ...process.env, NODE_OPTIONS: '--import tsx' } }),
    stderr: 'pipe',
  });
  client = new Client({ name: 'lazstats-mcp-test', version: '1.0.0' });
  await client.connect(transport);
});

after(async () => {
  await client?.close();
  rmSync(directory, { recursive: true, force: true });
  rmSync(outsideDirectory, { recursive: true, force: true });
});

test('exposes exactly the eight planned tools and the 71/72 catalog', async () => {
  const tools = await client.listTools();
  assert.deepEqual(
    tools.tools.map(tool => tool.name).sort(),
    [
      'describe_analysis',
      'engine_info',
      'get_result',
      'inspect_dataset',
      'list_analyses',
      'render_chart',
      'run_analysis',
      'validate_project',
    ]
  );
  for (const tool of tools.tools) {
    assert.ok(tool.outputSchema, `${tool.name} must advertise outputSchema`);
  }
  const info = await call('engine_info', {});
  assert.equal(info.isError, undefined);
  assert.equal(info.structuredContent?.catalogVisible, 71);
  assert.equal(info.structuredContent?.runners, 72);
  assert.equal(info.structuredContent?.chartKinds, 32);
  assert.equal(info.structuredContent?.engineSchemaVersion, 1);
  assert.match(info.structuredContent?.node as string, /^v\d+/);
  assert.deepEqual(info.structuredContent?.hiddenAnalyses, ['wizard']);

  const visible = await call('list_analyses', {});
  assert.equal(visible.structuredContent?.total, 71);
  assert.equal(
    visible.structuredContent?.analyses.some((entry: { id: string }) => entry.id === 'assistant'),
    false
  );
  const all = await call('list_analyses', { includeHidden: true });
  assert.equal(all.structuredContent?.total, 72);
  assert.equal(
    all.structuredContent?.analyses.some((entry: { id: string }) => entry.id === 'wizard'),
    true
  );
});

test('inspects a dataset without returning every row', async () => {
  const inspected = await call('inspect_dataset', { path: 'iris.csv', previewRows: 3 });
  assert.equal(inspected.isError, undefined);
  assert.equal(inspected.structuredContent?.rows, 150);
  assert.equal(inspected.structuredContent?.columns, 5);
  assert.equal(inspected.structuredContent?.preview.length, 3);
  assert.equal(inspected.structuredContent?.columnsMeta[0].name, 'Sepal_Length');
  assert.deepEqual(inspected.structuredContent?.columnsMeta[0].missing, []);
});

test('runs an analysis, paginates a cached result and renders a chart', async () => {
  const run = await call('run_analysis', {
    analysisId: 'descriptive',
    dataPath: 'iris.csv',
    set: { descVars: ['Sepal_Length', 'Sepal_Width'] },
    include: ['tables', 'charts', 'report'],
  });
  assert.equal(run.isError, undefined);
  const resultId = run.structuredContent?.resultId as string;
  assert.match(resultId, /^res_/);
  assert.equal(run.structuredContent?.analysis.id, 'descriptive');
  assert.equal(run.structuredContent?.ok, true);
  assert.equal(run.structuredContent?.tables.length, 4);
  assert.ok(run.structuredContent?.charts.length > 0);
  assert.equal(run.structuredContent?.report !== null, true);
  assert.equal(typeof run.structuredContent?.elapsedMs, 'number');

  const tables = await call('get_result', { resultId, section: 'tables' });
  assert.equal(tables.structuredContent?.tables.length, 4);
  const tableId = tables.structuredContent?.tables[0].id as string;
  const page = await call('get_result', { resultId, section: 'tables', tableId, limit: 2 });
  assert.equal(page.structuredContent?.items.length, 2);

  const chartId = run.structuredContent?.charts[0].id as string;
  const chart = await call('render_chart', { resultId, chartId });
  assert.equal(chart.isError, undefined);
  assert.match(chart.structuredContent?.svg as string, /<svg/);
  const spec = await call('render_chart', { resultId, chartId, format: 'spec' });
  assert.equal(Array.isArray(spec.structuredContent?.spec.marks), true);
  const unknownChart = await call('render_chart', { resultId, chartId: 'missing-chart' });
  assert.equal(unknownChart.isError, true);
  assert.equal(unknownChart.structuredContent?.code, 'E_ARGS');

  const expired = await call('get_result', { resultId: 'res_missing' });
  assert.equal(expired.isError, true);
  assert.equal(expired.structuredContent?.code, 'E_RESULT_EXPIRED');
});

test('rejects path escape, symlinks, ambiguous sources and runner failures', async () => {
  const escaped = await call('run_analysis', {
    analysisId: 'descriptive',
    dataPath: '../outside.csv',
  });
  assert.equal(escaped.isError, true);
  assert.equal(escaped.structuredContent?.kind, 'path_outside_root');
  assert.equal(escaped.structuredContent?.resultId, undefined);

  const linked = await call('run_analysis', {
    analysisId: 'descriptive',
    dataPath: 'link-outside.json',
  });
  assert.equal(linked.isError, true);
  assert.equal(linked.structuredContent?.kind, 'path_outside_root');

  const ambiguous = await call('run_analysis', {
    analysisId: 'descriptive',
    dataPath: 'iris.csv',
    data: [{ x: 1 }],
  });
  assert.equal(ambiguous.isError, true);
  assert.equal(ambiguous.structuredContent?.kind, 'invalid_source');

  const rejected = await call('run_analysis', {
    analysisId: 'logistic',
    dataPath: 'iris.csv',
    set: { 'logistic.outcome': 'Species', 'logistic.predictors': 'Sepal_Length' },
  });
  assert.equal(rejected.isError, true);
  assert.equal(rejected.structuredContent?.code, 'E_RUN');
  assert.equal(rejected.structuredContent?.kind, 'runner_rejected');
  assert.equal(
    rejected.structuredContent?.message,
    'The outcome needs exactly two distinct values (for example 0/1 or yes/no)'
  );
  assert.equal(rejected.structuredContent?.resultId, undefined);
  assert.equal(rejected.structuredContent?.code, 'E_RUN');
  assert.equal(rejected.structuredContent?.kind, 'runner_rejected');
  assert.ok(rejected.structuredContent?.stage);
  assert.equal(rejected.structuredContent?.tables, undefined);
  assert.equal(rejected.structuredContent?.report, undefined);
  assert.equal(rejected.structuredContent?.charts, undefined);
  assert.ok(rejected.structuredContent?.diagnostics);
  assert.ok(rejected.structuredContent?.diagnostics?.checks.length > 0);
  assert.ok(rejected.structuredContent?.diagnostics?.problems.length > 0);
  assert.equal(rejected.structuredContent?.diagnostics?.dataset.rowsTotal, 150);
});

test('validates and runs a project fixture', async () => {
  const validation = await call('validate_project', { path: 'project.lzs' });
  assert.equal(validation.isError, undefined);
  assert.equal(validation.structuredContent?.valid, true);
  assert.equal(validation.structuredContent?.rows, 3);
  assert.equal(validation.structuredContent?.activeAnalysis, 'descriptive');

  const run = await call('run_analysis', { projectPath: 'project.lzs' });
  assert.equal(run.isError, undefined);
  assert.equal(run.structuredContent?.analysis.id, 'descriptive');
  assert.equal(run.structuredContent?.input.format, 'lzs');
  assert.match(run.structuredContent?.resultId as string, /^res_/);
});

test('serves resources and the prompt', async () => {
  const resources = await client.listResources();
  const catalog = await client.readResource({ uri: 'lazstats://analyses' });
  const parsedCatalog = JSON.parse((catalog.contents[0] as { text: string }).text) as {
    analyses: unknown[];
  };
  assert.equal(parsedCatalog.analyses.length, 72);
  assert.ok(resources.resources.some(resource => resource.uri === 'lazstats://analyses'));
  assert.ok(resources.resources.some(resource => resource.uri === 'lazstats://engine'));
  const analysis = await client.readResource({ uri: 'lazstats://analyses/descriptive' });
  assert.match((analysis.contents[0] as { text?: string }).text as string, /"id":"descriptive"/);
  const prompt = await client.getPrompt({
    name: 'choose-analysis',
    arguments: { goal: 'compare two group means' },
  });
  assert.match((prompt.messages[0].content as { text?: string }).text as string, /ttest|anova/);
});

test('runs two calls concurrently without blocking', async () => {
  const [first, second] = await Promise.all([
    call('run_analysis', { analysisId: 'descriptive', dataPath: 'iris.csv' }),
    call('run_analysis', { analysisId: 'descriptive', dataPath: 'iris.csv' }),
  ]);
  assert.equal(first.isError, undefined);
  assert.equal(second.isError, undefined);
  assert.notEqual(first.structuredContent?.resultId, second.structuredContent?.resultId);
});

test('emits progress notifications when the client requests them', async () => {
  const messages: string[] = [];
  const result = await client.callTool(
    { name: 'run_analysis', arguments: { analysisId: 'descriptive', dataPath: 'iris.csv' } },
    { onprogress: progress => messages.push(progress.message ?? '') }
  );
  assert.equal(result.isError, undefined);
  assert.ok(messages.includes('starting'), `progress: ${messages.join(',')}`);
  assert.ok(messages.includes('computing'));
  assert.ok(messages.includes('finishing'));
});

test('rejects unknown analyses, invalid parameters, missing and oversized files', async () => {
  const unknown = await call('run_analysis', {
    analysisId: 'does-not-exist',
    dataPath: 'iris.csv',
  });
  assert.equal(unknown.isError, true);
  assert.equal(unknown.structuredContent?.code, 'E_ANALYSIS');
  assert.equal(unknown.structuredContent?.kind, 'unknown_analysis');
  assert.equal(unknown.structuredContent?.resultId, undefined);

  const invalid = await call('run_analysis', {
    analysisId: 'descriptive',
    dataPath: 'iris.csv',
    set: { descVars: 'MissingColumn' },
  });
  assert.equal(invalid.isError, true);
  assert.equal(invalid.structuredContent?.code, 'E_PARAMS');
  assert.equal(invalid.structuredContent?.kind, 'column_not_found');
  assert.equal(invalid.structuredContent?.resultId, undefined);
  assert.ok(invalid.structuredContent?.diagnostics);

  const missing = await call('inspect_dataset', { path: 'missing.csv' });
  assert.equal(missing.isError, true);
  assert.equal(missing.structuredContent?.code, 'E_DATA');
  assert.equal(missing.structuredContent?.kind, 'file_not_found');

  const huge = await call('inspect_dataset', { path: 'huge.csv' });
  assert.equal(huge.isError, true);
  assert.equal(huge.structuredContent?.code, 'E_DATA');
  assert.equal(huge.structuredContent?.kind, 'file_too_large');
});
