import type { Dispatch, SetStateAction } from 'react';
import {
  groupColumnIndexes,
  type CategoryLevel,
  type GridData,
} from '../../grid/types';
import { LevelsEditor, LEVELS_BUTTON_CLASS } from '../../grid/LevelsEditor';
import type { SurvivalParams } from '../../io/project';
import { t } from '../../i18n';
import {
  VariableSelect,
  variableOptions,
  variableOptionsFrom,
} from '../../components/FormFields';

export interface SurvivalFormProps {
  grid: GridData;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
  survivalParams: SurvivalParams;
  setSurvivalParams: Dispatch<SetStateAction<SurvivalParams>>;
}

export const SurvivalForm = ({
  grid,
  onLevels,
  onRecode,
  survivalParams,
  setSurvivalParams,
}: SurvivalFormProps) => {
  const options = variableOptions(grid.cols);
  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.time')}
        value={survivalParams.timeVariable}
        options={options}
        onChange={value => setSurvivalParams(prev => ({ ...prev, timeVariable: value }))}
      />
      <VariableSelect
        label={t('form.event')}
        value={survivalParams.eventVariable}
        options={options}
        onChange={value => setSurvivalParams(prev => ({ ...prev, eventVariable: value }))}
      />
      <VariableSelect
        label={t('form.groupOptional')}
        value={survivalParams.groupVariable}
        options={[
          { value: -1, label: t('form.none') },
          ...variableOptionsFrom(grid.cols, groupColumnIndexes(grid)),
        ]}
        onChange={value => setSurvivalParams(prev => ({ ...prev, groupVariable: value }))}
        trailing={
          survivalParams.groupVariable >= 0 ? (
            <LevelsEditor
              grid={grid}
              column={survivalParams.groupVariable}
              onLevels={onLevels}
              onRecode={onRecode}
              label={t('action.levels')}
              className={LEVELS_BUTTON_CLASS}
            />
          ) : undefined
        }
      />
    </div>
  );
};
