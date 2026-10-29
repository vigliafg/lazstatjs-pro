import type { Dispatch, SetStateAction } from 'react';
import { groupColumnIndexes, type GridData } from '../../grid/types';
import type { LmmParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  VariableList,
  VariableSelect,
  variableOptions,
  variableOptionsFrom,
} from '../../components/FormFields';

export interface LmmFormProps {
  grid: GridData;
  lmmParams: LmmParams;
  setLmmParams: Dispatch<SetStateAction<LmmParams>>;
}

export const LmmForm = ({ grid, lmmParams, setLmmParams }: LmmFormProps) => {
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
      <VariableSelect
        label={t('form.groupRandomIntercept')}
        value={group}
        options={variableOptionsFrom(grid.cols, groupColumnIndexes(grid))}
        onChange={value => setLmmParams(prev => ({ ...prev, group: value }))}
      />
    </div>
  );
};
