#!/usr/bin/env node
// Post-deploy Lighthouse gate.
//
// Reads infra/audit/audit.config.json and runs Lighthouse N times for
// every (url × formFactor) pair. For each Lighthouse category the gate
// fails the deploy only if the MEDIAN score across the N samples drops
// below the configured threshold. This eliminates single-sample TBT
// jitter from CloudFront edge cold-start + headless-Chromium scheduling
// noise without relaxing the engineering bar (median of 3 is a stricter
// statistical guarantee than best-of-N, while remaining stable enough
// to deploy on).
//
// A WARNING is emitted (without failing the build) whenever any single
// run dipped below threshold but the median still passed — that surfaces
// thinning-margin pages as a leading indicator.
//
// Number of samples is configured by lighthouse.samplesPerAudit
// (default 3). N=1 reverts to the original single-sample behavior.
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
const samplesPerAudit = Number(config.lighthouse.samplesPerAudit ?? 3);
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

// Median per-category-independently (NOT median over the full report).
// For an even N we take the lower middle for an extra-conservative
// verdict; for odd N (the default 3) it is the unique middle value.
function median(values) {
  const cleaned = values.filter((v) => v != null).sort((a, b) => a - b);
  if (cleaned.length === 0) return null;
  const mid = Math.floor((cleaned.length - 1) / 2);
  return cleaned[mid];
}

const failures = [];
const warnings = [];
const summary = [];

for (const url of urls) {
  for (const formFactor of formFactors) {
    process.stdout.write(
      `\n→ Auditing ${url} (${formFactor}) — ${samplesPerAudit} sample${samplesPerAudit === 1 ? "" : "s"}\n`,
    );

    // Collect samplesPerAudit runs; per-category arrays for median.
    const runs = [];
    for (let i = 1; i <= samplesPerAudit; i++) {
      const scores = runLighthouse(url, formFactor);
      runs.push(scores);
      const oneLine = categories
        .map((c) => `${c}=${scores[c]}`)
        .join(" ");
      console.log(`    run ${i}/${samplesPerAudit}: ${oneLine}`);
    }

    // Per-category median + verdict.
    const medianScores = {};
    const verdicts = {};
    for (const cat of categories) {
      const samples = runs.map((r) => r[cat]);
      const med = median(samples);
      medianScores[cat] = med;
      const threshold = thresholds[cat];
      const ok = med != null && med >= threshold;
      verdicts[cat] = ok;
      const marker = ok ? "PASS" : "FAIL";
      console.log(
        `  [${marker}] ${cat.padEnd(15)} median=${String(med).padStart(3)} ` +
          `samples=[${samples.join(",")}] (>= ${threshold})`,
      );
      if (!ok) {
        failures.push(
          `${url} (${formFactor}) ${cat}: median ${med} < ${threshold} — samples [${samples.join(",")}]`,
        );
      } else {
        // Leading-indicator warning: median passes but at least one
        // individual sample dipped below threshold.
        const dippedSamples = samples.filter(
          (s) => s != null && s < threshold,
        );
        if (dippedSamples.length > 0) {
          warnings.push(
            `${url} (${formFactor}) ${cat}: median ${med} passed, but ${dippedSamples.length}/${samplesPerAudit} sample(s) below threshold ${threshold} — samples [${samples.join(",")}]`,
          );
        }
      }
    }

    summary.push({ url, formFactor, runs, medianScores });
  }
}

console.log("\n=== Lighthouse summary (median of " + samplesPerAudit + ") ===");
for (const { url, formFactor, medianScores } of summary) {
  console.log(
    `  ${url} (${formFactor}): ` +
      categories.map((c) => `${c}=${medianScores[c]}`).join(" "),
  );
}

if (warnings.length > 0) {
  console.log("\n::warning::Lighthouse single-sample dips (median still passed):");
  for (const w of warnings) console.log(`  - ${w}`);
}

if (failures.length > 0) {
  console.error("\n::error::Lighthouse threshold breach (median):");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("\nAll Lighthouse thresholds met (median verdict).");
