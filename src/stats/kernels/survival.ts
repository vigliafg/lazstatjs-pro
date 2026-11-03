import { chi2SF, zCrit } from '../distributions';
import type {
  KMPoint,
  KMResult,
  LifeTableRow,
  SurvivalGroup,
  TurnbullInterval,
  TurnbullResult,
} from '../survival/types';

export const kaplanMeier = (time: number[], event: number[], level = 95): KMResult => {
  const n = time.length;
  if (n === 0) {
    return { points: [], median: NaN, medianLo: NaN, medianHi: NaN, rmst: NaN, maxTime: NaN, n: 0, events: 0, censored: 0 };
  }

  const observations = time
    .map((value, index) => ({ time: value, event: event[index] === 1 ? 1 : 0 }))
    .filter(item => Number.isFinite(item.time) && item.time >= 0)
    .sort((left, right) => left.time - right.time);

  const total = observations.length;
  const eventCount = observations.filter(item => item.event === 1).length;
  const maxTime = Math.max(...observations.map(item => item.time));
  const eventTimes = Array.from(
    new Set(observations.filter(item => item.event === 1).map(item => item.time))
  ).sort((left, right) => left - right);

  const z = zCrit(level);
  const points: KMPoint[] = [];
  let survival = 1;
  let greenwood = 0;

  eventTimes.forEach(atTime => {
    const nRisk = observations.filter(item => item.time >= atTime).length;
    const events = observations.filter(item => item.time === atTime && item.event === 1).length;
    const censored = observations.filter(item => item.time === atTime && item.event === 0).length;
    if (nRisk === 0 || events === 0) return;

    survival *= 1 - events / nRisk;
    greenwood += events / (nRisk * Math.max(1, nRisk - events));

    let lo = NaN;
    let hi = NaN;
    if (survival > 0 && survival < 1 && greenwood > 0) {
      const se = Math.sqrt(greenwood) / Math.abs(Math.log(survival));
      lo = Math.pow(survival, Math.exp(z * se));
      hi = Math.pow(survival, Math.exp(-z * se));
    } else if (survival === 0) {
      lo = 0;
      hi = 0;
    }

    points.push({ time: atTime, nRisk, events, censored, survival, lo, hi });
  });

  const medianPoint = points.find(point => point.survival <= 0.5);
  const median = medianPoint ? medianPoint.time : NaN;
  // The lower band crosses 0.5 earlier than the point estimate, the upper band later.
  const lowerCandidate = points.find(point => Number.isFinite(point.lo) && point.lo <= 0.5);
  const upperCandidate = points.find(point => Number.isFinite(point.hi) && point.hi <= 0.5);
  const medianLo = lowerCandidate ? lowerCandidate.time : NaN;
  const medianHi = upperCandidate ? upperCandidate.time : NaN;

  let rmst = 0;
  let previousTime = 0;
  let previousSurvival = 1;
  points.forEach(point => {
    rmst += previousSurvival * (point.time - previousTime);
    previousTime = point.time;
    previousSurvival = point.survival;
  });
  rmst += previousSurvival * (maxTime - previousTime);

  return {
    points,
    median,
    medianLo,
    medianHi,
    rmst,
    maxTime,
    n: total,
    events: eventCount,
    censored: total - eventCount,
  };
};

const invertMatrix = (matrix: number[][]): number[][] | null => {
  const size = matrix.length;
  const work = matrix.map((row, index) => [
    ...row,
    ...Array.from({ length: size }, (_, j) => (j === index ? 1 : 0)),
  ]);

  for (let column = 0; column < size; column++) {
    let pivotRow = column;
    for (let row = column + 1; row < size; row++) {
      if (Math.abs(work[row][column]) > Math.abs(work[pivotRow][column])) pivotRow = row;
    }
    if (Math.abs(work[pivotRow][column]) < 1e-12) return null;
    [work[column], work[pivotRow]] = [work[pivotRow], work[column]];

    const pivot = work[column][column];
    for (let j = 0; j < 2 * size; j++) work[column][j] /= pivot;

    for (let row = 0; row < size; row++) {
      if (row === column) continue;
      const factor = work[row][column];
      if (factor === 0) continue;
      for (let j = 0; j < 2 * size; j++) work[row][j] -= factor * work[column][j];
    }
  }

  return work.map(row => row.slice(size));
};

export interface LogRankResult {
  chi2: number;
  df: number;
  p: number;
  hazardRatio: number;
  hrLo: number;
  hrHi: number;
}

