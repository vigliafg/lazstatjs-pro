import type { Dispatch, SetStateAction } from 'react';
import type { CategoryLevel, GridData } from '../../grid/types';
import type { StratifiedCoxParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  GroupSelect,
  VariableList,
  VariableSelect,
  variableOptions,
} from '../../components/FormFields';

export interface StratifiedCoxFormProps {
  grid: GridData;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
  stratCoxParams: StratifiedCoxParams;
  setStratCoxParams: Dispatch<SetStateAction<StratifiedCoxParams>>;
}

export const StratifiedCoxForm = ({
  grid,
  onLevels,
  onRecode,
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
      <GroupSelect
        label={t('form.stratum')}
        grid={grid}
        value={stratCoxParams.stratum}
        allowNone
        disabledValues={[stratCoxParams.time, stratCoxParams.event]}
        onLevels={onLevels}
        onRecode={onRecode}
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
      emptyText={t('form.noNumericColumns')}
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
