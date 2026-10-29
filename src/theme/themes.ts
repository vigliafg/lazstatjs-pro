/**
 * UI theme registry.
 *
 * Every theme is a complete set of semantic colours consumed by the Tailwind
 * `@theme` variables in `index.css`. The chart block keeps the Vega renderer in
 * sync with the selected interface without changing each card's own options:
 * a card still chooses dark or light, and the active theme supplies the shades
 * for that mode.
 *
 * Names are product names and intentionally not translated; only the sections
 * and labels around them go through i18n.
 */
export type ThemeMode = 'dark' | 'light';

export interface ThemeTokens {
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  border: string;
  border2: string;
  accent: string;
  accent2: string;
  /** Text/icon colour on an accent-filled control. */
  onAccent: string;
  onAccent2: string;
  green: string;
  yellow: string;
  red: string;
  purple: string;
  text: string;
  text2: string;
  text3: string;
}

export interface ThemeChartTokens {
  background: string;
  surface: string;
  text: string;
  muted: string;
  grid: string;
  axis: string;
  palette: readonly string[];
}

export interface ThemeDefinition {
  id: string;
  /** Product name shown in the picker; not translated. */
  name: string;
  mode: ThemeMode;
  tokens: ThemeTokens;
  chart: ThemeChartTokens;
}

