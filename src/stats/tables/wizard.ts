import { isDecided } from '../reportKit';
import type { TableSpec } from '../types';
import type { ColumnProfile, GroupCheck, WizardContext, WizardRecommendation } from '../wizard/types';

export const auditTable = (profiles: ColumnProfile[], level: number): TableSpec => ({
  id: 'wiz-audit',
  title: 'Audit delle colonne',
  subtitle: `${profiles.length} colonne · classificazione automatica`,
  columns: [
    { key: 'column', label: 'Colonna', format: 'text' },
    { key: 'kind', label: 'Tipo', format: 'text' },
    { key: 'n', label: 'N', format: 'int' },
    { key: 'missing', label: 'Mancanti', format: 'int' },
    { key: 'unique', label: 'Livelli', format: 'int' },
    { key: 'min', label: 'Min', format: 'dec3' },
    { key: 'max', label: 'Max', format: 'dec3' },
    { key: 'mean', label: 'Media', format: 'dec3' },
    { key: 'sd', label: 'SD', format: 'dec3' },
    { key: 'normalityP', label: 'Normalità p', format: 'p' },
  ],
  rows: profiles.map(profile => ({
    column: profile.name,
    kind:
      profile.kind === 'numeric'
        ? 'numerica'
        : profile.kind === 'binary'
          ? 'binaria'
          : profile.kind === 'categorical'
            ? 'categorica'
            : 'vuota',
    n: profile.n,
    missing: profile.missing,
    unique: profile.unique,
    min: profile.min,
    max: profile.max,
    mean: profile.mean,
    sd: profile.sd,
    normalityP: profile.normalityP,
  })),
  notes: [
    'Tipo numerico: almeno il 95% dei valori non vuoti è numerico. Binaria: due soli livelli.',
    `Il p di normalità è il test di Lilliefors (α = ${(1 - level / 100).toFixed(2)}): con pochi dati ha poca potenza, con molti è iper-sensibile.`,
  ],
});

export const groupTable = (groups: GroupCheck[]): TableSpec => ({
  id: 'wiz-groups',
  title: 'Esito per gruppo',
  columns: [
    { key: 'level', label: 'Gruppo', format: 'text' },
    { key: 'n', label: 'N', format: 'int' },
    { key: 'mean', label: 'Media', format: 'dec3' },
    { key: 'sd', label: 'SD', format: 'dec3' },
    { key: 'normalityP', label: 'Normalità p', format: 'p' },
  ],
  rows: groups.map(group => ({ ...group })),
  notes: ['Le medie descrivono i gruppi; il test scelto dal wizard confronta medie o ranghi a seconda delle assunzioni.'],
});

export const checkTable = (context: WizardContext): TableSpec => {
  const rows: TableSpec['rows'] = [];
  if (Number.isFinite(context.leveneP)) {
    rows.push({
      check: 'Levene (uguaglianza delle varianze)',
      statistic: context.leveneP,
      p: context.leveneP,
      reading: isDecided(context.leveneP, context.level)
        ? 'varianze diverse: Welch o test dei ranghi'
        : 'varianze compatibili',
    });
  }
  if (context.outcome && Number.isFinite(context.outcome.normalityP)) {
    rows.push({
      check: `Normalità di ${context.outcome.name}`,
      statistic: context.outcome.normalityP,
      p: context.outcome.normalityP,
      reading: isDecided(context.outcome.normalityP, context.level)
        ? 'normalità rifiutata'
        : 'compatibile con la gaussiana',
    });
  }
  if (context.paired && Number.isFinite(context.pairedDifferenceP)) {
    rows.push({
      check: 'Normalità delle differenze appaiate',
      statistic: context.pairedDifferenceP,
      p: context.pairedDifferenceP,
      reading: isDecided(context.pairedDifferenceP, context.level)
        ? 'differenze non gaussiane'
        : 'differenze compatibili con la gaussiana',
    });
  }
  return {
    id: 'wiz-checks',
    title: 'Controlli sulle assunzioni',
    subtitle: context.groups.length > 0 ? `${context.groups.length} gruppi` : 'nessun gruppo selezionato',
    columns: [
      { key: 'check', label: 'Controllo', format: 'text' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'reading', label: 'Lettura', format: 'text' },
    ],
    rows: rows.map(row => ({ check: row.check, p: row.p, reading: row.reading })),
    notes: ['I controlli sono di screening: con pochi dati i test di normalità hanno poca potenza, con molti sono iper-sensibili.'],
  };
};

export const selectionTable = (recommendation: WizardRecommendation): TableSpec => ({
  id: 'wiz-path',
  title: 'Percorso consigliato',
  subtitle: `${recommendation.tabLabel} · ${recommendation.title}`,
  columns: [
    { key: 'step', label: 'Passo', format: 'int' },
    { key: 'action', label: 'Cosa fare', format: 'text' },
  ],
  rows: [
    ...recommendation.selection.map((item, index) => ({ step: index + 1, action: item })),
    { step: recommendation.selection.length + 1, action: `Apri ${recommendation.tabLabel} e premi Run Analysis.` },
  ],
  notes: [`Alternativa: ${recommendation.alternative}`],
});

