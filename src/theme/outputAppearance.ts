import type { ThemeDefinition } from './themes';

/** Font family choices for the result window; `theme` follows the UI font. */
export type OutputFont = 'theme' | 'mono' | 'sans' | 'serif';

/**
 * Presentation overrides for the output/report window only.
 *
 * Empty colours and `0` sizes mean "follow the active theme", so switching
 * themes keeps the window coherent until the user explicitly overrides it.
 */
export interface OutputAppearance {
  background: string;
  foreground: string;
  font: OutputFont;
  fontSize: number;
}

export const DEFAULT_OUTPUT_APPEARANCE: OutputAppearance = {
  background: '',
  foreground: '',
  font: 'theme',
  fontSize: 0,
};

export const OUTPUT_FONT_STACKS: Record<Exclude<OutputFont, 'theme'>, string> = {
  mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace',
  sans: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
};

const THEME_FONT_STACK = OUTPUT_FONT_STACKS.mono;

export const OUTPUT_FONT_SIZES = [10, 11, 12, 13, 14, 15, 16, 18, 20] as const;

const HEX = /^#[0-9a-f]{6}$/i;

export const isOutputColour = (value: unknown): value is string =>
  typeof value === 'string' && HEX.test(value);

const isOutputFont = (value: unknown): value is OutputFont =>
  value === 'theme' || value === 'mono' || value === 'sans' || value === 'serif';

/** Defensive parse for projects saved by another version or hand-edited. */
export const normalizeOutputAppearance = (value: unknown): OutputAppearance => {
  const raw =
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const size =
    typeof raw.fontSize === 'number' && Number.isFinite(raw.fontSize)
      ? Math.trunc(raw.fontSize)
      : 0;
  return {
    background: isOutputColour(raw.background) ? raw.background : '',
    foreground: isOutputColour(raw.foreground) ? raw.foreground : '',
    font: isOutputFont(raw.font) ? raw.font : DEFAULT_OUTPUT_APPEARANCE.font,
    fontSize: size >= 8 && size <= 24 ? size : 0,
  };
};

export const outputFontStack = (font: OutputFont): string =>
  font === 'theme' ? THEME_FONT_STACK : OUTPUT_FONT_STACKS[font];

/** Blend two hex colours; `weight` is the share of the first colour. */
const mixHex = (first: string, second: string, weight: number): string => {
  const parse = (hex: string) => [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
  const a = parse(first);
  const b = parse(second);
  return `#${a
    .map((value, index) => Math.round(value * weight + b[index] * (1 - weight)).toString(16).padStart(2, '0'))
    .join('')}`;
};

/**
 * CSS custom properties consumed only by `#output-content`. They are applied
 * inline on that node, so the surrounding shell keeps the selected UI theme.
 */
export const outputAppearanceStyle = (
  appearance: OutputAppearance,
  theme: ThemeDefinition
): Record<string, string> => {
  const background = appearance.background || theme.tokens.bg;
  const foreground = appearance.foreground || theme.tokens.text2;
  const custom = Boolean(appearance.background || appearance.foreground);
  return {
    '--output-bg': background,
    '--output-fg': foreground,
    '--output-font': outputFontStack(appearance.font),
    '--output-size': `${appearance.fontSize > 0 ? appearance.fontSize : 12}px`,
    // With no explicit override the window keeps the theme's exact surfaces;
    // otherwise the derived shades keep cards and tables coherent with it.
    '--output-surface': custom ? mixHex(background, foreground, 0.94) : theme.tokens.surface,
    '--output-surface2': custom ? mixHex(background, foreground, 0.88) : theme.tokens.surface2,
    '--output-surface3': custom ? mixHex(background, foreground, 0.82) : theme.tokens.surface3,
    '--output-border': custom ? mixHex(background, foreground, 0.72) : theme.tokens.border,
    '--output-border2': custom ? mixHex(background, foreground, 0.62) : theme.tokens.border2,
    '--output-text': foreground,
    '--output-text2': foreground,
    '--output-text3': custom ? mixHex(foreground, background, 0.8) : theme.tokens.text3,
  };
};
