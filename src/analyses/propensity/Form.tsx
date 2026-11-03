import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { PropensityParams } from '../../io/project';
import {
  Field,
  NumberField,
  VariableList,
  VariableSelect,
  variableOptions,
  variableOptionsFrom,
} from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface PropensityFormProps {
  grid: GridData;
  params: PropensityParams;
  setParams: Dispatch<SetStateAction<PropensityParams>>;
}

/** Treatment, outcome, covariates, method, caliper and 1:k ratio. */
export const PropensityForm = ({ grid, params, setParams }: PropensityFormProps) => {
  const continuous = continuousColumnIndexes(grid);
  const removeCovariate = (value: number, previous: PropensityParams): PropensityParams => ({
    ...previous,
    covariates: previous.covariates.filter(index => index !== value),
  });

  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.treatment')}
        value={params.treatment}
        options={variableOptions(grid.cols)}
        onChange={value =>
          setParams(previous => ({
            ...removeCovariate(value, previous),
            treatment: value,
            ...(previous.outcome === value ? { outcome: -1 } : {}),
          }))
        }
      />
      <VariableSelect
        label={t('form.outcome')}
        value={params.outcome}
        options={variableOptionsFrom(grid.cols, continuous)}
        disabledValues={[params.treatment]}
        onChange={value =>
          setParams(previous => ({
            ...removeCovariate(value, previous),
            outcome: value,
          }))
        }
      />
      <VariableList
        label={t('form.covariatesX')}
        cols={grid.cols}
        only={continuous}
        emptyText={t('form.noNumericColumns')}
        selected={params.covariates}
        disabled={[params.treatment, params.outcome]}
        onToggle={(column, checked) =>
          setParams(previous => ({
            ...previous,
            covariates: checked
              ? [...previous.covariates, column]
              : previous.covariates.filter(index => index !== column),
          }))
        }
      />
      <Field label={t('form.method')}>
        <select
          aria-label={t('form.method')}
          className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={params.method}
          onChange={event =>
            setParams(previous => ({
              ...previous,
              method: event.target.value as PropensityParams['method'],
            }))
          }
        >
          <option value="nearest">{t('form.nearest')}</option>
          <option value="ipw">{t('form.ipw')}</option>
        </select>
      </Field>
      <div className="flex gap-2">
        <NumberField
          label={t('form.caliper')}
          value={params.caliper}
          min="0"
          max="5"
          step="0.05"
          onChange={value => setParams(previous => ({ ...previous, caliper: value }))}
        />
        <NumberField
          label={t('form.ratio')}
          value={params.ratio}
          min="1"
          max="10"
          step="1"
          integer
          onChange={value => setParams(previous => ({ ...previous, ratio: value }))}
        />
      </div>
    </div>
  );
};
