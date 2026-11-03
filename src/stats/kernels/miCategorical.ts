/**
 * Multiple imputation for categorical variables (MICE with chained equations).
 *
 * Each variable in `options.variables` is treated as an integer category code,
 * even when the column is stored as text. The conditional model is a logistic
 * regression for binary variables and a multinomial logistic regression with
 * K-1 logits for variables with more than two observed categories. Models use
 * the other categorical variables (dummy-coded with their current chain values),
 * the numeric covariates in `options.predictors`, and an intercept.
 *
 * Missing cells are drawn from the fitted distribution, so an imputed value is
 * always one of the categories observed for that variable. Pooling follows
 * Rubin's rules on the category proportions; the numeric `mi.ts` path is left
 * untouched and keeps its own mean/SD pooling.
 */

import { parseNum } from '../core';
import { tCrit } from '../distributions';
import { eigenSymmetric } from '../linalg';
import { mulberry32 } from './distributions';
import { invert, type Matrix } from './matrix';
import type {
  MiCategoricalVariable,
  MiCategoryEstimate,
  MiOptions,
  MiStats,
  MiVariable,
} from '../mi/types';

const SEED = 20261028;
const MAX_ITERATIONS = 200;
const TOLERANCE = 1e-9;

const normal = (rng: () => number): number => {
  const u = Math.max(1e-12, rng());
  const v = Math.max(1e-12, rng());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const logistic = (value: number): number => {
  if (value >= 0) {
    const exp = Math.exp(-value);
    return 1 / (1 + exp);
  }
  const exp = Math.exp(value);
  return exp / (1 + exp);
};

const dot = (row: number[], beta: number[]): number =>
  row.reduce((sum, value, index) => sum + value * (beta[index] ?? 0), 0);

const solve = (matrix: Matrix, vector: number[]): number[] | null => {
  const size = matrix.length;
  if (size === 0 || vector.length !== size) return null;
  const work = matrix.map((row, index) => [...row, vector[index] ?? 0]);
  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(work[row][column]) > Math.abs(work[pivot][column])) pivot = row;
    }
    if (Math.abs(work[pivot][column]) < 1e-12) return null;
    [work[column], work[pivot]] = [work[pivot], work[column]];
    const divisor = work[column][column];
    for (let j = column; j <= size; j += 1) work[column][j] /= divisor;
    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = work[row][column];
      if (factor === 0) continue;
      for (let j = column; j <= size; j += 1) work[row][j] -= factor * work[column][j];
    }
  }
  return work.map(row => row[size]);
};

const drawNormalVector = (mean: number[], covariance: Matrix, rng: () => number): number[] => {
  const eigen = eigenSymmetric(covariance);
  const z = mean.map(() => normal(rng));
  return mean.map((value, row) =>
    value + eigen.vectors[row].reduce(
      (sum, loading, component) =>
        sum + loading * Math.sqrt(Math.max(0, eigen.values[component])) * z[component],
      0
    )
  );
};

interface Fit {
  beta: number[];
  covariance: Matrix;
}

const logisticInformation = (x: Matrix, beta: number[]): Matrix => {
  const width = x[0]?.length ?? 0;
  const information = Array.from({ length: width }, () => new Array<number>(width).fill(0));
  x.forEach(row => {
    const probability = logistic(dot(row, beta));
    const weight = Math.max(1e-9, probability * (1 - probability));
    for (let j = 0; j < width; j += 1) {
      for (let k = 0; k < width; k += 1) information[j][k] += row[j] * weight * row[k];
    }
  });
  return information;
};

