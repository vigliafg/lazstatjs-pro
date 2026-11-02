import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { QualityParams } from '../../io/project';
import {
  Advanced,
  Field,
  GroupSelect,
  VariableSelect,
  variableOptions,
  variableOptionsFrom,
} from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface QualityFormProps {
  grid: GridData;
  qualityParams: QualityParams;
  setQualityParams: Dispatch<SetStateAction<QualityParams>>;
}

export const QualityForm = ({ grid, qualityParams, setQualityParams }: QualityFormProps) => (
  <>
    <Field label={t('form.procedure')}>
      <select
        aria-label={t('form.procedure')}
        className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={qualityParams.mode}
        onChange={event =>
          setQualityParams(previous => ({
            ...previous,
            mode: event.target.value as QualityParams['mode'],
          }))
        }
      >
        <option value="control">{t('quality.control')}</option>
        <option value="capability">{t('quality.capability')}</option>
        <option value="pareto">{t('quality.pareto')}</option>
        <option value="variability">{t('quality.variability')}</option>
      </select>
    </Field>

    {qualityParams.mode === 'pareto' ? (
      <VariableSelect
        label={t('form.paretoCategory')}
        value={qualityParams.category}
        options={variableOptions(grid.cols)}
        onChange={value => setQualityParams(previous => ({ ...previous, category: value }))}
      />
    ) : (
      <VariableSelect
        label={t('form.variable1')}
        value={qualityParams.variable}
        options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
        onChange={value => setQualityParams(previous => ({ ...previous, variable: value }))}
      />
    )}

    {qualityParams.mode === 'variability' && (
      <GroupSelect
        label={t('form.group')}
        grid={grid}
        value={qualityParams.group}
        allowNone
        onChange={value => setQualityParams(previous => ({ ...previous, group: value }))}
      />
    )}

    {qualityParams.mode === 'control' && (
      <Advanced>
        <Field label={t('form.chartType')}>
          <select
            aria-label={t('form.chartType')}
            className="min-w-[130px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
            value={qualityParams.chart}
            onChange={event =>
              setQualityParams(previous => ({
                ...previous,
                chart: event.target.value as QualityParams['chart'],
              }))
            }
          >
            <option value="xbar">XBar-R</option>
            <option value="individuals">{t('quality.individuals')}</option>
            <option value="ewma">EWMA</option>
          </select>
        </Field>
        {qualityParams.chart === 'xbar' && (
          <Field label={t('form.subgroupSize')}>
            <input
              type="number"
              min={2}
              max={10}
              className="w-20 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
              value={qualityParams.subgroup}
              onChange={event =>
                setQualityParams(previous => ({
                  ...previous,
                  subgroup: Math.max(2, Math.min(10, Number(event.target.value) || 2)),
                }))
              }
            />
          </Field>
        )}
      </Advanced>
    )}

    {qualityParams.mode === 'capability' && (
      <Advanced>
        <Field label={t('form.specLower')}>
          <input
            type="number"
            step="any"
            className="w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
            value={qualityParams.lsl}
            onChange={event =>
              setQualityParams(previous => ({
                ...previous,
                lsl: Number(event.target.value),
              }))
            }
          />
        </Field>
        <Field label={t('form.specUpper')}>
          <input
            type="number"
            step="any"
            className="w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
            value={qualityParams.usl}
            onChange={event =>
              setQualityParams(previous => ({
                ...previous,
                usl: Number(event.target.value),
              }))
            }
          />
        </Field>
        <Field label={t('form.targetValue')}>
          <input
            type="number"
            step="any"
            className="w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
            value={qualityParams.target}
            onChange={event =>
              setQualityParams(previous => ({
                ...previous,
                target: Number(event.target.value),
              }))
            }
          />
        </Field>
      </Advanced>
    )}
  </>
);
