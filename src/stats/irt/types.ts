export type IrtModel = '2pl' | 'rasch';

export interface IrtItem {
  variable: string;
  discrimination: number;
  difficulty: number;
  seDiscrimination: number;
  seDifficulty: number;
  pCorrect: number;
}

export interface IrtPerson {
  row: number;
  theta: number;
  se: number;
  total: number;
}

export interface IrtResult {
  model: IrtModel;
  n: number;
  items: IrtItem[];
  persons: IrtPerson[];
  logLik: number;
  parameters: number;
  aic: number;
  bic: number;
  reliability: number;
  iterations: number;
  converged: boolean;
  thetaGrid: number[];
  testInformation: number[];
}
