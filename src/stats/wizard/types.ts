import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

export type WizardGoal = 'describe' | 'compare' | 'associate' | 'predict' | 'survive' | 'forecast' | 'plan';

export type ColumnKind = 'numeric' | 'binary' | 'categorical' | 'empty';

export interface ColumnProfile {
  index: number;
  name: string;
  kind: ColumnKind;
  n: number;
  missing: number;
  unique: number;
  levels: string[];
  min: number;
  max: number;
  mean: number;
  sd: number;
  normalityP: number;
}

export interface GroupCheck {
  level: string;
  n: number;
  mean: number;
  sd: number;
  normalityP: number;
}

export interface WizardSelection {
  goal: WizardGoal;
  /** Column index of the outcome, or -1. */
  outcome: number;
  /** Column index of the grouping variable, or -1. */
  group: number;
  /** Column index of the second numeric variable, or -1. */
  second: number;
  paired: boolean;
}

export interface WizardRecommendation {
  analysis: string;
  tabLabel: string;
  title: string;
  headline: string;
  why: string[];
  selection: string[];
  alternative: string;
  checks: string[];
  parametric: boolean;
}

export interface WizardAnalysis {
  profiles: ColumnProfile[];
  recommendation: WizardRecommendation;
  tables: TableSpec[];
  report: ReportSpec;
}


export interface WizardContext {
  goal: WizardGoal;
  outcome: ColumnProfile | null;
  second: ColumnProfile | null;
  groupLevels: string[];
  groups: GroupCheck[];
  leveneP: number;
  pairedDifferenceP: number;
  paired: boolean;
  level: number;
}
