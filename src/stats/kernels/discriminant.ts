/**
 * Linear discriminant analysis and the one-way MANOVA that goes with it.
 *
 * The pooled within-group covariance drives both the classification
 * coefficients and the canonical functions. Canonical roots are obtained by
 * whitening the within covariance and diagonalising the between matrix, so the
 * same Jacobi routine used by PCA is enough.
 */
import { eigenSymmetric } from '../linalg';
import { fSF, chi2SF } from './distributions';
import {
  columnMeans,
  invert,
  multiply,
  multiplyVector,
  quadratic,
  symmetricPower,
  zeros,
} from './matrix';

export interface DiscriminantInput {
  data: number[][];
  labels: string[];
  variableNames: string[];
}

import type { DiscriminantResult } from '../analysisResults';

export type { DiscriminantResult } from '../analysisResults';

const groupMean = (rows: number[][]): number[] => columnMeans(rows);

export const discriminantAnalysis = (input: DiscriminantInput): DiscriminantResult | null => {
  const { data, labels, variableNames } = input;
  const p = variableNames.length;
  if (data.length < 4 || p < 1 || data.some(row => row.length !== p)) return null;
  const groups = Array.from(new Set(labels)).sort();
  if (groups.length < 2 || groups.length > 10) return null;
  const n = data.length;
  if (n - groups.length < 1) return null;

  const grouped = groups.map(group => data.filter((_, index) => labels[index] === group));
  if (grouped.some(rows => rows.length < 2)) return null;
  const means = grouped.map(groupMean);
  const grand = columnMeans(data);
  const priors = grouped.map(rows => rows.length / n);

  const within = zeros(p, p);
  grouped.forEach((rows, group) => {
    rows.forEach(row => {
      for (let i = 0; i < p; i += 1) {
        for (let j = 0; j < p; j += 1) {
          within[i][j] += (row[i] - means[group][i]) * (row[j] - means[group][j]);
        }
      }
    });
  });
  const withinDf = n - groups.length;
  const covariance = within.map(row => row.map(value => value / withinDf));
  const inverse = invert(covariance);
  if (!inverse) return null;

  const between = zeros(p, p);
  grouped.forEach((rows, group) => {
    for (let i = 0; i < p; i += 1) {
      for (let j = 0; j < p; j += 1) {
        between[i][j] +=
          rows.length * (means[group][i] - grand[i]) * (means[group][j] - grand[j]);
      }
    }
  });
  const betweenScaled = between.map(row => row.map(value => value / Math.max(1, groups.length - 1)));

  const coefficients = means.map(mean => multiplyVector(inverse, mean));
  const constants = means.map((mean, group) => {
    const value = quadratic(inverse, mean);
    return -0.5 * value + Math.log(Math.max(1e-12, priors[group]));
  });

  const confusion = Array.from({ length: groups.length }, () =>
    new Array<number>(groups.length).fill(0)
  );
  let correct = 0;
  data.forEach((row, index) => {
    const scores = coefficients.map((coefficient, group) =>
      row.reduce((sum, value, column) => sum + value * coefficient[column], 0) + constants[group]
    );
    let best = 0;
    scores.forEach((score, group) => {
      if (score > scores[best]) best = group;
    });
    const actual = groups.indexOf(labels[index]);
    confusion[actual][best] += 1;
    if (actual === best) correct += 1;
  });

  // Canonical functions: S^{-1/2} B S^{-1/2} has the between/within roots.
  const eigenCov = eigenSymmetric(covariance);
  const positive = eigenCov.values.map(value => (value > 1e-12 ? value : 1e-12));
  const inverseRoot = symmetricPower(covariance, positive, eigenCov.vectors, -0.5);
  const whitened = multiply(multiply(inverseRoot, betweenScaled), inverseRoot);
  const canonical = eigenSymmetric(whitened);
  const vectors = multiply(inverseRoot, canonical.vectors);
  const centered = data.map(row => row.map((value, column) => value - grand[column]));
  const canonicalScores = centered.map(row =>
    Array.from({ length: vectors[0]?.length ?? 0 }, (_, component) =>
      row.reduce((sum, value, variable) => sum + value * (vectors[variable][component] ?? 0), 0)
    )
  );

  const centroids = groups.map((group, index) => {
    const rows = canonicalScores.filter((_, row) => labels[row] === group);
    const x = rows.reduce((sum, row) => sum + (row[0] ?? 0), 0) / Math.max(1, rows.length);
    const y = rows.reduce((sum, row) => sum + (row[1] ?? 0), 0) / Math.max(1, rows.length);
    return { group, x, y };
  });

  const roots = canonical.values.map(value => Math.max(0, value));
  const dimensions = Math.min(p, groups.length - 1);
  const wilks: DiscriminantResult['wilks'] = [];
  for (let start = 0; start < dimensions; start += 1) {
    const product = roots.slice(start).reduce((value, root) => value / (1 + root), 1);
    const df = Math.max(1, (p - start) * (groups.length - 1 - start));
    const chi2 = -(n - 1 - (p + groups.length) / 2) * Math.log(Math.max(1e-12, product));
    wilks.push({ dimension: start + 1, lambda: product, chi2, df, p: chi2SF(chi2, df) });
  }
  const pillai = roots.slice(0, dimensions).reduce((sum, root) => sum + root / (1 + root), 0);

  const univariate = Array.from({ length: p }, (_, variable) => {
    const betweenSs = grouped.reduce(
      (sum, rows, group) =>
        sum + rows.length * Math.pow(means[group][variable] - grand[variable], 2),
      0
    );
    const withinSs = grouped.reduce(
      (sum, rows, group) =>
        sum +
        rows.reduce(
          (inner, row) => inner + Math.pow(row[variable] - means[group][variable], 2),
          0
        ),
      0
    );
    const dfB = groups.length - 1;
    const dfW = n - groups.length;
    const f = dfW > 0 && withinSs > 0 ? (betweenSs / dfB) / (withinSs / dfW) : NaN;
    return { variable, f, p: fSF(f, dfB, dfW), between: betweenSs, within: withinSs };
  });

  return {
    groups,
    n,
    p,
    means,
    priors,
    coefficients,
    constants,
    accuracy: correct / n,
    confusion,
    canonicalEigen: roots,
    canonicalVectors: vectors,
    canonicalScores,
    centroids,
    wilks,
    pillai,
    univariate,
  };
};
