import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { TostParams } from '../../io/project';
import { t } from '../../i18n';
import { Field, VariableSelect, variableOptions } from '../../components/FormFields';

export interface TostFormProps {
  grid: GridData;
  tostParams: TostParams;
  setTostParams: Dispatch<SetStateAction<TostParams>>;
}

export const TostForm = ({ grid, tostParams, setTostParams }: TostFormProps) => {
  const { design, var1, var2, mu, margin, equalVar } = tostParams;
  const update = (patch: Partial<TostParams>) =>
    setTostParams(prev => ({ ...prev, ...patch }));
  const options = variableOptions(grid.cols);
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
        <Field label={t('form.targetMu')}>
          <input
            type="number"
            step="any"
            aria-label={t('form.targetMu')}
            className={inputClass}
            value={mu}
            onChange={e => update({ mu: parseFloat(e.target.value) })}
          />
        </Field>
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
      <Field label={t('form.equivalenceMargin')} hint={t('hint.tost')}>
        <input
          type="number"
          min="0"
          step="any"
          aria-label={t('form.equivalenceMargin')}
          className={inputClass}
          value={margin}
          onChange={e => update({ margin: parseFloat(e.target.value) })}
        />
      </Field>
    </div>
  );
};
