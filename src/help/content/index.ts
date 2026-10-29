import type { HelpBook } from './types';
import { enBook } from './en/book';
import { itBook } from './it/book';

/** Books rendered by `scripts/build-help.mjs`, in menu order. */
export const BOOKS: HelpBook[] = [itBook, enBook];

export const bookFor = (locale: string): HelpBook | undefined =>
  BOOKS.find(book => book.locale === locale);
