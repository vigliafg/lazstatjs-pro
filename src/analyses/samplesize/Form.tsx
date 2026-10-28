import type { Dispatch, SetStateAction } from 'react';
import type { SampleSizeDesign } from '../../stats/samplesize';
import type { SampleSizeParams } from '../../io/project';

export interface SampleSizeFormProps {
  samplesizeParams: SampleSizeParams;
  setSamplesizeParams: Dispatch<SetStateAction<SampleSizeParams>>;
}

const DESIGNS: { id: SampleSizeDesign; label: string }[] = [
  { id: 'twoMeans', label: 'Two independent means' },
  { id: 'oneMean', label: 'One mean' },
  { id: 'paired', label: 'Paired means' },
  { id: 'twoProportions', label: 'Two proportions' },
  { id: 'correlation', label: 'Correlation' },
  { id: 'anova', label: 'One-way ANOVA' },
];

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[110px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const SampleSizeForm = ({ samplesizeParams, setSamplesizeParams }: SampleSizeFormProps) => {
  const { design, alpha, power, delta, sd, p1, p2, r, groups, f, margin } = samplesizeParams;
  const meanDesign = design === 'twoMeans' || design === 'oneMean' || design === 'paired';
  const update = (patch: Partial<SampleSizeParams>) =>
    setSamplesizeParams(prev => ({ ...prev, ...patch }));

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Design</label>
        <select className={inputClass} value={design} onChange={e => update({ design: e.target.value as SampleSizeDesign })}>
          {DESIGNS.map(item => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {meanDesign && (
        <>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Difference (Δ)</label>
            <input type="number" step="any" className={`${inputClass} w-24`} value={delta} onChange={e => update({ delta: parseFloat(e.target.value) })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>SD</label>
            <input type="number" step="any" min="0" className={`${inputClass} w-24`} value={sd} onChange={e => update({ sd: parseFloat(e.target.value) })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>CI half-width (optional)</label>
            <input type="number" step="any" min="0" className={`${inputClass} w-24`} value={margin} onChange={e => update({ margin: parseFloat(e.target.value) })} />
          </div>
        </>
      )}

      {design === 'twoProportions' && (
        <>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>P1</label>
            <input type="number" step="0.01" min="0" max="1" className={`${inputClass} w-24`} value={p1} onChange={e => update({ p1: parseFloat(e.target.value) })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>P2</label>
            <input type="number" step="0.01" min="0" max="1" className={`${inputClass} w-24`} value={p2} onChange={e => update({ p2: parseFloat(e.target.value) })} />
          </div>
        </>
      )}

      {design === 'correlation' && (
        <div className="flex flex-col gap-1">
          <label className={labelClass}>r</label>
          <input type="number" step="0.01" min="-0.99" max="0.99" className={`${inputClass} w-24`} value={r} onChange={e => update({ r: parseFloat(e.target.value) })} />
        </div>
      )}

      {design === 'anova' && (
        <>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Groups (k)</label>
            <input type="number" min="2" step="1" className={`${inputClass} w-20`} value={groups} onChange={e => update({ groups: parseInt(e.target.value, 10) })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Cohen's f</label>
            <input type="number" step="0.01" min="0" className={`${inputClass} w-24`} value={f} onChange={e => update({ f: parseFloat(e.target.value) })} />
          </div>
        </>
      )}

      <div className="flex flex-col gap-1">
        <label className={labelClass}>α</label>
        <select className={inputClass} value={alpha} onChange={e => update({ alpha: parseFloat(e.target.value) })}>
          <option value={0.1}>0.10</option>
          <option value={0.05}>0.05</option>
          <option value={0.01}>0.01</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Power</label>
        <select className={inputClass} value={power} onChange={e => update({ power: parseFloat(e.target.value) })}>
          <option value={0.8}>80%</option>
          <option value={0.85}>85%</option>
          <option value={0.9}>90%</option>
          <option value={0.95}>95%</option>
        </select>
      </div>
    </div>
  );
};
