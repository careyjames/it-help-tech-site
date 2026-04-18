#!/usr/bin/env node
// Generate llms-full.txt from content/*.md.
// Source of truth: infra/llms/llms-full.config.json + content/ + config.toml.
// Output: build/llms-full.txt (deterministic, UTF-8, LF).
// Run from repo root. --dry-run prints to stdout without writing.
// See infra/llms/README.md for design and runbook.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const REPO_ROOT = process.cwd();
const CONFIG_PATH = path.join(REPO_ROOT, "infra/llms/llms-full.config.json");
const SITE_CONFIG_PATH = path.join(REPO_ROOT, "config.toml");
const OUTPUT_PATH = path.join(REPO_ROOT, "build/llms-full.txt");

const dryRun = process.argv.includes("--dry-run");

function die(msg) {
  console.error(`[build-llms-full] ERROR: ${msg}`);
  process.exit(1);
}

function warn(msg) {
  console.error(`[build-llms-full] WARN: ${msg}`);
}

// Apply a strip regex repeatedly until the string stops changing.
// Defends against nested-tag bypasses like "<scr<script>ipt>" where a single
// pass would leave residual "<scr" text. Used for tag/comment/svg stripping
// since CodeQL flags single-pass replacements as incomplete sanitization.
// Bounded to 10 iterations to prevent any pathological input from looping.
function stripUntilStable(s, re) {
  for (let i = 0; i < 10; i++) {
    const next = s.replace(re, "");
    if (next === s) return next;
    s = next;
  }
  return s.replace(re, "");
}

// Single-pass HTML entity decode. Avoids cascading replacements that would
// double-unescape inputs like "&amp;lt;" → "&lt;" → "<" (CodeQL flag).
const ENTITY_MAP = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };
function decodeEntities(s) {
  return s.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e) => ENTITY_MAP[e]);
}

// --- Parse minimal site config (just title/description/base_url) ---
function readSiteConfig() {
  const raw = fs.readFileSync(SITE_CONFIG_PATH, "utf8");
  const get = (key) => {
    const re = new RegExp(`^${key}\\s*=\\s*"([^"]*)"`, "m");
    const m = raw.match(re);
    return m ? m[1] : null;
  };
  const title = get("title");
  const description = get("description");
  const base_url = get("base_url");
  if (!title || !base_url) {
    die(`config.toml missing required field(s): title=${title} base_url=${base_url}`);
  }
  return { title, description: description ?? "", base_url: base_url.replace(/\/$/, "") };
}

// --- Frontmatter parser (TOML +++ or YAML ---). Extracts title, description, extra.llms_label only. ---
function parseFrontmatter(raw, filePath) {
  const lines = raw.split(/\r?\n/);
  const first = lines[0];
  let delim, isToml;
  if (first === "+++") {
    delim = "+++";
    isToml = true;
  } else if (first === "---") {
    delim = "---";
    isToml = false;
  } else {
    die(`${filePath}: missing frontmatter (first line must be '+++' or '---', got '${first}')`);
  }
  const endIdx = lines.indexOf(delim, 1);
  if (endIdx === -1) {
    die(`${filePath}: frontmatter not closed (no matching '${delim}')`);
  }
  const fmLines = lines.slice(1, endIdx);
  const body = lines.slice(endIdx + 1).join("\n");

  // Extract values. Both TOML and YAML support "key = value" and "key: value" respectively.
  // We only need title, description, and extra.llms_label.
  const fm = { title: null, description: null, llms_label: null };
  let inExtra = false;
  for (const line of fmLines) {
    const trimmed = line.trim();
    if (isToml) {
      if (/^\[extra\]/.test(trimmed)) { inExtra = true; continue; }
      if (/^\[/.test(trimmed)) { inExtra = false; continue; }
      const m = trimmed.match(/^(\w+)\s*=\s*"((?:\\.|[^"\\])*)"\s*$/);
      if (!m) continue;
      const [, k, v] = m;
      const value = v.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      if (!inExtra && (k === "title" || k === "description")) fm[k] = value;
      if (inExtra && k === "llms_label") fm.llms_label = value;
    } else {
      // YAML: very narrow subset — top-level "key: value", and extra: block with 2-space indent "  llms_label: value".
      const top = trimmed.match(/^(title|description):\s*"?(.*?)"?\s*$/);
      if (top && /^[a-z]/.test(line)) { fm[top[1]] = top[2]; continue; }
      if (/^extra:\s*$/.test(trimmed)) { inExtra = true; continue; }
      if (inExtra) {
        const sub = line.match(/^\s+llms_label:\s*"?(.*?)"?\s*$/);
        if (sub) fm.llms_label = sub[1];
        // Bail out of extra block if we hit a non-indented line (next top-level key).
        if (/^\S/.test(line)) inExtra = false;
      }
    }
  }
  if (!fm.title) die(`${filePath}: frontmatter missing required 'title'`);
  return { fm, body };
}

