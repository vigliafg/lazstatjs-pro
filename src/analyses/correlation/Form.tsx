import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { CorrParams } from '../../io/project';
import {
  Advanced,
  CheckboxField,
  Field,
  VariableList,
} from '../../components/FormFields';

export interface CorrelationFormProps {
  grid: GridData;
  corrParams: CorrParams;
  setCorrParams: Dispatch<SetStateAction<CorrParams>>;
}

export const CorrelationForm = ({ grid, corrParams, setCorrParams }: CorrelationFormProps) => (
  <>
    <VariableList
      label="Variables"
      cols={grid.cols}
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
    <Field label="Primary Method">
      <select
        aria-label="Correlation method"
        className="min-w-[120px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
        value={corrParams.method}
        onChange={event =>
          setCorrParams(previous => ({ ...previous, method: event.target.value }))
        }
      >
        <option value="pearson">Pearson</option>
        <option value="spearman">Spearman</option>
      </select>
    </Field>
    <Advanced title="Non-parametric">
      <CheckboxField
        label="Spearman (ρ)"
        checked={corrParams.showSpearman}
        onChange={checked => setCorrParams(previous => ({ ...previous, showSpearman: checked }))}
      />
      <CheckboxField
        label="Kendall's Tau (τ)"
        checked={corrParams.showKendall}
        onChange={checked => setCorrParams(previous => ({ ...previous, showKendall: checked }))}
      />
    </Advanced>
  </>
);
