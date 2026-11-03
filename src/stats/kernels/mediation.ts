/**
 * Baron–Kenny mediation for one predictor, one mediator and optional
 * covariates.
 *
 * Three ordinary least-squares equations are fitted with an intercept:
 *
 *   M = a X + covariates                     (mediator model)
 *   Y = c' X + b M + covariates              (outcome model)
 *   Y = c X + covariates                     (total-effect model)
 *
 * The indirect effect is `a b`, the direct effect is `c'` and the total effect
 * is `c' + a b`, which equals `c` for the linear model without an
 * X-by-M interaction. Standard errors are the Gaussian maximum-likelihood
 * (delta-method) ones reported by `lavaan::sem(se = "standard")`: the residual
 * variance uses `n` rather than the OLS residual degrees of freedom. This keeps
 * the path, Sobel and delta-method intervals on the same scale as the R
 * reference fixture.
 *
 * The indirect-effect interval uses the Sobel standard error,
 *
 *   se(a b) = sqrt(a^2 se(b)^2 + b^2 se(a)^2),
 *
 * and a percentile bootstrap resamples complete rows with replacement and
 * refits both equations. The resampling uses a deterministic mulberry32 PRNG
 * seeded by the caller, so a run is reproducible but never compared point by
 * point with R (whose RNG stream is different).
 */

import { jStat } from '../jstat';
import { invert, type Matrix } from './matrix';
import { mulberry32 } from './distributions';

export interface MediationInput {
  /** Outcome column, one value per complete row. */
  outcome: number[];
  /** Predictor that may act through the mediator. */
  predictor: number[];
  /** Mediator column. */
  mediator: number[];
  /** Covariate columns, each one value per complete row. */
  covariates: number[][];
  /** Bootstrap replications; 0 disables the bootstrap block. */
  bootstrap: number;
  /** Seed for the deterministic bootstrap PRNG. */
  seed: number;
  /** Confidence level in percent; defaults to 95. */
  level?: number;
}

export interface MediationPathEstimate {
  beta: number;
  se: number;
  t: number;
  p: number;
  lo: number;
  hi: number;
}

export interface MediationEffectEstimate {
  estimate: number;
  se: number;
  lo: number;
  hi: number;
}

export interface MediationBootstrap {
  /** Number of finite bootstrap replicates actually used. */
  reps: number;
  seed: number;
  ciLo: number;
  ciHi: number;
  samples: number[];
}

export interface MediationResult {
  paths: {
    a: MediationPathEstimate;
    b: MediationPathEstimate;
    cPrime: MediationPathEstimate;
    cTotal: MediationPathEstimate;
  };
  effects: {
    indirect: MediationEffectEstimate;
    direct: MediationEffectEstimate;
    total: MediationEffectEstimate;
    proportion: MediationEffectEstimate;
  };
  sobel: {
    se: number;
    z: number;
    p: number;
    lo: number;
    hi: number;
  };
  bootstrap: MediationBootstrap | null;
  /** Complete observations used by every equation. */
  n: number;
  /** Same value as `n`, exposed for callers that report complete cases. */
  complete: number;
  fit: {
    r2Mediator: number;
    r2Outcome: number;
    r2Total: number;
  };
}

interface OlsFit {
  beta: number[];
  se: number[];
  cov: Matrix;
  residuals: number[];
  r2: number;
  n: number;
  p: number;
}

const EPS = 1e-12;
/** Reject designs whose scaled X'X inverse has a diagonal above this value. */
const MAX_SCALED_VIF = 1e12;

const allFinite = (values: readonly number[]): boolean =>
  values.every(value => Number.isFinite(value));

const sameColumn = (left: readonly number[], right: readonly number[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index]);

/**
 * A scaled conditioning check on top of the exact singular test.
 *
 * Each design column is divided by its L2 norm so the comparison is invariant
 * to the units of the predictors. A diagonal of the scaled inverse above
 * `MAX_SCALED_VIF` means a predictor is almost a linear combination of the
 * others: the inverse exists numerically but the coefficients are not usable.
 */