export const logRankTest = (groups: SurvivalGroup[], level = 95): LogRankResult => {
  const k = groups.length;
  if (k < 2) return { chi2: NaN, df: NaN, p: NaN, hazardRatio: NaN, hrLo: NaN, hrHi: NaN };

  const observations = groups.flatMap((group, groupIndex) =>
    group.time
      .map((time, index) => ({ time, event: group.event[index] === 1 ? 1 : 0, groupIndex }))
      .filter(item => Number.isFinite(item.time) && item.time >= 0)
  );

  const eventTimes = Array.from(
    new Set(observations.filter(item => item.event === 1).map(item => item.time))
  ).sort((left, right) => left - right);

  const observed = new Array<number>(k).fill(0);
  const expected = new Array<number>(k).fill(0);
  const covariance = Array.from({ length: k }, () => new Array<number>(k).fill(0));

  eventTimes.forEach(atTime => {
    const atRisk = new Array<number>(k).fill(0);
    const deaths = new Array<number>(k).fill(0);
    observations.forEach(item => {
      if (item.time >= atTime) atRisk[item.groupIndex] += 1;
      if (item.time === atTime && item.event === 1) deaths[item.groupIndex] += 1;
    });

    const n = atRisk.reduce((sum, value) => sum + value, 0);
    const d = deaths.reduce((sum, value) => sum + value, 0);
    if (n === 0 || d === 0) return;

    for (let j = 0; j < k; j++) {
      observed[j] += deaths[j];
      expected[j] += (atRisk[j] * d) / n;
    }

    const factor = (d * (n - d)) / Math.max(1, n - 1);
    for (let j = 0; j < k; j++) {
      for (let l = 0; l < k; l++) {
        const shareJ = atRisk[j] / n;
        const shareL = atRisk[l] / n;
        covariance[j][l] += factor * (j === l ? shareJ * (1 - shareJ) : -shareJ * shareL);
      }
    }
  });

  const difference = observed.map((value, index) => value - expected[index]);
  const size = k - 1;
  const subMatrix = Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => covariance[i][j])
  );
  const inverse = invertMatrix(subMatrix);
  if (!inverse) return { chi2: NaN, df: size, p: NaN, hazardRatio: NaN, hrLo: NaN, hrHi: NaN };

  let chi2 = 0;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      chi2 += difference[i] * inverse[i][j] * difference[j];
    }
  }

  let hazardRatio = NaN;
  let hrLo = NaN;
  let hrHi = NaN;
  if (k === 2 && covariance[0][0] > 0) {
    hazardRatio = Math.exp(difference[0] / covariance[0][0]);
    const se = 1 / Math.sqrt(covariance[0][0]);
    const critical = zCrit(level);
    hrLo = Math.exp(Math.log(hazardRatio) - critical * se);
    hrHi = Math.exp(Math.log(hazardRatio) + critical * se);
  }

  return {
    chi2: Math.max(0, chi2),
    df: size,
    p: chi2SF(Math.max(0, chi2), size),
    hazardRatio,
    hrLo,
    hrHi,
  };
};


export const lifeTable = (time: number[], event: number[], intervals?: number): LifeTableRow[] => {
  const observations = time
    .map((value, index) => ({ time: value, event: event[index] === 1 ? 1 : 0 }))
    .filter(item => Number.isFinite(item.time) && item.time >= 0);
  if (observations.length === 0) return [];

  const maxTime = Math.max(...observations.map(item => item.time));
  const k = intervals ?? Math.min(8, Math.max(2, Math.ceil(Math.sqrt(observations.length))));
  const width = maxTime / k || 1;
  const rows: LifeTableRow[] = [];
  let survival = 1;
  let greenwood = 0;

  for (let index = 0; index < k; index++) {
    const isLast = index === k - 1;
    const start = index * width;
    const end = isLast ? maxTime : (index + 1) * width;
    const inInterval = (value: number) => value >= start && (isLast ? value <= end : value < end);
    const atRisk = observations.filter(item => item.time >= start).length;
    const events = observations.filter(item => inInterval(item.time) && item.event === 1).length;
    const censored = observations.filter(item => inInterval(item.time) && item.event === 0).length;
    const effective = atRisk - censored / 2;
    const q = effective > 0 ? Math.min(1, events / effective) : 0;
    const p = 1 - q;
    if (effective > 0) {
      survival *= p;
      greenwood += events / Math.max(1, effective * (effective - events));
    }
    rows.push({
      start,
      end,
      atRisk,
      events,
      censored,
      effective,
      q,
      p,
      survival,
      se: survival * Math.sqrt(greenwood),
    });
  }

  return rows;
};

