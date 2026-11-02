import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { TableSpec } from '../types';
import type { DiscriminantResult } from '../kernels/discriminant';

export interface DiscriminantTablesOptions {
  result: DiscriminantResult;
  variableNames: string[];
  groupName: string;
}

/** MANOVA, univariate tests, coefficients, confusion and centroids. */
export const discriminantTables = ({
  result,
  variableNames,
  groupName,
}: DiscriminantTablesOptions): TableSpec[] => {
  const wilks: TableSpec = {
    id: 'discriminant-wilks',
    title: copy('MANOVA — lambda di Wilks'),
    subtitle: copy('{s1} gruppi · {s2} variabili', { s1: result.groups.length, s2: result.p }),
    columns: [
      { key: 'dimension', label: copy('Dimensione'), format: 'int', align: 'right' },
      { key: 'lambda', label: copy('Lambda'), format: 'dec3', align: 'right' },
      { key: 'chi2', label: copy('Chi-quadro'), format: 'dec3', align: 'right' },
      { key: 'df', label: copy('df'), format: 'int', align: 'right' },
      { key: 'p', label: copy('p'), format: 'p', align: 'right' },
    ],
    rows: result.wilks.map(entry => ({
      dimension: entry.dimension,
      lambda: entry.lambda,
      chi2: entry.chi2,
      df: entry.df,
      p: entry.p,
    })),
    notes: [copy('Pillai = {s1}; N = {s2}.', { s1: fmtEst(result.pillai, 3), s2: result.n })],
  };

  const univariate: TableSpec = {
    id: 'discriminant-univariate',
    title: copy('Test univariati'),
    subtitle: copy('Ogni variabile separatamente, per {s1}', { s1: groupName }),
    columns: [
      { key: 'variable', label: copy('Variabile'), align: 'left' },
      { key: 'f', label: 'F', format: 'dec3', align: 'right' },
      { key: 'p', label: 'p', format: 'p', align: 'right' },
    ],
    rows: result.univariate.map(entry => ({
      variable: variableNames[entry.variable] ?? `V${entry.variable + 1}`,
      f: entry.f,
      p: entry.p,
    })),
  };

  const coefficients: TableSpec = {
    id: 'discriminant-coefficients',
    title: copy('Coefficienti discriminanti'),
    subtitle: copy('Funzioni lineari su {s1} variabili', { s1: result.p }),
    columns: [
      { key: 'variable', label: copy('Variabile'), align: 'left' },
      ...result.groups.map((group, index) => ({
        key: `g${index}`,
        label: group,
        format: 'dec3' as const,
        align: 'right' as const,
      })),
    ],
    rows: variableNames.map((name, variable) => ({
      variable: name,
      ...Object.fromEntries(
        result.groups.map((_, group) => [
          `g${group}`,
          result.coefficients[group]?.[variable] ?? 0,
        ])
      ),
    })),
  };

  const confusion: TableSpec = {
    id: 'discriminant-confusion',
    title: copy('Matrice di classificazione'),
    subtitle: copy('Accuratezza = {s1}%', { s1: fmtEst(result.accuracy * 100, 1) }),
    columns: [
      { key: 'actual', label: copy('Osservato'), align: 'left' },
      ...result.groups.map((group, index) => ({
        key: `p${index}`,
        label: group,
        format: 'int' as const,
        align: 'right' as const,
      })),
    ],
    rows: result.groups.map((group, actual) => ({
      actual: group,
      ...Object.fromEntries(
        result.groups.map((_, predicted) => [
          `p${predicted}`,
          result.confusion[actual]?.[predicted] ?? 0,
        ])
      ),
    })),
  };

  const centroids: TableSpec = {
    id: 'discriminant-centroids',
    title: copy('Centroidi canonici'),
    subtitle: copy('Prima e seconda funzione discriminante'),
    columns: [
      { key: 'group', label: groupName, align: 'left' },
      { key: 'x', label: copy('LD1'), format: 'dec3', align: 'right' },
      { key: 'y', label: copy('LD2'), format: 'dec3', align: 'right' },
    ],
    rows: result.centroids.map(centroid => ({
      group: centroid.group,
      x: centroid.x,
      y: centroid.y,
    })),
  };

  return [wilks, univariate, coefficients, confusion, centroids];
};
