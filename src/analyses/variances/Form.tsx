import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { VarianceParams } from '../../io/project';
import {
  Advanced,
  Field,
  GroupSelect,
  VariableSelect,
  variableOptionsFrom,
} from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface VariancesFormProps {
  grid: GridData;
  params: VarianceParams;
  setParams: Dispatch<SetStateAction<VarianceParams>>;
}

export const VariancesForm = ({ grid, params, setParams }: VariancesFormProps) => (
  <>
    <Field label={t('form.testType')}>
      <select
        aria-label={t('form.testType')}
        className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={params.mode}
        onChange={event =>
          setParams(previous => ({
            ...previous,
            mode: event.target.value as VarianceParams['mode'],
          }))
        }
      >
        <option value="one">{t('variances.one')}</option>
        <option value="two">{t('variances.two')}</option>
      </select>
    </Field>

    <VariableSelect
      label={t('form.variable1')}
      value={params.variable}
      options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
      onChange={value => setParams(previous => ({ ...previous, variable: value }))}
    />

    {params.mode === 'two' && (
      <GroupSelect
        label={t('form.group')}
        grid={grid}
        value={params.group}
        onChange={value => setParams(previous => ({ ...previous, group: value }))}
      />
    )}

    {params.mode === 'one' && (
      <Advanced>
        <Field label={t('form.nullVariance')}>
          <input
            type="number"
            step="any"
            min={0}
            className="w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
            value={params.nullVariance}
            onChange={event =>
              setParams(previous => ({ ...previous, nullVariance: Number(event.target.value) }))
            }
          />
        </Field>
      </Advanced>
    )}
  </>
);
