#!/usr/bin/env node
// Post-deploy Lighthouse gate.
//
// Reads infra/audit/audit.config.json, runs Lighthouse for every
// (url × formFactor) pair, and exits non-zero if ANY of the four
// category scores drops below its threshold. Adding a new URL is a
// one-line change in audit.config.json.
//
// Requires: `lighthouse` CLI on PATH, a Chromium binary on PATH
// (chromium / chromium-browser / google-chrome), Node 20+.

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(
  readFileSync(join(__dirname, "audit.config.json"), "utf8"),
);

const { urls, formFactors, thresholds } = config.lighthouse;
const categories = Object.keys(thresholds);

function runLighthouse(url, formFactor) {
  const workdir = mkdtempSync(join(tmpdir(), "lh-"));
  const outPath = join(workdir, "report.json");

  const args = [
    url,
    "--quiet",
    "--output=json",
    `--output-path=${outPath}`,
    `--only-categories=${categories.join(",")}`,
    '--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage',
  ];
  if (formFactor === "desktop") args.push("--preset=desktop");

  const result = spawnSync("lighthouse", args, {
    stdio: ["ignore", "inherit", "inherit"],
  });
  if (result.status !== 0) {
    rmSync(workdir, { recursive: true, force: true });
    throw new Error(
      `lighthouse exited ${result.status} for ${url} (${formFactor})`,
    );
  }
  const report = JSON.parse(readFileSync(outPath, "utf8"));
  rmSync(workdir, { recursive: true, force: true });

  const scores = {};
  for (const cat of categories) {
    const raw = report.categories?.[cat]?.score;
    scores[cat] = raw == null ? null : Math.round(raw * 100);
  }
  return scores;
}

const failures = [];
const summary = [];

for (const url of urls) {
  for (const formFactor of formFactors) {
    process.stdout.write(`\n→ Auditing ${url} (${formFactor})\n`);
    const scores = runLighthouse(url, formFactor);
    const row = { url, formFactor, scores };
    summary.push(row);

    for (const cat of categories) {
      const score = scores[cat];
      const threshold = thresholds[cat];
      const ok = score != null && score >= threshold;
      const marker = ok ? "PASS" : "FAIL";
      console.log(
        `  [${marker}] ${cat.padEnd(15)} ${String(score).padStart(3)} (>= ${threshold})`,
      );
      if (!ok) {
        failures.push(
          `${url} (${formFactor}) ${cat}: ${score} < ${threshold}`,
        );
      }
    }
  }
}

console.log("\n=== Lighthouse summary ===");
for (const { url, formFactor, scores } of summary) {
  console.log(
    `  ${url} (${formFactor}): ` +
      categories.map((c) => `${c}=${scores[c]}`).join(" "),
  );
}

if (failures.length > 0) {
  console.error("\n::error::Lighthouse threshold breach:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("\nAll Lighthouse thresholds met.");
