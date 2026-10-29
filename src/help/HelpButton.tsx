import { HelpCircle } from 'lucide-react';
import { t } from '../i18n';
import { openHelp } from './helpStore';
import type { HelpLevel } from './book';

/**
 * Small `?` button that opens the handbook page of a procedure.
 * `topicId` is the registry id (see `topicForAnalysis`).
 */
export const HelpButton = ({
  topicId,
  level = 'tutorial',
  className,
}: {
  topicId: string;
  level?: HelpLevel;
  className?: string;
}) => (
  <button
    type="button"
    onClick={() => openHelp(topicId, level)}
    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-text3 hover:bg-border hover:text-text ${
      className ?? ''
    }`}
    title={t('help.procedureHelp')}
    aria-label={t('help.procedureHelp')}
  >
    <HelpCircle className="h-3.5 w-3.5" />
  </button>
);
