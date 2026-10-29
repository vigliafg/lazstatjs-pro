import type { Dispatch, SetStateAction } from 'react';
import { groupColumnIndexes, type GridData } from '../../grid/types';
import type { GeeParams } from '../../io/project';
import { t } from '../../i18n';
import {
  Field,
  VariableList,
  VariableSelect,
  variableOptions,
  variableOptionsFrom,
} from '../../components/FormFields';

export interface GeeFormProps {
  grid: GridData;
  geeParams: GeeParams;
  setGeeParams: Dispatch<SetStateAction<GeeParams>>;
}

export const GeeForm = ({ grid, geeParams, setGeeParams }: GeeFormProps) => (
  <div className="flex flex-col gap-3">
    <VariableSelect
      label={t('form.outcome')}
      value={geeParams.dep}
      options={variableOptions(grid.cols)}
      onChange={value => setGeeParams(prev => ({ ...prev, dep: value }))}
    />
    <VariableList
      label={t('form.predictorsX')}
      cols={grid.cols}
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
    <VariableSelect
      label={t('form.cluster')}
      value={geeParams.cluster}
      options={variableOptionsFrom(grid.cols, groupColumnIndexes(grid))}
      onChange={value => setGeeParams(prev => ({ ...prev, cluster: value }))}
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
