import { ordinalStats } from '../../stats/kernels/ordinal';
import { ordinalTables } from '../../stats/tables/ordinal';
import { ordinalReport } from '../../stats/reports/ordinal';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { Dataset } from '../../grid/types';
import type { OrdinalParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface OrdinalInput {
  grid: Dataset;
  params: OrdinalParams;
  ciLevel: number;
}

/** Regressione logistica ordinale a odds proporzionali. */
export const buildOrdinalOutput = ({ grid, params, ciLevel }: OrdinalInput): AnalysisRunResult => {
  if (params.indeps.length === 0) {
    return { ok: false, reason: 'Select at least one predictor' };
  }
  if (params.indeps.includes(params.dep)) {
    return { ok: false, reason: 'The outcome cannot also be a predictor' };
  }
  const stats = ordinalStats({
    rows: grid.rows,
    depIdx: params.dep,
    indepIdxs: params.indeps,
    level: ciLevel,
  });
  if (!stats) {
    return {
      ok: false,
      reason: 'Ordinal regression needs at least three ordered categories and enough complete rows',
    };
  }

  const predNames = params.indeps.map(index => grid.cols[index]?.name ?? `X${index + 1}`);
  const tables = ordinalTables(stats, ciLevel);
  const series = stats.categories.flatMap((category, categoryIndex) =>
    stats.profile.map(point => ({
      x: point.x,
      y: point.probabilities[categoryIndex] * 100,
      series: category,
    }))
  );
  const orPoints = stats.coefficients
    .filter(row => Number.isFinite(row.or) && Number.isFinite(row.lo) && Number.isFinite(row.hi))
    .map(row => ({ label: row.term, estimate: row.or, lo: row.lo, hi: row.hi }));
  const thresholdPoints = stats.thresholds
    .filter(row => Number.isFinite(row.alpha) && Number.isFinite(row.lo) && Number.isFinite(row.hi))
    .map(row => ({
      label: `α${row.index + 1}`,
      estimate: row.alpha,
      lo: row.lo,
      hi: row.hi,
    }));
  const charts = [
    makeChart({
      id: 'ordinal-probabilities',
      kind: 'line',
      title: copy('Probabilità predette per categoria'),
      subtitle: copy('Profilo di {s1}; altri predittori alla media', { s1: predNames[0] ?? 'X1' }),
      note: copy('Le curve mostrano come cambia la probabilità di ciascuna categoria al variare del primo predittore.'),
      data: { series, markers: series },
      fields: { xLabel: predNames[0] ?? 'X1', yLabel: copy('Probabilità (%)'), series: copy('Categoria') },
      options: { showBand: false, showMarkers: true } as never,
    }),
  ];
  const probabilityCells = stats.profile.flatMap(point =>
    stats.categories.map((category, index) => ({
      x: point.x.toFixed(2),
      y: category,
      value: point.probabilities[index] * 100,
      label: `${(point.probabilities[index] * 100).toFixed(0)}`,
    }))
  );
  if (probabilityCells.length > 0) {
    charts.push(
      makeChart({
        id: 'ordinal-probability-heatmap',
        kind: 'heatmap',
        title: copy('Mappa delle probabilità per categoria'),
        subtitle: copy('Profilo di {s1}; altri predittori alla media', { s1: predNames[0] ?? 'X1' }),
        note: copy('Le righe sono le categorie ordinate, le colonne i valori del predittore: il colore mostra la probabilità predetta.'),
        data: { cells: probabilityCells },
        fields: { xLabel: predNames[0] ?? 'X1', yLabel: copy('Categoria') },
        options: { showValues: true, diverging: false } as never,
      })
    );
  }
  if (orPoints.length > 0) {
    charts.push(
      makeChart({
        id: 'ordinal-or-forest',
        kind: 'forest',
        title: copy('Odds ratio per predittore'),
        subtitle: copy('IC {s1}% · riferimento OR = 1', { s1: ciLevel }),
        note: copy('Punto: odds ratio cumulativo. Segmento: intervallo di confidenza; se contiene 1 il predittore non è distinguibile da nessun effetto.'),
        data: { points: orPoints },
        fields: { xLabel: copy('Odds ratio'), yLabel: copy('Predittore') },
        options: { reference: 'one' } as never,
      })
    );
  }
  if (thresholdPoints.length > 0) {
    charts.push(
      makeChart({
        id: 'ordinal-thresholds',
        kind: 'forest',
        title: copy('Soglie del modello'),
        subtitle: copy('IC {s1}% sulle soglie α', { s1: ciLevel }),
        note: copy('Le soglie separano le categorie ordinate; intervalli molto ampi indicano poca informazione su quel confine.'),
        data: { points: thresholdPoints },
        fields: { xLabel: copy('Soglia'), yLabel: copy('Confine') },
        options: { reference: 'zero' } as never,
      })
    );
  }
  return {
    ok: true,
    title: copy('Regressione ordinale: {s1}', { s1: grid.cols[params.dep]?.name ?? 'Y' }),
    tables,
    report: ordinalReport(stats, predNames, ciLevel),
    charts,
  };
};
