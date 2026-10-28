import { ResultTables } from '../../components/ResultTable';
import { countRegressionStats } from '../../stats/kernels/countreg';
import { countTables } from '../../stats/tables/countreg';
import { countReport } from '../../stats/reports/countreg';
import type { Dataset } from '../../grid/types';
import type { CountParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface CountInput {
  grid: Dataset;
  params: CountParams;
  ciLevel: number;
}

/** Regressione di Poisson o binomiale negativa per conteggi. */
export const buildCountOutput = ({ grid, params, ciLevel }: CountInput): AnalysisRunResult => {
  if (params.indeps.length === 0) {
    return { ok: false, reason: 'Select at least one predictor' };
  }
  if (params.indeps.includes(params.dep)) {
    return { ok: false, reason: 'The outcome cannot also be a predictor' };
  }
  const stats = countRegressionStats({
    family: params.family,
    rows: grid.rows,
    depIdx: params.dep,
    indepIdxs: params.indeps.filter(index => index !== params.dep),
    level: ciLevel,
  });
  if (!stats) {
    return {
      ok: false,
      reason: 'Count regression needs non-negative counts and enough complete rows',
    };
  }

  const tables = countTables(stats, ciLevel);
  return {
    ok: true,
    tables,
    report: countReport(tables, stats, ciLevel),
    node: (
      <div className="mb-6">
        <ResultTables specs={tables} />
      </div>
    ),
  };
};
