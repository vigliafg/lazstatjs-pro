# Errori MCP

I tool di esecuzione restituiscono `isError: true` con `structuredContent` che contiene `code`, `kind`, `stage`, `message`, `details`, `retryable` e, quando disponibile, `diagnostics`. Un rifiuto non produce `resultId` e non entra nella cache.

| Codice | Causa tipica | Recupero |
| --- | --- | --- |
| `E_ARGS` | Sorgenti multiple, argomento mancante, id sconosciuto, CI non valida | Rileggi schema/help e fornisci esattamente una sorgente |
| `E_ANALYSIS` | Analisi sconosciuta o `assistant` | Usa un id di `list_analyses` |
| `E_PARAMS` | Colonna sconosciuta/ambigua, tipo errato, ruolo mancante | `inspect_dataset` + `describe_analysis`, poi correggi `params`/`set` |
| `E_DATA` | File mancante, path fuori root, symlink, formato o dimensione non validi | Correggi path/formato e rispetta i limiti |
| `E_RUN` | Il runner ha rifiutato dati o parametri | Leggi diagnostica e messaggio, correggi, riesegui |
| `E_INTERNAL` | Errore inatteso | Riprova una volta; se persiste riporta messaggio e stage |
| `E_TIMEOUT` | Superato `timeoutMs` | Aumenta il timeout o riduci il dataset |
| `E_CANCELLED` | Richiesta cancellata dal client | Ripeti solo se serve ancora |
| `E_BUSY` | 4 run attivi e coda da 16 piena | Attendi e riprova |
| `E_RESULT_EXPIRED` | `resultId` scaduto o inesistente | Riesegui l'analisi |

Per i dettagli sui parametri vedi [`guida-agente.md`](guida-agente.md); per i limiti numerici [`riferimento.md`](riferimento.md).
