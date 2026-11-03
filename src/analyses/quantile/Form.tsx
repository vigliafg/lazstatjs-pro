import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { QuantileParams } from '../../io/project';
import {
  NumberField,
  VariableList,
  VariableSelect,
  variableOptionsFrom,
} from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface QuantileFormProps {
  grid: GridData;
  params: QuantileParams;
  setParams: Dispatch<SetStateAction<QuantileParams>>;
}

export const QuantileForm = ({ grid, params, setParams }: QuantileFormProps) => {
  const columns = continuousColumnIndexes(grid);
  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.dependentY')}
        value={params.dep}
        options={variableOptionsFrom(grid.cols, columns)}
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
        only={columns}
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
        label={t('form.tau')}
        value={params.tau}
        min="0.01"
        max="0.99"
        step="0.01"
        onChange={value => setParams(previous => ({ ...previous, tau: value }))}
      />
    </div>
  );
};
