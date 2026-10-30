import { jStat } from '../../stats/jstat';
import { buildHistogram, parseNum } from '../../stats/core';
import { calcNormalityTests } from '../../stats/kernels';
import { lillieforsTest, meanCI } from '../../stats/distributions';
import { descriptiveTables } from '../../stats/descriptive';
import { descriptiveReport } from '../../stats/report';
import { fmtEst } from '../../stats/format';
import type { ReportSpec } from '../../stats/report';
import type { TableSpec } from '../../stats/types';
import type { AnalysisRunResult } from '../types';
import { copy } from '../../stats/reportCopy';
import { makeChart, boxRows, qqBand } from '../../charts/kits/common';
import type { AnalysisChart } from '../../stats/charts';

export interface DescriptiveInput {
  rows: readonly (readonly string[])[];
  columnNames: string[];
  /** Indici di colonna selezionati dall'utente. */
  indices: number[];
  /** Livello di confidenza (90, 95, 99). */
  level: number;
}

export type DescriptiveOutputResult = AnalysisRunResult;

/**
 * Calcolo + grafici + tabelle + report dell'analisi descrittiva.
 *
 * Estratto da `App.tsx` senza cambiarne il comportamento: l'output prodotto è
 * identico a quello che l'app mostrava prima (vedi golden test `descriptive`).
 */
