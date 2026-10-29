import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { groupColumnIndexes, type CategoryLevel, type GridData } from '../../grid/types';
import { LevelsEditor, LEVELS_BUTTON_CLASS } from '../../grid/LevelsEditor';
import type { NonParamMode, NonParamParams } from '../../io/project';
import { defaultSelection, isBinaryColumn } from './defaults';
import { numericColumnIndexes } from '../shared/columns';
import { t } from '../../i18n';
import {
  Field,
  VariableList,
  VariableSelect,
  variableOptions,
  variableOptionsFrom,
} from '../../components/FormFields';

export interface NonParamFormProps {
  grid: GridData;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
  nonParamParams: NonParamParams;
  setNonParamParams: Dispatch<SetStateAction<NonParamParams>>;
}

export const NonParamForm = ({
  grid,
  onLevels,
  onRecode,
  nonParamParams,
  setNonParamParams,
}: NonParamFormProps) => {
  const { mode, selected, left, right, outcome, group } = nonParamParams;

  // Reset the measures when the mode or the grid width changes, but never on
  // the first mount (restored parameters must survive).
  const previousMode = useRef(mode);
  const previousCols = useRef(grid.cols.length);
  useEffect(() => {
    const modeChanged = previousMode.current !== mode;
    const colsChanged = previousCols.current !== grid.cols.length;
    previousMode.current = mode;
    previousCols.current = grid.cols.length;
    if (!modeChanged && !colsChanged) return;

    setNonParamParams(prev => {
      const max = Math.max(0, grid.cols.length - 1);
      return {
        ...prev,
        selected: modeChanged || colsChanged ? defaultSelection(grid, mode) : prev.selected,
        left: Math.min(prev.left, max),
        right: Math.min(prev.right, max),
        outcome: Math.min(prev.outcome, max),
        group: Math.min(prev.group, max),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, grid.cols.length]);

  const numericColumns = numericColumnIndexes(grid);
  const binaryColumns = grid.cols
    .map((_, index) => index)
    .filter(index => isBinaryColumn(grid, index));
  const listColumns = mode === 'friedman' ? numericColumns : mode === 'cochran' ? binaryColumns : [];

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('form.test')}>
        <select
          aria-label={t('form.test')}
          className="min-w-[170px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={mode}
          onChange={event =>
            setNonParamParams(prev => ({
              ...prev,
              mode: event.target.value as NonParamMode,
            }))
          }
        >
          <option value="friedman">{t('nonparam.friedman')}</option>
          <option value="mcnemar">{t('nonparam.mcnemar')}</option>
          <option value="cochran">{t('nonparam.cochran')}</option>
          <option value="jonckheere">{t('nonparam.jonckheere')}</option>
        </select>
      </Field>

      {(mode === 'friedman' || mode === 'cochran') && (
        <VariableList
          label={
            mode === 'friedman'
              ? t('form.numericMeasures3')
              : t('form.binaryConditions3')
          }
          cols={grid.cols}
          only={listColumns}
          selected={selected}
          showType
          emptyText={t('form.noSuitableColumns')}
          onToggle={(index, checked) =>
            setNonParamParams(prev => ({
              ...prev,
              selected: checked
                ? [...prev.selected, index]
                : prev.selected.filter(item => item !== index),
            }))
          }
        />
      )}

      {mode === 'mcnemar' && (
        <>
          <VariableSelect
            label={t('form.firstMeasure')}
            value={left}
            options={variableOptions(grid.cols)}
            onChange={value => setNonParamParams(prev => ({ ...prev, left: value }))}
          />
          <VariableSelect
            label={t('form.secondMeasure')}
            value={right}
            options={variableOptions(grid.cols)}
            onChange={value => setNonParamParams(prev => ({ ...prev, right: value }))}
          />
        </>
      )}

      {mode === 'jonckheere' && (
        <>
          <VariableSelect
            label={t('form.numericOutcome')}
            value={outcome}
            options={variableOptions(grid.cols)}
            onChange={value => setNonParamParams(prev => ({ ...prev, outcome: value }))}
          />
          <VariableSelect
            label={t('form.orderedGroups')}
            value={group}
            options={variableOptionsFrom(grid.cols, groupColumnIndexes(grid))}
            hint={t('hint.jonckheere')}
            onChange={value => setNonParamParams(prev => ({ ...prev, group: value }))}
            trailing={
              <LevelsEditor
                grid={grid}
                column={group}
                onLevels={onLevels}
                onRecode={onRecode}
                label={t('action.levels')}
                className={LEVELS_BUTTON_CLASS}
              />
            }
          />
        </>
      )}
    </div>
  );
};
