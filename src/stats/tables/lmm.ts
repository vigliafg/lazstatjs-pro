import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type { LmmStats } from '../lmm/types';

export const lmmTables = (
  stats: LmmStats,
  depName: string,
  predNames: string[],
  groupName: string,
  level: number
): TableSpec[] => [
  {
    id: 'lmm-summary',
    title: copy('Modello lineare misto'),
    subtitle: copy('{s1} ~ {s2} + (1 | {s3}) · CI {s4}%', { s1: depName, s2: predNames.join(' + '), s3: groupName, s4: level }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
    ],
    rows: [
      { metric: copy('N'), value: stats.n },
      { metric: copy('Gruppi'), value: stats.groups },
      { metric: copy('Varianza intercetta'), value: stats.sigmaU2 },
      { metric: copy('Varianza residua'), value: stats.sigmaE2 },
      { metric: copy('ICC'), value: stats.icc },
      { metric: copy('REML logLik (a meno di costante)'), value: stats.remlLogLik },
    ],
    notes: [
      copy('Stima REML con intercetta casuale per gruppo.'),
      copy('ICC = varianza tra gruppi / varianza totale.'),
    ],
  },
  {
    id: 'lmm-fixed',
    title: copy('Effetti fissi'),
    subtitle: copy('CI {s1}% · t con df = {s2}', { s1: level, s2: stats.df }),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'beta', label: copy('Stima'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 't', label: copy('t'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'lo', label: copy('CI low'), format: 'dec4' },
      { key: 'hi', label: copy('CI high'), format: 'dec4' },
    ],
    rows: stats.coefficients.map(coefficient => ({ ...coefficient })),
    notes: [copy('p e CI usano una t con df = N − parametri; con pochi gruppi sono approssimati.')],
  },
];
