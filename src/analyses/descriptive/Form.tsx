import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import { VariableList } from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface DescriptiveFormProps {
  grid: GridData;
  descVars: number[];
  setDescVars: Dispatch<SetStateAction<number[]>>;
}

export const DescriptiveForm = ({ grid, descVars, setDescVars }: DescriptiveFormProps) => (
  <VariableList
    label={t('form.selectVariables')}
    cols={grid.cols}
    only={continuousColumnIndexes(grid)}
      emptyText={t('form.noNumericColumns')}
    selected={descVars}
    hint={t('hint.descriptive')}
    onToggle={(column, checked) =>
      setDescVars(previous =>
        checked ? [...previous, column] : previous.filter(index => index !== column)
      )
    }
  />
);
