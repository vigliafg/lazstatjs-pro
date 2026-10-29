import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { MiParams } from '../../io/project';
import { t } from '../../i18n';
import {
  Field,
  VariableList,
  VariableSelect,
  variableOptions,
} from '../../components/FormFields';

export interface MiFormProps {
  grid: GridData;
  miParams: MiParams;
  setMiParams: Dispatch<SetStateAction<MiParams>>;
}

export const MiForm = ({ grid, miParams, setMiParams }: MiFormProps) => (
  <div className="flex flex-col gap-3">
    <VariableList
      label={t('form.variables')}
      cols={grid.cols}
      selected={miParams.variables}
      showType
      hint={t('hint.mi')}
      onToggle={(index, checked) =>
        setMiParams(prev => ({
          ...prev,
          variables: checked
            ? [...prev.variables, index]
            : prev.variables.filter(item => item !== index),
        }))
      }
    />
    <Field label={t('form.pooledAnalysis')}>
      <select
        aria-label={t('form.pooledAnalysis')}
        className="min-w-[130px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={miParams.model}
        onChange={e =>
          setMiParams(prev => ({ ...prev, model: e.target.value as MiParams['model'] }))
        }
      >
        <option value="descriptives">{t('form.descriptives')}</option>
        <option value="linear">{t('form.linearRegression')}</option>
      </select>
    </Field>
    {miParams.model === 'linear' && (
      <>
        <VariableSelect
          label={t('form.outcome')}
          value={miParams.outcome}
          options={variableOptions(grid.cols)}
          onChange={value => setMiParams(prev => ({ ...prev, outcome: value }))}
        />
        <VariableList
          label={t('form.predictorsX')}
          cols={grid.cols}
          selected={miParams.predictors}
          disabled={[miParams.outcome]}
          onToggle={(index, checked) =>
            setMiParams(prev => ({
              ...prev,
              predictors: checked
                ? [...prev.predictors, index]
                : prev.predictors.filter(item => item !== index),
            }))
          }
        />
      </>
    )}
    <div className="flex gap-2">
      <Field label={t('form.imputations')}>
        <input
          type="number"
          min="2"
          max="50"
          step="1"
          aria-label={t('form.imputations')}
          className="w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={miParams.imputations}
          onChange={e =>
            setMiParams(prev => ({ ...prev, imputations: parseInt(e.target.value, 10) }))
          }
        />
      </Field>
      <Field label={t('form.iterations')}>
        <input
          type="number"
          min="1"
          max="50"
          step="1"
          aria-label={t('form.iterations')}
          className="w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={miParams.iterations}
          onChange={e =>
            setMiParams(prev => ({ ...prev, iterations: parseInt(e.target.value, 10) }))
          }
        />
      </Field>
    </div>
  </div>
);
