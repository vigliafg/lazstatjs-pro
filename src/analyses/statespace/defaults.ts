import type { StateSpaceParams } from '../../io/project';

export const defaultStateSpaceParams = (_grid: unknown): StateSpaceParams => ({
  mode: 'local',
  variable: 0,
  horizon: 10,
  trend: true,
});
