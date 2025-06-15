# CloudFront security headers

- **csp-policy-v1.json** — canonical allow-list CSP, HSTS, nosniff.  
- **update_policy.sh**   — idempotent push (fetches current ETag first).

## Refresh workflow
1. Edit `csp-policy-v1.json` (bump to v2 if breaking changes).  
2. `./update_policy.sh`  
3. `aws cloudfront create-invalidation --distribution-id E2TEEM88QINCGT --paths "/*"`
