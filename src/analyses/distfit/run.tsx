import {
  DISTRIBUTION_LABEL,
  distributionCdf,
  distributionFitReport,
  distributionFitTables,
  distributionPdf,
  fitDistributions,
  probabilityPlotData,
} from '../../stats/distfit';
import { copy } from '../../stats/reportCopy';
import { parseNum } from '../../stats/core';
import { makeChart, qqBand } from '../../charts/kits/common';
import { twoSampleKs } from '../../stats/kernels/ks';
import { ksTables } from '../../stats/tables/ks';
import { ksReport } from '../../stats/reports/ks';
import type { Dataset } from '../../grid/types';
import type { DistributionFitParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface DistributionFitInput {
  grid: Dataset;
  params: DistributionFitParams;
  ciLevel: number;
}

/** Calcolo, probability plot e tabelle del fit delle distribuzioni. */
export const buildDistributionFitOutput = ({
  grid,
  params,
  ciLevel,
}: DistributionFitInput): AnalysisRunResult => {
  if (params.mode === 'ks') return buildKsOutput({ grid, params, ciLevel });
  const values = grid.rows
    .map(row => parseNum(row[params.variable]))
    .filter(value => Number.isFinite(value));

  if (values.length < 3) {
    return { ok: false, reason: 'Select a numeric variable with at least three valid values' };
  }
  if (params.selected.length === 0) {
    return { ok: false, reason: 'Select at least one distribution to fit' };
  }

  const tables = distributionFitTables(values, params.selected, ciLevel);
  if (tables.length === 0) {
    return {
      ok: false,
      reason: 'No distribution could be fitted: positive-support models need values greater than zero',
    };
  }

  const fits = fitDistributions(values, params.selected);
  const best = fits[0];
  const plot = probabilityPlotData(best, values);
  const min = Math.min(...plot.flatMap(point => [point.x, point.y]));
  const max = Math.max(...plot.flatMap(point => [point.x, point.y]));
  const reference = [
    { x: min, y: min },
    { x: max, y: max },
  ];
  const variableName = grid.cols[params.variable]?.name ?? 'Y';
  const support = values.filter(value => Number.isFinite(value));
  const densityMin = Math.min(...support);
  const densityMax = Math.max(...support);
  const densitySteps = 120;
  const densityRows = fits.flatMap(fit => {
    const label = DISTRIBUTION_LABEL[fit.name];
    return Array.from({ length: densitySteps }, (_, index) => {
      const x = densityMin + ((densityMax - densityMin) * index) / (densitySteps - 1);
      return { x, y: distributionPdf(fit, x), series: label };
    }).filter(row => Number.isFinite(row.y));
  });
  const sorted = [...support].sort((a, b) => a - b);
  const ppPoints = sorted
    .map((value, index) => ({
      x: distributionCdf(best, value),
      y: (index + 0.5) / sorted.length,
    }))
    .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
  const criteriaBars = fits.flatMap(fit => {
    const label = DISTRIBUTION_LABEL[fit.name];
    return [
      ...(Number.isFinite(fit.aic) ? [{ category: label, value: fit.aic, series: 'AIC' }] : []),
      ...(Number.isFinite(fit.bic) ? [{ category: label, value: fit.bic, series: 'BIC' }] : []),
    ];
  });
  const charts = [
    makeChart({
      id: 'distfit-probability',
      kind: 'qq',
      title: copy('Grafico di probabilità'),
      subtitle: `${DISTRIBUTION_LABEL[best.name]} · ${variableName}`,
      note: copy('Più i punti stanno sulla diagonale, meglio la distribuzione descrive i dati. Le deviazioni alle estremità indicano code mal descritte.'),
      data: { points: plot, reference, band: qqBand(plot, reference, ciLevel) },
      fields: {
        xLabel: copy('Quantili teorici'),
        yLabel: copy('Valori osservati'),
      },
      options: { showCI: true, qqAxis: 'z' } as never,
    }),
  ];
  if (ppPoints.length > 0) {
    charts.push(
      makeChart({
        id: 'distfit-pp',
        kind: 'qq',
        title: copy('P-P plot'),
        subtitle: `${DISTRIBUTION_LABEL[best.name]} · ${variableName}`,
        note: copy('Confronta la probabilità cumulata teorica con quella empirica: uno scostamento sistematico dalla diagonale indica dove il modello sbaglia.'),
        data: { points: ppPoints, reference: [{ x: 0, y: 0 }, { x: 1, y: 1 }] },
        fields: {
          xLabel: copy('Probabilità teorica'),
          yLabel: copy('Probabilità empirica'),
        },
        options: { showReference: true, qqAxis: 'z' } as never,
      })
    );
  }
  if (densityRows.length > 0) {
    charts.push(
      makeChart({
        id: 'distfit-density',
        kind: 'line',
        title: copy('Densità delle distribuzioni fittate'),
        subtitle: copy('Confronto tra le famiglie selezionate'),
        note: copy('Le curve sono le densità delle distribuzioni stimate sugli stessi dati: sovrapposizioni e code diverse spiegano perché AIC/BIC possono preferire famiglie diverse.'),
        data: { series: densityRows },
        fields: { xLabel: variableName, yLabel: copy('Densità'), series: copy('Distribuzione') },
        options: { showMarkers: false, showBand: false } as never,
      })
    );
  }
  if (criteriaBars.length > 0) {
    charts.push(
      makeChart({
        id: 'distfit-criteria',
        kind: 'bar',
        title: copy('Confronto AIC e BIC'),
        subtitle: copy('Valori più bassi indicano un fit migliore'),
        note: copy('AIC e BIC penalizzano la complessità: una differenza piccola non giustifica una famiglia più complicata.'),
        data: { bars: criteriaBars },
        fields: { xLabel: copy('Distribuzione'), yLabel: copy('Criterio'), series: copy('Criterio') },
        options: { valueLabels: true, grouping: 'grouped' } as never,
      })
    );
  }

  return {
    ok: true,
    title: copy('Fit della distribuzione: {s1}', { s1: variableName }),
    tables,
    report: distributionFitReport(tables, ciLevel),
    charts,
  };
};

/** Two-sample Kolmogorov–Smirnov mode. */
const buildKsOutput = ({ grid, params, ciLevel }: DistributionFitInput): AnalysisRunResult => {
  if (params.group < 0 || params.group >= grid.cols.length) {
    return { ok: false, reason: 'The two-sample KS test needs a group column' };
  }
  const variableName = grid.cols[params.variable]?.name ?? 'Y';
  const groupName = grid.cols[params.group]?.name ?? 'Group';
  const buckets = new Map<string, number[]>();
  grid.rows.forEach(row => {
    const label = String(row[params.group] ?? '').trim();
    const value = parseNum(row[params.variable]);
    if (label === '' || !Number.isFinite(value)) return;
    const bucket = buckets.get(label) ?? [];
    bucket.push(value);
    buckets.set(label, bucket);
  });
  const groups = [...buckets.entries()].sort((left, right) =>
    left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0
  );
  if (groups.length !== 2) {
    return { ok: false, reason: 'The two-sample KS test needs exactly two groups' };
  }
  const result = twoSampleKs(groups[0][1], groups[1][1]);
  if (!result) {
    return { ok: false, reason: 'Each group needs at least two numeric observations' };
  }
  const firstName = groups[0][0];
  const secondName = groups[1][0];
  const ecdf = (values: number[], label: string) => {
    const sorted = [...values].sort((left, right) => left - right);
    return sorted.map((value, index) => ({ x: value, y: (index + 1) / sorted.length, series: label }));
  };

  return {
    ok: true,
    title: copy('Kolmogorov–Smirnov — {s1}', { s1: variableName }),
    tables: ksTables(result, variableName, groupName, firstName, secondName),
    report: ksReport(result, variableName, groupName, firstName, secondName, ciLevel),
    charts: [
      makeChart({
        id: 'ks-ecdf',
        kind: 'line',
        title: copy('Distribuzioni cumulative'),
        subtitle: copy('{s1} vs {s2}', { s1: firstName, s2: secondName }),
        note: copy('La distanza verticale massima tra le due curve è la statistica D; più le curve sono vicine, più le distribuzioni sono simili.'),
        data: {
          series: [...ecdf(groups[0][1], firstName), ...ecdf(groups[1][1], secondName)],
        },
        fields: { xLabel: variableName, yLabel: copy('Cumulative proportion'), series: groupName },
        options: { showMarkers: false, showBand: false, showLegend: true } as never,
      }),
    ],
  };
};
