/** Parse a cell as a number, accepting decimal commas. */
export const numVal = (v: string): number | null => {
  const t = String(v ?? '').trim().replace(',', '.');
  if (t === '') return null;
  const n = Number(t);
  return isNaN(n) ? null : n;
};
