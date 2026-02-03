#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"

POLICY_ID="${POLICY_ID:-521afb15-34af-416e-980a-f5bf48c8f71e}" # CloudFront policy UUID

# Refresh CSP hashes from the current build output before pushing the policy.
# Requires `public/` to be up to date (run `zola build` first, or rely on CI build output).
cd "$REPO_ROOT"
aws cloudfront get-response-headers-policy \
  --id "$POLICY_ID" \
  --query "ResponseHeadersPolicy.ResponseHeadersPolicyConfig.SecurityHeadersConfig.ContentSecurityPolicy.ContentSecurityPolicy" \
  --output text | python3 "${SCRIPT_DIR}/generate_policy.py" --mode site --merge-hashes-from-stdin

ETAG=$(aws cloudfront get-response-headers-policy \
        --id "$POLICY_ID" \
        --query ETag --output text)

aws cloudfront update-response-headers-policy \
  --id "$POLICY_ID" \
  --if-match "$ETAG" \
  --response-headers-policy-config "file://${SCRIPT_DIR}/csp-policy-v1.json"
