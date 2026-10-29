import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { LogisticParams } from '../../io/project';
import { t } from '../../i18n';
import {
  CheckboxField,
  Field,
  VariableList,
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
      <Field label={t('form.cutoff')}>
        <input
          type="number"
          min="0.05"
          max="0.95"
          step="0.05"
          aria-label={t('form.cutoff')}
          className="w-20 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={cutoff}
          onChange={e =>
            setLogisticParams(prev => ({ ...prev, cutoff: parseFloat(e.target.value) }))
          }
        />
      </Field>
    </div>
  );
};
