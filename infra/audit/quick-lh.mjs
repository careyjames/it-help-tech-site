#!/usr/bin/env node
// Agent-facing one-shot Lighthouse driver.
//
// PURPOSE
// -------
// `infra/audit/run-lighthouse.mjs` is the deploy gate: median-of-N
// across the entire URL × form-factor grid (~5 minutes, ~24 runs).
// It is the wrong tool for in-the-loop development:
//   - too slow to call between edits,
//   - reports JSON files but no human summary,
//   - exits non-zero on any threshold dip, killing iteration.
//
// `quick-lh.mjs` is the agent's working microscope. One run, one URL,
// one form factor, summary printed to stdout in seconds. Used during
// development to (a) confirm the score moved in the right direction
// after a change and (b) enumerate which audits are still failing so
// the next edit can be targeted, *without* committing or deploying.
//
// CAVEAT: a single run is jittery (especially mobile Performance).
// Treat the failing-audits list as ground truth; treat the perf score
// as directional. The deploy gate (median-of-N) remains the source of
// truth for "are we shipping" — this script is the source of truth
// for "what should I edit next".
//
// USAGE
// -----
//   node infra/audit/quick-lh.mjs <url> [mobile|desktop] [--save <path>]
//   npm run lh -- <url> [mobile|desktop] [--save <path>]
//
// Examples:
//   npm run lh -- https://www.it-help.tech/ mobile
//   npm run lh -- http://localhost:5000/ desktop --save /tmp/lh.json
//
// Default form factor is mobile (Lighthouse's default and what
// PageSpeed defaults to in the wild).
//
// REQUIREMENTS
// ------------
// - `lighthouse` resolvable (devDependency in package.json; run via
//   `npm run lh` or `npx lighthouse`, or install globally with
//   `npm install -g lighthouse@12`).
// - A chromium binary on PATH (`chromium`, `chromium-browser`,
//   `google-chrome`, or `chrome`), or `CHROME_PATH` env var.
//   Replit env: provided by `replit.nix` (`pkgs.chromium`).
//   GitHub Actions: provided by `apt-get install chromium-browser`
//   (see `.github/workflows/deploy.yml`).

import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// ----- arg parsing (strict) ---------------------------------------------
const USAGE =
  "usage: node infra/audit/quick-lh.mjs <url> [mobile|desktop] [--save <path>]";

function die(msg, code = 2) {
  console.error(msg);
  console.error(USAGE);
  process.exit(code);
}

const argv = process.argv.slice(2);
if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
  console.error(USAGE);
  process.exit(argv.length === 0 ? 2 : 0);
}

let url = null;
let formFactor = "mobile";
let savePath = null;
const positional = [];

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--save") {
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) die(`error: --save requires a path`);
    savePath = next;
    i++;
  } else if (a.startsWith("--")) {
    die(`error: unknown flag '${a}'`);
  } else {
    positional.push(a);
  }
}
if (positional.length === 0) die("error: missing <url>");
if (positional.length > 2) die(`error: unexpected argument '${positional[2]}'`);
url = positional[0];
if (positional[1]) formFactor = positional[1];

if (!/^https?:\/\//i.test(url)) {
  die(`error: <url> must start with http:// or https:// (got: ${url})`);
}
if (!["mobile", "desktop"].includes(formFactor)) {
  die(`error: form factor must be 'mobile' or 'desktop' (got: ${formFactor})`);
}

// ----- chromium discovery -----------------------------------------------
function findChromium() {
  if (process.env.CHROME_PATH) {
    if (!existsSync(process.env.CHROME_PATH)) {
      console.error(
        `warning: CHROME_PATH=${process.env.CHROME_PATH} does not exist; falling back to PATH search`,
      );
    } else {
      try {
        if (statSync(process.env.CHROME_PATH).isFile()) {
          return process.env.CHROME_PATH;
        }
      } catch {
        /* fall through */
      }
    }
  }
  for (const bin of [
    "chromium",
    "chromium-browser",
    "google-chrome",
    "chrome",
  ]) {
    const r = spawnSync("which", [bin], { encoding: "utf8" });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  }
  return null;
}

