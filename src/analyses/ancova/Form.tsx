import type { Dispatch, SetStateAction } from 'react';
import { groupColumnIndexes, type CategoryLevel, type GridData } from '../../grid/types';
import { LevelsEditor, LEVELS_BUTTON_CLASS } from '../../grid/LevelsEditor';
import type { AncovaParams } from '../../io/project';
import { numericColumnIndexes } from '../shared/columns';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  VariableList,
  VariableSelect,
  variableOptionsFrom,
} from '../../components/FormFields';

export interface AncovaFormProps {
  grid: GridData;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
  ancovaParams: AncovaParams;
  setAncovaParams: Dispatch<SetStateAction<AncovaParams>>;
}

export const AncovaForm = ({
  grid,
  onLevels,
  onRecode,
  ancovaParams,
  setAncovaParams,
}: AncovaFormProps) => {
  const { response, factor, covariates } = ancovaParams;
  const numericColumns = continuousColumnIndexes(grid);
  const factorColumns = groupColumnIndexes(grid);
  const availableCovariates = numericColumns.filter(
    index => index !== response && index !== factor
  );

  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.responseY')}
        value={response}
        options={variableOptionsFrom(grid.cols, numericColumns)}
        onChange={value => setAncovaParams(prev => ({ ...prev, response: value }))}
      />
      <VariableSelect
        label={t('form.factor')}
        value={factor}
        options={variableOptionsFrom(grid.cols, factorColumns)}
        onChange={value => setAncovaParams(prev => ({ ...prev, factor: value }))}
        trailing={
          <LevelsEditor
            grid={grid}
            column={factor}
            onLevels={onLevels}
            onRecode={onRecode}
            label={t('action.levels')}
            className={LEVELS_BUTTON_CLASS}
          />
        }
      />
      <VariableList
        label={t('form.covariatesOne')}
        cols={grid.cols}
        only={availableCovariates}
        showType
        selected={covariates}
        emptyText={t('form.noNumericCovariates')}
        hint={t('hint.ancova')}
        onToggle={(index, checked) =>
          setAncovaParams(prev => ({
            ...prev,
            covariates: checked
              ? [...prev.covariates, index]
              : prev.covariates.filter(item => item !== index),
          }))
        }
      />
    </div>
  );
};
