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
  {
    id: 'lmm-varcomp',
    title: copy('Componenti di varianza'),
    subtitle: copy('Profilo di verosimiglianza · CI {s1}%', { s1: level }),
    columns: [
      { key: 'component', label: copy('Componente'), format: 'text' },
      { key: 'estimate', label: copy('Stima'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'lo', label: copy('CI low'), format: 'dec4' },
      { key: 'hi', label: copy('CI high'), format: 'dec4' },
    ],
    rows: stats.varianceComponents.map(entry => ({
      component: entry.component === 'intercept' ? copy('Intercetta casuale') : copy('Residuo'),
      estimate: entry.estimate,
      se: entry.se,
      lo: entry.lo,
      hi: entry.hi,
    })),
    notes: [
      copy('Gli intervalli sono di profilo: non assumono una forma simmetrica e possono avvicinarsi allo zero.'),
    ],
  },
  {
    id: 'lmm-fixed-tests',
    title: copy('Test degli effetti fissi'),
    subtitle: copy('Wald per termine · df {s1} · {s2}', { s1: stats.df, s2: level }),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'f', label: copy('F'), format: 'dec3' },
      { key: 'df1', label: copy('df1'), format: 'int' },
      { key: 'df2', label: copy('df2'), format: 'int' },
      { key: 'p', label: copy('p'), format: 'p' },
    ],
    rows: stats.fixedTests.map(test => ({ ...test })),
    notes: [
      copy('Con predittori a una colonna F è il quadrato del t: il p-value coincide con quello della tabella dei coefficienti.'),
    ],
  },
];
