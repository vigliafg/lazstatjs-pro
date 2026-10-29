import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { TTestParams } from '../../io/project';
import { Field, VariableSelect, variableOptions } from '../../components/FormFields';
import { t } from '../../i18n';

export interface TTestFormProps {
  grid: GridData;
  ttestParams: TTestParams;
  setTTestParams: Dispatch<SetStateAction<TTestParams>>;
}

export const TTestForm = ({ grid, ttestParams, setTTestParams }: TTestFormProps) => {
  const options = variableOptions(grid.cols);
  return (
    <>
      <Field label={t('form.testType')}>
        <select
          aria-label={t('form.testType')}
          className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={ttestParams.type}
          onChange={event =>
            setTTestParams(previous => ({
              ...previous,
              type: event.target.value as TTestParams['type'],
            }))
          }
        >
          <option value="ind">{t('form.independentSamples')}</option>
          <option value="dep">{t('form.pairedSamples')}</option>
          <option value="one">{t('form.oneSample')}</option>
        </select>
      </Field>
      <VariableSelect
        label={t('form.variable1')}
        value={ttestParams.var1}
        options={options}
        onChange={value => setTTestParams(previous => ({ ...previous, var1: value }))}
      />
      {ttestParams.type !== 'one' ? (
        <VariableSelect
          label={t('form.variable2')}
          value={ttestParams.var2}
          options={options}
          onChange={value => setTTestParams(previous => ({ ...previous, var2: value }))}
        />
      ) : (
        <Field label={t('form.testMean')}>
          <input
            type="number"
            aria-label={t('form.testMean')}
            className="w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
            value={ttestParams.mu}
            onChange={event =>
              setTTestParams(previous => ({ ...previous, mu: parseFloat(event.target.value) }))
            }
          />
        </Field>
      )}
      {ttestParams.type === 'ind' && (
        <Field label={t('form.variances')}>
          <select
            aria-label={t('form.variances')}
            className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
            value={ttestParams.equalVar ? 'equal' : 'welch'}
            onChange={event =>
              setTTestParams(previous => ({
                ...previous,
                equalVar: event.target.value === 'equal',
              }))
            }
          >
            <option value="equal">{t('form.equalPooled')}</option>
            <option value="welch">{t('form.unequalWelch')}</option>
          </select>
        </Field>
      )}
    </>
  );
};
