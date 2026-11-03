import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { SelectionParams } from '../../io/project';
import {
  CheckboxField,
  Field,
  NumberField,
  VariableList,
  VariableSelect,
  variableOptionsFrom,
} from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes, numericColumnIndexes } from '../shared/columns';

export interface SelectionFormProps {
  grid: GridData;
  params: SelectionParams;
  setParams: Dispatch<SetStateAction<SelectionParams>>;
}

/**
 * Form for the Tobit/Heckman entry.
 *
 * The outcome equation is shared; the selection indicator and its predictors
 * only appear in Heckman mode. Enabling upper censoring seeds a finite limit
 * above the lower one, because the runner rejects `upper <= lower`.
 */
export const SelectionForm = ({ grid, params, setParams }: SelectionFormProps) => {
  const continuous = continuousColumnIndexes(grid);
  const numeric = numericColumnIndexes(grid);
  const heckman = params.mode === 'heckman';

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('form.selectionMode')}>
        <select
          aria-label={t('form.selectionMode')}
          className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={params.mode}
          onChange={event =>
            setParams(previous => ({
              ...previous,
              mode: event.target.value === 'heckman' ? 'heckman' : 'tobit',
            }))
          }
        >
          <option value="tobit">{t('form.tobit')}</option>
          <option value="heckman">{t('form.heckman')}</option>
        </select>
      </Field>

      <VariableSelect
        label={t('form.dependentY')}
        value={params.dep}
        options={variableOptionsFrom(grid.cols, continuous)}
        onChange={value =>
          setParams(previous => ({
            ...previous,
            dep: value,
            indeps: previous.indeps.filter(index => index !== value),
            selectIndeps: previous.selectIndeps.filter(index => index !== value),
          }))
        }
      />

      <VariableList
        label={t('form.independentsX')}
        cols={grid.cols}
        only={continuous}
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

      <NumberField
        label={t('form.lowerLimit')}
        value={params.lower}
        onChange={value => setParams(previous => ({ ...previous, lower: value }))}
      />

      <CheckboxField
        label={t('form.upperCensoring')}
        checked={params.upper !== null}
        onChange={checked =>
          setParams(previous => ({
            ...previous,
            upper: checked ? previous.lower + 1 : null,
          }))
        }
      />

      {params.upper !== null && (
        <NumberField
          label={t('form.upperLimit')}
          value={params.upper}
          onChange={value => setParams(previous => ({ ...previous, upper: value }))}
        />
      )}

      {heckman && (
        <>
          <VariableSelect
            label={t('form.selection')}
            value={params.selection}
            options={variableOptionsFrom(grid.cols, numeric)}
            onChange={value =>
              setParams(previous => ({
                ...previous,
                selection: value,
                selectIndeps: previous.selectIndeps.filter(index => index !== value),
              }))
            }
          />
          <VariableList
            label={t('form.selectionPredictors')}
            cols={grid.cols}
            only={continuous}
            emptyText={t('form.noNumericColumns')}
            selected={params.selectIndeps}
            disabled={[params.dep, params.selection]}
            onToggle={(column, checked) =>
              setParams(previous => ({
                ...previous,
                selectIndeps: checked
                  ? [...previous.selectIndeps, column]
                  : previous.selectIndeps.filter(index => index !== column),
              }))
            }
          />
        </>
      )}
    </div>
  );
};