const wellConditioned = (x: Matrix): boolean => {
  const p = x[0]?.length ?? 0;
  if (p === 0) return false;
  const norms = new Array<number>(p).fill(0);
  for (const row of x) {
    for (let column = 0; column < p; column += 1) {
      norms[column] += row[column] * row[column];
    }
  }
  if (norms.some(value => !(value > 0))) return false;
  const scaled = x.map(row => row.map((value, column) => value / Math.sqrt(norms[column])));
  const gram: Matrix = Array.from({ length: p }, () => new Array<number>(p).fill(0));
  for (const row of scaled) {
    for (let i = 0; i < p; i += 1) {
      for (let j = 0; j < p; j += 1) gram[i][j] += row[i] * row[j];
    }
  }
  const inverse = invert(gram);
  if (!inverse) return false;
  return inverse.every((row, index) =>
    Number.isFinite(row[index]) && Math.abs(row[index]) <= MAX_SCALED_VIF
  );
};

/**
 * Gaussian maximum-likelihood OLS fit.
 *
 * Estimates are the usual least-squares coefficients; `cov = (X'X)^-1 SSE / n`
 * matches the information-based covariance used by lavaan instead of the
 * residual-df OLS covariance. Returns `null` for a singular or ill-conditioned
 * design, a non-finite fit or a model with no residual degrees of freedom.
 */
const fitOls = (y: readonly number[], x: Matrix): OlsFit | null => {
  const n = y.length;
  const p = x[0]?.length ?? 0;
  if (n === 0 || p === 0 || x.length !== n || n <= p) return null;
  if (!allFinite(y) || x.some(row => row.length !== p || !allFinite(row))) return null;
  if (!wellConditioned(x)) return null;

  const gram: Matrix = Array.from({ length: p }, () => new Array<number>(p).fill(0));
  const xty = new Array<number>(p).fill(0);
  for (let row = 0; row < n; row += 1) {
    for (let i = 0; i < p; i += 1) {
      xty[i] += x[row][i] * y[row];
      for (let j = 0; j < p; j += 1) gram[i][j] += x[row][i] * x[row][j];
    }
  }

  const inverse = invert(gram);
  if (!inverse) return null;

  const beta = inverse.map(row => row.reduce((sum, value, index) => sum + value * xty[index], 0));
  if (!allFinite(beta)) return null;

  const fitted = x.map(row => row.reduce((sum, value, index) => sum + value * beta[index], 0));
  const residuals = y.map((value, index) => value - fitted[index]);
  const sse = residuals.reduce((sum, value) => sum + value * value, 0);
  const mean = y.reduce((sum, value) => sum + value, 0) / n;
  const sst = y.reduce((sum, value) => sum + (value - mean) * (value - mean), 0);
  const sigma2 = sse / n;
  const cov = inverse.map(row => row.map(value => value * sigma2));
  const se = cov.map((row, index) => Math.sqrt(Math.max(0, row[index])));
  if (!allFinite(se)) return null;

  return {
    beta,
    se,
    cov,
    residuals,
    r2: sst > 0 ? Math.min(1, Math.max(0, 1 - sse / sst)) : Number.NaN,
    n,
    p,
  };
};

const design = (...columns: readonly number[][]): Matrix => {
  const n = columns[0]?.length ?? 0;
  return Array.from({ length: n }, (_, row) => [
    1,
    ...columns.map(column => column[row]),
  ]);
};

const zValue = (level: number): number =>
  jStat.normal.inv(1 - (1 - level / 100) / 2, 0, 1);

const pathEstimate = (
  beta: number,
  se: number,
  crit: number
): MediationPathEstimate => {
  const t = se > 0 ? beta / se : Number.NaN;
  return {
    beta,
    se,
    t,
    p: Number.isFinite(t) ? 2 * jStat.normal.cdf(-Math.abs(t), 0, 1) : Number.NaN,
    lo: beta - crit * se,
    hi: beta + crit * se,
  };
};

