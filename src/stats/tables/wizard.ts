import { isDecided } from '../reportKit';
import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { ColumnProfile, GroupCheck, WizardContext, WizardRecommendation } from '../wizard/types';

export const auditTable = (profiles: ColumnProfile[], level: number): TableSpec => ({
  id: 'wiz-audit',
  title: copy('Audit delle colonne'),
  subtitle: copy('{s1} colonne · classificazione automatica', { s1: profiles.length }),
  columns: [
    { key: 'column', label: copy('Colonna'), format: 'text' },
    { key: 'kind', label: copy('Tipo'), format: 'text' },
    { key: 'n', label: copy('N'), format: 'int' },
    { key: 'missing', label: copy('Mancanti'), format: 'int' },
    { key: 'unique', label: copy('Livelli'), format: 'int' },
    { key: 'min', label: copy('Min'), format: 'dec3' },
    { key: 'max', label: copy('Max'), format: 'dec3' },
    { key: 'mean', label: copy('Media'), format: 'dec3' },
    { key: 'sd', label: copy('SD'), format: 'dec3' },
    { key: 'normalityP', label: copy('Normalità p'), format: 'p' },
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
    copy('Tipo numerico: almeno il 95% dei valori non vuoti è numerico. Binaria: due soli livelli.'),
    copy('Il p di normalità è il test di Lilliefors (α = {s1}): con pochi dati ha poca potenza, con molti è iper-sensibile.', { s1: (1 - level / 100).toFixed(2) }),
  ],
});

export const groupTable = (groups: GroupCheck[]): TableSpec => ({
  id: 'wiz-groups',
  title: copy('Esito per gruppo'),
  columns: [
    { key: 'level', label: copy('Gruppo'), format: 'text' },
    { key: 'n', label: copy('N'), format: 'int' },
    { key: 'mean', label: copy('Media'), format: 'dec3' },
    { key: 'sd', label: copy('SD'), format: 'dec3' },
    { key: 'normalityP', label: copy('Normalità p'), format: 'p' },
  ],
  rows: groups.map(group => ({ ...group })),
  notes: [copy('Le medie descrivono i gruppi; il test scelto dal wizard confronta medie o ranghi a seconda delle assunzioni.')],
});

export const checkTable = (context: WizardContext): TableSpec => {
  const rows: TableSpec['rows'] = [];
  if (Number.isFinite(context.leveneP)) {
    rows.push({
      check: copy('Levene (uguaglianza delle varianze)'),
      statistic: context.leveneP,
      p: context.leveneP,
      reading: isDecided(context.leveneP, context.level)
        ? copy('varianze diverse: Welch o test dei ranghi')
        : copy('varianze compatibili'),
    });
  }
  if (context.outcome && Number.isFinite(context.outcome.normalityP)) {
    rows.push({
      check: copy('Normalità di {s1}', { s1: context.outcome.name }),
      statistic: context.outcome.normalityP,
      p: context.outcome.normalityP,
      reading: isDecided(context.outcome.normalityP, context.level)
        ? copy('normalità rifiutata')
        : copy('compatibile con la gaussiana'),
    });
  }
  if (context.paired && Number.isFinite(context.pairedDifferenceP)) {
    rows.push({
      check: copy('Normalità delle differenze appaiate'),
      statistic: context.pairedDifferenceP,
      p: context.pairedDifferenceP,
      reading: isDecided(context.pairedDifferenceP, context.level)
        ? copy('differenze non gaussiane')
        : copy('differenze compatibili con la gaussiana'),
    });
  }
  return {
    id: 'wiz-checks',
    title: copy('Controlli sulle assunzioni'),
    subtitle: context.groups.length > 0 ? copy('{s1} gruppi', { s1: context.groups.length }) : copy('nessun gruppo selezionato'),
    columns: [
      { key: 'check', label: copy('Controllo'), format: 'text' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'reading', label: copy('Lettura'), format: 'text' },
    ],
    rows: rows.map(row => ({ check: row.check, p: row.p, reading: row.reading })),
    notes: [copy('I controlli sono di screening: con pochi dati i test di normalità hanno poca potenza, con molti sono iper-sensibili.')],
  };
};

export const selectionTable = (recommendation: WizardRecommendation): TableSpec => ({
  id: 'wiz-path',
  title: copy('Percorso consigliato'),
  subtitle: copy('{s1} · {s2}', { s1: recommendation.tabLabel, s2: recommendation.title }),
  columns: [
    { key: 'step', label: copy('Passo'), format: 'int' },
    { key: 'action', label: copy('Cosa fare'), format: 'text' },
  ],
  rows: [
    ...recommendation.selection.map((item, index) => ({ step: index + 1, action: item })),
    { step: recommendation.selection.length + 1, action: copy('Apri {s1} e premi Run Analysis.', { s1: recommendation.tabLabel }) },
  ],
  notes: [copy('Alternativa: {s1}', { s1: recommendation.alternative })],
});

