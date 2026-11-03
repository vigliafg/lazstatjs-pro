import type { Dispatch, SetStateAction } from 'react';
import type { CategoryLevel, GridData } from '../../grid/types';
import type { SurvivalParams } from '../../io/project';
import { t } from '../../i18n';
import {
  Field,
  GroupSelect,
  VariableSelect,
  variableOptions,
} from '../../components/FormFields';

export interface SurvivalFormProps {
  grid: GridData;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
  survivalParams: SurvivalParams;
  setSurvivalParams: Dispatch<SetStateAction<SurvivalParams>>;
}

export const SurvivalForm = ({
  grid,
  onLevels,
  onRecode,
  survivalParams,
  setSurvivalParams,
}: SurvivalFormProps) => {
  const options = variableOptions(grid.cols);
  const mode = survivalParams.mode ?? 'km';
  const upperVariable = survivalParams.upperVariable ?? -1;
  return (
    <div className="flex flex-col gap-3">
      <Field label={t('form.survivalMode')}>
        <select
          aria-label={t('form.survivalMode')}
          className="min-w-[180px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={mode}
          onChange={event =>
            setSurvivalParams(prev => ({
              ...prev,
              mode: event.target.value as NonNullable<typeof prev.mode>,
            }))
          }
        >
          <option value="km">{t('form.survivalKm')}</option>
          <option value="life">{t('form.survivalLife')}</option>
          <option value="interval">{t('form.survivalInterval')}</option>
        </select>
      </Field>
      <VariableSelect
        label={mode === 'interval' ? t('form.lowerBound') : t('form.time')}
        value={survivalParams.timeVariable}
        options={options}
        disabledValues={[survivalParams.eventVariable, upperVariable]}
        onChange={value => setSurvivalParams(prev => ({ ...prev, timeVariable: value }))}
      />
      <VariableSelect
        label={t('form.event')}
        value={survivalParams.eventVariable}
        options={options}
        disabledValues={[survivalParams.timeVariable, upperVariable]}
        onChange={value => setSurvivalParams(prev => ({ ...prev, eventVariable: value }))}
      />
      {mode === 'interval' && (
        <VariableSelect
          label={t('form.upperBound')}
          value={upperVariable}
          options={[{ value: -1, label: t('form.noUpperBound') }, ...options]}
          disabledValues={[survivalParams.timeVariable, survivalParams.eventVariable]}
          onChange={value => setSurvivalParams(prev => ({ ...prev, upperVariable: value }))}
        />
      )}
      {mode === 'life' && (
        <Field label={t('form.intervals')}>
          <input
            type="number"
            min={0}
            max={30}
            aria-label={t('form.intervals')}
            className="w-24 rounded border border-border2 bg-surface p-1 font-mono text-[11px] text-text"
            value={survivalParams.intervals ?? 0}
            onChange={event =>
              setSurvivalParams(prev => ({
                ...prev,
                intervals: Math.max(0, Math.min(30, Number(event.target.value) || 0)),
              }))
            }
          />
        </Field>
      )}
      {mode !== 'interval' && (
        <GroupSelect
          label={t('form.groupOptional')}
          grid={grid}
          value={survivalParams.groupVariable}
          allowNone
          onLevels={onLevels}
          onRecode={onRecode}
          onChange={value => setSurvivalParams(prev => ({ ...prev, groupVariable: value }))}
        />
      )}
    </div>
  );
};
