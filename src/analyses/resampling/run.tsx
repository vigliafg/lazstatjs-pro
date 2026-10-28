import { ResultTables } from '../../components/ResultTable';
import { resamplingStats } from '../../stats/kernels/resampling';
import { resamplingTables } from '../../stats/tables/resampling';
import { resamplingReport } from '../../stats/reports/resampling';
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
  return {
    ok: true,
    tables,
    report: resamplingReport(stats, ciLevel),
    node: (
      <div className="mb-6">
        <ResultTables specs={tables} />
      </div>
    ),
  };
};