/**
 * Turnbull non-parametric maximum likelihood for interval-censored data.
 *
 * Every observation is an interval `(lower, upper]`; `upper = Infinity` is
 * right censoring, `lower = 0` left censoring and `lower === upper` an exact
 * event. The support is the set of innermost intervals built from the observed
 * endpoints; an EM algorithm distributes mass over them.
 */
export const turnbull = (
  intervals: readonly TurnbullInterval[],
  maxIterations = 5000
): TurnbullResult => {
  const scale = Math.max(
    1,
    ...intervals.map(item => (Number.isFinite(item.upper) ? item.upper : item.lower))
  );
  const epsilon = 1e-6 * scale;
  const usable = intervals
    .map(item => {
      const lower = Number.isFinite(item.lower) && item.lower >= 0 ? item.lower : 0;
      const upper = Number.isFinite(item.upper) ? item.upper : Infinity;
      // An exact event is a zero-width interval: widen it by epsilon so the
      // half-open support can carry its mass.
      return upper <= lower
        ? { lower: Math.max(0, lower - epsilon), upper: lower }
        : { lower, upper };
    })
    .filter(item => Number.isFinite(item.lower) && (Number.isFinite(item.upper) || item.upper === Infinity));
  const n = usable.length;
  if (n === 0) return { points: [], n: 0, iterations: 0, converged: true };

  const endpoints = Array.from(
    new Set(
      usable.flatMap(item => [
        item.lower,
        ...(Number.isFinite(item.upper) ? [item.upper] : []),
      ])
    )
  ).sort((left, right) => left - right);
  if (endpoints.length < 2) {
    return {
      points: [{ time: endpoints[0] ?? 0, survival: 0, mass: 1 }],
      n,
      iterations: 0,
      converged: true,
    };
  }

  const elementary = endpoints.slice(1).map((upper, index) => ({
    lower: endpoints[index],
    upper,
  }));

  // Membership of every observation in every elementary cell.
  const elementaryMembership = usable.map(item =>
    elementary
      .map((cell, index) =>
        cell.lower >= item.lower && cell.upper <= item.upper ? index : -1
      )
      .filter(index => index >= 0)
  );

  // Turnbull intervals: merge adjacent elementary cells that belong to exactly
  // the same set of observations. The NPMLE is identifiable only on these
  // maximal intervals, not on the elementary cells.
  const cells: { lower: number; upper: number; mass: number }[] = [];
  let current: { lower: number; upper: number; signature: string } | null = null;
  elementary.forEach((cell, index) => {
    const signature = elementaryMembership
      .map(indices => (indices.includes(index) ? '1' : '0'))
      .join('');
    if (current && current.signature === signature) {
      current.upper = cell.upper;
    } else {
      if (current) cells.push({ lower: current.lower, upper: current.upper, mass: 1 });
      current = { lower: cell.lower, upper: cell.upper, signature };
    }
  });
  if (current) cells.push({ lower: current.lower, upper: current.upper, mass: 1 });
  cells.forEach(cell => {
    cell.mass = 1 / cells.length;
  });

  const membership = usable.map(item =>
    cells
      .map((cell, index) =>
        cell.lower >= item.lower && cell.upper <= item.upper ? index : -1
      )
      .filter(index => index >= 0)
  );

  let converged = false;
  let iterations = 0;
  for (; iterations < maxIterations; iterations += 1) {
    let largestChange = 0;
    const nextMass = new Array<number>(cells.length).fill(0);
    membership.forEach(indices => {
      const total = indices.reduce((sum, index) => sum + cells[index].mass, 0);
      if (total <= 0) return;
      indices.forEach(index => {
        nextMass[index] += cells[index].mass / total / n;
      });
    });
    cells.forEach((cell, index) => {
      largestChange = Math.max(largestChange, Math.abs(nextMass[index] - cell.mass));
      cell.mass = nextMass[index];
    });
    if (largestChange < 1e-11) {
      converged = true;
      iterations += 1;
      break;
    }
  }

  // Survival is a step function dropping by the mass ending at each endpoint.
  // Cells that received no mass are not identifiable support points and are
  // omitted from the reported curve.
  let cumulative = 0;
  const points = cells
    .map(cell => {
      cumulative += cell.mass;
      return { time: cell.upper, survival: 1 - cumulative, mass: cell.mass };
    })
    .filter(point => point.mass > 1e-10);

  return { points, n, iterations, converged };
};
