import { ResultTables } from '../../components/ResultTable';
import { tostStats } from '../../stats/kernels/tost';
import { tostTables } from '../../stats/tables/tost';
import { tostReport } from '../../stats/reports/tost';
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
  return {
    ok: true,
    tables,
    report: tostReport(tables, stats, ciLevel),
    node: (
      <div className="mb-6">
        <ResultTables specs={tables} />
      </div>
    ),
  };
};
