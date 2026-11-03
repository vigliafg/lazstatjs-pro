import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { AltParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  Field,
  VariableList,
  VariableSelect,
  variableOptions,
} from '../../components/FormFields';

export interface AltFormProps {
  grid: GridData;
  altParams: AltParams;
  setAltParams: Dispatch<SetStateAction<AltParams>>;
}

export const AltForm = ({ grid, altParams, setAltParams }: AltFormProps) => {
  const { time, event, stress, covariates, model, useStress } = altParams;
  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.time')}
        value={time}
        options={variableOptions(grid.cols)}
        disabledValues={[event, stress]}
        onChange={value => setAltParams(prev => ({ ...prev, time: value }))}
      />
      <VariableSelect
        label={t('form.event')}
        value={event}
        options={variableOptions(grid.cols)}
        disabledValues={[time, stress]}
        onChange={value => setAltParams(prev => ({ ...prev, event: value }))}
      />
      <VariableSelect
        label={t('form.stress')}
        value={stress}
        options={variableOptions(grid.cols)}
        disabledValues={[time, event]}
        onChange={value => setAltParams(prev => ({ ...prev, stress: value }))}
      />
      <Field label={t('form.altModel')}>
        <select
          aria-label={t('form.altModel')}
          className="min-w-[220px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={model}
          onChange={input =>
            setAltParams(prev => ({
              ...prev,
              model: input.target.value as AltParams['model'],
            }))
          }
        >
          <option value="arrhenius">{t('form.arrhenius')}</option>
          <option value="inversePower">{t('form.inversePower')}</option>
          <option value="exponential">{t('form.exponentialStress')}</option>
        </select>
      </Field>
      <Field label={t('form.useStress')}>
        <input
          type="number"
          step="any"
          min={0}
          aria-label={t('form.useStress')}
          className="w-28 rounded border border-border2 bg-surface p-1 font-mono text-[11px] text-text"
          value={useStress}
          onChange={input =>
            setAltParams(prev => ({
              ...prev,
              useStress: Math.max(0, Number(input.target.value) || 0),
            }))
          }
        />
      </Field>
      <VariableList
        label={t('form.covariatesX')}
        cols={grid.cols}
        only={continuousColumnIndexes(grid)}
        emptyText={t('form.noNumericColumns')}
        selected={covariates}
        disabled={[time, event, stress]}
        onToggle={(index, checked) =>
          setAltParams(prev => ({
            ...prev,
            covariates: checked
              ? [...prev.covariates, index]
              : prev.covariates.filter(item => item !== index),
          }))
        }
      />
    </div>
  );
};
