export interface RmAnovaResult {
  n: number;
  k: number;
  means: number[];
  sds: number[];
  ssConditions: number;
  ssSubjects: number;
  ssError: number;
  ssTotal: number;
  dfConditions: number;
  dfError: number;
  msConditions: number;
  msError: number;
  f: number;
  p: number;
  partialEta2: number;
  generalizedEta2: number;
  mauchlyW: number;
  mauchlyChi2: number;
  mauchlyDf: number;
  mauchlyP: number;
  ggEpsilon: number;
  hfEpsilon: number;
  pGG: number;
  pHF: number;
}
