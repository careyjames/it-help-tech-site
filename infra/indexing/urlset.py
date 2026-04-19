"""
Shared URL-diff logic consumed by both indexing notifiers (IndexNow,
Google Indexing API).

Single source of truth for what URLs change in a given BEFORE..AFTER
git range. If you fix a URL bug here, both notifiers pick it up
automatically. If two notifiers diverged, that would be a quiet
correctness bug — search engines would receive different URL sets.

Coverage rules (mirror IndexNow script's docstring; identical semantics):
  * Page URLs for added/modified pages (drafts filtered out).
  * Old page URLs for deleted/renamed pages (signals removal/redirect).
  * Parent section URL for any changed page (the listing page changed).
  * Pathspec uses git's :(glob) magic prefix so top-level files like
    content/_index.md and content/about.md are caught.

NOT emitted (deliberate): /tags/, /categories/, /tags/<slug>/,
/categories/<slug>/. config.toml declares both taxonomies but this Zola
site has no taxonomy templates, so those URLs return 404 in production.
See PROJECT_EVOLUTION_LOG.md 2026-04-19 entry for the deletion rationale.

Notification semantics:
  * URL_UPDATED — Added (A), Modified (M), or Renamed-to (R after-side).
  * URL_DELETED — Deleted (D), or Renamed-from (R before-side).

IndexNow's wire format does not distinguish update vs delete (it just
takes a URL list); the IndexNow caller flattens .url. Google's Indexing
API requires the explicit type — that's the whole reason this module
emits typed Notification records instead of bare strings.
"""

from __future__ import annotations

import re
import subprocess
import sys
from dataclasses import dataclass
from typing import Literal

ZERO_SHA = "0000000000000000000000000000000000000000"

NotificationType = Literal["URL_UPDATED", "URL_DELETED"]


@dataclass(frozen=True)
class Notification:
    url: str
    type: NotificationType


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
    arbitrary structure.
    """
    out: dict = {"draft": False}
    if not text:
        return out

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
    fm_text = "\n".join(lines[1:end])

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
    """
    if url_path == "/":
        return None
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
    we can signal removed and moved pages too.
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


def resolve_before(before: str, after: str) -> str | None:
    """Handle the zero-SHA / unreachable-SHA case (force-push, first-push)."""
    if before and before != ZERO_SHA:
        # Verify the SHA is reachable in current history (force-push guard).
        try:
            run_git("cat-file", "-e", f"{before}^{{commit}}")
            return before
        except subprocess.CalledProcessError:
            return None
    try:
        return run_git("rev-parse", f"{after}^").strip()
    except subprocess.CalledProcessError:
        return None


def fallback_notifications(host: str) -> list[Notification]:
    """
    Conservative fallback when the BEFORE SHA is missing/unreachable
    (force-push, branch reset). Two URLs only — homepage + sitemap —
    enough to trigger a re-crawl without spamming.
    """
    return [
        Notification(url=f"https://{host}/", type="URL_UPDATED"),
        Notification(url=f"https://{host}/sitemap.xml", type="URL_UPDATED"),
    ]


def collect_notifications(
    before: str,
    after: str,
    host: str,
) -> list[Notification]:
    """
    Walk the diff and produce a deduplicated, ordered list of typed
    Notifications. See module docstring for coverage rules and type
    semantics.

    Returns [] if the diff is empty. Caller decides whether empty
    means "skip ping" (IndexNow) or "use fallback" (Google after
    resolving an unreachable SHA upstream).
    """
    seen: set[str] = set()
    out: list[Notification] = []

    def add(url: str, ntype: NotificationType) -> None:
        if url and url not in seen:
            seen.add(url)
            out.append(Notification(url=url, type=ntype))

    diffs = changed_files(before, after)
    if not diffs:
        return out

    for status, path, old_path in diffs:
        # 1) AFTER-side URLs for adds/mods/renames-to.
        if status in ("A", "M", "R"):
            after_text = file_at_ref(after, path)
            if after_text is None:
                continue
            fm_after = parse_frontmatter(after_text)
            if fm_after["draft"]:
                print(f"SKIP draft: {path}", file=sys.stderr)
            else:
                page_url = url_for_page(host, path)
                add(page_url, "URL_UPDATED")
                parent = parent_section_url(
                    "/" + page_url[len(f"https://{host}/") :]
                )
                if parent:
                    add(f"https://{host}{parent}", "URL_UPDATED")

        # 2) BEFORE-side URLs for deletes/renames-from.
        if status == "D" or (status == "R" and old_path):
            removed_path = path if status == "D" else old_path
            assert removed_path is not None
            removed_url = url_for_page(host, removed_path)
            add(removed_url, "URL_DELETED")
            # Parent section listing also changed (one fewer item).
            parent = parent_section_url(
                "/" + removed_url[len(f"https://{host}/") :]
            )
            if parent:
                # Parent is an UPDATE, not a DELETE — the section page
                # still exists, just with one fewer link.
                add(f"https://{host}{parent}", "URL_UPDATED")

    return out
