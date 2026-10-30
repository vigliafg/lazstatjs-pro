import { t } from '../i18n';
import type { GridData } from './types';
import { CleanOperations } from './CleanOperations';
import { TransformOperations } from './TransformOperations';
import type { CleanApply, TransformApply } from './OperationFields';

interface Props {
  grid: GridData;
  datasetId: string;
  onTransformApply: TransformApply;
  onCleanApply: CleanApply;
}

/**
 * Dedicated operations row: Transform triggers, a vertical separator, Clean
 * triggers. Each trigger owns its own anchored panel; there is no shared panel.
 */
export const OperationsBar = ({ grid, datasetId, onTransformApply, onCleanApply }: Props) => (
  <div
    key={datasetId}
    role="toolbar"
    aria-label={t('data.operationsBar')}
    className="flex flex-wrap items-center gap-1.5 border-b border-border bg-surface p-1.5 shrink-0"
  >
    <div
      role="group"
      aria-label={t('data.transform')}
      className="flex flex-wrap items-center gap-1.5"
    >
      <TransformOperations grid={grid} onApply={onTransformApply} />
    </div>
    <div aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
    <div role="group" aria-label={t('data.clean')} className="flex flex-wrap items-center gap-1.5">
      <CleanOperations grid={grid} onApply={onCleanApply} />
    </div>
  </div>
);
