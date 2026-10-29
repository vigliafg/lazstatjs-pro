import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import {
  repeatedAnovaReport,
  repeatedAnovaTables,
  repeatedMeasuresAnova,
} from '../../stats/repeatedAnova';
import { parseNum } from '../../stats/core';
import { jStat } from '../../stats/jstat';
import type { Dataset } from '../../grid/types';
import type { RepeatedAnovaParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { isNumericColumn } from '../shared/columns';
import { completeNumericRows } from '../shared/data';

export interface RepeatedAnovaInput {
  grid: Dataset;
  params: RepeatedAnovaParams;
  ciLevel: number;
}

/** ANOVA per misure ripetute: tabelle, medie per condizione e report. */
export const buildRepeatedAnovaOutput = ({
  grid,
  params,
  ciLevel,
}: RepeatedAnovaInput): AnalysisRunResult => {
  const columns = params.selected.filter(index => isNumericColumn(grid, index));
  if (columns.length < 3) {
    return {
      ok: false,
      reason: 'Select at least three numeric columns measured on the same rows',
    };
  }

  const blocks = completeNumericRows(grid, columns);
  if (blocks.length < 3) {
    return {
      ok: false,
      reason: 'Not enough complete rows: every condition must be numeric and present',
    };
  }

  const result = repeatedMeasuresAnova(blocks);
  if (!result) {
    return {
      ok: false,
      reason: 'The model could not be estimated: check the selected columns and complete rows',
    };
  }

  const names = columns.map(index => grid.cols[index]?.name ?? `Var${index + 1}`);
  const tables = repeatedAnovaTables(result, names, ciLevel);
  const critical = result.dfError > 0
    ? jStat.studentt.inv(1 - (1 - ciLevel / 100) / 2, result.dfError)
    : 1.96;
  const bars = names.map((name, index) => {
    const mean = result.means[index];
    const se = result.sds[index] / Math.sqrt(result.n);
    return { category: name, value: mean, lo: mean - critical * se, hi: mean + critical * se };
  });
  const trajectories = blocks.slice(0, 30).flatMap((row, subject) =>
    names.map((name, index) => ({
      x: name,
      y: row[index],
      series: copy('Soggetto {s1}', { s1: subject + 1 }),
    }))
  );

  return {
    ok: true,
    title: copy('ANOVA per misure ripetute'),
    tables,
    report: repeatedAnovaReport(tables, names, ciLevel),
    charts: [
      makeChart({
        id: 'repeated-means',
        kind: 'bar',
        title: copy('Medie per condizione'),
        subtitle: copy('{s1} soggetti · {s2} condizioni', { s1: result.n, s2: result.k }),
        data: { bars },
        fields: { xLabel: copy('Condizione'), yLabel: copy('Media') },
        options: { valueLabels: true, error: 'ci' } as never,
      }),
      makeChart({
        id: 'repeated-trajectories',
        kind: 'line',
        title: copy('Traiettorie dei soggetti'),
        subtitle: copy('{s1} soggetti · {s2} condizioni', { s1: Math.min(30, result.n), s2: result.k }),
        note: copy('Ogni linea è un soggetto attraverso le condizioni; linee non parallele indicano risposte diverse al trattamento.'),
        data: { series: trajectories },
        fields: { xType: 'nominal', xLabel: copy('Condizione'), yLabel: copy('Valore'), series: copy('Soggetto') },
        options: { showMarkers: true, showBand: false } as never,
      }),
    ],
  };
};