const chromePath = findChromium();
if (!chromePath) {
  console.error(
    "error: no chromium binary found on PATH and CHROME_PATH unset.",
  );
  console.error(
    "  Replit: ensure replit.nix contains `pkgs.chromium`.",
  );
  console.error(
    "  Debian/Ubuntu: `sudo apt-get install -y chromium-browser`.",
  );
  process.exit(3);
}

// ----- temp dir + finally cleanup ---------------------------------------
const workdir = mkdtempSync(join(tmpdir(), "quick-lh-"));
const outPath = join(workdir, "report.json");

function cleanup() {
  try {
    rmSync(workdir, { recursive: true, force: true });
  } catch {
    /* best-effort */
  }
}

try {
  // ----- run lighthouse -------------------------------------------------
  const lhArgs = [
    url,
    "--quiet",
    "--output=json",
    `--output-path=${outPath}`,
    "--only-categories=performance,accessibility,best-practices,seo",
    "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
  ];
  if (formFactor === "desktop") lhArgs.push("--preset=desktop");

  console.error(
    `> lighthouse ${formFactor} on ${url} (chrome=${chromePath})`,
  );
  const t0 = Date.now();
  const env = { ...process.env, CHROME_PATH: chromePath };
  const lh = spawnSync("lighthouse", lhArgs, { encoding: "utf8", env });
  const dt = ((Date.now() - t0) / 1000).toFixed(1);

  if (lh.error) {
    if (lh.error.code === "ENOENT") {
      console.error(
        "error: 'lighthouse' binary not found. Install with `npm install` (uses the pinned devDependency) or `npm install -g lighthouse@12`.",
      );
      process.exit(127);
    }
    console.error(`error: failed to spawn lighthouse: ${lh.error.message}`);
    process.exit(4);
  }
  if (lh.status !== 0) {
    console.error(`lighthouse exited ${lh.status} after ${dt}s`);
    if (lh.stderr) console.error(lh.stderr.slice(-2000));
    process.exit(lh.status || 4);
  }

  // ----- parse + summarize ----------------------------------------------
  let raw;
  try {
    raw = readFileSync(outPath, "utf8");
  } catch (e) {
    console.error(`error: lighthouse produced no report at ${outPath}: ${e.message}`);
    process.exit(5);
  }
  let report;
  try {
    report = JSON.parse(raw);
  } catch (e) {
    console.error(`error: failed to parse lighthouse JSON: ${e.message}`);
    process.exit(5);
  }

  const scores = {};
  for (const [cid, c] of Object.entries(report.categories || {})) {
    scores[cid] = c.score == null ? null : Math.round(c.score * 100);
  }

  const fails = [];
  for (const [aid, a] of Object.entries(report.audits || {})) {
    if (a.score == null || a.score === 1) continue;
    fails.push({
      score: a.score,
      id: aid,
      title: a.title || "",
      display: a.displayValue || "",
      numeric: a.numericValue,
    });
  }
  fails.sort((x, y) => x.score - y.score);

  console.log(`\nLighthouse ${formFactor} | ${url}`);
  console.log(`run time: ${dt}s | LH ${report.lighthouseVersion}`);
  console.log("---------------------------------------------------------------");
  for (const [cat, val] of Object.entries(scores)) {
    const flag = val == null ? "?" : val >= 100 ? "✓" : val >= 90 ? "·" : "!";
    console.log(`  ${flag} ${cat.padEnd(16)} ${val == null ? "n/a" : val}`);
  }
  console.log("---------------------------------------------------------------");
  console.log(`  ${fails.length} failing/partial audit(s):`);
  for (const f of fails) {
    const display = f.display
      ? `  ${f.display}`
      : f.numeric != null
        ? `  nv=${Math.round(f.numeric)}`
        : "";
    console.log(`    [${f.score.toFixed(2)}] ${f.id}${display}`);
    console.log(`           ${f.title.slice(0, 100)}`);
  }

  if (savePath) {
    copyFileSync(outPath, savePath);
    console.log(`\nfull JSON report saved to ${savePath}`);
  }
} finally {
  cleanup();
}
