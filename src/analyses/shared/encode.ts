import { parseNum } from '../../stats/core';

export interface EncodedCovariate {
  name: string;
  values: number[];
  error?: string;
}

const numericShare = (values: string[]): number => {
  if (values.length === 0) return 0;
  return values.filter(value => Number.isFinite(parseNum(value))).length / values.length;
};

/**
 * Numeric columns stay numeric; small categorical columns become dummies.
 * The same rule is used by every survival model with covariates.
 */
export const encodeColumn = (
  rows: readonly (readonly string[])[],
  index: number,
  name: string
): EncodedCovariate[] => {
  const raw = rows.map(row => String(row[index] ?? '').trim());
  const present = raw.filter(value => value !== '');
  if (present.length === 0) return [];

  if (numericShare(present) >= 0.8) {
    return [{ name, values: raw.map(value => (value === '' ? NaN : parseNum(value))) }];
  }

  const levels = Array.from(new Set(present)).sort();
  if (levels.length > 4) {
    return [{ name, values: [], error: `"${name}" ha ${levels.length} livelli: usa una codifica manuale` }];
  }
  return levels.slice(1).map(level => ({
    name: `${name} = ${level}`,
    values: raw.map(value => (value === '' ? NaN : value === level ? 1 : 0)),
  }));
};

/** Encode several covariates, returning the error of the first unusable one. */
export const encodeCovariates = (
  rows: readonly (readonly string[])[],
  indexes: readonly number[],
  nameOf: (index: number) => string
): { encoded: EncodedCovariate[]; error?: string } => {
  const encoded: EncodedCovariate[] = [];
  for (const index of indexes) {
    const columns = encodeColumn(rows, index, nameOf(index));
    const problem = columns.find(column => column.error);
    if (problem?.error) return { encoded, error: problem.error };
    encoded.push(...columns);
  }
  return { encoded };
};
