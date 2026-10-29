import type { WizardGoal } from './types';

export const GOAL_LABELS: Record<WizardGoal, string> = {
  describe: 'descrivere i dati',
  compare: 'confrontare gruppi',
  associate: 'studiare un’associazione',
  predict: 'prevedere un esito',
  survive: 'analizzare il tempo fino a un evento',
  forecast: 'prevedere una serie temporale',
  plan: 'pianificare la numerosità campionaria',
};

export const WIZARD_GOALS: { id: WizardGoal; label: string; hint: string }[] = [
  { id: 'describe', label: 'Describe the data', hint: 'Centre, spread, shape' },
  { id: 'compare', label: 'Compare groups', hint: 'Differences between means or distributions' },
  { id: 'associate', label: 'Study an association', hint: 'Do two variables move together?' },
  { id: 'predict', label: 'Predict an outcome', hint: 'Regression, logistic or Cox' },
  { id: 'survive', label: 'Time to an event', hint: 'Survival and censoring' },
  { id: 'forecast', label: 'Forecast a series', hint: 'Trend, seasonality, ARIMA' },
  { id: 'plan', label: 'Plan the study', hint: 'Sample size and power' },
];

export const goalLabel = (goal: WizardGoal): string => GOAL_LABELS[goal];
