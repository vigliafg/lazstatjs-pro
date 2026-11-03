import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { AnomResult } from '../kernels/anom';

export interface AnomNames {
  dep: string;
  group: string;
}

/** Decision-line table for ANOM. */
export const anomTables = (result: AnomResult, names: AnomNames): TableSpec[] => [
  {
    id: 'anom-table',
    title: copy('Analisi delle medie (ANOM)'),
    subtitle: copy('{s1} per {s2} · α = {s3}', {
      s1: names.dep,
      s2: names.group,
      s3: result.alpha,
    }),
    columns: [
      { key: 'group', label: names.group, format: 'text' },
      { key: 'n', label: copy('N'), format: 'int' },
      { key: 'mean', label: copy('Mean'), format: 'dec4' },
      { key: 'sd', label: copy('SD'), format: 'dec4' },
      { key: 'lower', label: copy('Limite inferiore'), format: 'dec4' },
      { key: 'upper', label: copy('Limite superiore'), format: 'dec4' },
      { key: 'outside', label: copy('Fuori limiti'), format: 'text' },
    ],
    rows: result.groups.map(group => ({
      group: group.group,
      n: group.n,
      mean: group.mean,
      sd: group.sd,
      lower: group.lower,
      upper: group.upper,
      outside: group.outside ? copy('Sì') : copy('No'),
    })),
    notes: [
      copy('Media generale = {s1}; media quadratica entro gruppi = {s2} con {s3} gradi di libertà.', {
        s1: result.grandMean,
        s2: result.msWithin,
        s3: result.dfWithin,
      }),
      copy('Il valore critico h = {s1} usa l’approssimazione Bonferroni-t della distribuzione del massimo modulo studentizzato.', {
        s1: result.h,
      }),
    ],
  },
];
