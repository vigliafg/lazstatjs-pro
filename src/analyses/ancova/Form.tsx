import type { Dispatch, SetStateAction } from 'react';
import type { CategoryLevel, GridData } from '../../grid/types';
import type { AncovaParams } from '../../io/project';
import { numericColumnIndexes } from '../shared/columns';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';
import {
  GroupSelect,
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
      <GroupSelect
        label={t('form.factor')}
        grid={grid}
        value={factor}
        onChange={value => setAncovaParams(prev => ({ ...prev, factor: value }))}
        onLevels={onLevels}
        onRecode={onRecode}
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