/** Binary logistic fit by IRLS; the covariance is the inverse Hessian. */
const fitBinary = (x: Matrix, y: number[]): Fit | null => {
  const n = y.length;
  const width = x[0]?.length ?? 0;
  if (width < 2 || n <= width) return null;
  let beta = new Array<number>(width).fill(0);
  let converged = false;
  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration += 1) {
    const information = Array.from({ length: width }, () => new Array<number>(width).fill(0));
    const right = new Array<number>(width).fill(0);
    x.forEach((row, index) => {
      const eta = dot(row, beta);
      const probability = logistic(eta);
      const weight = Math.max(1e-9, probability * (1 - probability));
      const adjusted = eta + (y[index] - probability) / weight;
      for (let j = 0; j < width; j += 1) {
        right[j] += row[j] * weight * adjusted;
        for (let k = 0; k < width; k += 1) information[j][k] += row[j] * weight * row[k];
      }
    });
    const next = solve(information, right);
    if (!next) return null;
    const change = Math.max(...next.map((value, index) => Math.abs(value - beta[index])));
    beta = next;
    if (change < TOLERANCE) {
      converged = true;
      break;
    }
  }
  if (!converged) return null;
  const covariance = invert(logisticInformation(x, beta));
  return covariance ? { beta, covariance } : null;
};

interface MultinomialFit {
  beta: Matrix;
  covariance: Matrix;
  classes: number;
}

const softmax = (row: number[], beta: Matrix): number[] => {
  const eta = [0, ...beta.map(column => dot(row, column))];
  const maximum = Math.max(...eta);
  const exponentials = eta.map(value => Math.exp(value - maximum));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map(value => value / total);
};

const multinomialInformation = (x: Matrix, beta: Matrix): Matrix => {
  const classes = beta.length + 1;
  const width = x[0]?.length ?? 0;
  const size = (classes - 1) * width;
  const information = Array.from({ length: size }, () => new Array<number>(size).fill(0));
  x.forEach(row => {
    const probability = softmax(row, beta);
    for (let k = 1; k < classes; k += 1) {
      for (let l = 1; l < classes; l += 1) {
        const factor = probability[k] * ((k === l ? 1 : 0) - probability[l]);
        if (factor === 0) continue;
        const left = (k - 1) * width;
        const right = (l - 1) * width;
        for (let j = 0; j < width; j += 1) {
          for (let m = 0; m < width; m += 1) {
            information[left + j][right + m] += row[j] * factor * row[m];
          }
        }
      }
    }
  });
  return information;
};

/** Multinomial logistic fit by IRLS; the covariance covers the flattened K-1 logits. */
const fitMultinomial = (x: Matrix, y: number[], classes: number): MultinomialFit | null => {
  const n = y.length;
  const width = x[0]?.length ?? 0;
  const size = (classes - 1) * width;
  if (width < 2 || classes < 3 || n <= size) return null;
  const beta: Matrix = Array.from({ length: classes - 1 }, () => new Array<number>(width).fill(0));
  let converged = false;
  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration += 1) {
    const information = Array.from({ length: size }, () => new Array<number>(size).fill(0));
    const score = new Array<number>(size).fill(0);
    x.forEach((row, index) => {
      const probability = softmax(row, beta);
      for (let k = 1; k < classes; k += 1) {
        const residual = probability[k] - (y[index] === k ? 1 : 0);
        const offset = (k - 1) * width;
        for (let j = 0; j < width; j += 1) score[offset + j] += row[j] * residual;
      }
      for (let k = 1; k < classes; k += 1) {
        for (let l = 1; l < classes; l += 1) {
          const factor = probability[k] * ((k === l ? 1 : 0) - probability[l]);
          if (factor === 0) continue;
          const left = (k - 1) * width;
          const right = (l - 1) * width;
          for (let j = 0; j < width; j += 1) {
            for (let m = 0; m < width; m += 1) {
              information[left + j][right + m] += row[j] * factor * row[m];
            }
          }
        }
      }
    });
    const direction = solve(information, score.map(value => -value));
    if (!direction) return null;
    for (let k = 0; k < classes - 1; k += 1) {
      for (let j = 0; j < width; j += 1) beta[k][j] += direction[k * width + j];
    }
    if (Math.max(...direction.map(value => Math.abs(value))) < TOLERANCE) {
      converged = true;
      break;
    }
  }
  if (!converged) return null;
  const covariance = invert(multinomialInformation(x, beta));
  return covariance ? { beta, covariance, classes } : null;
};

interface VariableSpec {
  column: number;
  categories: number[];
  categoryIndex: Map<number, number>;
  mode: number;
}

