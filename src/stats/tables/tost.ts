import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import { fmtEst, fmtP } from '../format';
import type { TostStats } from '../tost/types';

const designLabel = (stats: TostStats): string => {
  if (stats.design === 'one') return copy('una media vs margine');
  if (stats.design === 'paired') return copy('due misure appaiate');
  return copy('due gruppi indipendenti');
};

export const tostTables = (stats: TostStats, level: number): TableSpec[] => [
  {
    id: 'tost-summary',
    title: copy('Differenza e intervallo di confidenza'),
    subtitle: copy('{s1} · CI {s2}% · margine ±{s3}', { s1: designLabel(stats), s2: level, s3: fmtEst(stats.margin, 3) }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
    ],
    rows: [
      { metric: copy('N'), value: stats.n },
      { metric: copy('Media A'), value: stats.meanA },
      { metric: copy('Media B'), value: stats.meanB },
      { metric: copy('SD A'), value: stats.sdA },
      { metric: copy('SD B'), value: stats.sdB },
      { metric: copy('Differenza'), value: stats.diff },
      { metric: copy('SE'), value: stats.se },
      { metric: copy('df'), value: stats.df },
      { metric: copy('CI low'), value: stats.ciLo },
      { metric: copy('CI high'), value: stats.ciHi },
      { metric: copy('Margine di equivalenza'), value: stats.margin },
    ],
    notes: [copy('La decisione TOST richiede che tutto l’intervallo di confidenza cada dentro ±margine.')],
  },
  {
    id: 'tost-tests',
    title: copy('Two One-Sided Tests'),
    subtitle: copy('α = {s1}', { s1: fmtEst(stats.alpha, 2) }),
    columns: [
      { key: 'test', label: copy('Test'), format: 'text' },
      { key: 't', label: copy('t'), format: 'dec4' },
      { key: 'p', label: copy('p'), format: 'p' },
    ],
    rows: [
      { test: copy('H0: differenza ≤ −{s1}', { s1: fmtEst(stats.margin, 3) }), t: stats.tLower, p: stats.pLower },
      { test: copy('H0: differenza ≥ +{s1}', { s1: fmtEst(stats.margin, 3) }), t: stats.tUpper, p: stats.pUpper },
      { test: copy('TOST (p = max)'), t: NaN, p: stats.pTost },
    ],
    notes: [
      copy('p TOST = {s1}; {s2} al livello {s3}%.', { s1: fmtP(stats.pTost), s2: stats.equivalent ? copy('equivalenza dimostrata') : copy('equivalenza non dimostrata'), s3: level }),
    ],
  },
];
