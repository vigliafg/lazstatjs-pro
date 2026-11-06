import { parseNum } from '../../stats/core';
import { addIntercept, glmEffects, glmFit, type GlmFamily, type GlmLink } from '../../stats/kernels/glm';
import { lrEffectsTable } from '../../stats/tables/effects';
import { glmTables } from '../../stats/tables/glm';
import { glmReport } from '../../stats/reports/glm';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { Dataset } from '../../grid/types';
import type { GlmParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { AnalysisRunResult } from '../types';

export interface GlmRunInput {
  grid: Dataset;
  params: GlmParams;
  ciLevel: number;
}

const familyLabel = (family: GlmFamily): string => {
  if (family === 'gaussian') return copy('Gaussiana');
  if (family === 'binomial') return copy('Binomiale');
  if (family === 'poisson') return copy('Poisson');
  return copy('Gamma');
};

export const buildGlmOutput = ({ grid, params, ciLevel }: GlmRunInput): AnalysisRunResult => {
  const { dep, indeps, family, link } = params;
  if (indeps.length === 0) return { ok: false, reason: 'Select at least one predictor' };
  if (indeps.includes(dep)) return { ok: false, reason: 'The dependent variable cannot also be a predictor' };

  const rows = grid.rows.filter(row => {
    if (!Number.isFinite(parseNum(row[dep]))) return false;
    return indeps.every(index => Number.isFinite(parseNum(row[index])));
  });
  if (rows.length <= indeps.length + 1) {
    return { ok: false, reason: 'Insufficient complete rows for the GLM' };
  }

  const y = rows.map(row => parseNum(row[dep]));
  if (family === 'binomial' && y.some(value => value !== 0 && value !== 1)) {
    return { ok: false, reason: 'The binomial family needs a 0/1 response' };
  }
  if (family === 'gamma' && y.some(value => !(value > 0))) {
    return { ok: false, reason: 'The Gamma family needs a strictly positive response' };
  }
  if (family === 'poisson' && y.some(value => value < 0)) {
    return { ok: false, reason: 'The Poisson family needs a non-negative response' };
  }

  const x = addIntercept(rows.map(row => indeps.map(index => parseNum(row[index]))));
  const fit = glmFit({ y, x, family, link: link as GlmLink });
  if (!fit) {
    return {
      ok: false,
      reason: 'The model could not be estimated: check the family/link combination and the predictor scale',
    };
  }

  const depName = grid.cols[dep]?.name ?? 'Y';
  const predictorNames = indeps.map((index, position) => grid.cols[index]?.name ?? `X${position + 1}`);
  const names = { dep: depName, predictors: predictorNames, family: familyLabel(family), link };
  const effects = glmEffects({ y, x, family, link: link as GlmLink }, predictorNames);
  const tables = [...glmTables(fit, names, ciLevel), lrEffectsTable('glm-effects', effects)];
  const residuals = y.map((value, index) => value - fit.fitted[index]);

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'glm-fitted',
      kind: 'scatter',
      title: copy('Valori osservati e stimati'),
      subtitle: copy('Famiglia {s1} · link {s2}', { s1: names.family, s2: link }),
      data: {
        series: y.map((value, index) => ({
          x: fit.fitted[index],
          y: value,
          series: copy('Osservazioni'),
        })),
      },
      fields: { xLabel: copy('Valore stimato'), yLabel: depName, series: copy('Serie') },
      options: { showPoints: true, showBand: false } as never,
    }),
    makeChart({
      id: 'glm-residuals',
      kind: 'residual',
      title: copy('Residui'),
      subtitle: copy('Risposta meno valore stimato'),
      data: {
        points: fit.fitted.map((value, index) => ({
          x: value,
          y: residuals[index],
          series: copy('Residui'),
        })),
      },
      fields: { xLabel: copy('Valore stimato'), yLabel: copy('Residuo'), series: copy('Serie') },
      options: { showPoints: true } as never,
    }),
  ];

  if (indeps.length === 1) {
    const sorted = rows
      .map((row, index) => ({
        x: parseNum(row[indeps[0]]),
        y: parseNum(row[dep]),
        fitted: fit.fitted[index],
      }))
      .sort((left, right) => left.x - right.x);
    const curve = sorted.map(point => ({
      x: point.x,
      y: point.fitted,
      series: copy('Media stimata'),
    }));
    charts.push(
      makeChart({
        id: 'glm-profile',
        kind: 'line',
        title: copy('Profilo della media stimata'),
        subtitle: predictorNames[0],
        data: {
          series: [
            ...sorted.map(point => ({ x: point.x, y: point.y, series: copy('Osservazioni') })),
            ...curve,
          ],
        },
        fields: { xLabel: predictorNames[0], yLabel: depName, series: copy('Serie') },
        options: { showMarkers: true, showBand: false } as never,
      })
    );
  }

  return {
    ok: true,
    title: copy('GLM — {s1}', { s1: depName }),
    tables,
    report: glmReport(tables, depName, names.family, link, ciLevel),
    charts,
  };
};
