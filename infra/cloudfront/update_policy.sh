#!/usr/bin/env bash
set -euo pipefail
POLICY_ID=521afb15-34af-416e-980a-f5bf48c8f71e     # CloudFront policy UUID
ETAG=$(aws cloudfront get-response-headers-policy \
        --id "$POLICY_ID" \
        --query ETag --output text)

aws cloudfront update-response-headers-policy \
  --id "$POLICY_ID" \
  --if-match "$ETAG" \
  --response-headers-policy-config file://csp-policy-v1.json
