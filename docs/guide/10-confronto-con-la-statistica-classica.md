# 10 — Confronto con la statistica classica

**Cosa copre.** Come l'app si posiziona rispetto a JMP, SPSS e R, e come si
documenta il confronto senza promettere parità che non c'è.

## Il metodo

Il confronto non si fa a memoria: si prende lo stesso dataset, si esegue la
stessa procedura nei due programmi e si confrontano le tabelle voce per voce e
i grafici tipo per tipo. I risultati sono documentati in `docs/analysis/`:

- `2026-11-05-confronto-tabelle-jmp-tutte-le-procedure.md` — inventario delle
  tabelle per tutte le procedure;
- `2026-11-05-confronto-tabelle-jmp-regressione.md` — dettaglio del modello
  lineare;
- `2026-11-02-confronto-grafici-jmp.md` — grafici a confronto;
- `2026-10-30-confronto-grafici-programmi.md` — confronto allargato agli altri
  programmi.

## Cosa coincide

Le statistiche di base (medie, intervalli, test, ANOVA, regressione, survivals)
seguono le convenzioni classiche: stesse quantità, stessi gradi di libertà,
stesse formule di intervallo. I nomi delle procedure sono quelli attesi da chi
viene da JMP o SPSS, e la guida in-app spiega quando usarle e quando no.

## Cosa differisce

- La prosa è scritta per essere letta, non per replicare le frasi del
  programma di riferimento.
- Alcuni default sono diversi (livello di confidenza, gestione dei mancanti,
  modello non lineare predefinito): sono scelte dichiarate, non sorprese.
- Alcune procedure hanno un perimetro più stretto o più largo del programma
  classico, e il documento di confronto lo dice esplicitamente.

## La regola

Un confronto si pubblica solo se è stato misurato. Se una procedura non è
ancora confrontata, lo si scrive; non si lascia intendere una parità
verificata. Questo documento serve anche alle note di rilascio: ciò che è
cambiato nel confronto è ciò che l'utente deve sapere.

**Cosa non copre.** I dettagli delle singole procedure: la guida in-app
([09](09-lingue-help-e-terminologia.md)) e i documenti di `docs/analysis/`.

**Fonti nel codice e nei documenti.** `docs/analysis/`, `samples/`, la guida
in-app `src/help/content/`.

**Vedi anche.** [`docs/ADVANCED-ROADMAP.md`](../ADVANCED-ROADMAP.md).
