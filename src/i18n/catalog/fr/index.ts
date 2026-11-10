/** Catalogue français. Chaque clé de la source anglaise doit être présente. */
import type { Messages } from '../en';
import { shellMessages } from './shell';
import { formMessages } from './form';
import { dataMessages } from './data';
import { analysisMessages } from './analysis';
import { outputMessages } from './output';
import { metaMessages } from './meta';
import { assistantMessages } from './assistant';

export const frMessages: Messages = {
  ...shellMessages,
  ...formMessages,
  ...dataMessages,
  ...analysisMessages,
  ...outputMessages,
  ...metaMessages,
  ...assistantMessages,
};
