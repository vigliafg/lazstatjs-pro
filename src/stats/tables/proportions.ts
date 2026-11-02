import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type {
  OneProportionResult,
  TwoProportionsResult,
} from '../kernels/proportions';
import type { PoissonRateResult, TwoPoissonResult } from '../kernels/poissonTests';

export const oneProportionTables = (
  result: OneProportionResult,
  variableName: string,
  successLevel: string
): TableSpec[] => [
  {
    id: 'prop-one',
    title: copy('Proporzione (un campione)'),
    subtitle: copy('{s1} = “{s2}”', { s1: variableName, s2: successLevel }),
    columns: [
      { key: 'successes', label: copy('Successes'), format: 'int' },
      { key: 'trials', label: copy('Trials'), format: 'int' },
      { key: 'estimate', label: copy('Proportion'), format: 'dec4' },
      { key: 'nullValue', label: copy('Null proportion'), format: 'dec4' },
      { key: 'exactP', label: copy('Exact p'), format: 'p' },
      { key: 'asymptoticP', label: copy('Asymptotic p'), format: 'p' },
      { key: 'wilsonLo', label: copy('CI low'), format: 'dec4' },
      { key: 'wilsonHi', label: copy('CI high'), format: 'dec4' },
      { key: 'clopperLo', label: copy('Exact CI low'), format: 'dec4' },
      { key: 'clopperHi', label: copy('Exact CI high'), format: 'dec4' },
    ],
    rows: [
      {
        successes: result.successes,
        trials: result.trials,
        estimate: result.estimate,
        nullValue: result.nullValue,
        exactP: result.exactP,
        asymptoticP: result.asymptoticP,
        wilsonLo: result.interval.wilsonLo,
        wilsonHi: result.interval.wilsonHi,
        clopperLo: result.interval.clopperLo,
        clopperHi: result.interval.clopperHi,
      },
    ],
    notes: [
      copy('p esatto da binom.test; intervallo di Wilson e intervallo esatto di Clopper–Pearson al {s1}%.', {
        s1: result.level,
      }),
      copy('L’approssimazione normale è affidabile quando successes e insuccessi sono entrambi almeno 5.'),
    ],
  },
];

export const twoProportionsTables = (
  result: TwoProportionsResult,
  variableName: string,
  groupName: string
): TableSpec[] => [
  {
    id: 'prop-two',
    title: copy('Proporzioni (due campioni)'),
    subtitle: copy('{s1} per {s2}', { s1: variableName, s2: groupName }),
    columns: [
      { key: 'group', label: groupName, format: 'text' },
      { key: 'successes', label: copy('Successes'), format: 'int' },
      { key: 'trials', label: copy('Trials'), format: 'int' },
      { key: 'estimate', label: copy('Proportion'), format: 'dec4' },
    ],
    rows: [
      { group: copy('First group'), ...result.first },
      { group: copy('Second group'), ...result.second },
    ],
  },
  {
    id: 'prop-diff',
    title: copy('Differenza tra proporzioni'),
    columns: [
      { key: 'difference', label: copy('Difference'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'lo', label: copy('CI low'), format: 'dec4' },
      { key: 'hi', label: copy('CI high'), format: 'dec4' },
      { key: 'chi2', label: copy('Chi-square'), format: 'dec3' },
      { key: 'p', label: copy('p-value'), format: 'p' },
      { key: 'rr', label: copy('Risk ratio'), format: 'dec4' },
      { key: 'or', label: copy('Odds ratio'), format: 'dec4' },
    ],
    rows: [
      {
        difference: result.difference,
        se: result.standardError,
        lo: result.lo,
        hi: result.hi,
        chi2: result.chi2,
        p: result.pValue,
        rr: result.riskRatio,
        or: result.oddsRatio,
      },
    ],
    notes: [
      copy('Test z con varianza pooled (equivalente al χ² di Pearson senza correzione) e intervallo di Wald per la differenza.'),
      copy('Il rischio relativo è p₁/p₂; l’odds ratio è (x₁/(n₁−x₁))/(x₂/(n₂−x₂)).'),
    ],
  },
];

export const oneRateTables = (
  result: PoissonRateResult,
  variableName: string
): TableSpec[] => [
  {
    id: 'rate-one',
    title: copy('Tasso di Poisson (un campione)'),
    subtitle: variableName,
    columns: [
      { key: 'events', label: copy('Events'), format: 'int' },
      { key: 'exposure', label: copy('Exposure'), format: 'dec3' },
      { key: 'rate', label: copy('Rate'), format: 'dec4' },
      { key: 'nullRate', label: copy('Null rate'), format: 'dec4' },
      { key: 'exactP', label: copy('Exact p'), format: 'p' },
      { key: 'lo', label: copy('CI low'), format: 'dec4' },
      { key: 'hi', label: copy('CI high'), format: 'dec4' },
    ],
    rows: [
      {
        events: result.events,
        exposure: result.exposure,
        rate: result.rate,
        nullRate: result.nullRate,
        exactP: result.exactP,
        lo: result.lo,
        hi: result.hi,
      },
    ],
    notes: [
      copy('p esatto dalle code di Poisson; intervallo esatto basato sulla χ² (Garwood), come poisson.test.'),
    ],
  },
];

export const twoRateTables = (
  result: TwoPoissonResult,
  variableName: string,
  groupName: string
): TableSpec[] => [
  {
    id: 'rate-two',
    title: copy('Tassi di Poisson (due campioni)'),
    subtitle: copy('{s1} per {s2}', { s1: variableName, s2: groupName }),
    columns: [
      { key: 'group', label: groupName, format: 'text' },
      { key: 'events', label: copy('Events'), format: 'int' },
      { key: 'exposure', label: copy('Exposure'), format: 'dec3' },
      { key: 'rate', label: copy('Rate'), format: 'dec4' },
    ],
    rows: [
      { group: copy('First group'), ...result.first },
      { group: copy('Second group'), ...result.second },
    ],
  },
  {
    id: 'rate-ratio',
    title: copy('Rapporto tra tassi'),
    columns: [
      { key: 'ratio', label: copy('Rate ratio'), format: 'dec4' },
      { key: 'lo', label: copy('CI low'), format: 'dec4' },
      { key: 'hi', label: copy('CI high'), format: 'dec4' },
      { key: 'p', label: copy('p-value'), format: 'p' },
    ],
    rows: [{ ratio: result.ratio, lo: result.lo, hi: result.hi, p: result.exactP }],
    notes: [
      copy('Test condizionale esatto sul totale degli eventi; intervallo ottenuto trasformando l’intervallo esatto di Clopper–Pearson.'),
    ],
  },
];
