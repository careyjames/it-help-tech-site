#!/usr/bin/env python3
"""
IndexNow submission script for the IT Help San Diego Zola site.

Spec: https://www.indexnow.org/documentation
IETF draft: draft-indexnow-protocol

Diff-driven: compares two git refs (BEFORE..AFTER) and submits only the
canonical URLs whose markdown source actually changed in that range. This
is the single architectural reason the integration cannot become spammy:
unchanged URLs are never re-submitted.

Coverage rules (post architect-review on PR #589, taxonomy emission
removed 2026-04-19 per whole-repo health check — see
PROJECT_EVOLUTION_LOG.md entry):
  * Page URLs for added/modified pages (drafts filtered out).
  * Old page URLs for deleted/renamed pages (signals removal/redirect to
    participating engines so stale entries clear faster).
  * Parent section URL for any changed page (e.g. content/field-notes/foo.md
    also pings /field-notes/ because the section's listing page changed).
  * Pathspec uses git's :(glob) magic prefix so top-level files like
    content/_index.md and content/about.md are caught. (Default git
    pathspec semantics do NOT treat ** specially.)

NOT emitted (deliberate): /tags/, /categories/, /tags/<slug>/,
/categories/<slug>/. config.toml declares both taxonomies but this Zola
site has no taxonomy templates (templates/taxonomy_list.html and
templates/taxonomy_single.html do not exist), so those URLs return 404
in production. Pinging 404 URLs would burn search-engine crawl budget
and signal noise. If we ever add taxonomy browse pages, restore the
slugify() / read_taxonomy_names() helpers and the emission paths from
git history (commit before this change).

Failure mode:
  * Network failures, non-2xx responses, malformed payloads — all log a
    warning to stderr and exit 0. Caller (deploy.yml) wraps the job in
    continue-on-error and isolates it from the audit gate's needs chain,
    so this script can never fail the deploy or regress the 98/A+/120
    Lighthouse + Mozilla Observatory thresholds.

Usage:
  submit.py BEFORE_SHA AFTER_SHA HOST KEY [--dry-run]
"""

import argparse
import json
import os
import re
import subprocess
import sys
import urllib.request
import urllib.error

INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow"
ZERO_SHA = "0000000000000000000000000000000000000000"


