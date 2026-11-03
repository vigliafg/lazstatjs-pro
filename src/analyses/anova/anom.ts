import { makeChart } from '../../charts/kits/common';
import { copy } from '../../stats/reportCopy';
import { analysisRows } from '../../grid/types';
import { anom } from '../../stats/kernels/anom';
import { anomTables } from '../../stats/tables/anom';
import { anomReport } from '../../stats/reports/anom';
import type { Dataset } from '../../grid/types';
import type { AnovaParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { AnalysisRunResult } from '../types';

export interface AnomRunInput {
  grid: Dataset;
  anovaParams: AnovaParams;
  ciLevel: number;
}

/** ANOM: group means against grand mean and decision lines. */
export const buildAnomOutput = ({ grid, anovaParams }: AnomRunInput): AnalysisRunResult => {
  const { dep, grp, alpha } = anovaParams;
  const alphaValue = alpha && alpha > 0 && alpha < 1 ? alpha : 0.05;
  if (grp === dep) {
    return { ok: false, reason: 'The group variable must differ from the dependent variable' };
  }

  const rows = analysisRows(grid, [grp]);
  const result = anom(rows, dep, grp, alphaValue);
  if (!result) {
    return {
      ok: false,
      reason: 'ANOM needs at least two groups and at least one residual degree of freedom',
    };
  }

  const depName = grid.cols[dep]?.name ?? 'Y';
  const groupName = grid.cols[grp]?.name ?? 'Group';
  const names = { dep: depName, group: groupName };
  const tables = anomTables(result, names);

  const intervals = result.groups.map(group => ({
    category: group.group,
    estimate: group.mean,
    lo: group.lower,
    hi: group.upper,
  }));

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'anom-decision-lines',
      kind: 'interval',
      title: copy('ANOM — medie e linee di decisione'),
      subtitle: copy('Media generale {s1} · α = {s2}', {
        s1: result.grandMean.toFixed(3),
        s2: result.alpha,
      }),
      note: copy('Le barre sono i limiti di decisione: un gruppo fuori dagli estremi è un segnale da approfondire.'),
      data: { intervals },
      fields: { xLabel: groupName, yLabel: depName },
      options: { valueLabels: true, showMeanDiamond: true, sort: 'none' } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('ANOM — {s1}', { s1: depName }),
    tables,
    report: anomReport(tables, names, Math.round(result.alpha * 100)),
    charts,
  };
};
