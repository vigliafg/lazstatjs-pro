import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type { BlandAltmanResult, IccResult, KappaResult } from '../agreement/types';

export const iccTables = (stats: IccResult, level: number): TableSpec[] => [
  {
    id: 'agreement-icc',
    title: copy('Intraclass correlation'),
    subtitle: copy('{s1} soggetti × {s2} misure · CI {s3}%', { s1: stats.n, s2: stats.k, s3: level }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
    ],
    rows: [
      { metric: copy('ICC(1,1) one-way'), value: stats.icc11 },
      { metric: copy('ICC(2,1) absolute agreement'), value: stats.icc21 },
      { metric: copy('ICC(3,1) consistency'), value: stats.icc31 },
      { metric: copy('F'), value: stats.f },
      { metric: copy('p'), value: stats.p },
      { metric: copy('MS between subjects'), value: stats.msb },
      { metric: copy('MS between raters'), value: stats.msr },
      { metric: copy('MS residual'), value: stats.mse },
    ],
    notes: [
      copy('ICC(2,1) è il modello two-way random a effetti misti con accordo assoluto.'),
      copy('ICC(3,1) ignora la differenza sistematica tra rater (consistency).'),
    ],
  },
];

export const blandAltmanTables = (stats: BlandAltmanResult, level: number): TableSpec[] => [
  {
    id: 'agreement-bland',
    title: copy('Bland–Altman'),
    subtitle: copy('{s1} coppie · CI {s2}%', { s1: stats.n, s2: level }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
      { key: 'detail', label: copy('Dettaglio'), format: 'text' },
    ],
    rows: [
      { metric: copy('Bias'), value: stats.bias, detail: copy('media delle differenze') },
      { metric: copy('SD differenze'), value: stats.sd, detail: copy('dispersione delle differenze') },
      { metric: copy('Limite superiore'), value: stats.loaUpper, detail: copy('bias + 1.96·SD') },
      { metric: copy('Limite inferiore'), value: stats.loaLower, detail: copy('bias − 1.96·SD') },
      { metric: copy('CI bias low'), value: stats.biasLo, detail: '' },
      { metric: copy('CI bias high'), value: stats.biasHi, detail: '' },
      { metric: copy('CI limite sup. low'), value: stats.loaUpperLo, detail: '' },
      { metric: copy('CI limite sup. high'), value: stats.loaUpperHi, detail: '' },
      { metric: copy('CI limite inf. low'), value: stats.loaLowerLo, detail: '' },
      { metric: copy('CI limite inf. high'), value: stats.loaLowerHi, detail: '' },
      { metric: copy('Pendenza su media'), value: stats.slope, detail: copy('bias proporzionale') },
      { metric: copy('p pendenza'), value: stats.slopeP, detail: copy('H0: pendenza = 0') },
    ],
    notes: [
      copy('I limiti di accordo sono stimati come bias ± 1.96·SD; i loro CI usano l’approssimazione sqrt(3·SD²/n).'),
      copy('Una pendenza significativa indica che il bias cambia con la grandezza della misura.'),
    ],
  },
];

export const kappaTables = (stats: KappaResult, level: number): TableSpec[] => [
  {
    id: 'agreement-kappa',
    title: stats.raters === 2 ? copy('Cohen kappa') : copy('Fleiss kappa'),
    subtitle: copy('{s1} soggetti × {s2} rater · {s3} categorie · CI {s4}%', { s1: stats.n, s2: stats.raters, s3: stats.categories, s4: level }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
    ],
    rows: [
      { metric: copy('Accordo osservato'), value: stats.po },
      { metric: copy('Accordo atteso'), value: stats.pe },
      { metric: copy('Kappa'), value: stats.kappa },
      { metric: copy('SE'), value: stats.se },
      { metric: copy('z'), value: stats.z },
      { metric: copy('p'), value: stats.p },
      { metric: copy('CI low'), value: stats.lo },
      { metric: copy('CI high'), value: stats.hi },
    ],
    notes: [
      stats.weighted === 'none'
        ? copy('Kappa non pesata: tutte le discordanze contano allo stesso modo.')
        : copy('Kappa pesata {s1} sulle categorie ordinate.', { s1: stats.weighted === 'linear' ? 'lineare' : 'quadratica' }),
    ],
  },
];
