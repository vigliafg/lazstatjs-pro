import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { QualityParams } from '../../io/project';
import {
  Advanced,
  Field,
  GroupSelect,
  NumberField,
  VariableList,
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
        <option value="tolerance">{t('quality.tolerance')}</option>
        <option value="cusum">{t('quality.cusum')}</option>
        <option value="msa">{t('quality.msa')}</option>
        <option value="acceptance">{t('quality.acceptance')}</option>
        <option value="mcontrol">{t('quality.mcontrol')}</option>
      </select>
    </Field>

    {qualityParams.mode === 'acceptance' ? null : qualityParams.mode === 'mcontrol' ? (
      <VariableList
        label={t('form.variables')}
        cols={grid.cols}
        selected={qualityParams.variables}
        only={continuousColumnIndexes(grid)}
        onToggle={(column, checked) =>
          setQualityParams(previous => ({
            ...previous,
            variables: checked
              ? Array.from(new Set([...previous.variables, column]))
              : previous.variables.filter(value => value !== column),
          }))
        }
        hint={t('hint.quality.mcontrol')}
      />
    ) : qualityParams.mode === 'pareto' ? (
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

    {qualityParams.mode === 'msa' && (
      <Advanced>
        <VariableSelect
          label={t('form.part')}
          value={qualityParams.part}
          options={variableOptions(grid.cols)}
          onChange={value => setQualityParams(previous => ({ ...previous, part: value }))}
        />
        <VariableSelect
          label={t('form.operator')}
          value={qualityParams.operator}
          options={variableOptions(grid.cols)}
          disabledValues={[qualityParams.part]}
          onChange={value => setQualityParams(previous => ({ ...previous, operator: value }))}
        />
      </Advanced>
    )}

    {qualityParams.mode === 'acceptance' && (
      <Advanced>
        <NumberField
          label={t('form.sampleSizeN')}
          value={qualityParams.planN}
          min="1"
          step="1"
          integer
          onChange={value => setQualityParams(previous => ({ ...previous, planN: value }))}
        />
        <NumberField
          label={t('form.acceptanceNumber')}
          value={qualityParams.planC}
          min="0"
          step="1"
          integer
          onChange={value => setQualityParams(previous => ({ ...previous, planC: value }))}
        />
        <NumberField
          label={t('form.lotSize')}
          value={qualityParams.lotSize}
          min="0"
          step="1"
          integer
          hint={t('hint.quality.lotSize')}
          onChange={value => setQualityParams(previous => ({ ...previous, lotSize: value }))}
        />
      </Advanced>
    )}

    {qualityParams.mode === 'mcontrol' && (
      <Advanced>
        <NumberField
          label={t('form.subgroupSize')}
          value={qualityParams.subgroup}
          min="2"
          max="10"
          step="1"
          integer
          onChange={value => setQualityParams(previous => ({ ...previous, subgroup: value }))}
        />
      </Advanced>
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

    {qualityParams.mode === 'tolerance' && (
      <Advanced>
        <Field label={t('form.populationProportion')}>
          <input
            type="number"
            step="0.01"
            min={0.5}
            max={0.9999}
            className="w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
            value={qualityParams.toleranceP}
            onChange={event =>
              setQualityParams(previous => ({
                ...previous,
                toleranceP: Math.max(0.5, Math.min(0.9999, Number(event.target.value) || 0.95)),
              }))
            }
          />
        </Field>
        <p className="text-[11px] text-muted">{t('hint.quality.tolerance')}</p>
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
