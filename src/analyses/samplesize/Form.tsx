import type { Dispatch, SetStateAction } from 'react';
import type { SampleSizeDesign } from '../../stats/samplesize';
import type { SampleSizeParams } from '../../io/project';
import { t } from '../../i18n';
import { Field } from '../../components/FormFields';

export interface SampleSizeFormProps {
  samplesizeParams: SampleSizeParams;
  setSamplesizeParams: Dispatch<SetStateAction<SampleSizeParams>>;
}

const DESIGNS: { id: SampleSizeDesign; key: Parameters<typeof t>[0] }[] = [
  { id: 'twoMeans', key: 'samplesize.twoMeans' },
  { id: 'oneMean', key: 'samplesize.oneMean' },
  { id: 'paired', key: 'samplesize.paired' },
  { id: 'twoProportions', key: 'samplesize.twoProportions' },
  { id: 'correlation', key: 'samplesize.correlation' },
  { id: 'anova', key: 'samplesize.anova' },
  { id: 'tost', key: 'samplesize.tost' },
  { id: 'survival', key: 'samplesize.survival' },
];

const inputClass =
  'w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text';

const NumberField = ({
  label,
  value,
  onChange,
  step = 'any',
  min,
  max,
  width = 'w-24',
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
  min?: string;
  max?: string;
  width?: string;
}) => (
  <Field label={label}>
    <input
      type="number"
      step={step}
      min={min}
      max={max}
      aria-label={label}
      className={`${inputClass} ${width}`}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
    />
  </Field>
);

export const SampleSizeForm = ({ samplesizeParams, setSamplesizeParams }: SampleSizeFormProps) => {
  const { design, alpha, power, delta, sd, p1, p2, r, groups, f, margin, hazardRatio, eventRate } =
    samplesizeParams;
  const meanDesign = design === 'twoMeans' || design === 'oneMean' || design === 'paired';
  const tostDesign = design === 'tost';
  const survivalDesign = design === 'survival';
  const update = (patch: Partial<SampleSizeParams>) =>
    setSamplesizeParams(prev => ({ ...prev, ...patch }));

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('samplesize.design')}>
        <select
          aria-label={t('samplesize.design')}
          className="min-w-[180px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={design}
          onChange={e => update({ design: e.target.value as SampleSizeDesign })}
        >
          {DESIGNS.map(item => (
            <option key={item.id} value={item.id}>
              {t(item.key)}
            </option>
          ))}
        </select>
      </Field>

      <div className="flex flex-wrap gap-2">
        {meanDesign && (
          <>
            <NumberField
              label={t('samplesize.delta')}
              value={delta}
              onChange={value => update({ delta: value })}
            />
            <NumberField
              label={t('samplesize.sd')}
              value={sd}
              min="0"
              onChange={value => update({ sd: value })}
            />
            <NumberField
              label={t('samplesize.halfWidth')}
              value={margin}
              min="0"
              onChange={value => update({ margin: value })}
            />
          </>
        )}

        {tostDesign && (
          <>
            <NumberField
              label={t('samplesize.expectedDiff')}
              value={delta}
              onChange={value => update({ delta: value })}
            />
            <NumberField
              label={t('samplesize.sd')}
              value={sd}
              min="0"
              onChange={value => update({ sd: value })}
            />
            <NumberField
              label={t('samplesize.margin')}
              value={margin}
              min="0"
              width="w-28"
              onChange={value => update({ margin: value })}
            />
          </>
        )}

        {survivalDesign && (
          <>
            <NumberField
              label={t('samplesize.hazardRatio')}
              value={hazardRatio}
              step="0.01"
              min="0.01"
              onChange={value => update({ hazardRatio: value })}
            />
            <NumberField
              label={t('samplesize.eventRate')}
              value={eventRate}
              step="0.01"
              min="0.01"
              max="1"
              onChange={value => update({ eventRate: value })}
            />
          </>
        )}

        {design === 'twoProportions' && (
          <>
            <NumberField
              label={t('samplesize.p1')}
              value={p1}
              step="0.01"
              min="0"
              max="1"
              onChange={value => update({ p1: value })}
            />
            <NumberField
              label={t('samplesize.p2')}
              value={p2}
              step="0.01"
              min="0"
              max="1"
              onChange={value => update({ p2: value })}
            />
          </>
        )}

        {design === 'correlation' && (
          <NumberField
            label={t('samplesize.r')}
            value={r}
            step="0.01"
            min="-0.99"
            max="0.99"
            onChange={value => update({ r: value })}
          />
        )}

        {design === 'anova' && (
          <>
            <Field label={t('samplesize.groups')}>
              <input
                type="number"
                min="2"
                step="1"
                aria-label={t('samplesize.groups')}
                className={`${inputClass} w-20`}
                value={groups}
                onChange={e => update({ groups: parseInt(e.target.value, 10) })}
              />
            </Field>
            <NumberField
              label={t('samplesize.cohensF')}
              value={f}
              step="0.01"
              min="0"
              onChange={value => update({ f: value })}
            />
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Field label={t('samplesize.alpha')}>
          <select
            aria-label={t('samplesize.alpha')}
            className="rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
            value={alpha}
            onChange={e => update({ alpha: parseFloat(e.target.value) })}
          >
            <option value={0.1}>0.10</option>
            <option value={0.05}>0.05</option>
            <option value={0.01}>0.01</option>
          </select>
        </Field>
        <Field label={t('samplesize.power')}>
          <select
            aria-label={t('samplesize.power')}
            className="rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
            value={power}
            onChange={e => update({ power: parseFloat(e.target.value) })}
          >
            <option value={0.8}>80%</option>
            <option value={0.85}>85%</option>
            <option value={0.9}>90%</option>
            <option value={0.95}>95%</option>
          </select>
        </Field>
      </div>
    </div>
  );
};
