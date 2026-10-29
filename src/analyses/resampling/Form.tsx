import type { Dispatch, SetStateAction } from 'react';
import { groupColumnIndexes, type GridData } from '../../grid/types';
import type { ResamplingParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  Field,
  VariableSelect,
  variableOptions,
  variableOptionsFrom,
} from '../../components/FormFields';

export interface ResamplingFormProps {
  grid: GridData;
  resamplingParams: ResamplingParams;
  setResamplingParams: Dispatch<SetStateAction<ResamplingParams>>;
}

export const ResamplingForm = ({
  grid,
  resamplingParams,
  setResamplingParams,
}: ResamplingFormProps) => (
  <div className="flex flex-col gap-3">
    <VariableSelect
      label={t('form.outcome')}
      value={resamplingParams.outcome}
      options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
      onChange={value => setResamplingParams(prev => ({ ...prev, outcome: value }))}
    />
    <VariableSelect
      label={t('form.group')}
      value={resamplingParams.group}
      options={variableOptionsFrom(grid.cols, groupColumnIndexes(grid))}
      onChange={value => setResamplingParams(prev => ({ ...prev, group: value }))}
    />
    <Field label={t('form.statistic')}>
      <select
        aria-label={t('form.statistic')}
        className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={resamplingParams.statistic}
        onChange={e =>
          setResamplingParams(prev => ({
            ...prev,
            statistic: e.target.value as ResamplingParams['statistic'],
          }))
        }
      >
        <option value="mean">{t('form.diffMeans')}</option>
        <option value="median">{t('form.diffMedians')}</option>
      </select>
    </Field>
    <div className="flex gap-2">
      <Field label={t('form.permutations')}>
        <input
          type="number"
          min="99"
          max="50000"
          step="100"
          aria-label={t('form.permutations')}
          className="w-28 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={resamplingParams.permutations}
          onChange={e =>
            setResamplingParams(prev => ({ ...prev, permutations: parseInt(e.target.value, 10) }))
          }
        />
      </Field>
      <Field label={t('form.bootstrapReps')}>
        <input
          type="number"
          min="99"
          max="50000"
          step="100"
          aria-label={t('form.bootstrapReps')}
          className="w-28 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={resamplingParams.bootstrap}
          onChange={e =>
            setResamplingParams(prev => ({ ...prev, bootstrap: parseInt(e.target.value, 10) }))
          }
        />
      </Field>
    </div>
    <p className="max-w-[340px] text-[10px] text-text3">{t('hint.resampling')}</p>
  </div>
);
