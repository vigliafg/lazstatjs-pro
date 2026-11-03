import { chi2SF, tCrit, tSF, zCrit } from './distributions';

export interface MetaStudy {
  label: string;
  effect: number;
  se: number;
}

export interface MetaStudyRow {
  label: string;
  effect: number;
  se: number;
  weight: number;
  lo: number;
  hi: number;
  standardizedResidual: number;
}

export interface MetaResult {
  method: 'DL' | 'REML' | 'FE';
  k: number;
  fixed: { estimate: number; se: number; z: number; p: number; lo: number; hi: number };
  random: { estimate: number; se: number; z: number; p: number; lo: number; hi: number } | null;
  tau2: number;
  tau: number;
  q: number;
  qDf: number;
  qP: number;
  i2: number;
  h2: number;
  prediction: { lo: number; hi: number } | null;
  egger: { intercept: number; se: number; t: number; p: number } | null;
  studies: MetaStudyRow[];
  leaveOneOut: { label: string; estimate: number }[];
}

const pooled = (studies: readonly MetaStudy[], tau2: number, level: number) => {
  const weights = studies.map(study => 1 / (study.se ** 2 + tau2));
  const total = weights.reduce((sum, value) => sum + value, 0);
  const estimate = studies.reduce(
    (sum, study, index) => sum + weights[index] * study.effect,
    0
  ) / total;
  const se = Math.sqrt(1 / total);
  const z = se > 0 ? estimate / se : NaN;
  // metafor reports the pooled interval on the normal scale (test = "z").
  const crit = zCrit(level);
  return {
    estimate,
    se,
    z,
    p: Number.isFinite(z) ? 2 * (1 - Math.abs(0.5 + 0.5 * erf(Math.abs(z) / Math.SQRT2))) : NaN,
    lo: estimate - crit * se,
    hi: estimate + crit * se,
  };
};

// Abramowitz–Stegun error function: enough precision for a two-sided p in
// the normal range and avoids importing a second distribution helper here.
const erf = (x: number): number => {
  const sign = x < 0 ? -1 : 1;
  const value = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * value);
  const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  return sign * (1 - poly * Math.exp(-value * value));
};

const remlTau2 = (studies: readonly MetaStudy[]): number => {
  const objective = (tau2: number): number => {
    const weights = studies.map(study => 1 / (study.se ** 2 + tau2));
    const total = weights.reduce((sum, value) => sum + value, 0);
    const mean = studies.reduce(
      (sum, study, index) => sum + weights[index] * study.effect,
      0
    ) / total;
    const deviance = studies.reduce(
      (sum, study, index) => sum + weights[index] * (study.effect - mean) ** 2,
      0
    );
    return (
      studies.reduce((sum, study) => sum + Math.log(study.se ** 2 + tau2), 0) +
      Math.log(total) +
      deviance
    );
  };
  const upper = Math.max(
    1e-3,
    studies.reduce((sum, study) => sum + study.se ** 2, 0) * 4
  );
  let best = 0;
  let bestValue = objective(0);
  const steps = 200;
  for (let step = 1; step <= steps; step += 1) {
    const tau2 = (upper * step) / steps;
    const value = objective(tau2);
    if (value < bestValue) {
      bestValue = value;
      best = tau2;
    }
  }
  // Refine around the best grid point with a golden-section search.
  const width = upper / steps;
  let low = Math.max(0, best - width);
  let high = Math.min(upper, best + width);
  const phi = (Math.sqrt(5) - 1) / 2;
  for (let iteration = 0; iteration < 60; iteration += 1) {
    const a = high - phi * (high - low);
    const b = low + phi * (high - low);
    if (objective(a) < objective(b)) high = b;
    else low = a;
  }
  return Math.max(0, (low + high) / 2);
};

