import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { RecurrentParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  Field,
  VariableList,
  VariableSelect,
  variableOptions,
} from '../../components/FormFields';

export interface RecurrentFormProps {
  grid: GridData;
  recurrentParams: RecurrentParams;
  setRecurrentParams: Dispatch<SetStateAction<RecurrentParams>>;
}

export const RecurrentForm = ({
  grid,
  recurrentParams,
  setRecurrentParams,
}: RecurrentFormProps) => {
  const { id, start, stop, event, covariates, model } = recurrentParams;
  const options = variableOptions(grid.cols);
  return (
    <div className="flex flex-col gap-3">
      <Field label={t('form.recurrentModel')}>
        <select
          aria-label={t('form.recurrentModel')}
          className="min-w-[220px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={model}
          onChange={input =>
            setRecurrentParams(prev => ({
              ...prev,
              model: input.target.value as RecurrentParams['model'],
            }))
          }
        >
          <option value="ag">{t('form.andersenGill')}</option>
          <option value="wlw">{t('form.weilinWeissfeld')}</option>
        </select>
      </Field>
      <VariableSelect
        label={t('form.subject')}
        value={id}
        options={options}
        disabledValues={[start, stop, event]}
        onChange={value => setRecurrentParams(prev => ({ ...prev, id: value }))}
      />
      <VariableSelect
        label={t('form.start')}
        value={start}
        options={options}
        disabledValues={[id, stop, event]}
        onChange={value => setRecurrentParams(prev => ({ ...prev, start: value }))}
      />
      <VariableSelect
        label={t('form.stop')}
        value={stop}
        options={options}
        disabledValues={[id, start, event]}
        onChange={value => setRecurrentParams(prev => ({ ...prev, stop: value }))}
      />
      <VariableSelect
        label={t('form.event')}
        value={event}
        options={options}
        disabledValues={[id, start, stop]}
        onChange={value => setRecurrentParams(prev => ({ ...prev, event: value }))}
      />
      <VariableList
        label={t('form.covariatesX')}
        cols={grid.cols}
        only={continuousColumnIndexes(grid)}
        emptyText={t('form.noNumericColumns')}
        selected={covariates}
        disabled={[id, start, stop, event]}
        onToggle={(index, checked) =>
          setRecurrentParams(prev => ({
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
