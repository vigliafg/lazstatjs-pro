import { jStat } from '../../stats/jstat';
import { buildHistogram, parseNum } from '../../stats/core';
import { calcNormalityTests } from '../../stats/kernels';
import { equalShareChiSquare, frequencyTable } from '../../stats/kernels/frequency';
import { dixonTest, grubbsTest } from '../../stats/kernels/outliers';
import { runsTest } from '../../stats/kernels/runs';
import { frequencyTables, type NamedFrequency } from '../../stats/tables/frequency';
import { outlierTables, type NamedOutliers } from '../../stats/tables/outliers';
import { runsTables, type NamedRuns } from '../../stats/tables/runs';
import {
  frequencyReport,
  outliersReport,
  runsReport,
} from '../../stats/reports/descriptiveModes';
import { lillieforsTest, meanCI } from '../../stats/distributions';
import { descriptiveTables } from '../../stats/descriptive';
import { descriptiveReport } from '../../stats/report';
import { fmtEst } from '../../stats/format';
import type { ReportSpec } from '../../stats/report';
import type { TableSpec } from '../../stats/types';
import type { DescriptiveMode } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { copy } from '../../stats/reportCopy';
import { makeChart, boxRows, confidenceEllipse, qqBand } from '../../charts/kits/common';
import { distributionPanel } from '../../charts/panels';
import type { AnalysisChart, ChartRow } from '../../stats/charts';

export interface DescriptiveInput {
  rows: readonly (readonly string[])[];
  columnNames: string[];
  /** Indici di colonna selezionati dall'utente. */
  indices: number[];
  /** Livello di confidenza (90, 95, 99). */
  level: number;
  /** Which view of the procedure to build (default: the classic summary). */
  mode?: DescriptiveMode;
}

export type DescriptiveOutputResult = AnalysisRunResult;

/**
 * Calcolo + grafici + tabelle + report dell'analisi descrittiva.
 *
 * Estratto da `App.tsx` senza cambiarne il comportamento: l'output prodotto è
 * identico a quello che l'app mostrava prima (vedi golden test `descriptive`).
 */
export const buildDescriptiveOutput = (input: DescriptiveInput): DescriptiveOutputResult => {
  switch (input.mode ?? 'summary') {
    case 'frequency':
      return buildFrequencyOutput(input);
    case 'outliers':
      return buildOutliersOutput(input);
    case 'runs':
      return buildRunsOutput(input);
    default:
      return buildSummaryOutput(input);
  }
};

const selectedNames = (input: DescriptiveInput): string[] =>
  input.indices.map(index => input.columnNames[index] ?? `Var${index + 1}`);

/** Tally of one or more categorical / low-cardinality columns. */
const buildFrequencyOutput = (input: DescriptiveInput): DescriptiveOutputResult => {
  const entries: NamedFrequency[] = [];
  input.indices.forEach((index, position) => {
    const result = frequencyTable(
      input.rows.map(row => row[index]),
      input.level
    );
    if (result) {
      entries.push({
        name: selectedNames(input)[position],
        result,
        gof: equalShareChiSquare(result),
      });
    }
  });
  if (entries.length === 0) {
    return {
      ok: false,
      reason:
        'No column with countable values: the frequency view accepts categorical, boolean and low-cardinality columns (max 100 distinct values).',
    };
  }

  const tables = frequencyTables(entries, input.level);
  const charts = entries.slice(0, 4).map((entry, index) =>
    makeChart({
      id: `freq-bar-${index + 1}`,
      kind: 'bar',
      title: copy('Frequenze: {s1}', { s1: entry.name }),
      subtitle: copy('{s1} osservazioni, {s2} modalità', {
        s1: entry.result.total,
        s2: entry.result.distinct,
      }),
      data: {
        bars: entry.result.rows.map(row => ({ category: row.value, value: row.count })),
      },
      fields: { xLabel: entry.name, yLabel: copy('Count') },
      options: { valueLabels: true } as never,
    })
  );

  const primary = entries[0];
  const total = primary.result.total;
  let running = 0;
  const paretoBars = [...primary.result.rows]
    .sort((left, right) => right.count - left.count)
    .map(row => {
      running += row.count;
      return {
        category: row.value,
        value: row.count,
        pct: (row.count / total) * 100,
        cumulative: (running / total) * 100,
      };
    });
  if (paretoBars.length > 1) {
    charts.push(
      makeChart({
        id: 'freq-cumulative',
        kind: 'pareto',
        title: copy('Pareto delle frequenze: {s1}', { s1: primary.name }),
        subtitle: copy('{s1} modalità · {s2} osservazioni', {
          s1: primary.result.distinct,
          s2: primary.result.total,
        }),
        note: copy('Le barre sono i conteggi in ordine decrescente; la linea è la percentuale cumulata. Poche modalità spiegano la maggior parte dei casi.'),
        data: {
          bars: paretoBars,
          cumulative: paretoBars.map(row => ({ x: row.category, y: row.cumulative })),
        },
        fields: {
          xLabel: primary.name,
          yLabel: copy('Conteggio'),
          series: copy('Cumulata (%)'),
        },
        options: { showCumulative: true, valueLabels: false, sort: 'none' } as never,
      })
    );
  }

  return {
    ok: true,
    title: copy('Frequenze'),
    tables,
    report: frequencyReport(entries, input.level),
    charts,
  };
};

