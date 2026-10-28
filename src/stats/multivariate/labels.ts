export const kmoLabel = (value: number): string => {
  if (!Number.isFinite(value)) return 'non calcolabile';
  if (value >= 0.9) return 'eccellente';
  if (value >= 0.8) return 'buono';
  if (value >= 0.7) return 'discreto';
  if (value >= 0.6) return 'mediocre';
  if (value >= 0.5) return 'scarso';
  return 'inaccettabile';
};

export const alphaLabel = (alpha: number): string => {
  if (!Number.isFinite(alpha)) return 'non calcolabile';
  if (alpha >= 0.9) return 'eccellente';
  if (alpha >= 0.8) return 'buona';
  if (alpha >= 0.7) return 'accettabile';
  if (alpha >= 0.6) return 'dubbia';
  return 'bassa';
};
