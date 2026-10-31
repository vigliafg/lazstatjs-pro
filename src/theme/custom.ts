/**
 * User-created themes.
 *
 * The 10 built-ins stay immutable in `themes.ts`; custom themes live in the
 * project snapshot and are resolved side by side with the built-ins. A theme
 * is still a complete `ThemeDefinition`: 17 UI colours plus the chart block.
 */

import {
  CSS_VARIABLE_NAMES,
  DEFAULT_THEME_ID,
  THEMES,
  themeById,
  type ThemeChartTokens,
  type ThemeDefinition,
  type ThemeMode,
  type ThemeTokens,
} from './themes';

export interface CustomTheme extends ThemeDefinition {
  custom: true;
}

export const MAX_CUSTOM_THEMES = 20;
export const MAX_CUSTOM_THEME_NAME = 48;
export const MAX_CUSTOM_THEME_BYTES = 50_000;
export const CUSTOM_THEME_PREFIX = 'custom-';
const MAX_PALETTE = 6;

const HEX = /^#[0-9a-f]{6}$/i;
const isColour = (value: unknown): value is string =>
  typeof value === 'string' && HEX.test(value);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const cleanText = (value: unknown, limit = MAX_CUSTOM_THEME_NAME): string =>
  typeof value === 'string'
    ? value
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, limit)
    : '';

const cleanId = (value: unknown, fallback: string, used: Set<string>): string => {
  const base =
    typeof value === 'string'
      ? value.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64)
      : '';
  let id = base || fallback;
  if (!id.startsWith(CUSTOM_THEME_PREFIX)) id = `${CUSTOM_THEME_PREFIX}${id}`;
  let suffix = 2;
  while (used.has(id) || isThemeId(id)) {
    id = `${base || fallback}-${suffix}`;
    if (!id.startsWith(CUSTOM_THEME_PREFIX)) id = `${CUSTOM_THEME_PREFIX}${id}`;
    suffix += 1;
  }
  used.add(id);
  return id;
};

const isThemeId = (value: string): boolean => THEMES.some(theme => theme.id === value);

let sequence = 0;

export const createCustomThemeId = (existing: readonly ThemeDefinition[] = []): string => {
  const used = new Set(existing.map(theme => theme.id));
  return cleanId(
    `${CUSTOM_THEME_PREFIX}${Date.now().toString(36)}-${(sequence++).toString(36)}`,
    `custom-${used.size + 1}`,
    used
  );
};

export const customThemesByMode = (
  themes: readonly CustomTheme[],
  mode: ThemeMode
): CustomTheme[] => themes.filter(theme => theme.mode === mode);

export const themeNameExists = (
  themes: readonly ThemeDefinition[],
  name: string,
  exceptId?: string
): boolean => {
  const key = name.trim().toLowerCase();
  return themes.some(theme => theme.id !== exceptId && theme.name.toLowerCase() === key);
};

const normalizeTokens = (value: unknown): ThemeTokens | null => {
  if (!isRecord(value)) return null;
  const tokens = {} as ThemeTokens;
  for (const key of Object.keys(CSS_VARIABLE_NAMES) as (keyof ThemeTokens)[]) {
    if (!isColour(value[key])) return null;
    tokens[key] = value[key];
  }
  return tokens;
};

const normalizeChart = (value: unknown): ThemeChartTokens | null => {
  if (!isRecord(value)) return null;
  const keys = ['background', 'surface', 'text', 'muted', 'grid', 'axis'] as const;
  const chart = {} as ThemeChartTokens;
  for (const key of keys) {
    if (!isColour(value[key])) return null;
    chart[key] = value[key];
  }
  if (!Array.isArray(value.palette)) return null;
  const palette = value.palette.filter(isColour).slice(0, MAX_PALETTE);
  if (palette.length < 6) return null;
  return { ...chart, palette };
};

const normalizeOne = (
  value: unknown,
  usedIds: Set<string>,
  usedNames: Set<string>,
  index: number
): CustomTheme | null => {
  if (!isRecord(value)) return null;
  const name = cleanText(value.name);
  if (!name || usedNames.has(name.toLowerCase())) return null;
  const mode = value.mode === 'dark' || value.mode === 'light' ? value.mode : null;
  if (!mode) return null;
  const tokens = normalizeTokens(value.tokens);
  const chart = normalizeChart(value.chart);
  if (!tokens || !chart) return null;
  const id = cleanId(value.id, `custom-${index + 1}`, usedIds);
  usedNames.add(name.toLowerCase());
  return { id, name, mode, tokens, chart, custom: true };
};

/** Validate a stored/imported list; malformed entries are dropped, never the project. */
export const normalizeCustomThemes = (value: unknown): CustomTheme[] => {
  if (!Array.isArray(value)) return [];
  const themes: CustomTheme[] = [];
  const usedIds = new Set<string>();
  const usedNames = new Set<string>();
  for (let index = 0; index < value.length && themes.length < MAX_CUSTOM_THEMES; index += 1) {
    const theme = normalizeOne(value[index], usedIds, usedNames, index);
    if (theme) themes.push(theme);
  }
  while (themes.length > 0 && JSON.stringify(themes).length > MAX_CUSTOM_THEME_BYTES) {
    themes.pop();
  }
  return themes;
};

export const resolveThemeId = (
  value: unknown,
  customThemes: readonly CustomTheme[]
): string => {
  if (typeof value !== 'string' || value.length === 0) return DEFAULT_THEME_ID;
  if (value === DEFAULT_THEME_ID || isThemeId(value)) return value;
  return customThemes.some(theme => theme.id === value) ? value : DEFAULT_THEME_ID;
};

export const resolveThemeDefinition = (
  value: unknown,
  customThemes: readonly CustomTheme[]
): ThemeDefinition =>
  customThemes.find(theme => theme.id === value) ??
  themeById(typeof value === 'string' ? value : undefined);

export const deriveChartTokens = (tokens: ThemeTokens): ThemeChartTokens => ({
  background: tokens.bg,
  surface: tokens.surface,
  text: tokens.text,
  muted: tokens.text2,
  grid: tokens.border,
  axis: tokens.border2,
  palette: [
    tokens.accent,
    tokens.green,
    tokens.yellow,
    tokens.purple,
    tokens.red,
    tokens.accent2,
  ],
});

const copyTheme = (theme: ThemeDefinition): Pick<ThemeDefinition, 'tokens' | 'chart'> => ({
  tokens: { ...theme.tokens },
  chart: { ...theme.chart, palette: [...theme.chart.palette] },
});

export const createCustomTheme = (
  name: string,
  base: ThemeDefinition,
  existing: readonly ThemeDefinition[] = []
): CustomTheme => {
  const chosen = cleanText(name) || 'Custom theme';
  let uniqueName = chosen;
  let suffix = 2;
  while (themeNameExists(existing, uniqueName)) {
    uniqueName = `${chosen} ${suffix}`.slice(0, MAX_CUSTOM_THEME_NAME);
    suffix += 1;
  }
  return {
    id: createCustomThemeId(existing),
    name: uniqueName,
    mode: base.mode,
    ...copyTheme(base),
    custom: true,
  };
};

export const duplicateCustomTheme = (
  theme: CustomTheme,
  existing: readonly ThemeDefinition[] = []
): CustomTheme => createCustomTheme(`${theme.name} copy`, theme, existing);
