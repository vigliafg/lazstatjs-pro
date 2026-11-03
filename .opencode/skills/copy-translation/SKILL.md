---
name: Copy translation
description: Translate report/table/chart copy and other JSON text maps with the free Google/Microsoft endpoint chain, preserving placeholders and catalog keys.
---

# Copy translation

Use this skill when a locale catalog, help page or JSON text map must be
translated without an API key, or when a Google endpoint returns HTTP 429.

## The endpoint chain

`scripts/translate-copy.py` tries, in order:

1. `translate.googleapis.com/translate_a/single` with `client=dict-chrome-ex`
   (the endpoint used by the Chrome translation extension; it survives most
   429s that hit the legacy `gtx` client);
2. `translate-pa.googleapis.com/v1/translate` with the public browser key;
3. the legacy `gtx` client;
4. `edge.microsoft.com/translate/translatetext` as the last resort.

All four are free and keyless. The script keeps `{placeholders}` and returns the
source text when every endpoint fails, so a batch never loses keys.

## Generic JSON map

From the repository root:

```bash
python scripts/translate-copy.py --from en --to de \
  --input /tmp/copy.json --output /tmp/copy.de.json
```

The input can be a JSON object (`{ "source": "translation" }`) or an array of
strings. Values are translated, keys are kept. Use `--batch-size` and
`--keep-identical` when a strict placeholder fallback is preferred.

## Report-copy wave workflow

1. Extract the English wave maps that are not yet translated in the target
   locale. The catalogs live in `src/stats/reportCopy/catalog/en/w6.ts` …
   `w9.ts`; the locale catalogs live beside them.
2. Build a JSON object of the missing keys, translate it, and write a
   `src/stats/reportCopy/catalog/<locale>/wN.ts` file:

```ts
export const w6Copy: Record<string, string> = {
  'Italian source sentence': 'Localized sentence',
};
```

3. Chart titles and notes are merged by `src/stats/reportCopy/catalog/charts.ts`.
   Put the missing chart keys in `src/stats/reportCopy/catalog/<locale>/charts-extra.ts`
   as `extraChartCopy`; the chart catalog merges it after the English fallback
   and before the older `charts-l4.ts` overrides.
4. Run the guards:

```bash
node --import tsx --test src/stats/reportCopy.test.ts
for l in it en de fr es pt-PT; do node --import tsx scripts/check-locale.mjs "$l"; done
```

The first test rejects missing English copy, placeholder drift and orphan keys;
the locale check rejects missing keys, missing help pages and incomplete report
sentences.

## Rules

- Never translate a placeholder name (`{s1}`, `{s2}`): the script protects them,
  but review the output if a sentence has many placeholders.
- Keep acronyms and method names (`ANOVA`, `AIC`, `R²`, `Rhat`, `HDI`, `LDA`,
  `SAR`, `MaxDiff`) untranslated or in their conventional local form.
- Table labels and report prose are separate messages: translate the value, not
  the Italian key.
- A translation that is identical to English is acceptable only for acronyms,
  formulas and proper names; otherwise it means the endpoint failed and the
  entry needs a retry.
