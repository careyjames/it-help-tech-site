#!/usr/bin/env python3
"""
IndexNow submission script for the IT Help San Diego Zola site.

Spec: https://www.indexnow.org/documentation
IETF draft: draft-indexnow-protocol

Diff-driven: compares two git refs (BEFORE..AFTER) and submits only the
canonical URLs whose markdown source actually changed in that range. URL
collection is delegated to infra/indexing/urlset.py — the single source
of truth shared with the Google Indexing notifier so both notifiers can
never drift out of sync.

NOT emitted (deliberate): /tags/, /categories/, /tags/<slug>/,
/categories/<slug>/. config.toml declares both taxonomies but this Zola
site has no taxonomy templates, so those URLs return 404 in production.
See PROJECT_EVOLUTION_LOG.md 2026-04-19 entry for the deletion rationale.

Failure mode:
  * Network failures, non-2xx responses, malformed payloads — all log a
    warning to stderr and exit 0. Caller (deploy.yml) wraps the job in
    continue-on-error and isolates it from the audit gate's needs chain,
    so this script can never fail the deploy or regress the 98/A+/120
    Lighthouse + Mozilla Observatory thresholds.

Usage:
  submit.py BEFORE_SHA AFTER_SHA HOST KEY [--dry-run]
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

INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow"


def submit(host: str, key: str, urls: list[str]) -> int:
    """
    POST the URL list to IndexNow. Returns the HTTP status code, or 0 on
    network failure. Caller decides how to react (we always treat
    non-2xx as a warning, never a failure).
    """
    payload = {
        "host": host,
        "key": key,
        "keyLocation": f"https://{host}/{key}.txt",
        "urlList": urls,
    }
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        INDEXNOW_ENDPOINT,
        data=body,
        method="POST",
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            status = resp.status
            resp_body = resp.read().decode("utf-8", errors="replace")
            print(f"IndexNow response body: {resp_body}", file=sys.stderr)
            return status
    except urllib.error.HTTPError as e:
        resp_body = e.read().decode("utf-8", errors="replace")
        print(f"IndexNow HTTP error {e.code}: {resp_body}", file=sys.stderr)
        return e.code
    except urllib.error.URLError as e:
        print(f"IndexNow network error: {e}", file=sys.stderr)
        return 0


def write_summary(urls: list[str], status: int, summary_path: str) -> None:
    """Write a GitHub Actions step-summary block."""
    if not summary_path:
        return
    try:
        with open(summary_path, "a", encoding="utf-8") as fh:
            fh.write("## IndexNow\n\n")
            if not urls:
                fh.write("No content changes — no ping submitted.\n")
                return
            fh.write(f"- URLs submitted: **{len(urls)}**\n")
            fh.write(f"- HTTP status: **{status}**\n\n")
            fh.write("```\n")
            for u in urls:
                fh.write(f"{u}\n")
            fh.write("```\n")
    except OSError as e:
        print(f"Could not write step summary: {e}", file=sys.stderr)


def main() -> int:
    parser = argparse.ArgumentParser(description="Submit changed URLs to IndexNow.")
    parser.add_argument("before", help="BEFORE git ref (or zero-SHA)")
    parser.add_argument("after", help="AFTER git ref")
    parser.add_argument("host", help="Site host, e.g. www.it-help.tech")
    parser.add_argument("key", help="IndexNow verification key")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Compute URLs but do not POST.",
    )
    args = parser.parse_args()

    before = urlset.resolve_before(args.before, args.after)
    if not before:
        print("No prior commit available; skipping IndexNow ping.", file=sys.stderr)
        write_summary([], 0, os.environ.get("GITHUB_STEP_SUMMARY", ""))
        return 0

    notifications = urlset.collect_notifications(before, args.after, args.host)
    # IndexNow's wire format does not distinguish update vs delete; pinging
    # a removed URL signals the engine to recheck (and find a 404 / redirect).
    urls = [n.url for n in notifications]
    print(f"Computed {len(urls)} URL(s) to submit.", file=sys.stderr)
    for u in urls:
        print(f"  {u}", file=sys.stderr)

    if not urls:
        write_summary([], 0, os.environ.get("GITHUB_STEP_SUMMARY", ""))
        return 0

    if args.dry_run:
        print("--dry-run: not posting to IndexNow.", file=sys.stderr)
        write_summary(urls, 0, os.environ.get("GITHUB_STEP_SUMMARY", ""))
        return 0

    status = submit(args.host, args.key, urls)
    print(f"IndexNow HTTP status: {status}", file=sys.stderr)
    write_summary(urls, status, os.environ.get("GITHUB_STEP_SUMMARY", ""))

    if status not in (200, 202):
        print(
            f"::warning::IndexNow returned HTTP {status} (non-2xx). "
            "Ping was best-effort; deploy is unaffected.",
            file=sys.stderr,
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
