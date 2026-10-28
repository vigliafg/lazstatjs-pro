import type { TableSpec } from '../types';
import type { BlandAltmanResult, IccResult, KappaResult } from '../agreement/types';

export const iccTables = (stats: IccResult, level: number): TableSpec[] => [
  {
    id: 'agreement-icc',
    title: 'Intraclass correlation',
    subtitle: `${stats.n} soggetti × ${stats.k} misure · CI ${level}%`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
    ],
    rows: [
      { metric: 'ICC(1,1) one-way', value: stats.icc11 },
      { metric: 'ICC(2,1) absolute agreement', value: stats.icc21 },
      { metric: 'ICC(3,1) consistency', value: stats.icc31 },
      { metric: 'F', value: stats.f },
      { metric: 'p', value: stats.p },
      { metric: 'MS between subjects', value: stats.msb },
      { metric: 'MS between raters', value: stats.msr },
      { metric: 'MS residual', value: stats.mse },
    ],
    notes: [
      'ICC(2,1) è il modello two-way random a effetti misti con accordo assoluto.',
      'ICC(3,1) ignora la differenza sistematica tra rater (consistency).',
    ],
  },
];

export const blandAltmanTables = (stats: BlandAltmanResult, level: number): TableSpec[] => [
  {
    id: 'agreement-bland',
    title: 'Bland–Altman',
    subtitle: `${stats.n} coppie · CI ${level}%`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
      { key: 'detail', label: 'Dettaglio', format: 'text' },
    ],
    rows: [
      { metric: 'Bias', value: stats.bias, detail: 'media delle differenze' },
      { metric: 'SD differenze', value: stats.sd, detail: 'dispersione delle differenze' },
      { metric: 'Limite superiore', value: stats.loaUpper, detail: 'bias + 1.96·SD' },
      { metric: 'Limite inferiore', value: stats.loaLower, detail: 'bias − 1.96·SD' },
      { metric: 'CI bias low', value: stats.biasLo, detail: '' },
      { metric: 'CI bias high', value: stats.biasHi, detail: '' },
      { metric: 'CI limite sup. low', value: stats.loaUpperLo, detail: '' },
      { metric: 'CI limite sup. high', value: stats.loaUpperHi, detail: '' },
      { metric: 'CI limite inf. low', value: stats.loaLowerLo, detail: '' },
      { metric: 'CI limite inf. high', value: stats.loaLowerHi, detail: '' },
      { metric: 'Pendenza su media', value: stats.slope, detail: 'bias proporzionale' },
      { metric: 'p pendenza', value: stats.slopeP, detail: 'H0: pendenza = 0' },
    ],
    notes: [
      'I limiti di accordo sono stimati come bias ± 1.96·SD; i loro CI usano l’approssimazione sqrt(3·SD²/n).',
      'Una pendenza significativa indica che il bias cambia con la grandezza della misura.',
    ],
  },
];

export const kappaTables = (stats: KappaResult, level: number): TableSpec[] => [
  {
    id: 'agreement-kappa',
    title: stats.raters === 2 ? 'Cohen kappa' : 'Fleiss kappa',
    subtitle: `${stats.n} soggetti × ${stats.raters} rater · ${stats.categories} categorie · CI ${level}%`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
    ],
    rows: [
      { metric: 'Accordo osservato', value: stats.po },
      { metric: 'Accordo atteso', value: stats.pe },
      { metric: 'Kappa', value: stats.kappa },
      { metric: 'SE', value: stats.se },
      { metric: 'z', value: stats.z },
      { metric: 'p', value: stats.p },
      { metric: 'CI low', value: stats.lo },
      { metric: 'CI high', value: stats.hi },
    ],
    notes: [
      stats.weighted === 'none'
        ? 'Kappa non pesata: tutte le discordanze contano allo stesso modo.'
        : `Kappa pesata ${stats.weighted === 'linear' ? 'lineare' : 'quadratica'} sulle categorie ordinate.`,
    ],
  },
];
