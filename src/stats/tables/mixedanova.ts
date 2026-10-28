import type { TableSpec } from '../types';
import type { MixedAnovaStats } from '../mixedanova/types';

export const mixedAnovaTables = (
  stats: MixedAnovaStats,
  conditionNames: string[],
  groupName: string,
  level: number
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
    id: 'mixed-emmeans',
    title: 'EM means (marginali non pesate)',
    subtitle: 'Stime bilanciate sui livelli dei fattori',
    columns: [
      { key: 'factor', label: 'Fattore', format: 'text' },
      { key: 'level', label: 'Livello', format: 'text' },
      { key: 'emmean', label: 'EM mean', format: 'dec4' },
      { key: 'se', label: 'SE', format: 'dec4' },
    ],
    rows: [
      ...stats.groups.map((group, index) => ({
        factor: groupName,
        level: group,
        emmean: stats.emMeans.groups[index],
        se: stats.emMeans.groupSe[index],
      })),
      ...conditionNames.map((name, index) => ({
        factor: 'Time',
        level: name,
        emmean: stats.emMeans.conditions[index],
        se: stats.emMeans.conditionSe[index],
      })),
    ],
    notes: [
      'Le EM means mediano i livelli dell’altro fattore con pesi uguali, quindi non coincidono con le medie grezze in un disegno sbilanciato.',
      `Media marginale complessiva = ${stats.emMeans.grand}.`,
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
      'Con più di due condizioni within l’assunzione di sfericità è controllata nella tabella dedicata.',
    ],
  },
  {
    id: 'mixed-sphericity',
    title: 'Sfericità e correzioni',
    subtitle: `Mauchly · CI ${level}%`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
    ],
    rows: [
      { metric: 'Mauchly W', value: stats.sphericity.w },
      { metric: 'Mauchly χ²', value: stats.sphericity.chi2 },
      { metric: 'df', value: stats.sphericity.df },
      { metric: 'p Mauchly', value: stats.sphericity.p },
      { metric: 'GG epsilon', value: stats.sphericity.ggEpsilon },
      { metric: 'HF epsilon', value: stats.sphericity.hfEpsilon },
      { metric: 'p Time (GG)', value: stats.pGGTime },
      { metric: 'p Group×Time (GG)', value: stats.pGGInteraction },
    ],
    notes: [
      'Mauchly testa la sfericità della matrice di covarianza within.',
      'Le p corrette GG usano epsilon di Greenhouse–Geisser; con epsilon vicino a 1 la correzione è minima.',
    ],
  },
  {
    id: 'mixed-contrasts',
    title: 'Contrasti pairwise (Holm)',
    columns: [
      { key: 'source', label: 'Fonte', format: 'text' },
      { key: 'a', label: 'A', format: 'text' },
      { key: 'b', label: 'B', format: 'text' },
      { key: 'diff', label: 'Differenza', format: 'dec4' },
      { key: 'se', label: 'SE', format: 'dec4' },
      { key: 't', label: 't', format: 'dec3' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'adjusted', label: 'p Holm', format: 'p' },
      { key: 'lo', label: 'CI low', format: 'dec4' },
      { key: 'hi', label: 'CI high', format: 'dec4' },
    ],
    rows: stats.contrasts.map(contrast => ({
      ...contrast,
      a: contrast.source === 'Time'
        ? conditionNames[Number(contrast.a.slice(1)) - 1] ?? contrast.a
        : contrast.a,
      b: contrast.source === 'Time'
        ? conditionNames[Number(contrast.b.slice(1)) - 1] ?? contrast.b
        : contrast.b,
    })),
    notes: ['Confronti tra gruppi sulle medie marginali e tra condizioni within; p aggiustati con Holm.'],
  },
];
