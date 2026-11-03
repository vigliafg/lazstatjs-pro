import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type { OneVarianceResult, TwoVarianceResult } from '../kernels/variances';

export const oneVarianceTables = (result: OneVarianceResult, variableName: string): TableSpec[] => [
  {
    id: 'var-one',
    title: copy('Varianza (un campione)'),
    subtitle: variableName,
    columns: [
      { key: 'n', label: copy('N'), format: 'int' },
      { key: 'variance', label: copy('Variance'), format: 'dec4' },
      { key: 'sd', label: copy('SD'), format: 'dec4' },
      { key: 'nullVariance', label: copy('Null variance'), format: 'dec4' },
      { key: 'chi2', label: copy('Chi-square'), format: 'dec4' },
      { key: 'df', label: copy('df'), format: 'int' },
      { key: 'p', label: copy('p-value'), format: 'p' },
      { key: 'lo', label: copy('CI low'), format: 'dec4' },
      { key: 'hi', label: copy('CI high'), format: 'dec4' },
    ],
    rows: [
      {
        n: result.n,
        variance: result.variance,
        sd: result.sd,
        nullVariance: result.nullVariance,
        chi2: result.chi2,
        df: result.df,
        p: result.p,
        lo: result.lo,
        hi: result.hi,
      },
    ],
    notes: [
      copy('χ² = (n − 1)·s²/σ₀² con n − 1 gradi di libertà; il p è a due code.'),
      copy('Intervallo esatto della varianza ottenuto invertendo la χ².'),
    ],
  },
];

export const twoVarianceTables = (
  result: TwoVarianceResult,
  variableName: string,
  groupName: string
): TableSpec[] => [
  {
    id: 'var-groups',
    title: copy('Varianze per gruppo'),
    subtitle: copy('{s1} per {s2}', { s1: variableName, s2: groupName }),
    columns: [
      { key: 'group', label: groupName, format: 'text' },
      { key: 'n', label: copy('N'), format: 'int' },
      { key: 'variance', label: copy('Variance'), format: 'dec4' },
      { key: 'sd', label: copy('SD'), format: 'dec4' },
    ],
    rows: result.groups.map(group => ({
      group: group.name,
      n: group.n,
      variance: group.variance,
      sd: group.sd,
    })),
  },
  {
    id: 'var-tests',
    title: copy('Test di uguaglianza delle varianze'),
    columns: [
      { key: 'test', label: copy('Test'), format: 'text' },
      { key: 'statistic', label: copy('Statistic'), format: 'dec4' },
      { key: 'df1', label: copy('df1'), format: 'int' },
      { key: 'df2', label: copy('df2'), format: 'int' },
      { key: 'p', label: copy('p-value'), format: 'p' },
    ],
    rows: [
      {
        test: copy('F test (first two groups)'),
        statistic: result.ratio,
        df1: result.df1,
        df2: result.df2,
        p: result.fP,
      },
      {
        test: 'Bartlett',
        statistic: result.bartlett.statistic,
        df1: result.bartlett.df,
        df2: '',
        p: result.bartlett.p,
      },
      {
        test: copy('Levene (median)'),
        statistic: result.levene.statistic,
        df1: result.levene.df1,
        df2: result.levene.df2,
        p: result.levene.p,
      },
    ],
    notes: [
      copy('F: rapporto tra le varianze dei primi due gruppi, intervallo esatto.'),
      copy('Bartlett assume la normalità ed è sensibile agli outlier; Levene sulle mediane è più robusto.'),
    ],
  },
];
