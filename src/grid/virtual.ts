/** Fixed body-row height in px; the virtual window depends on it. */
export const ROW_HEIGHT = 23;
/** Rows kept above and below the viewport to absorb wheel/keyboard scroll. */
export const OVERSCAN = 10;
/** Below this row count the table renders every row (no spacers). */
export const VIRTUAL_THRESHOLD = 80;

export interface RowWindow {
  start: number;
  end: number;
  /** Height of the spacer above the rendered window. */
  padTop: number;
  /** Height of the spacer below the rendered window. */
  padBottom: number;
}

/**
 * Slice of rows to render for a scroll position.
 *
 * The table keeps natural row heights and uses two spacer rows, so column
 * widths stay intact (with absolute positioning they would not).
 */
export const visibleWindow = (
  total: number,
  scrollTop: number,
  viewportHeight: number
): RowWindow => {
  if (total <= VIRTUAL_THRESHOLD) {
    return { start: 0, end: total, padTop: 0, padBottom: 0 };
  }
  const start = Math.min(total, Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN));
  const end = Math.min(
    total,
    Math.ceil((Math.max(0, scrollTop) + Math.max(0, viewportHeight)) / ROW_HEIGHT) + OVERSCAN
  );
  return {
    start,
    end,
    padTop: start * ROW_HEIGHT,
    padBottom: Math.max(0, (total - end) * ROW_HEIGHT),
  };
};
