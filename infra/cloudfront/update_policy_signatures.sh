#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"

POLICY_ID_SIGNATURES="${POLICY_ID_SIGNATURES:?POLICY_ID_SIGNATURES is required}"

# Refresh signature-page CSP hashes from the current build output before pushing the policy.
# Requires `public/` to be up to date (run `zola build` first).
# NOTE: Do NOT merge old hashes from CloudFront - use only current build hashes to prevent accumulation.
cd "$REPO_ROOT"
python3 "${SCRIPT_DIR}/generate_policy.py" --mode signatures

ETAG=$(aws cloudfront get-response-headers-policy \
        --id "$POLICY_ID_SIGNATURES" \
        --query ETag --output text)

aws cloudfront update-response-headers-policy \
  --id "$POLICY_ID_SIGNATURES" \
  --if-match "$ETAG" \
  --response-headers-policy-config "file://${SCRIPT_DIR}/csp-policy-signatures-v1.json"
