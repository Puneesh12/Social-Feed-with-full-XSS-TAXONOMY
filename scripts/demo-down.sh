#!/usr/bin/env bash
# Stop both presentation stacks (vulnerable + defended).
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose -p chirp_vuln down
docker compose -p chirp_def down
echo "Both demo stacks stopped."
