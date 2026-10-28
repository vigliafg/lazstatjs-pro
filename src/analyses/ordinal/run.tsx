import { ResultTables } from '../../components/ResultTable';
import { ordinalStats } from '../../stats/kernels/ordinal';
import { ordinalTables } from '../../stats/tables/ordinal';
import { ordinalReport } from '../../stats/reports/ordinal';
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
  return {
    ok: true,
    tables,
    report: ordinalReport(stats, predNames, ciLevel),
    node: (
      <div className="mb-6">
        <ResultTables specs={tables} />
      </div>
    ),
  };
};
