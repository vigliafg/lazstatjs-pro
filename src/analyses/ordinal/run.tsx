import { ordinalStats } from '../../stats/kernels/ordinal';
import { ordinalTables } from '../../stats/tables/ordinal';
import { ordinalReport } from '../../stats/reports/ordinal';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { Dataset } from '../../grid/types';
import type { OrdinalParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface OrdinalInput {
  grid: Dataset;
  params: OrdinalParams;
  ciLevel: number;
}

/** Regressione logistica ordinale a odds proporzionali. */
export const buildOrdinalOutput = ({ grid, params, ciLevel }: OrdinalInput): AnalysisRunResult => {
  if (params.indeps.length === 0) {
    return { ok: false, reason: 'Select at least one predictor' };
  }
  if (params.indeps.includes(params.dep)) {
    return { ok: false, reason: 'The outcome cannot also be a predictor' };
  }
  const stats = ordinalStats({
    rows: grid.rows,
    depIdx: params.dep,
    indepIdxs: params.indeps,
    level: ciLevel,
  });
  if (!stats) {
    return {
      ok: false,
      reason: 'Ordinal regression needs at least three ordered categories and enough complete rows',
    };
  }

  const predNames = params.indeps.map(index => grid.cols[index]?.name ?? `X${index + 1}`);
  const tables = ordinalTables(stats, ciLevel);
  const series = stats.categories.flatMap((category, categoryIndex) =>
    stats.profile.map(point => ({
      x: point.x,
      y: point.probabilities[categoryIndex] * 100,
      series: category,
    }))
  );
  return {
    ok: true,
    title: copy('Regressione ordinale: {s1}', { s1: grid.cols[params.dep]?.name ?? 'Y' }),
    tables,
    report: ordinalReport(stats, predNames, ciLevel),
    charts: [
      makeChart({
        id: 'ordinal-probabilities',
        kind: 'line',
        title: copy('Probabilità predette per categoria'),
        subtitle: copy('Profilo di {s1}; altri predittori alla media', { s1: predNames[0] ?? 'X1' }),
        note: copy('Le curve mostrano come cambia la probabilità di ciascuna categoria al variare del primo predittore.'),
        data: { series },
        fields: { xLabel: predNames[0] ?? 'X1', yLabel: copy('Probabilità (%)'), series: copy('Categoria') },
        options: { showBand: false } as never,
      }),
    ],
  };
};
