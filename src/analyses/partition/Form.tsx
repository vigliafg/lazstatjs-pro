import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { PartitionParams } from '../../io/project';
import { Advanced, Field, VariableList, VariableSelect, variableOptionsFrom } from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface PartitionFormProps {
  grid: GridData;
  partitionParams: PartitionParams;
  setPartitionParams: Dispatch<SetStateAction<PartitionParams>>;
}

export const PartitionForm = ({
  grid,
  partitionParams,
  setPartitionParams,
}: PartitionFormProps) => (
  <>
    <VariableSelect
      label={t('form.responseY')}
      value={partitionParams.response}
      options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
      onChange={value =>
        setPartitionParams(previous => ({
          ...previous,
          response: value,
          predictors: previous.predictors.filter(index => index !== value),
        }))
      }
    />
    <VariableList
      label={t('form.independentsX')}
      cols={grid.cols}
      only={continuousColumnIndexes(grid)}
      emptyText={t('form.noNumericColumns')}
      selected={partitionParams.predictors}
      disabled={[partitionParams.response]}
      onToggle={(column, checked) =>
        setPartitionParams(previous => ({
          ...previous,
          predictors: checked
            ? [...previous.predictors, column]
            : previous.predictors.filter(index => index !== column),
        }))
      }
    />
    <Advanced>
      <Field label={t('form.maxDepth')}>
        <input
          type="number"
          min={1}
          max={6}
          className="w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={partitionParams.maxDepth}
          onChange={event =>
            setPartitionParams(previous => ({
              ...previous,
              maxDepth: Math.max(1, Math.min(6, Number(event.target.value) || 1)),
            }))
          }
        />
      </Field>
      <Field label={t('form.minSplit')}>
        <input
          type="number"
          min={2}
          max={50}
          className="w-24 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={partitionParams.minSplit}
          onChange={event =>
            setPartitionParams(previous => ({
              ...previous,
              minSplit: Math.max(2, Math.min(50, Number(event.target.value) || 2)),
            }))
          }
        />
      </Field>
    </Advanced>
  </>
);
