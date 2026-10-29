/** European Portuguese catalog. Every key of the English source must be present. */
import type { Messages } from '../en';
import { shellMessages } from './shell';
import { formMessages } from './form';
import { dataMessages } from './data';
import { analysisMessages } from './analysis';
import { outputMessages } from './output';
import { metaMessages } from './meta';

export const ptPTMessages: Messages = {
  ...shellMessages,
  ...formMessages,
  ...dataMessages,
  ...analysisMessages,
  ...outputMessages,
  ...metaMessages,
};
