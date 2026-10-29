import { Children, cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';
import { columnLabel, groupColumnIndexes, type CategoryLevel, type Column, type GridData } from '../grid/types';
import { LevelsEditor, LEVELS_BUTTON_CLASS } from '../grid/LevelsEditor';
import { t } from '../i18n';
import { useUiMode } from './UiMode';

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
}) => {
  const generatedId = useId();
  const controlId = htmlFor ?? generatedId;
  // A raw <select>/<input>/<textarea> can be associated automatically. Wrapper
  // components (VariableSelect) pass their own id through htmlFor.
  const single = Children.count(children) === 1 ? Children.only(children) : null;
  const control =
    isValidElement<{ id?: string }>(single) &&
    (single.type === 'select' || single.type === 'input' || single.type === 'textarea')
      ? cloneElement(single as ReactElement<{ id?: string }>, { id: controlId })
      : children;
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={controlId}
        className="font-mono text-[10px] uppercase tracking-widest text-text3"
      >
        {label}
      </label>
      {control}
      {hint && <span className="text-[9px] leading-relaxed text-text3">{hint}</span>}
    </div>
  );
};

const selectClass =
  'min-w-[120px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text focus:border-accent focus:outline-none';

/** Fieldset wrapper for checkbox groups: gives the group an accessible name. */
const FieldSet = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) => (
  <fieldset className="m-0 flex min-w-0 flex-col gap-1 border-0 p-0">
    <legend className="font-mono text-[10px] uppercase tracking-widest text-text3">{label}</legend>
    {children}
    {hint && <p className="text-[9px] leading-relaxed text-text3">{hint}</p>}
  </fieldset>
);

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
  disabledValues = [],
}: {
  label: string;
  ariaLabel?: string;
  value: number;
  options: VariableOption[];
  onChange: (value: number) => void;
  hint?: string;
  trailing?: ReactNode;
  /** Values shown but not selectable (prevents duplicate roles). */
  disabledValues?: readonly number[];
}) => {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className="flex items-center gap-1">
        <select
          id={id}
          aria-label={ariaLabel ?? label}
          className={`${selectClass} min-w-0 flex-1`}
          value={value}
          onChange={event => onChange(Number(event.target.value))}
        >
          {options.map(option => (
            <option key={option.value} value={option.value} disabled={disabledValues.includes(option.value)}>
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
};

/** Numeric input with inline validation; the runner still guards finiteness. */
export const NumberField = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 'any',
  integer = false,
  hint,
  width = 'w-24',
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: string;
  max?: string;
  step?: string;
  integer?: boolean;
  hint?: string;
  width?: string;
}) => {
  const id = useId();
  const minValue = min === undefined ? -Infinity : Number(min);
  const maxValue = max === undefined ? Infinity : Number(max);
  const outOfRange =
    Number.isFinite(value) && (value < minValue || value > maxValue);
  const invalid = !Number.isFinite(value) || outOfRange;
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        aria-label={label}
        aria-invalid={invalid || undefined}
        className={`${width} rounded border bg-surface3 p-1.5 text-[11px] text-text ${
          invalid ? 'border-red' : 'border-border2'
        }`}
        value={Number.isFinite(value) ? value : ''}
        onChange={event => {
          const raw = event.target.value;
          const next = integer ? parseInt(raw, 10) : parseFloat(raw);
          onChange(Number.isNaN(next) ? Number.NaN : next);
        }}
      />
      {invalid && (
        <span role="alert" className="text-[9px] text-red">
          {Number.isFinite(value) ? t('form.outOfRange') : t('form.numberRequired')}
        </span>
      )}
    </Field>
  );
};

export const variableOptions = (cols: Column[]): VariableOption[] =>
  cols.map((col, index) => ({ value: index, label: columnLabel(col) }));

/**
 * Single entry point for a grouping variable: filters to `isGroupColumn`,
 * offers an optional "None", shows an explicit empty state and exposes the
 * levels editor consistently across every procedure.
 */
