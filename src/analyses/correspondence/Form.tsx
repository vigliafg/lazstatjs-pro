import type { Dispatch, SetStateAction } from 'react';
import type { CorrespondenceParams } from '../../io/project';
import { t } from '../../i18n';

export interface CorrespondenceFormProps {
  correspondenceParams: CorrespondenceParams;
  setCorrespondenceParams: Dispatch<SetStateAction<CorrespondenceParams>>;
}

const cellInput =
  'w-14 rounded border border-border2 bg-surface p-1 text-center font-mono text-[11px] text-text';
const smallButton =
  'rounded border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-text3 hover:bg-border hover:text-text';

export const CorrespondenceForm = ({
  correspondenceParams,
  setCorrespondenceParams,
}: CorrespondenceFormProps) => {
  const { rows, cols, values } = correspondenceParams;
  const setCell = (row: number, column: number, value: string) =>
    setCorrespondenceParams(previous => ({
      ...previous,
      values: previous.values.map((cells, ri) =>
        ri === row ? cells.map((cell, ci) => (ci === column ? value : cell)) : cells
      ),
    }));
  const addRow = () =>
    setCorrespondenceParams(previous => ({
      ...previous,
      rows: [...previous.rows, `${t('contingency.row')} ${previous.rows.length + 1}`],
      values: [...previous.values, previous.cols.map(() => '0')],
    }));
  const removeRow = () =>
    setCorrespondenceParams(previous =>
      previous.rows.length <= 2
        ? previous
        : { ...previous, rows: previous.rows.slice(0, -1), values: previous.values.slice(0, -1) }
    );
  const addCol = () =>
    setCorrespondenceParams(previous => ({
      ...previous,
      cols: [...previous.cols, `${t('contingency.col')} ${previous.cols.length + 1}`],
      values: previous.values.map(row => [...row, '0']),
    }));
  const removeCol = () =>
    setCorrespondenceParams(previous =>
      previous.cols.length <= 2
        ? previous
        : {
            ...previous,
            cols: previous.cols.slice(0, -1),
            values: previous.values.map(row => row.slice(0, -1)),
          }
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="border-collapse text-[11px]">
          <thead>
            <tr>
              <th />
              {cols.map((label, column) => (
                <th key={column} className="p-1">
                  <input
                    aria-label={`${t('contingency.col')} ${column + 1}`}
                    className="w-20 rounded border border-border2 bg-surface3 p-1 text-[10px] text-text"
                    value={label}
                    onChange={event =>
                      setCorrespondenceParams(previous => ({
                        ...previous,
                        cols: previous.cols.map((item, index) =>
                          index === column ? event.target.value : item
                        ),
                      }))
                    }
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((label, row) => (
              <tr key={row}>
                <th className="p-1">
                  <input
                    aria-label={`${t('contingency.row')} ${row + 1}`}
                    className="w-24 rounded border border-border2 bg-surface3 p-1 text-[10px] text-text"
                    value={label}
                    onChange={event =>
                      setCorrespondenceParams(previous => ({
                        ...previous,
                        rows: previous.rows.map((item, index) =>
                          index === row ? event.target.value : item
                        ),
                      }))
                    }
                  />
                </th>
                {values[row]?.map((value, column) => (
                  <td key={column} className="p-1">
                    <input
                      aria-label={`${t('contingency.row')} ${row + 1} ${t('contingency.col')} ${column + 1}`}
                      className={cellInput}
                      value={value}
                      onChange={event => setCell(row, column, event.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <button type="button" className={smallButton} onClick={addRow}>
          + {t('contingency.row')}
        </button>
        <button type="button" className={smallButton} onClick={removeRow}>
          − {t('contingency.row')}
        </button>
        <button type="button" className={smallButton} onClick={addCol}>
          + {t('contingency.col')}
        </button>
        <button type="button" className={smallButton} onClick={removeCol}>
          − {t('contingency.col')}
        </button>
      </div>
    </div>
  );
};
