import type { Dispatch, SetStateAction } from 'react';
import type { ContingencyParams } from '../../io/project';
import { t } from '../../i18n';
import { CheckboxField, Field } from '../../components/FormFields';

export interface ContingencyFormProps {
  contingencyParams: ContingencyParams;
  setContingencyParams: Dispatch<SetStateAction<ContingencyParams>>;
}

const PRESETS = {
  trial: {
    rows: ['Treatment', 'Control'],
    cols: ['Improved', 'Unchanged', 'Worse'],
    values: [
      ['42', '18', '6'],
      ['21', '34', '11'],
    ],
  },
  survey: {
    rows: ['North', 'Centre', 'South'],
    cols: ['Yes', 'No', 'Undecided'],
    values: [
      ['64', '41', '12'],
      ['52', '58', '15'],
      ['38', '47', '21'],
    ],
  },
};

const cellInput =
  'w-14 rounded border border-border2 bg-surface p-1 text-center font-mono text-[11px] text-text';
const smallButton =
  'rounded border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-text3 hover:bg-border hover:text-text';

export const ContingencyForm = ({
  contingencyParams,
  setContingencyParams,
}: ContingencyFormProps) => {
  const { rows, cols, values, exact, monteCarlo } = contingencyParams;

  const setCell = (row: number, column: number, value: string) => {
    setContingencyParams(prev => ({
      ...prev,
      values: prev.values.map((cells, ri) =>
        ri === row ? cells.map((cell, ci) => (ci === column ? value : cell)) : cells
      ),
    }));
  };

  const addRow = () =>
    setContingencyParams(prev => ({
      ...prev,
      rows: [...prev.rows, `${t('contingency.row')} ${prev.rows.length + 1}`],
      values: [...prev.values, prev.cols.map(() => '0')],
    }));

  const removeRow = () =>
    setContingencyParams(prev =>
      prev.rows.length <= 2
        ? prev
        : { ...prev, rows: prev.rows.slice(0, -1), values: prev.values.slice(0, -1) }
    );

  const addCol = () =>
    setContingencyParams(prev => ({
      ...prev,
      cols: [...prev.cols, `${t('contingency.col')} ${prev.cols.length + 1}`],
      values: prev.values.map(row => [...row, '0']),
    }));

  const removeCol = () =>
    setContingencyParams(prev =>
      prev.cols.length <= 2
        ? prev
        : {
            ...prev,
            cols: prev.cols.slice(0, -1),
            values: prev.values.map(row => row.slice(0, -1)),
          }
    );

  const applyPreset = (preset: keyof typeof PRESETS) => {
    const next = PRESETS[preset];
    setContingencyParams(prev => ({
      ...prev,
      rows: [...next.rows],
      cols: [...next.cols],
      values: next.values.map(row => [...row]),
    }));
  };

  return (
    <Field label={t('contingency.title')}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5">
            <button type="button" className={smallButton} onClick={() => applyPreset('trial')}>
              {t('contingency.presetTrial')}
            </button>
            <button type="button" className={smallButton} onClick={() => applyPreset('survey')}>
              {t('contingency.presetSurvey')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded border border-border2 bg-surface3 p-2 scrollbar">
          <table className="text-[10px] text-text2">
            <thead>
              <tr>
                <th />
                {cols.map((col, column) => (
                  <th key={column} className="p-1">
                    <input
                      aria-label={`${t('contingency.col')} ${column + 1}`}
                      className="w-14 rounded border border-border2 bg-surface p-1 text-center text-[9px] font-semibold text-text"
                      value={col}
                      onChange={e =>
                        setContingencyParams(prev => ({
                          ...prev,
                          cols: prev.cols.map((label, index) =>
                            index === column ? e.target.value : label
                          ),
                        }))
                      }
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {values.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="p-1">
                    <input
                      aria-label={`${t('contingency.row')} ${rowIndex + 1}`}
                      className="w-16 rounded border border-border2 bg-surface p-1 text-[10px] font-semibold text-text"
                      value={rows[rowIndex] ?? ''}
                      onChange={e =>
                        setContingencyParams(prev => ({
                          ...prev,
                          rows: prev.rows.map((label, index) =>
                            index === rowIndex ? e.target.value : label
                          ),
                        }))
                      }
                    />
                  </td>
                  {row.map((cell, column) => (
                    <td key={column} className="p-1">
                      <input
                        aria-label={`${t('contingency.row')} ${rowIndex + 1} ${t('contingency.col')} ${column + 1}`}
                        type="number"
                        min="0"
                        className={cellInput}
                        value={cell}
                        onChange={e => setCell(rowIndex, column, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex gap-1">
            <button type="button" className={smallButton} onClick={addRow}>
              {t('contingency.addRow')}
            </button>
            <button type="button" className={smallButton} onClick={removeRow}>
              {t('contingency.removeRow')}
            </button>
            <button type="button" className={smallButton} onClick={addCol}>
              {t('contingency.addCol')}
            </button>
            <button type="button" className={smallButton} onClick={removeCol}>
              {t('contingency.removeCol')}
            </button>
          </div>
          <CheckboxField
            label={t('contingency.fisher')}
            checked={exact}
            onChange={checked => setContingencyParams(prev => ({ ...prev, exact: checked }))}
          />
          <CheckboxField
            label={t('contingency.monteCarlo')}
            checked={monteCarlo}
            onChange={checked => setContingencyParams(prev => ({ ...prev, monteCarlo: checked }))}
          />
        </div>
      </div>
    </Field>
  );
};
