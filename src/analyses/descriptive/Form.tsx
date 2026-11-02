import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { DescriptiveMode } from '../../io/project';
import { Field, VariableList } from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface DescriptiveFormProps {
  grid: GridData;
  descVars: number[];
  descMode: DescriptiveMode;
  setDescVars: Dispatch<SetStateAction<number[]>>;
  setDescMode: Dispatch<SetStateAction<DescriptiveMode>>;
}

const MODES: DescriptiveMode[] = ['summary', 'frequency', 'outliers', 'runs'];

const modeLabel = (mode: DescriptiveMode): string => {
  switch (mode) {
    case 'frequency':
      return t('descriptive.frequency');
    case 'outliers':
      return t('descriptive.outliers');
    case 'runs':
      return t('descriptive.runs');
    default:
      return t('descriptive.summary');
  }
};

const modeHint = (mode: DescriptiveMode): string => {
  switch (mode) {
    case 'frequency':
      return t('hint.descriptive.frequency');
    case 'outliers':
      return t('hint.descriptive.outliers');
    case 'runs':
      return t('hint.descriptive.runs');
    default:
      return t('hint.descriptive');
  }
};

export const DescriptiveForm = ({
  grid,
  descVars,
  descMode,
  setDescVars,
  setDescMode,
}: DescriptiveFormProps) => {
  // Frequencies accept categorical and boolean columns too; the numeric views
  // keep the continuous filter.
  const columns =
    descMode === 'frequency'
      ? grid.cols.map((_, index) => index)
      : continuousColumnIndexes(grid);

  return (
    <>
      <Field label={t('form.procedure')}>
        <select
          aria-label={t('form.procedure')}
          className="min-w-[170px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={descMode}
          onChange={event => setDescMode(event.target.value as DescriptiveMode)}
        >
          {MODES.map(mode => (
            <option key={mode} value={mode}>
              {modeLabel(mode)}
            </option>
          ))}
        </select>
      </Field>

      <VariableList
        label={t('form.selectVariables')}
        cols={grid.cols}
        only={columns}
        emptyText={descMode === 'frequency' ? t('form.noColumns') : t('form.noNumericColumns')}
        selected={descVars}
        hint={modeHint(descMode)}
        onToggle={(column, checked) =>
          setDescVars(previous =>
            checked ? [...previous, column] : previous.filter(index => index !== column)
          )
        }
      />
    </>
  );
};
