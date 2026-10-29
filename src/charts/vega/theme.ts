import type { ChartOptions, CommonChartOptions } from '../../stats/charts';

export interface ChartTheme {
  background: string;
  surface: string;
  text: string;
  muted: string;
  grid: string;
  axis: string;
  palette: string[];
  mono: boolean;
  font: string;
}

export const DARK_BACKGROUND = '#0d0f14';
export const LIGHT_BACKGROUND = '#ffffff';

const FONT = '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif';

const PALETTES: Record<CommonChartOptions['palette'], string[]> = {
  default: ['#4f9cf9', '#34d399', '#fbbf24', '#a78bfa', '#f87171', '#38bdf8'],
  colorblind: ['#0072B2', '#009E73', '#E69F00', '#CC79A7', '#56B4E9', '#D55E00'],
  mono: ['#cbd5e1', '#94a3b8', '#64748b', '#e2e8f0', '#475569', '#334155'],
};

export const paletteFor = (options: CommonChartOptions): string[] =>
  PALETTES[options.palette] ?? PALETTES.default;

export const colorAt = (options: CommonChartOptions, index: number): string => {
  const palette = paletteFor(options);
  return palette[index % palette.length];
};

/** Theme resolved from the card options; the builder and export use the same. */
export const themeFor = (options: CommonChartOptions): ChartTheme => {
  const light = options.theme === 'light';
  return {
    background: light ? LIGHT_BACKGROUND : DARK_BACKGROUND,
    surface: light ? '#f8fafc' : '#161a22',
    text: light ? '#0f172a' : '#e2e8f0',
    muted: light ? '#475569' : '#94a3b8',
    grid: light ? '#e2e8f0' : '#2a2f3f',
    axis: light ? '#cbd5e1' : '#343a50',
    palette: paletteFor(options),
    mono: options.palette === 'mono',
    font: FONT,
  };
};

export const chartSurfaceBackground = (options: ChartOptions): string =>
  themeFor(options).background;
