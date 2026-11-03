import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { CompetingParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  Field,
  VariableList,
  VariableSelect,
  variableOptions,
} from '../../components/FormFields';

export interface CompetingFormProps {
  grid: GridData;
  competingParams: CompetingParams;
  setCompetingParams: Dispatch<SetStateAction<CompetingParams>>;
}

export const CompetingForm = ({
  grid,
  competingParams,
  setCompetingParams,
}: CompetingFormProps) => {
  const { time, event, cause, covariates } = competingParams;
  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.time')}
        value={time}
        options={variableOptions(grid.cols)}
        disabledValues={[event]}
        onChange={value => setCompetingParams(prev => ({ ...prev, time: value }))}
      />
      <VariableSelect
        label={t('form.event')}
        value={event}
        options={variableOptions(grid.cols)}
        disabledValues={[time]}
        onChange={value => setCompetingParams(prev => ({ ...prev, event: value }))}
      />
      <Field label={t('form.cause')}>
        <input
          type="number"
          min={1}
          aria-label={t('form.cause')}
          className="w-24 rounded border border-border2 bg-surface p-1 font-mono text-[11px] text-text"
          value={cause}
          onChange={input =>
            setCompetingParams(prev => ({
              ...prev,
              cause: Math.max(1, Math.round(Number(input.target.value) || 1)),
            }))
          }
        />
      </Field>
      <VariableList
        label={t('form.covariatesX')}
        cols={grid.cols}
        only={continuousColumnIndexes(grid)}
        emptyText={t('form.noNumericColumns')}
        selected={covariates}
        disabled={[time, event]}
        onToggle={(index, checked) =>
          setCompetingParams(prev => ({
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
