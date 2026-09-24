#!/usr/bin/env bash
# =============================================================================
# Presentation mode: run BOTH builds at once, side by side.
#   VULNERABLE -> http://localhost:8080   (attacker collector 127.0.0.1:9000)
#   DEFENDED   -> http://localhost:8081   (attacker collector 127.0.0.1:9001)
#
# Each build is a fully isolated Docker Compose project (its own db/redis/network
# and image), so the two never interfere. Usage:  ./scripts/demo-up.sh
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

wait_up () { # $1 = url
  for _ in $(seq 1 40); do curl -fsS --max-time 3 "$1/api/config" >/dev/null 2>&1 && return 0; sleep 2; done
  echo "  (timed out waiting for $1)"; return 1
}

echo "==> Building & starting VULNERABLE build on http://localhost:8080 ..."
BUILD_MODE=vulnerable VITE_BUILD_MODE=vulnerable WEB_PORT=8080 COLLECTOR_PORT=9000 \
  docker compose -p chirp_vuln up -d --build

echo "==> Building & starting DEFENDED build on http://localhost:8081 ..."
BUILD_MODE=defended VITE_BUILD_MODE=defended WEB_PORT=8081 COLLECTOR_PORT=9001 \
  docker compose -p chirp_def up -d --build

echo "==> Waiting for both APIs, then seeding demo data ..."
wait_up http://localhost:8080 && docker compose -p chirp_vuln exec -T api node src/seed.js >/dev/null 2>&1 || true
wait_up http://localhost:8081 && docker compose -p chirp_def exec -T api node src/seed.js >/dev/null 2>&1 || true

echo ""
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │  VULNERABLE  ->  http://localhost:8080                    │"
echo "  │  DEFENDED    ->  http://localhost:8081                    │"
echo "  │  Logins: alice/password123 · admin/admin12345            │"
echo "  └─────────────────────────────────────────────────────────┘"
echo "  Open both in two browser windows for a side-by-side demo."
echo "  Stop everything with:  ./scripts/demo-down.sh"
