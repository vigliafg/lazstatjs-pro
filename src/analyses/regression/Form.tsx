import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { RegParams } from '../../io/project';
import {
  Advanced,
  CheckboxField,
  Field,
  VariableList,
  VariableSelect,
  variableOptions,
} from '../../components/FormFields';
import { t } from '../../i18n';
import { variableOptionsFrom } from '../../components/FormFields';
import { continuousColumnIndexes } from '../shared/columns';

export interface RegressionFormProps {
  grid: GridData;
  regParams: RegParams;
  setRegParams: Dispatch<SetStateAction<RegParams>>;
}

export const RegressionForm = ({ grid, regParams, setRegParams }: RegressionFormProps) => (
  <>
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
  </>
);
