import { invert, numericalHessian, pseudoInverse } from './matrix';

/**
 * Componenti di varianza del GLMM: SE e IC di Wald su scala log.
 *
 * L'informazione è quella osservata del criterio di Laplace rispetto ai
 * parametri non vincolati; la trasformazione ai parametri di varianza è per
 * metodo delta (log sigma^2 = 2 * theta), così gli intervalli restano positivi.
 */

export interface GlmmVarianceComponent {
  component: 'intercept' | 'slope' | 'residual';
  estimate: number;
  se: number;
  lo: number;
  hi: number;
}

export interface GlmmFixedTest {
  term: string;
  chiSquare: number;
  df: number;
  p: number;
}

export interface GlmmVarianceOptions {
  /** Inversa dell'ellittica osservata sui parametri non vincolati, oppure pseudo-inversa. */
  information: number[][];
  size: number;
  interceptIndex: number;
  slopeIndex: number;
  residualIndex: number;
  intercept: number;
  slope: number;
  residual: number;
  critical: number;
}

export const glmmVarianceComponents = (options: GlmmVarianceOptions): GlmmVarianceComponent[] => {
  const { information, size, interceptIndex, slopeIndex, residualIndex, critical } = options;
  if (information.length !== size) return [];
  const varianceOf = (grade: number[]): number => {
    let variance = 0;
    for (let a = 0; a < size; a += 1) {
      for (let b = 0; b < size; b += 1) variance += grade[a] * information[a][b] * grade[b];
    }
    return variance;
  };
  const entry = (
    component: GlmmVarianceComponent['component'],
    estimate: number,
    grade: number[]
  ): GlmmVarianceComponent => {
    const variance = varianceOf(grade);
    const logSe = variance > 0 ? Math.sqrt(variance) : Number.NaN;
    if (!Number.isFinite(logSe) || !(estimate > 0)) {
      return { component, estimate, se: Number.NaN, lo: Number.NaN, hi: Number.NaN };
    }
    return {
      component,
      estimate,
      se: estimate * logSe,
      lo: Math.exp(Math.log(estimate) - critical * logSe),
      hi: Math.exp(Math.log(estimate) + critical * logSe),
    };
  };
  const gradeFor = (position: number): number[] => {
    const grade = new Array<number>(size).fill(0);
    grade[position] += 2;
    if (residualIndex >= 0) grade[residualIndex] += 2;
    return grade;
  };
  const entries: GlmmVarianceComponent[] = [
    entry('intercept', options.intercept, gradeFor(interceptIndex)),
  ];
  if (slopeIndex >= 0) entries.push(entry('slope', options.slope, gradeFor(slopeIndex)));
  if (residualIndex >= 0) {
    const grade = new Array<number>(size).fill(0);
    grade[residualIndex] += 2;
    entries.push(entry('residual', options.residual, grade));
  }
  return entries;
};

export const glmmFixedTests = (
  coefficients: { term: string; z: number; p: number }[]
): GlmmFixedTest[] =>
  coefficients.map(coefficient => ({
    term: coefficient.term,
    chiSquare: coefficient.z * coefficient.z,
    df: 1,
    p: coefficient.p,
  }));

export interface GlmmCoefficient {
  term: string; beta: number; se: number; z: number; p: number; lo: number; hi: number;
}

export interface GlmmRandomEffect {
  group: string; n: number;
  intercept: number; interceptSe: number;
  slope: number; slopeSe: number;
}

export interface GlmmVarianceModelOptions {
  objective: (theta: number[]) => number;
  theta: number[];
  interceptIndex: number;
  slopeIndex: number;
  residualIndex: number;
  intercept: number;
  slope: number;
  residual: number;
  critical: number;
}

export const glmmVarianceFromModel = (options: GlmmVarianceModelOptions): GlmmVarianceComponent[] => {
  const hessian = numericalHessian(options.objective, options.theta);
  const information = invert(hessian) ?? pseudoInverse(hessian);
  return glmmVarianceComponents({
    information,
    size: options.theta.length,
    interceptIndex: options.interceptIndex,
    slopeIndex: options.slopeIndex,
    residualIndex: options.residualIndex,
    intercept: options.intercept,
    slope: options.slope,
    residual: options.residual,
    critical: options.critical,
  });
};
