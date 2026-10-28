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

export interface RegressionFormProps {
  grid: GridData;
  regParams: RegParams;
  setRegParams: Dispatch<SetStateAction<RegParams>>;
}

export const RegressionForm = ({ grid, regParams, setRegParams }: RegressionFormProps) => (
  <>
    <VariableSelect
      label="Dependent (Y)"
      value={regParams.dep}
      options={variableOptions(grid.cols)}
      onChange={value => setRegParams(previous => ({ ...previous, dep: value }))}
    />
    <VariableList
      label="Independents (X)"
      cols={grid.cols}
      selected={regParams.indeps}
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
      <Field label="Robust SE" hint="Heteroskedasticity-consistent standard errors.">
        <select
          aria-label="Regression robust standard errors"
          className="min-w-[110px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={regParams.robustSE}
          onChange={event =>
            setRegParams(previous => ({
              ...previous,
              robustSE: event.target.value as RegParams['robustSE'],
            }))
          }
        >
          <option value="none">None (OLS)</option>
          <option value="HC1">HC1</option>
          <option value="HC3">HC3</option>
        </select>
      </Field>
      <CheckboxField
        label="Theil-Sen robust line"
        checked={regParams.useNonParam}
        onChange={checked => setRegParams(previous => ({ ...previous, useNonParam: checked }))}
        hint="Median-slope estimate with bootstrap CI."
      />
    </Advanced>
  </>
);
