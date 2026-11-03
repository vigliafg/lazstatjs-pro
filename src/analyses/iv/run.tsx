import { parseNum } from '../../stats/core';
import { fitIv } from '../../stats/kernels/iv';
import { ivTables } from '../../stats/tables/iv';
import { ivReport } from '../../stats/reports/iv';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { Dataset } from '../../grid/types';
import type { IvParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { AnalysisRunResult } from '../types';

/**
 * Build the output of an instrumental-variable run.
 *
 * Validation is explicit and happens before the kernel: disjoint column roles,
 * complete rows and enough observations for the structural parameters. The
 * kernel then rejects collinearity or an unsuitable design.
 */
export const buildIvOutput = ({
  grid,
  params,
  ciLevel,
}: {
  grid: Dataset;
  params: IvParams;
  ciLevel: number;
}): AnalysisRunResult => {
  const { dep, endog, instruments, exog, robust } = params;
  const width = grid.cols.length;
  const validIndex = (index: number): boolean => Number.isInteger(index) && index >= 0 && index < width;

  if (!validIndex(dep)) return { ok: false, reason: 'Select a dependent variable' };
  if (endog.length === 0) return { ok: false, reason: 'Select at least one endogenous regressor' };
  if (instruments.length === 0) {
    return { ok: false, reason: 'Select at least one excluded instrument' };
  }
  if (instruments.length < endog.length) {
    return {
      ok: false,
      reason: 'At least as many instruments as endogenous regressors are required',
    };
  }
  const used = [dep, ...endog, ...instruments, ...exog];
  if (used.some(index => !validIndex(index))) {
    return { ok: false, reason: 'Select valid numeric columns for every role' };
  }
  if (new Set(used).size !== used.length) {
    return {
      ok: false,
      reason:
        'The dependent variable, endogenous regressors, instruments and exogenous regressors must be different columns',
    };
  }

  const rows = grid.rows.filter(row => used.every(index => Number.isFinite(parseNum(row[index]))));
  const parameterCount = 1 + endog.length + exog.length;
  if (rows.length <= parameterCount) {
    return { ok: false, reason: 'Insufficient complete rows for the 2SLS model' };
  }

  const y = rows.map(row => parseNum(row[dep]));
  const matrixOf = (indexes: number[]): number[][] =>
    rows.map(row => indexes.map(index => parseNum(row[index])));

  const fit = fitIv({
    y,
    endog: matrixOf(endog),
    instruments: matrixOf(instruments),
    exog: exog.length > 0 ? matrixOf(exog) : undefined,
    robust,
    level: ciLevel,
  });
  if (!fit) {
    return {
      ok: false,
      reason:
        'The model could not be estimated: check collinearity, the instrument count and the column scales',
    };
  }

  const depName = grid.cols[dep]?.name ?? 'Y';
  const names = {
    dep: depName,
    endog: endog.map((index, position) => grid.cols[index]?.name ?? `X${position + 1}`),
    instruments: instruments.map((index, position) => grid.cols[index]?.name ?? `Z${position + 1}`),
    exog: exog.map((index, position) => grid.cols[index]?.name ?? `W${position + 1}`),
  };

  const tables = ivTables(fit, names, ciLevel);
  const estimation = robust ? copy('2SLS · SE HC1') : copy('2SLS · SE omoschedastici');
  const firstStage = rows.flatMap(row =>
    instruments.map((instrument, position) => ({
      x: parseNum(row[instrument]),
      y: parseNum(row[endog[0]]),
      series: names.instruments[position],
    }))
  );

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'iv-observed-fitted',
      kind: 'scatter',
      title: copy('Valori osservati e stimati'),
      subtitle: copy('{s1} · N = {s2}', { s1: estimation, s2: fit.n }),
      note: copy('La nuvola confronta la risposta osservata con il valore stimato dall’equazione strutturale.'),
      data: {
        series: y.map((value, index) => ({
          x: fit.fitted[index],
          y: value,
          series: copy('Osservazioni'),
        })),
      },
      fields: { xLabel: copy('Valore stimato'), yLabel: depName, series: copy('Serie') },
      options: { showMarkers: true, showBand: false } as never,
    }),
    makeChart({
      id: 'iv-residuals',
      kind: 'residual',
      title: copy('Residui'),
      subtitle: copy('Risposta meno valore stimato · N = {s1}', { s1: fit.n }),
      note: copy('Pattern sistematici nei residui suggeriscono una specificazione lineare inadeguata o strumenti non validi.'),
      data: {
        series: fit.fitted.map((value, index) => ({
          x: value,
          y: fit.residuals[index],
          series: copy('Residui'),
        })),
        rules: [{ y: 0 }],
      },
      fields: { xLabel: copy('Valore stimato'), yLabel: copy('Residuo'), series: copy('Serie') },
      options: { showMarkers: true, showBand: false } as never,
    }),
    makeChart({
      id: 'iv-first-stage',
      kind: 'scatter',
      title: copy('Primo stadio: strumenti e variabile endogena'),
      subtitle: copy('Una serie per strumento · {s1} osservazioni', { s1: fit.n }),
      note: copy(
        'Ogni punto è un’osservazione: se la nuvola di uno strumento è piatta, lo strumento è debole e la stima 2SLS diventa instabile.'
      ),
      data: { series: firstStage },
      fields: {
        xLabel: instruments.length === 1 ? names.instruments[0] : copy('Strumento'),
        yLabel: names.endog[0],
        series: copy('Strumento'),
      },
      options: { showMarkers: true, showBand: false } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Variabili strumentali — {s1}', { s1: depName }),
    header: copy('{s1} su {s2} · {s3}', {
      s1: depName,
      s2: names.endog.join(', '),
      s3: estimation,
    }),
    tables,
    report: ivReport(tables, depName, robust, ciLevel),
    charts,
  };
};
