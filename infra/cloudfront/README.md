# CloudFront security headers

- **csp-policy-v1.json** — canonical policy (CSP + HSTS + nosniff + referrer-policy + permissions-policy).  
- **csp-policy-v0.json** — baseline snapshot of the CSP before automation changes (for easy rollback).  
- **generate_policy.py** — regenerates the CSP `script-src` hash allowlist from `public/**/*.html`.  
- **update_policy.sh**   — regenerates CSP hashes, merges in existing CloudFront `script-src` hashes, then idempotently pushes (fetches current ETag first).
- **restore_policy.sh**  — restores the CloudFront policy from a specific JSON file (defaults to `csp-policy-v0.json`).

## Refresh workflow
1. Build the site so `public/` is current (same as deploy): `zola build`  
2. `./update_policy.sh`  
3. `aws cloudfront create-invalidation --distribution-id E2TEEM88QINCGT --paths "/*"`

## Rollback workflow
- Restore the pre-automation policy: `./restore_policy.sh ./csp-policy-v0.json`
