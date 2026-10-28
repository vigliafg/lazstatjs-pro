/**
 * Helper per i golden test di contratto.
 *
 * Congela l'output dei builder (`TableSpec[]`) in file JSON versionati, così
 * un refactor che cambia i numeri fallisce invece di passare inosservato.
 *
 * Rigenerazione voluta: `UPDATE_GOLDEN=1 npm test`.
 */
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const goldenDir = join(here, 'golden');

/** Numeri non finiti e -0 non sono JSON: li rendiamo espliciti e stabili. */
const normalize = (value: unknown): unknown => {
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return 'NaN';
    if (!Number.isFinite(value)) return value > 0 ? 'Infinity' : '-Infinity';
    if (Object.is(value, -0)) return '-0';
    // 12 cifre significative: assorbe le differenze di ultimo bit tra runtime,
    // senza nascondere un cambio di risultato statistico.
    return Number(value.toPrecision(12));
  }
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, normalize(item)])
    );
  }
  return value;
};

const serialize = (value: unknown): string => `${JSON.stringify(normalize(value), null, 2)}\n`;

/**
 * Confronta `value` con `golden/<name>.json`.
 * Con `UPDATE_GOLDEN=1` riscrive il file (solo dopo aver verificato a mano il diff).
 */
export const expectGolden = (name: string, value: unknown): void => {
  const file = join(goldenDir, `${name}.json`);
  const actual = serialize(value);

  if (process.env.UPDATE_GOLDEN === '1') {
    mkdirSync(goldenDir, { recursive: true });
    writeFileSync(file, actual);
    console.warn(`golden aggiornato: ${name}.json`);
    return;
  }

  if (!existsSync(file)) {
    assert.fail(
      `golden/${name}.json mancante: crealo con UPDATE_GOLDEN=1 npm test e verifica il contenuto`
    );
  }

  assert.equal(
    actual,
    readFileSync(file, 'utf8'),
    `golden/${name}.json non corrisponde: se il cambiamento è voluto, rigenera con UPDATE_GOLDEN=1 e spiegalo nel commit`
  );
};
