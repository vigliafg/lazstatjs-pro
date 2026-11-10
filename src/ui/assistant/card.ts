import type { AnalysisRunResult } from '../../analyses/types';
import type { MessageKey } from '../../i18n';
import { t } from '../../i18n';
import type { AssistantRunMeta } from '../../io/outputs';
import type { TableRow, TableSpec } from '../../stats/types';

/**
 * Report Card: the checks Minitab prints next to a run.
 *
 * The card reads the tables the run already produced; it never recomputes a
 * test. A check is skipped when its table is missing, so a procedure without
 * automatic checks shows an explicit "read the report" note instead of a
 * misleading green light.
 */

export type CheckStatus = 'ok' | 'warn' | 'fail' | 'info';

export const CARD_THRESHOLDS = {
  minGroupN: 15,
  minRankN: 10,
  minDescriptiveN: 30,
  minCorrelationN: 20,
  pointsPerPredictor: 10,
  maxVif: 10,
  minExpected: 5,
  minPower: 0.8,
  maxCook: 1,
} as const;

export interface AssistantCardCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface AssistantCardSpec {
  id: 'assistant-card';
  title: string;
  headline: string;
  status: CheckStatus;
  checks: AssistantCardCheck[];
  nextSteps: string[];
  leafId?: string;
}

const STATUS_KEY: Record<CheckStatus, MessageKey> = {
  ok: 'assistant.status.ok',
  warn: 'assistant.status.warn',
  fail: 'assistant.status.fail',
  info: 'assistant.status.info',
};

const HEADLINE_KEY: Record<CheckStatus, MessageKey> = {
  ok: 'assistant.card.ok',
  warn: 'assistant.card.warn',
  fail: 'assistant.card.fail',
  info: 'assistant.card.info',
};

const NEXT_KEY: Record<string, MessageKey> = {
  sample: 'assistant.next.sample',
  assumptions: 'assistant.next.assumptions',
  vif: 'assistant.next.vif',
  influence: 'assistant.next.influence',
  expected: 'assistant.next.expected',
  power: 'assistant.next.power',
};

const tableOf = (tables: TableSpec[], id: string): TableSpec | undefined =>
  tables.find(table => table.id === id);
const rowsOf = (tables: TableSpec[], id: string): TableRow[] => tableOf(tables, id)?.rows ?? [];
const num = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? value : NaN);
const finite = (values: number[]): number[] => values.filter(value => Number.isFinite(value));
const pText = (value: number): string => (value < 0.001 ? '< 0.001' : value.toFixed(3));

export const cardStatusLabel = (status: CheckStatus): string => t(STATUS_KEY[status]);

const worst = (checks: AssistantCardCheck[]): CheckStatus =>
  checks.some(check => check.status === 'fail')
    ? 'fail'
    : checks.some(check => check.status === 'warn')
      ? 'warn'
      : checks.some(check => check.status === 'ok')
        ? 'ok'
        : 'info';

const sampleCheck = (n: number, min: number): AssistantCardCheck => ({
  id: 'sample',
  label: t('assistant.check.sample'),
  status: n >= min ? 'ok' : n >= Math.max(5, Math.ceil(min / 2)) ? 'warn' : 'fail',
  detail: t('assistant.check.n', { n: Math.round(n), min }),
});

const assumptionsCheck = (rows: TableRow[], alpha: number): AssistantCardCheck | null => {
  const tested = rows
    .map(row => ({ label: String(row.check ?? row.metric ?? ''), p: num(row.p) }))
    .filter(row => Number.isFinite(row.p));
  if (tested.length === 0) return null;
  const significant = tested.filter(row => row.p < alpha);
  return {
    id: 'assumptions',
    label: t('assistant.check.assumptions'),
    status: significant.length === 0 ? 'ok' : 'warn',
    detail:
      significant.length === 0
        ? t('assistant.check.assumptionsOk', { alpha: alpha.toFixed(2) })
        : significant
            .map(row =>
              t('assistant.check.assumptionWarn', {
                label: row.label,
                p: pText(row.p),
                alpha: alpha.toFixed(2),
              })
            )
            .join(' · '),
  };
};

const firstPower = (tables: TableSpec[]): number => {
  const spec = tableOf(tables, 'ss-result');
  if (!spec) return NaN;
  const key =
    spec.columns.find(column => /power/i.test(column.key))?.key ??
    spec.columns.find(column => column.key === 'value')?.key;
  const values = key ? finite(spec.rows.map(row => num(row[key]))) : [];
  return values.length > 0 ? values[0] : NaN;
};

const genericSampleCheck = (tables: TableSpec[]): AssistantCardCheck | null => {
  const ns = finite(tables.flatMap(table => table.rows.map(row => num(row.n))));
  return ns.length > 0 ? sampleCheck(Math.min(...ns), CARD_THRESHOLDS.minRankN) : null;
};

