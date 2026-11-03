import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { SpatialParams } from '../../io/project';
import { t } from '../../i18n';
import {
  Advanced,
  Field,
  NumberField,
  VariableList,
  VariableSelect,
  variableOptionsFrom,
} from '../../components/FormFields';
import { continuousColumnIndexes } from '../shared/columns';

export interface SpatialFormProps {
  grid: GridData;
  spatialParams: SpatialParams;
  setSpatialParams: Dispatch<SetStateAction<SpatialParams>>;
}

export const SpatialForm = ({ grid, spatialParams, setSpatialParams }: SpatialFormProps) => (
  <div className="flex flex-col gap-3">
    <Field label={t('form.procedure')}>
      <select
        aria-label={t('form.procedure')}
        className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={spatialParams.mode}
        onChange={event =>
          setSpatialParams(previous => ({
            ...previous,
            mode: event.target.value as SpatialParams['mode'],
          }))
        }
      >
        <option value="moran">{t('spatial.moran')}</option>
        <option value="geary">{t('spatial.geary')}</option>
        <option value="lisa">{t('spatial.lisa')}</option>
        <option value="sar">{t('spatial.sar')}</option>
      </select>
    </Field>
    <VariableSelect
      label={t('form.variable1')}
      value={spatialParams.variable}
      options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
      onChange={value => setSpatialParams(previous => ({ ...previous, variable: value }))}
    />
    <VariableSelect
      label={t('form.xCoordinate')}
      value={spatialParams.x}
      options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
      onChange={value => setSpatialParams(previous => ({ ...previous, x: value }))}
    />
    <VariableSelect
      label={t('form.yCoordinate')}
      value={spatialParams.y}
      options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
      onChange={value => setSpatialParams(previous => ({ ...previous, y: value }))}
    />
    {spatialParams.mode === 'sar' && (
      <VariableList
        label={t('form.predictorsX')}
        cols={grid.cols}
        only={continuousColumnIndexes(grid)}
        selected={spatialParams.predictors}
        onToggle={(column, checked) =>
          setSpatialParams(previous => ({
            ...previous,
            predictors: checked
              ? Array.from(new Set([...previous.predictors, column]))
              : previous.predictors.filter(value => value !== column),
          }))
        }
      />
    )}
    <Advanced>
      <NumberField
        label={t('form.neighbors')}
        value={spatialParams.k}
        min="1"
        max="20"
        step="1"
        integer
        onChange={value => setSpatialParams(previous => ({ ...previous, k: value }))}
      />
      <NumberField
        label={t('form.permutations')}
        value={spatialParams.permutations}
        min="99"
        max="9999"
        step="100"
        integer
        onChange={value => setSpatialParams(previous => ({ ...previous, permutations: value }))}
      />
      <NumberField
        label={t('form.seed')}
        value={spatialParams.seed}
        step="1"
        integer
        onChange={value => setSpatialParams(previous => ({ ...previous, seed: value }))}
      />
    </Advanced>
  </div>
);
