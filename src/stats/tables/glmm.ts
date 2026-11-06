import { copy } from '../reportCopy';
import type { TableColumn, TableSpec } from '../types';
import type { GlmmResult } from '../kernels/glmm';

export interface GlmmNames {
  dep: string;
  predictors: string[];
  group: string;
  factor: number;
}

/**
 * Tabelle del GLMM: effetti fissi, componenti di varianza e BLUP per gruppo.
 *
 * La tabella delle componenti di varianza porta anche una nota sulla
 * convergenza: è l'unico segnale che il report di lettura può usare senza
 * importare il kernel (regola depcruise `reports-senza-ricalcolo`).
 */
export const glmmTables = (
  fit: GlmmResult,
  names: GlmmNames,
  level: number
): TableSpec[] => {
  const slopeTerm = names.predictors[names.factor] ?? names.predictors[0] ?? 'x';
  const familyLabel =
    fit.family === 'gaussian' ? copy('Gaussiana') : fit.family === 'binomial' ? copy('Binomiale') : copy('Poisson');
  const linkLabel =
    fit.link === 'identity' ? copy('Identità') : fit.link === 'logit' ? copy('Logit') : copy('Log');

  const componentRow = (key: 'intercept' | 'slope' | 'residual', label: string, estimate: number) => {
    const found = fit.varianceComponents.find(entry => entry.component === key);
    return {
      component: copy(label),
      estimate,
      se: found?.se ?? Number.NaN,
      lo: found?.lo ?? Number.NaN,
      hi: found?.hi ?? Number.NaN,
    };
  };

  const randomColumns: TableColumn[] = [
    { key: 'component', label: copy('Componente'), format: 'text' },
    { key: 'estimate', label: copy('Stima'), format: 'dec4' },
    { key: 'se', label: copy('SE'), format: 'dec4' },
    { key: 'lo', label: copy('CI low'), format: 'dec4' },
    { key: 'hi', label: copy('CI high'), format: 'dec4' },
  ];

  const blupColumns: TableColumn[] = [
    { key: 'group', label: copy('Gruppo'), format: 'text' },
    { key: 'n', label: copy('N'), format: 'int' },
    { key: 'intercept', label: copy('Intercetta'), format: 'dec4' },
    { key: 'interceptSe', label: copy('SE intercetta'), format: 'dec4' },
    ...(fit.randomSlope
      ? [
          { key: 'slope', label: copy('Pendenza'), format: 'dec4' as const },
          { key: 'slopeSe', label: copy('SE pendenza'), format: 'dec4' as const },
        ]
      : []),
  ];

  return [
    {
      id: 'glmm-coefficients',
      title: copy('Coefficienti del modello'),
      subtitle: copy('{s1} ~ {s2} · effetti casuali per {s3} · CI {s4}%', {
        s1: names.dep,
        s2: names.predictors.join(' + ') || '1',
        s3: names.group,
        s4: level,
      }),
      columns: [
        { key: 'term', label: copy('Termine'), format: 'text' },
        { key: 'beta', label: copy('B'), format: 'dec4' },
        { key: 'se', label: copy('SE'), format: 'dec4' },
        { key: 'z', label: copy('z'), format: 'dec3' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'lo', label: copy('CI low'), format: 'dec4' },
        { key: 'hi', label: copy('CI high'), format: 'dec4' },
      ],
      rows: fit.coefficients.map((coefficient, index) => ({
        term: index === 0 ? '(Intercept)' : names.predictors[index - 1] ?? coefficient.term,
        beta: coefficient.beta,
        se: coefficient.se,
        z: coefficient.z,
        p: coefficient.p,
        lo: coefficient.lo,
        hi: coefficient.hi,
      })),
      notes: [
        copy('I coefficienti sono sulla scala del link: la loro interpretazione cambia con famiglia e link.'),
        copy('Il test z è di Wald: con gruppi piccoli l’approssimazione può divergere dal test di verosimiglianza.'),
      ],
    },
    {
      id: 'glmm-random',
      title: copy('Componenti di varianza'),
      subtitle: copy('Famiglia {s1} · link {s2} · effetti casuali per {s3}', {
        s1: familyLabel,
        s2: linkLabel,
        s3: names.group,
      }),
      columns: randomColumns,
      rows: [
        componentRow('intercept', 'Varianza intercetta', fit.random.interceptVariance),
        ...(fit.randomSlope
          ? [
              componentRow('slope', 'Varianza pendenza', fit.random.slopeVariance),
              { component: copy('Covarianza (intercetta–pendenza)'), estimate: fit.random.covariance, se: Number.NaN, lo: Number.NaN, hi: Number.NaN },
              { component: copy('Correlazione (intercetta–pendenza)'), estimate: fit.random.correlation, se: Number.NaN, lo: Number.NaN, hi: Number.NaN },
            ]
          : []),
        ...(fit.family === 'gaussian'
          ? [componentRow('residual', 'Varianza residua', fit.random.residualVariance)]
          : []),
        { component: copy('ICC'), estimate: fit.icc, se: Number.NaN, lo: Number.NaN, hi: Number.NaN },
      ],
      notes: [
        copy('Le varianze sono sulla scala del predittore lineare: per binomiale e Poisson non sono componenti di varianza della risposta osservata.'),
        copy('L’ICC è la quota di varianza attribuibile ai gruppi: valori alti indicano osservazioni molto correlate entro gruppo.'),
        fit.converged
          ? copy('Convergenza raggiunta.')
          : copy('Convergenza non raggiunta: le stime non sono affidabili.'),
      ],
    },
    {
      id: 'glmm-blups',
      title: copy('Effetti casuali per gruppo'),
      subtitle: fit.randomSlope
        ? copy('{s1} gruppi · pendenza casuale su {s2}', { s1: fit.groups, s2: slopeTerm })
        : copy('{s1} gruppi', { s1: fit.groups }),
      columns: blupColumns,
      rows: fit.randomEffects.map(effect => ({
        group: effect.group,
        n: effect.n,
        intercept: effect.intercept,
        interceptSe: effect.interceptSe,
        ...(fit.randomSlope ? { slope: effect.slope, slopeSe: effect.slopeSe } : {}),
      })),
      notes: [
        copy('I BLUP sono stime condizionate al gruppo, con contrazione verso l’effetto fisso (shrinkage).'),
        copy('Gruppi con pochi casi sono stimati con maggiore incertezza: la colonna N aiuta a pesare la lettura.'),
      ],
    },
    {
    id: 'glmm-fixed-tests',
    title: copy('Test degli effetti fissi'),
    subtitle: copy('Wald per termine · CI {s1}%', { s1: level }),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'chiSquare', label: copy('ChiSquare'), format: 'dec3' },
      { key: 'df', label: copy('df'), format: 'int' },
      { key: 'p', label: copy('p'), format: 'p' },
    ],
    rows: fit.fixedTests.map((test, index) => ({
      term: index === 0 ? '(Intercept)' : names.predictors[index - 1] ?? test.term,
      chiSquare: test.chiSquare,
      df: test.df,
      p: test.p,
    })),
    notes: [
      copy('Con predittori a una colonna il test è il quadrato dello z: il p-value coincide con quello della tabella dei coefficienti.'),
    ],
  },
];
};
