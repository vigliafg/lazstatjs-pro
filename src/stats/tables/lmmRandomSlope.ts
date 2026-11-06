import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { GlmmResult } from '../kernels/glmm';

export interface LmmRandomSlopeNames {
  dep: string;
  predictors: string[];
  group: string;
  slope: string;
}

/** Tables for the random-slope variant of the linear mixed model. */
export const lmmRandomSlopeTables = (
  fit: GlmmResult,
  names: LmmRandomSlopeNames,
  level: number
): TableSpec[] => [
  {
    id: 'lmm-summary',
    title: copy('Modello lineare misto con pendenza casuale'),
    subtitle: copy('{s1} ~ {s2} + (1 + {s3} | {s4}) · CI {s5}%', {
      s1: names.dep,
      s2: names.predictors.join(' + '),
      s3: names.slope,
      s4: names.group,
      s5: level,
    }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
    ],
    rows: [
      { metric: copy('N'), value: fit.n },
      { metric: copy('Gruppi'), value: fit.groups },
      { metric: copy('Varianza intercetta'), value: fit.random.interceptVariance },
      { metric: copy('Varianza pendenza'), value: fit.random.slopeVariance },
      { metric: copy('Covarianza'), value: fit.random.covariance },
      { metric: copy('Correlazione'), value: fit.random.correlation },
      { metric: copy('Varianza residua'), value: fit.random.residualVariance },
      { metric: copy('ICC'), value: fit.icc },
      { metric: copy('Log-verosimiglianza'), value: fit.logLik },
      { metric: 'AIC', value: fit.aic },
    ],
    notes: [
      copy('Stima di massima verosimiglianza con effetti casuali normali e residui omoschedastici.'),
      copy('La covarianza tra intercetta e pendenza descrive se i gruppi che partono più alti tendono a crescere più o meno rapidamente.'),
    ],
  },
  {
    id: 'lmm-fixed',
    title: copy('Effetti fissi'),
    subtitle: copy('CI {s1}% · z di Wald', { s1: level }),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'beta', label: copy('Stima'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'z', label: copy('z'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'lo', label: copy('CI low'), format: 'dec4' },
      { key: 'hi', label: copy('CI high'), format: 'dec4' },
    ],
    rows: fit.coefficients.map((coefficient, index) => ({
      ...coefficient,
      term: index === 0 ? '(Intercept)' : names.predictors[index - 1] ?? coefficient.term,
    })),
    notes: [copy('Il test z è asintotico: con pochi gruppi i gradi di libertà effettivi sono incerti.')],
  },
  {
    id: 'lmm-random-effects',
    title: copy('Effetti casuali per gruppo'),
    subtitle: copy('BLUP di intercetta e pendenza'),
    columns: [
      { key: 'group', label: names.group, format: 'text' },
      { key: 'n', label: copy('N'), format: 'int' },
      { key: 'intercept', label: copy('Intercetta'), format: 'dec4' },
      { key: 'slope', label: copy('Pendenza'), format: 'dec4' },
    ],
    rows: fit.randomEffects.map(effect => ({
      group: effect.group,
      n: effect.n,
      intercept: effect.intercept,
      slope: effect.slope,
    })),
    notes: [
      copy('I BLUP sono stime condizionate al gruppo: la loro variabilità non va confrontata con i coefficienti fissi.'),
    ],
  },
  {
    id: 'lmm-varcomp',
    title: copy('Componenti di varianza'),
    subtitle: copy('Stima e CI {s1}%', { s1: level }),
    columns: [
      { key: 'component', label: copy('Componente'), format: 'text' },
      { key: 'estimate', label: copy('Stima'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'lo', label: copy('CI low'), format: 'dec4' },
      { key: 'hi', label: copy('CI high'), format: 'dec4' },
    ],
    rows: fit.varianceComponents.map(entry => ({
      component:
        entry.component === 'intercept'
          ? copy('Intercetta casuale')
          : entry.component === 'slope'
            ? copy('Varianza pendenza')
            : copy('Residuo'),
      estimate: entry.estimate,
      se: entry.se,
      lo: entry.lo,
      hi: entry.hi,
    })),
    notes: [
      copy('La tabella delle componenti di varianza riporta SE e CI di Wald su scala log: un intervallo ampio dice che servono piu gruppi per una stima stabile.'),
    ],
  },
  {
    id: 'lmm-fixed-tests',
    title: copy('Test degli effetti fissi'),
    subtitle: copy('Wald per termine · CI {s1}%', { s1: level }),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'f', label: copy('F'), format: 'dec3' },
      { key: 'df1', label: copy('df1'), format: 'int' },
      { key: 'df2', label: copy('df2'), format: 'int' },
      { key: 'p', label: copy('p'), format: 'p' },
    ],
    rows: fit.fixedTests.map((test, index) => ({
      term: index === 0 ? '(Intercept)' : names.predictors[index - 1] ?? test.term,
      f: test.chiSquare,
      df1: test.df,
      df2: fit.df,
      p: test.p,
    })),
    notes: [
      copy('Con predittori a una colonna il test è il quadrato dello z: il p-value coincide con quello della tabella dei coefficienti.'),
    ],
  },
];
