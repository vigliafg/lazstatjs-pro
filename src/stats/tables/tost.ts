import type { TableSpec } from '../types';
import { fmtEst, fmtP } from '../format';
import type { TostStats } from '../tost/types';

const designLabel = (stats: TostStats): string => {
  if (stats.design === 'one') return 'una media vs margine';
  if (stats.design === 'paired') return 'due misure appaiate';
  return 'due gruppi indipendenti';
};

export const tostTables = (stats: TostStats, level: number): TableSpec[] => [
  {
    id: 'tost-summary',
    title: 'Differenza e intervallo di confidenza',
    subtitle: `${designLabel(stats)} · CI ${level}% · margine ±${fmtEst(stats.margin, 3)}`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
    ],
    rows: [
      { metric: 'N', value: stats.n },
      { metric: 'Media A', value: stats.meanA },
      { metric: 'Media B', value: stats.meanB },
      { metric: 'SD A', value: stats.sdA },
      { metric: 'SD B', value: stats.sdB },
      { metric: 'Differenza', value: stats.diff },
      { metric: 'SE', value: stats.se },
      { metric: 'df', value: stats.df },
      { metric: 'CI low', value: stats.ciLo },
      { metric: 'CI high', value: stats.ciHi },
      { metric: 'Margine di equivalenza', value: stats.margin },
    ],
    notes: ['La decisione TOST richiede che tutto l’intervallo di confidenza cada dentro ±margine.'],
  },
  {
    id: 'tost-tests',
    title: 'Two One-Sided Tests',
    subtitle: `α = ${fmtEst(stats.alpha, 2)}`,
    columns: [
      { key: 'test', label: 'Test', format: 'text' },
      { key: 't', label: 't', format: 'dec4' },
      { key: 'p', label: 'p', format: 'p' },
    ],
    rows: [
      { test: `H0: differenza ≤ −${fmtEst(stats.margin, 3)}`, t: stats.tLower, p: stats.pLower },
      { test: `H0: differenza ≥ +${fmtEst(stats.margin, 3)}`, t: stats.tUpper, p: stats.pUpper },
      { test: 'TOST (p = max)', t: NaN, p: stats.pTost },
    ],
    notes: [
      `p TOST = ${fmtP(stats.pTost)}; ${stats.equivalent ? 'equivalenza dimostrata' : 'equivalenza non dimostrata'} al livello ${level}%.`,
    ],
  },
];
