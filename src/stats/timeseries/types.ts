export interface TimeSeriesOptions {
  values: number[];
  /** Seasonal period (0 or 1 = no seasonality). */
  period: number;
  horizon: number;
  level?: number;
}

export interface AcfPoint {
  lag: number;
  acf: number;
  pacf: number;
}
