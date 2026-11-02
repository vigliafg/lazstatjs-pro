import { useEffect, useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { t } from '../../i18n';
import type { AnalysisChart } from '../../stats/charts';
import {
  predictionPosition,
  predictSurface,
  surfaceModelOf,
  surfaceSlice,
  type ProfilePoint,
} from '../../charts/profiler';

const WIDTH = 160;
const HEIGHT = 46;
const PAD = 4;

const Sparkline = ({
  points,
  marker,
  label,
  value,
  min,
  max,
}: {
  points: ProfilePoint[];
  marker: number;
  label: string;
  value: string;
  min: number;
  max: number;
}) => {
  const ys = points.map(point => point.y).filter(Number.isFinite);
  const yMin = ys.length > 0 ? Math.min(...ys) : 0;
  const yMax = ys.length > 0 ? Math.max(...ys) : 1;
  const span = yMax - yMin || 1;
  const xOf = (x: number): number => PAD + ((x - min) / (max - min || 1)) * (WIDTH - PAD * 2);
  const yOf = (y: number): number => HEIGHT - PAD - ((y - yMin) / span) * (HEIGHT - PAD * 2);
  const path = points.map(point => `${xOf(point.x).toFixed(2)},${yOf(point.y).toFixed(2)}`).join(' ');
  const markerX = xOf(Math.min(max, Math.max(min, marker)));
  return (
    <div className="min-w-0 flex-1" data-profiler-slice={label}>
      <div className="mb-0.5 flex items-baseline justify-between gap-2">
        <span className="truncate font-mono text-[9px] uppercase tracking-wider text-text3" title={label}>
          {label}
        </span>
        <span className="shrink-0 font-mono text-[9px] text-accent2">{value}</span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-[46px] w-full text-accent2"
        role="img"
        aria-label={`${t('profiler.prediction')} · ${label}`}
      >
        <line
          x1={PAD}
          y1={HEIGHT - PAD}
          x2={WIDTH - PAD}
          y2={HEIGHT - PAD}
          className="stroke-border2"
          strokeWidth={1}
        />
        <polyline
          points={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <line
          x1={markerX}
          y1={PAD}
          x2={markerX}
          y2={HEIGHT - PAD}
          stroke="currentColor"
          strokeOpacity={0.45}
          strokeDasharray="3 2"
          strokeWidth={1}
        />
      </svg>
      <div className="flex justify-between font-mono text-[8px] text-text3">
        <span>{min.toFixed(2)}</span>
        <span>{max.toFixed(2)}</span>
      </div>
    </div>
  );
};

/**
 * Prediction profiler for a fitted response surface.
 *
 * The sliders evaluate the polynomial stored on the chart; they never change
 * the data or the statistics. Each slice shows how the prediction moves while
 * the other factor stays where the user put it.
 */
export const PredictionProfiler = ({ chart }: { chart: AnalysisChart }) => {
  const model = useMemo(() => surfaceModelOf(chart), [chart]);
  const [a, setA] = useState(() => (model ? (model.aMin + model.aMax) / 2 : 0));
  const [b, setB] = useState(() => (model ? (model.bMin + model.bMax) / 2 : 0));

  useEffect(() => {
    if (!model) return;
    setA((model.aMin + model.aMax) / 2);
    setB((model.bMin + model.bMax) / 2);
  }, [model]);

  if (!model) return null;

  const prediction = predictSurface(model, a, b);
  const position = predictionPosition(model, prediction);
  const aLabel = chart.fields.xLabel ?? 'A';
  const bLabel = chart.fields.yLabel ?? 'B';
  const alongA = surfaceSlice(model, 'a', b);
  const alongB = surfaceSlice(model, 'b', a);
  const stepA = (model.aMax - model.aMin) / 100;
  const stepB = (model.bMax - model.bMin) / 100;

  return (
    <section
      data-no-export
      data-prediction-profiler
      className="mt-2 rounded border border-border2 bg-surface2/40 p-2"
      aria-label={t('profiler.title')}
    >
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
          {t('profiler.title')}
        </span>
        <span className="ml-auto font-mono text-[9px] text-text3">
          {t('profiler.prediction')}
        </span>
        <span
          data-profiler-prediction
          className="rounded border border-accent2/30 bg-accent2/10 px-1.5 py-0.5 font-mono text-[10px] text-accent2"
        >
          {prediction.toFixed(2)}
        </span>
        <button
          type="button"
          className="tb-btn px-1.5 py-0.5 text-[9px]"
          onClick={() => {
            setA((model.aMin + model.aMax) / 2);
            setB((model.bMin + model.bMax) / 2);
          }}
          title={t('profiler.reset')}
          aria-label={t('profiler.reset')}
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>
      <div className="mb-2 h-1 w-full overflow-hidden rounded bg-surface3">
        <div
          className="h-full rounded bg-accent2 transition-[width] duration-300"
          style={{ width: `${position}%` }}
        />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="block min-w-0">
          <span className="mb-0.5 flex items-center justify-between font-mono text-[9px] text-text3">
            <span className="truncate">{aLabel}</span>
            <span className="text-text2">{a.toFixed(2)}</span>
          </span>
          <input
            type="range"
            data-profiler-a
            min={model.aMin}
            max={model.aMax}
            step={stepA > 0 ? stepA : 0.01}
            value={a}
            onChange={event => setA(Number(event.target.value))}
            className="w-full accent-accent2"
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-0.5 flex items-center justify-between font-mono text-[9px] text-text3">
            <span className="truncate">{bLabel}</span>
            <span className="text-text2">{b.toFixed(2)}</span>
          </span>
          <input
            type="range"
            data-profiler-b
            min={model.bMin}
            max={model.bMax}
            step={stepB > 0 ? stepB : 0.01}
            value={b}
            onChange={event => setB(Number(event.target.value))}
            className="w-full accent-accent2"
          />
        </label>
      </div>
      <div className="mt-2 flex gap-3">
        <Sparkline
          points={alongA}
          marker={a}
          label={`${aLabel} →`}
          value={predictSurface(model, a, b).toFixed(2)}
          min={model.aMin}
          max={model.aMax}
        />
        <Sparkline
          points={alongB}
          marker={b}
          label={`${bLabel} →`}
          value={predictSurface(model, a, b).toFixed(2)}
          min={model.bMin}
          max={model.bMax}
        />
      </div>
      <p className="mt-1 text-[9px] leading-snug text-text3">{t('profiler.note')}</p>
    </section>
  );
};
