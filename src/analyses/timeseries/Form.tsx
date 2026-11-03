import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type {
  TimeSeriesDifferenceMode,
  TimeSeriesMode,
  TimeSeriesParams,
  TimeSeriesSeasonalDifferenceMode,
  TimeSeriesSeasonalModel,
} from '../../io/project';
import { t } from '../../i18n';
import { variableOptionsFrom } from '../../components/FormFields';
import { continuousColumnIndexes } from '../shared/columns';
import { Field, NumberField, VariableSelect } from '../../components/FormFields';

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
  const {
    mode,
    variable,
    period,
    horizon,
    differenceMode,
    seasonalDifferenceMode,
    seasonalModel,
    xregVariable,
  } = timeseriesParams;
  const update = (patch: Partial<TimeSeriesParams>) =>
    setTimeseriesParams(prev => ({ ...prev, ...patch }));
  const inputClass =
    'w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text';
  const numericOptions = variableOptionsFrom(grid.cols, continuousColumnIndexes(grid));

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('form.timeseriesMode')}>
        <select
          aria-label={t('form.timeseriesMode')}
          className={inputClass}
          value={mode}
          onChange={e => update({ mode: e.target.value as TimeSeriesMode })}
        >
          <option value="arima">{t('form.modeArima')}</option>
          <option value="holtwinters">{t('form.modeHoltWinters')}</option>
          <option value="unitroot">{t('form.modeUnitRoot')}</option>
          <option value="spectral">{t('form.modeSpectral')}</option>
          <option value="arimax">{t('form.modeArimax')}</option>
        </select>
      </Field>
      <VariableSelect
        label={t('form.series')}
        value={variable}
        options={numericOptions}
        onChange={value => update({ variable: value })}
      />
      {mode === 'arimax' && (
        <VariableSelect
          label={t('form.exogenous')}
          value={xregVariable}
          options={[{ value: -1, label: t('form.exogenousNone') }, ...numericOptions]}
          onChange={value => update({ xregVariable: value })}
        />
      )}
      {mode !== 'unitroot' && (
        <div className="flex gap-2">
          <NumberField
            label={t('form.seasonalPeriod')}
            value={period}
            min="0"
            step="1"
            integer
            onChange={value => update({ period: value })}
          />
          {mode !== 'spectral' && (
            <NumberField
              label={t('form.forecastHorizon')}
              value={horizon}
              min="1"
              max="60"
              step="1"
              integer
              onChange={value => update({ horizon: value })}
            />
          )}
        </div>
      )}
      {mode === 'holtwinters' && (
        <Field label={t('form.seasonalModel')}>
          <select
            aria-label={t('form.seasonalModel')}
            className={inputClass}
            value={seasonalModel}
            onChange={e => update({ seasonalModel: e.target.value as TimeSeriesSeasonalModel })}
          >
            <option value="additive">{t('form.additive')}</option>
            <option value="multiplicative">{t('form.multiplicative')}</option>
          </select>
        </Field>
      )}
      {(mode === 'arima' || mode === 'arimax') && (
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
      )}
    </div>
  );
};
