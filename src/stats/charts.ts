/**
 * Serializable chart data produced by analysis runners.
 *
 * Keeping charts as plain data (instead of React elements) lets the same
 * result cross a Web Worker boundary and be rendered by the main thread.
 */
export interface ChartPoint {
  x: number;
  y: number;
}

export interface ForestPoint {
  label: string;
  estimate: number;
  lo: number;
  hi: number;
}

export interface BarPoint extends ChartPoint {
  label?: string;
}

export interface BarBand {
  y: number;
  color: string;
  dash?: string;
}

export interface ChartSeries {
  label: string;
  color: string;
  points: ChartPoint[];
  dash?: string;
  step?: boolean;
}

export interface ChartMarkers {
  label: string;
  color: string;
  points: ChartPoint[];
  size?: number;
}

export type AnalysisChart =
  | {
      kind: 'forest';
      id: string;
      title: string;
      subtitle?: string;
      note?: string;
      xLabel?: string;
      points: ForestPoint[];
    }
  | {
      kind: 'bar';
      id: string;
      title: string;
      subtitle?: string;
      note?: string;
      xLabel?: string;
      yLabel?: string;
      bars: BarPoint[];
      bands?: BarBand[];
    }
  | {
      kind: 'line';
      id: string;
      title: string;
      subtitle?: string;
      note?: string;
      xLabel?: string;
      yLabel?: string;
      series: ChartSeries[];
      markers?: ChartMarkers[];
    };
