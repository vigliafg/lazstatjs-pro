import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { MultinomialParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  VariableList,
  VariableSelect,
  variableOptions,
} from '../../components/FormFields';

export interface MultinomialFormProps {
  grid: GridData;
  multinomialParams: MultinomialParams;
  setMultinomialParams: Dispatch<SetStateAction<MultinomialParams>>;
}

export const MultinomialForm = ({
  grid,
  multinomialParams,
  setMultinomialParams,
}: MultinomialFormProps) => {
  const { outcome, predictors } = multinomialParams;
  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.outcome')}
        value={outcome}
        options={variableOptions(grid.cols)}
        onChange={value => setMultinomialParams(prev => ({ ...prev, outcome: value }))}
      />
      <VariableList
        label={t('form.predictorsX')}
        cols={grid.cols}
        only={continuousColumnIndexes(grid)}
        emptyText={t('form.noNumericColumns')}
        selected={predictors}
        disabled={[outcome]}
        showType
        onToggle={(index, checked) =>
          setMultinomialParams(prev => ({
            ...prev,
            predictors: checked
              ? [...prev.predictors, index]
              : prev.predictors.filter(item => item !== index),
          }))
        }
      />
    </div>
  );
};
