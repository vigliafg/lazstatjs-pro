import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { TdCoxParams } from '../../io/project';
import { t } from '../../i18n';
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
        onChange={value => setTdCoxParams(prev => ({ ...prev, start: value }))}
      />
      <VariableSelect
        label={t('form.stop')}
        value={tdCoxParams.stop}
        options={options}
        onChange={value => setTdCoxParams(prev => ({ ...prev, stop: value }))}
      />
      <VariableSelect
        label={t('form.event')}
        value={tdCoxParams.event}
        options={options}
        onChange={value => setTdCoxParams(prev => ({ ...prev, event: value }))}
      />
      <VariableList
        label={t('form.covariatesX')}
        cols={grid.cols}
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
