import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import {
  repeatedAnovaReport,
  repeatedAnovaTables,
  repeatedMeasuresAnova,
} from '../../stats/repeatedAnova';
import { parseNum } from '../../stats/core';
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
  const data = names.map((name, index) => ({ x: name, y: result.means[index] }));

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
        data: { bars: data.map(point => ({ category: point.x, value: point.y })) },
        fields: { xLabel: copy('Condizione'), yLabel: copy('Media') },
        options: { valueLabels: true } as never,
      }),
    ],
  };
};
