import { analysisRows, groupColumnIndexes, type Dataset, type GridData } from '../../grid/types';
import type { WizardParams } from '../../io/project';
import { profileColumns } from '../../stats/wizard';

const firstOfKind = (
  profiles: ReturnType<typeof profileColumns>,
  kind: 'numeric' | 'binary' | 'categorical',
  exclude: number[] = []
): number => {
  const found = profiles.find(profile => profile.kind === kind && !exclude.includes(profile.index));
  return found ? found.index : -1;
};

/** Griglia con i gruppi risolti nelle loro etichette (per profili e tabelle). */
export const wizardGrid = (grid: Dataset): GridData => ({
  cols: [...grid.cols],
  rows: analysisRows(grid, groupColumnIndexes(grid)),
});

/** Default storici: prima variabile numerica, poi binaria, per esito e gruppo. */
export const defaultWizardParams = (grid: GridData): WizardParams => {
  const analysisGrid = wizardGrid(grid);
  const profiles = profileColumns(analysisGrid.cols, analysisGrid.rows);
  const outcome = (() => {
    const numeric = firstOfKind(profiles, 'numeric');
    return numeric >= 0 ? numeric : firstOfKind(profiles, 'binary');
  })();
  const group = (() => {
    const binary = firstOfKind(profiles, 'binary', [outcome]);
    return binary >= 0 ? binary : firstOfKind(profiles, 'categorical', [outcome]);
  })();
  return {
    goal: 'compare',
    outcome,
    group,
    second: firstOfKind(profiles, 'numeric', [outcome]),
    paired: false,
  };
};
