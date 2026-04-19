#!/usr/bin/env python3
"""
Google Indexing API submission script for the IT Help San Diego Zola site.

Endpoint: POST https://indexing.googleapis.com/v3/urlNotifications:publish
Spec:     https://developers.google.com/search/apis/indexing-api/v3/using-api

Diff-driven via the SAME shared collector that drives IndexNow
(infra/indexing/urlset.py). If you fix a URL bug there, both notifiers
automatically pick it up — they can never drift apart.

Auth model: keyless OIDC via Workload Identity Federation.
  * The deploy.yml job runs google-github-actions/auth which exchanges
    the GitHub-issued OIDC token for a short-lived Google access token
    and writes it to $GOOGLE_OAUTH_ACCESS_TOKEN (and to GOOGLE_APPLICATION
    _CREDENTIALS / GCLOUD_OAUTH_ACCESS_TOKEN for compatibility).
  * This script only consumes the access token; it never sees a service-
    account key. No JSON keys exist in this project — the org policy
    iam.disableServiceAccountKeyCreation is enforced.
  * If $GOOGLE_OAUTH_ACCESS_TOKEN is unset (preflight skipped, fork PR,
    var unset), the script writes a clear skip-summary and exits 0.

Failure mode (mirrors IndexNow):
  * Network failures, non-2xx responses, missing token — log a warning
    and exit 0. Caller wraps in continue-on-error and isolates from the
    audit gate, so this script can never fail the deploy.

Quota & safety:
  * Google's published quota is 200 requests/project/day. Our typical
    push is < 10 URLs; we still cap at MAX_URLS_PER_RUN as a defensive
    cap against runaway diffs (e.g. a mass content reformat).
  * Per-URL POST (no bulk endpoint). We submit serially with a short
    timeout each.

Note on API scope:
  * Google officially scopes urlNotifications:publish to JobPosting and
    BroadcastEvent schemas. The endpoint accepts any URL on the verified
    Search Console property, but Google may decline to act on URLs
    outside the official scope. We submit anyway as a legitimate
    crawl-hint and treat any non-200 as a warning, not a failure. The
    sitemap (always live) remains the canonical discovery surface.

Usage:
  submit.py BEFORE_SHA AFTER_SHA HOST [--dry-run]
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

# Add infra/ to sys.path so 'from indexing import urlset' works regardless
# of where the script is invoked from.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from indexing import urlset  # noqa: E402

INDEXING_ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish"
MAX_URLS_PER_RUN = 50  # Hard cap; quota is 200/day project-wide.


def submit_one(token: str, notification: urlset.Notification) -> tuple[int, str]:
    """
    POST a single URL notification. Returns (http_status, body_excerpt).
    Network errors return (0, error_message).
    """
    payload = {"url": notification.url, "type": notification.type}
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        INDEXING_ENDPOINT,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": f"Bearer {token}",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")[:300]
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")[:300]
    except urllib.error.URLError as e:
        return 0, f"network error: {e}"


def write_summary(
    notifications: list[urlset.Notification],
    results: list[tuple[int, str]],
    summary_path: str,
    skipped_reason: str = "",
) -> None:
    """Write a GitHub Actions step-summary block."""
    if not summary_path:
        return
    try:
        with open(summary_path, "a", encoding="utf-8") as fh:
            fh.write("## Google Indexing API\n\n")
            if skipped_reason:
                fh.write(f"Skipped: {skipped_reason}\n")
                return
            if not notifications:
                fh.write("No content changes — no notifications submitted.\n")
                return
            ok_count = sum(1 for s, _ in results if 200 <= s < 300)
            fh.write(f"- Notifications submitted: **{len(notifications)}**\n")
            fh.write(f"- 2xx responses: **{ok_count}/{len(results)}**\n\n")
            fh.write("| Type | URL | Status |\n")
            fh.write("|---|---|---|\n")
            for n, (status, _body) in zip(notifications, results):
                fh.write(f"| `{n.type}` | {n.url} | {status} |\n")
    except OSError as e:
        print(f"Could not write step summary: {e}", file=sys.stderr)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Submit changed URLs to the Google Indexing API."
    )
    parser.add_argument("before", help="BEFORE git ref (or zero-SHA)")
    parser.add_argument("after", help="AFTER git ref")
    parser.add_argument("host", help="Site host, e.g. www.it-help.tech")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Compute notifications but do not POST.",
    )
    args = parser.parse_args()
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY", "")

    token = os.environ.get("GOOGLE_OAUTH_ACCESS_TOKEN", "").strip()
    if not args.dry_run and not token:
        # Defensive: workflow preflight should already have skipped us, but
        # if the auth step succeeded without exporting the token (or if a
        # contributor invokes this locally without auth), fail soft.
        print(
            "GOOGLE_OAUTH_ACCESS_TOKEN not set; skipping Google Indexing.",
            file=sys.stderr,
        )
        write_summary([], [], summary_path, "GOOGLE_OAUTH_ACCESS_TOKEN unset")
        return 0

    before = urlset.resolve_before(args.before, args.after)
    notifications: list[urlset.Notification]
    if not before:
        # Force-push or first-push-to-branch: send conservative fallback
        # (homepage + sitemap.xml as URL_UPDATED) instead of silent no-op.
        print(
            "No reachable prior commit; using fallback (homepage + sitemap).",
            file=sys.stderr,
        )
        notifications = urlset.fallback_notifications(args.host)
    else:
        notifications = urlset.collect_notifications(before, args.after, args.host)

    print(f"Computed {len(notifications)} notification(s).", file=sys.stderr)
    for n in notifications:
        print(f"  [{n.type}] {n.url}", file=sys.stderr)

    if not notifications:
        write_summary([], [], summary_path)
        return 0

    if len(notifications) > MAX_URLS_PER_RUN:
        print(
            f"::warning::Capping {len(notifications)} notifications to "
            f"{MAX_URLS_PER_RUN} (defensive quota guard).",
            file=sys.stderr,
        )
        notifications = notifications[:MAX_URLS_PER_RUN]

    if args.dry_run:
        print("--dry-run: not posting to Google.", file=sys.stderr)
        # Synthesize 0-status results for summary rendering.
        write_summary(
            notifications,
            [(0, "dry-run") for _ in notifications],
            summary_path,
        )
        return 0

    results: list[tuple[int, str]] = []
    for n in notifications:
        status, body = submit_one(token, n)
        results.append((status, body))
        if 200 <= status < 300:
            print(f"  ok  [{n.type}] {n.url} -> {status}", file=sys.stderr)
        else:
            print(
                f"  warn [{n.type}] {n.url} -> {status}: {body}",
                file=sys.stderr,
            )

    ok_count = sum(1 for s, _ in results if 200 <= s < 300)
    write_summary(notifications, results, summary_path)

    if ok_count < len(results):
        print(
            f"::warning::Google Indexing: {ok_count}/{len(results)} 2xx. "
            "Best-effort; deploy is unaffected.",
            file=sys.stderr,
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
