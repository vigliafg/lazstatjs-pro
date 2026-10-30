#!/usr/bin/env bash
#
# start.sh — avvia LazStats JS in locale (server di sviluppo Vite).
#
# Uso:
#   ./start.sh                 # avvia su http://localhost:3000 e apre il browser
#   ./start.sh --port 5173     # porta personalizzata
#   ./start.sh --no-open       # non aprire il browser
#   ./start.sh --help
#
# Variabili d'ambiente equivalenti: PORT, NO_OPEN=1.
#
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

PORT="${PORT:-3000}"
OPEN_BROWSER=1

print_help() {
  sed -n '2,12p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--port)
      if [[ -z "${2:-}" ]]; then
        echo "Errore: --port richiede un valore." >&2
        exit 1
      fi
      PORT="$2"
      shift 2
      ;;
    --port=*)
      PORT="${1#*=}"
      shift
      ;;
    --no-open)
      OPEN_BROWSER=0
      shift
      ;;
    -h|--help)
      print_help
      exit 0
      ;;
    *)
      echo "Opzione non riconosciuta: $1 (usa --help)" >&2
      exit 1
      ;;
  esac
done

if [[ "${NO_OPEN:-0}" == "1" ]]; then
  OPEN_BROWSER=0
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Errore: Node.js non trovato nel PATH." >&2
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "Errore: npm non trovato nel PATH." >&2
  exit 1
fi

# Installa le dipendenze solo se mancano (primo avvio o node_modules cancellato).
if [[ ! -d node_modules ]]; then
  echo "node_modules assente: eseguo npm install..."
  npm install
fi

VITE_ARGS=(--port "$PORT")
if [[ "$OPEN_BROWSER" == "1" ]]; then
  VITE_ARGS+=(--open)
fi

echo "Avvio LazStats JS su http://localhost:${PORT} (Ctrl+C per fermare)..."
exec npm run dev -- "${VITE_ARGS[@]}"
