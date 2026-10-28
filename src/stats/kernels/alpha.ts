/** Livello di confidenza (90/95/99) in alpha a due code. */
export const alphaOf = (level: number): number => 1 - level / 100;
