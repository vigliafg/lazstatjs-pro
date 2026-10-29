import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
} from 'victory';
import type { FC, ReactNode } from 'react';
import type { AnalysisChart, BarBand, ChartSeries } from '../stats/charts';

const AXIS_STYLE = {
  axis: { stroke: '#333' },
  axisLabel: { fill: '#888', fontSize: 10, padding: 32 },
  tickLabels: { fill: '#888', fontSize: 9 },
  grid: { stroke: '#222' },
};

const finite = (value: number): boolean => Number.isFinite(value);

const ChartFrame = ({
  title,
  subtitle,
  note,
  height,
  children,
}: {
  title: string;
  subtitle?: string;
  note?: string;
  height: number;
  children: ReactNode;
}) => (
  <section className="mb-6">
    <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-accent2">{title}</h3>
      {subtitle && <span className="font-mono text-[10px] text-text3">{subtitle}</span>}
    </div>
    <div className="w-full rounded bg-surface3/30 p-2" style={{ height }}>
      {children}
    </div>
    {note && <p className="mt-1 text-[10px] text-text3">{note}</p>}
  </section>
);

const ForestChart: FC<{ chart: Extract<AnalysisChart, { kind: 'forest' }> }> = ({ chart }) => {
  const points = chart.points.filter(
    point => finite(point.estimate) && finite(point.lo) && finite(point.hi)
  );
  if (points.length === 0) return <ChartFrame title={chart.title} note={chart.note} height={120}>{null}</ChartFrame>;
  const values = points.flatMap(point => [point.lo, point.hi, point.estimate]);
  const low = Math.min(1, ...values);
  const high = Math.max(1, ...values);
  const span = high > low ? high - low : Math.max(0.5, Math.abs(high) * 0.2);
  const yOf = (index: number): number => points.length - 1 - index;
  return (
    <ChartFrame title={chart.title} subtitle={chart.subtitle} note={chart.note} height={260}>
      <VictoryChart
        theme={VictoryTheme.material}
        padding={{ top: 15, bottom: 55, left: 120, right: 30 }}
        domain={{ x: [low - span * 0.08, high + span * 0.08], y: [-0.5, points.length - 0.5] }}
      >
        <VictoryAxis label={chart.xLabel ?? 'Hazard ratio'} style={AXIS_STYLE} />
        <VictoryAxis
          dependentAxis
          tickValues={points.map((_, index) => yOf(index))}
          tickFormat={value => points[points.length - 1 - Number(value)]?.label ?? ''}
          style={{ ...AXIS_STYLE, grid: { stroke: 'transparent' } }}
        />
        <VictoryLine
          data={[
            { x: 1, y: -0.5 },
            { x: 1, y: points.length - 0.5 },
          ]}
          style={{ data: { stroke: '#f87171', strokeDasharray: '4,4', strokeWidth: 1 } }}
        />
        {points.map((point, index) => (
          <VictoryLine
            key={`ci-${point.label}-${index}`}
            data={[
              { x: point.lo, y: yOf(index) },
              { x: point.hi, y: yOf(index) },
            ]}
            style={{ data: { stroke: '#4f9cf9', strokeWidth: 2 } }}
          />
        ))}
        <VictoryScatter
          data={points.map((point, index) => ({ x: point.estimate, y: yOf(index) }))}
          style={{ data: { fill: '#fbbf24', size: 4 } }}
        />
      </VictoryChart>
    </ChartFrame>
  );
};

const BandLines = ({ bands, minX, maxX }: { bands: BarBand[]; minX: number; maxX: number }) => (
  <>
    {bands.map((band, index) => (
      <VictoryLine
        key={`band-${index}`}
        data={[
          { x: minX, y: band.y },
          { x: maxX, y: band.y },
        ]}
        style={{
          data: {
            stroke: band.color,
            strokeDasharray: band.dash ?? '4,4',
            strokeWidth: 1,
          },
        }}
      />
    ))}
  </>
);

const BarChart: FC<{ chart: Extract<AnalysisChart, { kind: 'bar' }> }> = ({ chart }) => {
  const bars = chart.bars.filter(bar => finite(bar.x) && finite(bar.y));
  if (bars.length === 0) {
    return (
      <ChartFrame title={chart.title} subtitle={chart.subtitle} note={chart.note} height={120}>
        {null}
      </ChartFrame>
    );
  }
  const minX = Math.min(...bars.map(bar => bar.x));
  const maxX = Math.max(...bars.map(bar => bar.x));
  const pad = Math.max(0.5, (maxX - minX) * 0.05);
  return (
    <ChartFrame title={chart.title} subtitle={chart.subtitle} note={chart.note} height={240}>
      <VictoryChart
        theme={VictoryTheme.material}
        padding={{ top: 15, bottom: 45, left: 55, right: 20 }}
        domain={{ x: [minX - pad, maxX + pad] }}
      >
        <VictoryAxis
          label={chart.xLabel}
          tickValues={bars.map(bar => bar.x)}
          tickFormat={value => bars.find(bar => bar.x === Number(value))?.label ?? String(value)}
          style={AXIS_STYLE}
        />
        <VictoryAxis dependentAxis label={chart.yLabel} style={AXIS_STYLE} />
        <BandLines bands={chart.bands ?? []} minX={minX - pad} maxX={maxX + pad} />
        <VictoryBar data={bars} style={{ data: { fill: '#4f9cf9' } }} barRatio={0.6} />
      </VictoryChart>
    </ChartFrame>
  );
};

const LineSeries: FC<{ series: ChartSeries }> = ({ series }) => (
  <VictoryLine
    data={series.points.filter(point => finite(point.x) && finite(point.y))}
    interpolation={series.step ? 'stepAfter' : undefined}
    style={{
      data: {
        stroke: series.color,
        strokeWidth: 2,
        ...(series.dash ? { strokeDasharray: series.dash } : {}),
      },
    }}
  />
);

const LineChart: FC<{ chart: Extract<AnalysisChart, { kind: 'line' }> }> = ({ chart }) => (
  <ChartFrame title={chart.title} subtitle={chart.subtitle} note={chart.note} height={300}>
    <VictoryChart
      theme={VictoryTheme.material}
      padding={{ top: 15, bottom: 50, left: 65, right: 25 }}
    >
      <VictoryAxis label={chart.xLabel} style={AXIS_STYLE} />
      <VictoryAxis dependentAxis label={chart.yLabel} style={AXIS_STYLE} />
      {chart.series.map(series => (
        <LineSeries key={series.label} series={series} />
      ))}
      {(chart.markers ?? []).map(markers => (
        <VictoryScatter
          key={markers.label}
          data={markers.points.filter(point => finite(point.x) && finite(point.y))}
          style={{ data: { fill: markers.color, size: markers.size ?? 2 } }}
        />
      ))}
    </VictoryChart>
  </ChartFrame>
);

/** Renders serializable charts; unknown kinds are ignored defensively. */
export const AnalysisCharts = ({ charts }: { charts?: AnalysisChart[] }) => {
  if (!charts || charts.length === 0) return null;
  return (
    <>
      {charts.map(chart => {
        if (chart.kind === 'forest') return <ForestChart key={chart.id} chart={chart} />;
        if (chart.kind === 'bar') return <BarChart key={chart.id} chart={chart} />;
        if (chart.kind === 'line') return <LineChart key={chart.id} chart={chart} />;
        return null;
      })}
    </>
  );
};
