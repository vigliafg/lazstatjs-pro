import { parseNum } from '../../stats/core';
import { fitPropensity } from '../../stats/kernels/propensity';
import { propensityTables } from '../../stats/tables/propensity';
import { propensityReport } from '../../stats/reports/propensity';
import { copy } from '../../stats/reportCopy';
import { makeChart } from '../../charts/kits/common';
import type { Dataset } from '../../grid/types';
import type { PropensityParams } from '../../io/project';
import type { AnalysisChart } from '../../stats/charts';
import type { AnalysisRunResult } from '../types';

export interface PropensityInput {
  grid: Dataset;
  params: PropensityParams;
  ciLevel: number;
}

/**
 * Propensity-score matching or IPW.
 *
 * The builder validates the roles, keeps complete rows, calls the kernel and
 * packages the model, balance, ATT and sample tables with a love plot, the two
 * propensity-score distributions and the ATT interval.
 */
export const buildPropensityOutput = ({
  grid,
  params,
  ciLevel,
}: PropensityInput): AnalysisRunResult => {
  const { treatment, outcome, covariates, method, caliper, ratio } = params;
  const width = grid.cols.length;

  const indexes = [treatment, outcome, ...covariates];
  if (
    indexes.some(index => !Number.isInteger(index) || index < 0 || index >= width)
  ) {
    return { ok: false, reason: 'Select valid treatment, outcome and covariate columns' };
  }
  if (treatment === outcome) {
    return { ok: false, reason: 'Treatment and outcome must be different columns' };
  }
  if (covariates.includes(treatment) || covariates.includes(outcome)) {
    return {
      ok: false,
      reason: 'Covariates cannot also be the treatment or the outcome',
    };
  }
  if (new Set(covariates).size !== covariates.length) {
    return { ok: false, reason: 'The same covariate cannot be selected twice' };
  }
  if (covariates.length === 0) {
    return { ok: false, reason: 'Select at least one covariate' };
  }
  if (!Number.isFinite(caliper) || caliper < 0) {
    return { ok: false, reason: 'The caliper must be a non-negative number' };
  }
  if (!Number.isInteger(ratio) || ratio < 1 || ratio > 10) {
    return { ok: false, reason: 'The matching ratio must be an integer between 1 and 10' };
  }

  const needed = [treatment, outcome, ...covariates];
  const complete = grid.rows
    .map(row => needed.map(index => parseNum(row[index])))
    .filter(values => values.every(value => Number.isFinite(value)));
  if (complete.length < covariates.length + 3) {
    return {
      ok: false,
      reason: `Not enough complete rows: the propensity model needs at least ${covariates.length + 3} observations`,
    };
  }

  const treatmentValues = complete.map(values => values[0]);
  if (treatmentValues.some(value => value !== 0 && value !== 1)) {
    return { ok: false, reason: 'The treatment indicator must contain only 0 and 1' };
  }
  const nTreated = treatmentValues.filter(value => value === 1).length;
  const nControl = treatmentValues.filter(value => value === 0).length;
  if (nTreated < 2 || nControl < 2) {
    return {
      ok: false,
      reason: 'The treatment indicator needs at least two treated and two control observations',
    };
  }

  const result = fitPropensity({
    treatment: treatmentValues,
    outcome: complete.map(values => values[1]),
    covariates: complete.map(values => values.slice(2)),
    method,
    caliper,
    ratio,
    level: ciLevel,
    names: covariates.map((index, position) => grid.cols[index]?.name ?? `X${position + 1}`),
  });
  if (!result) {
    return {
      ok: false,
      reason:
        'The propensity model could not be estimated: check for constant or collinear covariates, an empty group, an empty caliper or too few rows',
    };
  }

  const treatmentName = grid.cols[treatment]?.name ?? 'Treatment';
  const outcomeName = grid.cols[outcome]?.name ?? 'Outcome';
  const names = { treatment: treatmentName, outcome: outcomeName };
  const tables = propensityTables(result, names, ciLevel);

  const lovePoints = result.balance.flatMap(row => [
    {
      category: copy('{s1} · prima', { s1: row.covariate }),
      value: row.smdBefore,
      series: copy('Prima'),
    },
    {
      category: copy('{s1} · dopo', { s1: row.covariate }),
      value: row.smdAfter,
      series: copy('Dopo'),
    },
  ]);

  const treatedScores = result.ps.fitted.filter((_, index) => treatmentValues[index] === 1);
  const controlScores = result.ps.fitted.filter((_, index) => treatmentValues[index] === 0);

  const charts: AnalysisChart[] = [
    makeChart({
      id: 'propensity-love',
      kind: 'dot',
      title: copy('Love plot del bilanciamento'),
      subtitle: copy('Differenza standardizzata prima e dopo · {s1}', {
        s1: method === 'nearest' ? copy('matching') : 'IPW',
      }),
      note: copy('I valori sono differenze standardizzate prima e dopo l’aggiustamento. Valori vicini a zero indicano gruppi bilanciati; la soglia convenzionale di 0.1 è riportata nella tabella di bilanciamento.'),
      data: { points: lovePoints },
      fields: { xLabel: copy('Covariabile'), yLabel: copy('SMD') },
      stats: { maxSmdAfter: Math.max(...result.balance.map(row => Math.abs(row.smdAfter))) },
      options: { jitter: 'none', sort: 'none', showMean: false } as never,
    }),
    makeChart({
      id: 'propensity-score-treated',
      kind: 'histogram',
      title: copy('Punteggi di propensione — trattati'),
      subtitle: copy('{s1} osservazioni · {s2}', {
        s1: nTreated,
        s2: method === 'nearest' ? copy('matching') : 'IPW',
      }),
      note: copy('Confronta questa distribuzione con quella dei controlli: la sovrapposizione è la regione in cui il confronto è supportato dai dati.'),
      data: { values: treatedScores.map(value => ({ value })) },
      fields: { xLabel: copy('Punteggio di propensione'), yLabel: copy('Frequenza') },
      options: { bins: 20, showDensity: true } as never,
    }),
    makeChart({
      id: 'propensity-score-control',
      kind: 'histogram',
      title: copy('Punteggi di propensione — controlli'),
      subtitle: copy('{s1} osservazioni · {s2}', {
        s1: nControl,
        s2: method === 'nearest' ? copy('matching') : 'IPW',
      }),
      note: copy('La sovrapposizione con i trattati delimita il supporto comune; code separate indicano regioni senza confronto diretto.'),
      data: { values: controlScores.map(value => ({ value })) },
      fields: { xLabel: copy('Punteggio di propensione'), yLabel: copy('Frequenza') },
      options: { bins: 20, showDensity: true } as never,
    }),
    makeChart({
      id: 'propensity-att',
      kind: 'interval',
      title: copy('Effetto medio sul trattato'),
      subtitle: copy('CI {s1}% · {s2}', {
        s1: ciLevel,
        s2: method === 'nearest' ? copy('matching') : 'IPW',
      }),
      note: copy('Il punto è l’ATT; il segmento è il suo intervallo di confidenza. La linea tratteggiata è lo zero.'),
      data: {
        intervals: [
          {
            category: copy('ATT ({s1})', { s1: outcomeName }),
            estimate: result.att.estimate,
            lo: result.att.lo,
            hi: result.att.hi,
          },
        ],
        rules: [{ value: 0 }],
      },
      fields: { xLabel: copy('Stima'), yLabel: outcomeName },
      stats: { estimate: result.att.estimate, p: result.att.p },
      options: { valueLabels: true } as never,
    }),
  ];

  return {
    ok: true,
    title: copy('Propensity score — {s1}', { s1: outcomeName }),
    header: copy('{s1} su {s2} · {s3} · {s4} trattati · {s5} controlli', {
      s1: treatmentName,
      s2: outcomeName,
      s3: method === 'nearest' ? copy('matching 1:{s1}', { s1: ratio }) : 'IPW',
      s4: result.matchedTreated,
      s5: result.nControl,
    }),
    tables,
    report: propensityReport(tables, ciLevel, treatmentName, outcomeName),
    charts,
  };
};
