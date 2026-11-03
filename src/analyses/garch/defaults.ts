import type { GarchParams } from '../../io/project';

export const defaultGarchParams = (_grid: unknown): GarchParams => ({
  variable: 0,
  horizon: 10,
});
