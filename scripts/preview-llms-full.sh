#!/usr/bin/env bash
# Dev-only preview helper for /llms-full.txt.
#
# Background:
#   `static/llms-full.txt` was deleted in Phase C of the llms-full rollout
#   (PR #622) and must NEVER be reintroduced — the auto-generated
#   `build/llms-full.txt` is the sole source of truth. But because
#   `build/llms-full.txt` lives outside Zola's serve roots, the URL
#   `/llms-full.txt` returns 404 against `zola serve` in local dev.
#
#   This script lets a developer inspect the exact bytes that will be
#   uploaded to S3 on the next deploy without round-tripping through CI.
#
# Usage:
#   scripts/preview-llms-full.sh           # generate + show stats + first 60 lines
#   scripts/preview-llms-full.sh --full    # generate + cat the full file
#   scripts/preview-llms-full.sh --diff    # generate + diff against the last copy
#
# See infra/llms/README.md for full architecture and runbook.

set -euo pipefail
cd "$(dirname "$0")/.."

OUT="build/llms-full.txt"
PREV="build/llms-full.prev.txt"
MODE="${1:-stats}"

if [[ -f "$OUT" ]]; then
  cp "$OUT" "$PREV"
fi

node infra/llms/build-llms-full.mjs

if [[ ! -f "$OUT" ]]; then
  echo "ERROR: generator did not produce $OUT" >&2
  exit 1
fi

bytes=$(wc -c < "$OUT")
lines=$(wc -l < "$OUT")
# Portable sha256 — GNU coreutils provides sha256sum; macOS / BSD provides
# `shasum -a 256` instead. Fall back if either is missing.
if command -v sha256sum >/dev/null 2>&1; then
  sha=$(sha256sum "$OUT" | awk '{print $1}')
elif command -v shasum >/dev/null 2>&1; then
  sha=$(shasum -a 256 "$OUT" | awk '{print $1}')
else
  sha="(no sha256 binary found)"
fi

echo
echo "Generated: $OUT"
echo "Size:      ${bytes} bytes"
echo "Lines:     ${lines}"
echo "sha256:    ${sha}"
echo
echo "On deploy this file is uploaded to S3 as /llms-full.txt"
echo "with cache-control max-age=3600, stale-while-revalidate=86400."
echo

case "$MODE" in
  --full)
    echo "--- full output ---"
    cat "$OUT"
    ;;
  --diff)
    if [[ -f "$PREV" ]]; then
      echo "--- diff vs previous run ---"
      diff -u "$PREV" "$OUT" || true
    else
      echo "(no previous build/llms-full.txt to diff against)"
    fi
    ;;
  *)
    echo "--- first 60 lines (use --full to see everything, --diff to compare) ---"
    head -60 "$OUT"
    ;;
esac
