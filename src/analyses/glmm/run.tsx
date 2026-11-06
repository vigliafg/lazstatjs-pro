import { parseNum } from '../../stats/core';
import { addIntercept } from '../../stats/kernels/glm';
import { fitGlmm } from '../../stats/kernels/glmm';
import { glmmTables } from '../../stats/tables/glmm';
import { glmmReport } from '../../stats/reports/glmm';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { AnalysisChart } from '../../stats/charts';
import type { Dataset } from '../../grid/types';
import type { GlmmParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';

export interface GlmmInput {
  grid: Dataset;
  params: GlmmParams;
  ciLevel: number;
}

const familyLabel = (family: GlmmParams['family']): string =>
  family === 'gaussian'
    ? copy('Gaussiana')
    : family === 'binomial'
      ? copy('Binomiale')
      : copy('Poisson');

const linkLabel = (link: GlmmParams['link']): string =>
  link === 'identity' ? copy('Identità') : link === 'logit' ? copy('Logit') : copy('Log');

/** Modello lineare generalizzato misto con effetti casuali a intercetta e pendenza. */
export const buildGlmmOutput = ({ grid, params, ciLevel }: GlmmInput): AnalysisRunResult => {
  const { dep, indeps, group, family, link, slope } = params;
  if (indeps.length === 0) return { ok: false, reason: 'Select at least one fixed predictor' };
  if (dep === group) return { ok: false, reason: 'Outcome and group must be different columns' };
  if (indeps.includes(dep) || indeps.includes(group)) {
    return { ok: false, reason: 'Outcome and group cannot also be fixed predictors' };
  }

  const randomSlope = Number.isInteger(slope) && slope >= 0;
  if (randomSlope && (slope === dep || slope === group)) {
    return { ok: false, reason: 'The random slope must differ from the outcome and the group' };
  }

  const rows = grid.rows
    .map(row => ({
      y: parseNum(row[dep]),
      xs: indeps.map(index => parseNum(row[index])),
      slope: randomSlope ? parseNum(row[slope]) : 0,
      group: String(row[group] ?? '').trim(),
    }))
    .filter(
      entry =>
        Number.isFinite(entry.y) &&
        entry.xs.every(Number.isFinite) &&
        (!randomSlope || Number.isFinite(entry.slope)) &&
        entry.group !== ''
    );
  if (rows.length < indeps.length + 4) {
    return { ok: false, reason: 'Not enough complete rows for the mixed model' };
  }

  const y = rows.map(row => row.y);
  if (family === 'binomial' && y.some(value => value !== 0 && value !== 1)) {
    return { ok: false, reason: 'The binomial family needs a 0/1 response' };
  }
  if (family === 'poisson' && y.some(value => value < 0)) {
    return { ok: false, reason: 'The Poisson family needs a non-negative response' };
  }

  const fit = fitGlmm({
    y,
    x: addIntercept(rows.map(row => row.xs)),
    slope: randomSlope ? rows.map(row => row.slope) : undefined,
    groups: rows.map(row => row.group),
    family,
    link,
    randomSlope,
    level: ciLevel,
  });
  if (!fit) {
    return {
      ok: false,
      reason:
        'The mixed model could not be estimated: check the number of groups, the family/link pair and separation',
    };
  }

  const depName = grid.cols[dep]?.name ?? 'Y';
  const predictorNames = indeps.map(
    (index, position) => grid.cols[index]?.name ?? `X${position + 1}`
  );
  const groupName = grid.cols[group]?.name ?? 'Group';
  const slopeName = randomSlope ? grid.cols[slope]?.name ?? 'X1' : '—';
  const factor = randomSlope ? Math.max(0, indeps.indexOf(slope)) : 0;
  const names = {
    dep: depName,
    predictors: predictorNames,
    group: groupName,
    factor,
  };
  const tables = glmmTables(fit, names, ciLevel);

  const intervals = fit.randomEffects.map(effect => ({
    category: effect.group,
    estimate: effect.intercept,
    lo: effect.intercept - 1.96 * effect.interceptSe,
    hi: effect.intercept + 1.96 * effect.interceptSe,
  }));
  const all = [...fit.fitted, ...y];
  const min = all.length ? Math.min(...all) : 0;
  const max = all.length ? Math.max(...all) : 1;
  const charts: AnalysisChart[] = [
    makeChart({
      id: 'glmm-observed-fitted',
      kind: 'scatter',
      title: copy('Osservati vs predetti'),
      subtitle: copy('{s1} · {s2} osservazioni · {s3} gruppi', {
        s1: depName,
        s2: fit.n,
        s3: fit.groups,
      }),
      note: copy(
        'La diagonale è la corrispondenza perfetta; la nuvola mostra quanto il modello segue le osservazioni.'
      ),
      data: {
        points: y.map((value, index) => ({ x: fit.fitted[index], y: value })),
        fit: [{ x: min, y: min }, { x: max, y: max }],
      },
      fields: { xLabel: copy('Valori predetti'), yLabel: depName },
      options: { fit: 'ols', band: 'none' } as never,
    }),
    makeChart({
      id: 'glmm-random-effects',
      kind: 'interval',
      title: copy('Intercette casuali per gruppo'),
      subtitle: copy('BLUP e IC 95% approssimato · ICC = {s1}', {
        s1: Number.isFinite(fit.icc) ? fit.icc.toFixed(3) : 'n.d.',
      }),
      note: copy(
        'Ogni punto è lo scostamento stimato del gruppo dall’intercetta media: intervalli sovrapposti indicano poca eterogeneità.'
      ),
      data: { intervals, rules: [{ value: 0 }] },
      fields: { xLabel: groupName, yLabel: copy('Intercetta casuale') },
      options: { sort: 'asc' } as never,
    }),
    makeChart({
      id: 'glmm-residual-fitted',
      kind: 'residual',
      title: copy('Residui vs predetti'),
      subtitle: copy('N = {s1}', { s1: fit.n }),
      note: copy('Residui senza struttura sono coerenti con l’ipotesi di varianza costante.'),
      data: {
        points: fit.fitted.map((value, index) => ({
          x: value,
          y: fit.residuals[index],
          series: copy('Residui'),
        })),
      },
      fields: { xLabel: copy('Valori predetti'), yLabel: copy('Residuo'), series: copy('Serie') },
      options: { showMarkers: true, showBand: false } as never,
    }),
  ];

  if (fit.randomSlope) {
    const slopes = fit.randomEffects.map(effect => ({
      category: effect.group,
      estimate: effect.slope,
      lo: effect.slope - 1.96 * effect.slopeSe,
      hi: effect.slope + 1.96 * effect.slopeSe,
    }));
    charts.push(
      makeChart({
        id: 'glmm-random-slopes',
        kind: 'interval',
        title: copy('Pendenze casuali per gruppo'),
        subtitle: copy('BLUP della pendenza di {s1} · varianza {s2}', {
          s1: slopeName,
          s2: fit.random.slopeVariance.toFixed(4),
        }),
        note: copy(
          'La linea a zero è la pendenza media: gruppi lontani da zero hanno un andamento diverso dal resto.'
        ),
        data: { intervals: slopes, rules: [{ value: 0 }] },
        fields: { xLabel: groupName, yLabel: copy('Pendenza casuale') },
        options: { sort: 'asc' } as never,
      })
    );
  }

  if (fit.varianceComponents.length > 0) {
    charts.push(
      makeChart({
        id: 'glmm-variance-interval',
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
    title: copy('GLMM: {s1}', { s1: depName }),
    tables,
    report: glmmReport(
      tables,
      { dep: depName, group: groupName, family: familyLabel(family), link: linkLabel(link) },
      ciLevel
    ),
    charts,
  };
};
