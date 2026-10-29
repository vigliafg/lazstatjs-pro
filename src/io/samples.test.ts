import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { ANALYSIS_TABS } from '../analyses/registry';
import { readDelimitedTable, readJsonTable } from './readers';
import { readStatFile } from './statfiles';
import { readXlsxSheets, xlsxSheetToTable } from './xlsx';

/**
 * Every sample is committed in five formats and described by the manifest.
 * This suite is the safety net: if a regenerated file drifts from the index,
 * the e2e tests would otherwise fail much later and with a less clear message.
 */
interface SampleExample {
  analysis: string;
  columns: Record<string, string | string[]>;
  options?: Record<string, string | number | boolean>;
}

interface SampleDataset {
  id: string;
  title: string;
  family: string;
  dir: string;
  source: string;
  rows: number;
  columns: string[];
  formats: string[];
  procedures: string[];
  examples: SampleExample[];
  notes: string;
}

interface SampleManifest {
  version: number;
  generatedBy: string;
  formats: string[];
  datasets: SampleDataset[];
}

const root = fileURLToPath(new URL('../../samples/', import.meta.url));
const manifest = JSON.parse(
  readFileSync(join(root, 'manifest.json'), 'utf8')
) as SampleManifest;

const asArrayBuffer = (bytes: Buffer): ArrayBuffer =>
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

const columnValues = (example: SampleExample): string[] =>
  Object.values(example.columns).flatMap(value => (Array.isArray(value) ? value : [value]));

test('the sample manifest is coherent with its folders', () => {
  assert.equal(manifest.version, 1);
  assert.equal(manifest.generatedBy, 'samples/generate.R');
  assert.deepEqual(manifest.formats, ['csv', 'sav', 'dta', 'xlsx', 'json']);
  assert.ok(manifest.datasets.length >= 15);

  const knownProcedures = new Set(ANALYSIS_TABS.map(tab => tab.id));
  const ids = new Set<string>();
  for (const dataset of manifest.datasets) {
    assert.ok(dataset.title.trim().length > 0, `${dataset.id}: empty title`);
    assert.ok(dataset.source.trim().length > 0, `${dataset.id}: empty source`);
    assert.ok(dataset.rows > 0, `${dataset.id}: no rows`);
    assert.ok(dataset.columns.length > 0, `${dataset.id}: no columns`);
    assert.equal(new Set(dataset.columns).size, dataset.columns.length, `${dataset.id}: duplicate columns`);
    assert.equal(dataset.dir, `${dataset.family}/${dataset.id}`);
    assert.equal(ids.has(dataset.id), false, `${dataset.id}: duplicate id`);
    ids.add(dataset.id);
    assert.ok(dataset.procedures.length > 0, `${dataset.id}: no procedure`);
    for (const procedure of dataset.procedures) {
      assert.ok(knownProcedures.has(procedure), `${dataset.id}: unknown procedure ${procedure}`);
    }
    assert.deepEqual(dataset.formats, manifest.formats);

    for (const format of dataset.formats) {
      assert.ok(
        existsSync(join(root, dataset.dir, `data.${format}`)),
        `${dataset.id}: missing data.${format}`
      );
    }

    for (const example of dataset.examples) {
      assert.ok(dataset.procedures.includes(example.analysis), `${dataset.id}: unknown example ${example.analysis}`);
      for (const column of columnValues(example)) {
        assert.ok(dataset.columns.includes(column), `${dataset.id}: example references unknown column ${column}`);
      }
    }
  }
});

test('every data-driven analysis has at least one sample', () => {
  // Chi-square, contingency and sample size are table/parameter driven and do
  // not read the grid, so they intentionally have no dataset.
  const manualOnly = new Set(['chisquare', 'contingency', 'samplesize']);
  const covered = new Set(manifest.datasets.flatMap(dataset => dataset.procedures));
  const missing = ANALYSIS_TABS.map(tab => tab.id).filter(
    id => !manualOnly.has(id) && !covered.has(id)
  );
  assert.deepEqual(missing, []);
});

test('every sample parses in CSV, JSON and Excel', () => {
  for (const dataset of manifest.datasets) {
    const directory = join(root, dataset.dir);
    const csv = readDelimitedTable(readFileSync(join(directory, 'data.csv'), 'utf8'), {
      delimiter: ',',
      hasHeader: true,
    });
    const json = readJsonTable(readFileSync(join(directory, 'data.json'), 'utf8'));
    const sheets = readXlsxSheets(new Uint8Array(readFileSync(join(directory, 'data.xlsx'))));
    const xlsx = xlsxSheetToTable(sheets[0], { hasHeader: true });

    for (const [format, table] of [
      ['csv', csv],
      ['json', json],
      ['xlsx', xlsx],
    ] as const) {
      assert.equal(table.rows.length, dataset.rows, `${dataset.id}: ${format} row count`);
      assert.deepEqual(table.names, dataset.columns, `${dataset.id}: ${format} column names`);
    }
  }
});

test('every sample parses as SPSS .sav and Stata .dta', async () => {
  for (const dataset of manifest.datasets) {
    for (const format of ['sav', 'dta'] as const) {
      const bytes = readFileSync(join(root, dataset.dir, `data.${format}`));
      const table = await readStatFile(`data.${format}`, asArrayBuffer(bytes));
      assert.equal(table.rows.length, dataset.rows, `${dataset.id}: ${format} row count`);
      assert.deepEqual(table.names, dataset.columns, `${dataset.id}: ${format} column names`);
    }
  }
});

test('binary samples preserve value labels where the source has them', async () => {
  const cases: { dir: string; column: string; type: string; level?: string }[] = [
    { dir: 'descriptive/iris', column: 'Species', type: 'cat', level: 'setosa' },
    { dir: 'compare/toothgrowth', column: 'Dose', type: 'cat', level: 'High' },
    { dir: 'survival/lung', column: 'Sex', type: 'int' },
  ];
  for (const entry of cases) {
    const bytes = readFileSync(join(root, entry.dir, 'data.sav'));
    const table = await readStatFile('data.sav', asArrayBuffer(bytes));
    const index = table.names.indexOf(entry.column);
    assert.ok(index >= 0, `${entry.dir}: missing ${entry.column}`);
    assert.equal(table.types[index], entry.type, `${entry.dir}: ${entry.column} type`);
    if (entry.level) {
      assert.ok(
        table.meta?.[index]?.levels?.some(level => level.label === entry.level),
        `${entry.dir}: ${entry.column} lost its value labels`
      );
    }
  }
});