const numericColumns = (
  input: DescriptiveInput
): { name: string; values: number[]; keys: string[] }[] =>
  input.indices.map((index, position) => {
    const rows = input.rows
      .map((row, rowIndex) => ({ value: parseNum(row[index]), rowIndex }))
      .filter(entry => Number.isFinite(entry.value));
    return {
      name: selectedNames(input)[position],
      values: rows.map(entry => entry.value),
      keys: rows.map(entry => String(entry.rowIndex)),
    };
  });

/** Grubbs and Dixon tests for the most extreme observation. */
const buildOutliersOutput = (input: DescriptiveInput): DescriptiveOutputResult => {
  const entries: NamedOutliers[] = numericColumns(input).map(column => ({
    name: column.name,
    grubbs: grubbsTest(column.values, input.level),
    dixon: dixonTest(column.values, input.level),
  }));
  const usable = entries.filter(entry => entry.grubbs || entry.dixon);
  if (usable.length === 0) {
    return {
      ok: false,
      reason:
        'No variable with enough valid observations: Grubbs needs at least 3 values with a positive SD and Dixon between 3 and 30.',
    };
  }

  const boxes = boxRows(
    numericColumns(input)
      .filter(column => column.values.length >= 2)
      .map(column => ({ category: column.name, values: column.values, keys: column.keys })),
    { level: input.level }
  );
  const charts: AnalysisChart[] = [
    makeChart({
      id: 'outliers-box',
      kind: 'box',
      title: copy('Distribuzione e valori estremi'),
      subtitle: copy('Scatola e baffi delle variabili selezionate'),
      data: { summary: boxes.summary, points: boxes.points, outliers: boxes.outliers },
      fields: { xLabel: copy('Variable'), yLabel: copy('Value') },
    }),
  ];

  const columns = numericColumns(input);
  usable.slice(0, 2).forEach((entry, index) => {
    const column = columns.find(candidate => candidate.name === entry.name);
    if (!column || column.values.length === 0) return;
    const flagged = entry.grubbs?.outlier ?? entry.dixon?.outlier;
    charts.push(
      makeChart({
        id: `outliers-strip-${index + 1}`,
        kind: 'dot',
        title: copy('Valori osservati: {s1}', { s1: entry.name }),
        subtitle: copy('{s1} osservazioni · valore segnalato {s2}', {
          s1: column.values.length,
          s2: flagged ?? '—',
        }),
        note: copy('Ogni punto è un’osservazione, disposta in orizzontale per ridurre la sovrapposizione; i valori segnalati dal test di Grubbs o Dixon sono riportati nella tabella.'),
        data: {
          points: column.values.map(value => ({
            category: entry.name,
            value,
            ...(flagged !== undefined && value === flagged ? { flag: 1 } : {}),
          })),
        },
        fields: { xLabel: copy('Variabile'), yLabel: entry.name },
        options: { jitter: 'wide', showMean: false } as never,
      })
    );
  });

  return {
    ok: true,
    title: copy('Valori anomali'),
    tables: outlierTables(usable, input.level),
    report: outliersReport(usable, input.level),
    charts,
  };
};