export const THEMES = [
  {
    id: 'one-dark-pro',
    name: 'One Dark Pro',
    mode: 'dark',
    tokens: {
      bg: '#282c34',
      surface: '#21252b',
      surface2: '#2c313a',
      surface3: '#333842',
      border: '#3e4451',
      border2: '#4b5263',
      accent: '#61afef',
      accent2: '#56b6c2',
      onAccent: '#282c34',
      onAccent2: '#282c34',
      green: '#98c379',
      yellow: '#e5c07b',
      red: '#e06c75',
      purple: '#c678dd',
      text: '#d7dae0',
      text2: '#b6bdc9',
      text3: '#9aa2b1',
    },
    chart: {
      background: '#282c34',
      surface: '#21252b',
      text: '#d7dae0',
      muted: '#b6bdc9',
      grid: '#3e4451',
      axis: '#4b5263',
      palette: ['#61afef', '#98c379', '#e5c07b', '#c678dd', '#e06c75', '#56b6c2'],
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    mode: 'dark',
    tokens: {
      bg: '#282a36',
      surface: '#21222c',
      surface2: '#343746',
      surface3: '#424450',
      border: '#4a4d5e',
      border2: '#6272a4',
      accent: '#bd93f9',
      accent2: '#8be9fd',
      onAccent: '#282a36',
      onAccent2: '#282a36',
      green: '#50fa7b',
      yellow: '#f1fa8c',
      red: '#ff5555',
      purple: '#ff79c6',
      text: '#f8f8f2',
      text2: '#d0d3e0',
      text3: '#b3b8cc',
    },
    chart: {
      background: '#282a36',
      surface: '#21222c',
      text: '#f8f8f2',
      muted: '#d0d3e0',
      grid: '#4a4d5e',
      axis: '#6272a4',
      palette: ['#bd93f9', '#50fa7b', '#f1fa8c', '#ff79c6', '#8be9fd', '#ffb86c'],
    },
  },
  {
    id: 'monokai',
    name: 'Monokai',
    mode: 'dark',
    tokens: {
      bg: '#272822',
      surface: '#1e1f1c',
      surface2: '#31322c',
      surface3: '#3e3d32',
      border: '#49483e',
      border2: '#5b5a4d',
      accent: '#66d9ef',
      accent2: '#a6e22e',
      onAccent: '#272822',
      onAccent2: '#272822',
      green: '#a6e22e',
      yellow: '#e6db74',
      red: '#f92672',
      purple: '#ae81ff',
      text: '#f8f8f2',
      text2: '#d6d6c8',
      text3: '#a8a89a',
    },
    chart: {
      background: '#272822',
      surface: '#1e1f1c',
      text: '#f8f8f2',
      muted: '#d6d6c8',
      grid: '#49483e',
      axis: '#5b5a4d',
      palette: ['#66d9ef', '#a6e22e', '#e6db74', '#ae81ff', '#f92672', '#fd971f'],
    },
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    mode: 'dark',
    tokens: {
      bg: '#011627',
      surface: '#0b253a',
      surface2: '#122d42',
      surface3: '#173a52',
      border: '#1d3b53',
      border2: '#2a4f6b',
      accent: '#82aaff',
      accent2: '#7fdbca',
      onAccent: '#011627',
      onAccent2: '#011627',
      green: '#c5e478',
      yellow: '#ecc48d',
      red: '#ef5350',
      purple: '#c792ea',
      text: '#d6deeb',
      text2: '#b3c0d1',
      text3: '#8fa4b8',
    },
    chart: {
      background: '#011627',
      surface: '#0b253a',
      text: '#d6deeb',
      muted: '#b3c0d1',
      grid: '#1d3b53',
      axis: '#2a4f6b',
      palette: ['#82aaff', '#c5e478', '#ecc48d', '#c792ea', '#ef5350', '#7fdbca'],
    },
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    mode: 'dark',
    tokens: {
      bg: '#0d0f14',
      surface: '#13161e',
      surface2: '#1a1e28',
      surface3: '#222738',
      border: '#2a2f3f',
      border2: '#343a50',
      accent: '#4f9cf9',
      accent2: '#38bdf8',
      onAccent: '#0d0f14',
      onAccent2: '#0d0f14',
      green: '#34d399',
      yellow: '#fbbf24',
      red: '#f87171',
      purple: '#a78bfa',
      text: '#e2e8f0',
      text2: '#94a3b8',
      text3: '#8491a6',
    },
    chart: {
      background: '#0d0f14',
      surface: '#161a22',
      text: '#e2e8f0',
      muted: '#94a3b8',
      grid: '#2a2f3f',
      axis: '#343a50',
      palette: ['#4f9cf9', '#34d399', '#fbbf24', '#a78bfa', '#f87171', '#38bdf8'],
    },
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    mode: 'light',
    tokens: {
      bg: '#ffffff',
      surface: '#f6f8fa',
      surface2: '#eef1f4',
      surface3: '#e6eaef',
      border: '#d0d7de',
      border2: '#afb8c1',
      accent: '#0969da',
      accent2: '#1a66d6',
      onAccent: '#ffffff',
      onAccent2: '#ffffff',
      green: '#1a7f37',
      yellow: '#9a6700',
      red: '#cf222e',
      purple: '#8250df',
      text: '#1f2328',
      text2: '#424a53',
      text3: '#57606a',
    },
    chart: {
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      muted: '#475569',
      grid: '#e2e8f0',
      axis: '#cbd5e1',
      palette: ['#0969da', '#1a7f37', '#9a6700', '#8250df', '#cf222e', '#1b7c83'],
    },
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    mode: 'light',
    tokens: {
      bg: '#fdf6e3',
      surface: '#f5eeda',
      surface2: '#eee8d5',
      surface3: '#e4ddca',
      border: '#d3cbb7',
      border2: '#b8b09a',
      accent: '#1c6ea4',
      accent2: '#1a6e68',
      onAccent: '#ffffff',
      onAccent2: '#ffffff',
      green: '#6c7d00',
      yellow: '#8a6800',
      red: '#c92a27',
      purple: '#5f63b8',
      text: '#073642',
      text2: '#3f5f69',
      text3: '#4f656c',
    },
    chart: {
      background: '#fdf6e3',
      surface: '#f5eeda',
      text: '#073642',
      muted: '#3f5f69',
      grid: '#d3cbb7',
      axis: '#b8b09a',
      palette: ['#1c6ea4', '#6c7d00', '#8a6800', '#5f63b8', '#c92a27', '#1a6e68'],
    },
  },
  {
    id: 'one-light',
    name: 'One Light',
    mode: 'light',
    tokens: {
      bg: '#fafafa',
      surface: '#f0f0f1',
      surface2: '#e5e5e6',
      surface3: '#dbdbdc',
      border: '#d0d0d1',
      border2: '#b8b8b9',
      accent: '#2a63bb',
      accent2: '#016e8f',
      onAccent: '#ffffff',
      onAccent2: '#ffffff',
      green: '#3d7f3c',
      yellow: '#9a6700',
      red: '#c33a30',
      purple: '#8f1f8d',
      text: '#2b2d33',
      text2: '#4b4e57',
      text3: '#5c5f68',
    },
    chart: {
      background: '#fafafa',
      surface: '#f0f0f1',
      text: '#2b2d33',
      muted: '#4b4e57',
      grid: '#d0d0d1',
      axis: '#b8b8b9',
      palette: ['#2a63bb', '#3d7f3c', '#9a6700', '#8f1f8d', '#c33a30', '#016e8f'],
    },
  },
  {
    id: 'quiet-light',
    name: 'Quiet Light',
    mode: 'light',
    tokens: {
      bg: '#f5f5f5',
      surface: '#ececec',
      surface2: '#e0e0e0',
      surface3: '#d6d6d6',
      border: '#c9c9c9',
      border2: '#b0b0b0',
      accent: '#2a66a5',
      accent2: '#245a91',
      onAccent: '#ffffff',
      onAccent2: '#ffffff',
      green: '#367319',
      yellow: '#8a6700',
      red: '#a93226',
      purple: '#6633cc',
      text: '#262626',
      text2: '#454545',
      text3: '#5c5c5c',
    },
    chart: {
      background: '#f5f5f5',
      surface: '#ececec',
      text: '#262626',
      muted: '#454545',
      grid: '#c9c9c9',
      axis: '#b0b0b0',
      palette: ['#2a66a5', '#367319', '#8a6700', '#6633cc', '#a93226', '#245a91'],
    },
  },
  {
    id: 'light-modern',
    name: 'Light Modern',
    mode: 'light',
    tokens: {
      bg: '#ffffff',
      surface: '#f8f8f8',
      surface2: '#f0f0f0',
      surface3: '#e8e8e8',
      border: '#e0e0e0',
      border2: '#c8c8c8',
      accent: '#005fb8',
      accent2: '#0069a8',
      onAccent: '#ffffff',
      onAccent2: '#ffffff',
      green: '#107c10',
      yellow: '#8a6300',
      red: '#c42b1c',
      purple: '#6f42c1',
      text: '#1f1f1f',
      text2: '#3f3f3f',
      text3: '#5c5c5c',
    },
    chart: {
      background: '#ffffff',
      surface: '#f8f8f8',
      text: '#1f1f1f',
      muted: '#3f3f3f',
      grid: '#e0e0e0',
      axis: '#c8c8c8',
      palette: ['#005fb8', '#107c10', '#8a6300', '#6f42c1', '#c42b1c', '#0069a8'],
    },
  },
] as const satisfies readonly ThemeDefinition[];

export type ThemeId = (typeof THEMES)[number]['id'];

export const DEFAULT_THEME_ID: ThemeId = 'github-dark';

const BY_ID = new Map<string, ThemeDefinition>(THEMES.map(theme => [theme.id, theme]));

export const isThemeId = (value: unknown): value is ThemeId =>
  typeof value === 'string' && BY_ID.has(value);

export const themeById = (value: unknown): ThemeDefinition =>
  (typeof value === 'string' ? BY_ID.get(value) : undefined) ??
  BY_ID.get(DEFAULT_THEME_ID)!;

export const themesByMode = (mode: ThemeMode): readonly ThemeDefinition[] =>
  THEMES.filter(theme => theme.mode === mode);

/** Names of the CSS custom properties written by `applyTheme`. */
export const CSS_VARIABLE_NAMES: Readonly<Record<keyof ThemeTokens, string>> = {
  bg: '--color-bg',
  surface: '--color-surface',
  surface2: '--color-surface2',
  surface3: '--color-surface3',
  border: '--color-border',
  border2: '--color-border2',
  accent: '--color-accent',
  accent2: '--color-accent2',
  onAccent: '--color-on-accent',
  onAccent2: '--color-on-accent2',
  green: '--color-green',
  yellow: '--color-yellow',
  red: '--color-red',
  purple: '--color-purple',
  text: '--color-text',
  text2: '--color-text2',
  text3: '--color-text3',
};

export const cssVariablesOf = (theme: ThemeDefinition): Record<string, string> =>
  Object.fromEntries(
    (Object.keys(CSS_VARIABLE_NAMES) as (keyof ThemeTokens)[]).map(key => [
      CSS_VARIABLE_NAMES[key],
      theme.tokens[key],
    ])
  );