const checksFor = (analysisId: string, tables: TableSpec[], alpha: number): AssistantCardCheck[] => {
  const checks: AssistantCardCheck[] = [];

  if (analysisId === 'descriptive') {
    const ns = finite(rowsOf(tables, 'desc-location').map(row => num(row.n)));
    if (ns.length > 0) {
      const n = Math.min(...ns);
      checks.push({
        id: 'sample',
        label: t('assistant.check.sample'),
        status: n >= CARD_THRESHOLDS.minDescriptiveN ? 'ok' : 'warn',
        detail: t('assistant.check.descriptiveN', { n, min: CARD_THRESHOLDS.minDescriptiveN }),
      });
    }
    return checks;
  }

  if (analysisId === 'ttest') {
    const ns = finite(rowsOf(tables, 'ttest-sample').map(row => num(row.n)));
    if (ns.length > 0) checks.push(sampleCheck(Math.min(...ns), CARD_THRESHOLDS.minGroupN));
    const assumptions = assumptionsCheck(rowsOf(tables, 'ttest-assumptions'), alpha);
    if (assumptions) checks.push(assumptions);
    return checks;
  }

  if (analysisId === 'anova') {
    const ns = finite(rowsOf(tables, 'anova-groups').map(row => num(row.n)));
    if (ns.length > 0) checks.push(sampleCheck(Math.min(...ns), CARD_THRESHOLDS.minGroupN));
    const assumptions = assumptionsCheck(rowsOf(tables, 'anova-assumptions'), alpha);
    if (assumptions) checks.push(assumptions);
    return checks;
  }

  if (analysisId === 'nonparamrm') {
    const ns = finite(tables.flatMap(table => table.rows.map(row => num(row.n))));
    if (ns.length > 0) checks.push(sampleCheck(Math.min(...ns), CARD_THRESHOLDS.minRankN));
    return checks;
  }

  if (analysisId === 'correlation') {
    const ns = finite(rowsOf(tables, 'corr-descriptives').map(row => num(row.n)));
    if (ns.length > 0) {
      const n = Math.min(...ns);
      checks.push({
        id: 'sample',
        label: t('assistant.check.sample'),
        status: n >= CARD_THRESHOLDS.minCorrelationN ? 'ok' : 'warn',
        detail: t('assistant.check.correlationN', { n, min: CARD_THRESHOLDS.minCorrelationN }),
      });
    }
    return checks;
  }

  if (analysisId === 'regression' || analysisId === 'glm') {
    const coefficients = rowsOf(tables, 'reg-coefficients');
    const predictors = Math.max(1, coefficients.length - 1);
    const n = num(rowsOf(tables, 'reg-residuals')[0]?.ols);
    if (Number.isFinite(n)) {
      const min = CARD_THRESHOLDS.pointsPerPredictor * (predictors + 1);
      checks.push({
        id: 'sample',
        label: t('assistant.check.sample'),
        status: n >= min ? 'ok' : 'warn',
        detail: t('assistant.check.predictors', { n: Math.round(n), k: predictors, min }),
      });
    }
    const vif = finite(coefficients.map(row => num(row.vif)));
    if (vif.length > 0) {
      const largest = Math.max(...vif);
      checks.push({
        id: 'vif',
        label: t('assistant.check.vifLabel'),
        status: largest <= CARD_THRESHOLDS.maxVif ? 'ok' : 'warn',
        detail: t('assistant.check.vif', { value: largest.toFixed(1), max: CARD_THRESHOLDS.maxVif }),
      });
    }
    const diagnostics = rowsOf(tables, 'reg-diagnostics');
    const cook = num(diagnostics[2]?.value);
    if (Number.isFinite(cook)) {
      checks.push({
        id: 'influence',
        label: t('assistant.check.influenceLabel'),
        status: cook > 0 ? 'warn' : 'ok',
        detail: t('assistant.check.cooks', { count: Math.round(cook) }),
      });
    }
    const hetero = num(diagnostics[4]?.value);
    if (Number.isFinite(hetero)) {
      checks.push({
        id: 'assumptions',
        label: t('assistant.check.assumptions'),
        status: hetero < alpha ? 'warn' : 'ok',
        detail: t('assistant.check.hetero', { p: pText(hetero), alpha: alpha.toFixed(2) }),
      });
    }
    return checks;
  }

  if (analysisId === 'chisquare') {
    const assumptions = rowsOf(tables, 'chisq-assumptions');
    const expected = num(assumptions[0]?.value);
    if (Number.isFinite(expected)) {
      checks.push({
        id: 'expected',
        label: t('assistant.check.expectedLabel'),
        status: expected >= CARD_THRESHOLDS.minExpected ? 'ok' : 'warn',
        detail: t('assistant.check.expected', {
          value: expected.toFixed(2),
          min: CARD_THRESHOLDS.minExpected,
        }),
      });
    }
    return checks;
  }

  if (analysisId === 'samplesize') {
    const power = firstPower(tables);
    if (Number.isFinite(power)) {
      checks.push({
        id: 'power',
        label: t('assistant.check.powerLabel'),
        status: power >= CARD_THRESHOLDS.minPower ? 'ok' : 'warn',
        detail: t('assistant.check.power', {
          value: power.toFixed(2),
          target: CARD_THRESHOLDS.minPower.toFixed(2),
        }),
      });
    }
    return checks;
  }

  const generic = genericSampleCheck(tables);
  if (generic) checks.push(generic);
  return checks;
};

/** Builds the card of one run; `null` when the result is not a successful run. */
export const buildAssistantCard = (
  result: AnalysisRunResult,
  analysisId: string,
  meta?: AssistantRunMeta
): AssistantCardSpec | null => {
  if ('reason' in result) return null;
  const alpha = 1 - (meta?.ciLevel ?? 95) / 100;
  const checks = checksFor(analysisId, result.tables, alpha);
  if (checks.length === 0) {
    checks.push({
      id: 'info',
      label: t('assistant.check.noChecksLabel'),
      status: 'info',
      detail: t('assistant.check.noChecks'),
    });
  }
  const status = worst(checks);
  const nextSteps = Array.from(
    new Set(
      checks
        .filter(check => check.status === 'warn' || check.status === 'fail')
        .map(check => NEXT_KEY[check.id])
        .filter((key): key is MessageKey => Boolean(key))
        .map(key => t(key))
    )
  );
  return {
    id: 'assistant-card',
    title: t('assistant.cardTitle'),
    headline: t(HEADLINE_KEY[status]),
    status,
    checks,
    nextSteps,
    ...(meta?.leafId ? { leafId: meta.leafId } : {}),
  };
};
