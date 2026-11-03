import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { VarMode, VarParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import { Field, NumberField, VariableList } from '../../components/FormFields';

export interface VarFormProps {
  grid: GridData;
  varParams: VarParams;
  setVarParams: Dispatch<SetStateAction<VarParams>>;
}

export const VarForm = ({ grid, varParams, setVarParams }: VarFormProps) => {
  const { mode, variables, lags, horizon } = varParams;
  const update = (patch: Partial<VarParams>) => setVarParams(prev => ({ ...prev, ...patch }));
  const inputClass =
    'w-28 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text';

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('form.model')}>
        <select
          aria-label={t('form.model')}
          className={inputClass}
          value={mode}
          onChange={e => update({ mode: e.target.value as VarMode })}
        >
          <option value="var">{t('form.var')}</option>
          <option value="vecm">{t('form.vecm')}</option>
        </select>
      </Field>
      <VariableList
        label={t('form.varVariables')}
        cols={grid.cols}
        only={continuousColumnIndexes(grid)}
        selected={variables}
        onToggle={(column, checked) =>
          update({
            variables: checked
              ? Array.from(new Set([...variables, column]))
              : variables.filter(value => value !== column),
          })
        }
      />
      <div className="flex gap-2">
        <NumberField
          label={t('form.varLags')}
          value={lags}
          min="0"
          max="12"
          step="1"
          integer
          onChange={value => update({ lags: value })}
        />
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
    </div>
  );
};
