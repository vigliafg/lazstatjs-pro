import { copy } from '../../stats/reportCopy';
import { boxRows, makeChart } from '../../charts/kits/common';
import { qualityPanel } from '../../charts/panels';
import { parseNum } from '../../stats/core';
import {
  capabilityStats,
  controlChart,
  paretoCounts,
} from '../../stats/kernels/quality';
import { toleranceInterval } from '../../stats/kernels/tolerance';
import { cusumChart } from '../../stats/kernels/cusum';
import { gageRr } from '../../stats/kernels/msa';
import { acceptancePlan } from '../../stats/kernels/acceptance';
import { multiControlChart } from '../../stats/kernels/mcontrol';
import { toleranceTables } from '../../stats/tables/tolerance';
import { cusumTables } from '../../stats/tables/cusum';
import { msaTables } from '../../stats/tables/msa';
import { acceptanceTables } from '../../stats/tables/acceptance';
import { mcontrolTables } from '../../stats/tables/mcontrol';
import { toleranceReport } from '../../stats/reports/tolerance';
import { cusumReport } from '../../stats/reports/cusum';
import { msaReport } from '../../stats/reports/msa';
import { acceptanceReport } from '../../stats/reports/acceptance';
import { mcontrolReport } from '../../stats/reports/mcontrol';
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
  ciLevel,
}: QualityInput): AnalysisRunResult => {
  const variableName = grid.cols[params.variable]?.name ?? 'Y';
  const performed: string[] = [];
  const charts: AnalysisChart[] = [];
  let tables: ReturnType<typeof controlTables> = [];
  let report: ReportSpec | null = null;
  let title = 'Qualità del processo';
  let header: string | undefined;

  if (params.mode === 'tolerance') {
    const values = numericValues(grid, params.variable);
    const result = toleranceInterval(values, params.toleranceP, ciLevel / 100);
    if (!result) {
      return {
        ok: false,
        reason:
          'The tolerance interval needs at least two numeric observations with a positive standard deviation and a proportion between 0 and 1',
      };
    }
    tables = toleranceTables(result, values, variableName);
    report = toleranceReport(result, variableName);
    title = copy('Intervallo di tolleranza — {s1}', { s1: variableName });
    header = copy('{s1}% popolazione · confidenza {s2}%', {
      s1: (result.proportion * 100).toFixed(1),
      s2: (result.confidence * 100).toFixed(0),
    });
    performed.push('tolerance');
    charts.push(
      makeChart({
        id: 'tolerance-interval',
        kind: 'interval',
        title: copy('Intervallo di tolleranza'),
        subtitle: copy('Copre il {s1}% della popolazione con confidenza {s2}%', {
          s1: (result.proportion * 100).toFixed(1),
          s2: (result.confidence * 100).toFixed(0),
        }),
        note: copy('La barra va dal limite inferiore al limite superiore; il punto è la media. Non è un intervallo di confidenza della media: descrive dove cadono le singole osservazioni.'),
        data: {
          intervals: [
            {
              category: variableName,
              estimate: result.mean,
              lo: result.lo,
              hi: result.hi,
            },
          ],
        },
        fields: { xLabel: copy('Variabile'), yLabel: variableName },
      })
    );
  } else if (params.mode === 'cusum') {
    const values = numericValues(grid, params.variable);
    const result = cusumChart(values);
    if (!result) {
      return {
        ok: false,
        reason: 'CUSUM needs at least four consecutive numeric observations with a positive standard deviation',
      };
    }
    tables = cusumTables(result, variableName);
    report = cusumReport(result, variableName);
    title = copy('CUSUM — {s1}', { s1: variableName });
    header = copy('target {s1} · h {s2}σ', {
      s1: result.center.toFixed(2),
      s2: result.h.toFixed(1),
    });
    performed.push('cusum');
    charts.push(
      makeChart({
        id: 'cusum-chart',
        kind: 'line',
        title: copy('CUSUM'),
        subtitle: copy('k = {s1}σ · h = {s2}σ', {
          s1: result.k.toFixed(1),
          s2: result.h.toFixed(1),
        }),
        note: copy('C+ e C− sono le somme cumulative sopra e sotto il target; la linea tratteggiata è l’intervallo di decisione. Un punto oltre la linea è il segnale.'),
        data: {
          series: [
            ...result.points.map(point => ({
              x: point.index,
              y: point.cplus,
              series: copy('C+'),
            })),
            ...result.points.map(point => ({
              x: point.index,
              y: point.cminus,
              series: copy('C−'),
            })),
          ],
          rules: [
            { value: result.upper, label: 'h' },
            { value: 0, label: '0' },
          ],
        },
        fields: { xLabel: copy('Osservazione'), yLabel: copy('Somma cumulata'), series: copy('Lato') },
        options: { showMarkers: true, showBand: false, showLegend: true } as never,
      })
    );
  } else if (params.mode === 'pareto') {    const categoryName = grid.cols[params.category]?.name ?? 'Categoria';
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
  } else if (params.mode === 'msa') {
    const partName = grid.cols[params.part]?.name ?? 'Parte';
    const operatorName = grid.cols[params.operator]?.name ?? 'Operatore';
    if (params.part === params.operator) {
      return { ok: false, reason: 'Gage R&R needs two different columns: part and operator' };
    }
    const rows = grid.rows
      .map(row => ({
        part: String(row[params.part] ?? '').trim(),
        operator: String(row[params.operator] ?? '').trim(),
        value: parseNum(row[params.variable]),
      }))
      .filter(row => row.part !== '' && row.operator !== '' && Number.isFinite(row.value));
    const result = gageRr(rows);
    if (!result) {
      return {
        ok: false,
        reason:
          'Gage R&R needs a balanced crossed design: at least two parts, two operators and the same non-empty replicates for every part-operator cell',
      };
    }
    tables = msaTables(result, variableName);
    report = msaReport(result, variableName);
    title = copy('Gage R&R — {s1}', { s1: variableName });
    header = copy('{s1} parti × {s2} operatori × {s3} repliche', {
      s1: result.parts,
      s2: result.operators,
      s3: result.replicates,
    });
    performed.push('msa');
    charts.push(
      makeChart({
        id: 'msa-variance',
        kind: 'bar',
        title: copy('Componenti di varianza'),
        subtitle: copy('Gage R&R = {s1}% della variabilità', {
          s1: result.pctStudyVariation.toFixed(1),
        }),
        note: copy('Le barre separano la variabilità dello strumento (ripetibilità), quella tra operatori (riproducibilità) e quella reale tra i pezzi. Un Gage R&R alto significa che il sistema di misura non distingue i pezzi.'),
        data: {
          bars: [
            { category: copy('Ripetibilità'), value: result.sd.repeatability },
            { category: copy('Riproducibilità'), value: result.sd.reproducibility },
            { category: copy('Parti'), value: result.sd.part },
          ],
        },
        fields: { xLabel: copy('Componente'), yLabel: copy('Deviazione standard') },
        options: { valueLabels: true, referenceLine: 'none' } as never,
      })
    );
  } else if (params.mode === 'acceptance') {
    const result = acceptancePlan({
      n: params.planN,
      c: params.planC,
      lotSize: params.lotSize,
    });
    if (!result) {
      return {
        ok: false,
        reason:
          'Acceptance sampling needs a sample size of at least one, an acceptance number below the sample size and a lot at least as large as the sample',
      };
    }
    tables = acceptanceTables(result);
    report = acceptanceReport(result);
    title = copy('Campionamento di accettazione');
    header = copy('n {s1} · c {s2} · lotto {s3}', {
      s1: result.n,
      s2: result.c,
      s3: result.lotSize > 0 ? result.lotSize : copy('infinito'),
    });
    performed.push('acceptance');
    charts.push(
      makeChart({
        id: 'accept-oc',
        kind: 'line',
        title: copy('Curva operativa (OC)'),
        subtitle: copy('Probabilità di accettare un lotto con qualità p'),
        note: copy('La curva scende al crescere della difettosità in ingresso: AQL è il punto in cui si accetta ancora nel 95% dei casi, LTPD quello in cui si accetta solo nel 10%.'),
        data: {
          series: result.points.map(point => ({ x: point.p, y: point.pa })),
          rules: [
            { value: 0.95, label: 'AQL' },
            { value: 0.1, label: 'LTPD' },
          ],
        },
        fields: { xLabel: copy('Difettosità in ingresso'), yLabel: copy('Probabilità di accettazione') },
        options: { showMarkers: false, showBand: false } as never,
      }),
      makeChart({
        id: 'accept-aoq',
        kind: 'line',
        title: copy('Qualità media in uscita (AOQ)'),
        subtitle: copy('AOQL = {s1}', { s1: result.aoql.toFixed(4) }),
        note: copy('L’AOQ è la difettosità media che esce dal piano dopo l’ispezione: ha un massimo, l’AOQL. Non scende a zero perché i lotti accettati conservano i difettosi non trovati.'),
        data: {
          series: result.points.map(point => ({ x: point.p, y: point.aoq })),
          rules: [{ value: result.aoql, label: 'AOQL' }],
        },
        fields: { xLabel: copy('Difettosità in ingresso'), yLabel: 'AOQ' },
        options: { showMarkers: false, showBand: false } as never,
      })
    );
  } else if (params.mode === 'mcontrol') {
    const variables = params.variables.filter(
      (value, index, values) => values.indexOf(value) === index
    );
    if (variables.length < 2) {
      return { ok: false, reason: 'The T² chart needs at least two numeric variables' };
    }
    const rows = grid.rows.map(row =>
      variables.map(variable => parseNum(row[variable]))
    );
    const result = multiControlChart({
      rows,
      variableNames: variables.map(variable => grid.cols[variable]?.name ?? `X${variable + 1}`),
      subgroup: params.subgroup,
      alpha: 0.05,
    });
    if (!result) {
      return {
        ok: false,
        reason:
          'The T² chart needs complete rows, at least two subgroups and more observations than variables',
      };
    }
    tables = mcontrolTables(result);
    report = mcontrolReport(result);
    title = copy('Carta T² — {s1}', { s1: result.variables.join(', ') });
    header = copy('{s1} sottogruppi di {s2} · UCL {s3}', {
      s1: result.groups,
      s2: result.subgroup,
      s3: result.ucl.toFixed(3),
    });
    performed.push('mcontrol');
    charts.push(
      makeChart({
        id: 'mcontrol-chart',
        kind: 'line',
        title: copy('Carta T² di Hotelling'),
        subtitle: copy('{s1} punti fuori controllo su {s2}', {
          s1: result.outCount,
          s2: result.points.length,
        }),
        note: copy('La distanza T² combina le variabili con la loro covarianza. Un punto oltre il limite dice che la combinazione è insolita, non quale variabile ha causato il segnale.'),
        data: {
          series: result.points.map(point => ({ x: point.index, y: point.t2 })),
          rules: [{ value: result.ucl, label: 'UCL' }],
        },
        fields: { xLabel: copy('Sottogruppo'), yLabel: 'T²' },
        options: { showMarkers: true, showBand: false } as never,
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
