import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { PlsParams } from '../../io/project';
import {
  NumberField,
  VariableList,
  VariableSelect,
  variableOptionsFrom,
} from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface PlsFormProps {
  grid: GridData;
  params: PlsParams;
  setParams: Dispatch<SetStateAction<PlsParams>>;
}

export const PlsForm = ({ grid, params, setParams }: PlsFormProps) => {
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
        label={t('form.components')}
        value={params.components}
        min="1"
        max="10"
        step="1"
        onChange={value => setParams(previous => ({ ...previous, components: value }))}
      />
      <NumberField
        label={t('form.cvFolds')}
        value={params.cvFolds}
        min="0"
        max="10"
        step="1"
        onChange={value => setParams(previous => ({ ...previous, cvFolds: value }))}
      />
    </div>
  );
};
