import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { ClusterParams } from '../../io/project';
import { Advanced, CheckboxField, Field, VariableList } from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface ClusterFormProps {
  grid: GridData;
  clusterParams: ClusterParams;
  setClusterParams: Dispatch<SetStateAction<ClusterParams>>;
}

export const ClusterForm = ({ grid, clusterParams, setClusterParams }: ClusterFormProps) => (
  <>
    <VariableList
      label={t('form.variables2')}
      cols={grid.cols}
      only={continuousColumnIndexes(grid)}
      emptyText={t('form.noNumericColumns')}
      selected={clusterParams.selected}
      onToggle={(column, checked) =>
        setClusterParams(previous => ({
          ...previous,
          selected: checked
            ? [...previous.selected, column]
            : previous.selected.filter(index => index !== column),
        }))
      }
    />
    <Advanced>
      <Field label={t('form.linkage')}>
        <select
          aria-label={t('form.linkage')}
          className="min-w-[140px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={clusterParams.method}
          onChange={event =>
            setClusterParams(previous => ({
              ...previous,
              method: event.target.value as ClusterParams['method'],
            }))
          }
        >
          <option value="average">{t('cluster.average')}</option>
          <option value="complete">{t('cluster.complete')}</option>
          <option value="single">{t('cluster.single')}</option>
          <option value="ward">{t('cluster.ward')}</option>
        </select>
      </Field>
      <Field label={t('form.clustersK')}>
        <input
          type="number"
          min={2}
          max={20}
          className="w-20 rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={clusterParams.clusters}
          onChange={event =>
            setClusterParams(previous => ({
              ...previous,
              clusters: Math.max(2, Math.min(20, Number(event.target.value) || 2)),
            }))
          }
        />
      </Field>
      <CheckboxField
        label={t('form.standardize')}
        checked={clusterParams.standardize}
        onChange={checked =>
          setClusterParams(previous => ({ ...previous, standardize: checked }))
        }
      />
    </Advanced>
  </>
);
