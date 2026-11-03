import { fitHeckman, fitTobit } from '../../stats/kernels/tobit';
import { heckmanTables, tobitTables } from '../../stats/tables/tobit';
import { selectionReport } from '../../stats/reports/tobit';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import { fmtEst } from '../../stats/format';
import type { Dataset } from '../../grid/types';
import type { SelectionParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { AnalysisRunResult } from '../types';

export interface SelectionInput {
  grid: Dataset;
  params: SelectionParams;
  ciLevel: number;
}

/**
 * Tobit type-I or Heckman two-step output.
 *
 * The builder validates the column roles and the complete rows, calls the
 * kernel for the requested mode and packages tables, the written report and
 * two charts. Tobit draws the latent and the observed mean against the
 * censoring limit; Heckman draws observed vs fitted and the inverse-Mills
 * distribution on the selected sample.
 */
export const buildSelectionOutput = ({
  grid,
  params,
  ciLevel,
}: SelectionInput): AnalysisRunResult => {
  const { mode, dep, indeps, lower, upper, selection, selectIndeps } = params;
  const width = grid.cols.length;
  const validIndex = (index: number): boolean =>
    Number.isInteger(index) && index >= 0 && index < width;

  if (mode !== 'tobit' && mode !== 'heckman') {
    return { ok: false, reason: 'Select a valid selection model (Tobit or Heckman)' };
  }
  if (!validIndex(dep)) return { ok: false, reason: 'Select a dependent variable' };
  if (indeps.length === 0) return { ok: false, reason: 'Select at least one predictor' };
  if (indeps.some(index => !validIndex(index))) {
    return { ok: false, reason: 'Select valid predictors' };
  }
  if (indeps.includes(dep)) {
    return { ok: false, reason: 'The dependent variable cannot also be a predictor' };
  }

  const depName = grid.cols[dep]?.name ?? 'Y';
  const predictorNames = indeps.map(
    (index, position) => grid.cols[index]?.name ?? `X${position + 1}`
  );

  if (mode === 'tobit') {
    if (!Number.isFinite(lower)) {
      return { ok: false, reason: 'The lower censoring limit must be a finite number' };
    }
    if (upper !== null && (!Number.isFinite(upper) || lower >= upper)) {
      return { ok: false, reason: 'The upper limit must be finite and greater than the lower limit' };
    }

    const complete = grid.rows
      .map((row, index) => ({ row, index }))
      .filter(entry => {
        if (!Number.isFinite(parseNum(entry.row[dep]))) return false;
        return indeps.every(index => Number.isFinite(parseNum(entry.row[index])));
      });

    if (complete.length <= indeps.length + 1) {
      return {
        ok: false,
        reason: 'Not enough complete rows for the Tobit model',
      };
    }

    const y = complete.map(entry => parseNum(entry.row[dep]));
    const x = complete.map(entry => indeps.map(index => parseNum(entry.row[index])));
    const fit = fitTobit({ y, x, lower, upper, level: ciLevel });
    if (!fit) {
      return {
        ok: false,
        reason:
          'The Tobit model could not be estimated: check censoring at the chosen limit, collinearity and the column scales',
      };
    }

    const tables = tobitTables(fit, { dep: depName, predictors: predictorNames, lower, upper }, ciLevel);
    const upperLabel = upper === null ? copy('nessuno') : fmtEst(upper, 2);

    const observedVsFitted: AnalysisChart = makeChart({
      id: 'tobit-observed-fitted',
      kind: 'scatter',
      title: copy('Valori osservati e medi stimati'),
      subtitle: copy('{s1} · limite {s2} · N = {s3}', {
        s1: depName,
        s2: upper === null ? fmtEst(lower, 2) : `${fmtEst(lower, 2)} – ${upperLabel}`,
        s3: fit.n,
      }),
      note: copy('Ogni punto confronta la risposta osservata con la media condizionata al lato della censura: le righe al limite formano una banda piatta.'),
      data: {
        points: complete.map((entry, index) => ({
          x: fit.fittedObserved[index],
          y: y[index],
          __row: String(entry.index),
        })),
      },
      fields: { xLabel: copy('Media osservata stimata'), yLabel: depName },
      stats: { n: fit.n, sigma: fit.sigma, censored: fit.nLower + fit.nUpper },
      options: { showPoints: true, showBand: false } as never,
    });

    const censoredSeries = copy('Censurate');
    const uncensoredSeries = copy('Non censurate');
    const latentVsObserved: AnalysisChart = makeChart({
      id: 'tobit-latent-observed',
      kind: 'scatter',
      title: copy('Media latente e media osservata'),
      subtitle: copy('{s1} · {s2} censurate su {s3}', {
        s1: depName,
        s2: fit.nLower + fit.nUpper,
        s3: fit.n,
      }),
      note: copy('La linea orizzontale è il limite di censura: le righe censurate hanno una media latente oltre il limite ma una media osservata ferma al limite.'),
      data: {
        points: complete.map((entry, index) => {
          const censored =
            (upper === null ? false : y[index] >= upper) || y[index] <= lower;
          return {
            x: fit.fitted[index],
            y: fit.fittedObserved[index],
            series: censored ? censoredSeries : uncensoredSeries,
            __row: String(entry.index),
          };
        }),
        rules: upper === null ? [{ y: lower }] : [{ y: lower }, { y: upper }],
      },
      fields: {
        xLabel: copy('Media latente'),
        yLabel: copy('Media osservata'),
        series: copy('Tipo'),
      },
      stats: { lower, upper },
      options: { showPoints: true, showBand: false, showLegend: true } as never,
    });

    return {
      ok: true,
      title: copy('Regressione Tobit — {s1}', { s1: depName }),
      header: copy('Censura a {s1} · {s2} osservazioni · {s3} predittori', {
        s1: upper === null ? fmtEst(lower, 2) : `${fmtEst(lower, 2)} – ${upperLabel}`,
        s2: fit.n,
        s3: indeps.length,
      }),
      tables,
      report: selectionReport(tables, 'tobit', ciLevel),
      charts: [observedVsFitted, latentVsObserved],
    };
  }

  // --- Heckman -----------------------------------------------------------
  if (!validIndex(selection)) {
    return { ok: false, reason: 'Select a valid 0/1 selection indicator' };
  }
  if (selectIndeps.length === 0) {
    return { ok: false, reason: 'Select at least one selection predictor' };
  }
  if (selectIndeps.some(index => !validIndex(index))) {
    return { ok: false, reason: 'Select valid selection predictors' };
  }
  if (selection === dep || indeps.includes(selection)) {
    return {
      ok: false,
      reason: 'The selection indicator must be a separate 0/1 column, not a predictor',
    };
  }
  if (selectIndeps.includes(dep) || selectIndeps.includes(selection)) {
    return {
      ok: false,
      reason: 'Selection predictors must be different from the outcome and the indicator',
    };
  }

  // A value other than 0/1 in the indicator column is a modelling error, not
  // a missing row: filtering it silently would change the selected sample.
  if (
    grid.rows.some(row => {
      const value = parseNum(row[selection]);
      return Number.isFinite(value) && value !== 0 && value !== 1;
    })
  ) {
    return { ok: false, reason: 'The selection indicator must contain only 0 and 1' };
  }

  const selectionName = grid.cols[selection]?.name ?? 'Selected';
  const selectionPredictorNames = selectIndeps.map(
    (index, position) => grid.cols[index]?.name ?? `Z${position + 1}`
  );
  const warnings: string[] = [];
  if (!selectIndeps.some(index => !indeps.includes(index))) {
    warnings.push(
      copy('Nessun predittore della selezione è escluso dall’equazione dell’esito: l’identificazione poggia solo sulla forma funzionale del probit.')
    );
  }

  const usable = grid.rows
    .map((row, index) => ({ row, index }))
    .filter(entry => {
      const indicator = parseNum(entry.row[selection]);
      if (indicator !== 0 && indicator !== 1) return false;
      if (!indeps.every(index => Number.isFinite(parseNum(entry.row[index])))) return false;
      if (!selectIndeps.every(index => Number.isFinite(parseNum(entry.row[index])))) return false;
      if (indicator === 1 && !Number.isFinite(parseNum(entry.row[dep]))) return false;
      return true;
    });

  if (usable.length === 0) {
    return { ok: false, reason: 'No usable rows: check the selection indicator and the predictors' };
  }

  const selected = usable.map(entry => parseNum(entry.row[selection]));
  // The outcome is only used on selected rows: fill the rest with 0 so the
  // array stays finite, the kernel ignores those positions.
  const y = usable.map((entry, index) =>
    selected[index] === 1 ? parseNum(entry.row[dep]) : 0
  );
  const x = usable.map(entry => indeps.map(index => parseNum(entry.row[index])));
  const z = usable.map(entry => selectIndeps.map(index => parseNum(entry.row[index])));

  const fit = fitHeckman({ y, x, selected, z, level: ciLevel });
  if (!fit) {
    return {
      ok: false,
      reason:
        'The Heckman model could not be estimated: check that the indicator has both groups, that the probit design is not collinear and that enough rows are selected',
    };
  }

  const tables = heckmanTables(
    fit,
    {
      dep: depName,
      predictors: predictorNames,
      selectionDep: selectionName,
      selectionPredictors: selectionPredictorNames,
    },
    ciLevel
  );

  const selectedIndices = usable
    .map((_, index) => index)
    .filter(index => selected[index] === 1);
  const observedVsFitted: AnalysisChart = makeChart({
    id: 'heckman-observed-fitted',
    kind: 'scatter',
    title: copy('Valori osservati e stimati (campione selezionato)'),
    subtitle: copy('{s1} · {s2} righe selezionate', { s1: depName, s2: fit.nSelected }),
    note: copy('Il confronto usa solo le righe selezionate, dove l’esito è osservato; la retta di riferimento è la bisettrice.'),
    data: {
      points: selectedIndices.map(index => ({
        x: fit.fitted[index],
        y: parseNum(usable[index].row[dep]),
        __row: String(usable[index].index),
      })),
    },
    fields: { xLabel: copy('Valore stimato'), yLabel: depName },
    stats: { n: fit.nSelected, lambda: fit.lambda, rho: fit.rho },
    options: { showPoints: true, showBand: false } as never,
  });

  const imrValues = fit.imr.filter((_, index) => selected[index] === 1);
  const imrChart: AnalysisChart = makeChart({
    id: 'heckman-imr',
    kind: 'histogram',
    title: copy('Distribuzione dell’inverse Mills ratio'),
    subtitle: copy('Campione selezionato · {s1} righe', {
      s1: fit.nSelected,
    }),
    note: copy('L’inverse Mills ratio misura quanto la selezione pesa su ogni riga: valori elevati indicano righe con probabilità di selezione bassa ma comunque osservate.'),
    data: { values: imrValues.map(value => ({ value })) },
    fields: { xLabel: copy('Inverse Mills ratio'), yLabel: copy('Frequenza') },
    stats: { n: fit.nSelected, lambda: fit.lambda },
    options: { bins: 18 } as never,
  });

  return {
    ok: true,
    title: copy('Selezione campionaria (Heckman) — {s1}', { s1: depName }),
    header: copy('{s1} su {s2} · selezione {s3} · {s4} selezionate su {s5}', {
      s1: depName,
      s2: predictorNames.join(', '),
      s3: selectionName,
      s4: fit.nSelected,
      s5: fit.n,
    }),
    tables,
    report: selectionReport(tables, 'heckman', ciLevel),
    charts: [observedVsFitted, imrChart],
    ...(warnings.length > 0 ? { warnings } : {}),
  };
};
