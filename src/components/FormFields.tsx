import { type ReactNode } from 'react';
import { columnLabel, type Column } from '../grid/types';

/** Card-style section used by the setup panel and by the forms. */
export const Section = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) => (
  <section className="border-b border-border/70 pb-4 last:border-0 last:pb-0">
    <div className="mb-2 flex items-baseline justify-between gap-2">
      <h3 className="font-mono text-[9px] uppercase tracking-[0.18em] text-text3">{title}</h3>
      {hint && <span className="text-[9px] text-text3/70">{hint}</span>}
    </div>
    {children}
  </section>
);

/** Label + control + hint, so every form has the same vertical rhythm. */
export const Field = ({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <label
      htmlFor={htmlFor}
      className="font-mono text-[10px] uppercase tracking-widest text-text3"
    >
      {label}
    </label>
    {children}
    {hint && <span className="text-[9px] leading-relaxed text-text3">{hint}</span>}
  </div>
);

const selectClass =
  'min-w-[120px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text focus:border-accent focus:outline-none';

export interface VariableOption {
  value: number;
  label: string;
}

/** Column picker: options are grid indexes, labels are the displayed names. */
export const VariableSelect = ({
  label,
  ariaLabel,
  value,
  options,
  onChange,
  hint,
  trailing,
}: {
  label: string;
  ariaLabel?: string;
  value: number;
  options: VariableOption[];
  onChange: (value: number) => void;
  hint?: string;
  trailing?: ReactNode;
}) => (
  <Field label={label} hint={hint}>
    <div className="flex items-center gap-1">
      <select
        aria-label={ariaLabel ?? label}
        className={`${selectClass} min-w-0 flex-1`}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {!options.some(option => option.value === value) && (
          <option value={value}>—</option>
        )}
      </select>
      {trailing}
    </div>
  </Field>
);

export const variableOptions = (cols: Column[]): VariableOption[] =>
  cols.map((col, index) => ({ value: index, label: columnLabel(col) }));

/** Checkbox list used by multi-variable procedures. */
export const VariableList = ({
  label,
  cols,
  selected,
  onToggle,
  hint,
}: {
  label: string;
  cols: Column[];
  selected: readonly number[];
  onToggle: (column: number, checked: boolean) => void;
  hint?: string;
}) => (
  <Field label={label} hint={hint}>
    <div className="max-h-[120px] min-w-[200px] overflow-auto rounded border border-border2 bg-surface3 p-2 scrollbar">
      {cols.map((col, index) => (
        <label
          key={col.id ?? index}
          className="flex cursor-pointer items-center gap-2 py-0.5 text-[11px] text-text2 hover:text-text"
        >
          <input
            type="checkbox"
            className="accent-accent"
            checked={selected.includes(index)}
            onChange={event => onToggle(index, event.target.checked)}
          />
          {columnLabel(col)}
        </label>
      ))}
    </div>
  </Field>
);

/** Progressive disclosure for options that most runs do not need. */
export const Advanced = ({
  title = 'Advanced',
  children,
  open = false,
}: {
  title?: string;
  children: ReactNode;
  open?: boolean;
}) => (
  <details open={open} className="rounded border border-border/70 bg-surface3/30 px-2 py-1.5">
    <summary className="cursor-pointer font-mono text-[9px] uppercase tracking-widest text-text3">
      {title}
    </summary>
    <div className="mt-2 flex flex-col gap-3">{children}</div>
  </details>
);

export const CheckboxField = ({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) => (
  <label className="flex cursor-pointer items-start gap-1.5 text-[11px] text-text2 hover:text-text">
    <input
      type="checkbox"
      className="mt-0.5 accent-accent"
      checked={checked}
      onChange={event => onChange(event.target.checked)}
    />
    <span>
      {label}
      {hint && <span className="block text-[9px] leading-relaxed text-text3">{hint}</span>}
    </span>
  </label>
);
