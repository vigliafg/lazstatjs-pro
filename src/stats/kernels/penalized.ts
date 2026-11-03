/**
 * Penalized linear regression: ridge, LASSO and elastic net.
 *
 * Fits the Gaussian objective
 *
 *   1/(2n) ||y - Xβ||² + λ [ α ||β||₁ + (1 - α)/2 ||β||₂² ]
 *
 * with coordinate descent on standardized predictors, matching the `glmnet`
 * convention (`standardize = TRUE`, intercept unpenalized). Coefficients are
 * returned on the original scale.
 */
import type { Matrix } from './matrix';

export type Penalty = 'ridge' | 'lasso' | 'elasticnet';

export interface PenalizedInput {
  y: number[];
  /** Design matrix WITHOUT the intercept column. */
  x: Matrix;
  penalty: Penalty;
  /** Penalization strength on the standardized scale. */
  lambda: number;
  /** Mixing parameter for elastic net: 0 = ridge, 1 = LASSO. */
  alpha?: number;
  maxIterations?: number;
  tolerance?: number;
}

export interface PenalizedResult {
  penalty: Penalty;
  lambda: number;
  alpha: number;
  /** Coefficients on the original predictor scale. */
  coefficients: number[];
  intercept: number;
  fitted: number[];
  residuals: number[];
  r2: number;
  df: number;
  iterations: number;
  converged: boolean;
}

const EPS = 1e-12;

const softThreshold = (value: number, threshold: number): number => {
  if (value > threshold) return value - threshold;
  if (value < -threshold) return value + threshold;
  return 0;
};

const mean = (values: number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);

const populationSd = (values: number[], average: number): number =>
  Math.sqrt(
    values.reduce((sum, value) => sum + (value - average) * (value - average), 0) /
      Math.max(1, values.length)
  );

/** Penalized Gaussian fit by coordinate descent. */
export const fitPenalized = (input: PenalizedInput): PenalizedResult | null => {
  const { y, x, penalty } = input;
  const n = y.length;
  if (n === 0 || x.length !== n) return null;
  const p = x[0]?.length ?? 0;
  if (p === 0) return null;
  if (x.some(row => row.length !== p)) return null;
  if (!Number.isFinite(input.lambda) || input.lambda < 0) return null;

  const alpha =
    penalty === 'ridge' ? 0 : penalty === 'lasso' ? 1 : Math.min(1, Math.max(0, input.alpha ?? 0.5));
  const lambda = input.lambda;
  const maxIterations = input.maxIterations ?? 100000;
  const tolerance = input.tolerance ?? 1e-13;

  const yMean = mean(y);
  const yCentered = y.map(value => value - yMean);
  const yScale = yCentered.reduce((sum, value) => sum + value * value, 0);
  const ySd = Math.sqrt(yScale / Math.max(1, n));
  // glmnet applies the ridge part of the penalty on the scale of the response
  // standard deviation; reproducing that keeps the results comparable.
  const ridgePenalty = lambda * (1 - alpha) / (ySd > EPS ? ySd : 1);
  const lassoPenalty = lambda * alpha;
  const means = Array.from({ length: p }, (_, column) => mean(x.map(row => row[column])));
  const sds = Array.from({ length: p }, (_, column) =>
    populationSd(x.map(row => row[column]), means[column])
  );
  const active = sds.map(value => value > EPS);
  const standardized: Matrix = x.map(row =>
    row.map((value, column) => (active[column] ? (value - means[column]) / sds[column] : 0))
  );

  const beta = new Array<number>(p).fill(0);
  const residual = [...yCentered];
  let iterations = 0;
  let converged = false;

  for (; iterations < maxIterations; iterations += 1) {
    let maxChange = 0;
    for (let column = 0; column < p; column += 1) {
      if (!active[column]) continue;
      const previous = beta[column];
      let rho = 0;
      for (let row = 0; row < n; row += 1) {
        rho += standardized[row][column] * (residual[row] + standardized[row][column] * previous);
      }
      rho /= n;
      const denominator = 1 + ridgePenalty;
      const next = denominator > EPS ? softThreshold(rho, lassoPenalty) / denominator : 0;
      const change = next - previous;
      if (change !== 0) {
        beta[column] = next;
        for (let row = 0; row < n; row += 1) {
          residual[row] -= standardized[row][column] * change;
        }
        maxChange = Math.max(maxChange, Math.abs(change));
      }
    }
    if (maxChange < tolerance) {
      converged = true;
      break;
    }
  }

  const coefficients = beta.map((value, column) =>
    active[column] ? value / sds[column] : 0
  );
  const intercept = yMean - coefficients.reduce((sum, value, column) => sum + value * means[column], 0);
  const fitted = x.map(row =>
    intercept + row.reduce((sum, value, column) => sum + value * coefficients[column], 0)
  );
  const residuals = y.map((value, index) => value - fitted[index]);
  const sst = y.reduce((sum, value) => sum + (value - yMean) * (value - yMean), 0);
  const sse = residuals.reduce((sum, value) => sum + value * value, 0);

  return {
    penalty,
    lambda,
    alpha,
    coefficients,
    intercept,
    fitted,
    residuals,
    r2: sst > 0 ? Math.max(0, 1 - sse / sst) : NaN,
    df: beta.filter(value => Math.abs(value) > 1e-10).length,
    iterations,
    converged,
  };
};

/** Path of fits over a decreasing lambda grid, for the coefficient profile. */
export const penalizedPath = (
  input: Omit<PenalizedInput, 'lambda'>,
  lambdas: number[]
): PenalizedResult[] =>
  [...lambdas]
    .sort((left, right) => right - left)
    .map(lambda => fitPenalized({ ...input, lambda }))
    .filter((fit): fit is PenalizedResult => fit !== null);
