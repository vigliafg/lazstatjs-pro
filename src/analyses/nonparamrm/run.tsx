import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryTheme,
} from 'victory';
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
import { ResultTables } from '../../components/ResultTable';
import { parseNum } from '../../stats/core';
import { analysisRows, type GridData } from '../../grid/types';
import type { NonParamParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { isNumericColumn } from '../shared/columns';
import { isBinaryColumn, levelsOf } from './defaults';

export interface NonParamInput {
  grid: GridData;
  params: NonParamParams;
  ciLevel: number;
}

const gridTheme = {
  ...VictoryTheme.material,
  axis: {
    style: {
      axis: { stroke: '#333' },
      tickLabels: { fill: '#888', fontSize: 9 },
      grid: { stroke: '#222' },
      axisLabel: { fill: '#888', fontSize: 10, padding: 30 },
    },
  },
};

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
  const blocks: number[][] = [];
  grid.rows.forEach(row => {
    const values = columns.map(index => parseNum(row[index]));
    if (values.every(value => Number.isFinite(value))) blocks.push(values);
  });
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

  return {
    ok: true,
    tables,
    report: friedmanReport(tables, names, ciLevel),
    node: (
      <div className="mb-6">
        <p className="text-[10px] text-text3 font-mono mb-3">
          {`Friedman · ${blocks.length} blocchi · ${columns.length} misure ripetute`}
        </p>
        <ResultTables specs={tables} />
        <section className="mb-6">
          <h3 className="text-[11px] text-accent2 font-semibold uppercase tracking-wider mb-2">
            Ranghi medi
          </h3>
          <div className="h-[260px] w-full bg-surface3/30 rounded p-2">
            <VictoryChart theme={gridTheme} domainPadding={{ x: 30 }} padding={{ top: 15, bottom: 55, left: 55, right: 20 }}>
              <VictoryAxis style={gridTheme.axis.style} />
              <VictoryAxis dependentAxis style={gridTheme.axis.style} />
              <VictoryBar
                data={data}
                style={{ data: { fill: '#4f9cf9' } }}
                labels={({ datum }) => datum.y.toFixed(2)}
              />
            </VictoryChart>
          </div>
        </section>
      </div>
    ),
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

  return {
    ok: true,
    tables,
    report: mcnemarReport(tables, names, ciLevel),
    node: (
      <div className="mb-6">
        <p className="text-[10px] text-text3 font-mono mb-3">
          {`McNemar · ${pairs.length} coppie · evento = valore più alto`}
        </p>
        <ResultTables specs={tables} />
      </div>
    ),
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
    tables,
    report: cochranReport(tables, names, ciLevel),
    node: (
      <div className="mb-6">
        <p className="text-[10px] text-text3 font-mono mb-3">
          {`Cochran Q · ${result.n} blocchi · ${result.k} condizioni binarie`}
        </p>
        <ResultTables specs={tables} />
        <section className="mb-6">
          <h3 className="text-[11px] text-accent2 font-semibold uppercase tracking-wider mb-2">
            Proporzione di successi
          </h3>
          <div className="h-[260px] w-full bg-surface3/30 rounded p-2">
            <VictoryChart theme={gridTheme} domain={{ y: [0, 1] }} domainPadding={{ x: 30 }} padding={{ top: 15, bottom: 55, left: 55, right: 20 }}>
              <VictoryAxis style={gridTheme.axis.style} />
              <VictoryAxis dependentAxis style={gridTheme.axis.style} />
              <VictoryBar
                data={data}
                style={{ data: { fill: '#34d399' } }}
                labels={({ datum }) => datum.y.toFixed(2)}
              />
            </VictoryChart>
          </div>
        </section>
      </div>
    ),
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

  return {
    ok: true,
    tables,
    report: jonckheereReport(tables, names, ciLevel),
    node: (
      <div className="mb-6">
        <p className="text-[10px] text-text3 font-mono mb-3">
          {`Jonckheere–Terpstra · ${grid.cols[outcome]?.name} per ${grid.cols[group]?.name} · ordine: ${names.join(' < ')}`}
        </p>
        <ResultTables specs={tables} />
      </div>
    ),
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
