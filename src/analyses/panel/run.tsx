import { fitPanel } from '../../stats/kernels/panel';
import { panelTables } from '../../stats/tables/panel';
import { panelReport } from '../../stats/reports/panel';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import type { Dataset } from '../../grid/types';
import type { PanelParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { AnalysisRunResult } from '../types';

export interface PanelInput {
  grid: Dataset;
  params: PanelParams;
  ciLevel: number;
}

const modelLabel = (model: PanelParams['model']): string =>
  model === 'fe' ? copy('effetti fissi') : model === 're' ? copy('effetti casuali') : copy('fissi e casuali');

/**
 * Run a panel model (fixed effects, random effects or both).
 *
 * The builder validates the four column roles, keeps the complete rows and
 * delegates the estimation to `fitPanel`. The kernel rejects duplicated
 * entity–period cells and collinear designs, so the messages here stay focused
 * on the user's parameter choices.
 */
export const buildPanelOutput = ({ grid, params, ciLevel }: PanelInput): AnalysisRunResult => {
  const { dep, indeps, entity, time, model } = params;
  const width = grid.cols.length;
  const validIndex = (index: number): boolean =>
    Number.isInteger(index) && index >= 0 && index < width;

  if (!validIndex(dep)) return { ok: false, reason: 'Select a dependent variable' };
  if (indeps.length === 0) return { ok: false, reason: 'Select at least one predictor' };
  if (indeps.some(index => !validIndex(index))) {
    return { ok: false, reason: 'Select valid predictors' };
  }
  if (!validIndex(entity)) return { ok: false, reason: 'Select a valid entity column' };
  if (!validIndex(time)) return { ok: false, reason: 'Select a valid time column' };
  if (model !== 'fe' && model !== 're' && model !== 'both') {
    return { ok: false, reason: 'Select a valid panel model' };
  }

  const roles = [dep, ...indeps, entity, time];
  if (new Set(roles).size !== roles.length) {
    return {
      ok: false,
      reason:
        'The dependent variable, the predictors, the entity and the time columns must be different columns',
    };
  }

  const complete = grid.rows
    .map((row, index) => ({ row, index }))
    .filter(entry => {
      if (!Number.isFinite(parseNum(entry.row[dep]))) return false;
      if (!indeps.every(index => Number.isFinite(parseNum(entry.row[index])))) return false;
      if (!Number.isFinite(parseNum(entry.row[time]))) return false;
      return String(entry.row[entity] ?? '').trim() !== '';
    });

  if (complete.length < 4) {
    return {
      ok: false,
      reason: 'Not enough complete rows: a panel model needs at least two entities observed twice',
    };
  }

  const y = complete.map(entry => parseNum(entry.row[dep]));
  const x = complete.map(entry => indeps.map(index => parseNum(entry.row[index])));
  const entities = complete.map(entry => String(entry.row[entity] ?? '').trim());
  const periods = complete.map(entry => parseNum(entry.row[time]));

  const fit = fitPanel({ y, x, entity: entities, time: periods, model, level: ciLevel });
  if (!fit) {
    return {
      ok: false,
      reason:
        'The panel model could not be estimated: check for collinear predictors, duplicated entity-period rows, a single period per entity or too few entities',
    };
  }

  const depName = grid.cols[dep]?.name ?? 'Y';
  const predictorNames = indeps.map(
    (index, position) => grid.cols[index]?.name ?? `X${position + 1}`
  );
  const entityName = grid.cols[entity]?.name ?? 'Entity';
  const timeName = grid.cols[time]?.name ?? 'Time';

  const tables = panelTables(fit, { dep: depName, predictors: predictorNames }, ciLevel);

  const primary = fit.fe ?? fit.re;
  if (!primary) {
    return { ok: false, reason: 'The panel model could not be estimated' };
  }
  const observedFitted = primary.fittedLevel;
  const chartLabel = fit.fe ? copy('FE') : copy('RE');

  // Entity effects of the fitted model: the kernel returns them for FE, while
  // for RE they are the implied alpha_i = ybar_i - xbar_i'b (descriptive).
  const order: string[] = [];
  const groupOf = new Map<string, number>();
  for (const label of entities) {
    if (!groupOf.has(label)) {
      groupOf.set(label, order.length);
      order.push(label);
    }
  }
  const meanOf = (values: number[], group: number): number => {
    let sum = 0;
    let count = 0;
    values.forEach((value, index) => {
      if (groupOf.get(entities[index]) === group) {
        sum += value;
        count += 1;
      }
    });
    return count > 0 ? sum / count : Number.NaN;
  };
  const entityEffects =
    fit.fe?.entityEffects ??
    (() => {
      const slopes = fit.re ? fit.re.coefficients.slice(1).map(coefficient => coefficient.beta) : [];
      return order.map((label, group) => ({
        entity: label,
        effect:
          meanOf(y, group) -
          slopes.reduce((sum, slope, column) => sum + slope * meanOf(x.map(row => row[column]), group), 0),
      }));
    })();

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'panel-observed-fitted',
      kind: 'scatter',
      title: copy('Valori osservati e stimati'),
      subtitle: copy('{s1} · {s2} · N = {s3}', {
        s1: chartLabel,
        s2: depName,
        s3: fit.n,
      }),
      note: copy('Ogni punto confronta la risposta osservata con la previsione del modello panel: gli scostamenti sono i residui usati per le componenti di varianza.'),
      data: {
        series: y.map((value, index) => ({
          x: observedFitted[index],
          y: value,
          series: copy('Osservazioni'),
        })),
      },
      fields: { xLabel: copy('Valore stimato'), yLabel: depName, series: copy('Serie') },
      stats: { n: fit.n, entities: fit.entities, periods: fit.periods },
      options: { showMarkers: true, showBand: false } as never,
    }),
    makeChart({
      id: 'panel-entity-effects',
      kind: 'bar',
      title: copy('Effetti per entità'),
      subtitle: copy('{s1} · {s2}', { s1: chartLabel, s2: entityName }),
      note: copy('Ogni barra è il livello medio dell’entità al netto dei regressori: differenze persistenti tra barre indicano che le entità partono da livelli diversi.'),
      data: {
        bars: entityEffects.map(effect => ({
          category: effect.entity,
          value: effect.effect,
        })),
      },
      fields: { xLabel: entityName, yLabel: copy('Effetto') },
      options: { valueLabels: false } as never,
    }),
  ];

  if (fit.fe && fit.re) {
    const feCoefficients = fit.fe.coefficients;
    const reCoefficients = fit.re.coefficients.slice(1);
    const bars = feCoefficients.flatMap((coefficient, index) => [
      {
        category: predictorNames[index] ?? coefficient.term,
        value: coefficient.beta,
        series: copy('FE'),
      },
      {
        category: predictorNames[index] ?? coefficient.term,
        value: reCoefficients[index]?.beta ?? Number.NaN,
        series: copy('RE'),
      },
    ]);
    charts.push(
      makeChart({
        id: 'panel-fe-re',
        kind: 'bar',
        title: copy('Confronto tra effetti fissi e casuali'),
        subtitle: copy('Coefficienti per regressore'),
        note: copy('Differenze marcate tra FE e RE segnalano che gli effetti di entità sono correlati con i regressori: è lo stesso fenomeno che il test di Hausman misura.'),
        data: { bars },
        fields: { xLabel: copy('Regressore'), yLabel: copy('B'), series: copy('Modello') },
        options: { grouping: 'grouped' } as never,
      })
    );
  }

  return {
    ok: true,
    title: copy('Modelli panel — {s1}', { s1: depName }),
    header: copy('{s1} · {s2} · {s3} entità × {s4} periodi · CI {s5}%', {
      s1: depName,
      s2: modelLabel(model),
      s3: fit.entities,
      s4: fit.periods,
      s5: ciLevel,
    }),
    tables,
    report: panelReport(tables, depName, ciLevel),
    charts,
  };
};
