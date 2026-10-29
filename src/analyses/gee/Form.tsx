import type { Dispatch, SetStateAction } from 'react';
import type { CategoryLevel, GridData } from '../../grid/types';
import type { GeeParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  Field,
  GroupSelect,
  VariableList,
  VariableSelect,
  variableOptions,
  variableOptionsFrom,
} from '../../components/FormFields';

export interface GeeFormProps {
  grid: GridData;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
  geeParams: GeeParams;
  setGeeParams: Dispatch<SetStateAction<GeeParams>>;
}

export const GeeForm = ({ grid, onLevels, onRecode, geeParams, setGeeParams }: GeeFormProps) => (
  <div className="flex flex-col gap-3">
    <VariableSelect
      label={t('form.outcome')}
      value={geeParams.dep}
      options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
      onChange={value => setGeeParams(prev => ({ ...prev, dep: value }))}
    />
    <VariableList
      label={t('form.predictorsX')}
      cols={grid.cols}
      only={continuousColumnIndexes(grid)}
      emptyText={t('form.noNumericColumns')}
      selected={geeParams.indeps}
      disabled={[geeParams.dep, geeParams.cluster]}
      showType
      hint={t('hint.gee')}
      onToggle={(index, checked) =>
        setGeeParams(prev => ({
          ...prev,
          indeps: checked
            ? [...prev.indeps, index]
            : prev.indeps.filter(item => item !== index),
        }))
      }
    />
    <GroupSelect
      label={t('form.cluster')}
      grid={grid}
      value={geeParams.cluster}
      onChange={value => setGeeParams(prev => ({ ...prev, cluster: value }))}
      onLevels={onLevels}
      onRecode={onRecode}
    />
    <Field label={t('form.family')}>
      <select
        aria-label={t('form.family')}
        className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={geeParams.family}
        onChange={e =>
          setGeeParams(prev => ({ ...prev, family: e.target.value as GeeParams['family'] }))
        }
      >
        <option value="gaussian">{t('form.gaussianIdentity')}</option>
        <option value="binomial">{t('form.binomialLogit')}</option>
      </select>
    </Field>
    <Field label={t('form.workingCorrelation')}>
      <select
        aria-label={t('form.workingCorrelation')}
        className="min-w-[150px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={geeParams.correlation}
        onChange={e =>
          setGeeParams(prev => ({
            ...prev,
            correlation: e.target.value as GeeParams['correlation'],
          }))
        }
      >
        <option value="independence">{t('form.independence')}</option>
        <option value="exchangeable">{t('form.exchangeable')}</option>
      </select>
    </Field>
  </div>
);
