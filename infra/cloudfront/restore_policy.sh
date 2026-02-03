#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

POLICY_ID="${POLICY_ID:-521afb15-34af-416e-980a-f5bf48c8f71e}" # CloudFront policy UUID
POLICY_FILE="${1:-${SCRIPT_DIR}/csp-policy-v0.json}"

if [[ ! -f "${POLICY_FILE}" ]]; then
  echo "error: policy file not found: ${POLICY_FILE}" >&2
  exit 2
fi

ETAG=$(aws cloudfront get-response-headers-policy \
  --id "${POLICY_ID}" \
  --query ETag --output text)

aws cloudfront update-response-headers-policy \
  --id "${POLICY_ID}" \
  --if-match "${ETAG}" \
  --response-headers-policy-config "file://${POLICY_FILE}"

echo "Restored CloudFront response headers policy ${POLICY_ID} from ${POLICY_FILE}"

