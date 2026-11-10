import { AlertTriangle, CheckCircle2, Info, ShieldCheck, XCircle } from 'lucide-react';
import { t } from '../../i18n';
import { cardStatusLabel, type AssistantCardSpec, type CheckStatus } from './card';

const DOT: Record<CheckStatus, string> = {
  ok: 'text-green',
  warn: 'text-yellow',
  fail: 'text-red',
  info: 'text-text3',
};

const BORDER: Record<CheckStatus, string> = {
  ok: 'border-l-green',
  warn: 'border-l-yellow',
  fail: 'border-l-red',
  info: 'border-l-border2',
};

const ICON: Record<CheckStatus, typeof Info> = {
  ok: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
  info: Info,
};

/**
 * The Report Card of one run-report.
 *
 * `compact` keeps only the verdict and the counters, for the Assistant panel;
 * the full card (every check and the next steps) is the one stored inside the
 * run-report and exported with it.
 */
export const AssistantReportCard = ({
  spec,
  compact = false,
}: {
  spec: AssistantCardSpec;
  compact?: boolean;
}) => {
  const Icon = ICON[spec.status];
  return (
    <section
      data-report="assistant-card"
      data-status={spec.status}
      aria-label={spec.title}
      className={`mb-4 rounded-lg border border-border2 border-l-4 bg-surface3/30 p-3 ${BORDER[spec.status]}`}
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent2" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-text3">{spec.title}</span>
        <span className={`ml-auto flex items-center gap-1 rounded border border-border2 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${DOT[spec.status]}`}>
          <Icon className="h-3 w-3" />
          {cardStatusLabel(spec.status)}
        </span>
      </div>
      <p className="text-[11px] leading-relaxed text-text">{spec.headline}</p>
      {!compact && (
        <ul className="mt-2 space-y-1">
          {spec.checks.map(check => {
            const CheckIcon = ICON[check.status];
            return (
              <li key={check.id} className="flex items-start gap-1.5">
                <CheckIcon className={`mt-0.5 h-3 w-3 shrink-0 ${DOT[check.status]}`} />
                <span className="text-[10px] leading-relaxed text-text2">
                  <span className="font-semibold text-text">{check.label}</span> — {check.detail}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {!compact && spec.nextSteps.length > 0 && (
        <div className="mt-2 border-t border-border/60 pt-1.5">
          <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
            {t('assistant.nextSteps')}
          </span>
          <ul className="mt-0.5 list-disc pl-4">
            {spec.nextSteps.map(step => (
              <li key={step} className="text-[10px] leading-relaxed text-text2">
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
