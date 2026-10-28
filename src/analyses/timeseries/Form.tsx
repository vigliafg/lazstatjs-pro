import type { Dispatch, SetStateAction } from 'react';
import type {
  GridData,
} from '../../grid/types';
import type {
  TimeSeriesDifferenceMode,
  TimeSeriesParams,
  TimeSeriesSeasonalDifferenceMode,
} from '../../io/project';

export interface TimeSeriesFormProps {
  grid: GridData;
  timeseriesParams: TimeSeriesParams;
  setTimeseriesParams: Dispatch<SetStateAction<TimeSeriesParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[110px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const TimeSeriesForm = ({
  grid,
  timeseriesParams,
  setTimeseriesParams,
}: TimeSeriesFormProps) => {
  const { variable, period, horizon, differenceMode, seasonalDifferenceMode } = timeseriesParams;
  const update = (patch: Partial<TimeSeriesParams>) =>
    setTimeseriesParams(prev => ({ ...prev, ...patch }));

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Series (Y)</label>
        <select className={inputClass} value={variable} onChange={e => update({ variable: parseInt(e.target.value, 10) })}>
          {grid.cols.map((column, index) => (
            <option key={index} value={index}>
              {column.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Seasonal period</label>
        <input
          type="number"
          min="0"
          step="1"
          className={`${inputClass} w-24`}
          value={period}
          onChange={e => update({ period: parseInt(e.target.value, 10) })}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Forecast horizon</label>
        <input
          type="number"
          min="1"
          max="60"
          step="1"
          className={`${inputClass} w-24`}
          value={horizon}
          onChange={e => update({ horizon: parseInt(e.target.value, 10) })}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Differencing d</label>
        <select
          className={`${inputClass} w-28`}
          value={differenceMode}
          onChange={e => update({ differenceMode: e.target.value as TimeSeriesDifferenceMode })}
          title="Regular differencing for the ARIMA model"
        >
          <option value="auto">Auto (ADF)</option>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Seasonal D</label>
        <select
          className={`${inputClass} w-28`}
          value={seasonalDifferenceMode}
          onChange={e => update({ seasonalDifferenceMode: e.target.value as TimeSeriesSeasonalDifferenceMode })}
          disabled={period < 2}
          title="Seasonal differencing; available when a seasonal period is set"
        >
          <option value="auto">Auto</option>
          <option value="0">0</option>
          <option value="1">1</option>
        </select>
      </div>
    </div>
  );
};