/** Wald–Wolfowitz runs test around the median. */
const buildRunsOutput = (input: DescriptiveInput): DescriptiveOutputResult => {
  const entries: NamedRuns[] = numericColumns(input)
    .map(column => ({ name: column.name, result: runsTest(column.values) }))
    .filter((entry): entry is NamedRuns => entry.result !== null);
  if (entries.length === 0) {
    return {
      ok: false,
      reason:
        'No variable with a usable sequence: the runs test needs at least 4 valid observations on both sides of the median.',
    };
  }

  const charts: AnalysisChart[] = entries.slice(0, 2).flatMap((entry, index) => {
    const column = numericColumns(input).find(candidate => candidate.name === entry.name)!;
    const sides = column.values.map(value => (value > entry.result.cut ? 1 : 0));
    const lengths: number[] = [];
    let length = 1;
    for (let position = 1; position < sides.length; position += 1) {
      if (sides[position] === sides[position - 1]) {
        length += 1;
      } else {
        lengths.push(length);
        length = 1;
      }
    }
    lengths.push(length);
    const counts = new Map<number, number>();
    lengths.forEach(value => counts.set(value, (counts.get(value) ?? 0) + 1));
    return [
      makeChart({
        id: `runs-sequence-${index + 1}`,
        kind: 'line',
        title: copy('Sequenza osservata: {s1}', { s1: entry.name }),
        subtitle: copy('Valori nell’ordine delle righe, punto di taglio {s1}', {
          s1: entry.result.cut,
        }),
        note: copy('Una tendenza o un ciclo visibile spiega perché il test rifiuta la casualità; il test non localizza il punto di rottura.'),
        data: {
          series: column.values.map((value, position) => ({ x: position + 1, y: value })),
        },
        fields: { xLabel: copy('Row'), yLabel: entry.name },
        options: { showMarkers: true } as never,
      }),
      makeChart({
        id: `runs-lengths-${index + 1}`,
        kind: 'bar',
        title: copy('Lunghezza delle sequenze: {s1}', { s1: entry.name }),
        subtitle: copy('{s1} sequenze osservate', { s1: entry.result.runs }),
        data: {
          bars: [...counts.entries()]
            .sort((left, right) => left[0] - right[0])
            .map(([value, count]) => ({ category: String(value), value: count })),
        },
        fields: { xLabel: copy('Run length'), yLabel: copy('Count') },
        options: { valueLabels: true } as never,
      }),
    ];
  });

  return {
    ok: true,
    title: copy('Test delle sequenze'),
    tables: runsTables(entries, input.level),
    report: runsReport(entries, input.level),
    charts,
  };
};

