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
  const { outcome, predictors, cutoff, penalized, link } = logisticParams;
  return (
    <div className="flex flex-col gap-3">
      <Field label={t('form.link')}>
        <select
          aria-label={t('form.link')}
          className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={link ?? 'logit'}
          onChange={event =>
            setLogisticParams(prev => ({
              ...prev,
              link: event.target.value === 'probit' ? 'probit' : 'logit',
            }))
          }
        >
          <option value="logit">{t('form.logit')}</option>
          <option value="probit">{t('form.probit')}</option>
        </select>
      </Field>
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
      emptyText={t('form.noNumericColumns')}
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
      <CheckboxField
        label={t('form.firth')}
        checked={penalized}
        onChange={checked => setLogisticParams(prev => ({ ...prev, penalized: checked }))}
      />
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
