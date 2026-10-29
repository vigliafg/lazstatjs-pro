import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { LogisticParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  CheckboxField,
  Field,
  VariableList,
  NumberField,
  VariableSelect,
  variableOptions,
} from '../../components/FormFields';

export interface LogisticFormProps {
  grid: GridData;
  logisticParams: LogisticParams;
  setLogisticParams: Dispatch<SetStateAction<LogisticParams>>;
}

export const LogisticForm = ({ grid, logisticParams, setLogisticParams }: LogisticFormProps) => {
  const { outcome, predictors, cutoff, penalized } = logisticParams;
  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.outcomeBinary')}
        value={outcome}
        options={variableOptions(grid.cols)}
        onChange={value => setLogisticParams(prev => ({ ...prev, outcome: value }))}
      />
      <VariableList
        label={t('form.predictorsX')}
        cols={grid.cols}
        only={continuousColumnIndexes(grid)}
        selected={predictors}
        disabled={[outcome]}
        onToggle={(index, checked) =>
          setLogisticParams(prev => ({
            ...prev,
            predictors: checked
              ? [...prev.predictors, index]
              : prev.predictors.filter(item => item !== index),
          }))
        }
      />
      <Field label={t('form.penalization')}>
        <CheckboxField
          label={t('form.firth')}
          checked={penalized}
          onChange={checked => setLogisticParams(prev => ({ ...prev, penalized: checked }))}
        />
      </Field>
      <NumberField
        label={t('form.cutoff')}
        value={cutoff}
        min="0.05"
        max="0.95"
        step="0.05"
        onChange={value => setLogisticParams(prev => ({ ...prev, cutoff: value }))}
      />
    </div>
  );
};
