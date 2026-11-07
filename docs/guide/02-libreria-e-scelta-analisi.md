# 02 — Libreria e scelta dell'analisi

**Cosa copre.** Come si trova la procedura giusta e cosa succede dal clic su
"Esegui" fino alla card del risultato.

## Indice

- [Il catalogo](#il-catalogo)
- [Dal clic al risultato](#dal-clic-al-risultato)
- [Calcolo immediato o su richiesta](#calcolo-immediato-o-su-richiesta)
- [La card](#la-card)
- [Punti di forza](#punti-di-forza)

## Il catalogo

Le procedure disponibili sono 72 e vivono in un elenco unico: ognuna ha un
nome, una famiglia di appartenenza e un'identità interna stabile. Il nome può
cambiare, l'identità no: parametri salvati, report, grafici e guida in-app
continuano a riconoscere la stessa procedura anche dopo un cambio di etichetta.

La libreria si apre a schede e permette di cercare per nome e descrizione, di
salvare i preferiti e di riprendere le procedure usate di recente. Ogni voce
dice subito cosa serve — dati oppure solo parametri — e porta al form già
compilato con i valori predefiniti della procedura.

## Dal clic al risultato

1. L'utente sceglie la procedura e il form mostra i ruoli richiesti e i
   parametri correnti.
2. Prima di calcolare, l'app controlla i riferimenti alle colonne: se un ruolo
   punta a una colonna sparita o di tipo incompatibile, il run si ferma e
   chiede di riselezionare la variabile.
3. La procedura viene caricata solo quando serve, così l'avvio dell'app resta
   rapido anche con 72 procedure disponibili.
4. Le procedure pesanti girano in un processo separato, con avanzamento visibile
   e possibilità di annullare; quelle veloci girano subito.
5. Il risultato è sempre una delle due cose: un esito con titolo, tabelle,
   prosa, grafici e avvisi, oppure un motivo leggibile che spiega perché non è
   stato possibile calcolare.

## Calcolo immediato o su richiesta

Le procedure veloci possono aggiornarsi mentre si cambiano i parametri, e
l'app decide quando è sicuro farlo. Le procedure pesanti e i dataset grandi
restano manuali: il pulsante Esegui è l'unico punto di partenza, quindi non
parte nulla di inatteso mentre l'utente sta ancora scegliendo.

## La card

La card del run-report raccoglie intestazione, eventuali avvisi sulla qualità
dei dati, tabelle, prosa e grafici nell'ordine scelto dalla procedura. Un run
rifiutato mostra soltanto il motivo: mai una card vuota, mai una card a metà.

## Punti di forza

- **Trovare la procedura giusta costa poco.** Ricerca, preferiti e recenti
  riconoscono che il primo ostacolo non è il calcolo, ma capire da dove
  cominciare.
- **Dietro, un'unica struttura per 72 procedure.** Ruoli, parametri e form
  seguono le stesse regole, quindi imparare a usare un'analisi significa saper
  usare anche le altre.
- **Pensata per ogni livello.** Chi conosce poco la statistica cerca il problema
  da risolvere e trova una descrizione in parole; chi la conosce cerca il nome
  esatto e arriva al form già pronto.

**Cosa non copre.** Il significato dei singoli parametri e dei ruoli: vedi
[03 — Ruoli, parametri e Form](03-ruoli-parametri-e-form.md). La struttura
del risultato: [04 — Motore e tabelle](04-motore-e-tabelle.md).

**Fonti nel codice.** `src/analyses/registry.ts`, `src/analyses/runners.ts`,
`src/analyses/worker/`, `src/ui/analysis/` (`AnalysisLibrary.tsx`,
`AnalysisForm.tsx`, `RunControl.tsx`), `src/hooks/useAnalysisRun.ts`,
`src/ui/analysis/liveGate.ts`, `src/ui/analysis/favorites.ts`.

**Vedi anche.** [`docs/FORMS-AUDIT.md`](../FORMS-AUDIT.md),
[`docs/PROCEDURES-CHARTS-AUDIT.md`](../PROCEDURES-CHARTS-AUDIT.md).
