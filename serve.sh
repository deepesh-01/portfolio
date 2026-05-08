#!/usr/bin/env bash
# serve.sh — local static server for the BMAD (Boring Markdown) portfolio.
#
# Contract: serve the current directory over HTTP on port 4173 so a
# Cloudflare Tunnel pointed at http://localhost:4173 can publish the site.
#
# Why 4173: matches Vite's preview default, so an existing tunnel that the
# author had pointed at a Vite preview can be reused without reconfiguration.
#
# Usage:
#   ./serve.sh                # defaults to port 4173
#   PORT=8080 ./serve.sh      # override
#
# Requires: python3 (ships with macOS and most Linux distros).

set -euo pipefail

PORT="${PORT:-4173}"
ROOT="$(cd "$(dirname "$0")" && pwd)"

cd "$ROOT"

echo "BMAD :: serving $ROOT on http://localhost:${PORT}"
echo "BMAD :: ctrl-c to stop"
exec python3 -m http.server "$PORT" --bind 127.0.0.1
