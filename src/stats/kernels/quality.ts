/**
 * Quality platform kernels: control charts, process capability and Pareto.
 *
 * The formulas are the classic Shewhart ones used by JMP and by the quality
 * literature: subgroup means and ranges for XBar-R, moving ranges for
 * individuals, a fixed λ = 0.2 for EWMA, and Cp/Cpk on the overall standard
 * deviation. Capability is a description of the process, not a test.
 */
import { jStat } from '../jstat';
import type {
  CapabilityResult,
  ControlChartType,
  ControlPoint,
  ControlResult,
  ParetoResult,
} from '../analysisResults';

export type {
  CapabilityResult,
  ControlChartType,
  ControlPoint,
  ControlResult,
  ParetoResult,
} from '../analysisResults';

const D2: Record<number, number> = {
  2: 1.128,
  3: 1.693,
  4: 2.059,
  5: 2.326,
  6: 2.534,
  7: 2.704,
  8: 2.847,
  9: 2.97,
  10: 3.078,
};

const D3: Record<number, number> = {
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0.076,
  8: 0.136,
  9: 0.184,
  10: 0.223,
};

const D4: Record<number, number> = {
  2: 3.267,
  3: 2.574,
  4: 2.282,
  5: 2.114,
  6: 2.004,
  7: 1.924,
  8: 1.864,
  9: 1.816,
  10: 1.777,
};

const mean = (values: number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);

/** Control chart from the raw observations, in the order they appear. */
export const controlChart = (
  values: number[],
  chart: ControlChartType,
  subgroup: number
): ControlResult | null => {
  const clean = values.filter(Number.isFinite);
  if (clean.length < 4) return null;

  if (chart === 'xbar') {
    const size = Math.max(2, Math.min(10, Math.round(subgroup)));
    const groups: number[][] = [];
    for (let start = 0; start + size <= clean.length; start += size) {
      groups.push(clean.slice(start, start + size));
    }
    if (groups.length < 2) return null;
    const means = groups.map(mean);
    const ranges = groups.map(group => Math.max(...group) - Math.min(...group));
    const center = mean(means);
    const rCenter = mean(ranges);
    const sigma = rCenter / (D2[size] ?? 1.128);
    const ucl = center + (3 * sigma) / Math.sqrt(size);
    const lcl = center - (3 * sigma) / Math.sqrt(size);
    const points = means.map((value, index) => ({
      index: index + 1,
      value,
      out: value > ucl || value < lcl,
    }));
    return {
      chart,
      points,
      center,
      sigma,
      ucl,
      lcl,
      limits: [],
      outCount: points.filter(point => point.out).length,
      ranges,
      rCenter,
      rUcl: (D4[size] ?? 0) * rCenter,
      rLcl: (D3[size] ?? 0) * rCenter,
      subgroup: size,
    };
  }

  if (chart === 'ewma') {
    const lambda = 0.2;
    const center = mean(clean);
    const moving = clean.slice(1).map((value, index) => Math.abs(value - clean[index]));
    const sigma = mean(moving) / 1.128;
    let previous = clean[0];
    const points: ControlPoint[] = [];
    const limits: { index: number; ucl: number; lcl: number }[] = [];
    clean.forEach((value, index) => {
      const current = index === 0 ? value : lambda * value + (1 - lambda) * previous;
      previous = current;
      const spread =
        sigma * Math.sqrt((lambda / (2 - lambda)) * (1 - Math.pow(1 - lambda, 2 * (index + 1))));
      const ucl = center + 3 * spread;
      const lcl = center - 3 * spread;
      points.push({ index: index + 1, value: current, out: current > ucl || current < lcl });
      limits.push({ index: index + 1, ucl, lcl });
    });
    return {
      chart,
      points,
      center,
      sigma,
      ucl: center + 3 * sigma,
      lcl: center - 3 * sigma,
      limits,
      outCount: points.filter(point => point.out).length,
      subgroup: 1,
    };
  }

  const moving = clean.slice(1).map((value, index) => Math.abs(value - clean[index]));
  const sigma = mean(moving) / 1.128;
  const center = mean(clean);
  const ucl = center + 3 * sigma;
  const lcl = center - 3 * sigma;
  const points = clean.map((value, index) => ({
    index: index + 1,
    value,
    out: value > ucl || value < lcl,
  }));
  return {
    chart,
    points,
    center,
    sigma,
    ucl,
    lcl,
    limits: [],
    outCount: points.filter(point => point.out).length,
    subgroup: 1,
  };
};

/** Cp/Cpk and the expected share outside the specification limits. */
export const capabilityStats = (
  values: number[],
  lsl: number,
  usl: number,
  target: number
): CapabilityResult | null => {
  const clean = values.filter(Number.isFinite);
  if (clean.length < 3) return null;
  if (!(usl > lsl) || !Number.isFinite(lsl) || !Number.isFinite(usl)) return null;
  const average = mean(clean);
  const sd = jStat.stdev(clean, true);
  if (!(sd > 0)) return null;
  const cpu = (usl - average) / (3 * sd);
  const cpl = (average - lsl) / (3 * sd);
  const cp = (usl - lsl) / (6 * sd);
  const inside = jStat.normal.cdf(usl, average, sd) - jStat.normal.cdf(lsl, average, sd);
  const pctOut = Math.max(0, Math.min(100, (1 - inside) * 100));
  return {
    n: clean.length,
    mean: average,
    sd,
    min: Math.min(...clean),
    max: Math.max(...clean),
    lsl,
    usl,
    target,
    cp,
    cpk: Math.min(cpu, cpl),
    cpu,
    cpl,
    pp: cp,
    ppk: Math.min(cpu, cpl),
    pctOut,
    ppm: pctOut * 10_000,
  };
};

/** Counts by category, sorted from the most to the least frequent. */
export const paretoCounts = (labels: string[]): ParetoResult | null => {
  const counts = new Map<string, number>();
  labels.forEach(label => {
    const key = label.trim();
    if (key === '') return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  if (counts.size === 0) return null;
  const total = Array.from(counts.values()).reduce((sum, value) => sum + value, 0);
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  let running = 0;
  const rows = sorted.map(([category, count]) => {
    running += count;
    return {
      category,
      count,
      pct: total > 0 ? (count / total) * 100 : 0,
      cumulative: total > 0 ? (running / total) * 100 : 0,
    };
  });
  return { rows, total };
};
