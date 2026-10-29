import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type { MixedAnovaStats } from '../mixedanova/types';

export const mixedAnovaTables = (
  stats: MixedAnovaStats,
  conditionNames: string[],
  groupName: string,
  level: number
): TableSpec[] => [
  {
    id: 'mixed-cells',
    title: copy('Medie cella'),
    subtitle: copy('{s1} gruppi × {s2} condizioni', { s1: stats.groups.length, s2: stats.conditions.length }),
    columns: [
      { key: 'group', label: copy('Gruppo'), format: 'text' },
      ...conditionNames.map((name, index) => ({
        key: copy('c{s1}', { s1: index }),
        label: name,
        format: 'dec3' as const,
      })),
      { key: 'mean', label: copy('Media'), format: 'dec3' },
    ],
    rows: stats.groups.map((group, gi) => ({
      group,
      ...Object.fromEntries(stats.cellMeans[gi].map((value, index) => [copy('c{s1}', { s1: index }), value])),
      mean: stats.groupMeans[gi],
    })),
    notes: [
      copy('Fattore between: {s1}. Fattore within: condizioni selezionate.', { s1: groupName }),
      copy('Una riga per soggetto; ogni soggetto deve avere tutte le condizioni.'),
    ],
  },
  {
    id: 'mixed-emmeans',
    title: copy('EM means (marginali non pesate)'),
    subtitle: copy('Stime bilanciate sui livelli dei fattori'),
    columns: [
      { key: 'factor', label: copy('Fattore'), format: 'text' },
      { key: 'level', label: copy('Livello'), format: 'text' },
      { key: 'emmean', label: copy('EM mean'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
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
      copy('Le EM means mediano i livelli dell’altro fattore con pesi uguali, quindi non coincidono con le medie grezze in un disegno sbilanciato.'),
      copy('Media marginale complessiva = {s1}.', { s1: stats.emMeans.grand }),
    ],
  },
  {
    id: 'mixed-anova',
    title: copy('ANOVA mista split-plot'),
    columns: [
      { key: 'source', label: copy('Fonte'), format: 'text' },
      { key: 'ss', label: copy('SS'), format: 'dec4' },
      { key: 'df', label: copy('df'), format: 'int' },
      { key: 'ms', label: copy('MS'), format: 'dec4' },
      { key: 'f', label: copy('F'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'eta2', label: copy('η² parziale'), format: 'dec3' },
    ],
    rows: stats.effects.map(effect => ({ ...effect })),
    notes: [
      copy('Il fattore between è testato sui soggetti within-groups; il fattore within e l’interazione sull’errore within.'),
      copy('Con più di due condizioni within l’assunzione di sfericità è controllata nella tabella dedicata.'),
    ],
  },
  {
    id: 'mixed-sphericity',
    title: copy('Sfericità e correzioni'),
    subtitle: copy('Mauchly · CI {s1}%', { s1: level }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
    ],
    rows: [
      { metric: copy('Mauchly W'), value: stats.sphericity.w },
      { metric: copy('Mauchly χ²'), value: stats.sphericity.chi2 },
      { metric: copy('df'), value: stats.sphericity.df },
      { metric: copy('p Mauchly'), value: stats.sphericity.p },
      { metric: copy('GG epsilon'), value: stats.sphericity.ggEpsilon },
      { metric: copy('HF epsilon'), value: stats.sphericity.hfEpsilon },
      { metric: copy('p Time (GG)'), value: stats.pGGTime },
      { metric: copy('p Group×Time (GG)'), value: stats.pGGInteraction },
    ],
    notes: [
      copy('Mauchly testa la sfericità della matrice di covarianza within.'),
      copy('Le p corrette GG usano epsilon di Greenhouse–Geisser; con epsilon vicino a 1 la correzione è minima.'),
    ],
  },
  {
    id: 'mixed-contrasts',
    title: copy('Contrasti pairwise (Holm)'),
    columns: [
      { key: 'source', label: copy('Fonte'), format: 'text' },
      { key: 'a', label: copy('A'), format: 'text' },
      { key: 'b', label: copy('B'), format: 'text' },
      { key: 'diff', label: copy('Differenza'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 't', label: copy('t'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'adjusted', label: copy('p Holm'), format: 'p' },
      { key: 'lo', label: copy('CI low'), format: 'dec4' },
      { key: 'hi', label: copy('CI high'), format: 'dec4' },
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
    notes: [copy('Confronti tra gruppi sulle medie marginali e tra condizioni within; p aggiustati con Holm.')],
  },
];
