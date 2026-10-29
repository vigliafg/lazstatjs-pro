import type { ChartOptions, CommonChartOptions } from '../../stats/charts';
import { activeTheme } from '../../theme/runtime';

export interface ChartTheme {
  background: string;
  surface: string;
  text: string;
  muted: string;
  grid: string;
  axis: string;
  palette: readonly string[];
  mono: boolean;
  font: string;
}

export const DARK_BACKGROUND = '#0d0f14';
export const LIGHT_BACKGROUND = '#ffffff';

const FONT = '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif';

const PALETTES: Record<CommonChartOptions['palette'], readonly string[]> = {
  default: ['#4f9cf9', '#34d399', '#fbbf24', '#a78bfa', '#f87171', '#38bdf8'],
  colorblind: ['#0072B2', '#009E73', '#E69F00', '#CC79A7', '#56B4E9', '#D55E00'],
  mono: ['#cbd5e1', '#94a3b8', '#64748b', '#e2e8f0', '#475569', '#334155'],
};

/** The original light/dark chart palettes, used when the card picks a mode
 * that does not match the active interface theme. */
const FALLBACK = {
  dark: {
    background: DARK_BACKGROUND,
    surface: '#161a22',
    text: '#e2e8f0',
    muted: '#94a3b8',
    grid: '#2a2f3f',
    axis: '#343a50',
  },
  light: {
    background: LIGHT_BACKGROUND,
    surface: '#f8fafc',
    text: '#0f172a',
    muted: '#475569',
    grid: '#e2e8f0',
    axis: '#cbd5e1',
  },
} as const;

/**
 * Palette for a card. `default` follows the active interface theme when the
 * card's dark/light mode matches it; explicit palettes stay independent.
 */
export const paletteFor = (options: CommonChartOptions): readonly string[] => {
  if (options.palette === 'default') {
    const theme = activeTheme();
    if (theme.mode === options.theme) return theme.chart.palette;
  }
  return PALETTES[options.palette] ?? PALETTES.default;
};

export const colorAt = (options: CommonChartOptions, index: number): string => {
  const palette = paletteFor(options);
  return palette[index % palette.length];
};

/** Theme resolved from the card options; the builder and export use the same. */
export const themeFor = (options: CommonChartOptions): ChartTheme => {
  const fallback = FALLBACK[options.theme];
  const ui = activeTheme();
  const themed = ui.mode === options.theme ? ui.chart : null;
  return {
    background: themed?.background ?? fallback.background,
    surface: themed?.surface ?? fallback.surface,
    text: themed?.text ?? fallback.text,
    muted: themed?.muted ?? fallback.muted,
    grid: themed?.grid ?? fallback.grid,
    axis: themed?.axis ?? fallback.axis,
    palette: paletteFor(options),
    mono: options.palette === 'mono',
    font: FONT,
  };
};

export const chartSurfaceBackground = (options: ChartOptions): string =>
  themeFor(options).background;
