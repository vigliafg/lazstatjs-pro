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
  { id: 'describe', label: 'Descrivere i dati', hint: 'Centro, dispersione, forma' },
  { id: 'compare', label: 'Confrontare gruppi', hint: 'Differenze tra medie o distribuzioni' },
  { id: 'associate', label: 'Studiare un’associazione', hint: 'Due variabili si muovono insieme?' },
  { id: 'predict', label: 'Prevedere un esito', hint: 'Regressione, logistica o Cox' },
  { id: 'survive', label: 'Tempo fino a un evento', hint: 'Sopravvivenza e censura' },
  { id: 'forecast', label: 'Prevedere una serie', hint: 'Trend, stagionalità, ARIMA' },
  { id: 'plan', label: 'Pianificare lo studio', hint: 'Numerosità e potenza' },
];

export const goalLabel = (goal: WizardGoal): string => GOAL_LABELS[goal];
