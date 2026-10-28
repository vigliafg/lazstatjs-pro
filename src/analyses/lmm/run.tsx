import { ResultTables } from '../../components/ResultTable';
import { lmmStats } from '../../stats/kernels/lmm';
import { lmmTables } from '../../stats/tables/lmm';
import { lmmReport } from '../../stats/reports/lmm';
import type { Dataset } from '../../grid/types';
import type { LmmParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface LmmInput {
  grid: Dataset;
  params: LmmParams;
  ciLevel: number;
}

/** Modello lineare misto con intercetta casuale (REML). */
export const buildLmmOutput = ({ grid, params, ciLevel }: LmmInput): AnalysisRunResult => {
  if (params.indeps.length === 0) {
    return { ok: false, reason: 'Select at least one fixed predictor' };
  }
  if (params.indeps.includes(params.dep) || params.indeps.includes(params.group)) {
    return { ok: false, reason: 'Outcome and group cannot also be fixed predictors' };
  }
  if (params.dep === params.group) {
    return { ok: false, reason: 'Outcome and group must be different columns' };
  }

  const stats = lmmStats({
    rows: grid.rows,
    depIdx: params.dep,
    indepIdxs: params.indeps,
    groupIdx: params.group,
    level: ciLevel,
  });
  if (!stats) {
    return {
      ok: false,
      reason: 'The mixed model needs at least two groups, complete rows and enough observations',
    };
  }

  const depName = grid.cols[params.dep]?.name ?? 'Y';
  const predNames = params.indeps.map(index => grid.cols[index]?.name ?? `X${index + 1}`);
  const groupName = grid.cols[params.group]?.name ?? 'Group';
  const tables = lmmTables(stats, depName, predNames, groupName, ciLevel);

  return {
    ok: true,
    tables,
    report: lmmReport(stats, predNames, groupName, ciLevel),
    node: (
      <div className="mb-6">
        <ResultTables specs={tables} />
      </div>
    ),
  };
};
