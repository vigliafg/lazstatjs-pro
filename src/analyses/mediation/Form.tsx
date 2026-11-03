import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { MediationParams } from '../../io/project';
import {
  NumberField,
  VariableList,
  VariableSelect,
  variableOptionsFrom,
} from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface MediationFormProps {
  grid: GridData;
  params: MediationParams;
  setParams: Dispatch<SetStateAction<MediationParams>>;
}

/** Ruoli della mediazione: esito Y, predittore X, mediatore M e covariate. */
export const MediationForm = ({ grid, params, setParams }: MediationFormProps) => {
  const columns = continuousColumnIndexes(grid);
  const removeCovariate = (value: number, previous: MediationParams): MediationParams => ({
    ...previous,
    covariates: previous.covariates.filter(index => index !== value),
  });

  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.outcome')}
        value={params.outcome}
        options={variableOptionsFrom(grid.cols, columns)}
        disabledValues={[params.predictor, params.mediator]}
        onChange={value =>
          setParams(previous => ({
            ...removeCovariate(value, previous),
            outcome: value,
          }))
        }
      />
      <VariableSelect
        label={t('form.predictor')}
        value={params.predictor}
        options={variableOptionsFrom(grid.cols, columns)}
        disabledValues={[params.outcome, params.mediator]}
        onChange={value =>
          setParams(previous => ({
            ...removeCovariate(value, previous),
            predictor: value,
          }))
        }
      />
      <VariableSelect
        label={t('form.mediator')}
        value={params.mediator}
        options={variableOptionsFrom(grid.cols, columns)}
        disabledValues={[params.outcome, params.predictor]}
        onChange={value =>
          setParams(previous => ({
            ...removeCovariate(value, previous),
            mediator: value,
          }))
        }
      />
      <VariableList
        label={t('form.covariatesX')}
        cols={grid.cols}
        only={columns}
        emptyText={t('form.noNumericColumns')}
        selected={params.covariates}
        disabled={[params.outcome, params.predictor, params.mediator]}
        onToggle={(column, checked) =>
          setParams(previous => ({
            ...previous,
            covariates: checked
              ? [...previous.covariates, column]
              : previous.covariates.filter(index => index !== column),
          }))
        }
      />
      <div className="flex gap-2">
        <NumberField
          label={t('form.bootstrap')}
          value={params.bootstrap}
          min="1"
          max="5000"
          step="100"
          integer
          onChange={value => setParams(previous => ({ ...previous, bootstrap: value }))}
        />
        <NumberField
          label={t('form.seed')}
          value={params.seed}
          min="0"
          max="2147483647"
          step="1"
          integer
          onChange={value => setParams(previous => ({ ...previous, seed: value }))}
        />
      </div>
    </div>
  );
};
