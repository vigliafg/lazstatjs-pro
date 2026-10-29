import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type {
  TimeSeriesDifferenceMode,
  TimeSeriesParams,
  TimeSeriesSeasonalDifferenceMode,
} from '../../io/project';
import { t } from '../../i18n';
import { variableOptionsFrom } from '../../components/FormFields';
import { continuousColumnIndexes } from '../shared/columns';
import { Field, VariableSelect, variableOptions } from '../../components/FormFields';

export interface TimeSeriesFormProps {
  grid: GridData;
  timeseriesParams: TimeSeriesParams;
  setTimeseriesParams: Dispatch<SetStateAction<TimeSeriesParams>>;
}

export const TimeSeriesForm = ({
  grid,
  timeseriesParams,
  setTimeseriesParams,
}: TimeSeriesFormProps) => {
  const { variable, period, horizon, differenceMode, seasonalDifferenceMode } = timeseriesParams;
  const update = (patch: Partial<TimeSeriesParams>) =>
    setTimeseriesParams(prev => ({ ...prev, ...patch }));
  const inputClass =
    'w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text';

  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.seriesY')}
        value={variable}
        options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
        onChange={value => update({ variable: value })}
      />
      <div className="flex gap-2">
        <Field label={t('form.seasonalPeriod')}>
          <input
            type="number"
            min="0"
            step="1"
            aria-label={t('form.seasonalPeriod')}
            className={inputClass}
            value={period}
            onChange={e => update({ period: parseInt(e.target.value, 10) })}
          />
        </Field>
        <Field label={t('form.forecastHorizon')}>
          <input
            type="number"
            min="1"
            max="60"
            step="1"
            aria-label={t('form.forecastHorizon')}
            className={inputClass}
            value={horizon}
            onChange={e => update({ horizon: parseInt(e.target.value, 10) })}
          />
        </Field>
      </div>
      <div className="flex gap-2">
        <Field label={t('form.differencing')}>
          <select
            aria-label={t('form.differencing')}
            title={t('title.timeseriesDifferencing')}
            className={inputClass}
            value={differenceMode}
            onChange={e =>
              update({ differenceMode: e.target.value as TimeSeriesDifferenceMode })
            }
          >
            <option value="auto">{t('form.autoAdf')}</option>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </Field>
        <Field label={t('form.seasonalD')}>
          <select
            aria-label={t('form.seasonalD')}
            title={t('title.timeseriesSeasonal')}
            className={inputClass}
            value={seasonalDifferenceMode}
            disabled={period < 2}
            onChange={e =>
              update({
                seasonalDifferenceMode: e.target.value as TimeSeriesSeasonalDifferenceMode,
              })
            }
          >
            <option value="auto">{t('form.auto')}</option>
            <option value="0">0</option>
            <option value="1">1</option>
          </select>
        </Field>
      </div>
    </div>
  );
};
