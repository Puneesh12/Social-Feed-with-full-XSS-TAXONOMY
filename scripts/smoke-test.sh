#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Smoke test: brings the stack up in the current BUILD_MODE and checks that the
# reflected sink behaves as expected for that mode.
#   vulnerable -> the raw <script> is present in /search output
#   defended   -> it is HTML-encoded (&lt;script&gt;)
# Usage:  ./scripts/smoke-test.sh
# -----------------------------------------------------------------------------
set -euo pipefail
BASE="${BASE:-http://localhost:8080}"
MODE="$(curl -fsS "$BASE/api/config" | grep -o '"mode":"[a-z]*"' | cut -d'"' -f4)"
echo "Detected BUILD_MODE=$MODE"

PAYLOAD='<script>alert(1)</script>'
ENC='%3Cscript%3Ealert(1)%3C%2Fscript%3E'
OUT="$(curl -fsS "$BASE/search?q=$ENC")"

if echo "$OUT" | grep -qF '<script>alert(1)</script>'; then
  REFLECTED="raw"
else
  REFLECTED="encoded"
fi
echo "Reflected search output is: $REFLECTED"

if [ "$MODE" = "vulnerable" ] && [ "$REFLECTED" = "raw" ]; then
  echo "PASS: vulnerable build reflects raw markup (as expected)."
elif [ "$MODE" = "defended" ] && [ "$REFLECTED" = "encoded" ]; then
  echo "PASS: defended build encodes the reflected query (as expected)."
else
  echo "FAIL: mode=$MODE but reflection=$REFLECTED"; exit 1
fi
