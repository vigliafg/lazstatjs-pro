# 03 — Ruoli, parametri e Form

**Cosa copre.** Il contratto che permette a 72 procedure diverse di usare lo
stesso modello di selezione delle colonne e di salvataggio dei parametri.

## Ruoli di colonna

Ogni procedura dichiara i ruoli che le servono (`src/analyses/roles.ts` e i
moduli `rolesW5.ts`, `rolesW7.ts` per le ondate più recenti). Un ruolo ha una
chiave stabile, un'etichetta localizzata e un tipo:

- `continuous`: variabile numerica che entra in un calcolo;
- `group`: variabile categoriale che definisce gruppi o classi;
- `any`: accetta entrambe, perché la procedura decide in base al tipo.

Le funzioni condivise sono poche e sono il punto di verità:
`analysisRoles(id)` elenca i ruoli, `roleStates(id, params)` restituisce lo
stato corrente, `assignRole(id, params, key, column)` assegna una colonna,
`validateRoleTypes` rifiuta gli accoppiamenti incompatibili. Un parametro
opzionale vale `-1` quando non è assegnato.

Alcune procedure hanno ruoli derivati: in SEM, per esempio, ogni indicatore
appartiene a un fattore e il gruppo deve restare coerente con la selezione.
La derivazione appartiene al setter del ruolo, non al form.

## Parametri

I parametri di tutte le procedure vivono in `src/io/project/types.ts`, con i
valori iniziali in `DEFAULT_PARAMS`. `parseParams(value, width)` è l'unico
punto che normalizza un oggetto grezzo (da file di progetto o da un manifest):
applica i tipi, limita gli indici alla larghezza del dataset, riempie i campi
mancanti e ricalcola i campi derivati. Un parametro che arriva da fuori non
entra mai nel motore senza passare di qui.

`remapParams` (`src/analyses/params.ts`) riscrive i riferimenti dopo
un'operazione strutturale sulla griglia: gli id stabili delle colonne evitano
che un'analisi punti a un'altra variabile, e i ruoli non più validi diventano
`-1` con un avviso.

## Form

Ogni procedura ha il suo `Form.tsx` nella propria cartella, composto con i
controlli condivisi di `AnalysisOptions.tsx`. Il form non calcola nulla: legge
e scrive parametri, valida i tipi e mostra le etichette tradotte. I preset
salvano una combinazione di parametri con un nome, così un'analisi ricorrente
si riapre con un clic.

## La regola

Se una nuova procedura deve comportarsi come le altre, si aggiungono una
voce nel registro, i ruoli, il tipo di parametri e il form. Non si duplica la
logica di selezione, di rimappatura o di salvataggio.

**Cosa non copre.** Il calcolo e le tabelle: [04](04-motore-e-tabelle.md). I
rifiuti a runtime: [08](08-validazione-e-guardrail.md).

**Fonti nel codice.** `src/analyses/roles.ts`, `rolesW5.ts`, `rolesW7.ts`,
`src/analyses/params.ts`, `src/io/project/types.ts`,
`src/io/project/parse.ts`, `src/ui/analysis/`.

**Vedi anche.** [`docs/FORMS-AUDIT.md`](../FORMS-AUDIT.md).
