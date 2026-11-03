import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { IvParams } from '../../io/project';
import {
  CheckboxField,
  VariableList,
  VariableSelect,
  variableOptionsFrom,
} from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface IvFormProps {
  grid: GridData;
  params: IvParams;
  setParams: Dispatch<SetStateAction<IvParams>>;
}

/**
 * Column roles of the 2SLS model.
 *
 * The dependent variable and the other three roles are mutually exclusive: a
 * column already assigned elsewhere is shown but not selectable, and changing
 * the dependent variable removes it from the lists.
 */
export const IvForm = ({ grid, params, setParams }: IvFormProps) => {
  const options = variableOptionsFrom(grid.cols, continuousColumnIndexes(grid));
  const numeric = continuousColumnIndexes(grid);

  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.dependentY')}
        value={params.dep}
        options={options}
        disabledValues={[...params.endog, ...params.instruments, ...params.exog]}
        onChange={value =>
          setParams(previous => ({
            ...previous,
            dep: value,
            endog: previous.endog.filter(index => index !== value),
            instruments: previous.instruments.filter(index => index !== value),
            exog: previous.exog.filter(index => index !== value),
          }))
        }
      />

      <VariableList
        label={t('form.endogenous')}
        cols={grid.cols}
        only={numeric}
        emptyText={t('form.noNumericColumns')}
        selected={params.endog}
        disabled={[params.dep, ...params.instruments, ...params.exog]}
        onToggle={(column, checked) =>
          setParams(previous => ({
            ...previous,
            endog: checked
              ? [...previous.endog, column]
              : previous.endog.filter(index => index !== column),
          }))
        }
      />

      <VariableList
        label={t('form.instruments')}
        cols={grid.cols}
        only={numeric}
        emptyText={t('form.noNumericColumns')}
        selected={params.instruments}
        disabled={[params.dep, ...params.endog, ...params.exog]}
        onToggle={(column, checked) =>
          setParams(previous => ({
            ...previous,
            instruments: checked
              ? [...previous.instruments, column]
              : previous.instruments.filter(index => index !== column),
          }))
        }
      />

      <VariableList
        label={t('form.exogenous')}
        cols={grid.cols}
        only={numeric}
        emptyText={t('form.noNumericColumns')}
        selected={params.exog}
        disabled={[params.dep, ...params.endog, ...params.instruments]}
        onToggle={(column, checked) =>
          setParams(previous => ({
            ...previous,
            exog: checked
              ? [...previous.exog, column]
              : previous.exog.filter(index => index !== column),
          }))
        }
      />

      <CheckboxField
        label={t('form.robustSE')}
        checked={params.robust}
        onChange={checked => setParams(previous => ({ ...previous, robust: checked }))}
      />
    </div>
  );
};
