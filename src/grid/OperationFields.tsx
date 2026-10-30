import type { ReactNode } from 'react';
import type { ColumnOperation } from './columnOps';
import type { GridData } from './types';

export type ToastKind = 'ok' | 'warn' | 'error';

export type TransformApply = (
  next: GridData,
  message: string,
  kind?: ToastKind,
  operation?: ColumnOperation
) => void;

export type CleanApply = (next: GridData, message: string) => void;

export const inputClass =
  'w-full rounded border border-border2 bg-surface3 px-2 py-1 text-[11px] text-text';
export const selectClass = inputClass;

export const clampColumn = (value: number, count: number): number =>
  Math.max(0, Math.min(value, Math.max(0, count - 1)));

export const OpField = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="flex flex-col gap-1">
    <span className="font-mono text-[9px] uppercase tracking-widest text-text2">{label}</span>
    {children}
  </label>
);

export const ColumnSelect = ({
  value,
  grid,
  dataTransform,
  dataClean,
  onChange,
}: {
  value: number;
  grid: GridData;
  dataTransform?: string;
  dataClean?: string;
  onChange: (value: number) => void;
}) => (
  <select
    className={selectClass}
    data-transform={dataTransform}
    data-clean={dataClean}
    value={clampColumn(value, grid.cols.length)}
    onChange={(event) => onChange(Number(event.target.value))}
  >
    {grid.cols.map((column, index) => (
      <option key={index} value={index}>
        {column.name}
      </option>
    ))}
  </select>
);
