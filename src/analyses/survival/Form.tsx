import type { Dispatch, SetStateAction } from 'react';
import type { CategoryLevel, GridData } from '../../grid/types';
import type { SurvivalParams } from '../../io/project';
import { t } from '../../i18n';
import {
  GroupSelect,
  VariableSelect,
  variableOptions,
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
        disabledValues={[survivalParams.eventVariable]}
        onChange={value => setSurvivalParams(prev => ({ ...prev, timeVariable: value }))}
      />
      <VariableSelect
        label={t('form.event')}
        value={survivalParams.eventVariable}
        options={options}
        disabledValues={[survivalParams.timeVariable]}
        onChange={value => setSurvivalParams(prev => ({ ...prev, eventVariable: value }))}
      />
      <GroupSelect
        label={t('form.groupOptional')}
        grid={grid}
        value={survivalParams.groupVariable}
        allowNone
        onLevels={onLevels}
        onRecode={onRecode}
        onChange={value => setSurvivalParams(prev => ({ ...prev, groupVariable: value }))}
      />
    </div>
  );
};