const effectEstimate = (
  estimate: number,
  se: number,
  crit: number
): MediationEffectEstimate => ({
  estimate,
  se,
  lo: estimate - crit * se,
  hi: estimate + crit * se,
});

const percentile = (sorted: readonly number[], p: number): number => {
  if (sorted.length === 0) return Number.NaN;
  const position = (sorted.length - 1) * p;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
};

/**
 * Fit the mediation model.
 *
 * Returns `null` when the inputs contain non-finite values, when the outcome,
 * predictor and mediator are the same column, when there are fewer than
 * `p + 2` complete rows for the largest equation (intercept, X, M and the
 * covariates) or when a design is singular/ill-conditioned.
 */
export const fitMediation = (input: MediationInput): MediationResult | null => {
  const covariates = input.covariates ?? [];
  const level = Number.isFinite(input.level) ? (input.level as number) : 95;
  const n = input.outcome?.length ?? 0;

  if (!(level > 0 && level < 100)) return null;
  if (n === 0) return null;
  if (input.predictor?.length !== n || input.mediator?.length !== n) return null;
  if (covariates.some(column => column.length !== n)) return null;
  if (!allFinite(input.outcome) || !allFinite(input.predictor) || !allFinite(input.mediator)) {
    return null;
  }
  if (covariates.some(column => !allFinite(column))) return null;

  if (
    sameColumn(input.outcome, input.predictor) ||
    sameColumn(input.outcome, input.mediator) ||
    sameColumn(input.predictor, input.mediator)
  ) {
    return null;
  }
  if (
    covariates.some(
      column =>
        sameColumn(column, input.outcome) ||
        sameColumn(column, input.predictor) ||
        sameColumn(column, input.mediator)
    )
  ) {
    return null;
  }

  const predictorColumn = [...input.predictor];
  const mediatorColumn = [...input.mediator];
  const outcomeColumn = [...input.outcome];

  // The largest equation carries the intercept, X, M and every covariate.
  const maxParameters = 3 + covariates.length;
  if (n < maxParameters + 2) return null;

  const mediatorFit = fitOls(mediatorColumn, design(predictorColumn, ...covariates));
  const outcomeFit = fitOls(
    outcomeColumn,
    design(predictorColumn, mediatorColumn, ...covariates)
  );
  const totalFit = fitOls(outcomeColumn, design(predictorColumn, ...covariates));
  if (!mediatorFit || !outcomeFit || !totalFit) return null;

  // Mediator model: [intercept, X, covariates...].
  // Outcome model:  [intercept, X, M, covariates...].
  // Total model:    [intercept, X, covariates...].
  const aBeta = mediatorFit.beta[1];
  const aSe = mediatorFit.se[1];
  const bBeta = outcomeFit.beta[2];
  const bSe = outcomeFit.se[2];
  const cPrimeBeta = outcomeFit.beta[1];
  const cPrimeSe = outcomeFit.se[1];
  const cTotalBeta = totalFit.beta[1];
  const cTotalSe = totalFit.se[1];

  const crit = zValue(level);
  const paths = {
    a: pathEstimate(aBeta, aSe, crit),
    b: pathEstimate(bBeta, bSe, crit),
    cPrime: pathEstimate(cPrimeBeta, cPrimeSe, crit),
    cTotal: pathEstimate(cTotalBeta, cTotalSe, crit),
  };

  if (
    !Number.isFinite(aBeta) ||
    !Number.isFinite(bBeta) ||
    !Number.isFinite(cPrimeBeta) ||
    !Number.isFinite(cTotalBeta)
  ) {
    return null;
  }

  const indirect = aBeta * bBeta;
  const direct = cPrimeBeta;
  const total = cTotalBeta;
  const sobelSe = Math.sqrt(
    aBeta * aBeta * bSe * bSe + bBeta * bBeta * aSe * aSe
  );
  const sobelZ = sobelSe > 0 ? indirect / sobelSe : Number.NaN;
  const sobelP = Number.isFinite(sobelZ)
    ? 2 * jStat.normal.cdf(-Math.abs(sobelZ), 0, 1)
    : Number.NaN;

  // Delta method for the mediated proportion I / T = (a b) / (c' + a b).
  // The covariance between a and (b, c') is exactly zero in the recursive
  // model because the outcome equation includes the mediator (the two
  // residuals are orthogonal); the b-c' covariance comes from the same
  // outcome equation.
  let proportion = Number.NaN;
  let proportionSe = Number.NaN;
  let proportionLo = Number.NaN;
  let proportionHi = Number.NaN;
  if (Math.abs(total) >= EPS) {
    proportion = indirect / total;
    const gradient = [
      bBeta * (1 - proportion) / total,
      aBeta * (1 - proportion) / total,
      -proportion / total,
    ];
    const covariance = [
      [aSe * aSe, 0, 0],
      [0, bSe * bSe, outcomeFit.cov[2][1]],
      [0, outcomeFit.cov[1][2], cPrimeSe * cPrimeSe],
    ];
    const variance = gradient.reduce(
      (sum, left, i) =>
        sum +
        left *
          gradient.reduce(
            (inner, right, j) => inner + covariance[i][j] * right,
            0
          ),
      0
    );
    proportionSe = Math.sqrt(Math.max(0, variance));
    proportionLo = proportion - crit * proportionSe;
    proportionHi = proportion + crit * proportionSe;
  }

  const effects = {
    indirect: effectEstimate(indirect, sobelSe, crit),
    direct: effectEstimate(direct, cPrimeSe, crit),
    total: effectEstimate(total, cTotalSe, crit),
    proportion: {
      estimate: proportion,
      se: proportionSe,
      lo: proportionLo,
      hi: proportionHi,
    },
  };

  const sobel = {
    se: sobelSe,
    z: sobelZ,
    p: sobelP,
    lo: indirect - crit * sobelSe,
    hi: indirect + crit * sobelSe,
  };

  const requested = Math.max(0, Math.round(input.bootstrap));
  let bootstrap: MediationBootstrap | null = null;
  if (requested > 0) {
    const rng = mulberry32(Number.isInteger(input.seed) ? input.seed >>> 0 : 20261103);
    const samples: number[] = [];
    const maxAttempts = requested * 20;
    for (let attempt = 0; attempt < maxAttempts && samples.length < requested; attempt += 1) {
      const indices = Array.from({ length: n }, () => Math.floor(rng() * n));
      const sampleOutcome = indices.map(index => outcomeColumn[index]);
      const samplePredictor = indices.map(index => predictorColumn[index]);
      const sampleMediator = indices.map(index => mediatorColumn[index]);
      const sampleCovariates = covariates.map(column =>
        indices.map(index => column[index])
      );
      const bootMediator = fitOls(
        sampleMediator,
        design(samplePredictor, ...sampleCovariates)
      );
      const bootOutcome = fitOls(
        sampleOutcome,
        design(samplePredictor, sampleMediator, ...sampleCovariates)
      );
      if (!bootMediator || !bootOutcome) continue;
      const value = bootMediator.beta[1] * bootOutcome.beta[2];
      if (Number.isFinite(value)) samples.push(value);
    }

    if (samples.length > 0) {
      const sorted = [...samples].sort((left, right) => left - right);
      const alpha = (1 - level / 100) / 2;
      bootstrap = {
        reps: samples.length,
        seed: Number.isInteger(input.seed) ? input.seed : 20261103,
        ciLo: percentile(sorted, alpha),
        ciHi: percentile(sorted, 1 - alpha),
        samples,
      };
    }
  }

  return {
    paths,
    effects,
    sobel,
    bootstrap,
    n,
    complete: n,
    fit: {
      r2Mediator: mediatorFit.r2,
      r2Outcome: outcomeFit.r2,
      r2Total: totalFit.r2,
    },
  };
};
