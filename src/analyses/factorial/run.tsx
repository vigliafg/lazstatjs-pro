import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { factorialCells, factorialReport, factorialTables } from '../../stats/factorial';
import { tCrit } from '../../stats/distributions';
import { parseNum } from '../../stats/core';
import { analysisRows, naturalCompare, orderedColumnLevels, type Dataset } from '../../grid/types';
import type { FactorialParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface FactorialInput {
  grid: Dataset;
  params: FactorialParams;
  ciLevel: number;
}

/** ANOVA fattoriale 2×2+: tabelle, interaction plot e report. */
export const buildFactorialOutput = ({
  grid,
  params,
  ciLevel,
}: FactorialInput): AnalysisRunResult => {
  const { response, factorA, factorB, interaction } = params;

  if (factorA === factorB) {
    return { ok: false, reason: 'Choose two different factors' };
  }
  if (response === factorA || response === factorB) {
    return { ok: false, reason: 'The response must be different from the two factors' };
  }

  const responseValues: number[] = [];
  const labelsA: string[] = [];
  const labelsB: string[] = [];
  analysisRows(grid, [factorA, factorB]).forEach(row => {
    const value = parseNum(row[response]);
    if (!Number.isFinite(value)) return;
    responseValues.push(value);
    labelsA.push(String(row[factorA] ?? '').trim());
    labelsB.push(String(row[factorB] ?? '').trim());
  });

  if (responseValues.length < 4) {
    return { ok: false, reason: 'Not enough valid rows for the selected response' };
  }

  const options = {
    response: responseValues,
    factorA: labelsA,
    factorB: labelsB,
    responseName: grid.cols[response]?.name ?? 'Y',
    aName: grid.cols[factorA]?.name ?? 'Factor A',
    bName: grid.cols[factorB]?.name ?? 'Factor B',
    level: ciLevel,
    interaction,
  };

  const tables = factorialTables(options);
  if (tables.length === 0) {
    return {
      ok: false,
      reason:
        'The design is not estimable: some combination of the two factors has no observations. Include the interaction only when every cell is populated.',
    };
  }

  const cells = factorialCells(options);
  const orderedValues = (values: string[], column: number): string[] => {
    const declared = orderedColumnLevels(grid.cols[column], grid.rows, column).map(level => level.label);
    const present = new Set(values);
    const known = declared.filter(value => present.has(value));
    const extra = values.filter(value => !known.includes(value)).sort(naturalCompare);
    return [...known, ...extra];
  };
  const bLevels = orderedValues(Array.from(new Set(cells.map(cell => cell.b))), factorB);
  const aLevels = orderedValues(Array.from(new Set(cells.map(cell => cell.a))), factorA);
  const series = aLevels.flatMap(level =>
    bLevels
      .map(b => {
        const cell = cells.find(item => item.a === level && item.b === b);
        if (!cell) return null;
        const se = cell.n > 1 ? cell.sd / Math.sqrt(cell.n) : NaN;
        const crit = tCrit(ciLevel, Math.max(1, cell.n - 1));
        return {
          x: b,
          y: cell.mean,
          ...(Number.isFinite(se) ? { lo: cell.mean - crit * se, hi: cell.mean + crit * se } : {}),
          series: `${grid.cols[factorA]?.name} = ${level}`,
        };
      })
      .filter((row): row is { x: string; y: number; lo?: number; hi?: number; series: string } => row !== null)
  );

  return {
    ok: true,
    title: copy('ANOVA fattoriale: {s1} per {s2} × {s3}', {
      s1: grid.cols[response]?.name ?? 'Y',
      s2: grid.cols[factorA]?.name ?? 'A',
      s3: grid.cols[factorB]?.name ?? 'B',
    }),
    tables,
    report: factorialReport(tables, ciLevel),
    charts: [
      makeChart({
        id: 'factorial-interaction',
        kind: 'line',
        title: copy('Grafico dell’interazione'),
        subtitle: `${grid.cols[factorA]?.name} × ${grid.cols[factorB]?.name}`,
        note: copy('Linee non parallele indicano che l’effetto di un fattore cambia a seconda del livello dell’altro; la banda è l’intervallo di confidenza della media di cella.'),
        data: { series },
        fields: {
          xType: 'nominal',
          xLabel: grid.cols[factorB]?.name ?? 'B',
          yLabel: copy('Media'),
          series: grid.cols[factorA]?.name ?? 'A',
        },
        options: { showMarkers: true, showBand: true } as never,
      }),
    ],
  };
};
