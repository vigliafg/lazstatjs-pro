import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { DoeParams } from '../../io/project';
import {
  Advanced,
  Field,
  NumberField,
  VariableSelect,
  variableOptionsFrom,
} from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface DoeFormProps {
  grid: GridData;
  doeParams: DoeParams;
  setDoeParams: Dispatch<SetStateAction<DoeParams>>;
}

export const DoeForm = ({ grid, doeParams, setDoeParams }: DoeFormProps) => {
  const numeric = continuousColumnIndexes(grid);
  return (
    <>
      <Field label={t('form.procedure')}>
        <select
          aria-label={t('form.procedure')}
          className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={doeParams.mode}
          onChange={event =>
            setDoeParams(previous => ({
              ...previous,
              mode: event.target.value as DoeParams['mode'],
            }))
          }
        >
          <option value="surface">{t('doe.surface')}</option>
          <option value="design">{t('doe.design')}</option>
        </select>
      </Field>

      {doeParams.mode === 'design' ? (
        <Advanced>
          <Field label={t('form.designType')}>
            <select
              aria-label={t('form.designType')}
              className="min-w-[170px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
              value={doeParams.designType}
              onChange={event =>
                setDoeParams(previous => ({
                  ...previous,
                  designType: event.target.value as DoeParams['designType'],
                }))
              }
            >
              <option value="full">{t('doe.full')}</option>
              <option value="half">{t('doe.half')}</option>
              <option value="ccd">{t('doe.ccd')}</option>
              <option value="boxBehnken">{t('doe.boxBehnken')}</option>
            </select>
          </Field>
          <NumberField
            label={t('form.factorCount')}
            value={doeParams.factors}
            min="2"
            max="7"
            step="1"
            integer
            onChange={value => setDoeParams(previous => ({ ...previous, factors: value }))}
          />
          <NumberField
            label={t('form.centerPoints')}
            value={doeParams.centerPoints}
            min="0"
            max="50"
            step="1"
            integer
            onChange={value => setDoeParams(previous => ({ ...previous, centerPoints: value }))}
          />
        </Advanced>
      ) : (
        <>
      <VariableSelect
        label={t('form.responseY')}
        value={doeParams.response}
        options={variableOptionsFrom(grid.cols, numeric)}
        onChange={value =>
          setDoeParams(previous => ({ ...previous, response: value }))
        }
      />
      <VariableSelect
        label={t('form.factorA')}
        value={doeParams.factorA}
        options={variableOptionsFrom(grid.cols, numeric)}
        disabledValues={[doeParams.response]}
        onChange={value =>
          setDoeParams(previous => ({ ...previous, factorA: value }))
        }
      />
      <VariableSelect
        label={t('form.factorB')}
        value={doeParams.factorB}
        options={variableOptionsFrom(grid.cols, numeric)}
        disabledValues={[doeParams.response, doeParams.factorA]}
        onChange={value =>
          setDoeParams(previous => ({ ...previous, factorB: value }))
        }
      />
      <Advanced>
        <Field label={t('form.model')}>
          <select
            aria-label={t('form.model')}
            className="min-w-[130px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
            value={doeParams.model}
            onChange={event =>
              setDoeParams(previous => ({
                ...previous,
                model: event.target.value as DoeParams['model'],
              }))
            }
          >
            <option value="linear">{t('form.linear')}</option>
            <option value="quadratic">{t('form.quadratic')}</option>
          </select>
        </Field>
      </Advanced>
        </>
      )}
    </>
  );
};