// --- Body transform pipeline (deterministic, no markdown libs) ---
// All tag/comment/svg strips run via stripUntilStable() to defeat nested-tag
// bypasses (CodeQL "incomplete multi-character sanitization"). Entity decode
// happens BEFORE tag-aware steps so reconstituted tags get caught by the
// downstream strip passes. Entity decode is single-pass (decodeEntities) to
// avoid the cascade-double-unescape bug ("&amp;lt;" → "&lt;" → "<").
function transformBody(body, filePath) {
  let s = body;

  // Helper: strip a tag pair until stable, then strip any orphan opening or
  // closing tokens of the same name. Defends against reassembly attacks like
  // "<scr<script>alert()</script>ipt>" where pair-strip leaves a literal
  // "<script>" by concatenating "<scr" + "ipt>". Two-stage cleanup gives
  // CodeQL a complete sanitization signature it can recognize.
  const stripTagPair = (input, tagName) => {
    const pair = new RegExp(`<${tagName}\\b[^>]*>[\\s\\S]*?<\\/${tagName}>`, "gi");
    const orphan = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "gi");
    let out = stripUntilStable(input, pair);
    out = stripUntilStable(out, orphan);
    return out;
  };

  // 1. Strip JSON-LD blocks first (most specific pattern), then all script tags.
  s = stripUntilStable(s, /<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi);
  s = stripTagPair(s, "script");

  // 1c. Strip HTML comments (loop until stable). Comments cannot legally nest,
  //     and there is no "orphan comment" form, so a single pair-strip suffices.
  s = stripUntilStable(s, /<!--[\s\S]*?-->/g);

  // 2. Strip <svg>...</svg> blocks plus any orphan svg tokens.
  s = stripTagPair(s, "svg");

  // 2b. Decode common HTML entities EARLY (single-pass, no cascade) so any
  //     reconstituted tags get caught by the downstream tag-aware steps.
  s = decodeEntities(s);

  // 2c. Re-run dangerous-tag strips after entity decode in case the decoded
  //     text now contains tag syntax that wasn't visible before.
  s = stripTagPair(s, "script");
  s = stripUntilStable(s, /<!--[\s\S]*?-->/g);
  s = stripTagPair(s, "svg");

  // 3. Normalize <br> and </p> to line breaks.
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/p>/gi, "\n");
  s = s.replace(/<p[^>]*>/gi, "");

  // 4. Convert <a href="X" ...>LABEL</a> → [LABEL](X). Preserve href + visible inner text.
  s = s.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (match, attrs, inner) => {
    const hrefMatch = attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i);
    if (!hrefMatch) {
      warn(`${filePath}: <a> without href, dropping tag, keeping inner: ${match.slice(0, 80)}`);
      return inner;
    }
    const href = hrefMatch[1];
    const label = stripUntilStable(inner, /<[^>]+>/g).trim();
    if (!label) return `<${href}>`;
    return `[${label}](${href})`;
  });

  // 5. Strip remaining HTML tags conservatively (warn on anything substantive).
  s = stripUntilStable(s, /<\/?(?:span|div|section|article|header|footer|nav|aside|main|figure|figcaption|button|small|strong|em|i|b|u|s|mark|sup|sub|cite|abbr|kbd|code|pre|blockquote|hr|input|label|select|option|table|thead|tbody|tr|th|td|ul|ol|li|h[1-6])\b[^>]*>/gi);
  // Remaining tags = unrecognized; warn and strip until stable.
  const remaining = s.match(/<[a-z][^>]*>/gi);
  if (remaining) {
    warn(`${filePath}: stripped ${remaining.length} unrecognized HTML tag(s); first: ${remaining[0]}`);
    s = stripUntilStable(s, /<[^>]+>/g);
  }

  // 6. Strip Zola heading-anchor syntax {#anchor} from heading lines.
  s = s.replace(/^(#{1,6}\s+.*?)\s*\{#[^}]+\}\s*$/gm, "$1");

  // 6b. Demote in-page headings so they nest under the page label.
  //     The page label is rendered at level 3 ("### Label"), so the highest
  //     in-page heading must be at least level 4 to maintain a valid outline.
  //     Otherwise an in-page h2 emits at the same level as the "## Main"
  //     section heading (an outline violation that confuses LLMs and TOC tools).
  //     We compute the minimum heading level present in the body and shift
  //     every heading by max(0, 4 - min). Result is capped at h6.
  s = demoteHeadings(s, 4);

  // 7. Normalize whitespace.
  //    - Strip trailing spaces on every line.
  //    - Collapse 3+ consecutive blank lines to 2.
  //    - Trim leading/trailing whitespace overall.
  //    - Strip leading whitespace from text lines (lines that begin with a
  //      letter). Defends against the residue left when inline HTML wrappers
  //      like <h1><span>...</span><span>...</span></h1> are stripped — the
  //      inner text keeps the original indentation and reads as garbage.
  //      Lines beginning with list/quote/heading/code markers are preserved.
  s = s.replace(/[ \t]+\n/g, "\n");
  s = s.replace(/^[ \t]+(?=[A-Za-z])/gm, "");
  s = s.replace(/\n{3,}/g, "\n\n");
  s = s.replace(/^\s+|\s+$/g, "");

  return s;
}

// Demote every heading line in `s` so the smallest level present is at least
// `targetMin`. Caps at level 6. No-op if all headings already satisfy the
// floor. Operates on Markdown ATX-style headings only (`# ` through `###### `).
function demoteHeadings(s, targetMin) {
  const headings = [...s.matchAll(/^(#{1,6})\s/gm)];
  if (headings.length === 0) return s;
  let minLevel = 6;
  for (const h of headings) minLevel = Math.min(minLevel, h[1].length);
  const shift = Math.max(0, targetMin - minLevel);
  if (shift === 0) return s;
  return s.replace(/^(#{1,6})(\s)/gm, (_, hashes, sp) => {
    const newLevel = Math.min(6, hashes.length + shift);
    return "#".repeat(newLevel) + sp;
  });
}

// --- Main ---
function main() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const site = readSiteConfig();

  // Build a Zola-canonical URL for a content file (always trailing-slash,
  // matching the live site's URL canonicalization for both root and section pages).
  // content/_index.md      → ${base_url}/
  // content/services.md    → ${base_url}/services/
  // content/blog/_index.md → ${base_url}/blog/
  // content/blog/foo.md    → ${base_url}/blog/foo/
  const fileToUrl = (file) => {
    const stripped = file.replace(/^content\//, "").replace(/\.md$/, "").replace(/(^|\/)_index$/, "$1");
    return `${site.base_url}/${stripped}${stripped && !stripped.endsWith("/") ? "/" : ""}`;
  };

  // Validate config: dup URLs/labels.
  const seenLabels = new Set();
  const seenUrls = new Set();
  for (const sec of [...(config.main ?? []), ...(config.optional ?? [])]) {
    for (const entry of sec.entries) {
      if (seenLabels.has(entry.label)) die(`duplicate label in config: ${entry.label}`);
      seenLabels.add(entry.label);
      const url = entry.url ?? (entry.file ? fileToUrl(entry.file) : null);
      if (url) {
        if (seenUrls.has(url)) die(`duplicate URL in config: ${url}`);
        seenUrls.add(url);
      }
    }
  }

  // Build output.
  const out = [];
  out.push(`# ${site.title}`);
  out.push("");
  if (config.tagline) out.push(`> ${config.tagline}`);
  out.push("");

  for (const section of [...(config.main ?? []), ...(config.optional ?? [])]) {
    out.push(`## ${section.heading}`);
    out.push("");
    for (const entry of section.entries) {
      const label = entry.label;
      // Link-only entry (e.g., external schedule).
      if (entry.url && !entry.file) {
        out.push(`### ${label}`);
        out.push("");
        out.push(`Source: [${entry.url}](${entry.url})`);
        out.push("");
        if (entry.description) {
          out.push(entry.description);
          out.push("");
        }
        out.push("---");
        out.push("");
        continue;
      }
      // File-backed entry.
      const filePath = path.join(REPO_ROOT, entry.file);
      if (!fs.existsSync(filePath)) die(`config references missing file: ${entry.file}`);
      const raw = fs.readFileSync(filePath, "utf8");
      const { fm, body } = parseFrontmatter(raw, entry.file);
      const finalLabel = entry.label ?? fm.llms_label ?? fm.title;
      const url = fileToUrl(entry.file);
      const cleanedBody = transformBody(body, entry.file);

      out.push(`### ${finalLabel}`);
      out.push("");
      out.push(`Source: [${url}](${url})`);
      out.push("");
      if (cleanedBody) {
        out.push(cleanedBody);
        out.push("");
      }
      out.push("---");
      out.push("");
    }
  }

  // Final normalization: single trailing newline, LF endings.
  let result = out.join("\n").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  if (!result.endsWith("\n")) result += "\n";

  if (dryRun) {
    process.stdout.write(result);
    console.error(`[build-llms-full] dry-run: ${result.length} bytes (not written)`);
    return;
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, result, "utf8");
  console.error(`[build-llms-full] wrote ${OUTPUT_PATH} (${result.length} bytes)`);
}

main();
