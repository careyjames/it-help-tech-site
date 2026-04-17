#!/usr/bin/env bash
# Post-merge setup for IT Help San Diego corp site.
#
# This is a static Zola site — no DB migrations, no package manager state to
# reconcile (zola comes from Nix, pinned in .replit). The only useful local
# post-merge check is to confirm the merged tree still builds cleanly, so a
# bad shortcode/template/anchor surfaces in Replit immediately rather than
# only in CI.
#
# Idempotent. Non-interactive. Fail-fast.

set -euo pipefail

echo "post-merge: verifying zola build…"
zola build
echo "post-merge: build OK"
