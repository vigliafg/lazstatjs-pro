import { ResultTables } from '../../components/ResultTable';
import { miStats } from '../../stats/kernels/mi';
import { miTables } from '../../stats/tables/mi';
import { miReport } from '../../stats/reports/mi';
import type { Dataset } from '../../grid/types';
import type { MiParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface MiInput {
  grid: Dataset;
  params: MiParams;
  ciLevel: number;
}

/** Imputazione multipla numerica con pooling di Rubin. */
export const buildMiOutput = ({ grid, params, ciLevel }: MiInput): AnalysisRunResult => {
  if (params.variables.length === 0) {
    return { ok: false, reason: 'Select at least one variable' };
  }
  const stats = miStats({
    rows: grid.rows,
    variables: params.variables,
    imputations: params.imputations,
    iterations: params.iterations,
    level: ciLevel,
  });
  if (!stats) {
    return {
      ok: false,
      reason: 'Multiple imputation needs at least two observed values per selected variable',
    };
  }

  const names = params.variables.map(index => grid.cols[index]?.name ?? `V${index + 1}`);
  const tables = miTables(stats, names, ciLevel);
  return {
    ok: true,
    tables,
    report: miReport(tables, stats, names, ciLevel),
    node: (
      <div className="mb-6">
        <ResultTables specs={tables} />
      </div>
    ),
  };
};
