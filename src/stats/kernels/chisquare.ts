import { chi2SF, bootstrapCI, zCrit } from '../distributions';
import { calcFisherExact } from './index';

export interface ChiSquareStats {
  r1: number;
  r2: number;
  c1: number;
  c2: number;
  n: number;
  e11: number;
  e12: number;
  e21: number;
  e22: number;
  chi2: number;
  chi2Yates: number;
  g2: number;
  pPearson: number;
  pYates: number;
  pG2: number;
  pFisher: number;
  phi: number;
  cramersV: number;
  rowProp1: number;
  rowProp2: number;
  colProp1: number;
  colProp2: number;
  oddsRatio: number;
  orLo: number;
  orHi: number;
  relativeRisk: number;
  rrLo: number;
  rrHi: number;
  riskDiff: number;
  seRD: number;
  crit: number;
  minExpected: number;
  lowCells: number;
  phiLo: number;
  phiHi: number;
}

/** Statistiche e misure di associazione per una tabella 2×2. */
export const chiSquareStats = (
  o11: number,
  o12: number,
  o21: number,
  o22: number,
  level: number,
  runFisher: boolean
): ChiSquareStats | null => {
  const r1 = o11 + o12;
  const r2 = o21 + o22;
  const c1 = o11 + o21;
  const c2 = o12 + o22;
  const n = r1 + r2;
  if (n === 0) return null;

  const e11 = (r1 * c1) / n;
  const e12 = (r1 * c2) / n;
  const e21 = (r2 * c1) / n;
  const e22 = (r2 * c2) / n;
  if ([e11, e12, e21, e22].some(value => value <= 0)) return null;

  const contribution = (observed: number, expected: number) =>
    Math.pow(observed - expected, 2) / expected;

  const chi2 =
    contribution(o11, e11) +
    contribution(o12, e12) +
    contribution(o21, e21) +
    contribution(o22, e22);

  const yatesTerm = (observed: number, expected: number) =>
    Math.pow(Math.max(0, Math.abs(observed - expected) - 0.5), 2) / expected;
  const chi2Yates =
    yatesTerm(o11, e11) + yatesTerm(o12, e12) + yatesTerm(o21, e21) + yatesTerm(o22, e22);

  const g2 = 2 * [o11, o12, o21, o22].reduce(
    (sum, observed, index) => {
      const expected = [e11, e12, e21, e22][index];
      return sum + (observed > 0 ? observed * Math.log(observed / expected) : 0);
    },
    0
  );

  const pPearson = chi2SF(chi2, 1);
  const pYates = chi2SF(chi2Yates, 1);
  const pG2 = chi2SF(g2, 1);
  const pFisher = runFisher ? calcFisherExact(o11, o12, o21, o22) : NaN;

  const phi = Math.sqrt(chi2 / n);
  const cramersV = Math.sqrt(chi2 / (n * Math.min(1, 1)));
  const rowProp1 = r1 / n;
  const rowProp2 = r2 / n;
  const colProp1 = c1 / n;
  const colProp2 = c2 / n;

  const logOR = (o11 > 0 && o12 > 0 && o21 > 0 && o22 > 0)
    ? Math.log((o11 * o22) / (o12 * o21))
    : NaN;
  const seLogOR = (o11 > 0 && o12 > 0 && o21 > 0 && o22 > 0)
    ? Math.sqrt(1 / o11 + 1 / o12 + 1 / o21 + 1 / o22)
    : NaN;
  const crit = zCrit(level);
  const oddsRatio = isFinite(logOR) ? Math.exp(logOR) : NaN;
  const orLo = isFinite(logOR) ? Math.exp(logOR - crit * seLogOR) : NaN;
  const orHi = isFinite(logOR) ? Math.exp(logOR + crit * seLogOR) : NaN;

  const risk1 = r1 > 0 ? o11 / r1 : NaN;
  const risk2 = r2 > 0 ? o21 / r2 : NaN;
  const relativeRisk = risk2 > 0 ? risk1 / risk2 : NaN;
  const seLogRR = (o11 > 0 && o21 > 0 && r1 > 0 && r2 > 0)
    ? Math.sqrt(1 / o11 - 1 / r1 + 1 / o21 - 1 / r2)
    : NaN;
  const rrLo = isFinite(relativeRisk) && isFinite(seLogRR)
    ? Math.exp(Math.log(relativeRisk) - crit * seLogRR)
    : NaN;
  const rrHi = isFinite(relativeRisk) && isFinite(seLogRR)
    ? Math.exp(Math.log(relativeRisk) + crit * seLogRR)
    : NaN;

  const riskDiff = risk1 - risk2;
  const seRD = Math.sqrt(
    (risk1 * (1 - risk1)) / r1 + (risk2 * (1 - risk2)) / r2
  );

  const minExpected = Math.min(e11, e12, e21, e22);
  const lowCells = [e11, e12, e21, e22].filter(value => value < 5).length;

  const population: number[] = [];
  [o11, o12, o21, o22].forEach((count, cellIndex) => {
    for (let i = 0; i < count; i++) population.push(cellIndex);
  });
  const phiCI = bootstrapCI(rnd => {
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < n; i++) counts[population[Math.floor(rnd() * population.length)]]++;
    const cr1 = counts[0] + counts[1];
    const cr2 = counts[2] + counts[3];
    const cc1 = counts[0] + counts[2];
    const cc2 = counts[1] + counts[3];
    const expected = [cr1 * cc1 / n, cr1 * cc2 / n, cr2 * cc1 / n, cr2 * cc2 / n];
    if (expected.some(value => value <= 0)) return NaN;
    const bootChi2 = counts.reduce(
      (sum, observed, index) => sum + Math.pow(observed - expected[index], 2) / expected[index],
      0
    );
    return Math.sqrt(bootChi2 / n);
  }, level, 500);

  return {
    r1, r2, c1, c2, n, e11, e12, e21, e22,
    chi2, chi2Yates, g2, pPearson, pYates, pG2, pFisher,
    phi, cramersV, rowProp1, rowProp2, colProp1, colProp2,
    oddsRatio, orLo, orHi, relativeRisk, rrLo, rrHi, riskDiff, seRD, crit,
    minExpected, lowCells, phiLo: phiCI.lo, phiHi: phiCI.hi,
  };
};
