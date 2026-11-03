import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { PanelParams } from '../../io/project';
import {
  Field,
  VariableList,
  VariableSelect,
  variableOptions,
  variableOptionsFrom,
} from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface PanelFormProps {
  grid: GridData;
  params: PanelParams;
  setParams: Dispatch<SetStateAction<PanelParams>>;
}

/**
 * Column roles of a panel model.
 *
 * The entity and the time index accept any column: the entity is often a text
 * identifier with far more levels than a group column, and the time index may
 * be a numeric period. The four roles are mutually exclusive, and only the
 * dependent variable and the predictors are restricted to numeric columns.
 */
export const PanelForm = ({ grid, params, setParams }: PanelFormProps) => {
  const numeric = continuousColumnIndexes(grid);
  const allColumns = variableOptions(grid.cols);

  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.dependentY')}
        value={params.dep}
        options={variableOptionsFrom(grid.cols, numeric)}
        disabledValues={[...params.indeps, params.entity, params.time]}
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
        only={numeric}
        emptyText={t('form.noNumericColumns')}
        selected={params.indeps}
        disabled={[params.dep, params.entity, params.time]}
        onToggle={(column, checked) =>
          setParams(previous => ({
            ...previous,
            indeps: checked
              ? [...previous.indeps, column]
              : previous.indeps.filter(index => index !== column),
          }))
        }
      />

      <VariableSelect
        label={t('form.entity')}
        value={params.entity}
        options={allColumns}
        disabledValues={[params.dep, ...params.indeps, params.time]}
        onChange={value =>
          setParams(previous => ({
            ...previous,
            entity: value,
            indeps: previous.indeps.filter(index => index !== value),
          }))
        }
      />

      <VariableSelect
        label={t('form.time')}
        value={params.time}
        options={allColumns}
        disabledValues={[params.dep, ...params.indeps, params.entity]}
        onChange={value =>
          setParams(previous => ({
            ...previous,
            time: value,
            indeps: previous.indeps.filter(index => index !== value),
          }))
        }
      />

      <Field label={t('form.panelModel')}>
        <select
          aria-label={t('form.panelModel')}
          className="min-w-[160px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={params.model}
          onChange={event =>
            setParams(previous => ({
              ...previous,
              model: event.target.value as PanelParams['model'],
            }))
          }
        >
          <option value="fe">{t('form.fixedEffects')}</option>
          <option value="re">{t('form.randomEffects')}</option>
          <option value="both">{t('form.bothEffects')}</option>
        </select>
      </Field>
    </div>
  );
};