const buildSummaryOutput = (input: DescriptiveInput): DescriptiveOutputResult => {
    const results = input.indices.map(vIdx => {
      const name = input.columnNames[vIdx] ?? `Var${vIdx + 1}`;
      const numeric = input.rows
        .map((row, index) => ({ value: parseNum(row[vIdx]), index }))
        .filter(item => !isNaN(item.value));
      const data = numeric.map(item => item.value);
      const dataKeys = numeric.map(item => String(item.index));
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
      const sortedEntries = data
        .map((value, index) => ({ value, key: dataKeys[index] }))
        .sort((a, b) => a.value - b.value);
      const qqData = sortedEntries.map((entry, idx) => {
        const p = (idx + 1 - 0.375) / (n + 0.25);
        const theoreticalQuantile = jStat.normal.inv(p, 0, 1);
        return {
          x: theoreticalQuantile,
          y: entry.value,
          __row: entry.key,
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
        normality, lilliefors, qqData, qqLineData, data, dataKeys
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

    const groups = results.map(r => ({ category: r.name, values: r.data, keys: r.dataKeys }));
    const boxes = boxRows(groups, { level: input.level });
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
        }),
        makeChart({
          id: 'desc-diamond',
          kind: 'diamond',
          title: copy('Diamante delle medie'),
          subtitle: copy('Diamante proporzionale all’intervallo di confidenza'),
          note: copy('Il diamante è centrato sulla media; la sua ampiezza cresce con l’incertezza della stima.'),
          data: { intervals },
          fields: { xLabel: copy('Variabile'), yLabel: copy('Media') },
          options: { scaleToCI: true, showLabels: true } as never,
        })
      );
    }
    const dotPoints = results.flatMap(r =>
      r.data.map((value, index) => ({ category: r.name, value, __row: r.dataKeys[index] }))
    );    if (dotPoints.length > 0) {
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
    if (results.length > 1) {
      charts.push(
        makeChart({
          id: 'desc-spread-level',
          kind: 'scatter',
          title: copy('Dispersione vs livello'),
          subtitle: copy('Media e deviazione standard delle variabili selezionate'),
          note: copy('Serve a vedere se le variabili più grandi hanno anche più variabilità; una relazione crescente suggerisce eteroschedasticità o scala.'),
          data: {
            points: results.map(r => ({ x: r.mean, y: r.stdev, label: r.name })),
          },
          fields: { xLabel: copy('Media'), yLabel: copy('Deviazione standard') },
          options: { fit: 'ols', band: 'none', pointLabels: true } as never,
        })
      );
      let pairCount = 0;
      for (let i = 0; i < results.length && pairCount < 6; i++) {
        for (let j = i + 1; j < results.length && pairCount < 6; j++) {
          const points = input.rows
            .map((row, index) => ({
              x: parseNum(row[input.indices[i]]),
              y: parseNum(row[input.indices[j]]),
              __row: String(index),
            }))
            .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
          if (points.length < 3) continue;
          charts.push(
            makeChart({
              id: `desc-pair-${i + 1}-${j + 1}`,
              kind: 'scatter',
              title: copy('Dispersione: {s1} × {s2}', { s1: results[i].name, s2: results[j].name }),
              subtitle: copy('Casi completi: {s1}', { s1: points.length }),
              note: copy('Una linea crescente indica associazione positiva, una decrescente negativa; la nuvola mostra anche valori anomali.'),
              data: { points },
              fields: { xLabel: results[i].name, yLabel: results[j].name },
              options: { fit: 'ols', band: 'none', ellipse: true } as never,
            })
          );
          pairCount += 1;
        }
      }
    }
    const first = results[0];
    if (first) {
      const sorted = first.data
        .map((value, index) => ({ value, key: first.dataKeys[index] }))
        .sort((a, b) => a.value - b.value);
      const ecdf = sorted.map((entry, index) => ({
        x: entry.value,
        y: (index + 1) / sorted.length,
        __row: entry.key,
      }));
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
      const keyedValues = r.data.map((value, index) => ({ value, __row: r.dataKeys[index] }));
      charts.push(
        makeChart({
          id: `desc-hist-${r.name}`,
          kind: 'histogram',
          title: copy('Distribuzione (istogramma): {s1}', { s1: r.name }),
          subtitle: copy('{s1} osservazioni', { s1: r.n }),
          data: { values: keyedValues },
          fields: { xLabel: r.name, yLabel: copy('Frequenza') },
        })
      );
      if (r.data.length >= 2) {
        charts.push(
          makeChart({
            id: `desc-shadow-${r.name}`,
            kind: 'shadowgram',
            title: copy('Shadowgram: {s1}', { s1: r.name }),
            subtitle: copy('Densità stimata con rug delle osservazioni'),
            note: copy('La silhouette mostra la densità stimata; il rug mostra dove cadono le osservazioni.'),
            data: { values: keyedValues },
            fields: { xLabel: r.name, yLabel: copy('Densità') },
            options: { showRug: true, showMeanLine: false } as never,
          })
        );
      }
    });

    const matrixVars = results.slice(0, 4);
    if (matrixVars.length >= 3 && results.length === input.indices.length) {
      const dim = matrixVars.length;
      const step = Math.max(1, Math.floor(input.rows.length / 200));
      const norm = (value: number, min: number, max: number): number =>
        max > min ? 0.1 + (0.8 * (value - min)) / (max - min) : 0.5;
      const panels: ChartRow[] = [];
      for (let row = 0; row < dim; row += 1) {
        for (let column = 0; column < dim; column += 1) {
          panels.push({ px: column, px2: column + 1, py: row, py2: row + 1 });
        }
      }
      const labels: ChartRow[] = matrixVars.map((variable, index) => ({
        x: index + 0.5,
        y: index + 0.5,
        label: variable.name,
      }));
      const points: ChartRow[] = [];
      const ellipses: ChartRow[] = [];
      for (let row = 0; row < dim; row += 1) {
        for (let column = 0; column < dim; column += 1) {
          if (row === column) continue;
          const xi = input.indices[column];
          const yi = input.indices[row];
          const pairs: { x: number; y: number }[] = [];
          for (let index = 0; index < input.rows.length; index += step) {
            const x = parseNum(input.rows[index][xi]);
            const y = parseNum(input.rows[index][yi]);
            if (Number.isFinite(x) && Number.isFinite(y)) pairs.push({ x, y });
          }
          if (pairs.length < 3) continue;
          const xs = pairs.map(pair => pair.x);
          const ys = pairs.map(pair => pair.y);
          const [xMin, xMax] = [Math.min(...xs), Math.max(...xs)];
          const [yMin, yMax] = [Math.min(...ys), Math.max(...ys)];
          const py = row;
          pairs.forEach(pair =>
            points.push({
              x: column + norm(pair.x, xMin, xMax),
              y: py + norm(pair.y, yMin, yMax),
            })
          );
          confidenceEllipse(pairs.map(pair => ({ x: pair.x, y: pair.y }))).forEach(point =>
            ellipses.push({
              x: column + norm(Number(point.x), xMin, xMax),
              y: py + norm(Number(point.y), yMin, yMax),
            })
          );
        }
      }
      if (points.length > 0) {
        charts.push(
          makeChart({
            id: 'desc-matrix',
            kind: 'scattermatrix',
            title: copy('Matrice di dispersione'),
            subtitle: copy('Confronto a coppie delle variabili selezionate'),
            note: copy('Ogni pannello confronta due variabili; le ellissi tratteggiate riassumono la densità bivariata.'),
            data: { points, panels, ellipses, labels },
            fields: { xLabel: copy('Variabili'), yLabel: copy('Variabili') },
            stats: { dim },
            options: { showEllipses: true } as never,
          })
        );
      }
    }

    if (matrixVars.length >= 3 && results.length === input.indices.length) {
      const [vx, vy, vs] = matrixVars;
      const xi = input.indices[0];
      const yi = input.indices[1];
      const si = input.indices[2];
      const step = Math.max(1, Math.floor(input.rows.length / 500));
      const bubblePoints: ChartRow[] = [];
      const spatialPoints: ChartRow[] = [];
      for (let index = 0; index < input.rows.length; index += step) {
        const x = parseNum(input.rows[index][xi]);
        const y = parseNum(input.rows[index][yi]);
        const size = Math.abs(parseNum(input.rows[index][si]));
        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(size)) continue;
        bubblePoints.push({ x, y, size, __row: String(index) });
        spatialPoints.push({ x, y, z: size, __row: String(index) });
      }
      if (bubblePoints.length > 0) {
        charts.push(
          makeChart({
            id: 'desc-bubble',
            kind: 'bubble',
            title: copy('Grafico a bolle'),
            subtitle: copy('{s1} × {s2}, dimensione = {s3}', {
              s1: vx.name,
              s2: vy.name,
              s3: vs.name,
            }),
            note: copy('La posizione mostra due variabili, la dimensione della bolla la terza: bolle grandi indicano valori alti della variabile di dimensione.'),
            data: { points: bubblePoints },
            fields: { xLabel: vx.name, yLabel: vy.name, sizeLabel: vs.name },
            options: { showSizeLegend: true } as never,
          })
        );
      }
      if (spatialPoints.length > 0) {
        charts.push(
          makeChart({
            id: 'desc-scatter3d',
            kind: 'scatter3d',
            title: copy('Dispersione 3D'),
            subtitle: copy('{s1}, {s2}, {s3} proiettati', { s1: vx.name, s2: vy.name, s3: vs.name }),
            note: copy('La proiezione isometrica mostra tre dimensioni; l’ellisse riassume la densità proiettata, non sostituisce un test multivariato.'),
            data: { points: spatialPoints },
            fields: { xLabel: vx.name, yLabel: vy.name },
            options: { showEllipsoid: true, showPoints: true } as never,
          })
        );
      }
    }

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

    // L3 Distribution report: the panel reuses the charts already built above
    // and adds the descriptive tables that belong to the same variable.
    const distribution = first
      ? distributionPanel({
          title: copy('Pannello Distribution: {s1}', { s1: first.name }),
          subtitle: copy('{s1} osservazioni', { s1: first.n }),
          charts,
          tables: descTables,
        })
      : null;

    return {
      ok: true,
      title: copy('Statistiche descrittive'),
      tables: descTables,
      report: descReport,
      charts,
      ...(distribution ? { panels: [distribution] } : {}),
    };
  };
