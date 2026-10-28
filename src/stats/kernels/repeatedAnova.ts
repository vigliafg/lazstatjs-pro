import { jStat } from '../jstat';
import { chi2SF, fSF, tCrit } from '../distributions';
import { eigenSymmetric } from '../linalg';
import { alphaOf } from './alpha';
import type { RmAnovaResult } from '../repeatedAnova/types';

const mean = (values: number[]): number => values.reduce((sum, value) => sum + value, 0) / values.length;

const covariance = (blocks: number[][], k: number, means: number[], n: number): number[][] => {
  const matrix = Array.from({ length: k }, () => new Array<number>(k).fill(0));
  for (let i = 0; i < k; i += 1) {
    for (let j = i; j < k; j += 1) {
      let sum = 0;
      blocks.forEach((block) => {
        sum += (block[i] - means[i]) * (block[j] - means[j]);
      });
      const value = sum / (n - 1);
      matrix[i][j] = value;
      matrix[j][i] = value;
    }
  }
  return matrix;
};

/** Orthonormal Helmert contrasts (k × k−1), orthogonal to the grand mean. */
const helmertContrasts = (k: number): number[][] =>
  Array.from({ length: k }, (_, row) =>
    Array.from({ length: k - 1 }, (_, column) => {
      const j = column + 1;
      const scale = Math.sqrt(j * (j + 1));
      if (row < j) return 1 / scale;
      if (row === j) return -j / scale;
      return 0;
    })
  );

const contrastCovariance = (S: number[][], C: number[][]): number[][] => {
  const k = S.length;
  const d = C[0].length;
  const sc = S.map((row) =>
    Array.from({ length: d }, (_, j) => row.reduce((sum, value, i) => sum + value * C[i][j], 0))
  );
  return Array.from({ length: d }, (_, a) =>
    Array.from({ length: d }, (_, b) =>
      C.reduce((sum, row, i) => sum + row[a] * sc[i][b], 0)
    )
  );
};

export const repeatedMeasuresAnova = (blocks: number[][]): RmAnovaResult | null => {
  if (blocks.length < 2) return null;
  const k = blocks[0].length;
  if (k < 3 || blocks.some((block) => block.length !== k)) return null;
  if (blocks.some((block) => block.some((value) => !Number.isFinite(value)))) return null;

  const n = blocks.length;
  const means = Array.from({ length: k }, (_, column) => mean(blocks.map((block) => block[column])));
  const grand = mean(blocks.flat());
  const subjectMeans = blocks.map((block) => mean(block));

  let ssTotal = 0;
  blocks.forEach((block) => {
    block.forEach((value) => {
      ssTotal += (value - grand) * (value - grand);
    });
  });
  const ssSubjects = k * subjectMeans.reduce((sum, value) => sum + (value - grand) ** 2, 0);
  const ssConditions = n * means.reduce((sum, value) => sum + (value - grand) ** 2, 0);
  const ssError = Math.max(0, ssTotal - ssSubjects - ssConditions);

  const dfConditions = k - 1;
  const dfError = (n - 1) * (k - 1);
  if (!(dfError > 0)) return null;
  const msConditions = ssConditions / dfConditions;
  const msError = ssError / dfError;
  const f = msError > 0 ? msConditions / msError : NaN;
  const p = fSF(f, dfConditions, dfError);

  const S = covariance(blocks, k, means, n);
  const C = helmertContrasts(k);
  const M = contrastCovariance(S, C);
  const eigen = eigenSymmetric(M);
  const values = eigen.values;
  const d = k - 1;
  const trace = values.reduce((sum, value) => sum + value, 0);

  let mauchlyW = NaN;
  let mauchlyChi2 = NaN;
  let mauchlyP = NaN;
  const mauchlyDf = (d * (d + 1)) / 2 - 1;
  if (values.some((value) => value <= 0) || !(trace > 0)) {
    mauchlyW = 0;
    mauchlyP = 0;
  } else {
    const logDet = values.reduce((sum, value) => sum + Math.log(value), 0);
    mauchlyW = Math.exp(logDet - d * Math.log(trace / d));
    const dfResid = n - 1;
    const correction = 1 - (2 * d * d + d + 2) / (6 * d * dfResid);
    mauchlyChi2 = -dfResid * correction * Math.log(mauchlyW);
    const w2 =
      ((d + 2) * (d - 1) * (d - 2) * (2 * d ** 3 + 6 * d ** 2 + 3 * k + 2)) /
      (288 * (dfResid * d * correction) ** 2);
    const p1 = chi2SF(mauchlyChi2, mauchlyDf);
    const p2 = chi2SF(mauchlyChi2, mauchlyDf + 4);
    mauchlyP = Math.min(1, Math.max(0, p1 + w2 * (p2 - p1)));
  }

  const sumSquares = values.reduce((sum, value) => sum + value * value, 0);
  const ggEpsilon = sumSquares > 0 ? Math.min(1, (trace * trace) / (d * sumSquares)) : 1;
  const lowerBound = 1 / d;
  const hfRaw = (n * d * ggEpsilon - 2) / (d * (n - 1 - d * ggEpsilon));
  const hfEpsilon = Math.max(lowerBound, Math.min(1, hfRaw));
  const pGG = fSF(f, Math.max(1, ggEpsilon * dfConditions), Math.max(1, ggEpsilon * dfError));
  const pHF = fSF(f, Math.max(1, hfEpsilon * dfConditions), Math.max(1, hfEpsilon * dfError));

  return {
    n,
    k,
    means,
    sds: Array.from({ length: k }, (_, column) =>
      jStat.stdev(blocks.map((block) => block[column]), true)
    ),
    ssConditions,
    ssSubjects,
    ssError,
    ssTotal,
    dfConditions,
    dfError,
    msConditions,
    msError,
    f,
    p,
    partialEta2: ssConditions / (ssConditions + ssError),
    generalizedEta2: ssConditions / ssTotal,
    mauchlyW,
    mauchlyChi2,
    mauchlyDf,
    mauchlyP,
    ggEpsilon,
    hfEpsilon,
    pGG,
    pHF,
  };
};
