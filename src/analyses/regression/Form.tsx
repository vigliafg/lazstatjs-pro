import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { RegParams } from '../../io/project';
import {
  Advanced,
  CheckboxField,
  Field,
  NumberField,
  VariableList,
  VariableSelect,
  variableOptionsFrom,
} from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface RegressionFormProps {
  grid: GridData;
  regParams: RegParams;
  setRegParams: Dispatch<SetStateAction<RegParams>>;
}

export const RegressionForm = ({ grid, regParams, setRegParams }: RegressionFormProps) => {
  const mode = regParams.mode ?? 'linear';
  return (
    <>
      <Field label={t('form.procedure')}>
        <select
          aria-label={t('form.procedure')}
          className="min-w-[160px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={mode}
          onChange={event =>
            setRegParams(previous => ({
              ...previous,
              mode: event.target.value as RegParams['mode'],
            }))
          }
        >
          <option value="linear">{t('regression.linear')}</option>
          <option value="selection">{t('regression.selection')}</option>
          <option value="polynomial">{t('regression.polynomial')}</option>
          <option value="penalized">{t('regression.penalized')}</option>
        </select>
      </Field>
      <VariableSelect
        label={t('form.dependentY')}
        value={regParams.dep}
        options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
        onChange={value =>
          setRegParams(previous => ({
            ...previous,
            dep: value,
            indeps: previous.indeps.filter(index => index !== value),
          }))
        }
      />
      {mode === 'polynomial' ? (
        <>
          <VariableSelect
            label={t('form.predictorX')}
            value={regParams.indeps[0] ?? -1}
            options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
            onChange={value => setRegParams(previous => ({ ...previous, indeps: [value] }))}
          />
          <NumberField
            label={t('form.degree')}
            value={regParams.degree ?? 2}
            min="1"
            max="12"
            step="1"
            onChange={value =>
              setRegParams(previous => ({
                ...previous,
                degree: Math.min(12, Math.max(1, Math.round(value))),
              }))
            }
          />
        </>
      ) : (
        <VariableList
          label={t('form.independentsX')}
          cols={grid.cols}
          only={continuousColumnIndexes(grid)}
          emptyText={t('form.noNumericColumns')}
          selected={regParams.indeps}
          disabled={[regParams.dep]}
          onToggle={(column, checked) =>
            setRegParams(previous => ({
              ...previous,
              indeps: checked
                ? [...previous.indeps, column]
                : previous.indeps.filter(index => index !== column),
            }))
          }
        />
      )}
      {mode === 'selection' && (
        <>
          <Field label={t('form.selectionDirection')}>
            <select
              aria-label={t('form.selectionDirection')}
              className="min-w-[140px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
              value={regParams.selectionDirection ?? 'both'}
              onChange={event =>
                setRegParams(previous => ({
                  ...previous,
                  selectionDirection: event.target.value as RegParams['selectionDirection'],
                }))
              }
            >
              <option value="forward">{t('selection.forward')}</option>
              <option value="backward">{t('selection.backward')}</option>
              <option value="both">{t('selection.both')}</option>
            </select>
          </Field>
          <Field label={t('form.selectionCriterion')}>
            <select
              aria-label={t('form.selectionCriterion')}
              className="min-w-[140px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
              value={regParams.selectionCriterion ?? 'bic'}
              onChange={event =>
                setRegParams(previous => ({
                  ...previous,
                  selectionCriterion: event.target.value as RegParams['selectionCriterion'],
                }))
              }
            >
              <option value="bic">{t('selection.bic')}</option>
              <option value="aic">{t('selection.aic')}</option>
              <option value="adjR2">{t('selection.adjR2')}</option>
              <option value="r2">{t('selection.r2')}</option>
              <option value="cp">{t('selection.cp')}</option>
              <option value="p">{t('selection.p')}</option>
            </select>
          </Field>
        </>
      )}
      {mode === 'penalized' && (
        <>
          <Field label={t('penalized.penalty')}>
            <select
              aria-label={t('penalized.penalty')}
              className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
              value={regParams.penalty ?? 'lasso'}
              onChange={event =>
                setRegParams(previous => ({
                  ...previous,
                  penalty: event.target.value as RegParams['penalty'],
                }))
              }
            >
              <option value="ridge">{t('penalized.ridge')}</option>
              <option value="lasso">{t('penalized.lasso')}</option>
              <option value="elasticnet">{t('penalized.elasticnet')}</option>
            </select>
          </Field>
          <NumberField
            label={t('form.lambda')}
            value={regParams.lambda ?? 0.1}
            min="0"
            step="0.01"
            onChange={value =>
              setRegParams(previous => ({ ...previous, lambda: Math.max(0, value) }))
            }
          />
          {(regParams.penalty ?? 'lasso') === 'elasticnet' && (
            <NumberField
              label={t('form.alphaMixing')}
              value={regParams.penaltyAlpha ?? 0.5}
              min="0"
              max="1"
              step="0.05"
              onChange={value =>
                setRegParams(previous => ({
                  ...previous,
                  penaltyAlpha: Math.min(1, Math.max(0, value)),
                }))
              }
            />
          )}
        </>
      )}
      {mode === 'linear' && (
        <Advanced>
          <Field label={t('form.robustSE')}>
            <select
              aria-label={t('form.robustSE')}
              className="min-w-[110px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
              value={regParams.robustSE}
              onChange={event =>
                setRegParams(previous => ({
                  ...previous,
                  robustSE: event.target.value as RegParams['robustSE'],
                }))
              }
            >
              <option value="none">{t('form.ols')}</option>
              <option value="HC1">HC1</option>
              <option value="HC3">HC3</option>
            </select>
          </Field>
          <CheckboxField
            label={t('form.theilSen')}
            checked={regParams.useNonParam}
            onChange={checked => setRegParams(previous => ({ ...previous, useNonParam: checked }))}
            hint={t('hint.regression')}
          />
        </Advanced>
      )}
    </>
  );
};