export const GroupSelect = ({
  label,
  ariaLabel,
  grid,
  value,
  onChange,
  allowNone = false,
  noneLabel,
  fallback = false,
  optionLabel,
  hint,
  onLevels,
  onRecode,
  disabledValues = [],
}: {
  label: string;
  ariaLabel?: string;
  grid: GridData;
  value: number;
  onChange: (value: number) => void;
  /** Optional designs allow -1 (no group). */
  allowNone?: boolean;
  noneLabel?: string;
  /** Keep the current non-group column visible while the user fixes it. */
  fallback?: boolean;
  /** Custom label, e.g. the Wizard's level count. */
  optionLabel?: (index: number) => string;
  hint?: string;
  onLevels?: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode?: (column: number, mapping: Record<string, string>) => void;
  disabledValues?: readonly number[];
}) => {
  const indexes = groupColumnIndexes(grid);
  const options: VariableOption[] = indexes.map(index => ({
    value: index,
    label: optionLabel?.(index) ?? columnLabel(grid.cols[index]),
  }));
  if (allowNone) {
    options.unshift({ value: -1, label: noneLabel ?? t('form.none') });
  }
  if (fallback && value >= 0 && !indexes.includes(value) && grid.cols[value]) {
    options.push({
      value,
      label: `${columnLabel(grid.cols[value])} (${t('form.groupNumericFallback')})`,
    });
  }
  const hasGroup = indexes.length > 0;
  const levels =
    value >= 0 && grid.cols[value] && (onLevels || onRecode) ? (
      <LevelsEditor
        grid={grid}
        column={value}
        onLevels={onLevels ?? (() => undefined)}
        onRecode={onRecode ?? (() => undefined)}
        label={t('action.levels')}
        className={LEVELS_BUTTON_CLASS}
      />
    ) : undefined;
  return (
    <VariableSelect
      label={label}
      ariaLabel={ariaLabel}
      value={value}
      options={options}
      onChange={onChange}
      disabledValues={disabledValues}
      hint={hasGroup ? hint : t('form.noGroupColumns')}
      trailing={levels}
    />
  );
};

/** Options restricted to a subset of grid indexes (order preserved). */
export const variableOptionsFrom = (
  cols: Column[],
  indexes: readonly number[]
): VariableOption[] =>
  indexes
    .filter(index => Boolean(cols[index]))
    .map(index => ({ value: index, label: columnLabel(cols[index]) }));

/** Checkbox list used by multi-variable procedures. */
export const VariableList = ({
  label,
  cols,
  selected,
  onToggle,
  hint,
  only,
  disabled = [],
  showType = false,
  emptyText,
}: {
  label: string;
  cols: Column[];
  selected: readonly number[];
  onToggle: (column: number, checked: boolean) => void;
  hint?: string;
  /** Render only these grid indexes (order preserved). */
  only?: readonly number[];
  disabled?: readonly number[];
  showType?: boolean;
  emptyText?: string;
}) => {
  const indexes = only ?? cols.map((_, index) => index);
  return (
    <FieldSet label={label} hint={hint}>
      <div className="max-h-[120px] min-w-[200px] overflow-auto rounded border border-border2 bg-surface3 p-2 scrollbar">
        {indexes.length === 0 && emptyText && (
          <p className="text-[10px] italic text-text3">{emptyText}</p>
        )}
        {indexes.map(index => {
          const col = cols[index];
          if (!col) return null;
          return (
            <label
              key={col.id ?? index}
              className="flex cursor-pointer items-center gap-2 py-0.5 text-[11px] text-text2 hover:text-text"
            >
              <input
                type="checkbox"
                className="accent-accent"
                checked={selected.includes(index)}
                disabled={disabled.includes(index)}
                onChange={event => onToggle(index, event.target.checked)}
              />
              <span>{columnLabel(col)}</span>
              {showType && <span className="font-mono text-[9px] text-text3">{col.type}</span>}
            </label>
          );
        })}
      </div>
    </FieldSet>
  );
};

/** Compact checkbox group for non-column options (distributions, methods, …). */
export const CheckboxList = <T extends string>({
  label,
  items,
  hint,
  columns = false,
}: {
  label: string;
  items: readonly { value: T; label: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }[];
  hint?: string;
  columns?: boolean;
}) => (
  <FieldSet label={label} hint={hint}>
    <div
      className={`flex max-w-[360px] rounded border border-border2 bg-surface3 p-2 ${
        columns ? 'flex-wrap gap-x-3 gap-y-1' : 'flex-col gap-0.5'
      }`}
    >
      {items.map(item => (
        <label
          key={item.value}
          className="flex cursor-pointer items-center gap-1.5 text-[11px] text-text2 hover:text-text"
        >
          <input
            type="checkbox"
            className="accent-accent"
            checked={item.checked}
            disabled={item.disabled}
            onChange={event => item.onChange(event.target.checked)}
          />
          {item.label}
        </label>
      ))}
    </div>
  </FieldSet>
);

/** Progressive disclosure for options that most runs do not need. */
export const Advanced = ({
  title = t('form.advanced'),
  children,
  open = false,
}: {
  title?: string;
  children: ReactNode;
  open?: boolean;
}) => {
  const mode = useUiMode();
  if (mode === 'guided') return null;
  return (
    <details open={open} className="rounded border border-border/70 bg-surface3/30 px-2 py-1.5">
      <summary className="cursor-pointer font-mono text-[9px] uppercase tracking-widest text-text3">
        {title}
      </summary>
      <div className="mt-2 flex flex-col gap-3">{children}</div>
    </details>
  );
};

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
