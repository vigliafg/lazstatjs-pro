/**
 * Shape of `samples/manifest.json` and a dependency-free validator.
 *
 * The JSON Schema in `samples/manifest.schema.json` documents the same
 * contract for external tools; this module is what the test suite enforces so
 * a regenerated manifest cannot drift silently.
 */

export interface SampleExample {
  analysis: string;
  columns: Record<string, string | string[]>;
  options?: Record<string, string | number | boolean>;
}

export interface SampleDataset {
  id: string;
  title: string;
  family: string;
  dir: string;
  source: string;
  rows: number;
  columns: string[];
  formats: string[];
  procedures: string[];
  examples: SampleExample[];
  notes: string;
}

export interface SampleManifest {
  version: number;
  generatedBy: string;
  formats: string[];
  datasets: SampleDataset[];
}

const FORMATS = ['csv', 'sav', 'dta', 'xlsx', 'json'] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === 'string');

const isExample = (value: unknown): value is SampleExample => {
  if (!isRecord(value)) return false;
  if (typeof value.analysis !== 'string' || value.analysis.length === 0) return false;
  if (!isRecord(value.columns) || Object.keys(value.columns).length === 0) return false;
  for (const column of Object.values(value.columns)) {
    const ok =
      (typeof column === 'string' && column.length > 0) ||
      (isStringArray(column) && column.length > 0);
    if (!ok) return false;
  }
  if (value.options !== undefined) {
    if (!isRecord(value.options)) return false;
    for (const option of Object.values(value.options)) {
      const type = typeof option;
      if (type !== 'string' && type !== 'number' && type !== 'boolean') return false;
    }
  }
  return true;
};

const isDataset = (value: unknown): value is SampleDataset => {
  if (!isRecord(value)) return false;
  const strings = ['id', 'title', 'family', 'dir', 'source', 'notes'] as const;
  if (strings.some(key => typeof value[key] !== 'string')) return false;
  if (typeof value.rows !== 'number' || !Number.isInteger(value.rows) || value.rows <= 0) return false;
  if (!isStringArray(value.columns) || value.columns.length === 0) return false;
  if (!isStringArray(value.formats) || value.formats.length === 0) return false;
  if (!isStringArray(value.procedures) || value.procedures.length === 0) return false;
  if (!Array.isArray(value.examples) || value.examples.length === 0) return false;
  return value.examples.every(isExample);
};

/**
 * Returns a list of human-readable problems. An empty list means the manifest
 * satisfies `samples/manifest.schema.json` and the cross-field invariants.
 */
export const validateSampleManifest = (value: unknown): string[] => {
  const errors: string[] = [];
  if (!isRecord(value)) return ['manifest: expected an object'];
  if (value.version !== 1) errors.push(`manifest: version must be 1`);
  if (value.generatedBy !== 'samples/generate.R') {
    errors.push('manifest: generatedBy must be "samples/generate.R"');
  }
  if (!isStringArray(value.formats) || value.formats.length !== FORMATS.length) {
    errors.push('manifest: formats must list the five output formats');
  } else if (value.formats.some((format, index) => format !== FORMATS[index])) {
    errors.push(`manifest: formats must be ${FORMATS.join(', ')}`);
  }
  if (!Array.isArray(value.datasets) || value.datasets.length === 0) {
    errors.push('manifest: datasets must be a non-empty array');
    return errors;
  }

  const ids = new Set<string>();
  for (const [index, entry] of value.datasets.entries()) {
    if (!isDataset(entry)) {
      errors.push(`datasets[${index}]: invalid dataset shape`);
      continue;
    }
    const label = entry.id || `datasets[${index}]`;
    if (ids.has(entry.id)) errors.push(`${label}: duplicate id`);
    ids.add(entry.id);
    if (entry.dir !== `${entry.family}/${entry.id}`) {
      errors.push(`${label}: dir must be <family>/<id>`);
    }
    if (new Set(entry.columns).size !== entry.columns.length) {
      errors.push(`${label}: duplicate columns`);
    }
    if (new Set(entry.procedures).size !== entry.procedures.length) {
      errors.push(`${label}: duplicate procedures`);
    }
    for (const example of entry.examples) {
      if (!entry.procedures.includes(example.analysis)) {
        errors.push(`${label}: example refers to undeclared procedure ${example.analysis}`);
      }
      for (const column of Object.values(example.columns).flat()) {
        if (!entry.columns.includes(column)) {
          errors.push(`${label}: example refers to unknown column ${column}`);
        }
      }
    }
  }
  return errors;
};
