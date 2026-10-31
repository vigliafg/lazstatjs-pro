/** WCAG contrast checks used by the theme creator and the unit tests. */

import type { ThemeDefinition } from './themes';

const parseHex = (hex: string): [number, number, number] | null => {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return null;
  const value = hex.slice(1);
  return [0, 2, 4].map(offset => parseInt(value.slice(offset, offset + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
};

const luminance = (hex: string): number | null => {
  const parsed = parseHex(hex);
  if (!parsed) return null;
  const [r, g, b] = parsed.map(value =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG 2.x contrast ratio; invalid colours return 1 (no contrast). */
export const contrastRatio = (foreground: string, background: string): number => {
  const first = luminance(foreground);
  const second = luminance(background);
  if (first === null || second === null) return 1;
  const [high, low] = [first, second].sort((left, right) => right - left);
  return (high + 0.05) / (low + 0.05);
};

export interface ContrastCheck {
  id: string;
  foreground: string;
  background: string;
  minimum: number;
}

export type ContrastLevel = 'AAA' | 'AA' | 'AA Large' | 'fail';

export interface ContrastResult extends ContrastCheck {
  ratio: number;
  pass: boolean;
  level: ContrastLevel;
}

const levelFor = (ratio: number): ContrastLevel =>
  ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA Large' : 'fail';

/** The pairs the theme creator reports; labels are supplied by the UI. */
export const themeContrastChecks = (theme: ThemeDefinition): ContrastCheck[] => {
  const { tokens, chart } = theme;
  const worstPaletteColour = chart.palette.reduce(
    (worst, colour) =>
      contrastRatio(colour, chart.background) < contrastRatio(worst, chart.background)
        ? colour
        : worst,
    chart.palette[0] ?? chart.text
  );
  return [
    { id: 'text-bg', foreground: tokens.text, background: tokens.bg, minimum: 7 },
    { id: 'text-surface', foreground: tokens.text, background: tokens.surface, minimum: 7 },
    { id: 'text-surface3', foreground: tokens.text, background: tokens.surface3, minimum: 7 },
    { id: 'text2-surface', foreground: tokens.text2, background: tokens.surface, minimum: 4.5 },
    { id: 'text3-surface', foreground: tokens.text3, background: tokens.surface, minimum: 4.5 },
    { id: 'onAccent-accent', foreground: tokens.onAccent, background: tokens.accent, minimum: 4.5 },
    {
      id: 'onAccent2-accent2',
      foreground: tokens.onAccent2,
      background: tokens.accent2,
      minimum: 4.5,
    },
    { id: 'accent-bg', foreground: tokens.accent, background: tokens.bg, minimum: 4.5 },
    { id: 'chart-text', foreground: chart.text, background: chart.background, minimum: 7 },
    { id: 'chart-muted', foreground: chart.muted, background: chart.background, minimum: 4.5 },
    {
      id: 'chart-palette',
      foreground: worstPaletteColour,
      background: chart.background,
      minimum: 3,
    },
  ];
};

export const themeContrastReport = (
  theme: ThemeDefinition
): { checks: ContrastResult[]; ok: boolean } => {
  const checks = themeContrastChecks(theme).map(check => {
    const ratio = contrastRatio(check.foreground, check.background);
    return {
      ...check,
      ratio,
      pass: ratio >= check.minimum,
      level: levelFor(ratio),
    };
  });
  return { checks, ok: checks.every(check => check.pass) };
};
