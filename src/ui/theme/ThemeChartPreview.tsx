import type { ThemeDefinition } from '../../theme';

const WIDTH = 320;
const HEIGHT = 150;
const LEFT = 30;
const TOP = 18;
const RIGHT = 306;
const BOTTOM = 122;

const l1 = [58, 62, 60, 68, 66, 74, 72];
const l2 = [48, 51, 55, 54, 60, 62, 66];

const points = (values: number[]): string =>
  values
    .map((value, index) => {
      const x = LEFT + (index * (RIGHT - LEFT)) / (values.length - 1);
      const y = BOTTOM - ((value - 40) / 40) * (BOTTOM - TOP);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

/** A small real-looking chart drawn with the draft chart tokens. */
export const ThemeChartPreview = ({ theme }: { theme: ThemeDefinition }) => {
  const { chart } = theme;
  const palette = chart.palette;
  const first = palette[0] ?? chart.text;
  const second = palette[2] ?? chart.muted;
  const ticks = ['0', '20', '40', '60', '80'];
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Chart theme preview"
      data-theme-chart-preview
      className="w-full rounded border border-border2"
      style={{ background: chart.background }}
    >
      <rect x={0} y={0} width={WIDTH} height={HEIGHT} rx={4} fill={chart.background} />
      {ticks.map((tick, index) => {
        const y = BOTTOM - (index / (ticks.length - 1)) * (BOTTOM - TOP);
        return (
          <g key={tick}>
            <line
              x1={LEFT}
              x2={RIGHT}
              y1={y}
              y2={y}
              stroke={chart.grid}
              strokeWidth={1}
              strokeDasharray={index === 0 ? undefined : '3 3'}
            />
            <text
              x={LEFT - 5}
              y={y + 3}
              textAnchor="end"
              fill={chart.muted}
              fontSize={7}
              fontFamily="inherit"
            >
              {tick}
            </text>
          </g>
        );
      })}
      <line x1={LEFT} x2={LEFT} y1={TOP} y2={BOTTOM} stroke={chart.axis} strokeWidth={1} />
      <line x1={LEFT} x2={RIGHT} y1={BOTTOM} y2={BOTTOM} stroke={chart.axis} strokeWidth={1} />
      <text x={LEFT} y={11} fill={chart.text} fontSize={9} fontWeight={600} fontFamily="inherit">
        Score
      </text>
      <polyline points={points(l1)} fill="none" stroke={first} strokeWidth={2} />
      <polyline
        points={points(l2)}
        fill="none"
        stroke={second}
        strokeWidth={2}
        strokeDasharray="4 3"
      />
      {l1.map((value, index) => {
        const x = LEFT + (index * (RIGHT - LEFT)) / (l1.length - 1);
        const y = BOTTOM - ((value - 40) / 40) * (BOTTOM - TOP);
        return <circle key={`a-${index}`} cx={x} cy={y} r={2.5} fill={first} />;
      })}
      {l2.map((value, index) => {
        const x = LEFT + (index * (RIGHT - LEFT)) / (l2.length - 1);
        const y = BOTTOM - ((value - 40) / 40) * (BOTTOM - TOP);
        return <rect key={`b-${index}`} x={x - 2} y={y - 2} width={4} height={4} fill={second} />;
      })}
      <g transform={`translate(${RIGHT - 86}, 8)`}>
        {palette.slice(0, 5).map((colour, index) => (
          <circle key={`${colour}-${index}`} cx={index * 14} cy={0} r={3} fill={colour} />
        ))}
        <text x={0} y={12} fill={chart.muted} fontSize={7} fontFamily="inherit">
          A · B · C · D · E
        </text>
      </g>
    </svg>
  );
};
