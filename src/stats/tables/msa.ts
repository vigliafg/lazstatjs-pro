import { copy } from '../reportCopy';
import { fmtEst, fmtP } from '../format';
import { showInt } from '../reportKit';
import type { TableSpec } from '../types';
import type { MsaResult } from '../kernels/msa';

const sourceLabel = (source: MsaResult['anova'][number]['source']): string => {
  switch (source) {
    case 'part':
      return copy('Parti');
    case 'operator':
      return copy('Operatori');
    case 'interaction':
      return copy('Interazione parte × operatore');
    case 'error':
      return copy('Ripetibilità (errore)');
    default:
      return copy('Totale');
  }
};

export const msaTables = (result: MsaResult, variableName: string): TableSpec[] => [
  {
    id: 'msa-anova',
    title: copy('ANOVA del sistema di misura'),
    subtitle: copy('{s1} · {s2} parti × {s3} operatori × {s4} repliche', {
      s1: variableName,
      s2: result.parts,
      s3: result.operators,
      s4: result.replicates,
    }),
    columns: [
      { key: 'source', label: copy('Fonte'), align: 'left' },
      { key: 'df', label: 'df', format: 'int', align: 'right' },
      { key: 'ss', label: copy('Somma dei quadrati'), format: 'dec4', align: 'right' },
      { key: 'ms', label: copy('Media quadratica'), format: 'dec4', align: 'right' },
      { key: 'f', label: 'F', format: 'dec3', align: 'right' },
      { key: 'p', label: 'p', format: 'p', align: 'right' },
    ],
    rows: result.anova.map(row => ({
      source: sourceLabel(row.source),
      df: row.df,
      ss: row.ss,
      ms: row.ms,
      f: row.f,
      p: row.p,
    })),
  },
  {
    id: 'msa-variance',
    title: copy('Componenti di varianza'),
    subtitle: copy('Gage R&R e variabilità delle parti'),
    columns: [
      { key: 'component', label: copy('Componente'), align: 'left' },
      { key: 'variance', label: copy('Varianza'), format: 'dec4', align: 'right' },
      { key: 'sd', label: copy('Deviazione standard'), format: 'dec4', align: 'right' },
      { key: 'contribution', label: copy('Contributo (%)'), format: 'dec1', align: 'right' },
      { key: 'study', label: copy('Studio (%)'), format: 'dec1', align: 'right' },
    ],
    rows: [
      {
        component: copy('Ripetibilità'),
        variance: result.variance.repeatability,
        sd: result.sd.repeatability,
        contribution: result.variance.total > 0 ? (100 * result.variance.repeatability) / result.variance.total : 0,
        study: result.sd.total > 0 ? (100 * result.sd.repeatability) / result.sd.total : 0,
      },
      {
        component: copy('Riproducibilità'),
        variance: result.variance.reproducibility,
        sd: result.sd.reproducibility,
        contribution: result.variance.total > 0 ? (100 * result.variance.reproducibility) / result.variance.total : 0,
        study: result.sd.total > 0 ? (100 * result.sd.reproducibility) / result.sd.total : 0,
      },
      {
        component: 'Gage R&R',
        variance: result.variance.grr,
        sd: result.sd.grr,
        contribution: result.pctContribution,
        study: result.pctStudyVariation,
      },
      {
        component: copy('Parti'),
        variance: result.variance.part,
        sd: result.sd.part,
        contribution: result.variance.total > 0 ? (100 * result.variance.part) / result.variance.total : 0,
        study: result.sd.total > 0 ? (100 * result.sd.part) / result.sd.total : 0,
      },
      {
        component: copy('Totale'),
        variance: result.variance.total,
        sd: result.sd.total,
        contribution: 100,
        study: 100,
      },
    ],
  },
  {
    id: 'msa-summary',
    title: copy('Sintesi dello studio'),
    subtitle: copy('{s1} osservazioni', { s1: result.n }),
    columns: [
      { key: 'metric', label: copy('Metrica'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { metric: copy('Parti'), value: showInt(result.parts) },
      { metric: copy('Operatori'), value: showInt(result.operators) },
      { metric: copy('Repliche per cella'), value: showInt(result.replicates) },
      { metric: 'Gage R&R (%)', value: fmtEst(result.pctStudyVariation, 1) },
      { metric: copy('Contributo del Gage R&R (%)'), value: fmtEst(result.pctContribution, 1) },
      { metric: copy('Numero di categorie distinte'), value: showInt(result.ndc) },
      { metric: copy('p operatore'), value: fmtP(result.operatorP ?? NaN) },
      { metric: copy('p interazione'), value: fmtP(result.interactionP ?? NaN) },
    ],
  },
];
