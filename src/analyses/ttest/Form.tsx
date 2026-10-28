import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { TTestParams } from '../../io/project';
import { Field, VariableSelect, variableOptions } from '../../components/FormFields';

export interface TTestFormProps {
  grid: GridData;
  ttestParams: TTestParams;
  setTTestParams: Dispatch<SetStateAction<TTestParams>>;
}

export const TTestForm = ({ grid, ttestParams, setTTestParams }: TTestFormProps) => {
  const options = variableOptions(grid.cols);
  return (
    <>
      <Field label="Test Type">
        <select
          aria-label="T-Test type"
          className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={ttestParams.type}
          onChange={event =>
            setTTestParams(previous => ({
              ...previous,
              type: event.target.value as TTestParams['type'],
            }))
          }
        >
          <option value="ind">Independent Samples</option>
          <option value="dep">Paired Samples</option>
          <option value="one">One-Sample</option>
        </select>
      </Field>
      <VariableSelect
        label="Variable 1"
        value={ttestParams.var1}
        options={options}
        onChange={value => setTTestParams(previous => ({ ...previous, var1: value }))}
      />
      {ttestParams.type !== 'one' ? (
        <VariableSelect
          label="Variable 2"
          value={ttestParams.var2}
          options={options}
          onChange={value => setTTestParams(previous => ({ ...previous, var2: value }))}
        />
      ) : (
        <Field label="Test Mean (μ₀)">
          <input
            type="number"
            aria-label="Test mean"
            className="w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
            value={ttestParams.mu}
            onChange={event =>
              setTTestParams(previous => ({ ...previous, mu: parseFloat(event.target.value) }))
            }
          />
        </Field>
      )}
      {ttestParams.type === 'ind' && (
        <Field label="Variances">
          <select
            aria-label="T-Test variances"
            className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
            value={ttestParams.equalVar ? 'equal' : 'welch'}
            onChange={event =>
              setTTestParams(previous => ({
                ...previous,
                equalVar: event.target.value === 'equal',
              }))
            }
          >
            <option value="equal">Equal (pooled)</option>
            <option value="welch">Unequal (Welch)</option>
          </select>
        </Field>
      )}
    </>
  );
};
