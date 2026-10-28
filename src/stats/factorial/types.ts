export interface FactorialTablesOptions {
  response: number[];
  factorA: string[];
  factorB: string[];
  responseName: string;
  aName: string;
  bName: string;
  level: number;
  interaction: boolean;
}

export interface FactorialCell {
  a: string;
  b: string;
  n: number;
  mean: number;
  sd: number;
}
