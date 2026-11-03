import { tCrit } from '../../stats/distributions';
import { makeChart } from '../../charts/kits/common';
import { copy } from '../../stats/reportCopy';
import { analysisRows } from '../../grid/types';
import { nestedAnova } from '../../stats/kernels/nestedAnova';
import { nestedAnovaTables } from '../../stats/tables/nestedAnova';
import { nestedAnovaReport } from '../../stats/reports/nestedAnova';
import type { Dataset } from '../../grid/types';
import type { AnovaParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { AnalysisRunResult } from '../types';

export interface NestedAnovaRunInput {
  grid: Dataset;
  anovaParams: AnovaParams;
  ciLevel: number;
}

/** Nested (hierarchical) ANOVA: outer factor with an inner factor inside it. */
export const buildNestedAnovaOutput = ({ grid, anovaParams, ciLevel }: NestedAnovaRunInput): AnalysisRunResult => {
  const { dep, grp, inner } = anovaParams;
  const innerIdx = inner ?? -1;
  if (innerIdx < 0) {
    return { ok: false, reason: 'Select the inner (nested) factor' };
  }
  if (innerIdx === grp || innerIdx === dep) {
    return { ok: false, reason: 'The inner factor must differ from the outer factor and the dependent variable' };
  }

  const rows = analysisRows(grid, [grp, innerIdx]);
  const result = nestedAnova(rows, dep, grp, innerIdx);
  if (!result) {
    return {
      ok: false,
      reason:
        'The nested design needs at least two outer levels, two inner levels per outer level and at least one residual degree of freedom',
    };
  }

  const depName = grid.cols[dep]?.name ?? 'Y';
  const outerName = grid.cols[grp]?.name ?? 'Outer';
  const innerName = grid.cols[innerIdx]?.name ?? 'Inner';
  const names = { dep: depName, outer: outerName, inner: innerName };
  const tables = nestedAnovaTables(result, names);

  const critical = tCrit(ciLevel, Math.max(1, result.nTotal - result.outerLevels.length * 2));
  const intervals = result.groupStats.map(group => {
    const halfWidth = group.n > 1 ? critical * (group.sd / Math.sqrt(group.n)) : 0;
    return {
      category: `${group.outer} · ${group.group}`,
      estimate: group.mean,
      lo: group.mean - halfWidth,
      hi: group.mean + halfWidth,
    };
  });

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'nested-anova-means',
      kind: 'interval',
      title: copy('Medie per cella'),
      subtitle: copy('{s1} ± errore standard · {s2} livelli interni', {
        s1: depName,
        s2: result.innerLevels.length,
      }),
      data: { intervals },
      fields: { xLabel: `${outerName} · ${innerName}`, yLabel: depName },
      options: { valueLabels: true, showMeanDiamond: false, sort: 'none' } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('ANOVA gerarchica — {s1}', { s1: depName }),
    tables,
    report: nestedAnovaReport(tables, names, ciLevel),
    charts,
  };
};
