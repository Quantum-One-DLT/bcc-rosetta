#!/usr/bin/env bash

set -euo pipefail
BCC_DB_SYNC_EXE=$1

# Workaround for: https://github.com/The-Blockchain-Company/bcc-db-sync/issues/433
sleep 5;
$BCC_DB_SYNC_EXE \
  --config /config/bcc-db-sync/config.json \
  --schema-dir /bcc-db-sync/schema/ \
  --socket-path /ipc/node.socket \
  --state-dir /data/db-sync