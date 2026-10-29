import type { Dispatch, SetStateAction } from 'react';
import { groupColumnIndexes, type GridData } from '../../grid/types';
import type { StratifiedCoxParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  VariableList,
  VariableSelect,
  variableOptions,
  variableOptionsFrom,
} from '../../components/FormFields';

export interface StratifiedCoxFormProps {
  grid: GridData;
  stratCoxParams: StratifiedCoxParams;
  setStratCoxParams: Dispatch<SetStateAction<StratifiedCoxParams>>;
}

export const StratifiedCoxForm = ({
  grid,
  stratCoxParams,
  setStratCoxParams,
}: StratifiedCoxFormProps) => {
  const options = variableOptions(grid.cols);
  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.time')}
        value={stratCoxParams.time}
        options={options}
        onChange={value =>
          setStratCoxParams(prev => ({
            ...prev,
            time: value,
            covariates: prev.covariates.filter(column => column !== value),
          }))
        }
      />
      <VariableSelect
        label={t('form.event')}
        value={stratCoxParams.event}
        options={options}
        onChange={value =>
          setStratCoxParams(prev => ({
            ...prev,
            event: value,
            covariates: prev.covariates.filter(column => column !== value),
          }))
        }
      />
      <VariableSelect
        label={t('form.stratum')}
        value={stratCoxParams.stratum}
        options={[
          { value: -1, label: t('form.none') },
          ...variableOptionsFrom(grid.cols, groupColumnIndexes(grid)),
        ]}
        onChange={value =>
          setStratCoxParams(prev => ({
            ...prev,
            stratum: value,
            covariates: prev.covariates.filter(column => column !== value),
          }))
        }
      />
      <VariableList
        label={t('form.covariatesX')}
        cols={grid.cols}
        only={continuousColumnIndexes(grid)}
        selected={stratCoxParams.covariates}
        disabled={[stratCoxParams.time, stratCoxParams.event, stratCoxParams.stratum]}
        showType
        hint={t('hint.stratcox')}
        onToggle={(index, checked) =>
          setStratCoxParams(prev => ({
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
