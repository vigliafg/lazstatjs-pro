import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { spatialAnalysis, variogram, type SpatialPoint } from '../../stats/kernels/spatial';
import { spatialTables } from '../../stats/tables/spatial';
import { spatialReport } from '../../stats/reports/spatial';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { SpatialParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface SpatialInput {
  grid: Dataset;
  params: SpatialParams;
}

export const buildSpatialOutput = ({ grid, params }: SpatialInput): AnalysisRunResult => {
  const variableName = grid.cols[params.variable]?.name ?? 'Y';
  const predictorNames = params.predictors.map(
    index => grid.cols[index]?.name ?? `X${index + 1}`
  );
  const points: SpatialPoint[] = [];
  grid.rows.forEach(row => {
    const x = parseNum(row[params.x]);
    const y = parseNum(row[params.y]);
    const value = parseNum(row[params.variable]);
    const predictors = params.predictors.map(index => parseNum(row[index]));
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(value)) return;
    if (params.mode === 'sar' && predictors.some(item => !Number.isFinite(item))) return;
    points.push({ x, y, value, predictors });
  });
  if (points.length < 4) {
    return { ok: false, reason: 'Spatial statistics needs at least four points with finite coordinates and values' };
  }
  if (params.mode === 'sar' && params.predictors.length === 0) {
    return { ok: false, reason: 'The spatial lag model needs at least one predictor besides the coordinates' };
  }

  const result = spatialAnalysis(points, {
    mode: params.mode,
    k: params.k,
    permutations: params.permutations,
    seed: params.seed,
    variableName,
    predictorNames,
  });
  if (!result) {
    return {
      ok: false,
      reason: 'The spatial statistic could not be computed: check coordinates, k and the number of points',
    };
  }

  const mean = points.reduce((sum, point) => sum + point.value, 0) / points.length;
  const valueGroup = (value: number): string =>
    value >= mean ? copy('Sopra la media') : copy('Sotto la media');
  const mapPoints =
    result.lisa.length > 0
      ? result.lisa.map(item => ({
          x: item.x,
          y: item.y,
          group: item.p < 0.05 ? item.cluster : copy('Non significativo'),
        }))
      : points.map(point => ({ x: point.x, y: point.y, group: valueGroup(point.value) }));

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'spatial-map',
      kind: 'scatter',
      title: copy('Mappa dei valori'),
      subtitle: copy('{s1} punti · {s2} vicini', { s1: result.n, s2: result.k }),
      note: copy('Ogni punto è un’unità geografica; il colore distingue il quadrante LISA quando disponibile, altrimenti sopra o sotto la media.'),
      data: { points: mapPoints },
      fields: { xLabel: copy('Coordinata X'), yLabel: copy('Coordinata Y'), series: copy('Gruppo') },
      options: { fit: 'none', band: 'none' } as never,
    }),
  ];

  const bins = variogram(points);
  if (bins.length > 0) {
    charts.push(
      makeChart({
        id: 'spatial-variogram',
        kind: 'line',
        title: copy('Variogramma sperimentale'),
        subtitle: copy('Semivarianza · {s1} classi di distanza', { s1: bins.length }),
        note: copy('Ogni punto è la semivarianza media delle coppie in una classe di distanza, calcolata solo fino a metà della distanza massima: oltre, le coppie sono troppo poche e la stima instabile.'),
        data: {
          series: bins.map(bin => ({
            x: bin.distance,
            y: bin.semivariance,
            series: copy('Semivarianza'),
          })),
        },
        fields: {
          xLabel: copy('Distanza'),
          yLabel: copy('Semivarianza'),
          series: copy('Semivarianza'),
        },
        options: { showMarkers: true } as never,
      })
    );
  }

  if (result.lisa.length > 0) {
    const top = result.lisa
      .slice()
      .sort((a, b) => Math.abs(b.local) - Math.abs(a.local))
      .slice(0, 20);
    charts.push(
      makeChart({
        id: 'spatial-lisa',
        kind: 'bar',
        title: copy('Indicatori locali più forti'),
        subtitle: copy('Prime {s1} unità per valore assoluto', { s1: top.length }),
        note: copy('Barre positive indicano aggregazione di valori alti (HH) o bassi (LL); barre negative indicano valori discordanti dai vicini (HL/LH).'),
        data: {
          bars: top.map(item => ({
            category: copy('Punto {s1}', { s1: item.index + 1 }),
            value: item.local,
          })),
        },
        fields: { xLabel: copy('Unità'), yLabel: copy('I locale') },
        options: { referenceLine: 'zero' } as never,
      })
    );
  }

  if (result.sar) {
    charts.push(
      makeChart({
        id: 'spatial-sar-coefficients',
        kind: 'forest',
        title: copy('Coefficienti del modello SAR'),
        subtitle: copy('IC 95% · riferimento zero'),
        note: copy('Il coefficiente di ogni predittore è condizionato al ritardo spaziale; ρ misura l’effetto dei vicini.'),
        data: {
          points: result.sar.coefficients.map(item => ({
            label: item.term,
            estimate: item.estimate,
            lo: item.estimate - 1.96 * item.se,
            hi: item.estimate + 1.96 * item.se,
          })),
        },
        fields: { xLabel: copy('Coefficiente'), yLabel: copy('Termine') },
        options: { reference: 'zero' } as never,
      })
    );
  }

  return {
    ok: true,
    title: copy('Statistica spaziale: {s1}', { s1: variableName }),
    header: copy('{s1} punti · {s2} vicini · {s3} permutazioni', {
      s1: result.n,
      s2: result.k,
      s3: params.permutations,
    }),
    tables: spatialTables(result, variableName),
    report: spatialReport(result, variableName),
    charts,
  };
};
