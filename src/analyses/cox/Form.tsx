import type { Dispatch, SetStateAction } from 'react';
import type { CategoryLevel, GridData } from '../../grid/types';
import type { CoxParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  Field,
  GroupSelect,
  VariableList,
  VariableSelect,
  variableOptions,
} from '../../components/FormFields';

export interface CoxFormProps {
  grid: GridData;
  onLevels?: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode?: (column: number, mapping: Record<string, string>) => void;
  coxParams: CoxParams;
  setCoxParams: Dispatch<SetStateAction<CoxParams>>;
}

export const CoxForm = ({
  grid,
  onLevels,
  onRecode,
  coxParams,
  setCoxParams,
}: CoxFormProps) => {
  const { timeVariable, eventVariable, covariates } = coxParams;
  const options = variableOptions(grid.cols);
  const mode = coxParams.mode ?? 'standard';

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('form.survivalMode')}>
        <select
          aria-label={t('form.survivalMode')}
          className="min-w-[180px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={mode}
          onChange={event =>
            setCoxParams(prev => ({
              ...prev,
              mode: event.target.value as NonNullable<typeof prev.mode>,
            }))
          }
        >
          <option value="standard">{t('form.coxStandard')}</option>
          <option value="frailty">{t('form.coxFrailty')}</option>
        </select>
      </Field>
      <VariableSelect
        label={t('form.time')}
        value={timeVariable}
        options={options}
        disabledValues={[eventVariable]}
        onChange={value => setCoxParams(prev => ({ ...prev, timeVariable: value }))}
      />
      <VariableSelect
        label={t('form.event')}
        value={eventVariable}
        options={options}
        disabledValues={[timeVariable]}
        onChange={value => setCoxParams(prev => ({ ...prev, eventVariable: value }))}
      />
      <VariableList
        label={t('form.covariatesX')}
        cols={grid.cols}
        only={continuousColumnIndexes(grid)}
      emptyText={t('form.noNumericColumns')}
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
      {mode === 'frailty' && (
        <GroupSelect
          label={t('form.frailtyGroup')}
          grid={grid}
          value={coxParams.frailtyVariable ?? -1}
          allowNone
          onLevels={onLevels}
          onRecode={onRecode}
          disabledValues={[timeVariable, eventVariable]}
          onChange={value => setCoxParams(prev => ({ ...prev, frailtyVariable: value }))}
        />
      )}
    </div>
  );
};
