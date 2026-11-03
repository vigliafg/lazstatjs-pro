export interface ReliabilityGrowthPoint {
  time: number;
  observed: number;
  fitted: number;
}

export interface ReliabilityGrowth {
  beta: number;
  lambda: number;
  n: number;
  lastTime: number;
  /** Cumulative MTBF at the last observation. */
  mtbfCumulative: number;
  /** Instantaneous MTBF at the last observation. */
  mtbfInstantaneous: number;
  /** 1 - beta: positive means the failure rate is decreasing. */
  growthRate: number;
  logLik: number;
  aic: number;
  points: ReliabilityGrowthPoint[];
}

export interface ReliabilityStage {
  index: number;
  reliabilities: number[];
  reliability: number;
  unreliability: number;
}

export interface ReliabilityBlockDiagram {
  stages: ReliabilityStage[];
  system: number;
  systemUnreliability: number;
}

export interface ReliabilityResult {
  mode: 'growth' | 'rbd';
  growth?: ReliabilityGrowth;
  rbd?: ReliabilityBlockDiagram;
  warnings: string[];
}
