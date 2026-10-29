import {
  DISTRIBUTION_LABEL,
  distributionFitReport,
  distributionFitTables,
  fitDistributions,
  probabilityPlotData,
} from '../../stats/distfit';
import { copy } from '../../stats/reportCopy';
import { parseNum } from '../../stats/core';
import { makeChart } from '../../charts/kits/common';
import type { Dataset } from '../../grid/types';
import type { DistributionFitParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface DistributionFitInput {
  grid: Dataset;
  params: DistributionFitParams;
  ciLevel: number;
}

/** Calcolo, probability plot e tabelle del fit delle distribuzioni. */
export const buildDistributionFitOutput = ({
  grid,
  params,
  ciLevel,
}: DistributionFitInput): AnalysisRunResult => {
  const values = grid.rows
    .map(row => parseNum(row[params.variable]))
    .filter(value => Number.isFinite(value));

  if (values.length < 3) {
    return { ok: false, reason: 'Select a numeric variable with at least three valid values' };
  }
  if (params.selected.length === 0) {
    return { ok: false, reason: 'Select at least one distribution to fit' };
  }

  const tables = distributionFitTables(values, params.selected, ciLevel);
  if (tables.length === 0) {
    return {
      ok: false,
      reason: 'No distribution could be fitted: positive-support models need values greater than zero',
    };
  }

  const fits = fitDistributions(values, params.selected);
  const best = fits[0];
  const plot = probabilityPlotData(best, values);
  const min = Math.min(...plot.flatMap(point => [point.x, point.y]));
  const max = Math.max(...plot.flatMap(point => [point.x, point.y]));
  const reference = [
    { x: min, y: min },
    { x: max, y: max },
  ];
  const variableName = grid.cols[params.variable]?.name ?? 'Y';

  return {
    ok: true,
    title: copy('Fit della distribuzione: {s1}', { s1: variableName }),
    tables,
    report: distributionFitReport(tables, ciLevel),
    charts: [
      makeChart({
        id: 'distfit-probability',
        kind: 'qq',
        title: copy('Grafico di probabilità'),
        subtitle: `${DISTRIBUTION_LABEL[best.name]} · ${variableName}`,
        note: copy('Più i punti stanno sulla diagonale, meglio la distribuzione descrive i dati. Le deviazioni alle estremità indicano code mal descritte.'),
        data: { points: plot, reference },
        fields: {
          xLabel: copy('Quantili teorici'),
          yLabel: copy('Valori osservati'),
        },
      }),
    ],
  };
};
