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
      options: { showCI: true } as never,
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
        options: { showReference: true } as never,
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
