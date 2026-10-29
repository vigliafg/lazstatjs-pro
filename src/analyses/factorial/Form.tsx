import type { Dispatch, SetStateAction } from 'react';
import type { CategoryLevel, GridData } from '../../grid/types';
import type { FactorialParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  CheckboxField,
  GroupSelect,
  VariableSelect,
  variableOptions,
  variableOptionsFrom,
} from '../../components/FormFields';

export interface FactorialFormProps {
  grid: GridData;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
  factorialParams: FactorialParams;
  setFactorialParams: Dispatch<SetStateAction<FactorialParams>>;
}

export const FactorialForm = ({
  grid,
  onLevels,
  onRecode,
  factorialParams,
  setFactorialParams,
}: FactorialFormProps) => {
  const { response, factorA, factorB, interaction } = factorialParams;

  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.responseY')}
        value={response}
        options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
        onChange={value => setFactorialParams(prev => ({ ...prev, response: value }))}
      />
      <GroupSelect
        label={t('form.factorA')}
        grid={grid}
        value={factorA}
        onChange={value => setFactorialParams(prev => ({ ...prev, factorA: value }))}
        disabledValues={[factorB]}
        onLevels={onLevels}
        onRecode={onRecode}
      />
      <GroupSelect
        label={t('form.factorB')}
        grid={grid}
        value={factorB}
        onChange={value => setFactorialParams(prev => ({ ...prev, factorB: value }))}
        disabledValues={[factorA]}
        onLevels={onLevels}
        onRecode={onRecode}
      />
      <CheckboxField
        label={t('form.interaction')}
        checked={interaction}
        onChange={checked => setFactorialParams(prev => ({ ...prev, interaction: checked }))}
      />
    </div>
  );
};
