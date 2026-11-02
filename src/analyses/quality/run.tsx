import { copy } from '../../stats/reportCopy';
import { boxRows, makeChart } from '../../charts/kits/common';
import { qualityPanel } from '../../charts/panels';
import { parseNum } from '../../stats/core';
import {
  capabilityStats,
  controlChart,
  paretoCounts,
} from '../../stats/kernels/quality';
import {
  capabilityTables,
  controlTables,
  paretoTables,
  variabilityTables,
  type VariabilityRow,
} from '../../stats/tables/quality';
import {
  qualityCapabilityReport,
  qualityControlReport,
  qualityParetoReport,
} from '../../stats/reports/quality';
import type { AnalysisChart } from '../../stats/charts';
import type { ReportSpec } from '../../stats/report';
import type { Dataset } from '../../grid/types';
import type { QualityParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface QualityInput {
  grid: Dataset;
  params: QualityParams;
  ciLevel: number;
}

const numericValues = (grid: Dataset, index: number): number[] =>
  grid.rows.map(row => parseNum(row[index])).filter(Number.isFinite);

/** SPC platform: control, capability, Pareto and variability. */
export const buildQualityOutput = ({
  grid,
  params,
}: QualityInput): AnalysisRunResult => {
  const variableName = grid.cols[params.variable]?.name ?? 'Y';
  const performed: string[] = [];
  const charts: AnalysisChart[] = [];
  let tables: ReturnType<typeof controlTables> = [];
  let report: ReportSpec | null = null;
  let title = 'Qualità del processo';
  let header: string | undefined;

  if (params.mode === 'pareto') {
    const categoryName = grid.cols[params.category]?.name ?? 'Categoria';
    const labels = grid.rows.map(row => String(row[params.category] ?? ''));
    const result = paretoCounts(labels);
    if (!result) {
      return { ok: false, reason: 'The Pareto chart needs at least one non-empty category' };
    }
    tables = paretoTables(result, categoryName);
    report = qualityParetoReport(result, categoryName);
    title = copy('Pareto — {s1}', { s1: categoryName });
    header = copy('{s1} osservazioni · {s2} categorie', {
      s1: result.total,
      s2: result.rows.length,
    });
    performed.push('pareto');
    charts.push(
      makeChart({
        id: 'pareto-chart',
        kind: 'pareto',
        title: copy('Grafico di Pareto'),
        subtitle: copy('{s1} categorie · {s2} osservazioni', { s1: result.rows.length, s2: result.total }),
        note: copy('Le barre sono i conteggi in ordine decrescente; la linea è la percentuale cumulata. Poche categorie spiegano la maggior parte dei casi.'),
        data: {
          bars: result.rows.map(row => ({
            category: row.category,
            value: row.count,
            pct: row.pct,
            cumulative: row.cumulative,
          })),
          cumulative: result.rows.map(row => ({ x: row.category, y: row.cumulative })),
        },
        fields: { xLabel: categoryName, yLabel: copy('Conteggio'), series: copy('Cumulata (%)') },
        options: { showCumulative: true, valueLabels: false, sort: 'none' } as never,
      })
    );
  } else if (params.mode === 'variability') {
    if (params.group < 0) {
      return { ok: false, reason: 'Variability needs a group column' };
    }
    const groupName = grid.cols[params.group]?.name ?? 'Gruppo';
    const groups = new Map<string, number[]>();
    grid.rows.forEach(row => {
      const label = String(row[params.group] ?? '').trim();
      const value = parseNum(row[params.variable]);
      if (label === '' || !Number.isFinite(value)) return;
      const bucket = groups.get(label) ?? [];
      bucket.push(value);
      groups.set(label, bucket);
    });
    const entries = Array.from(groups.entries()).filter(([, values]) => values.length > 0);
    if (entries.length < 2) {
      return { ok: false, reason: 'Variability needs at least two non-empty groups' };
    }
    const rows: VariabilityRow[] = entries.map(([category, values]) => {
      const average = values.reduce((sum, value) => sum + value, 0) / values.length;
      const variance =
        values.length > 1
          ? values.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) /
            (values.length - 1)
          : 0;
      return {
        category,
        n: values.length,
        mean: average,
        sd: Math.sqrt(variance),
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });
    tables = variabilityTables(rows, variableName, groupName);
    title = copy('Variabilità — {s1} per {s2}', { s1: variableName, s2: groupName });
    header = copy('{s1} gruppi · {s2} osservazioni', {
      s1: entries.length,
      s2: rows.reduce((sum, row) => sum + row.n, 0),
    });
    performed.push('variability');
    const boxes = boxRows(entries.map(([category, values]) => ({ category, values })));
    charts.push(
      makeChart({
        id: 'variab-box',
        kind: 'box',
        title: copy('Variabilità per gruppo'),
        subtitle: copy('{s1} gruppi', { s1: entries.length }),
        note: copy('Ogni scatola mostra mediana, quartili e baffi Tukey; i punti sono le osservazioni. Serve a vedere se la variabilità cambia tra gruppi, non solo la media.'),
        data: { summary: boxes.summary, points: boxes.points, outliers: boxes.outliers },
        fields: { xLabel: groupName, yLabel: variableName },
        options: { showPoints: true, showMean: true } as never,
      })
    );
  } else if (params.mode === 'capability') {
    const values = numericValues(grid, params.variable);
    if (values.length < 3) {
      return { ok: false, reason: 'Capability needs at least three numeric observations' };
    }
    if (!(params.usl > params.lsl)) {
      return { ok: false, reason: 'The upper specification limit must be above the lower one' };
    }
    const result = capabilityStats(values, params.lsl, params.usl, params.target);
    if (!result) {
      return {
        ok: false,
        reason: 'Capability could not be computed: check a non-constant variable and valid limits',
      };
    }
    tables = capabilityTables(result, variableName);
    report = qualityCapabilityReport(result, variableName);
    title = copy('Capacità — {s1}', { s1: variableName });
    header = copy('LSL {s1} · USL {s2} · target {s3}', {
      s1: result.lsl,
      s2: result.usl,
      s3: result.target,
    });
    performed.push('capability');
    charts.push(
      makeChart({
        id: 'capab-histogram',
        kind: 'histogram',
        title: copy('Distribuzione e specifiche'),
        subtitle: copy('Cp = {s1} · Cpk = {s2}', {
          s1: result.cp.toFixed(2),
          s2: result.cpk.toFixed(2),
        }),
        note: copy('Le linee verticali sono i limiti di specifica e il target; la curva è la densità normale con la stessa media e deviazione standard. Se la distribuzione esce dai limiti il processo produce fuori specifica.'),
        data: {
          values: values.map(value => ({ value })),
          rules: [
            { value: result.lsl, label: copy('LSL') },
            { value: result.usl, label: copy('USL') },
            { value: result.target, label: copy('Target') },
            { value: result.mean, label: copy('Media') },
          ],
        },
        fields: { xLabel: variableName, yLabel: copy('Frequenza') },
        options: { showDensity: true, bins: 18, showRug: true } as never,
      })
    );
  } else {
    const values = numericValues(grid, params.variable);
    const result = controlChart(values, params.chart, params.subgroup);
    if (!result) {
      return {
        ok: false,
        reason: 'The control chart needs enough consecutive numeric observations for the chosen subgroup',
      };
    }
    tables = controlTables({ result, variableName });
    report = qualityControlReport(result, variableName);
    title = copy('Carta di controllo — {s1}', { s1: variableName });
    header =
      result.chart === 'xbar'
        ? copy('XBar-R · {s1} sottogruppi di {s2}', {
            s1: result.points.length,
            s2: result.subgroup,
          })
        : copy('{s1} · {s2} punti', {
            s1: result.chart === 'ewma' ? 'EWMA' : copy('Individui'),
            s2: result.points.length,
          });
    performed.push('control');
    const series = result.points.map(point => ({ x: point.index, y: point.value }));
    const rules =
      result.chart === 'ewma'
        ? [{ value: result.center, label: copy('CL') }]
        : [
            { value: result.ucl, label: 'UCL' },
            { value: result.center, label: 'CL' },
            { value: result.lcl, label: 'LCL' },
          ];
    if (result.chart === 'ewma' && result.limits.length > 0) {
      result.limits.forEach(limit => {
        series.push({ x: limit.index, y: limit.ucl });
        series.push({ x: limit.index, y: limit.lcl });
      });
    }
    charts.push(
      makeChart({
        id: 'control-chart',
        kind: 'line',
        title: copy('Carta di controllo'),
        subtitle: copy('{s1} punti fuori controllo su {s2}', {
          s1: result.outCount,
          s2: result.points.length,
        }),
        note: copy('La linea centrale è il livello del processo; le linee tratteggiate sono i limiti a ±3 sigma. Un punto oltre i limiti è un segnale da investigare, non una prova che il processo sia cambiato.'),
        data: {
          series:
            result.chart === 'ewma'
              ? [
                  ...series.filter((_, index) => index < result.points.length).map(point => ({
                    ...point,
                    series: copy('EWMA'),
                  })),
                  ...series
                    .slice(result.points.length)
                    .map((point, index) => ({
                      ...point,
                      series: index % 2 === 0 ? 'UCL' : 'LCL',
                    })),
                ]
              : series,
          rules,
        },
        fields: { xLabel: copy('Osservazione'), yLabel: variableName, series: copy('Serie') },
        options: {
          showMarkers: true,
          showBand: false,
          showLegend: result.chart === 'ewma',
        } as never,
      })
    );
  }

  const panel = qualityPanel({ charts, tables });
  return {
    ok: true,
    title,
    ...(header ? { header } : {}),
    tables,
    report,
    charts,
    ...(panel ? { panels: [panel] } : {}),
    ...(performed.length > 0
      ? {
          warnings: [
            copy('Il report di qualità descrive il processo osservato; non sostituisce una carta di controllo validata su dati di produzione.'),
          ],
        }
      : {}),
  };
};
