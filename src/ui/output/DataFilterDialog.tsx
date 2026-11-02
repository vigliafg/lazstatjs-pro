import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Play, Square, Trash2, X } from 'lucide-react';
import { t } from '../../i18n';
import { naturalCompare, type GridData } from '../../grid/types';
import { parseNum } from '../../stats/core';

interface DataFilterDialogProps {
  grid: GridData;
  /** Row keys currently dimmed in linked charts. */
  hidden: readonly string[];
  onChange: (keys: string[]) => void;
  onClose: () => void;
}

interface ValueBucket {
  value: string;
  count: number;
  rows: number[];
}

const numericColumn = (grid: GridData, column: number): boolean => {
  const type = grid.cols[column]?.type;
  if (type !== 'num' && type !== 'int') return false;
  return true;
};

/**
 * JMP-style Data Filter.
 *
 * The panel derives its state from the same row keys used by dynamic linking:
 * excluding a category, or cutting a numeric range, hides the corresponding
 * rows in every chart that carries row identity. The animation walks the
 * ordered values, which is the classic way to see how a filter changes a view.
 */
export const DataFilterDialog = ({
  grid,
  hidden,
  onChange,
  onClose,
}: DataFilterDialogProps) => {
  const [column, setColumn] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [threshold, setThreshold] = useState(0);

  const buckets = useMemo<ValueBucket[]>(() => {
    if (grid.cols.length === 0) return [];
    const map = new Map<string, ValueBucket>();
    grid.rows.forEach((row, index) => {
      const value = String(row[column] ?? '');
      const bucket = map.get(value);
      if (bucket) {
        bucket.count += 1;
        bucket.rows.push(index);
      } else {
        map.set(value, { value, count: 1, rows: [index] });
      }
    });
    return [...map.values()].sort((a, b) => naturalCompare(a.value, b.value));
  }, [grid, column]);

  const numeric = numericColumn(grid, column);
  const numericValues = useMemo(
    () =>
      numeric
        ? buckets
            .map(bucket => ({ ...bucket, number: parseNum(bucket.value) }))
            .filter(bucket => Number.isFinite(bucket.number))
            .sort((a, b) => a.number - b.number)
        : [],
    [buckets, numeric]
  );
  const numberMin = numericValues[0]?.number ?? 0;
  const numberMax = numericValues[numericValues.length - 1]?.number ?? 0;

  // Reset the derived controls when the column changes; the row set stays
  // valid because it is expressed as grid row indexes.
  useEffect(() => {
    setPlaying(false);
    setCursor(0);
    setThreshold(numberMax);
  }, [column, numberMax]);

  useEffect(() => {
    if (!playing) return;
    if (numeric) {
      if (!(numberMax > numberMin)) {
        setPlaying(false);
        return;
      }
      const step = (numberMax - numberMin) / 20;
      const timer = setInterval(() => {
        setThreshold(current => {
          const next = current + step;
          if (next >= numberMax) {
            setPlaying(false);
            return numberMax;
          }
          return next;
        });
      }, 700);
      return () => clearInterval(timer);
    }
    if (buckets.length === 0) return;
    const timer = setInterval(() => {
      setCursor(current => (current + 1) % buckets.length);
    }, 700);
    return () => clearInterval(timer);
  }, [playing, numeric, numberMin, numberMax, buckets.length]);

  // Apply the animated state to the row keys.
  useEffect(() => {
    if (!playing) return;
    if (numeric) {
      onChange(
        grid.rows
          .map((row, index) => ({ value: parseNum(row[column]), index }))
          .filter(item => Number.isFinite(item.value) && item.value > threshold)
          .map(item => String(item.index))
      );
    } else {
      const visible = new Set(buckets.slice(0, cursor + 1).map(bucket => bucket.value));
      onChange(
        grid.rows
          .map((row, index) => ({ value: String(row[column] ?? ''), index }))
          .filter(item => !visible.has(item.value))
          .map(item => String(item.index))
      );
    }
  }, [playing, numeric, threshold, cursor, buckets, column, grid, onChange]);

  const hiddenSet = useMemo<Set<string>>(() => new Set(hidden), [hidden]);
  const hiddenCount = grid.rows.reduce(
    (count, _row, index) => count + (hiddenSet.has(String(index)) ? 1 : 0),
    0
  );

  const categoryHidden = (bucket: ValueBucket): boolean =>
    bucket.rows.length > 0 && bucket.rows.every(index => hiddenSet.has(String(index)));

  const toggleValue = (bucket: ValueBucket) => {
    setPlaying(false);
    const next = new Set<string>(hiddenSet);
    if (categoryHidden(bucket)) {
      bucket.rows.forEach(index => next.delete(String(index)));
    } else {
      bucket.rows.forEach(index => next.add(String(index)));
    }
    onChange([...next]);
  };

  const applyThreshold = (value: number) => {
    setPlaying(false);
    setThreshold(value);
    onChange(
      grid.rows
        .map((row, index) => ({ value: parseNum(row[column]), index }))
        .filter(item => Number.isFinite(item.value) && item.value > value)
        .map(item => String(item.index))
    );
  };

  const clear = () => {
    setPlaying(false);
    setCursor(0);
    setThreshold(numberMax);
    onChange([]);
  };

  if (grid.cols.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.aside
        key="data-filter"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
        role="dialog"
        aria-label={t('filter.title')}
        aria-modal="false"
        data-no-print
        data-data-filter
        className="absolute right-3 top-[74px] z-40 flex w-[320px] max-w-[calc(100%-1.5rem)] flex-col rounded-lg border border-border2 bg-surface p-3 shadow-xl"
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            onClose();
          }
        }}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent2">
            {t('filter.title')}
          </span>
          <button
            type="button"
            className="ml-auto flex h-6 w-6 items-center justify-center rounded text-text3 hover:bg-surface3 hover:text-text"
            onClick={onClose}
            aria-label={t('filter.close')}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <label className="mb-2 block">
          <span className="mb-0.5 block font-mono text-[9px] uppercase tracking-wider text-text3">
            {t('filter.column')}
          </span>
          <select
            data-filter-column
            value={column}
            onChange={event => {
              setColumn(Number(event.target.value));
              setPlaying(false);
              onChange([]);
            }}
            className="w-full rounded border border-border2 bg-surface3 px-1.5 py-1 text-[10px] text-text2"
          >
            {grid.cols.map((col, index) => (
              <option key={index} value={index}>
                {col.name || `C${index + 1}`}
              </option>
            ))}
          </select>
        </label>

        {numeric ? (
          <div className="mb-2">
            <div className="mb-1 flex items-center justify-between font-mono text-[9px] text-text3">
              <span>{t('filter.value')} ≤</span>
              <span className="text-accent2">{threshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              data-filter-threshold
              min={numberMin}
              max={numberMax}
              step={(numberMax - numberMin) / 100 || 0.01}
              value={threshold}
              onChange={event => applyThreshold(Number(event.target.value))}
              className="w-full accent-accent2"
            />
            <div className="flex justify-between font-mono text-[8px] text-text3">
              <span>{numberMin.toFixed(2)}</span>
              <span>{numberMax.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div
            data-filter-values
            className="scrollbar mb-2 max-h-[180px] overflow-auto rounded border border-border2/60"
          >
            {buckets.slice(0, 80).map(bucket => {
              const excluded = categoryHidden(bucket);
              return (
                <button
                  key={bucket.value}
                  type="button"
                  onClick={() => toggleValue(bucket)}
                  aria-pressed={!excluded}
                  data-filter-value={bucket.value}
                  className={`flex w-full items-center gap-2 border-b border-border2/40 px-2 py-1 text-left last:border-b-0 hover:bg-surface3 ${
                    excluded ? 'opacity-45' : ''
                  }`}
                >
                  <span
                    className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-sm border ${
                      excluded ? 'border-border2' : 'border-accent2 bg-accent2/20'
                    }`}
                    aria-hidden="true"
                  >
                    {!excluded && <span className="h-1.5 w-1.5 rounded-[1px] bg-accent2" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[10px] text-text2">
                    {bucket.value || '—'}
                  </span>
                  <span className="shrink-0 font-mono text-[9px] text-text3">{bucket.count}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mb-2 flex flex-wrap items-center gap-1">
          <button
            type="button"
            className="tb-btn px-2 py-0.5 text-[9px]"
            onClick={() => {
              if (!playing) {
                if (numeric && threshold >= numberMax) setThreshold(numberMin);
                if (!numeric) setCursor(0);
              }
              setPlaying(value => !value);
            }}
            data-filter-animate
            title={t('filter.animateTitle')}
          >
            {playing ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {playing ? t('filter.stop') : t('filter.animate')}
          </button>
          <button
            type="button"
            className="tb-btn px-2 py-0.5 text-[9px]"
            onClick={clear}
            data-filter-clear
          >
            <Trash2 className="h-3 w-3" />
            {t('filter.clear')}
          </button>
          <span className="ml-auto font-mono text-[9px] text-text3" data-filter-summary>
            {t('filter.summary', { s1: hiddenCount, s2: grid.rows.length })}
          </span>
        </div>

        <p className="text-[9px] leading-snug text-text3">{t('filter.note')}</p>
      </motion.aside>
    </AnimatePresence>
  );
};
