# Stato esecuzione — piano di chiusura del gap procedurale

**Ultimo aggiornamento**: 2026-11-02 (piano v2.2)
**Piano di riferimento**: [`2026-11-02-gap-procedure-piano.md`](2026-11-02-gap-procedure-piano.md)
**Baseline documentale**: `main` @ `746b558` (piano v2.0), aggiornato a v2.2
**Stato**: piano approvato, protocollo di checkpoint definito, implementazione non iniziata
**Prossima ondata**: W0 — Fondazioni condivise e retrofit reference test

---

## 1. Regola d’uso (vincolante)

Questo documento è la **fonte di ripresa** dopo una compattazione del contesto.

Va aggiornato **sempre**:

1. alla fine di ogni checkpoint;
2. **prima** di ogni compattazione;
3. prima di cambiare famiglia, fondazione o sessione;
4. dopo un commit che cambia lo stato del piano.

Se il contesto viene compattato senza che questo file sia aggiornato, la
ripresa è da considerarsi non valida.

Non duplicare qui il piano: riportare stato, commit, test, decisioni e prossimi
passi; per il resto rimandare alle sezioni del piano.

---

## 2. Stato sintetico

| Voce | Valore |
|---|---|
| Ondata corrente | W0 — Fondazioni e retrofit |
| Branch/worktree | da creare: `feat/gap-wave-1` / worktree `gap-wave-1` |
| Ultimo commit di codice | nessuno |
| Ultimo commit documentale | `746b558` (piano v2.0); in corso commit v2.2 |
| Test | non eseguiti dopo l’ultimo commit; ultimo `npm run check` noto verde su `1042c61` |
| Item chiusi | 0 / 73 |
| Nuove voci | 0 / 36 |
| Estensioni | 0 / 37 |
| Reference baseline | 27 / 35 procedure statistiche; W0-09 deve portare a 35 / 35 |
| Blocchi | nessuno |
| Prossimo gate | G0 — fine W0 (toolkit + 8/8 retrofit reference) |

---

## 3. Dashboard ondate

| Ondata | Scope | Metodi | Nuove voci | Stato | Gate |
|---|---|---:|---:|---|---|
| W0 | Fondazioni condivise + retrofit | — | — | non iniziata | G0 |
| W1 | Descriptive + test di base | 14 | 2 | non iniziata | G1 |
| W2 | ANOVA/GLMM + Regressione nucleo | 12 | 5 | non iniziata | G2 |
| W3 | Regressione avanzata | 7 | 7 | non iniziata | G3 |
| W4 | Categorical + MI categorica | 5 | 1 | non iniziata | G4 |
| W5 | Multivariate avanzata | 8 | 7 | non iniziata | G5 |
| W6 | Survival e affidabilità | 8 | 4 | non iniziata | G6 |
| W7 | Time series | 7 | 3 | non iniziata | G7 |
| W8 | Quality/DOE/power restanti | 5 | 0 | non iniziata | G8 |
| W9 | Survey + ML + Advanced | 7 | 7 | non iniziata | G9 |

---

## 4. Dashboard famiglie

| Famiglia | Chiusi | Totale | Stato |
|---|---:|---:|---|
| Descriptive | 0 | 8 | non iniziata |
| Compare groups | 0 | 11 | non iniziata |
| Regression | 0 | 15 | non iniziata |
| Multivariate | 0 | 8 | non iniziata |
| Categorical | 0 | 4 | non iniziata |
| Survival | 0 | 8 | non iniziata |
| Time series | 0 | 7 | non iniziata |
| Design & power | 0 | 4 | non iniziata |
| Missing data | 0 | 2 | non iniziata |
| Machine Learning | 0 | 3 | non iniziata |
| Advanced & Bayesian | 0 | 3 | non iniziata |
| **Totale** | **0** | **73** |  |

---

## 5. Ondata corrente — W0

