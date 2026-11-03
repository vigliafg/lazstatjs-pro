import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import { showInt } from '../reportKit';
import type { TableSpec } from '../types';
import type { MultiControlResult } from '../kernels/mcontrol';

export const mcontrolTables = (result: MultiControlResult): TableSpec[] => [
  {
    id: 'mcontrol-summary',
    title: copy('Carta T² di Hotelling'),
    subtitle: copy('{s1} variabili · {s2} sottogruppi di {s3}', {
      s1: result.variables.length,
      s2: result.groups,
      s3: result.subgroup,
    }),
    columns: [
      { key: 'metric', label: copy('Metrica'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { metric: copy('Variabili'), value: result.variables.join(', ') },
      { metric: copy('Osservazioni complete'), value: showInt(result.n) },
      { metric: copy('Sottogruppi'), value: showInt(result.groups) },
      { metric: copy('Limite superiore (UCL)'), value: fmtEst(result.ucl, 4) },
      { metric: 'df₁', value: showInt(result.df1) },
      { metric: 'df₂', value: showInt(result.df2) },
      { metric: copy('Punti fuori controllo'), value: showInt(result.outCount) },
    ],
  },
  {
    id: 'mcontrol-points',
    title: copy('T² per sottogruppo'),
    subtitle: copy('{s1} punti', { s1: result.points.length }),
    columns: [
      { key: 'subgroup', label: copy('Sottogruppo'), format: 'int', align: 'right' },
      { key: 't2', label: 'T²', format: 'dec4', align: 'right' },
      { key: 'out', label: copy('Fuori controllo'), format: 'text', align: 'left' },
    ],
    rows: result.points.map(point => ({
      subgroup: point.index,
      t2: point.t2,
      out: point.out ? copy('sì') : copy('no'),
    })),
  },
  {
    id: 'mcontrol-center',
    title: copy('Centro e covarianza'),
    subtitle: copy('Media per variabile'),
    columns: [
      { key: 'variable', label: copy('Variabile'), align: 'left' },
      { key: 'center', label: copy('Media'), format: 'dec4', align: 'right' },
      { key: 'sd', label: copy('Deviazione standard'), format: 'dec4', align: 'right' },
    ],
    rows: result.variables.map((variable, index) => ({
      variable,
      center: result.center[index],
      sd: Math.sqrt(Math.max(0, result.covariance[index][index])),
    })),
  },
];
