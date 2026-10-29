import type { Dispatch, SetStateAction } from 'react';
import { groupColumnIndexes, type CategoryLevel, type GridData } from '../../grid/types';
import { LevelsEditor, LEVELS_BUTTON_CLASS } from '../../grid/LevelsEditor';
import type { FactorialParams } from '../../io/project';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  CheckboxField,
  Field,
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
  const factors = groupColumnIndexes(grid);
  const factorOptions = variableOptionsFrom(grid.cols, factors);

  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.responseY')}
        value={response}
        options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
        onChange={value => setFactorialParams(prev => ({ ...prev, response: value }))}
      />
      <VariableSelect
        label={t('form.factorA')}
        value={factorA}
        options={factorOptions}
        onChange={value => setFactorialParams(prev => ({ ...prev, factorA: value }))}
        trailing={
          <LevelsEditor
            grid={grid}
            column={factorA}
            onLevels={onLevels}
            onRecode={onRecode}
            label={t('action.levels')}
            className={LEVELS_BUTTON_CLASS}
          />
        }
      />
      <VariableSelect
        label={t('form.factorB')}
        value={factorB}
        options={factorOptions}
        onChange={value => setFactorialParams(prev => ({ ...prev, factorB: value }))}
        trailing={
          <LevelsEditor
            grid={grid}
            column={factorB}
            onLevels={onLevels}
            onRecode={onRecode}
            label={t('action.levels')}
            className={LEVELS_BUTTON_CLASS}
          />
        }
      />
      <Field label={t('form.model')}>
        <CheckboxField
          label={t('form.interaction')}
          checked={interaction}
          onChange={checked => setFactorialParams(prev => ({ ...prev, interaction: checked }))}
        />
      </Field>
    </div>
  );
};
