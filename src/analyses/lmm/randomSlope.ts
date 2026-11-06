import { parseNum } from '../../stats/core';
import { addIntercept } from '../../stats/kernels/glm';
import { fitGlmm } from '../../stats/kernels/glmm';
import { lmmRandomSlopeTables } from '../../stats/tables/lmmRandomSlope';
import { lmmRandomSlopeReport } from '../../stats/reports/lmmRandomSlope';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { LmmParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface LmmRandomSlopeInput {
  grid: Dataset;
  params: LmmParams;
  ciLevel: number;
}

/**
 * Linear mixed model with a random intercept and a random slope for the first
 * fixed predictor. Runs through the Gaussian GLMM kernel, which uses the same
 * Laplace machinery as the generalized models (exact for the Gaussian case).
 */
export const buildLmmRandomSlopeOutput = ({
  grid,
  params,
  ciLevel,
}: LmmRandomSlopeInput): AnalysisRunResult => {
  const { dep, indeps, group } = params;
  const slopeColumn = indeps[0];
  if (slopeColumn === undefined || slopeColumn < 0) {
    return { ok: false, reason: 'Select at least one fixed predictor to use as random slope' };
  }

  const rows = grid.rows
    .map(row => ({
      y: parseNum(row[dep]),
      xs: indeps.map(index => parseNum(row[index])),
      slope: parseNum(row[slopeColumn]),
      group: String(row[group] ?? '').trim(),
    }))
    .filter(
      entry =>
        Number.isFinite(entry.y) &&
        entry.xs.every(Number.isFinite) &&
        Number.isFinite(entry.slope) &&
        entry.group !== ''
    );
  if (rows.length < indeps.length + 4) {
    return { ok: false, reason: 'Not enough complete rows for a random-slope model' };
  }

  const fit = fitGlmm({
    y: rows.map(row => row.y),
    x: addIntercept(rows.map(row => row.xs)),
    slope: rows.map(row => row.slope),
    groups: rows.map(row => row.group),
    family: 'gaussian',
    link: 'identity',
    randomSlope: true,
    level: ciLevel,
  });
  if (!fit) {
    return {
      ok: false,
      reason:
        'The random-slope model could not be estimated: check the number of groups and the spread of the slope',
    };
  }

  const depName = grid.cols[dep]?.name ?? 'Y';
  const predNames = indeps.map((index, position) => grid.cols[index]?.name ?? `X${position + 1}`);
  const groupName = grid.cols[group]?.name ?? 'Group';
  const slopeName = grid.cols[slopeColumn]?.name ?? 'X1';
  const names = {
    dep: depName,
    predictors: predNames,
    group: groupName,
    slope: slopeName,
  };
  const tables = lmmRandomSlopeTables(fit, names, ciLevel);

  const intervals = fit.randomEffects.map(effect => ({
    category: effect.group,
    estimate: effect.slope,
    lo: effect.slope - 1.96 * effect.slopeSe,
    hi: effect.slope + 1.96 * effect.slopeSe,
  }));
  const intercepts = fit.randomEffects.map(effect => ({
    category: effect.group,
    estimate: effect.intercept,
    lo: effect.intercept - 1.96 * effect.interceptSe,
    hi: effect.intercept + 1.96 * effect.interceptSe,
  }));
  const all = [...fit.fitted, ...rows.map(row => row.y)];
  const min = all.length ? Math.min(...all) : 0;
  const max = all.length ? Math.max(...all) : 1;

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'lmm-observed-fitted',
      kind: 'scatter',
      title: copy('Osservati vs predetti'),
      subtitle: `${depName} · ${fit.n} osservazioni`,
      data: {
        points: rows.map((row, index) => ({ x: fit.fitted[index], y: row.y })),
        fit: [{ x: min, y: min }, { x: max, y: max }],
      },
      fields: { xLabel: copy('Valori predetti'), yLabel: depName },
      options: { fit: 'ols', band: 'none' } as never,
    }),
    makeChart({
      id: 'lmm-random-slopes',
      kind: 'interval',
      title: copy('Pendenze casuali per gruppo'),
      subtitle: copy('BLUP della pendenza di {s1} e IC 95% approssimato', { s1: slopeName }),
      data: { intervals, rules: [{ value: 0 }] },
      fields: { xLabel: groupName, yLabel: copy('Pendenza casuale') },
      options: { sort: 'asc' } as never,
    }),
    makeChart({
      id: 'lmm-random-intercepts',
      kind: 'interval',
      title: copy('Intercette casuali per gruppo'),
      subtitle: copy('BLUP dell’intercetta e IC 95% approssimato'),
      data: { intervals: intercepts, rules: [{ value: 0 }] },
      fields: { xLabel: groupName, yLabel: copy('Intercetta casuale') },
      options: { sort: 'asc' } as never,
    }),
  ];

  if (fit.varianceComponents.length > 0) {
    charts.push(
      makeChart({
        id: 'lmm-variance-interval',
        kind: 'interval',
        title: copy('Componenti di varianza'),
        subtitle: copy('Stima e CI {s1}%', { s1: ciLevel }),
        note: copy('L’intervallo misura l’incertezza sulla componente: se è ampio servono più gruppi per una stima stabile.'),
        data: {
          intervals: fit.varianceComponents.map(entry => ({
            category:
              entry.component === 'intercept'
                ? copy('Intercetta casuale')
                : entry.component === 'slope'
                  ? copy('Varianza pendenza')
                  : copy('Residuo'),
            estimate: entry.estimate,
            lo: entry.lo,
            hi: entry.hi,
          })),
        },
        fields: { xLabel: copy('Componente'), yLabel: copy('Varianza') },
        options: { sort: 'none' } as never,
      })
    );
  }

  return {
    ok: true,
    title: copy('Modello misto con pendenza casuale: {s1}', { s1: depName }),
    tables,
    report: lmmRandomSlopeReport(tables, {
      dep: depName,
      group: groupName,
      slope: slopeName,
      level: ciLevel,
    }),
    charts,
  };
};
