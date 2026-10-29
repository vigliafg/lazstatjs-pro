import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { CoxParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import { VariableList, VariableSelect, variableOptions } from '../../components/FormFields';

export interface CoxFormProps {
  grid: GridData;
  coxParams: CoxParams;
  setCoxParams: Dispatch<SetStateAction<CoxParams>>;
}

export const CoxForm = ({ grid, coxParams, setCoxParams }: CoxFormProps) => {
  const { timeVariable, eventVariable, covariates } = coxParams;
  const options = variableOptions(grid.cols);

  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.time')}
        value={timeVariable}
        options={options}
        onChange={value => setCoxParams(prev => ({ ...prev, timeVariable: value }))}
      />
      <VariableSelect
        label={t('form.event')}
        value={eventVariable}
        options={options}
        onChange={value => setCoxParams(prev => ({ ...prev, eventVariable: value }))}
      />
      <VariableList
        label={t('form.covariatesX')}
        cols={grid.cols}
        only={continuousColumnIndexes(grid)}
        selected={covariates}
        disabled={[timeVariable, eventVariable]}
        onToggle={(index, checked) =>
          setCoxParams(prev => ({
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
