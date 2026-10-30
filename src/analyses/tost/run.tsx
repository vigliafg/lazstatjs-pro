import { tostStats } from '../../stats/kernels/tost';
import { tostTables } from '../../stats/tables/tost';
import { tostReport } from '../../stats/reports/tost';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { Dataset } from '../../grid/types';
import type { TostParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface TostInput {
  grid: Dataset;
  params: TostParams;
  ciLevel: number;
}

/** Two One-Sided Tests per equivalenza / non-inferiorità. */
export const buildTostOutput = ({ grid, params, ciLevel }: TostInput): AnalysisRunResult => {
  const stats = tostStats({
    design: params.design,
    rows: grid.rows,
    var1: params.var1,
    var2: params.var2,
    mu: params.mu,
    margin: params.margin,
    equalVar: params.equalVar,
    level: ciLevel,
  });
  if (!stats) {
    return {
      ok: false,
      reason:
        'TOST needs a positive margin and enough complete observations (at least two per group or two pairs)',
    };
  }

  const tables = tostTables(stats, ciLevel);
  const chart = makeChart({
    id: 'tost-difference',
    kind: 'bar',
    title: copy('TOST: differenza e margini di equivalenza'),
    subtitle: copy('Differenza {s1} · IC {s2}% · margine ±{s3}', {
      s1: stats.diff.toFixed(3),
      s2: ciLevel,
      s3: stats.margin,
    }),
    note: copy('La barra è la differenza stimata con il suo intervallo; la fascia colorata è la regione di equivalenza delimitata dai margini tratteggiati.'),
    data: {
      bars: [{ category: copy('Differenza'), value: stats.diff, lo: stats.ciLo, hi: stats.ciHi }],
      rules: [{ value: -stats.margin }, { value: stats.margin }],
      regions: [{ lo: -stats.margin, hi: stats.margin }],
    },
    fields: { xLabel: copy('Stima'), yLabel: copy('Differenza') },
    options: { error: 'ci', valueLabels: true } as never,
  });
  return {
    ok: true,
    title: copy('Equivalenza TOST'),
    tables,
    report: tostReport(tables, stats, ciLevel),
    charts: [chart],
  };
};
