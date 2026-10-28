export type TostDesign = 'one' | 'paired' | 'ind';

export interface TostKernelOptions {
  design: TostDesign;
  rows: readonly (readonly string[])[];
  var1: number;
  var2: number;
  mu: number;
  margin: number;
  equalVar: boolean;
  level: number;
}

export interface TostStats {
  design: TostDesign;
  n: number;
  meanA: number;
  meanB: number;
  sdA: number;
  sdB: number;
  diff: number;
  se: number;
  df: number;
  crit: number;
  margin: number;
  alpha: number;
  ciLo: number;
  ciHi: number;
  tLower: number;
  pLower: number;
  tUpper: number;
  pUpper: number;
  pTost: number;
  equivalent: boolean;
}

