import { resamplingStats } from '../../stats/kernels/resampling';
import { resamplingTables } from '../../stats/tables/resampling';
import { resamplingReport } from '../../stats/reports/resampling';
import { copy } from '../../stats/reportCopy';
import { makeChart, qqPoints, qqReference } from '../../charts/kits/common';
import type { Dataset } from '../../grid/types';
import type { ResamplingParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface ResamplingInput {
  grid: Dataset;
  params: ResamplingParams;
  ciLevel: number;
}

/** Permutazione e bootstrap per la differenza tra due gruppi. */
export const buildResamplingOutput = ({ grid, params, ciLevel }: ResamplingInput): AnalysisRunResult => {
  if (params.outcome === params.group) {
    return { ok: false, reason: 'Outcome and group must be different columns' };
  }
  const stats = resamplingStats({
    rows: grid.rows,
    outcomeIdx: params.outcome,
    groupIdx: params.group,
    statistic: params.statistic,
    permutations: params.permutations,
    bootstrap: params.bootstrap,
    level: ciLevel,
  });
  if (!stats) {
    return {
      ok: false,
      reason: 'Resampling needs exactly two groups and at least two complete values per group',
    };
  }
  const tables = resamplingTables(stats, ciLevel);
  const bootstrapQq = qqPoints(stats.bootstrapDifferences);
  return {
    ok: true,
    title: copy('Permutazione e bootstrap'),
    tables,
    report: resamplingReport(stats, ciLevel),
    charts: [
      makeChart({
        id: 'resampling-bootstrap',
        kind: 'bootstrap',
        title: copy('Distribuzione bootstrap della differenza'),
        subtitle: copy('{s1} ricampionamenti · IC {s2}%', { s1: stats.bootstrap, s2: ciLevel }),
        note: copy('Le linee tratteggiate sono i limiti dell’intervallo percentile; la linea continua è la differenza osservata.'),
        data: {
          values: stats.bootstrapDifferences.map(value => ({ value })),
          observed: [{ value: stats.difference }],
          ci: [{ value: stats.ciLo }, { value: stats.ciHi }],
        },
        fields: { xLabel: copy('Differenza'), yLabel: copy('Frequenza') },
        options: { showObserved: true, showCI: true, showDensity: true } as never,
      }),
      makeChart({
        id: 'resampling-permutation',
        kind: 'bootstrap',
        title: copy('Distribuzione nulla di permutazione'),
        subtitle: copy('{s1} permutazioni · p = {s2}', { s1: stats.permutations, s2: stats.pPermutation.toFixed(4) }),
        note: copy('La distribuzione mostra le differenze ottenibili se i gruppi fossero intercambiabili; la linea è la differenza osservata.'),
        data: {
          values: stats.permutationStatistics.map(value => ({ value })),
          observed: [{ value: stats.difference }],
          ci: [],
        },
        fields: { xLabel: copy('Differenza'), yLabel: copy('Frequenza') },
        options: { showObserved: true, showCI: false, showDensity: false } as never,
      }),
      ...(bootstrapQq.length > 0
        ? [
            makeChart({
              id: 'resampling-bootstrap-qq',
              kind: 'qq',
              title: copy('Q-Q della distribuzione bootstrap'),
              subtitle: copy('Quantili della distribuzione bootstrap vs normale'),
              note: copy('Se i punti seguono la retta la distribuzione bootstrap è circa normale; code o curvature indicano asimmetria e rendono l’intervallo percentile preferibile a quello normale.'),
              data: {
                points: bootstrapQq,
                reference: qqReference(bootstrapQq),
              },
              fields: { xLabel: copy('Quantile normale teorico'), yLabel: copy('Differenza bootstrap') },
              options: { showReference: true } as never,
            }),
          ]
        : []),
    ],
  };
};
