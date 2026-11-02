import type { Dispatch, SetStateAction } from 'react';
import type { SampleSizeDesign } from '../../stats/samplesize';
import type { SampleSizeParams } from '../../io/project';
import { t } from '../../i18n';
import { Field, NumberField } from '../../components/FormFields';

export interface SampleSizeFormProps {
  samplesizeParams: SampleSizeParams;
  setSamplesizeParams: Dispatch<SetStateAction<SampleSizeParams>>;
}

const designLabel = (design: SampleSizeDesign): string => {
  switch (design) {
    case 'oneMean':
      return t('samplesize.oneMean');
    case 'paired':
      return t('samplesize.paired');
    case 'twoProportions':
      return t('samplesize.twoProportions');
    case 'correlation':
      return t('samplesize.correlation');
    case 'anova':
      return t('samplesize.anova');
    case 'tost':
      return t('samplesize.tost');
    case 'survival':
      return t('samplesize.survival');
    case 'oneProportion':
      return t('samplesize.oneProportion');
    case 'variance':
      return t('samplesize.variance');
    case 'oneRate':
      return t('samplesize.oneRate');
    default:
      return t('samplesize.twoMeans');
  }
};

const DESIGNS: SampleSizeDesign[] = [
  'twoMeans',
  'oneMean',
  'paired',
  'twoProportions',
  'correlation',
  'anova',
  'tost',
  'survival',
  'oneProportion',
  'variance',
  'oneRate',
];

export const SampleSizeForm = ({ samplesizeParams, setSamplesizeParams }: SampleSizeFormProps) => {
  const { design, alpha, power, delta, sd, p1, p2, r, groups, f, margin, hazardRatio, eventRate, ratio } =
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
            <option key={item} value={item}>
              {designLabel(item)}
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

        {(design === 'oneProportion' || design === 'oneRate') && (
          <>
            <NumberField
              label={design === 'oneRate' ? t('samplesize.rateAlternative') : t('samplesize.propAlternative')}
              value={p1}
              step="0.01"
              min="0"
              onChange={value => update({ p1: value })}
            />
            <NumberField
              label={design === 'oneRate' ? t('samplesize.rateNull') : t('samplesize.propNull')}
              value={p2}
              step="0.01"
              min="0"
              onChange={value => update({ p2: value })}
            />
          </>
        )}

        {design === 'variance' && (
          <NumberField
            label={t('samplesize.varianceRatio')}
            value={ratio}
            step="0.05"
            min="0.01"
            onChange={value => update({ ratio: value })}
          />
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
            <NumberField
              label={t('samplesize.groups')}
              value={groups}
              min="2"
              step="1"
              integer
              onChange={value => update({ groups: value })}
            />
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
