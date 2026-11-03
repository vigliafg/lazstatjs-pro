import type { Dispatch, SetStateAction } from 'react';
import type { LoglinearParams } from '../../io/project';
import { t } from '../../i18n';

export interface LoglinearFormProps {
  loglinearParams: LoglinearParams;
  setLoglinearParams: Dispatch<SetStateAction<LoglinearParams>>;
}

const PRESETS = {
  twoByTwo: {
    rows: ['Treatment', 'Control'],
    cols: ['Improved', 'Unchanged'],
    values: [
      ['42', '18'],
      ['21', '34'],
    ],
  },
  threeByThree: {
    rows: ['Low', 'Medium', 'High'],
    cols: ['Yes', 'No', 'Undecided'],
    values: [
      ['20', '15', '10'],
      ['25', '30', '12'],
      ['18', '22', '28'],
    ],
  },
};

const cellInput =
  'w-14 rounded border border-border2 bg-surface p-1 text-center font-mono text-[11px] text-text';
const smallButton =
  'rounded border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-text3 hover:bg-border hover:text-text';

export const LoglinearForm = ({ loglinearParams, setLoglinearParams }: LoglinearFormProps) => {
  const { rows, cols, values, model } = loglinearParams;

  const setCell = (row: number, column: number, value: string) => {
    setLoglinearParams(prev => ({
      ...prev,
      values: prev.values.map((cells, ri) =>
        ri === row ? cells.map((cell, ci) => (ci === column ? value : cell)) : cells
      ),
    }));
  };

  const addRow = () =>
    setLoglinearParams(prev => ({
      ...prev,
      rows: [...prev.rows, `${t('contingency.row')} ${prev.rows.length + 1}`],
      values: [...prev.values, prev.cols.map(() => '0')],
    }));

  const removeRow = () =>
    setLoglinearParams(prev =>
      prev.rows.length <= 2
        ? prev
        : { ...prev, rows: prev.rows.slice(0, -1), values: prev.values.slice(0, -1) }
    );

  const addCol = () =>
    setLoglinearParams(prev => ({
      ...prev,
      cols: [...prev.cols, `${t('contingency.col')} ${prev.cols.length + 1}`],
      values: prev.values.map(row => [...row, '0']),
    }));

  const removeCol = () =>
    setLoglinearParams(prev =>
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
    setLoglinearParams(prev => ({
      ...prev,
      rows: [...next.rows],
      cols: [...next.cols],
      values: next.values.map(row => [...row]),
    }));
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-text3">{t('loglinear.title')}</span>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5">
            <button type="button" className={smallButton} onClick={() => applyPreset('twoByTwo')}>
              {t('contingency.presetTrial')}
            </button>
            <button type="button" className={smallButton} onClick={() => applyPreset('threeByThree')}>
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
                        setLoglinearParams(prev => ({
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
                        setLoglinearParams(prev => ({
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
          <label className="flex items-center gap-1.5 text-[11px] text-text2">
            <span>{t('form.loglinearModel')}</span>
            <select
              aria-label={t('form.loglinearModel')}
              className="rounded border border-border2 bg-surface3 p-1 text-[11px] text-text"
              value={model}
              onChange={e =>
                setLoglinearParams(prev => ({
                  ...prev,
                  model: e.target.value as LoglinearParams['model'],
                }))
              }
            >
              <option value="independence">{t('form.loglinearIndependence')}</option>
              <option value="saturated">{t('form.loglinearSaturated')}</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
};
