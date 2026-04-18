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
const CONTENT_DIR = path.join(REPO_ROOT, "content");
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
function transformBody(body, filePath) {
  let s = body;

  // 1. Strip JSON-LD blocks.
  s = s.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "");

  // 1b. Strip HTML comments.
  s = s.replace(/<!--[\s\S]*?-->/g, "");

  // 2. Strip <svg>...</svg> blocks.
  s = s.replace(/<svg\b[\s\S]*?<\/svg>/gi, "");

  // 2b. Decode common HTML entities EARLY, so any reconstituted tags
  //     (e.g. "&lt;script&gt;..." → "<script>...") are caught by the
  //     downstream tag-aware steps (anchor convert + conservative strip).
  //     Per architect hardening note: decoding after tag-strip can leak
  //     literal "<...>" text into the output.
  s = s.replace(/&amp;/g, "&")
       .replace(/&lt;/g, "<")
       .replace(/&gt;/g, ">")
       .replace(/&quot;/g, '"')
       .replace(/&#39;/g, "'")
       .replace(/&nbsp;/g, " ");

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
    const label = inner.replace(/<[^>]+>/g, "").trim();
    if (!label) return `<${href}>`;
    return `[${label}](${href})`;
  });

  // 5. Strip remaining HTML tags conservatively (warn on anything substantive).
  s = s.replace(/<\/?(?:span|div|section|article|header|footer|nav|aside|main|figure|figcaption|button|small|strong|em|i|b|u|s|mark|sup|sub|cite|abbr|kbd|code|pre|blockquote|hr|input|label|select|option|table|thead|tbody|tr|th|td|ul|ol|li|h[1-6])\b[^>]*>/gi, "");
  // Remaining tags = unrecognized; warn and strip.
  const remaining = s.match(/<[a-z][^>]*>/gi);
  if (remaining) {
    warn(`${filePath}: stripped ${remaining.length} unrecognized HTML tag(s); first: ${remaining[0]}`);
    s = s.replace(/<[^>]+>/g, "");
  }

  // 6. Strip Zola heading-anchor syntax {#anchor} from heading lines.
  s = s.replace(/^(#{1,6}\s+.*?)\s*\{#[^}]+\}\s*$/gm, "$1");

  // 7. Normalize whitespace.
  s = s.replace(/[ \t]+\n/g, "\n");           // trailing spaces
  s = s.replace(/\n{3,}/g, "\n\n");            // collapse 3+ blank lines
  s = s.replace(/^\s+|\s+$/g, "");             // trim

  return s;
}

// --- Main ---
function main() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const site = readSiteConfig();

  // Validate config: dup URLs/labels.
  const seenLabels = new Set();
  const seenUrls = new Set();
  for (const sec of [...(config.main ?? []), ...(config.optional ?? [])]) {
    for (const entry of sec.entries) {
      if (seenLabels.has(entry.label)) die(`duplicate label in config: ${entry.label}`);
      seenLabels.add(entry.label);
      const url = entry.url ?? (entry.file ? `${site.base_url}/${entry.file.replace(/^content\//, "").replace(/\.md$/, "").replace(/_index$/, "")}` : null);
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
      const url = `${site.base_url}/${entry.file.replace(/^content\//, "").replace(/\.md$/, "").replace(/_index$/, "")}`;
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
