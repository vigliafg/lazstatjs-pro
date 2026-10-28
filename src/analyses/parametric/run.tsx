import { ResultTables } from '../../components/ResultTable';
import { parametricSurvivalStats } from '../../stats/kernels/parametric';
import { parametricTables } from '../../stats/tables/parametric';
import { parametricReport } from '../../stats/reports/parametric';
import type { Dataset } from '../../grid/types';
import type { ParametricSurvivalParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface ParametricInput {
  grid: Dataset;
  params: ParametricSurvivalParams;
  ciLevel: number;
}

/** Sopravvivenza parametrica Weibull/esponenziale (AFT). */
export const buildParametricOutput = ({ grid, params, ciLevel }: ParametricInput): AnalysisRunResult => {
  if (params.time === params.event) {
    return { ok: false, reason: 'Time and event must be different columns' };
  }
  if (params.predictors.length === 0) {
    return { ok: false, reason: 'Select at least one predictor' };
  }
  if (params.predictors.includes(params.time) || params.predictors.includes(params.event)) {
    return { ok: false, reason: 'Time and event cannot also be predictors' };
  }
  const stats = parametricSurvivalStats({
    rows: grid.rows,
    timeIdx: params.time,
    eventIdx: params.event,
    indepIdxs: params.predictors,
    distribution: params.distribution,
    level: ciLevel,
  });
  if (!stats) {
    return {
      ok: false,
      reason: 'Parametric survival needs positive times, a binary event and enough complete rows',
    };
  }
  const predNames = params.predictors.map(index => grid.cols[index]?.name ?? `X${index + 1}`);
  const tables = parametricTables(stats, ciLevel);
  return {
    ok: true,
    tables,
    report: parametricReport(stats, predNames, ciLevel),
    node: (
      <div className="mb-6">
        <ResultTables specs={tables} />
      </div>
    ),
  };
};
