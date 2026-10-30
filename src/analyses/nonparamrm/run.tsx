import { copy } from '../../stats/reportCopy';
import { makeChart, boxRows } from '../../charts/kits/common';
import {
  cochranQ,
  cochranReport,
  cochranTables,
  friedmanReport,
  friedmanTables,
  friedmanTest,
  jonckheereReport,
  jonckheereTables,
  jonckheereTerpstra,
  mcnemarReport,
  mcnemarTables,
  mcnemarTest,
  nemenyiPosthoc,
} from '../../stats/repeated';
import { parseNum } from '../../stats/core';
import { analysisRows, type Dataset } from '../../grid/types';
import type { NonParamParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { isNumericColumn } from '../shared/columns';
import { completeNumericRows } from '../shared/data';
import { isBinaryColumn, levelsOf } from './defaults';

export interface NonParamInput {
  grid: Dataset;
  params: NonParamParams;
  ciLevel: number;
}

const buildFriedman = (
  { grid, params, ciLevel }: NonParamInput
): AnalysisRunResult => {
  const columns = params.selected.filter(index => isNumericColumn(grid, index));
  if (columns.length < 3) {
    return {
      ok: false,
      reason: 'Select at least three numeric columns measured on the same rows',
    };
  }
  const blocks = completeNumericRows(grid, columns);
  if (blocks.length < 2) {
    return {
      ok: false,
      reason: 'Not enough complete rows: every selected column must be numeric',
    };
  }
  const test = friedmanTest(blocks);
  if (!test) {
    return {
      ok: false,
      reason: 'The test could not be computed: check for constant or tied columns',
    };
  }
  const names = columns.map(index => grid.cols[index]?.name ?? `Var${index + 1}`);
  const posthoc = nemenyiPosthoc(test, ciLevel);
  const tables = friedmanTables(test, posthoc, names, ciLevel);
  const data = names.map((name, index) => ({ x: name, y: test.meanRanks[index] }));
  const posthocCells = names.flatMap((rowName, i) =>
    names.map((columnName, j) => {
      if (i === j) return { x: columnName, y: rowName, value: 1, label: '—' };
      const pair = posthoc.pairs.find(item => (item.a === i && item.b === j) || (item.a === j && item.b === i));
      return {
        x: columnName,
        y: rowName,
        value: pair ? pair.p : 1,
        label: pair ? pair.p.toFixed(3) : '—',
      };
    })
  );

  return {
    ok: true,
    title: copy('Friedman: ranghi medi'),
    tables,
    report: friedmanReport(tables, names, ciLevel),
    charts: [
      makeChart({
        id: 'friedman-ranks',
        kind: 'bar',
        title: copy('Ranghi medi'),
        subtitle: copy('{s1} blocchi · {s2} misure ripetute', { s1: blocks.length, s2: columns.length }),
        data: { bars: data.map(point => ({ category: point.x, value: point.y })) },
        fields: { xLabel: copy('Condizione'), yLabel: copy('Rango medio') },
        options: { valueLabels: true } as never,
      }),
      makeChart({
        id: 'friedman-posthoc',
        kind: 'heatmap',
        title: copy('Confronti a coppie (Nemenyi)'),
        subtitle: copy('p non corrette · {s1} blocchi', { s1: blocks.length }),
        note: copy('Valori bassi indicano coppie con ranghi diversi; la correzione Nemenyi controlla i confronti multipli.'),
        data: { cells: posthocCells },
        fields: { xLabel: copy('Condizione'), yLabel: copy('Condizione') },
        options: { showValues: true, diverging: false } as never,
      }),
    ],
  };
};

const buildMcNemar = (
  { grid, params, ciLevel }: NonParamInput
): AnalysisRunResult => {
  const { left, right } = params;
  if (left === right) {
    return { ok: false, reason: 'Choose two different binary columns' };
  }
  const leftLevels = levelsOf(grid, left);
  const rightLevels = levelsOf(grid, right);
  if (leftLevels.length !== 2 || rightLevels.length !== 2) {
    return {
      ok: false,
      reason: 'McNemar needs two columns with exactly two values each (for example 0/1 or no/yes)',
    };
  }
  const pairs: [number, number][] = [];
  grid.rows.forEach(row => {
    const a = String(row[left] ?? '').trim();
    const b = String(row[right] ?? '').trim();
    if (a === '' || b === '') return;
    if (!leftLevels.includes(a) || !rightLevels.includes(b)) return;
    pairs.push([a === leftLevels[1] ? 1 : 0, b === rightLevels[1] ? 1 : 0]);
  });
  const result = mcnemarTest(pairs);
  if (!result) {
    return {
      ok: false,
      reason: 'Not enough valid pairs: both columns must be complete and binary',
    };
  }
  const names: [string, string] = [
    `${grid.cols[left]?.name ?? 'X1'} (${leftLevels[1]})`,
    `${grid.cols[right]?.name ?? 'X2'} (${rightLevels[1]})`,
  ];
  const tables = mcnemarTables(result, names, ciLevel);

  const discordant = [
    { category: copy('Entrambi positivi'), value: result.a },
    { category: copy('Solo {s1}', { s1: names[0] }), value: result.b },
    { category: copy('Solo {s1}', { s1: names[1] }), value: result.c },
    { category: copy('Entrambi negativi'), value: result.d },
  ];
  return {
    ok: true,
    title: copy('McNemar: accordo tra misure binarie'),
    tables,
    report: mcnemarReport(tables, names, ciLevel),
    charts: [
      makeChart({
        id: 'mcnemar-discordant',
        kind: 'bar',
        title: copy('Coppie concordanti e discordanti'),
        subtitle: copy('{s1} coppie · p esatto = {s2}', { s1: result.n, s2: result.exactP.toFixed(4) }),
        note: copy('Il test usa le coppie discordanti: quelle in cui i due valutatori non concordano.'),
        data: { bars: discordant },
        fields: { xLabel: copy('Categoria'), yLabel: copy('Conteggio') },
        options: { valueLabels: true } as never,
      }),
    ],
  };
};

const buildCochran = (
  { grid, params, ciLevel }: NonParamInput
): AnalysisRunResult => {
  const columns = params.selected.filter(index => isBinaryColumn(grid, index));
  if (columns.length < 3) {
    return {
      ok: false,
      reason: 'Select at least three binary columns measured on the same rows',
    };
  }
  const levels = columns.map(index => levelsOf(grid, index));
  if (levels.some(values => values.length !== 2)) {
    return {
      ok: false,
      reason: 'Cochran Q needs binary columns with exactly two values',
    };
  }
  const blocks: number[][] = [];
  grid.rows.forEach(row => {
    const values = columns.map((index, position) => {
      const value = String(row[index] ?? '').trim();
      if (value === '') return NaN;
      return value === levels[position][1] ? 1 : 0;
    });
    if (values.every(value => value === 0 || value === 1)) blocks.push(values);
  });
  const result = cochranQ(blocks);
  if (!result) {
    return {
      ok: false,
      reason: 'The test could not be computed: need complete rows and at least three conditions',
    };
  }
  const names = columns.map(index => grid.cols[index]?.name ?? `Var${index + 1}`);
  const tables = cochranTables(result, names, ciLevel);
  const data = names.map((name, index) => ({
    x: name,
    y: result.successes[index] / result.n,
  }));

  return {
    ok: true,
    title: copy('Cochran Q: proporzione di successi'),
    tables,
    report: cochranReport(tables, names, ciLevel),
    charts: [
      makeChart({
        id: 'cochran-proportions',
        kind: 'bar',
        title: copy('Proporzione di successi'),
        subtitle: copy('{s1} blocchi · {s2} condizioni binarie', { s1: result.n, s2: result.k }),
        data: { bars: data.map(point => ({ category: point.x, value: point.y })) },
        fields: { xLabel: copy('Condizione'), yLabel: copy('Proporzione') },
        options: { valueLabels: true, zeroBaseline: true } as never,
      }),
    ],
  };
};

const buildJonckheere = (
  { grid, params, ciLevel }: NonParamInput
): AnalysisRunResult => {
  const { outcome, group } = params;
  if (outcome === group) {
    return {
      ok: false,
      reason: 'The outcome and the ordered group column must be different',
    };
  }
  if (!isNumericColumn(grid, outcome)) {
    return { ok: false, reason: 'The outcome column must be numeric' };
  }
  const groupLevels = levelsOf(grid, group);
  if (groupLevels.length < 2 || groupLevels.length > 10) {
    return {
      ok: false,
      reason: 'The ordered group column needs between 2 and 10 distinct values',
    };
  }
  const buckets: number[][] = groupLevels.map(() => []);
  analysisRows(grid, [group]).forEach(row => {
    const value = parseNum(row[outcome]);
    const label = String(row[group] ?? '').trim();
    const index = groupLevels.indexOf(label);
    if (Number.isFinite(value) && index >= 0) buckets[index].push(value);
  });
  if (buckets.some(bucket => bucket.length === 0)) {
    return { ok: false, reason: 'Every group needs at least one numeric observation' };
  }
  const result = jonckheereTerpstra(buckets);
  if (!result) {
    return {
      ok: false,
      reason: 'The test could not be computed: check the group ordering and group sizes',
    };
  }
  const names = groupLevels;
  const tables = jonckheereTables(result, buckets, names, ciLevel);

  const box = boxRows(buckets.map((values, index) => ({ category: names[index] ?? `G${index + 1}`, values })));
  return {
    ok: true,
    title: copy('Jonckheere–Terpstra: {s1} per {s2}', {
      s1: grid.cols[outcome]?.name ?? 'Y',
      s2: grid.cols[group]?.name ?? 'G',
    }),
    tables,
    report: jonckheereReport(tables, names, ciLevel),
    charts: [
      makeChart({
        id: 'jonckheere-groups',
        kind: 'box',
        title: copy('Distribuzione per gruppo ordinato'),
        subtitle: names.join(' < '),
        note: copy('Il test cerca un aumento monotono dell’esito lungo l’ordine dei gruppi.'),
        data: { summary: box.summary, points: box.points, outliers: box.outliers },
        fields: { xLabel: copy('Gruppo'), yLabel: grid.cols[outcome]?.name ?? 'Y' },
        options: { showPoints: true } as never,
      }),
    ],
  };
};

/** Test non parametrici per misure ripetute / gruppi ordinati. */
export const buildNonParamOutput = (input: NonParamInput): AnalysisRunResult => {
  switch (input.params.mode) {
    case 'mcnemar':
      return buildMcNemar(input);
    case 'cochran':
      return buildCochran(input);
    case 'jonckheere':
      return buildJonckheere(input);
    default:
      return buildFriedman(input);
  }
};
