import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { OrdinalParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import { VariableList, VariableSelect, variableOptions } from '../../components/FormFields';

export interface OrdinalFormProps {
  grid: GridData;
  ordinalParams: OrdinalParams;
  setOrdinalParams: Dispatch<SetStateAction<OrdinalParams>>;
}

export const OrdinalForm = ({ grid, ordinalParams, setOrdinalParams }: OrdinalFormProps) => {
  const { dep, indeps } = ordinalParams;
  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.ordinalOutcome')}
        value={dep}
        options={variableOptions(grid.cols)}
        onChange={value => setOrdinalParams(prev => ({ ...prev, dep: value }))}
      />
      <VariableList
        label={t('form.predictorsX')}
        cols={grid.cols}
        only={continuousColumnIndexes(grid)}
        selected={indeps}
        disabled={[dep]}
        showType
        hint={t('hint.ordinal')}
        onToggle={(index, checked) =>
          setOrdinalParams(prev => ({
            ...prev,
            indeps: checked
              ? [...prev.indeps, index]
              : prev.indeps.filter(item => item !== index),
          }))
        }
      />
    </div>
  );
};
