import { mixedAnovaStats } from '../../stats/kernels/mixedanova';
import { mixedAnovaTables } from '../../stats/tables/mixedanova';
import { mixedAnovaReport } from '../../stats/reports/mixedanova';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { tCrit } from '../../stats/distributions';
import { parseNum } from '../../stats/core';
import type { AnalysisChart, ChartRow } from '../../stats/charts';
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
  const tables = mixedAnovaTables(stats, conditionNames, groupName, ciLevel);

  const cellValues = new Map<string, number[]>();
  grid.rows.forEach(row => {
    const group = String(row[params.group] ?? '').trim();
    if (group === '') return;
    params.conditions.forEach((column, ci) => {
      const value = parseNum(row[column]);
      if (!Number.isFinite(value)) return;
      const key = `${group}|${ci}`;
      cellValues.set(key, [...(cellValues.get(key) ?? []), value]);
    });
  });
  const cellInterval = (group: string, ci: number): { lo: number; hi: number } | null => {
    const values = cellValues.get(`${group}|${ci}`) ?? [];
    if (values.length < 2) return null;
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance =
      values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / (values.length - 1);
    const se = Math.sqrt(variance / values.length);
    const crit = tCrit(ciLevel, values.length - 1);
    return { lo: mean - crit * se, hi: mean + crit * se };
  };

  const interaction: ChartRow[] = stats.groups.flatMap((group, gi) =>
    conditionNames.map((condition, ci) => {
      const band = cellInterval(group, ci);
      return {
        x: condition,
        y: stats.cellMeans[gi][ci],
        ...(band ? { lo: band.lo, hi: band.hi } : {}),
        series: `${groupName} = ${group}`,
      };
    })
  );

  const subjects: ChartRow[] = [];
  grid.rows.forEach((row, index) => {
    if (index >= 40) return;
    const group = String(row[params.group] ?? '').trim();
    const values = params.conditions.map(column => parseNum(row[column]));
    if (group === '' || values.some(value => !Number.isFinite(value))) return;
    values.forEach((value, ci) => {
      subjects.push({ x: conditionNames[ci], y: value, series: `${copy('Soggetto')} ${index + 1}` });
    });
  });

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'mixed-interaction',
      kind: 'line',
      title: copy('Interazione gruppo × condizione'),
      subtitle: `${groupName} × ${conditionNames.join(' / ')}`,
      note: copy('Linee non parallele indicano un’interazione tra il fattore tra soggetti e la condizione entro soggetti; la banda è l’intervallo di confidenza della media di cella.'),
      data: { series: interaction },
      fields: { xType: 'nominal', xLabel: copy('Condizione'), yLabel: copy('Media'), series: groupName },
      options: { showMarkers: true, showBand: true } as never,
    }),
  ];
  if (subjects.length > 0) {
    charts.push(
      makeChart({
        id: 'mixed-trajectories',
        kind: 'line',
        title: copy('Traiettorie dei soggetti'),
        subtitle: copy('Prime {s1} righe complete', { s1: Math.min(40, grid.rows.length) }),
        note: copy('Ogni linea è un soggetto attraverso le condizioni; serve a vedere la variabilità individuale.'),
        data: { series: subjects, markers: subjects },
        fields: { xType: 'nominal', xLabel: copy('Condizione'), yLabel: copy('Valore'), series: copy('Soggetto') },
        options: { showMarkers: true, showBand: false, showLegend: false } as never,
      })
    );
  }

  return {
    ok: true,
    title: copy('ANOVA mista: {s1} per {s2}', { s1: conditionNames.join(', '), s2: groupName }),
    tables,
    report: mixedAnovaReport(stats, groupName, ciLevel),
    charts,
  };
};