const weightedEgger = (
  studies: readonly MetaStudy[]
): { intercept: number; se: number; t: number; p: number } | null => {
  if (studies.length < 3) return null;
  const weights = studies.map(study => 1 / study.se ** 2);
  const total = weights.reduce((sum, value) => sum + value, 0);
  const meanX = studies.reduce((sum, study, index) => sum + weights[index] * study.se, 0) / total;
  const meanY = studies.reduce((sum, study, index) => sum + weights[index] * study.effect, 0) / total;
  const sxx = studies.reduce(
    (sum, study, index) => sum + weights[index] * (study.se - meanX) ** 2,
    0
  );
  const sxy = studies.reduce(
    (sum, study, index) => sum + weights[index] * (study.se - meanX) * (study.effect - meanY),
    0
  );
  const slope = sxx > 0 ? sxy / sxx : NaN;
  const intercept = meanY - slope * meanX;
  const residual = studies.map(
    (study, index) => study.effect - (intercept + slope * study.se)
  );
  const sse = residual.reduce(
    (sum, value, index) => sum + weights[index] * value ** 2,
    0
  );
  const df = studies.length - 2;
  const mse = sse / Math.max(1, df);
  const se = Math.sqrt(mse * (1 / total + meanX ** 2 / (sxx || 1)));
  const t = se > 0 ? intercept / se : NaN;
  return { intercept, se, t, p: tSF(t, df) * 2 };
};

export const metaAnalysis = (
  studiesInput: readonly MetaStudy[],
  method: 'DL' | 'REML' | 'FE',
  level: number,
  withEgger = true
): MetaResult | null => {
  const studies = studiesInput.filter(
    study => Number.isFinite(study.effect) && Number.isFinite(study.se) && study.se > 0
  );
  if (studies.length < 2) return null;
  const k = studies.length;
  const fixedWeights = studies.map(study => 1 / study.se ** 2);
  const totalFixed = fixedWeights.reduce((sum, value) => sum + value, 0);
  const fixedEstimate = studies.reduce(
    (sum, study, index) => sum + fixedWeights[index] * study.effect,
    0
  ) / totalFixed;
  const q = studies.reduce(
    (sum, study, index) => sum + fixedWeights[index] * (study.effect - fixedEstimate) ** 2,
    0
  );
  const qDf = k - 1;
  const qP = chi2SF(q, qDf);
  const i2 = q > 0 ? Math.max(0, (q - qDf) / q) : 0;
  const h2 = qDf > 0 ? q / qDf : NaN;

  let tau2 = 0;
  if (method === 'DL') {
    const denominator = totalFixed - fixedWeights.reduce((sum, value) => sum + value ** 2, 0) / totalFixed;
    tau2 = denominator > 0 ? Math.max(0, (q - qDf) / denominator) : 0;
  } else if (method === 'REML') {
    tau2 = remlTau2(studies);
  }

  const fixed = pooled(studies, 0, level);
  const random = method === 'FE' ? null : pooled(studies, tau2, level);
  const usedTau2 = method === 'FE' ? 0 : tau2;
  const usedWeights = studies.map(study => 1 / (study.se ** 2 + usedTau2));
  const totalUsed = usedWeights.reduce((sum, value) => sum + value, 0);
  const usedEstimate = random?.estimate ?? fixed.estimate;
  const predictionSe = Math.sqrt(usedTau2 + (random?.se ?? 0) ** 2);
  const prediction =
    method === 'FE' || k < 3
      ? null
      : {
          lo: usedEstimate - zCrit(level) * predictionSe,
          hi: usedEstimate + zCrit(level) * predictionSe,
        };

  const studyRows: MetaStudyRow[] = studies.map((study, index) => {
    const weight = usedWeights[index] / totalUsed;
    const seUsed = Math.sqrt(study.se ** 2 + usedTau2);
    return {
      label: study.label,
      effect: study.effect,
      se: study.se,
      weight: weight * 100,
      lo: study.effect - tCrit(level, Math.max(1, k - 1)) * study.se,
      hi: study.effect + tCrit(level, Math.max(1, k - 1)) * study.se,
      standardizedResidual: seUsed > 0 ? (study.effect - usedEstimate) / seUsed : NaN,
    };
  });

  const leaveOneOut = studies.map((_, omitted) => {
    const kept = studies.filter((__, index) => index !== omitted);
    const result = pooled(kept, usedTau2, level);
    return { label: studies[omitted].label, estimate: result.estimate };
  });

  return {
    method,
    k,
    fixed,
    random,
    tau2: usedTau2,
    tau: Math.sqrt(usedTau2),
    q,
    qDf,
    qP,
    i2,
    h2,
    prediction,
    egger: withEgger ? weightedEgger(studies) : null,
    studies: studyRows,
    leaveOneOut,
  };
};
