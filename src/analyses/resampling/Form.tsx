import type { Dispatch, SetStateAction } from 'react';
import type { CategoryLevel, GridData } from '../../grid/types';
import type { ResamplingParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  Field,
  GroupSelect,
  NumberField,
  VariableSelect,
  variableOptions,
  variableOptionsFrom,
} from '../../components/FormFields';

export interface ResamplingFormProps {
  grid: GridData;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
  resamplingParams: ResamplingParams;
  setResamplingParams: Dispatch<SetStateAction<ResamplingParams>>;
}

export const ResamplingForm = ({
  grid,
  onLevels,
  onRecode,
  resamplingParams,
  setResamplingParams,
}: ResamplingFormProps) => (
  <div className="flex flex-col gap-3">
    <VariableSelect
      label={t('form.outcome')}
      value={resamplingParams.outcome}
      options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
      disabledValues={[resamplingParams.group]}
      onChange={value => setResamplingParams(prev => ({ ...prev, outcome: value }))}
    />
    <GroupSelect
      label={t('form.group')}
      grid={grid}
      value={resamplingParams.group}
      onChange={value => setResamplingParams(prev => ({ ...prev, group: value }))}
      onLevels={onLevels}
      onRecode={onRecode}
      disabledValues={[resamplingParams.outcome]}
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
      <NumberField
        label={t('form.permutations')}
        value={resamplingParams.permutations}
        min="99"
        max="50000"
        step="100"
        integer
        onChange={value => setResamplingParams(prev => ({ ...prev, permutations: value }))}
      />
      <NumberField
        label={t('form.bootstrapReps')}
        value={resamplingParams.bootstrap}
        min="99"
        max="50000"
        step="100"
        integer
        onChange={value => setResamplingParams(prev => ({ ...prev, bootstrap: value }))}
      />
    </div>
    <p className="max-w-[340px] text-[10px] text-text3">{t('hint.resampling')}</p>
  </div>
);