const parseCategory = (value: string | number | null | undefined): number | null => {
  const parsed = parseNum(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildSpecs = (options: MiOptions): VariableSpec[] =>
  options.variables.map(column => {
    const observed = options.rows
      .map(row => parseCategory(row[column]))
      .filter((value): value is number => value !== null);
    const categories = [...new Set(observed)].sort((a, b) => a - b);
    const counts = new Map<number, number>();
    observed.forEach(value => counts.set(value, (counts.get(value) ?? 0) + 1));
    let mode = categories[0] ?? 0;
    let best = -1;
    categories.forEach(category => {
      const count = counts.get(category) ?? 0;
      if (count > best) {
        best = count;
        mode = category;
      }
    });
    return {
      column,
      categories,
      categoryIndex: new Map(categories.map((category, index) => [category, index])),
      mode,
    };
  });

/** Human-readable reason when the categorical design cannot be imputed. */
export const miCategoricalIssue = (options: MiOptions): string | null => {
  if (options.variables.length === 0) return 'Select at least one categorical variable';
  for (const column of options.variables) {
    const observed = options.rows
      .map(row => parseCategory(row[column]))
      .filter((value): value is number => value !== null);
    if (observed.length < 2) {
      return `Variable ${column + 1} needs at least two observed values`;
    }
    if (new Set(observed).size < 2) {
      return `Variable ${column + 1} needs at least two observed categories`;
    }
  }
  return null;
};

const designRow = (
  rowIndex: number,
  target: number,
  data: number[][],
  specs: VariableSpec[],
  predictors: number[][]
): number[] => {
  const row = [1];
  specs.forEach((spec, position) => {
    if (position === target) return;
    const index = spec.categoryIndex.get(data[rowIndex][position]) ?? 0;
    for (let category = 1; category < spec.categories.length; category += 1) {
      row.push(index === category ? 1 : 0);
    }
  });
  predictors.forEach(values => row.push(values[rowIndex]));
  return row;
};

const sampleCategorical = (
  target: VariableSpec,
  observed: (number | null)[],
  rng: () => number
): number => {
  const counts = target.categories.map(category =>
    observed.reduce((sum, value) => sum + (value === category ? 1 : 0), 0)
  );
  const total = counts.reduce((sum, value) => sum + value, 0);
  let draw = rng() * Math.max(1, total);
  for (let index = 0; index < target.categories.length; index += 1) {
    draw -= counts[index];
    if (draw <= 0) return target.categories[index];
  }
  return target.categories[target.categories.length - 1];
};

const imputeColumn = (
  data: number[][],
  observed: (number | null)[][],
  target: number,
  specs: VariableSpec[],
  predictors: number[][],
  rng: () => number
): void => {
  const spec = specs[target];
  const rows = data
    .map((row, index) => ({ row, index }))
    .filter(entry => observed[entry.index][target] !== null);
  const targets = data
    .map((row, index) => ({ row, index }))
    .filter(entry => observed[entry.index][target] === null);
  if (targets.length === 0) return;

  const design = rows.map(entry => designRow(entry.index, target, data, specs, predictors));
  const y = rows.map(entry => spec.categoryIndex.get(entry.row[target]) ?? 0);
  const width = design[0]?.length ?? 0;
  const fallback = (): void => {
    const column = observed.map(row => row[target]);
    targets.forEach(entry => {
      entry.row[target] = sampleCategorical(spec, column, rng);
    });
  };

  if (spec.categories.length === 2) {
    const fit = fitBinary(design, y);
    if (!fit) {
      fallback();
      return;
    }
    const beta = drawNormalVector(fit.beta, fit.covariance, rng);
    targets.forEach(entry => {
      const probability = logistic(dot(designRow(entry.index, target, data, specs, predictors), beta));
      entry.row[target] = spec.categories[rng() < probability ? 1 : 0];
    });
    return;
  }

  const fit = fitMultinomial(design, y, spec.categories.length);
  if (!fit) {
    fallback();
    return;
  }
  const flat = drawNormalVector(
    fit.beta.reduce<number[]>((all, row) => [...all, ...row], []),
    fit.covariance,
    rng
  );
  const beta = Array.from({ length: spec.categories.length - 1 }, (_, index) =>
    flat.slice(index * width, (index + 1) * width)
  );
  targets.forEach(entry => {
    const probabilities = softmax(designRow(entry.index, target, data, specs, predictors), beta);
    let draw = rng();
    let chosen = probabilities.length - 1;
    for (let index = 0; index < probabilities.length; index += 1) {
      draw -= probabilities[index];
      if (draw <= 0) {
        chosen = index;
        break;
      }
    }
    entry.row[target] = spec.categories[chosen];
  });
};

interface Pooled {
  mean: number;
  within: number;
  between: number;
  se: number;
  df: number;
  lo: number;
  hi: number;
  fmi: number;
}

const pool = (estimates: number[], withinVariances: number[], level: number): Pooled => {
  const m = estimates.length;
  const mean = estimates.reduce((sum, value) => sum + value, 0) / m;
  const within = withinVariances.reduce((sum, value) => sum + value, 0) / m;
  const between = estimates.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / Math.max(1, m - 1);
  const total = within + (1 + 1 / m) * between;
  const se = Math.sqrt(Math.max(0, total));
  const df = between > 1e-12
    ? Math.pow(total, 2) /
      (Math.pow(within / m, 2) / Math.max(1, m - 1) + Math.pow((1 + 1 / m) * between, 2) / Math.max(1, m - 1))
    : m * 1000;
  const crit = tCrit(level, Math.max(1, df));
  return {
    mean,
    within,
    between,
    se,
    df,
    lo: mean - crit * se,
    hi: mean + crit * se,
    fmi: total > 0 ? (between + between / m) / total : 0,
  };
};

const poolVariable = (
  values: number[],
  withinVariances: number[],
  sampleVariances: number[],
  level: number
): Omit<MiVariable, 'name' | 'observed' | 'missing'> => {
  const m = values.length;
  const mean = values.reduce((sum, value) => sum + value, 0) / m;
  const within = withinVariances.reduce((sum, value) => sum + value, 0) / m;
  const between = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / Math.max(1, m - 1);
  const total = within + (1 + 1 / m) * between;
  const se = Math.sqrt(Math.max(0, total));
  const df = between > 1e-12
    ? Math.pow(total, 2) /
      (Math.pow(within / m, 2) / Math.max(1, m - 1) + Math.pow((1 + 1 / m) * between, 2) / Math.max(1, m - 1))
    : m * 1000;
  const crit = tCrit(level, Math.max(1, df));
  const meanSampleVariance = sampleVariances.reduce((sum, value) => sum + value, 0) / m;
  const betweenSampleVariance = sampleVariances.reduce(
    (sum, value) => sum + Math.pow(value - meanSampleVariance, 2),
    0
  ) / Math.max(1, m - 1);
  const pooledVariance = meanSampleVariance + (1 + 1 / m) * betweenSampleVariance;
  return {
    mean,
    sd: Math.sqrt(Math.max(0, pooledVariance)),
    se,
    lo: mean - crit * se,
    hi: mean + crit * se,
    df,
    fmi: total > 0 ? (between + between / m) / total : 0,
  };
};

/** Categorical MICE. Returns `null` when the design or a conditional fit is unusable. */
export const miCategoricalStats = (options: MiOptions): MiStats | null => {
  if (miCategoricalIssue(options)) return null;
  const { rows, level } = options;
  if (rows.length < 2) return null;
  const imputations = Math.max(2, Math.min(50, Math.round(options.imputations)));
  const iterations = Math.max(1, Math.min(50, Math.round(options.iterations)));
  const specs = buildSpecs(options);
  const observed: (number | null)[][] = rows.map(row =>
    specs.map(spec => parseCategory(row[spec.column]))
  );
  const observedCounts = specs.map((_, target) =>
    observed.filter(row => row[target] !== null).length
  );
  const missingCounts = specs.map((_, target) => rows.length - observedCounts[target]);

  const predictors = (options.predictors ?? []).map(column => {
    const raw = rows.map(row => parseCategory(row[column]));
    const values = raw.filter((value): value is number => value !== null);
    const mean = values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    return raw.map(value => (value === null ? mean : value));
  });

  const rng = mulberry32(SEED);
  const categoryEstimates = specs.map(spec => spec.categories.map(() => [] as number[]));
  const categoryWithin = specs.map(spec => spec.categories.map(() => [] as number[]));
  const completedCounts = specs.map(spec => spec.categories.map(() => 0));
  const means = specs.map(() => [] as number[]);
  const meanVariances = specs.map(() => [] as number[]);
  const sampleVariances = specs.map(() => [] as number[]);
  const chainSums = specs.map(() => new Array<number>(iterations).fill(0));
  let completed: number[][] = observed.map(row =>
    row.map((value, target) => (value === null ? specs[target].mode : value))
  );

  for (let imputation = 0; imputation < imputations; imputation += 1) {
    const data = observed.map(row =>
      row.map((value, target) => (value === null ? specs[target].mode : value))
    );
    for (let iteration = 0; iteration < iterations; iteration += 1) {
      specs.forEach((_, target) => {
        if (missingCounts[target] > 0) {
          imputeColumn(data, observed, target, specs, predictors, rng);
        }
      });
      specs.forEach((_, target) => {
        const mean = data.reduce((sum, row) => sum + row[target], 0) / data.length;
        chainSums[target][iteration] += mean;
      });
    }

    completed = data.map(row => [...row]);
    specs.forEach((spec, target) => {
      const column = data.map(row => row[target]);
      spec.categories.forEach((category, index) => {
        const count = column.reduce((sum, value) => sum + (value === category ? 1 : 0), 0);
        const proportion = column.length > 0 ? count / column.length : 0;
        categoryEstimates[target][index].push(proportion);
        categoryWithin[target][index].push(column.length > 0 ? (proportion * (1 - proportion)) / column.length : 0);
        completedCounts[target][index] = count;
      });
      const mean = column.reduce((sum, value) => sum + value, 0) / column.length;
      const variance = column.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / Math.max(1, column.length - 1);
      means[target].push(mean);
      meanVariances[target].push(variance / column.length);
      sampleVariances[target].push(variance);
    });
  }

  const variables: MiVariable[] = specs.map((spec, target) => ({
    name: `V${spec.column + 1}`,
    observed: observedCounts[target],
    missing: missingCounts[target],
    ...poolVariable(means[target], meanVariances[target], sampleVariances[target], level),
  }));

  const categories: MiCategoricalVariable[] = specs.map((spec, target) => {
    const observedColumn = observed.map(row => row[target]);
    const observedTotal = observedColumn.filter((value): value is number => value !== null).length;
    const proportions: MiCategoryEstimate[] = spec.categories.map((category, index) => {
      const pooled = pool(
        categoryEstimates[target][index],
        categoryWithin[target][index],
        level
      );
      const observedCount = observedColumn.reduce(
        (sum, value) => sum + (value === category ? 1 : 0),
        0
      );
      return {
        category,
        observed: observedCount,
        completed: completedCounts[target][index],
        observedProportion: observedTotal > 0 ? observedCount / observedTotal : NaN,
        completedProportion: completed.length > 0 ? completedCounts[target][index] / completed.length : NaN,
        proportion: pooled.mean,
        within: pooled.within,
        between: pooled.between,
        se: pooled.se,
        df: pooled.df,
        lo: pooled.lo,
        hi: pooled.hi,
        fmi: pooled.fmi,
      };
    });
    return {
      name: `V${spec.column + 1}`,
      observed: observedCounts[target],
      missing: missingCounts[target],
      categories: [...spec.categories],
      proportions,
    };
  });

  const observedValues = specs.map((spec, target) =>
    observed
      .map(row => row[target])
      .filter((value): value is number => value !== null)
  );
  const imputedValues = specs.map((_, target) => completed.map(row => row[target]));

  return {
    n: rows.length,
    imputations,
    iterations,
    variables,
    observedValues,
    imputedValues,
    chainMeans: chainSums.map(series => series.map(sum => sum / imputations)),
    regression: null,
    categories,
  };
};
