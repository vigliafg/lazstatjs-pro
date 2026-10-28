import type { TableSpec } from '../types';
import type { MixedAnovaStats } from '../mixedanova/types';

export const mixedAnovaTables = (
  stats: MixedAnovaStats,
  conditionNames: string[],
  groupName: string
): TableSpec[] => [
  {
    id: 'mixed-cells',
    title: 'Medie cella',
    subtitle: `${stats.groups.length} gruppi × ${stats.conditions.length} condizioni`,
    columns: [
      { key: 'group', label: 'Gruppo', format: 'text' },
      ...conditionNames.map((name, index) => ({
        key: `c${index}`,
        label: name,
        format: 'dec3' as const,
      })),
      { key: 'mean', label: 'Media', format: 'dec3' },
    ],
    rows: stats.groups.map((group, gi) => ({
      group,
      ...Object.fromEntries(stats.cellMeans[gi].map((value, index) => [`c${index}`, value])),
      mean: stats.groupMeans[gi],
    })),
    notes: [
      `Fattore between: ${groupName}. Fattore within: condizioni selezionate.`,
      'Una riga per soggetto; ogni soggetto deve avere tutte le condizioni.',
    ],
  },
  {
    id: 'mixed-anova',
    title: 'ANOVA mista split-plot',
    columns: [
      { key: 'source', label: 'Fonte', format: 'text' },
      { key: 'ss', label: 'SS', format: 'dec4' },
      { key: 'df', label: 'df', format: 'int' },
      { key: 'ms', label: 'MS', format: 'dec4' },
      { key: 'f', label: 'F', format: 'dec3' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'eta2', label: 'η² parziale', format: 'dec3' },
    ],
    rows: stats.effects.map(effect => ({ ...effect })),
    notes: [
      'Il fattore between è testato sui soggetti within-groups; il fattore within e l’interazione sull’errore within.',
      'Con più di due condizioni within l’assunzione di sfericità va controllata: qui non è applicata una correzione automatica.',
    ],
  },
];
