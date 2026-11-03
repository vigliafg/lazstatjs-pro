import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import { showInt } from '../reportKit';
import type { TableSpec } from '../types';
import type { AcceptanceResult } from '../kernels/acceptance';

export const acceptanceTables = (result: AcceptanceResult): TableSpec[] => [
  {
    id: 'accept-plan',
    title: copy('Piano di campionamento'),
    subtitle: copy('n = {s1} · c = {s2}', { s1: result.n, s2: result.c }),
    columns: [
      { key: 'metric', label: copy('Metrica'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { metric: copy('Dimensione del campione (n)'), value: showInt(result.n) },
      { metric: copy('Numero di accettazione (c)'), value: showInt(result.c) },
      {
        metric: copy('Dimensione del lotto (N)'),
        value: result.lotSize > 0 ? showInt(result.lotSize) : copy('infinito'),
      },
      {
        metric: copy('Distribuzione'),
        value: result.distribution === 'hypergeometric' ? copy('Ipergeometrica') : copy('Binomiale'),
      },
      { metric: copy('AQL (Pa = 95%)'), value: fmtEst(result.aql, 4) },
      { metric: copy('LTPD (Pa = 10%)'), value: fmtEst(result.ltpd, 4) },
      { metric: copy('Rischio del produttore (α)'), value: fmtEst(result.alpha, 4) },
      { metric: copy('Rischio del consumatore (β)'), value: fmtEst(result.beta, 4) },
      { metric: copy('AOQL'), value: fmtEst(result.aoql, 4) },
      { metric: copy('Qualità al massimo AOQ'), value: fmtEst(result.aoqlP, 4) },
    ],
  },
  {
    id: 'accept-curve',
    title: copy('Curva operativa'),
    subtitle: copy('{s1} punti', { s1: result.points.length }),
    columns: [
      { key: 'p', label: copy('Qualità in ingresso'), format: 'dec4', align: 'right' },
      { key: 'pa', label: copy('Probabilità di accettazione'), format: 'dec4', align: 'right' },
      { key: 'aoq', label: 'AOQ', format: 'dec4', align: 'right' },
      { key: 'ati', label: 'ATI', format: 'dec1', align: 'right' },
    ],
    rows: result.points.map(point => ({
      p: point.p,
      pa: point.pa,
      aoq: point.aoq,
      ati: point.ati,
    })),
  },
];
