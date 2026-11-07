# 09 — Lingue, help e terminologia

**Cosa copre.** Le sei lingue dell'app, la guida in-app e le regole di
scrittura che tengono allineate interfaccia, report e documentazione.

## Le lingue

`ACTIVE_LOCALES` in `src/i18n/locales.ts` elenca `en`, `it`, `fr`, `es`, `de`,
`pt-PT`. L'inglese è la sorgente della guida; il report ha una locale
predefinita propria (`it`) indipendente da quella dell'interfaccia. Una nuova
lingua si aggiunge entrando in questo elenco e fornendo catalogo e guida.

## La guida in-app

La guida è contenuto statico diviso per procedura: 83 pagine per libro. Ogni
pagina racconta quando usare la procedura, quando no, i passi, le assunzioni,
come leggere le tabelle, i grafici prodotti, le insidie e un glossario.

La costruzione è una pipeline:

1. i moduli di contenuto per locale (`src/help/content/`) definiscono le
   pagine;
2. `npm run help:build` (`scripts/build-help.mjs`) genera i sei libri
   (83 × 6 = 498 pagine);
3. `scripts/check-locale.mjs` verifica che ogni locale sia completo e coerente;
4. `npm run help:audit` (`scripts/help-audit.mts`) misura la contaminazione
   linguistica del libro inglese e la parità strutturale delle traduzioni.

## Tradurre senza rompere i termini

Le traduzioni passano da `scripts/translate-copy.py` (Google e Microsoft, con
fallback). I termini tecnici non si traducono a orecchio: dopo la traduzione
si normalizzano i token (`ndc`, `%GRR`, `Steel–Dwass`, `Cramér–von Mises`) e si
verifica che i grafici citati esistano davvero nella pagina.

## Terminologia

- **run-report** e **session-report** hanno il significato fissato in
  `AGENTS.md` e non sono sinonimi.
- Le etichette dei ruoli sono localizzate tramite chiavi condivise: cambiare
  una parola in una lingua non deve cambiare il significato del ruolo.
- Il glossario comune è in [`docs/glossary/glossary.md`](../glossary/glossary.md).

**Cosa non copre.** Il confronto con altri programmi:
[10](10-confronto-con-la-statistica-classica.md).

**Fonti nel codice.** `src/i18n/`, `src/help/content/`,
`src/stats/reportCopy/`, `scripts/translate-copy.py`,
`scripts/build-help.mjs`, `scripts/check-locale.mjs`, `scripts/help-audit.mts`.

**Vedi anche.**
[`docs/plans/2026-10-29-multilingua-e-manuale.md`](../plans/2026-10-29-multilingua-e-manuale.md).
