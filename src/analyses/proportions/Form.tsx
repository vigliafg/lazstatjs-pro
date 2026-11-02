import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { ProportionParams } from '../../io/project';
import {
  Advanced,
  Field,
  GroupSelect,
  VariableSelect,
  variableOptions,
  variableOptionsFrom,
} from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes, distinctValues } from '../shared/columns';

export interface ProportionsFormProps {
  grid: GridData;
  params: ProportionParams;
  setParams: Dispatch<SetStateAction<ProportionParams>>;
}

export const ProportionsForm = ({ grid, params, setParams }: ProportionsFormProps) => {
  const isRate = params.mode === 'oneRate' || params.mode === 'twoRate';
  const isTwo = params.mode === 'twoProp' || params.mode === 'twoRate';
  const levels = [...distinctValues(grid, params.variable)].sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0
  );

  return (
    <>
      <Field label={t('form.testType')}>
        <select
          aria-label={t('form.testType')}
          className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={params.mode}
          onChange={event =>
            setParams(previous => ({
              ...previous,
              mode: event.target.value as ProportionParams['mode'],
            }))
          }
        >
          <option value="oneProp">{t('proportions.oneProportion')}</option>
          <option value="twoProp">{t('proportions.twoProportions')}</option>
          <option value="oneRate">{t('proportions.oneRate')}</option>
          <option value="twoRate">{t('proportions.twoRates')}</option>
        </select>
      </Field>

      <VariableSelect
        label={isRate ? t('proportions.count') : t('proportions.outcome')}
        value={params.variable}
        options={
          isRate ? variableOptionsFrom(grid.cols, continuousColumnIndexes(grid)) : variableOptions(grid.cols)
        }
        onChange={value =>
          setParams(previous => ({ ...previous, variable: value, successLevel: '' }))
        }
      />

      {!isRate && (
        <Field label={t('proportions.successLevel')}>
          <select
            aria-label={t('proportions.successLevel')}
            className="min-w-[120px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
            value={levels.includes(params.successLevel) ? params.successLevel : levels[levels.length - 1] ?? ''}
            onChange={event =>
              setParams(previous => ({ ...previous, successLevel: event.target.value }))
            }
          >
            {levels.map(level => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </Field>
      )}

      {isTwo && (
        <GroupSelect
          label={t('form.group')}
          grid={grid}
          value={params.group}
          onChange={value => setParams(previous => ({ ...previous, group: value }))}
        />
      )}

      <Advanced>
        {params.mode === 'oneProp' && (
          <Field label={t('proportions.nullProportion')}>
            <input
              type="number"
              step="0.01"
              min={0}
              max={1}
              className="w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
              value={params.nullP}
              onChange={event =>
                setParams(previous => ({ ...previous, nullP: Number(event.target.value) }))
              }
            />
          </Field>
        )}
        {isRate && (
          <>
            <Field label={t('proportions.nullRate')}>
              <input
                type="number"
                step="any"
                min={0}
                className="w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
                value={params.nullRate}
                onChange={event =>
                  setParams(previous => ({ ...previous, nullRate: Number(event.target.value) }))
                }
              />
            </Field>
            <Field label={t('proportions.exposure')}>
              <input
                type="number"
                step="any"
                min={0}
                className="w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
                value={params.exposure}
                onChange={event =>
                  setParams(previous => ({ ...previous, exposure: Number(event.target.value) }))
                }
              />
            </Field>
          </>
        )}
      </Advanced>
    </>
  );
};
