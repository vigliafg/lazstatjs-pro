import type { TableSpec } from '../types';
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
    title: 'Modello lineare misto',
    subtitle: `${depName} ~ ${predNames.join(' + ')} + (1 | ${groupName}) · CI ${level}%`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
    ],
    rows: [
      { metric: 'N', value: stats.n },
      { metric: 'Gruppi', value: stats.groups },
      { metric: 'Varianza intercetta', value: stats.sigmaU2 },
      { metric: 'Varianza residua', value: stats.sigmaE2 },
      { metric: 'ICC', value: stats.icc },
      { metric: 'REML logLik (a meno di costante)', value: stats.remlLogLik },
    ],
    notes: [
      'Stima REML con intercetta casuale per gruppo.',
      'ICC = varianza tra gruppi / varianza totale.',
    ],
  },
  {
    id: 'lmm-fixed',
    title: 'Effetti fissi',
    subtitle: `CI ${level}% · t con df = ${stats.df}`,
    columns: [
      { key: 'term', label: 'Termine', format: 'text' },
      { key: 'beta', label: 'Stima', format: 'dec4' },
      { key: 'se', label: 'SE', format: 'dec4' },
      { key: 't', label: 't', format: 'dec3' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'lo', label: 'CI low', format: 'dec4' },
      { key: 'hi', label: 'CI high', format: 'dec4' },
    ],
    rows: stats.coefficients.map(coefficient => ({ ...coefficient })),
    notes: ['p e CI usano una t con df = N − parametri; con pochi gruppi sono approssimati.'],
  },
];
