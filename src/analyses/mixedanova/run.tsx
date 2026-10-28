import { ResultTables } from '../../components/ResultTable';
import { mixedAnovaStats } from '../../stats/kernels/mixedanova';
import { mixedAnovaTables } from '../../stats/tables/mixedanova';
import { mixedAnovaReport } from '../../stats/reports/mixedanova';
import type { Dataset } from '../../grid/types';
import type { MixedAnovaParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface MixedAnovaInput {
  grid: Dataset;
  params: MixedAnovaParams;
  ciLevel: number;
}

/** ANOVA mista split-plot: fattore between e condizioni within. */
export const buildMixedAnovaOutput = ({ grid, params, ciLevel }: MixedAnovaInput): AnalysisRunResult => {
  if (params.conditions.length < 2) {
    return { ok: false, reason: 'Select at least two within-subject conditions' };
  }
  if (params.conditions.includes(params.group)) {
    return { ok: false, reason: 'The group column cannot also be a within-subject condition' };
  }
  const stats = mixedAnovaStats({
    rows: grid.rows,
    groupIdx: params.group,
    conditionIdxs: params.conditions,
    level: ciLevel,
  });
  if (!stats) {
    return {
      ok: false,
      reason: 'Mixed ANOVA needs at least two groups with two subjects and two complete conditions',
    };
  }
  const conditionNames = params.conditions.map(index => grid.cols[index]?.name ?? `C${index + 1}`);
  const groupName = grid.cols[params.group]?.name ?? 'Group';
  const tables = mixedAnovaTables(stats, conditionNames, groupName);
  return {
    ok: true,
    tables,
    report: mixedAnovaReport(stats, groupName, ciLevel),
    node: (
      <div className="mb-6">
        <ResultTables specs={tables} />
      </div>
    ),
  };
};
