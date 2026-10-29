import type { HelpBook } from './types';
import { enBook } from './en/book';
import { itBook } from './it/book';
import { deBook } from './de/book';
import { esBook } from './es/book';
import { frBook } from './fr/book';
import { ptPTBook } from './pt-PT/book';

/** Books rendered by `scripts/build-help.mjs`, in menu order. */
export const BOOKS: HelpBook[] = [itBook, enBook, frBook, esBook, deBook, ptPTBook];

export const bookFor = (locale: string): HelpBook | undefined =>
  BOOKS.find(book => book.locale === locale);
