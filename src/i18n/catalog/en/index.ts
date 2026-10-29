import { shellMessages } from './shell';
import { formMessages } from './form';
import { dataMessages } from './data';
import { analysisMessages } from './analysis';
import { outputMessages } from './output';
import { metaMessages } from './meta';

/** English catalog: the source of truth for every message key. */
export const enMessages = {
  ...shellMessages,
  ...formMessages,
  ...dataMessages,
  ...analysisMessages,
  ...outputMessages,
  ...metaMessages,
};

export type Messages = { [K in keyof typeof enMessages]: string };
