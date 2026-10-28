import type { TableRow, TableSpec } from '../types';
import {
  fmtCI,
  fmtEst,
  fmtP,
  interpretD,
  interpretEta,
  interpretPhi,
  interpretR,
} from '../format';

/**
 * Written interpretation of a single analysis run.
 *
 * The builders read the result tables that are already shown to the user
 * instead of recomputing the statistics: the prose can therefore never
 * disagree with the numbers on screen and automatically follows the chosen
 * confidence level.
 */
export type ReportTone = 'positive' | 'neutral' | 'caution';

export interface ReportSection {
  heading: string;
  body?: string[];
  bullets?: string[];
}

export interface ReportSpec {
  id: string;
  title: string;
  headline: string;
  badge: string;
  tone: ReportTone;
  intro: string[];
  sections: ReportSection[];
  limitations: string[];
}

export const P_SENTENCE =
  'Il p-value è la probabilità di osservare un risultato almeno così estremo se l’ipotesi nulla fosse vera: non è la probabilità che l’ipotesi nulla sia vera.';

export const tableById = (tables: TableSpec[], id: string): TableSpec | undefined =>
  tables.find(spec => spec.id === id);

export const rowsOf = (tables: TableSpec[], id: string): TableRow[] => tableById(tables, id)?.rows ?? [];

export const subtitleOf = (tables: TableSpec[], id: string): string => tableById(tables, id)?.subtitle ?? '';

export const rowBy = (rows: TableRow[], key: string, value: string): TableRow | undefined =>
  rows.find(row => String(row[key] ?? '') === value);

export const rowLike = (rows: TableRow[], key: string, needle: string): TableRow | undefined =>
  rows.find(row => String(row[key] ?? '').toLowerCase().includes(needle.toLowerCase()));

export const num = (row: TableRow | undefined, key: string): number => {
  const value = row?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : NaN;
};

export const text = (row: TableRow | undefined, key: string): string => {
  const value = row?.[key];
  return value === null || value === undefined ? '' : String(value);
};

export const alphaOf = (level: number): number => 1 - level / 100;
export const alphaText = (level: number): string => alphaOf(level).toFixed(2);
export const isDecided = (p: number, level: number): boolean => Number.isFinite(p) && p < alphaOf(level);
/** Reads as "p = 0.032" or "p < 0.001" with the caller's label. */
export const describeP = (value: number, label = 'p'): string =>
  !Number.isFinite(value) ? `${label} non calcolabile` : value < 0.001 ? `${label} < 0.001` : `${label} = ${fmtP(value)}`;
export const show = (value: number, decimals = 3): string =>
  Number.isFinite(value) ? fmtEst(value, decimals) : '—';
export const showInt = (value: number): string =>
  Number.isFinite(value) ? String(Math.round(value)) : '—';
export const showCI = (lo: number, hi: number, decimals = 3): string =>
  Number.isFinite(lo) && Number.isFinite(hi) ? fmtCI(lo, hi, decimals) : '—';

export const ciSentence = (level: number): string =>
  `L’intervallo di confidenza al ${level}% indica i valori plausibili per la stima: se non contiene lo zero (o il valore di riferimento) il risultato è coerente con un test significativo.`;

// ---------------------------------------------------------------------------

export { fmtCI, fmtEst, fmtP, interpretD, interpretEta, interpretPhi, interpretR } from '../format';

export type { TableRow, TableSpec } from '../types';
