#!/usr/bin/env python3
"""
Generate/refresh the CloudFront ResponseHeadersPolicyConfig (CSP hashes) from the built site.

Why:
  - CloudFront has practical size limits on header values.
  - Hash-based CSP is brittle if maintained by hand.
  - This script rebuilds the script-src hash allowlist from `public/` so you can deploy safely.

Defaults are tuned for this repo:
  - `style-src` allows `'unsafe-inline'` to avoid CSP bloat from inline styles used by signature pages.
  - `script-src` stays hash-allowlisted (no unsafe-inline) so inline JS remains tightly controlled.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


SCRIPT_TAG_RE = re.compile(r"<script\b([^>]*)>(.*?)</script>", re.IGNORECASE | re.DOTALL)
SRC_ATTR_RE = re.compile(r"\bsrc\s*=", re.IGNORECASE)


@dataclass(frozen=True)
class InlineScript:
    file: Path
    attrs: str
    body: str


def _sha256_base64(text: str) -> str:
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    return base64.b64encode(digest).decode("ascii")


def _iter_files(public_dir: Path) -> Iterable[Path]:
    for path in public_dir.rglob("*.html"):
        if path.is_file():
            yield path


def _extract_inline_scripts(html: str, *, file: Path) -> Iterable[InlineScript]:
    for match in SCRIPT_TAG_RE.finditer(html):
        attrs = (match.group(1) or "").strip()
        if SRC_ATTR_RE.search(attrs):
            continue
        body = match.group(2) or ""
        if body.strip() == "":
            continue
        yield InlineScript(file=file, attrs=attrs, body=body)


def collect_script_hashes(public_dir: Path) -> list[str]:
    hashes: set[str] = set()
    for file in _iter_files(public_dir):
        html = file.read_text(encoding="utf-8")
        for script in _extract_inline_scripts(html, file=file):
            hashes.add(_sha256_base64(script.body))
    return sorted(hashes)


def _extract_script_hashes_from_csp(csp: str) -> set[str]:
    # Parse only the `script-src` directive, if present.
    for directive in csp.split(";"):
        directive = directive.strip()
        if directive.lower().startswith("script-src "):
            hashes: set[str] = set()
            for token in directive.split()[1:]:
                token = token.strip()
                if token.startswith("'sha256-") and token.endswith("'"):
                    hashes.add(token[len("'sha256-") : -1])
            return hashes
    return set()


def build_csp(*, script_hashes: list[str]) -> str:
    script_sources = ["'self'"] + [f"'sha256-{h}'" for h in script_hashes]

    # Note: keep this short. CloudFront header-value size is finite.
    directives = [
        "default-src 'none'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        # Inline styles are used by hosted email-signature pages; allowing them avoids a huge hash list.
        "style-src 'self' 'unsafe-inline'",
        "script-src " + " ".join(script_sources),
        "connect-src 'self'",
        "media-src 'self'",
        "manifest-src 'self'",
        "upgrade-insecure-requests",
    ]

    return "; ".join(directives)


def update_policy_file(policy_file: Path, *, csp: str) -> dict:
    policy = json.loads(policy_file.read_text(encoding="utf-8"))
    policy["SecurityHeadersConfig"]["ContentSecurityPolicy"]["ContentSecurityPolicy"] = csp
    return policy


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate CloudFront CSP (hash allowlist) from built HTML.")
    parser.add_argument("--public-dir", default="public", help="Zola build output directory (default: public)")
    parser.add_argument(
        "--policy-file",
        default=str(Path("infra") / "cloudfront" / "csp-policy-v1.json"),
        help="CloudFront ResponseHeadersPolicyConfig JSON to update in-place",
    )
    parser.add_argument(
        "--max-length",
        type=int,
        default=2048,
        help="Fail if generated CSP exceeds this length (conservative CloudFront safety check)",
    )
    parser.add_argument(
        "--merge-script-hashes-from-csp-file",
        default=None,
        help="Optional file containing the current CSP. Any `script-src` sha256 hashes found will be merged in.",
    )
    args = parser.parse_args()

    public_dir = Path(args.public_dir)
    policy_file = Path(args.policy_file)
    merge_csp_file = Path(args.merge_script_hashes_from_csp_file) if args.merge_script_hashes_from_csp_file else None

    if not public_dir.exists():
        print(f"error: public dir not found: {public_dir}", file=sys.stderr)
        return 2
    if not policy_file.exists():
        print(f"error: policy file not found: {policy_file}", file=sys.stderr)
        return 2
    if merge_csp_file and not merge_csp_file.exists():
        print(f"error: merge CSP file not found: {merge_csp_file}", file=sys.stderr)
        return 2

    script_hashes = collect_script_hashes(public_dir)
    merged_in = 0
    if merge_csp_file:
        existing_hashes = _extract_script_hashes_from_csp(merge_csp_file.read_text(encoding="utf-8"))
        merged_in = len(existing_hashes.difference(set(script_hashes)))
        script_hashes = sorted(set(script_hashes).union(existing_hashes))

    csp = build_csp(script_hashes=script_hashes)

    if len(csp) > args.max_length:
        print(
            f"error: CSP length {len(csp)} exceeds max {args.max_length}. "
            "Reduce inline scripts or loosen the policy (e.g., allow 'unsafe-inline') before deploying.",
            file=sys.stderr,
        )
        return 1

    updated = update_policy_file(policy_file, csp=csp)
    policy_file.write_text(json.dumps(updated, indent=2) + "\n", encoding="utf-8")

    print(f"Updated {policy_file}")
    print(f"- inline script hashes: {len(script_hashes)}")
    if merge_csp_file:
        print(f"- merged existing hashes: {merged_in}")
    print(f"- CSP length: {len(csp)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
