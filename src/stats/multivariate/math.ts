/** Media aritmetica usata da calcolo, tabelle e report. */
export const mean = (values: number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;
