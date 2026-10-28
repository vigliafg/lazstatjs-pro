import { jStat } from '../jstat';
import { parseNum } from '../core';
import {
  chi2SF,
  dagostinoPearson,
  kurtosisSE,
  lillieforsTest,
  meanCI,
  medianAbsoluteDeviation,
  medianCI,
  percentile,
  skewnessSE,
  trimmedMean,
  zTwoSidedP,
} from '../distributions';

export interface VariableSummary {
  name: string;
  values: number[];
  missing: number;
}

export const summarizeVariables = (
  rows: readonly (readonly string[])[],
  variableIndices: number[],
  columnNames: string[]
): VariableSummary[] => {
  const summaries: VariableSummary[] = variableIndices.map(index => {
    const values = rows
      .map(row => parseNum(row[index]))
      .filter(value => !isNaN(value));
    return {
      name: columnNames[index] ?? `Var${index + 1}`,
      values,
      missing: rows.length - values.length,
    };
  });

  return summaries;
};

export const descriptiveLocationRows = (valid: VariableSummary[], level: number) => {
  const locationRows = valid.map(summary => {
    const { values, name, missing } = summary;
    const n = values.length;
    const ci = meanCI(values, level);
    const medianCi = medianCI(values, level);
    return {
      variable: name,
      n,
      missing,
      sum: jStat.sum(values),
      mean: ci.mean,
      se: ci.se,
      ciLo: ci.lo,
      ciHi: ci.hi,
      median: jStat.median(values),
      medianLo: medianCi.lo,
      medianHi: medianCi.hi,
      trimmed: trimmedMean(values),
    };
  });

  return locationRows;
};

export const descriptiveDispersionRows = (valid: VariableSummary[]) => {
  const dispersionRows = valid.map(summary => {
    const { values, name } = summary;
    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;
    const q = n >= 4 ? jStat.quartiles(values) : [jStat.min(values), jStat.median(values), jStat.max(values)];
    const q1 = q[0];
    const q3 = q[2];
    const iqr = q3 - q1;
    const sd = jStat.stdev(values, true);
    const mean = jStat.mean(values);
    const mad = medianAbsoluteDeviation(values);
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const extremeLower = q1 - 3 * iqr;
    const extremeUpper = q3 + 3 * iqr;
    const outliers = sorted.filter(v => v < lowerFence || v > upperFence).length;
    const extreme = sorted.filter(v => v < extremeLower || v > extremeUpper).length;
    return {
      variable: name,
      sd,
      variance: jStat.variance(values, true),
      cv: mean !== 0 ? (sd / Math.abs(mean)) * 100 : NaN,
      min: jStat.min(values),
      q1,
      q3,
      max: jStat.max(values),
      range: jStat.max(values) - jStat.min(values),
      iqr,
      mad,
      madScaled: mad * 1.4826,
      outliers,
      outliersPct: (outliers / n) * 100,
      extreme,
    };
  });

  return dispersionRows;
};

export const descriptiveShapeRows = (valid: VariableSummary[]) => {
  const shapeRows = valid.map(summary => {
    const { values, name } = summary;
    const n = values.length;
    const skew = jStat.skewness(values);
    const excessKurt = jStat.kurtosis(values);
    const sSe = skewnessSE(n);
    const kSe = kurtosisSE(n);
    const zSkew = sSe > 0 ? skew / sSe : NaN;
    const zKurt = kSe > 0 ? excessKurt / kSe : NaN;
    const jb = n >= 3 ? (n / 6) * (skew * skew + (excessKurt * excessKurt) / 4) : NaN;
    const jbP = chi2SF(jb, 2);
    const lilliefors = lillieforsTest(values);
    const dagostino = dagostinoPearson(values);
    return {
      variable: name,
      skew,
      skewSe: sSe,
      zSkew,
      pSkew: zTwoSidedP(zSkew),
      kurt: excessKurt,
      kurtSe: kSe,
      zKurt,
      pKurt: zTwoSidedP(zKurt),
      jb,
      jbP,
      ksD: lilliefors.d,
      ksP: lilliefors.p,
      k2: dagostino.k2,
      k2P: dagostino.p,
    };
  });

  return shapeRows;
};

export const descriptiveQuantileRows = (valid: VariableSummary[]) => {
  const quantileRows = valid.map(summary => {
    const { values, name } = summary;
    return {
      variable: name,
      p1: percentile(values, 0.01),
      p5: percentile(values, 0.05),
      p10: percentile(values, 0.1),
      p25: percentile(values, 0.25),
      p50: percentile(values, 0.5),
      p75: percentile(values, 0.75),
      p90: percentile(values, 0.9),
      p95: percentile(values, 0.95),
      p99: percentile(values, 0.99),
    };
  });

  return quantileRows;
};
