#!/bin/sh
# Picks the vulnerable or defended edge config based on BUILD_MODE, then lets
# the stock nginx entrypoint continue. Runs from /docker-entrypoint.d/.
set -e
MODE="${BUILD_MODE:-vulnerable}"
if [ "$MODE" = "defended" ]; then
  cp /etc/nginx/templates/defended.conf /etc/nginx/conf.d/default.conf
else
  cp /etc/nginx/templates/vulnerable.conf /etc/nginx/conf.d/default.conf
fi
echo "[nginx] edge config selected for BUILD_MODE=$MODE"
