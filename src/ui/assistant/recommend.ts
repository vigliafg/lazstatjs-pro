import { groupChecks, profileColumns, recommendWizard } from '../../stats/wizard';
import type { MessageKey } from '../../i18n';
import type { WizardContext, WizardGoal } from '../../stats/wizard/types';
import type { GridData } from '../../grid/types';
import { ASSISTANT_LEAF_BY_ANALYSIS, assistantLeaf } from './tree';

export interface AssistantRecommendation {
  leafId: string | null;
  /** Set when the kernel cannot name a procedure for this goal. */
  message: MessageKey | null;
}

const numericValue = (raw: string): number | null => {
  const text = String(raw ?? '').trim();
  if (text === '') return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
};

/** The kernel goal that matches the root answer of the Assistant path. */
export const goalForAnswers = (answers: readonly string[]): WizardGoal => {
  switch (answers[0]) {
    case 'describe':
      return 'describe';
    case 'associate':
      return 'associate';
    case 'predict':
      return 'predict';
    case 'time':
      return answers[1] === 'survival' ? 'survive' : 'forecast';
    case 'plan':
      return 'plan';
    case 'missing':
      return 'describe';
    default:
      return 'compare';
  }
};

/**
 * "I do not know": profile the columns, let the existing wizard kernel pick a
 * procedure for the current goal, then translate its answer into a leaf. When
 * the kernel has no candidate the caller receives an explicit message instead
 * of a silent no-op.
 */
export const recommendLeafForGrid = (
  grid: GridData,
  goal: WizardGoal = 'compare',
  level = 95
): AssistantRecommendation => {
  if (grid.cols.length === 0 || grid.rows.length === 0) {
    return { leafId: null, message: 'assistant.recommend.empty' };
  }
  const profiles = profileColumns(grid.cols, grid.rows);
  const numeric = profiles.filter(profile => profile.kind === 'numeric' && profile.n > 0);
  const outcome = numeric[0] ?? profiles.find(profile => profile.kind !== 'empty') ?? null;
  if (!outcome) return { leafId: null, message: 'assistant.recommend.none' };
  const second = numeric.find(profile => profile.index !== outcome.index) ?? null;
  const group =
    profiles.find(
      profile =>
        profile.index !== outcome.index &&
        (profile.kind === 'binary' || (profile.kind === 'categorical' && profile.unique <= 12))
    ) ?? null;

  const labels = group ? grid.rows.map(row => String(row[group.index] ?? '')) : [];
  const values = grid.rows.map(row => numericValue(row[outcome.index] ?? ''));
  const context: WizardContext = {
    goal,
    outcome,
    second,
    groupLevels: group?.levels ?? [],
    groups: group ? groupChecks(values, labels) : [],
    leveneP: NaN,
    pairedDifferenceP: NaN,
    paired: false,
    level,
  };

  try {
    const recommendation = recommendWizard(context);
    const mapped = ASSISTANT_LEAF_BY_ANALYSIS[recommendation.analysis] ?? null;
    const leafId = mapped ?? (assistantLeaf(recommendation.analysis) ? recommendation.analysis : null);
    if (leafId && assistantLeaf(leafId)) return { leafId, message: null };
    return { leafId: null, message: 'assistant.recommend.none' };
  } catch {
    return { leafId: null, message: 'assistant.recommend.none' };
  }
};
