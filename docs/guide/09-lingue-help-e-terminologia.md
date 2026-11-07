# 09 — Lingue, help e terminologia

**Cosa copre.** Le sei lingue dell'app, la guida disponibile dentro il programma
e le regole di scrittura che tengono allineati interfaccia, report e
documentazione.

## Indice

- [Le lingue](#le-lingue)
- [La guida in-app](#la-guida-in-app)
- [Tradurre senza rompere i termini](#tradurre-senza-rompere-i-termini)
- [Terminologia](#terminologia)
- [Punti di forza](#punti-di-forza)

## Le lingue

Le lingue attive sono sei: inglese, italiano, francese, spagnolo, tedesco e
portoghese europeo. L'inglese è la sorgente della guida; il report ha una lingua
predefinita propria, indipendente da quella dell'interfaccia. Aggiungere una
lingua significa entrare in questo elenco e fornire catalogo e guida: il resto
dell'app non va toccato.

## La guida in-app

La guida è contenuto statico organizzato per procedura: 83 pagine per libro, 498
pagine in tutto. Ogni pagina racconta quando usare la procedura e quando no, i
passi da seguire, le assunzioni, come leggere le tabelle, quali grafici
arrivano, le insidie più comuni e un glossario dei termini che compaiono.

La costruzione è una catena controllata:

1. i contenuti per lingua definiscono le pagine;
2. un comando genera i sei libri;
3. un controllo verifica che ogni lingua sia completa e coerente;
4. un audit misura la contaminazione linguistica del libro inglese e la parità
   strutturale delle traduzioni.

## Tradurre senza rompere i termini

Le traduzioni passano da uno strumento automatico con due servizi in cascata. I
termini tecnici non si traducono a orecchio: dopo la traduzione i nomi
ricorrenti vengono riportati alla forma corretta, e si verifica che i grafici
citati in una pagina esistano davvero in quella pagina. Una traduzione non può
introdurre un grafico che non c'è né perdere un passaggio.

## Terminologia

- **run-report** e **session-report** hanno un significato fissato e non sono
  sinonimi: il primo è il risultato di un run, il secondo è l'insieme ordinato
  dei run-report di una sessione.
- Le etichette dei ruoli sono tradotte tramite chiavi condivise: cambiare una
  parola in una lingua non deve cambiare il significato del ruolo.
- Il glossario comune raccoglie i termini condivisi da guida, report e
  interfaccia.

## Punti di forza

- **Sei lingue senza sei programmi diversi.** Interfaccia, report e guida
  seguono le stesse chiavi e gli stessi controlli: una correzione si fa una
  volta e vale ovunque.
- **L'idea è separare i testi dai codici.** Il programma usa identificativi
  stabili, le persone leggono etichette tradotte: la lingua diventa un livello
  sostituibile, non una parte del calcolo.
- **Capire non richiede di sapere l'inglese.** Ogni procedura ha la propria
  pagina nella lingua scelta, con glossario e insidie; chi è esperto può
  cambiare la lingua del solo report per consegnare il risultato nella lingua
  del destinatario.

**Cosa non copre.** Il confronto con altri programmi:
[10](10-confronto-con-la-statistica-classica.md).

**Fonti nel codice.** `src/i18n/`, `src/help/content/`, `src/stats/reportCopy/`,
`scripts/translate-copy.py`, `scripts/build-help.mjs`,
`scripts/check-locale.mjs`, `scripts/help-audit.mts`.

**Vedi anche.**
[`docs/plans/2026-10-29-multilingua-e-manuale.md`](../plans/2026-10-29-multilingua-e-manuale.md)
