import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { MarsParams } from '../../io/project';
import {
  Field,
  NumberField,
  VariableList,
  VariableSelect,
  variableOptionsFrom,
} from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface MarsFormProps {
  grid: GridData;
  params: MarsParams;
  setParams: Dispatch<SetStateAction<MarsParams>>;
}

export const MarsForm = ({ grid, params, setParams }: MarsFormProps) => (
  <div className="flex flex-col gap-3">
    <VariableSelect
      label={t('form.dependentY')}
      value={params.dep}
      options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
      onChange={value =>
        setParams(previous => ({
          ...previous,
          dep: value,
          indeps: previous.indeps.filter(index => index !== value),
        }))
      }
    />
    <VariableList
      label={t('form.independentsX')}
      cols={grid.cols}
      only={continuousColumnIndexes(grid)}
      emptyText={t('form.noNumericColumns')}
      selected={params.indeps}
      disabled={[params.dep]}
      onToggle={(column, checked) =>
        setParams(previous => ({
          ...previous,
          indeps: checked
            ? [...previous.indeps, column]
            : previous.indeps.filter(index => index !== column),
        }))
      }
    />
    <Field label={t('form.degree')}>
      <select
        aria-label={t('form.degree')}
        className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={params.degree}
        onChange={event =>
          setParams(previous => ({
            ...previous,
            degree: Number(event.target.value) === 2 ? 2 : 1,
          }))
        }
      >
        <option value={1}>1</option>
        <option value={2}>2</option>
      </select>
    </Field>
    <NumberField
      label={t('form.maxTerms')}
      value={params.maxTerms}
      min="3"
      step="1"
      integer
      onChange={value =>
        setParams(previous => ({
          ...previous,
          maxTerms: Number.isFinite(value) ? Math.max(3, Math.trunc(value)) : previous.maxTerms,
        }))
      }
    />
    <NumberField
      label={t('form.penalty')}
      value={params.penalty}
      min="0"
      step="0.5"
      onChange={value =>
        setParams(previous => ({
          ...previous,
          penalty: Number.isFinite(value) && value >= 0 ? value : previous.penalty,
        }))
      }
    />
    <label className="flex items-center gap-2 text-[11px] text-text">
      <input
        type="checkbox"
        className="h-3.5 w-3.5 accent-accent"
        checked={params.prune}
        onChange={event =>
          setParams(previous => ({
            ...previous,
            prune: event.target.checked,
          }))
        }
      />
      {t('form.prune')}
    </label>
  </div>
);
