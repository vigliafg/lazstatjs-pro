import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { TostParams } from '../../io/project';
import { t } from '../../i18n';
import { variableOptionsFrom } from '../../components/FormFields';
import { continuousColumnIndexes } from '../shared/columns';
import { Field, NumberField, VariableSelect, variableOptions } from '../../components/FormFields';

export interface TostFormProps {
  grid: GridData;
  tostParams: TostParams;
  setTostParams: Dispatch<SetStateAction<TostParams>>;
}

export const TostForm = ({ grid, tostParams, setTostParams }: TostFormProps) => {
  const { design, var1, var2, mu, margin, equalVar } = tostParams;
  const update = (patch: Partial<TostParams>) =>
    setTostParams(prev => ({ ...prev, ...patch }));
  const options = variableOptionsFrom(grid.cols, continuousColumnIndexes(grid));
  const inputClass =
    'w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text';

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('form.design')}>
        <select
          aria-label={t('form.design')}
          className="min-w-[170px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={design}
          onChange={e => update({ design: e.target.value as TostParams['design'] })}
        >
          <option value="one">{t('form.oneSampleTarget')}</option>
          <option value="paired">{t('form.pairedMeasures')}</option>
          <option value="ind">{t('form.twoIndependentGroups')}</option>
        </select>
      </Field>
      <VariableSelect
        label={t('form.variable1')}
        value={var1}
        options={options}
        onChange={value => update({ var1: value })}
      />
      {design !== 'one' && (
        <VariableSelect
          label={t('form.variable2')}
          value={var2}
          options={options}
          onChange={value => update({ var2: value })}
        />
      )}
      {design === 'one' && (
        <NumberField
          label={t('form.targetMu')}
          value={mu}
          onChange={value => update({ mu: value })}
        />
      )}
      {design === 'ind' && (
        <Field label={t('form.variances')}>
          <select
            aria-label={t('form.variances')}
            className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
            value={equalVar ? 'equal' : 'welch'}
            onChange={e => update({ equalVar: e.target.value === 'equal' })}
          >
            <option value="equal">{t('form.equalPooled')}</option>
            <option value="welch">{t('form.unequalWelch')}</option>
          </select>
        </Field>
      )}
      <NumberField
        label={t('form.equivalenceMargin')}
        value={margin}
        min="0"
        hint={t('hint.tost')}
        onChange={value => update({ margin: value })}
      />
    </div>
  );
};
