import { leveneTest, lillieforsTest } from '../distributions';
import { columnStrings as toValues, parseNum } from '../core';
import { groupChecks, profileColumns, recommendWizard, sdOf } from '../kernels/wizard';
import { auditTable, checkTable, groupTable, selectionTable } from '../tables/wizard';
import { wizardReport } from '../reports/wizard';
import type { TableSpec } from '../types';
import type { WizardAnalysis, WizardContext, WizardSelection } from './types';

export const runWizard = (options: {
  columns: { name: string }[];
  rows: string[][];
  selection: WizardSelection;
  level: number;
}): WizardAnalysis => {
  const { columns, rows, selection, level } = options;
  const profiles = profileColumns(columns, rows);
  const outcomeProfile = selection.outcome >= 0 ? profiles[selection.outcome] ?? null : null;
  const secondProfile = selection.second >= 0 ? profiles[selection.second] ?? null : null;

  const groupValues =
    selection.group >= 0 ? toValues(rows, selection.group).map(value => value || null) : [];
  const groupLevels = Array.from(
    new Set(groupValues.filter((value): value is string => value !== null))
  ).sort();

  let outcomeValues: (number | null)[] = [];
  if (selection.outcome >= 0) {
    outcomeValues = rows.map(row => {
      const value = parseNum(row[selection.outcome]);
      return Number.isFinite(value) ? value : null;
    });
  }

  const groups = selection.group >= 0 && outcomeProfile?.kind === 'numeric'
    ? groupChecks(outcomeValues, groupValues)
    : [];

  let leveneP = NaN;
  if (groups.length >= 2) {
    const grouped = groupLevels.map(group =>
      outcomeValues.filter(
        (value, index) => value !== null && groupValues[index] === group
      ) as number[]
    );
    if (grouped.every(group => group.length >= 2)) leveneP = leveneTest(grouped).p;
  }

  let pairedDifferenceP = NaN;
  if (selection.paired && selection.second >= 0 && selection.outcome >= 0) {
    const differences: number[] = [];
    rows.forEach(row => {
      const first = parseNum(row[selection.outcome]);
      const second = parseNum(row[selection.second]);
      if (Number.isFinite(first) && Number.isFinite(second)) differences.push(first - second);
    });
    if (differences.length >= 8) {
      const sd = sdOf(differences);
      if (sd > 0) pairedDifferenceP = lillieforsTest(differences, 300).p;
    }
  }

  const context: WizardContext = {
    goal: selection.goal,
    outcome: outcomeProfile,
    second: secondProfile,
    groupLevels,
    groups,
    leveneP,
    pairedDifferenceP,
    paired: selection.paired,
    level,
  };
  const recommendation = recommendWizard(context);

  const tables: TableSpec[] = [auditTable(profiles, level)];
  if (groups.length > 0) tables.push(groupTable(groups));
  if (groups.length > 0 || pairedDifferenceP >= 0 || Number.isFinite(outcomeProfile?.normalityP ?? NaN)) {
    tables.push(checkTable(context));
  }
  tables.push(selectionTable(recommendation));

  const report = wizardReport(recommendation, tables, level, selection.goal);
  return { profiles, recommendation, tables, report };
};

