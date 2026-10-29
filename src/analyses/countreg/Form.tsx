import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { CountParams } from '../../io/project';
import { t } from '../../i18n';
import { variableOptionsFrom } from '../../components/FormFields';
import { continuousColumnIndexes } from '../shared/columns';
import { Field, VariableList, VariableSelect, variableOptions } from '../../components/FormFields';

export interface CountFormProps {
  grid: GridData;
  countParams: CountParams;
  setCountParams: Dispatch<SetStateAction<CountParams>>;
}

export const CountForm = ({ grid, countParams, setCountParams }: CountFormProps) => {
  const { dep, indeps, family } = countParams;

  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.countOutcome')}
        value={dep}
        options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
        onChange={value => setCountParams(prev => ({ ...prev, dep: value }))}
      />
      <VariableList
        label={t('form.predictorsX')}
        cols={grid.cols}
        only={continuousColumnIndexes(grid)}
        selected={indeps}
        disabled={[dep]}
        showType
        hint={t('hint.countreg')}
        onToggle={(index, checked) =>
          setCountParams(prev => ({
            ...prev,
            indeps: checked
              ? [...prev.indeps, index]
              : prev.indeps.filter(item => item !== index),
          }))
        }
      />
      <Field label={t('form.family')}>
        <select
          aria-label={t('form.family')}
          className="min-w-[180px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={family}
          onChange={e =>
            setCountParams(prev => ({
              ...prev,
              family: e.target.value as CountParams['family'],
            }))
          }
        >
          <option value="poisson">{t('form.poisson')}</option>
          <option value="negbin">{t('form.negativeBinomial')}</option>
        </select>
      </Field>
    </div>
  );
};
