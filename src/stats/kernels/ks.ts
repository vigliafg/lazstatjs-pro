/**
 * Two-sample Kolmogorov–Smirnov test.
 *
 * The statistic is the largest absolute difference between the two empirical
 * distribution functions. The p-value is exact for moderate samples: the
 * number of rank arrangements whose ECDF difference stays below the observed
 * D is counted with a lattice-path dynamic program (BigInt, so the binomial
 * coefficient never overflows) and divided by C(n + m, n). For large samples
 * the asymptotic Kolmogorov series is used instead and the result says so.
 */
export interface TwoSampleKsResult {
  n1: number;
  n2: number;
  d: number;
  p: number;
  method: 'exact' | 'asymptotic';
}

/** Largest ECDF gap on the pooled ordered sample. */
export const ksDistance = (a: number[], b: number[]): number => {
  const sortedA = [...a].sort((left, right) => left - right);
  const sortedB = [...b].sort((left, right) => left - right);
  const values = [...new Set([...sortedA, ...sortedB])].sort((left, right) => left - right);
  let i = 0;
  let j = 0;
  let d = 0;
  for (const value of values) {
    while (i < sortedA.length && sortedA[i] <= value) i += 1;
    while (j < sortedB.length && sortedB[j] <= value) j += 1;
    d = Math.max(d, Math.abs(i / sortedA.length - j / sortedB.length));
  }
  return d;
};

const chooseBig = (n: number, k: number): bigint => {
  const limit = Math.min(k, n - k);
  let result = 1n;
  for (let index = 0; index < limit; index += 1) {
    result = (result * BigInt(n - index)) / BigInt(index + 1);
  }
  return result;
};

/** Proportion of lattice paths that stay strictly below the observed D. */
const exactUpperTail = (n: number, m: number, d: number): number => {
  const total = chooseBig(n + m, n);
  let previous = new Array<bigint>(m + 1).fill(0n);
  for (let i = 0; i <= n; i += 1) {
    const current = new Array<bigint>(m + 1).fill(0n);
    for (let j = 0; j <= m; j += 1) {
      if (Math.abs(i / n - j / m) >= d - 1e-12) continue;
      if (i === 0 && j === 0) {
        current[j] = 1n;
        continue;
      }
      current[j] = (i > 0 ? previous[j] : 0n) + (j > 0 ? current[j - 1] : 0n);
    }
    previous = current;
  }
  const scale = 10n ** 15n;
  const kept = Number((previous[m] * scale) / total) / 1e15;
  return Math.min(1, Math.max(0, 1 - kept));
};

/** Asymptotic Kolmogorov series with the small-sample correction. */
const asymptoticP = (n1: number, n2: number, d: number): number => {
  const ne = (n1 * n2) / (n1 + n2);
  const lambda = (Math.sqrt(ne) + 0.12 + 0.11 / Math.sqrt(ne)) * d;
  let sum = 0;
  for (let j = 1; j <= 100; j += 1) {
    const term = Math.exp(-2 * j * j * lambda * lambda);
    if (!Number.isFinite(term)) break;
    sum += (j % 2 === 1 ? 1 : -1) * term;
    if (term < 1e-18) break;
  }
  return Math.min(1, Math.max(0, 2 * sum));
};

export const twoSampleKs = (a: number[], b: number[]): TwoSampleKsResult | null => {
  const first = a.filter(value => Number.isFinite(value));
  const second = b.filter(value => Number.isFinite(value));
  if (first.length < 2 || second.length < 2) return null;
  const d = ksDistance(first, second);
  if (!(d > 0)) return { n1: first.length, n2: second.length, d: 0, p: 1, method: 'exact' };
  const exact = first.length * second.length <= 200_000;
  return {
    n1: first.length,
    n2: second.length,
    d,
    p: exact
      ? exactUpperTail(first.length, second.length, d)
      : asymptoticP(first.length, second.length, d),
    method: exact ? 'exact' : 'asymptotic',
  };
};
