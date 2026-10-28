/**
 * Benjamini–Hochberg false discovery rate.
 *
 * Restituisce p aggiustati della stessa lunghezza, NaN per gli input non
 * finiti. Gli aggiustati sono monotoni non decrescenti nell'ordine dei p.
 */
export const benjaminiHochberg = (pValues: number[]): number[] => {
  const adjusted = new Array<number>(pValues.length).fill(NaN);
  const indexed = pValues
    .map((p, index) => ({ p, index }))
    .filter(item => Number.isFinite(item.p))
    .sort((left, right) => left.p - right.p);
  const m = indexed.length;
  if (m === 0) return adjusted;

  let previous = 1;
  for (let i = m - 1; i >= 0; i--) {
    const value = Math.min(previous, (indexed[i].p * m) / (i + 1));
    adjusted[indexed[i].index] = Math.min(1, value);
    previous = value;
  }
  return adjusted;
};
