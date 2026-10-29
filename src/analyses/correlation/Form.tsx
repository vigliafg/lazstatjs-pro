import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { CorrParams } from '../../io/project';
import {
  Advanced,
  CheckboxField,
  Field,
  VariableList,
} from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface CorrelationFormProps {
  grid: GridData;
  corrParams: CorrParams;
  setCorrParams: Dispatch<SetStateAction<CorrParams>>;
}

export const CorrelationForm = ({ grid, corrParams, setCorrParams }: CorrelationFormProps) => (
  <>
    <VariableList
      label={t('form.variables')}
      cols={grid.cols}
      only={continuousColumnIndexes(grid)}
      selected={corrParams.vars}
      onToggle={(column, checked) =>
        setCorrParams(previous => ({
          ...previous,
          vars: checked
            ? [...previous.vars, column]
            : previous.vars.filter(index => index !== column),
        }))
      }
    />
    <Field label={t('form.primaryMethod')}>
      <select
        aria-label={t('form.primaryMethod')}
        className="min-w-[120px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={corrParams.method}
        onChange={event =>
          setCorrParams(previous => ({ ...previous, method: event.target.value }))
        }
      >
        <option value="pearson">{t('correlation.pearson')}</option>
        <option value="spearman">{t('correlation.spearman')}</option>
      </select>
    </Field>
    <Advanced title={t('form.nonParametric')}>
      <CheckboxField
        label={t('correlation.spearmanShort')}
        checked={corrParams.showSpearman}
        onChange={checked => setCorrParams(previous => ({ ...previous, showSpearman: checked }))}
      />
      <CheckboxField
        label={t('correlation.kendall')}
        checked={corrParams.showKendall}
        onChange={checked => setCorrParams(previous => ({ ...previous, showKendall: checked }))}
      />
    </Advanced>
  </>
);