export const buildDescriptiveOutput = (input: DescriptiveInput): DescriptiveOutputResult => {
    const results = input.indices.map(vIdx => {
      const name = input.columnNames[vIdx] ?? `Var${vIdx + 1}`;
      const data = input.rows.map(r => parseNum(r[vIdx])).filter(v => !isNaN(v));
      if (data.length === 0) return null;

      const n = data.length;
      const mean = jStat.mean(data);
      const median = jStat.median(data);
      const stdev = jStat.stdev(data, true); // sample SD
      const min = jStat.min(data);
      const max = jStat.max(data);
      const range = max - min;
      const sum = jStat.sum(data);
      const variance = jStat.variance(data, true);
      const skewness = jStat.skewness(data);
      const kurtosis = jStat.kurtosis(data);
      const quartiles = jStat.quartiles(data); // [Q1, Q2, Q3]

      // Histogram data: single source of truth for bin count, edges and counts
      const histogram = buildHistogram(data);

      // Normality calculations
      const normality = calcNormalityTests(data);
      const lilliefors = lillieforsTest(data);

      // Q-Q Plot calculations
      const sortedData = [...data].sort((a, b) => a - b);
      const qqData = sortedData.map((val, idx) => {
        const p = (idx + 1 - 0.375) / (n + 0.25);
        const theoreticalQuantile = jStat.normal.inv(p, 0, 1);
        return {
          x: theoreticalQuantile,
          y: val
        };
      });

      const q25 = jStat.normal.inv(0.25, 0, 1);
      const q75 = jStat.normal.inv(0.75, 0, 1);
      const x25 = quartiles[0];
      const x75 = quartiles[2];
      const qqSlope = (isNaN(stdev) || stdev === 0) ? 0 : (x75 - x25) / (q75 - q25);
      const qqIntercept = x25 - qqSlope * q25;

      // Keep the reference line inside the observed theoretical quantiles: the
      // old fixed ±3 range stretched the y domain far beyond the actual data.
      const qqXMin = Math.min(...qqData.map(d => d.x));
      const qqXMax = Math.max(...qqData.map(d => d.x));
      const qqSpan = (qqXMax - qqXMin) || 1;
      const xMin = qqXMin - qqSpan * 0.05;
      const xMax = qqXMax + qqSpan * 0.05;
      const qqLineData = [
        { x: xMin, y: qqSlope * xMin + qqIntercept },
        { x: xMax, y: qqSlope * xMax + qqIntercept }
      ];

      return { 
        name, n, mean, median, stdev, min, max, range, sum, variance, skewness, kurtosis,
        q1: quartiles[0], q3: quartiles[2], histData: histogram.data, histBins: histogram.bins,
        normality, lilliefors, qqData, qqLineData, data
      };
    }).filter(r => r !== null);

    if (results.length === 0) {
      return { ok: false, reason: 'No valid numeric data selected' };
    }

    const descTables = descriptiveTables(
      input.rows,
      input.indices,
      input.columnNames,
      input.level
    );
    const descReport = descriptiveReport(descTables, input.level);

    const groups = results.map(r => ({ category: r.name, values: r.data }));
    const boxes = boxRows(groups);
    const charts: AnalysisChart[] = [
      makeChart({
        id: 'desc-means',
        kind: 'bar',
        title: copy('Confronto delle medie'),
        subtitle: copy('Valori medi delle variabili selezionate'),
        data: { bars: results.map(r => ({ category: r.name, value: r.mean })) },
        fields: { xLabel: copy('Variabile'), yLabel: copy('Media') },
        options: { valueLabels: true } as never,
      }),
      makeChart({
        id: 'desc-box',
        kind: 'box',
        title: copy('Grafico a scatola e baffi'),
        subtitle: copy('Distribuzione delle variabili selezionate'),
        data: { summary: boxes.summary, points: boxes.points, outliers: boxes.outliers },
        fields: { xLabel: copy('Variabile'), yLabel: copy('Valore') },
      }),
    ];

    const intervals = results
      .filter(r => r.n > 1 && Number.isFinite(r.stdev))
      .map(r => {
        const ci = meanCI(r.data, input.level);
        return {
          category: r.name,
          estimate: r.mean,
          lo: ci.lo,
          hi: ci.hi,
        };
      });
    if (intervals.length > 0) {
      charts.push(
        makeChart({
          id: 'desc-interval',
          kind: 'interval',
          title: copy('Medie e intervalli di confidenza'),
          subtitle: copy('Valori medi delle variabili selezionate'),
          data: { intervals },
          fields: { xLabel: copy('Variabile'), yLabel: copy('Media') },
        })
      );
    }
    const dotPoints = results.flatMap(r => r.data.map(value => ({ category: r.name, value })));
    if (dotPoints.length > 0) {
      charts.push(
        makeChart({
          id: 'desc-dot',
          kind: 'dot',
          title: copy('Dotplot delle variabili selezionate'),
          subtitle: copy('Distribuzione delle variabili selezionate'),
          data: { points: dotPoints },
          fields: { xLabel: copy('Variabile'), yLabel: copy('Valore') },
        })
      );
    }
    const first = results[0];
    if (first) {
      const sorted = [...first.data].sort((a, b) => a - b);
      const ecdf = sorted.map((value, index) => ({ x: value, y: (index + 1) / sorted.length }));
      if (ecdf.length > 0) {
        charts.push(
          makeChart({
            id: 'desc-ecdf',
            kind: 'ecdf',
            title: copy('Distribuzione cumulativa: {s1}', { s1: first.name }),
            subtitle: copy('{s1} osservazioni', { s1: first.n }),
            data: { points: ecdf },
            fields: { xLabel: first.name, yLabel: copy('Valore cumulativo') },
          })
        );
      }
    }
    results.slice(0, 1).forEach(r => {
      charts.push(
        makeChart({
          id: `desc-hist-${r.name}`,
          kind: 'histogram',
          title: copy('Distribuzione (istogramma): {s1}', { s1: r.name }),
          subtitle: copy('{s1} osservazioni', { s1: r.n }),
          data: { values: r.data.map(value => ({ value })) },
          fields: { xLabel: r.name, yLabel: copy('Frequenza') },
        })
      );
    });

    results.slice(0, 8).forEach(r => {
      if (r.qqData.length === 0) return;
      charts.push(
        makeChart({
          id: `desc-qq-${r.name}`,
          kind: 'qq',
          title: copy('Q-Q normale: {s1}', { s1: r.name }),
          subtitle: copy('{s1} osservazioni', { s1: r.n }),
          note: copy('I punti vicini alla diagonale indicano una distribuzione compatibile con la normale.'),
          data: {
            points: r.qqData,
            reference: r.qqLineData,
            band: qqBand(r.qqData, r.qqLineData, input.level),
          },
          fields: { xLabel: copy('Quantili teorici'), yLabel: copy('Valori osservati') },
          options: { showCI: true } as never,
        })
      );
    });

    return {
      ok: true,
      title: copy('Statistiche descrittive'),
      tables: descTables,
      report: descReport,
      charts,
    };
  };
