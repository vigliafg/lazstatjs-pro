import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { NestedAnovaResult } from '../kernels/nestedAnova';

export interface NestedAnovaNames {
  dep: string;
  outer: string;
  inner: string;
}

/** ANOVA table and cell descriptives for a nested design. */
export const nestedAnovaTables = (result: NestedAnovaResult, names: NestedAnovaNames): TableSpec[] => [
  {
    id: 'nested-anova-table',
    title: copy('ANOVA gerarchica'),
    subtitle: copy('{s1} per {s2} annidato in {s3}', {
      s1: names.dep,
      s2: names.inner,
      s3: names.outer,
    }),
    columns: [
      { key: 'source', label: copy('Fonte'), format: 'text' },
      { key: 'ss', label: copy('SS'), format: 'dec4' },
      { key: 'df', label: copy('df'), format: 'int' },
      { key: 'ms', label: copy('MS'), format: 'dec4' },
      { key: 'f', label: copy('F'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
    ],
    rows: [
      {
        source: names.outer,
        ss: result.outer.ss,
        df: result.outer.df,
        ms: result.outer.ms,
        f: result.outer.f,
        p: result.outer.p,
      },
      {
        source: `${names.inner} (${copy('dentro')} ${names.outer})`,
        ss: result.inner.ss,
        df: result.inner.df,
        ms: result.inner.ms,
        f: result.inner.f,
        p: result.inner.p,
      },
      {
        source: copy('Errore'),
        ss: result.error.ss,
        df: result.error.df,
        ms: result.error.ms,
        f: NaN,
        p: NaN,
      },
      {
        source: copy('Totale'),
        ss: result.total.ss,
        df: result.total.df,
        ms: NaN,
        f: NaN,
        p: NaN,
      },
    ],
    notes: [
      copy('Il fattore esterno è testato contro la media quadratica del fattore annidato, non contro il residuo.'),
      copy('Il fattore interno è testato contro il residuo entro cella.'),
    ],
  },
  {
    id: 'nested-anova-groups',
    title: copy('Descrittive per cella'),
    columns: [
      { key: 'outer', label: names.outer, format: 'text' },
      { key: 'inner', label: names.inner, format: 'text' },
      { key: 'n', label: copy('N'), format: 'int' },
      { key: 'mean', label: copy('Mean'), format: 'dec4' },
      { key: 'sd', label: copy('SD'), format: 'dec4' },
    ],
    rows: result.groupStats.map(group => ({
      outer: group.outer,
      inner: group.group,
      n: group.n,
      mean: group.mean,
      sd: group.sd,
    })),
  },
  {
    id: 'nested-anova-components',
    title: copy('Componenti di varianza'),
    columns: [
      { key: 'component', label: copy('Componente'), format: 'text' },
      { key: 'value', label: copy('Stima'), format: 'dec4' },
    ],
    rows: [
      { component: names.outer, value: result.varianceComponents.outer },
      { component: names.inner, value: result.varianceComponents.inner },
      { component: copy('Residuo'), value: result.varianceComponents.error },
    ],
    notes: [
      copy('Stime approssimate per il modello a effetti casuali; con celle sbilanciate sono indicative.'),
    ],
  },
];
