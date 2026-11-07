# Guida a LazStats Pro

LazStats Pro è un'applicazione di analisi statistica che gira interamente nel
browser (ed è impacchettata anche come applicazione desktop Electron). Il
percorso tipico è sempre lo stesso: **dati → scelta della procedura → parametri
→ calcolo → tabelle, report e grafici → editor del grafico → sessione**.

Questa cartella spiega i blocchi di funzionalità uno per uno. Non sostituisce
`ARCHITECTURE.md`, che descrive gli strati del codice e le regole di
dipendenza: la guida dice *cosa fa l'app e perché*, l'architettura dice *dove
sta e cosa può importare*.

English: [en/README.md](en/README.md)

## La catena, in una riga per passo

```
dataset tipizzato        src/grid, src/io        → 01
libreria delle analisi   src/analyses/registry   → 02
ruoli e parametri        src/analyses/roles*     → 03
motore e tabelle         src/stats/kernels|tables→ 04
report del run           src/stats/reports       → 05
grafici della procedura  src/charts              → 06
editor del grafico       src/charts/features     → 07
rifiuti e guardrail      src/analyses/params     → 08
lingue e guida in-app    src/help, src/i18n      → 09
confronto con JMP/SPSS/R docs/analysis           → 10
```

## Indice

| # | Documento | In una frase |
|---|-----------|--------------|
| 01 | [Dati e Data Editor](01-dati-e-data-editor.md) | Griglia tipizzata, livelli, mancanti, formule, import ed export. |
| 02 | [Libreria e scelta dell'analisi](02-libreria-e-scelta-analisi.md) | Le 72 procedure, come si trovano e come si avviano. |
| 03 | [Ruoli, parametri e Form](03-ruoli-parametri-e-form.md) | Il contratto che rende ogni procedura una funzione delle stesse parti. |
| 04 | [Motore e tabelle](04-motore-e-tabelle.md) | Numeri, tabelle e struttura di un risultato. |
| 05 | [Report, run-report e session-report](05-report-e-session-report.md) | La prosa del risultato e la sua lingua. |
| 06 | [Grafici delle procedure](06-grafici-delle-procedure.md) | I 32 tipi di grafico e la mappa procedura → grafici. |
| 07 | [Chart editor](07-chart-editor.md) | Cosa si può cambiare di un grafico e cosa no. |
| 08 | [Validazione e guardrail](08-validazione-e-guardrail.md) | Tre livelli di controllo e la regola "mai output vuoto". |
| 09 | [Lingue, help e terminologia](09-lingue-help-e-terminologia.md) | Sei locale, 83 pagine per libro, audit della prosa. |
| 10 | [Confronto con la statistica classica](10-confronto-con-la-statistica-classica.md) | Cosa coincide con JMP, SPSS e R e cosa no. |

## Terminologia vincolante

Due parole hanno un significato preciso in tutto il progetto (lo impone
`AGENTS.md`):

- **run-report**: l'output di *una singola* procedura, cioè un blocco con
  tabelle, prosa e grafici.
- **session-report**: l'insieme ordinato dei run-report presenti nella finestra
  Output della sessione.

Non sono sinonimi e non vanno usati in modo intercambiabile.

## I numeri dell'app

Sono i riferimenti da citare, non da ricopiare in ogni documento:

- 72 procedure statistiche (`src/analyses/registry.ts`).
- 32 tipi di grafico (`CHART_KINDS` in `src/stats/charts.ts`).
- 6 locale: `en` (sorgente), `it`, `fr`, `es`, `de`, `pt-PT`; la prosa dei
  report parte da `it` come locale predefinita.
- 83 pagine di guida per libro, 83 × 6 = 498 pagine generate.
- 52 dataset di esempio in `samples/`, ognuno in 5 formati (CSV, SPSS, Stata,
  Excel, JSON).

## Come si mantiene questa guida

Ogni documento ha la stessa intestazione: **Cosa copre**, **Cosa non copre**
(con il link al documento giusto), **Fonti nel codice**, **Vedi anche**. Le
date e gli audit in `docs/plans/` e `docs/analysis/` restano come prove e
approfondimenti: la guida li cita, non li riscrive.

Se un numero cambia (procedure, grafici, pagine, dataset) si aggiorna qui e si
lascia che gli altri documenti lo citino per riferimento. I link relativi
devono restare validi: sono file del repository, non URL esterni.

## Sviluppo e rilascio

- Strati e regole di dipendenza: [`ARCHITECTURE.md`](../../ARCHITECTURE.md).
- Stato del progetto e backlog: [`docs/PROJECT-STATUS.md`](../PROJECT-STATUS.md).
- Gate di qualità: `npm run check` esegue `tsc --noEmit`, l'intera suite
  (`node --test`) e `npm run guard` (dependency-cruiser, madge, dimensione
  file). `npm run help:build` rigenera i sei libri di guida e
  `npm run help:audit` controlla contaminazione linguistica e parità.
- Rilascio 0.30.0: gate verde, `help:build` e `help:audit` rieseguiti,
  pacchetti Electron costruiti, note di rilascio allineate ai documenti 01–10.
