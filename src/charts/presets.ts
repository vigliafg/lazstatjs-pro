/**
 * Named chart style presets.
 *
 * A preset stores the 20 shared style options (all `COMMON_KEYS` except the
 * built-in `preset` marker). It never stores annotations, chart data or
 * kind-specific options: those remain per-card. This keeps a preset applicable
 * to every chart kind and prevents copying a callout from one card to another.
 */

import type { ChartOptions, CommonChartOptions } from '../stats/charts';
import {
  COMMON_DEFAULTS,
  COMMON_KEYS,
  normalizeChartDefaults,
} from './defaults';

export type ChartPresetOptions = Omit<CommonChartOptions, 'preset' | 'annotations'>;

export interface ChartPreset {
  id: string;
  name: string;
  options: ChartPresetOptions;
  createdAt?: string;
  updatedAt?: string;
}

export const MAX_CHART_PRESETS = 20;
export const MAX_CHART_PRESET_NAME = 48;
export const MAX_CHART_PRESET_ID = 48;
/** Keep the whole library tiny compared with the project/autosave budget. */
export const MAX_CHART_PRESET_BYTES = 20_000;

/** The shared style keys a preset owns. `preset` is the built-in marker. */
export const CHART_PRESET_KEYS = COMMON_KEYS.filter(
  key => key !== 'preset'
) as readonly (keyof ChartPresetOptions)[];

const { preset: _preset, ...defaultOptions } = COMMON_DEFAULTS;
export const DEFAULT_PRESET_OPTIONS = defaultOptions as ChartPresetOptions;

let presetSequence = 0;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const cleanText = (value: unknown, limit: number): string =>
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
      ? value.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, MAX_CHART_PRESET_ID)
      : '';
  let id = base || fallback;
  let suffix = 2;
  while (used.has(id)) {
    id = `${base || fallback}-${suffix}`;
    suffix += 1;
  }
  used.add(id);
  return id;
};

const timestamp = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value))
    ? value
    : undefined;

/** Pick the 20 style options from any common option object. */
export const presetOptionsOf = (options: CommonChartOptions): ChartPresetOptions => {
  const result = { ...DEFAULT_PRESET_OPTIONS } as Record<string, unknown>;
  for (const key of CHART_PRESET_KEYS) {
    result[key] = (options as unknown as Record<string, unknown>)[key];
  }
  return result as ChartPresetOptions;
};

/** Sanitise a preset payload, filling missing style keys with the factory value. */
export const normalizePresetOptions = (value: unknown): ChartPresetOptions =>
  presetOptionsOf(normalizeChartDefaults(value));

/** Validate a persisted/imported preset library. */
export const normalizeChartPresets = (value: unknown): ChartPreset[] => {
  if (!Array.isArray(value)) return [];
  const presets: ChartPreset[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();
  for (let index = 0; index < value.length && presets.length < MAX_CHART_PRESETS; index += 1) {
    const raw = value[index];
    if (!isRecord(raw)) continue;
    const name = cleanText(raw.name, MAX_CHART_PRESET_NAME);
    if (!name) continue;
    const nameKey = name.toLowerCase();
    if (names.has(nameKey)) continue;
    if (!isRecord(raw.options)) continue;
    const id = cleanId(raw.id, `preset-${index + 1}`, ids);
    const createdAt = timestamp(raw.createdAt);
    const updatedAt = timestamp(raw.updatedAt);
    presets.push({
      id,
      name,
      options: normalizePresetOptions(raw.options),
      ...(createdAt ? { createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
    });
    names.add(nameKey);
  }
  while (presets.length > 0 && JSON.stringify(presets).length > MAX_CHART_PRESET_BYTES) {
    presets.pop();
  }
  return presets;
};

const nowIso = (): string => new Date().toISOString();

/** Factory for a new named preset. */
export const createChartPreset = (
  name: string,
  options: CommonChartOptions,
  existing: readonly ChartPreset[] = []
): ChartPreset => {
  const used = new Set(existing.map(preset => preset.id));
  const id = cleanId(
    `p-${Date.now().toString(36)}-${(presetSequence++).toString(36)}`,
    `preset-${used.size + 1}`,
    used
  );
  const stamp = nowIso();
  return {
    id,
    name: cleanText(name, MAX_CHART_PRESET_NAME) || 'Preset',
    options: presetOptionsOf(options),
    createdAt: stamp,
    updatedAt: stamp,
  };
};

export const presetNameExists = (
  presets: readonly ChartPreset[],
  name: string,
  exceptId?: string
): boolean => {
  const key = name.trim().toLowerCase();
  return presets.some(
    preset => preset.id !== exceptId && preset.name.toLowerCase() === key
  );
};

/**
 * Save the current options under a name. Matching names overwrite on purpose;
 * the editor shows an inline warning before the save button is pressed.
 */
export const saveChartPreset = (
  presets: readonly ChartPreset[],
  name: string,
  options: CommonChartOptions
): ChartPreset[] => {
  const clean = cleanText(name, MAX_CHART_PRESET_NAME);
  if (!clean) return [...presets];
  const existing = presets.find(
    preset => preset.name.toLowerCase() === clean.toLowerCase()
  );
  if (existing) {
    return presets.map(preset =>
      preset.id === existing.id
        ? {
            // Keep the existing label casing; the user can rename it explicitly.
            ...preset,
            options: presetOptionsOf(options),
            updatedAt: nowIso(),
          }
        : preset
    );
  }
  if (presets.length >= MAX_CHART_PRESETS) return [...presets];
  return [...presets, createChartPreset(clean, options, presets)];
};

export const renameChartPreset = (
  presets: readonly ChartPreset[],
  id: string,
  name: string
): ChartPreset[] => {
  const clean = cleanText(name, MAX_CHART_PRESET_NAME);
  if (!clean || presetNameExists(presets, clean, id)) return [...presets];
  return presets.map(preset =>
    preset.id === id ? { ...preset, name: clean, updatedAt: nowIso() } : preset
  );
};

export const deleteChartPreset = (
  presets: readonly ChartPreset[],
  id: string
): ChartPreset[] => presets.filter(preset => preset.id !== id);

export const chartPresetMatches = (
  options: CommonChartOptions,
  preset: ChartPreset
): boolean =>
  CHART_PRESET_KEYS.every(
    key =>
      options[key] === preset.options[key]
  );

/** The custom preset currently reflected by the draft, if any. */
export const matchingChartPreset = (
  options: CommonChartOptions,
  presets: readonly ChartPreset[]
): ChartPreset | null =>
  presets.find(preset => chartPresetMatches(options, preset)) ?? null;

/** Replace only the shared style keys; kind, specific options and annotations stay. */
export const applyChartPreset = (
  options: ChartOptions,
  preset: ChartPreset
): ChartOptions => ({ ...options, ...preset.options }) as ChartOptions;
