import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import { VariableList } from '../../components/FormFields';

export interface DescriptiveFormProps {
  grid: GridData;
  descVars: number[];
  setDescVars: Dispatch<SetStateAction<number[]>>;
}

export const DescriptiveForm = ({ grid, descVars, setDescVars }: DescriptiveFormProps) => (
  <VariableList
    label="Select Variables"
    cols={grid.cols}
    selected={descVars}
    hint="One row per variable, with N, missing, spread, quantiles and normality checks."
    onToggle={(column, checked) =>
      setDescVars(previous =>
        checked ? [...previous, column] : previous.filter(index => index !== column)
      )
    }
  />
);
