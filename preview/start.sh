#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

NODE_BIN="$(command -v node || true)"
if [[ ! -x "$NODE_BIN" ]]; then
    echo "Node.js is required to build the preview." >&2
    exit 1
fi

"$NODE_BIN" preview/build.mjs --watch &
build_pid=$!
trap 'kill "$build_pid" 2>/dev/null || true' EXIT INT TERM

while [[ ! -f preview/dist/preview.js ]]; do sleep 0.2; done
echo "Open http://127.0.0.1:8765/"
python3 -m http.server 8765 --bind 127.0.0.1 --directory preview/dist
