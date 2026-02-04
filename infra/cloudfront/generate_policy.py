#!/usr/bin/env python3
"""
Generate/refresh the CloudFront ResponseHeadersPolicyConfig (CSP hashes) from the built site.

Why:
  - CloudFront has practical size limits on header values.
  - Hash-based CSP is brittle if maintained by hand.
  - This script rebuilds CSP allowlists from `public/` so you can deploy safely.

Defaults are tuned for this repo:
  - The **main site** uses strict CSP (no `unsafe-inline`) and allows inline `<style>`/`<script>` via hashes.
  - **Signature pages** (email signatures + the animation logo page) are expected to be served by a separate
    CloudFront behavior with a separate Response Headers Policy, because they require inline styles.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Iterable


STYLE_TAG_RE = re.compile(r"<style\b([^>]*)>(.*?)</style>", re.IGNORECASE | re.DOTALL)
SCRIPT_TAG_RE = re.compile(r"<script\b([^>]*)>(.*?)</script>", re.IGNORECASE | re.DOTALL)
SRC_ATTR_RE = re.compile(r"\bsrc\s*=", re.IGNORECASE)

SELF = "'self'"
NONE = "'none'"

# Fixed filesystem locations (do not accept user-provided paths).
# These are relative to the repo root (run this script from the repo root).
PUBLIC_DIR = Path("public")
SITE_POLICY_PATH = "infra/cloudfront/csp-policy-v1.json"
SIGNATURES_POLICY_PATH = "infra/cloudfront/csp-policy-signatures-v1.json"


@dataclass(frozen=True)
class InlineScript:
    file: Path
    attrs: str
    body: str


@dataclass(frozen=True)
class InlineStyle:
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


def _is_signature_page(file: Path) -> bool:
    name = file.name
    if name == "ithelp-anilogo.html":
        return True
    if name.startswith("ithelp-logo-sig-") and name.endswith(".html"):
        return True
    return False


def _is_site_page(file: Path) -> bool:
    return not _is_signature_page(file)


def _extract_inline_scripts(html: str, *, file: Path) -> Iterable[InlineScript]:
    for match in SCRIPT_TAG_RE.finditer(html):
        attrs = (match.group(1) or "").strip()
        if SRC_ATTR_RE.search(attrs):
            continue
        body = match.group(2) or ""
        if body.strip() == "":
            continue
        yield InlineScript(file=file, attrs=attrs, body=body)


def _extract_inline_styles(html: str, *, file: Path) -> Iterable[InlineStyle]:
    for match in STYLE_TAG_RE.finditer(html):
        attrs = (match.group(1) or "").strip()
        body = match.group(2) or ""
        if body.strip() == "":
            continue
        yield InlineStyle(file=file, attrs=attrs, body=body)


def collect_script_hashes(public_dir: Path, *, include_file: Callable[[Path], bool]) -> list[str]:
    hashes: set[str] = set()
    for file in _iter_files(public_dir):
        if not include_file(file):
            continue
        html = file.read_text(encoding="utf-8")
        for script in _extract_inline_scripts(html, file=file):
            hashes.add(_sha256_base64(script.body))
    return sorted(hashes)


def collect_style_hashes(public_dir: Path, *, include_file: Callable[[Path], bool]) -> list[str]:
    hashes: set[str] = set()
    for file in _iter_files(public_dir):
        if not include_file(file):
            continue
        html = file.read_text(encoding="utf-8")
        for style in _extract_inline_styles(html, file=file):
            hashes.add(_sha256_base64(style.body))
    return sorted(hashes)


def _extract_hashes_from_csp(csp: str, *, directive_name: str) -> set[str]:
    # Parse only the requested directive, if present.
    for directive in csp.split(";"):
        directive = directive.strip()
        if directive.lower().startswith(directive_name.lower() + " "):
            hashes: set[str] = set()
            for token in directive.split()[1:]:
                token = token.strip()
                if token.startswith("'sha256-") and token.endswith("'"):
                    hashes.add(token[len("'sha256-") : -1])
            return hashes
    return set()


def build_site_csp(*, script_hashes: list[str], style_hashes: list[str]) -> str:
    script_sources = [SELF] + [f"'sha256-{h}'" for h in script_hashes]
    style_sources = [SELF] + [f"'sha256-{h}'" for h in style_hashes]

    # Note: keep this short. CloudFront header-value size is finite.
    directives = [
        f"default-src {NONE}",
        f"base-uri {SELF}",
        f"object-src {NONE}",
        f"frame-ancestors {NONE}",
        f"form-action {SELF}",
        f"img-src {SELF} data:",
        f"font-src {SELF}",
        "style-src " + " ".join(style_sources),
        "script-src " + " ".join(script_sources),
        f"connect-src {SELF}",
        f"media-src {SELF}",
        f"manifest-src {SELF}",
        "upgrade-insecure-requests",
    ]

    return "; ".join(directives)


def build_signatures_csp(*, script_hashes: list[str]) -> str:
    script_sources = [SELF] + [f"'sha256-{h}'" for h in script_hashes]

    directives = [
        f"default-src {NONE}",
        f"base-uri {SELF}",
        f"object-src {NONE}",
        f"frame-ancestors {NONE}",
        f"form-action {SELF}",
        f"img-src {SELF} data:",
        f"font-src {SELF}",
        # Email signature pages and the animation logo page rely on inline styles.
        f"style-src {SELF} 'unsafe-inline'",
        "script-src " + " ".join(script_sources),
        f"connect-src {SELF}",
        f"media-src {SELF}",
        f"manifest-src {SELF}",
        "upgrade-insecure-requests",
    ]

    return "; ".join(directives)


def update_policy_dict(policy: dict, *, csp: str) -> dict:
    updated = dict(policy)
    updated["SecurityHeadersConfig"]["ContentSecurityPolicy"]["ContentSecurityPolicy"] = csp
    return updated


def _merge_hashes(hashes: list[str], *, existing_csp: str, directive_name: str) -> tuple[list[str], int]:
    existing = _extract_hashes_from_csp(existing_csp, directive_name=directive_name)
    merged_in = len(existing.difference(set(hashes)))
    merged = sorted(set(hashes).union(existing))
    return merged, merged_in


def _write_site_policy_file(*, csp: str) -> None:
    with open(SITE_POLICY_PATH, "r", encoding="utf-8") as handle:
        policy = json.load(handle)
    updated = update_policy_dict(policy, csp=csp)
    with open(SITE_POLICY_PATH, "w", encoding="utf-8") as handle:
        json.dump(updated, handle, indent=2)
        handle.write("\n")


def _write_signatures_policy_file(*, csp: str) -> None:
    with open(SIGNATURES_POLICY_PATH, "r", encoding="utf-8") as handle:
        policy = json.load(handle)
    updated = update_policy_dict(policy, csp=csp)
    with open(SIGNATURES_POLICY_PATH, "w", encoding="utf-8") as handle:
        json.dump(updated, handle, indent=2)
        handle.write("\n")


def generate_site_policy(
    *,
    public_dir: Path,
    max_length: int,
    merge_hashes_from_stdin: bool,
    existing_csp: str,
) -> int:
    script_hashes = collect_script_hashes(public_dir, include_file=_is_site_page)
    style_hashes = collect_style_hashes(public_dir, include_file=_is_site_page)

    merged_script_in = 0
    merged_style_in = 0
    if merge_hashes_from_stdin:
        script_hashes, merged_script_in = _merge_hashes(
            script_hashes, existing_csp=existing_csp, directive_name="script-src"
        )
        style_hashes, merged_style_in = _merge_hashes(
            style_hashes, existing_csp=existing_csp, directive_name="style-src"
        )

    csp = build_site_csp(script_hashes=script_hashes, style_hashes=style_hashes)
    if len(csp) > max_length:
        print(
            f"error: site CSP length {len(csp)} exceeds max {max_length}. "
            "Reduce inline scripts/styles or loosen the policy before deploying.",
            file=sys.stderr,
        )
        return 1

    _write_site_policy_file(csp=csp)
    print(f"Updated {SITE_POLICY_PATH}")
    print(f"- site inline script hashes: {len(script_hashes)}")
    print(f"- site inline style hashes: {len(style_hashes)}")
    if merge_hashes_from_stdin:
        print(f"- site merged existing script hashes: {merged_script_in}")
        print(f"- site merged existing style hashes: {merged_style_in}")
    print(f"- site CSP length: {len(csp)}")

    return 0


def generate_signatures_policy(
    *,
    public_dir: Path,
    max_length: int,
    merge_hashes_from_stdin: bool,
    existing_csp: str,
) -> int:
    sig_script_hashes = collect_script_hashes(public_dir, include_file=_is_signature_page)

    merged_in = 0
    if merge_hashes_from_stdin:
        sig_script_hashes, merged_in = _merge_hashes(
            sig_script_hashes, existing_csp=existing_csp, directive_name="script-src"
        )

    sig_csp = build_signatures_csp(script_hashes=sig_script_hashes)
    if len(sig_csp) > max_length:
        print(f"error: signatures CSP length {len(sig_csp)} exceeds max {max_length}.", file=sys.stderr)
        return 1

    _write_signatures_policy_file(csp=sig_csp)
    print(f"Updated {SIGNATURES_POLICY_PATH}")
    print(f"- signatures inline script hashes: {len(sig_script_hashes)}")
    if merge_hashes_from_stdin:
        print(f"- signatures merged existing script hashes: {merged_in}")
    print(f"- signatures CSP length: {len(sig_csp)}")

    return 0


def _validate_inputs(
    *,
    mode: str,
    merge_hashes_from_stdin: bool,
    public_dir: Path,
) -> int:
    if not public_dir.exists():
        print(f"error: public dir not found: {public_dir}", file=sys.stderr)
        return 2

    if merge_hashes_from_stdin and mode == "all":
        print("error: --merge-hashes-from-stdin requires --mode site or --mode signatures", file=sys.stderr)
        return 2

    if mode in {"site", "all"} and not Path(SITE_POLICY_PATH).exists():
        print(f"error: site policy file not found: {SITE_POLICY_PATH}", file=sys.stderr)
        return 2

    if mode in {"signatures", "all"} and not Path(SIGNATURES_POLICY_PATH).exists():
        print(f"error: signatures policy file not found: {SIGNATURES_POLICY_PATH}", file=sys.stderr)
        return 2

    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate CloudFront CSP (hash allowlist) from built HTML.")
    parser.add_argument(
        "--max-length",
        type=int,
        default=2048,
        help="Fail if generated CSP exceeds this length (conservative CloudFront safety check)",
    )
    parser.add_argument(
        "--mode",
        choices=["site", "signatures", "all"],
        default="site",
        help="Which CSP(s) to generate: site (default), signatures, or all.",
    )
    parser.add_argument(
        "--merge-hashes-from-stdin",
        action="store_true",
        help="Read an existing CSP string from stdin and merge sha256 hashes into the generated CSP.",
    )
    args = parser.parse_args()

    validation_error = _validate_inputs(
        mode=args.mode,
        merge_hashes_from_stdin=args.merge_hashes_from_stdin,
        public_dir=PUBLIC_DIR,
    )
    if validation_error != 0:
        return validation_error

    existing_csp = sys.stdin.read() if args.merge_hashes_from_stdin else ""

    if args.mode in {"site", "all"}:
        error = generate_site_policy(
            public_dir=PUBLIC_DIR,
            max_length=args.max_length,
            merge_hashes_from_stdin=args.merge_hashes_from_stdin,
            existing_csp=existing_csp,
        )
        if error != 0:
            return error

    if args.mode in {"signatures", "all"}:
        error = generate_signatures_policy(
            public_dir=PUBLIC_DIR,
            max_length=args.max_length,
            merge_hashes_from_stdin=args.merge_hashes_from_stdin,
            existing_csp=existing_csp,
        )
        if error != 0:
            return error

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
