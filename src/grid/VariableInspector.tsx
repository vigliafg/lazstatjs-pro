import { useEffect, useState } from 'react';
import { Copy, Info, Layers, Trash2, X } from 'lucide-react';
import {
  COL_TYPES,
  columnLevels,
  distinctColumnValues,
  isGroupColumn,
  validateValue,
  type CategoryLevel,
  type ColType,
  type GridData,
} from './types';
import { LevelsEditor } from './LevelsEditor';

interface Props {
  grid: GridData;
  column: number;
  onSelectColumn: (column: number) => void;
  onRename: (column: number, name: string) => void;
  onType: (column: number, type: ColType) => void;
  onMeta: (column: number, patch: { label?: string; description?: string }) => void;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
  onDuplicate: (column: number) => void;
  onDelete: (column: number) => void;
  onClose: () => void;
}

const inputClass =
  'w-full rounded border border-border2 bg-surface3 px-2 py-1 text-[11px] text-text focus:border-accent focus:outline-none';

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded border border-border bg-surface3/60 px-2 py-1.5">
    <p className="font-mono text-[8px] uppercase tracking-wider text-text3">{label}</p>
    <p className="mt-0.5 font-mono text-[12px] text-text2">{value}</p>
  </div>
);

/** Right-hand variable dictionary for the data editor. */
export const VariableInspector = ({
  grid,
  column,
  onSelectColumn,
  onRename,
  onType,
  onMeta,
  onLevels,
  onRecode,
  onDuplicate,
  onDelete,
  onClose,
}: Props) => {
  const col = grid.cols[column];
  const [name, setName] = useState(col?.name ?? '');
  const [label, setLabel] = useState(col?.label ?? '');
  const [description, setDescription] = useState(col?.description ?? '');

  useEffect(() => {
    setName(col?.name ?? '');
    setLabel(col?.label ?? '');
    setDescription(col?.description ?? '');
  }, [column, col?.name, col?.label, col?.description]);

  if (!col) return null;

  const values = distinctColumnValues(grid.rows, column);
  const grouping = isGroupColumn(grid, column);
  const declaredLevels = col.levels ?? [];
  const levels = declaredLevels.length > 0
    ? declaredLevels
    : grouping
      ? columnLevels(col, grid.rows, column)
      : [];
  const missing = grid.rows.filter(row => String(row[column] ?? '').trim() === '').length;
  const invalid = grid.rows.filter(row => !validateValue(row[column], col.type)).length;
  const role = grouping
    ? 'Grouping'
    : col.type === 'id'
      ? 'Identifier'
      : 'Continuous / text';

  const commitName = () => {
    const next = name.trim();
    if (next && next !== col.name) onRename(column, next);
  };

  const commitMeta = () => {
    const nextLabel = label.trim();
    const nextDescription = description.trim();
    if (nextLabel !== (col.label ?? '') || nextDescription !== (col.description ?? '')) {
      onMeta(column, { label: nextLabel, description: nextDescription });
    }
  };

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-l border-border bg-surface">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
        <Layers className="h-3.5 w-3.5 text-accent2" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-text3">
          Variable
        </span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto flex h-5 w-5 items-center justify-center rounded text-text3 hover:bg-border hover:text-text"
          aria-label="Close variable inspector"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto scrollbar p-3">
        <label className="block font-mono text-[8px] uppercase tracking-widest text-text3">
          Column
          <select
            value={column}
            onChange={event => onSelectColumn(Number(event.target.value))}
            className={`${inputClass} mt-1`}
          >
            {grid.cols.map((item, index) => (
              <option key={item.id ?? index} value={index}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <Stat label="Rows" value={grid.rows.length} />
          <Stat label="Missing" value={missing} />
          <Stat label="Unique" value={values.length} />
          <Stat label="Invalid" value={invalid} />
        </div>

        <div className="mt-3 rounded border border-accent/20 bg-accent/5 px-2 py-1.5">
          <p className="font-mono text-[8px] uppercase tracking-wider text-text3">Role</p>
          <p className="text-[11px] text-text2">{role}</p>
        </div>

        <label className="mt-3 block font-mono text-[8px] uppercase tracking-widest text-text3">
          Name
          <input
            value={name}
            onChange={event => setName(event.target.value)}
            onBlur={commitName}
            onKeyDown={event => {
              if (event.key === 'Enter') event.currentTarget.blur();
              if (event.key === 'Escape') setName(col.name);
            }}
            className={`${inputClass} mt-1`}
          />
        </label>

        <label className="mt-2 block font-mono text-[8px] uppercase tracking-widest text-text3">
          Type
          <select
            value={col.type}
            onChange={event => onType(column, event.target.value as ColType)}
            className={`${inputClass} mt-1`}
          >
            {COL_TYPES.map(type => (
              <option key={type.id} value={type.id} title={type.full}>
                {type.label} — {type.full}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-2 block font-mono text-[8px] uppercase tracking-widest text-text3">
          Label
          <input
            value={label}
            onChange={event => setLabel(event.target.value)}
            onBlur={commitMeta}
            onKeyDown={event => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
            placeholder="Shown in tables and pickers"
            className={`${inputClass} mt-1`}
          />
        </label>

        <label className="mt-2 block font-mono text-[8px] uppercase tracking-widest text-text3">
          Description
          <textarea
            value={description}
            onChange={event => setDescription(event.target.value)}
            onBlur={commitMeta}
            rows={2}
            placeholder="Optional note"
            className={`${inputClass} mt-1 resize-y`}
          />
        </label>

        <div className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[8px] uppercase tracking-widest text-text3">
              Levels
            </span>
            <LevelsEditor
              grid={grid}
              column={column}
              onLevels={onLevels}
              onRecode={onRecode}
              label="Edit levels"
              className="tb-btn flex items-center gap-1 px-2 py-0.5 text-[10px]"
            />
          </div>
          {levels.length === 0 ? (
            <p className="mt-1 text-[10px] leading-relaxed text-text3">
              No declared levels. Open the editor to add labels or a reference.
            </p>
          ) : (
            <ul className="mt-1.5 max-h-40 space-y-0.5 overflow-auto scrollbar">
              {levels.map(level => (
                <li
                  key={level.value}
                  className="flex items-center gap-1.5 rounded bg-surface3/50 px-1.5 py-1 text-[10px]"
                >
                  <span className="font-mono text-text3">{level.value}</span>
                  <span className="text-text2">→</span>
                  <span className="truncate text-text">{level.label}</span>
                  {col.reference === level.value && (
                    <span className="ml-auto rounded border border-accent/30 bg-accent/10 px-1 font-mono text-[8px] uppercase text-accent">
                      ref
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded border border-border bg-surface3/40 p-2">
          <Info className="mt-0.5 h-3 w-3 shrink-0 text-text3" />
          <p className="text-[9px] leading-relaxed text-text3">
            The label is stored with the project. Analyses still use the column name in
            their pickers; this inspector is the single place to review the variable.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 gap-1.5 border-t border-border p-2">
        <button
          type="button"
          onClick={() => onDuplicate(column)}
          className="tb-btn flex flex-1 items-center justify-center gap-1 px-2 py-1 text-[10px]"
        >
          <Copy className="h-3 w-3" />
          Duplicate
        </button>
        <button
          type="button"
          onClick={() => onDelete(column)}
          className="tb-btn flex flex-1 items-center justify-center gap-1 px-2 py-1 text-[10px] text-red/90 hover:bg-red hover:text-white"
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </button>
      </div>
    </aside>
  );
};
