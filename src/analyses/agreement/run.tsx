import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import type { AnalysisChart } from '../../stats/charts';
import { blandAltmanStats, iccStats, kappaStats } from '../../stats/kernels/agreement';
import { blandAltmanTables, iccTables, kappaTables } from '../../stats/tables/agreement';
import { blandAltmanReport, iccReport, kappaReport } from '../../stats/reports/agreement';
import type { Dataset } from '../../grid/types';
import type { AgreementParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface AgreementInput {
  grid: Dataset;
  params: AgreementParams;
  ciLevel: number;
}

/** ICC, Bland–Altman e kappa. */
export const buildAgreementOutput = ({ grid, params, ciLevel }: AgreementInput): AnalysisRunResult => {
  if (params.mode === 'bland') {
    if (params.columns.length !== 2) {
      return { ok: false, reason: 'Select exactly two measurements for Bland–Altman' };
    }
    const stats = blandAltmanStats(grid.rows, params.columns[0], params.columns[1], ciLevel);
    if (!stats) {
      return { ok: false, reason: 'Bland–Altman needs at least three complete pairs' };
    }
    const tables = blandAltmanTables(stats, ciLevel);
    const chart: AnalysisChart = makeChart({
      id: 'agreement-bland',
      kind: 'bland',
      title: copy('Bland–Altman: accordo tra le misure'),
      subtitle: copy('Bias {s1} · limiti {s2} / {s3}', {
        s1: stats.bias.toFixed(3),
        s2: stats.loaLower.toFixed(3),
        s3: stats.loaUpper.toFixed(3),
      }),
      note: copy('La linea centrale è il bias medio; le linee tratteggiate sono i limiti di accordo (bias ± 1,96·SD).'),
      data: {
        points: stats.points.map(point => ({ x: point.mean, y: point.diff })),
        rules: [
          { y: stats.bias },
          { y: stats.loaUpper },
          { y: stats.loaLower },
        ],
      },
      fields: { xLabel: copy('Media delle due misure'), yLabel: copy('Differenza') },
    });
    return {
      ok: true,
      title: copy('Accordo tra le due misure'),
      tables,
      report: blandAltmanReport(stats, ciLevel),
      charts: [
        chart,
        makeChart({
          id: 'agreement-bland-ci',
          kind: 'interval',
          title: copy('Bias e limiti di accordo con IC'),
          subtitle: copy('IC {s1}%', { s1: ciLevel }),
          note: copy('Ogni punto è una stima (bias o limite) e il segmento è il suo intervallo di confidenza: limiti di accordo imprecisi vanno letti con cautela.'),
          data: {
            intervals: [
              { category: copy('Bias'), estimate: stats.bias, lo: stats.biasLo, hi: stats.biasHi },
              { category: copy('Limite superiore'), estimate: stats.loaUpper, lo: stats.loaUpperLo, hi: stats.loaUpperHi },
              { category: copy('Limite inferiore'), estimate: stats.loaLower, lo: stats.loaLowerLo, hi: stats.loaLowerHi },
            ],
            rules: [{ value: 0 }],
          },
          fields: { xLabel: copy('Stima'), yLabel: copy('Differenza') },
          options: { valueLabels: true } as never,
        }),
      ],
    };
  }

  if (params.mode === 'kappa') {
    const stats = kappaStats(grid.rows, params.columns, params.weight, ciLevel);
    if (!stats) {
      return {
        ok: false,
        reason: 'Kappa needs at least two raters with complete categorical ratings',
      };
    }
    const tables = kappaTables(stats, ciLevel);
    const cells = stats.matrix.flatMap((row, i) =>
      row.map((value, j) => ({
        x: stats.categoryLabels[j],
        y: stats.categoryLabels[i],
        value,
        label: String(value),
      }))
    );
    return {
      ok: true,
      title: copy('Kappa: accordo categorico'),
      tables,
      report: kappaReport(stats, ciLevel),
      charts: [
        makeChart({
          id: 'agreement-kappa',
          kind: 'heatmap',
          title: copy('Matrice di accordo'),
          subtitle: copy('κ = {s1} · {s2} valutatori', { s1: stats.kappa.toFixed(3), s2: stats.raters }),
          note: copy('La diagonale contiene gli accordi; le celle fuori diagonale sono i disaccordi tra categorie.'),
          data: { cells },
          fields: { xLabel: copy('Valutatore / categoria'), yLabel: copy('Valutatore / categoria') },
          options: { showValues: true } as never,
        }),
        makeChart({
          id: 'agreement-kappa-ci',
          kind: 'interval',
          title: copy('Kappa con intervallo di confidenza'),
          subtitle: copy('IC {s1}%', { s1: ciLevel }),
          note: copy('Se l’intervallo contiene lo zero l’accordo osservato non è distinguibile dal caso.'),
          data: {
            intervals: [{ category: copy('Kappa'), estimate: stats.kappa, lo: stats.lo, hi: stats.hi }],
            rules: [{ value: 0 }],
          },
          fields: { xLabel: copy('Stima'), yLabel: copy('Kappa') },
          options: { valueLabels: true } as never,
        }),
      ],
    };
  }

  const stats = iccStats(grid.rows, params.columns);
  if (!stats) {
    return { ok: false, reason: 'ICC needs at least two measurements and two complete subjects' };
  }
  const tables = iccTables(stats, ciLevel);
  const points = grid.rows
    .map(row => ({ x: parseNum(row[params.columns[0]]), y: parseNum(row[params.columns[1]]) }))
    .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
  const values = points.flatMap(point => [point.x, point.y]);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  return {
    ok: true,
    title: copy('ICC: affidabilità tra misure'),
    tables,
    report: iccReport(tables, stats, ciLevel),
    charts: [
      makeChart({
        id: 'agreement-icc',
        kind: 'scatter',
        title: copy('Accordo tra le prime due misure'),
        subtitle: copy('ICC(2,1) = {s1} · N = {s2}', {
          s1: Number.isFinite(stats.icc21) ? stats.icc21.toFixed(3) : 'n.d.',
          s2: stats.n,
        }),
        note: copy('I punti vicini alla diagonale indicano accordo tra le due misurazioni.'),
        data: { points, fit: [{ x: min, y: min }, { x: max, y: max }] },
        fields: {
          xLabel: grid.cols[params.columns[0]]?.name ?? 'X1',
          yLabel: grid.cols[params.columns[1]]?.name ?? 'X2',
        },
        options: { fit: 'ols', band: 'none' } as never,
      }),
    ],
  };
};
