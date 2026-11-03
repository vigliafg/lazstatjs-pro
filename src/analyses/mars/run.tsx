import { parseNum } from '../../stats/core';
import { fitMars, marsPredict } from '../../stats/kernels/mars';
import { marsTables } from '../../stats/tables/mars';
import { marsReport } from '../../stats/reports/mars';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { Dataset } from '../../grid/types';
import type { MarsParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { AnalysisRunResult } from '../types';

export interface MarsRunInput {
  grid: Dataset;
  params: MarsParams;
  ciLevel: number;
}

const PROFILE_POINTS = 41;

const mean = (values: readonly number[]): number =>
  values.length === 0 ? Number.NaN : values.reduce((sum, value) => sum + value, 0) / values.length;

/** Griglia uniforme sull'intervallo osservato del primo predittore. */
const profileGrid = (values: readonly number[]): number[] => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (max - min <= 0) return [min];
  return Array.from(
    { length: PROFILE_POINTS },
    (_, index) => min + ((max - min) * index) / (PROFILE_POINTS - 1)
  );
};

/** GAM / MARS: termini, tabelle, report e grafici diagnostici. */
export const buildMarsOutput = ({ grid, params, ciLevel }: MarsRunInput): AnalysisRunResult => {
  const { dep, indeps, degree, maxTerms, penalty, prune } = params;

  if (indeps.length === 0) return { ok: false, reason: 'Select at least one predictor' };
  if (indeps.includes(dep)) {
    return { ok: false, reason: 'The dependent variable cannot also be a predictor' };
  }
  if (dep < 0 || dep >= grid.cols.length || indeps.some(index => index < 0 || index >= grid.cols.length)) {
    return { ok: false, reason: 'Select valid numeric variables for the response and the predictors' };
  }
  if (degree !== 1 && degree !== 2) {
    return { ok: false, reason: 'The interaction degree must be 1 or 2' };
  }
  if (!Number.isInteger(maxTerms) || maxTerms < 3) {
    return { ok: false, reason: 'The maximum number of terms must be an integer of at least 3' };
  }
  if (!Number.isFinite(penalty) || penalty < 0) {
    return { ok: false, reason: 'The GCV penalty must be a non-negative number' };
  }

  const rows = grid.rows.filter(row => {
    if (!Number.isFinite(parseNum(row[dep]))) return false;
    return indeps.every(index => Number.isFinite(parseNum(row[index])));
  });
  if (rows.length < 5) {
    return { ok: false, reason: 'Not enough complete rows: at least 5 finite observations are needed' };
  }

  const y = rows.map(row => parseNum(row[dep]));
  const x = rows.map(row => indeps.map(index => parseNum(row[index])));
  const depName = grid.cols[dep]?.name ?? 'Y';
  const predictorNames = indeps.map(
    (index, position) => grid.cols[index]?.name ?? `X${position + 1}`
  );

  const fit = fitMars({
    y,
    x,
    names: predictorNames,
    degree,
    maxTerms,
    penalty,
    prune,
  });
  if (!fit) {
    return {
      ok: false,
      reason:
        'The MARS model could not be estimated: check the predictor scale, the number of terms and the complete observations',
    };
  }

  const tables = marsTables(fit, {
    dep: depName,
    predictors: predictorNames,
    degree,
    penalty,
  });

  const fittedRows = y.map((value, index) => ({
    x: fit.fitted[index],
    y: value,
    series: copy('Osservazioni'),
  }));

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'mars-fitted',
      kind: 'scatter',
      title: copy('Valori osservati e stimati'),
      subtitle: copy('GAM / MARS · R² = {s1} · N = {s2}', {
        s1: fit.r2.toFixed(3),
        s2: fit.n,
      }),
      note: copy('La nuvola confronta la risposta osservata con il valore stimato dal modello MARS selezionato.'),
      data: { series: fittedRows },
      fields: { xLabel: copy('Valore stimato'), yLabel: depName, series: copy('Serie') },
      stats: { n: fit.n, r2: fit.r2 },
      options: { showMarkers: true, showBand: false } as never,
    }),
  ];

  const firstPredictor = 0;
  const profileValues = profileGrid(x.map(row => row[firstPredictor]));
  if (profileValues.length > 0) {
    const means = indeps.map((_, position) =>
      mean(x.map(row => row[position]))
    );
    const profile = profileValues.map(value => {
      const point = [...means];
      point[firstPredictor] = value;
      return {
        x: value,
        y: marsPredict(fit, point),
        series: copy('Profilo parziale'),
      };
    });
    const observations = rows
      .map((row, index) => ({
        x: parseNum(row[indeps[firstPredictor]]),
        y: y[index],
        series: copy('Osservazioni'),
      }))
      .sort((left, right) => left.x - right.x);

    charts.push(
      makeChart({
        id: 'mars-profile',
        kind: 'line',
        title: copy('Profilo parziale — {s1}', { s1: predictorNames[firstPredictor] }),
        subtitle: copy('Gli altri predittori sono tenuti alla loro media'),
        note: copy('Il profilo mostra come cambia la risposta stimata al variare del primo predittore, con gli altri predittori fissati al valore medio.'),
        data: { series: [...observations, ...profile.filter(point => Number.isFinite(point.y))] },
        fields: { xLabel: predictorNames[firstPredictor], yLabel: depName, series: copy('Serie') },
        stats: { n: fit.n, r2: fit.r2 },
        options: { showMarkers: true, showBand: false } as never,
      })
    );
  }

  charts.push(
    makeChart({
      id: 'mars-residuals',
      kind: 'residual',
      title: copy('Residui — {s1}', { s1: depName }),
      subtitle: copy('Risposta osservata meno valore stimato · N = {s1}', { s1: fit.n }),
      note: copy('Una nuvola senza struttura attorno allo zero è coerente con il modello; pattern sistematici indicano che le cerniere selezionate non descrivono bene i dati.'),
      data: {
        points: fit.fitted.map((value, index) => ({ x: value, y: fit.residuals[index] })),
        rules: [{ y: 0 }],
      },
      fields: { xLabel: copy('Valori stimati'), yLabel: copy('Residui'), series: copy('Serie') },
      stats: { n: fit.n, rss: fit.rss },
      options: { showPoints: true, showZeroLine: true } as never,
    })
  );

  return {
    ok: true,
    title: copy('GAM / MARS — {s1}', { s1: depName }),
    header: copy('{s1} su {s2} · grado {s3} · {s4} termini', {
      s1: depName,
      s2: predictorNames.join(', '),
      s3: degree,
      s4: fit.selectedTerms,
    }),
    tables,
    report: marsReport(tables, { dep: depName, predictors: predictorNames }, ciLevel),
    charts,
  };
};