def run_git(*args: str) -> str:
    """Run a git command and return stdout. Raises CalledProcessError on failure."""
    result = subprocess.run(
        ["git", *args],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout


def parse_frontmatter(text: str) -> dict:
    """
    Return a dict containing whatever we care about from the frontmatter:
    * draft (bool)

    Supports both Zola's TOML frontmatter (delimited by +++) and YAML
    (delimited by ---). Minimal parser; we only look at known keys, not
    arbitrary structure. Taxonomy parsing was removed 2026-04-19 along
    with taxonomy URL emission — see module docstring.
    """
    out: dict = {"draft": False}
    if not text:
        return out

    # Locate frontmatter block.
    lines = text.splitlines()
    if not lines:
        return out
    first = lines[0].strip()
    if first not in ("+++", "---"):
        return out
    delim = first
    end = None
    for i in range(1, len(lines)):
        if lines[i].strip() == delim:
            end = i
            break
    if end is None:
        return out
    fm = lines[1:end]
    fm_text = "\n".join(fm)

    # draft = true | draft: true
    if re.search(r"(?im)^\s*draft\s*[:=]\s*true\b", fm_text):
        out["draft"] = True
    return out


def file_at_ref(ref: str, path: str) -> str | None:
    """Return the contents of `path` at git `ref`, or None if it didn't exist."""
    try:
        result = subprocess.run(
            ["git", "show", f"{ref}:{path}"],
            check=True,
            capture_output=True,
            text=True,
        )
        return result.stdout
    except subprocess.CalledProcessError:
        return None


def path_to_url_path(rel: str) -> str:
    """
    Map a content/-relative markdown path (without leading 'content/' and
    without trailing '.md') to its canonical URL path component.

    Zola routing:
      _index           -> /
      <section>        -> /<section>/
      <section>/_index -> /<section>/
      <section>/<slug> -> /<section>/<slug>/
    """
    if rel == "_index":
        return "/"
    if rel.endswith("/_index"):
        return "/" + rel[: -len("/_index")] + "/"
    return "/" + rel + "/"


def parent_section_url(url_path: str) -> str | None:
    """
    Given a page URL path like '/field-notes/foo/', return the parent
    section URL '/field-notes/'. Return None for the homepage (/).
    The site root is treated as having no parent.
    """
    if url_path == "/":
        return None
    # Strip trailing slash, take everything up through the last '/'.
    trimmed = url_path.rstrip("/")
    if "/" not in trimmed:
        return "/"
    parent = trimmed.rsplit("/", 1)[0] + "/"
    return parent if parent else "/"


def changed_files(before: str, after: str) -> list[tuple[str, str, str | None]]:
    """
    Return a list of (status, path, old_path_for_renames) for changed
    files in the BEFORE..AFTER range, restricted to content/**/*.md
    (recursively, including top-level via :(glob) pathspec).

    --diff-filter=AMDR catches Adds, Modifications, Deletes, Renames so
    we can signal removed and moved pages too (architect MAJOR finding).
    """
    raw = run_git(
        "diff",
        "--name-status",
        "--diff-filter=AMDR",
        before,
        after,
        "--",
        ":(glob)content/**/*.md",
    )
    out: list[tuple[str, str, str | None]] = []
    for line in raw.splitlines():
        parts = line.split("\t")
        if not parts:
            continue
        status_raw = parts[0]
        # Rename status comes through as e.g. "R97" (similarity score).
        status = status_raw[0]
        if status == "R" and len(parts) >= 3:
            old_path, new_path = parts[1], parts[2]
            out.append(("R", new_path, old_path))
        elif len(parts) >= 2:
            out.append((status, parts[1], None))
    return out


def url_for_page(host: str, path: str) -> str:
    if not path.startswith("content/"):
        return ""
    rel = path[len("content/") :]
    if rel.endswith(".md"):
        rel = rel[: -3]
    return f"https://{host}{path_to_url_path(rel)}"


def collect_urls(
    before: str,
    after: str,
    host: str,
) -> list[str]:
    """
    Walk the diff and produce a deduplicated, ordered list of URLs to
    submit. See module docstring for coverage rules.
    """
    urls: list[str] = []
    seen: set[str] = set()

    def add(u: str) -> None:
        if u and u not in seen:
            seen.add(u)
            urls.append(u)

    diffs = changed_files(before, after)
    if not diffs:
        return urls

    for status, path, old_path in diffs:
        # 1) Page URL for the AFTER side (added/modified/renamed-to).
        if status in ("A", "M", "R"):
            after_text = file_at_ref(after, path)
            if after_text is None:
                # File missing at AFTER (race) — skip.
                continue
            fm_after = parse_frontmatter(after_text)
            if fm_after["draft"]:
                print(f"SKIP draft: {path}", file=sys.stderr)
            else:
                page_url = url_for_page(host, path)
                add(page_url)
                # Parent section URL — listing changed.
                parent = parent_section_url(
                    "/" + page_url[len(f"https://{host}/") :]
                )
                if parent:
                    add(f"https://{host}{parent}")

        # 2) Old page URL for deletes/renames-from.
        if status == "D" or (status == "R" and old_path):
            removed_path = path if status == "D" else old_path
            assert removed_path is not None
            removed_url = url_for_page(host, removed_path)
            add(removed_url)
            parent = parent_section_url(
                "/" + removed_url[len(f"https://{host}/") :]
            )
            if parent:
                add(f"https://{host}{parent}")

    return urls


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
        print(
            f"IndexNow HTTP error {e.code}: {resp_body}", file=sys.stderr
        )
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


def resolve_before(before: str, after: str) -> str | None:
    """Handle the zero-SHA case for first-push-to-branch."""
    if before and before != ZERO_SHA:
        return before
    try:
        return run_git("rev-parse", f"{after}^").strip()
    except subprocess.CalledProcessError:
        return None


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

    before = resolve_before(args.before, args.after)
    if not before:
        print("No prior commit available; skipping IndexNow ping.", file=sys.stderr)
        write_summary([], 0, os.environ.get("GITHUB_STEP_SUMMARY", ""))
        return 0

    urls = collect_urls(before, args.after, args.host)
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
        # Use GitHub Actions warning annotation; do NOT fail.
        print(
            f"::warning::IndexNow returned HTTP {status} (non-2xx). "
            "Ping was best-effort; deploy is unaffected.",
            file=sys.stderr,
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
