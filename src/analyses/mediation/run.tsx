import { fitMediation } from '../../stats/kernels/mediation';
import { mediationTables } from '../../stats/tables/mediation';
import { mediationReport } from '../../stats/reports/mediation';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import { parseNum } from '../../stats/core';
import type { Dataset } from '../../grid/types';
import type { MediationParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { AnalysisRunResult } from '../types';

export interface MediationInput {
  grid: Dataset;
  params: MediationParams;
  ciLevel: number;
}

const MAX_BOOTSTRAP = 5000;

/**
 * Mediazione di Baron–Kenny con effetti indiretto, diretto e totale.
 *
 * Il builder valida i ruoli, costruisce le colonne complete, chiama il kernel
 * e impacchetta tabelle, report e due grafici: un forest degli effetti con i
 * loro intervalli e l'istogramma bootstrap dell'effetto indiretto.
 */
export const buildMediationOutput = ({
  grid,
  params,
  ciLevel,
}: MediationInput): AnalysisRunResult => {
  const { outcome, predictor, mediator, covariates, bootstrap, seed } = params;
  const width = grid.cols.length;

  const indexes = [outcome, predictor, mediator];
  if (indexes.some(index => !Number.isInteger(index) || index < 0 || index >= width)) {
    return {
      ok: false,
      reason: 'Select valid outcome, predictor and mediator columns',
    };
  }
  if (new Set(indexes).size !== indexes.length) {
    return {
      ok: false,
      reason: 'Outcome, predictor and mediator must be different columns',
    };
  }
  if (
    covariates.some(
      index => !Number.isInteger(index) || index < 0 || index >= width
    )
  ) {
    return { ok: false, reason: 'Select valid covariates' };
  }
  if (new Set(covariates).size !== covariates.length) {
    return { ok: false, reason: 'The same covariate cannot be selected twice' };
  }
  if (covariates.some(index => indexes.includes(index))) {
    return {
      ok: false,
      reason: 'Covariates cannot also be the outcome, predictor or mediator',
    };
  }
  if (!Number.isInteger(bootstrap) || bootstrap < 1 || bootstrap > MAX_BOOTSTRAP) {
    return {
      ok: false,
      reason: `Bootstrap replications must be an integer between 1 and ${MAX_BOOTSTRAP}`,
    };
  }
  if (!Number.isInteger(seed)) {
    return { ok: false, reason: 'The bootstrap seed must be an integer' };
  }

  const needed = [outcome, predictor, mediator, ...covariates];
  const complete = grid.rows
    .map((row, index) => ({ row, index }))
    .filter(entry => needed.every(index => Number.isFinite(parseNum(entry.row[index]))));

  // The outcome equation is the largest one: intercept, X, M and covariates.
  const parameters = 3 + covariates.length;
  if (complete.length < parameters + 2) {
    return {
      ok: false,
      reason: `Not enough complete rows: the mediation model needs at least ${parameters + 2} observations`,
    };
  }

  const outcomeValues = complete.map(entry => parseNum(entry.row[outcome]));
  const predictorValues = complete.map(entry => parseNum(entry.row[predictor]));
  const mediatorValues = complete.map(entry => parseNum(entry.row[mediator]));
  const covariateValues = covariates.map(index =>
    complete.map(entry => parseNum(entry.row[index]))
  );

  const result = fitMediation({
    outcome: outcomeValues,
    predictor: predictorValues,
    mediator: mediatorValues,
    covariates: covariateValues,
    bootstrap,
    seed,
    level: ciLevel,
  });
  if (!result) {
    return {
      ok: false,
      reason:
        'The mediation model could not be estimated: check for constant columns, collinearity or non-finite values',
    };
  }

  const outcomeName = grid.cols[outcome]?.name ?? 'Y';
  const predictorName = grid.cols[predictor]?.name ?? 'X';
  const mediatorName = grid.cols[mediator]?.name ?? 'M';
  const names = { outcome: outcomeName, predictor: predictorName, mediator: mediatorName };
  const tables = mediationTables(result, names, ciLevel);
  const report = mediationReport(tables, ciLevel);

  const forestPoints = [
    {
      label: copy('Indiretto (a·b)'),
      estimate: result.effects.indirect.estimate,
      lo: result.effects.indirect.lo,
      hi: result.effects.indirect.hi,
    },
    {
      label: copy('Diretto (c′)'),
      estimate: result.effects.direct.estimate,
      lo: result.effects.direct.lo,
      hi: result.effects.direct.hi,
    },
    {
      label: copy('Totale (c)'),
      estimate: result.effects.total.estimate,
      lo: result.effects.total.lo,
      hi: result.effects.total.hi,
    },
  ];

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'mediation-effects-forest',
      kind: 'forest',
      title: copy('Effetti della mediazione'),
      subtitle: copy('CI {s1}% · riferimento 0', { s1: ciLevel }),
      note: copy('Punto: stima dell’effetto. Segmento: intervallo di confidenza. Un intervallo che non contiene zero è compatibile con un effetto non nullo; l’indiretto usa l’errore standard di Sobel.'),
      data: { points: forestPoints },
      fields: { xLabel: copy('Effetto'), yLabel: copy('Componente') },
      stats: {
        indirect: result.effects.indirect.estimate,
        direct: result.effects.direct.estimate,
        total: result.effects.total.estimate,
        n: result.n,
      },
      options: { reference: 'zero' } as never,
    }),
  ];

  if (result.bootstrap) {
    charts.push(
      makeChart({
        id: 'mediation-bootstrap',
        kind: 'bootstrap',
        title: copy('Bootstrap dell’effetto indiretto'),
        subtitle: copy('{s1} replicazioni · seme {s2} · IC {s3}%', {
          s1: result.bootstrap.reps,
          s2: result.bootstrap.seed,
          s3: ciLevel,
        }),
        note: copy('Le linee tratteggiate sono i limiti dell’intervallo percentile; la linea continua è l’effetto indiretto osservato.'),
        data: {
          values: result.bootstrap.samples.map(value => ({ value })),
          observed: [{ value: result.effects.indirect.estimate }],
          ci: [
            { value: result.bootstrap.ciLo },
            { value: result.bootstrap.ciHi },
          ],
        },
        fields: { xLabel: copy('Effetto indiretto'), yLabel: copy('Frequenza') },
        stats: {
          reps: result.bootstrap.reps,
          seed: result.bootstrap.seed,
          ciLo: result.bootstrap.ciLo,
          ciHi: result.bootstrap.ciHi,
        },
        options: { showObserved: true, showCI: true, showDensity: true } as never,
      })
    );
  }

  return {
    ok: true,
    title: copy('Mediazione — {s1}', { s1: outcomeName }),
    header: copy('{s1} → {s2} → {s3} · {s4} osservazioni · bootstrap {s5}', {
      s1: predictorName,
      s2: mediatorName,
      s3: outcomeName,
      s4: result.n,
      s5: result.bootstrap ? result.bootstrap.reps : 0,
    }),
    tables,
    report,
    charts,
  };
};
