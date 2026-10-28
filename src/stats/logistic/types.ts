
/**
 * Binary logistic regression fitted by iteratively reweighted least squares.
 * Reports odds ratios with Wald confidence intervals, the likelihood-ratio
 * test against the null model, and the usual classification statistics.
 */

export interface LogisticPredictor {
  name: string;
  values: number[];
}

export interface LogisticModel {
  names: string[];
  beta: number[];
  se: number[];
  n: number;
  events: number;
  logLik: number;
  logLikNull: number;
  lr: number;
  df: number;
  p: number;
  mcfadden: number;
  coxSnell: number;
  nagelkerke: number;
  aic: number;
  bic: number;
  fitted: number[];
  auc: number;
  accuracy: number;
  sensitivity: number;
  specificity: number;
  separation: boolean;
  penalized?: boolean;
  penalizedLogLik?: number;
}
