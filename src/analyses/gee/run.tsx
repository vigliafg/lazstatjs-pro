import { ResultTables } from '../../components/ResultTable';
import { geeStats } from '../../stats/kernels/gee';
import { geeTables } from '../../stats/tables/gee';
import { geeReport } from '../../stats/reports/gee';
import type { Dataset } from '../../grid/types';
import type { GeeParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface GeeInput {
  grid: Dataset;
  params: GeeParams;
  ciLevel: number;
}

/** GEE con errori standard robusti per cluster. */
export const buildGeeOutput = ({ grid, params, ciLevel }: GeeInput): AnalysisRunResult => {
  if (params.indeps.length === 0) {
    return { ok: false, reason: 'Select at least one predictor' };
  }
  if (params.indeps.includes(params.dep) || params.indeps.includes(params.cluster)) {
    return { ok: false, reason: 'Outcome and cluster cannot also be predictors' };
  }
  if (params.dep === params.cluster) {
    return { ok: false, reason: 'Outcome and cluster must be different columns' };
  }
  const stats = geeStats({
    rows: grid.rows,
    depIdx: params.dep,
    indepIdxs: params.indeps,
    clusterIdx: params.cluster,
    family: params.family,
    correlation: params.correlation,
    level: ciLevel,
  });
  if (!stats) {
    return { ok: false, reason: 'GEE needs at least two clusters and complete rows' };
  }
  const tables = geeTables(stats, ciLevel);
  return {
    ok: true,
    tables,
    report: geeReport(stats, ciLevel),
    node: (
      <div className="mb-6">
        <ResultTables specs={tables} />
      </div>
    ),
  };
};
