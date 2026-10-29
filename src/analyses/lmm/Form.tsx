import type { Dispatch, SetStateAction } from 'react';
import type { CategoryLevel, GridData } from '../../grid/types';
import type { LmmParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  GroupSelect,
  VariableList,
  VariableSelect,
  variableOptions,
  variableOptionsFrom,
} from '../../components/FormFields';

export interface LmmFormProps {
  grid: GridData;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
  lmmParams: LmmParams;
  setLmmParams: Dispatch<SetStateAction<LmmParams>>;
}

export const LmmForm = ({ grid, onLevels, onRecode, lmmParams, setLmmParams }: LmmFormProps) => {
  const { dep, indeps, group } = lmmParams;
  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.outcomeY')}
        value={dep}
        options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
        onChange={value => setLmmParams(prev => ({ ...prev, dep: value }))}
      />
      <VariableList
        label={t('form.fixedPredictors')}
        cols={grid.cols}
        only={continuousColumnIndexes(grid)}
      emptyText={t('form.noNumericColumns')}
        selected={indeps}
        disabled={[dep, group]}
        showType
        hint={t('hint.lmm')}
        onToggle={(index, checked) =>
          setLmmParams(prev => ({
            ...prev,
            indeps: checked
              ? [...prev.indeps, index]
              : prev.indeps.filter(item => item !== index),
          }))
        }
      />
      <GroupSelect
        label={t('form.groupRandomIntercept')}
        grid={grid}
        value={group}
        onChange={value => setLmmParams(prev => ({ ...prev, group: value }))}
        onLevels={onLevels}
        onRecode={onRecode}
      />
    </div>
  );
};
