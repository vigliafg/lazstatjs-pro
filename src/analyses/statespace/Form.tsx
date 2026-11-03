import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { StateSpaceMode, StateSpaceParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import { Field, NumberField, VariableSelect, variableOptionsFrom } from '../../components/FormFields';

export interface StateSpaceFormProps {
  grid: GridData;
  stateSpaceParams: StateSpaceParams;
  setStateSpaceParams: Dispatch<SetStateAction<StateSpaceParams>>;
}

export const StateSpaceForm = ({
  grid,
  stateSpaceParams,
  setStateSpaceParams,
}: StateSpaceFormProps) => {
  const { mode, variable, horizon, trend } = stateSpaceParams;
  const update = (patch: Partial<StateSpaceParams>) =>
    setStateSpaceParams(prev => ({ ...prev, ...patch }));
  const inputClass =
    'w-40 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text';

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('form.model')}>
        <select
          aria-label={t('form.model')}
          className={inputClass}
          value={mode}
          onChange={e => update({ mode: e.target.value as StateSpaceMode })}
        >
          <option value="local">{t('form.localTrend')}</option>
          <option value="markov">{t('form.markov')}</option>
        </select>
      </Field>
      <VariableSelect
        label={t('form.series')}
        value={variable}
        options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
        onChange={value => update({ variable: value })}
      />
      {mode === 'local' && (
        <label className="flex items-center gap-2 text-[11px] text-text2">
          <input
            type="checkbox"
            className="accent-accent"
            checked={trend}
            onChange={e => update({ trend: e.target.checked })}
          />
          {t('form.trendComponent')}
        </label>
      )}
      <NumberField
        label={t('form.forecastHorizon')}
        value={horizon}
        min="1"
        max="40"
        step="1"
        integer
        onChange={value => update({ horizon: value })}
      />
    </div>
  );
};
