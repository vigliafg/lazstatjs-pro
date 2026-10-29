import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { TdCoxParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import { VariableList, VariableSelect, variableOptions } from '../../components/FormFields';

export interface TdCoxFormProps {
  grid: GridData;
  tdCoxParams: TdCoxParams;
  setTdCoxParams: Dispatch<SetStateAction<TdCoxParams>>;
}

export const TdCoxForm = ({ grid, tdCoxParams, setTdCoxParams }: TdCoxFormProps) => {
  const options = variableOptions(grid.cols);
  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.start')}
        value={tdCoxParams.start}
        options={options}
        disabledValues={[tdCoxParams.stop, tdCoxParams.event]}
        onChange={value => setTdCoxParams(prev => ({ ...prev, start: value }))}
      />
      <VariableSelect
        label={t('form.stop')}
        value={tdCoxParams.stop}
        options={options}
        disabledValues={[tdCoxParams.start, tdCoxParams.event]}
        onChange={value => setTdCoxParams(prev => ({ ...prev, stop: value }))}
      />
      <VariableSelect
        label={t('form.event')}
        value={tdCoxParams.event}
        options={options}
        disabledValues={[tdCoxParams.start, tdCoxParams.stop]}
        onChange={value => setTdCoxParams(prev => ({ ...prev, event: value }))}
      />
      <VariableList
        label={t('form.covariatesX')}
        cols={grid.cols}
        only={continuousColumnIndexes(grid)}
      emptyText={t('form.noNumericColumns')}
        selected={tdCoxParams.covariates}
        disabled={[tdCoxParams.start, tdCoxParams.stop, tdCoxParams.event]}
        showType
        hint={t('hint.tdcox')}
        onToggle={(index, checked) =>
          setTdCoxParams(prev => ({
            ...prev,
            covariates: checked
              ? [...prev.covariates, index]
              : prev.covariates.filter(item => item !== index),
          }))
        }
      />
    </div>
  );
};