Obiettivo: toolkit numerico, reference harness, sample generator, i18n/help
scaffolding, data shape adapters, performance guards e retrofit dei reference
test sulle 8 procedure esistenti scoperte.

| Task | Descrizione | Stato |
|---|---|---|
| W0-01 | `kernels/optimize.ts` (Newton, BFGS, IRLS, EM) | da fare |
| W0-02 | `kernels/glm.ts` (famiglie, link, devianza) | da fare |
| W0-03 | estensioni matrici (SVD, Cholesky, QR, pinv) | da fare |
| W0-04 | reference harness R + fixture + tolleranze | da fare |
| W0-05 | estensione `samples/generate.R` e manifest | da fare |
| W0-06 | i18n/help scaffolding per le nuove famiglie | da fare |
| W0-07 | data shape adapters (long/wide, start-stop, matrici, testo) | da fare |
| W0-08 | performance guards e limiti | da fare |
| W0-09 | retrofit reference test per TOST, Quality, Cluster, Discriminant, Partition, DOE, MI, Resampling | da fare |
| G0 | gate: test toolkit, reference dimostrativa, sample test, 8/8 retrofit | da fare |

### Prossimi 3 passi

1. Aprire worktree `gap-wave-1` e branch `feat/gap-wave-1`.
2. Implementare W0-01 con test su funzioni note e reference R.
3. Avviare W0-09: i primi due retrofit (TOST, Quality) e D-01 frequenze.

---

## 6. Registro checkpoint

| Data | Checkpoint | Commit | Test | Esito | Note |
|---|---|---|---|---|---|
| 2026-11-02 | Piano approvato | `746b558` | docs only | verde | Creato piano v2.0 e protocollo |
| 2026-11-02 | Piano v2.2 + W0-09 | `in corso` | docs only | verde | Aggiunto retrofit reference test per 8 procedure |

> A ogni checkpoint aggiungere una riga. Non cancellare le righe precedenti.

---

## 7. Handoff per la prossima compattazione

Compilare **prima** di compattare. Se un campo non si applica, scrivere “n/d”.

```md
## Handoff — YYYY-MM-DD / W?

- Ondata:
- Branch/worktree:
- Ultimo commit:
- Item chiusi (ID):
- Item in corso (ID):
- Item bloccati (ID + motivo):
- Test eseguiti e risultato:
- File/moduli toccati:
- Decisioni prese / deviazioni dal piano:
- Prossimi 3 passi:
  1.
  2.
  3.
- Domande aperte:
- Rischi attivi:
```

### Riassunto di 10 righe

1. Ondata e obiettivo:
2. Cosa è chiuso:
3. Cosa è in corso:
4. Cosa è bloccato:
5. Ultimo commit:
6. Test:
7. Decisioni:
8. Prossimi 3 passi:
9. Domande:
10. Rischi:

---

## 8. Decisioni attive

Rimandare al piano §3. Decisioni già prese:

- D1: estendere una procedura esistente prima di creare una nuova voce.
- D2: ogni voce nuova rispetta il contratto di `ARCHITECTURE.md`.
- D3: kernel puri, test unitari e reference test.
- D4: modalità multiple con un solo form e default invariati.
- D5: procedure heavy nel worker.
- D6: riuso dei `ChartKind` esistenti.
- D7: help e i18n in 6 lingue sono parte della DoD.
- D8: dataset di esempio nei 5 formati.
- D9: rilascio a ondate, niente feature flag.
- D10: nessun bump di `PROJECT_VERSION` per campi opzionali.

---

## 9. Domande aperte

Nessuna al momento.

---

## 10. Cosa non fare

- Non compattare a metà di una modifica senza WIP commit.
- Non compattare con test rossi senza dichiararlo.
- Non dichiarare chiuso un item senza il gate di ondata.
- Non aggiornare i conteggi globali (36→72) prima di G1.
- Non duplicare il piano in questo file: rimandare alle sezioni.
