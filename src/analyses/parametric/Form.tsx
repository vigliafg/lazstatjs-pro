import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { ParametricSurvivalParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  Field,
  VariableList,
  VariableSelect,
  variableOptions,
} from '../../components/FormFields';

export interface ParametricFormProps {
  grid: GridData;
  parametricParams: ParametricSurvivalParams;
  setParametricParams: Dispatch<SetStateAction<ParametricSurvivalParams>>;
}

export const ParametricForm = ({
  grid,
  parametricParams,
  setParametricParams,
}: ParametricFormProps) => {
  const { time, event, predictors, distribution } = parametricParams;
  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.time')}
        value={time}
        options={variableOptions(grid.cols)}
        disabledValues={[event]}
        onChange={value => setParametricParams(prev => ({ ...prev, time: value }))}
      />
      <VariableSelect
        label={t('form.event')}
        value={event}
        options={variableOptions(grid.cols)}
        disabledValues={[time]}
        onChange={value => setParametricParams(prev => ({ ...prev, event: value }))}
      />
      <VariableList
        label={t('form.predictorsX')}
        cols={grid.cols}
        only={continuousColumnIndexes(grid)}
      emptyText={t('form.noNumericColumns')}
        selected={predictors}
        disabled={[time, event]}
        showType
        hint={t('hint.parametric')}
        onToggle={(index, checked) =>
          setParametricParams(prev => ({
            ...prev,
            predictors: checked
              ? [...prev.predictors, index]
              : prev.predictors.filter(item => item !== index),
          }))
        }
      />
      <Field label={t('form.distribution')}>
        <select
          aria-label={t('form.distribution')}
          className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={distribution}
          onChange={e =>
            setParametricParams(prev => ({
              ...prev,
              distribution: e.target.value as ParametricSurvivalParams['distribution'],
            }))
          }
        >
          <option value="weibull">{t('form.weibull')}</option>
          <option value="exponential">{t('form.exponential')}</option>
        </select>
      </Field>
    </div>
  );
};
