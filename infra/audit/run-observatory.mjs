#!/usr/bin/env node
// Post-deploy Mozilla Observatory gate.
//
// Triggers a fresh scan of the configured host via the public v2 API
// and exits non-zero if the grade falls below `minGrade` or the score
// drops below `minScore` defined in infra/audit/audit.config.json.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(
  readFileSync(join(__dirname, "audit.config.json"), "utf8"),
);
const { host, minGrade, minScore } = config.observatory;

// Lower index == better grade.
const GRADE_ORDER = [
  "A+", "A", "A-",
  "B+", "B", "B-",
  "C+", "C", "C-",
  "D+", "D", "D-",
  "F",
];

function gradeRank(g) {
  const i = GRADE_ORDER.indexOf(g);
  return i === -1 ? GRADE_ORDER.length : i;
}

const scanUrl = `https://observatory-api.mdn.mozilla.net/api/v2/scan?host=${encodeURIComponent(host)}`;
console.log(`→ Triggering Observatory scan for ${host}`);

function extract(data) {
  return {
    grade: data?.grade ?? data?.scan?.grade ?? null,
    score: data?.score ?? data?.scan?.score ?? null,
    algo:
      data?.algorithm_version ?? data?.scan?.algorithm_version ?? "?",
    testsPassed: data?.tests_passed ?? null,
    testsTotal: data?.tests_quantity ?? null,
    state: data?.state ?? data?.scan?.state ?? null,
  };
}

async function triggerScan() {
  const res = await fetch(scanUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  if (!res.ok) {
    throw new Error(
      `Observatory POST returned HTTP ${res.status}: ${await res.text()}`,
    );
  }
  return res.json();
}

// The v2 API normally returns final grade/score on the POST response,
// but can occasionally come back with nulls / a non-FINISHED state if
// the scan hasn't completed yet. Poll a few times before giving up so
// transient lag doesn't fail an otherwise healthy deploy.
const MAX_ATTEMPTS = 12;
const SLEEP_MS = 5000;

let result = extract({});
let lastErr = null;
for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    const data = await triggerScan();
    result = extract(data);
    const ready =
      result.grade != null &&
      typeof result.score === "number" &&
      (result.state == null || result.state === "FINISHED");
    if (ready) break;
    console.log(
      `  attempt ${attempt}/${MAX_ATTEMPTS}: scan not ready yet (state=${result.state}, grade=${result.grade}, score=${result.score})`,
    );
  } catch (err) {
    lastErr = err;
    console.log(`  attempt ${attempt}/${MAX_ATTEMPTS}: ${err.message}`);
  }
  if (attempt < MAX_ATTEMPTS) {
    await new Promise((r) => setTimeout(r, SLEEP_MS));
  }
}

if (result.grade == null || typeof result.score !== "number") {
  console.error(
    `::error::Observatory scan did not return a usable grade/score after ${MAX_ATTEMPTS} attempts.`,
  );
  if (lastErr) console.error(`  last error: ${lastErr.message}`);
  process.exit(1);
}

const { grade, score, algo, testsPassed, testsTotal } = result;

console.log(`Observatory result: grade=${grade} score=${score} algorithm=v${algo}`);
console.log(`Tests passed: ${testsPassed ?? "?"} / ${testsTotal ?? "?"}`);

const failures = [];
if (gradeRank(grade) > gradeRank(minGrade)) {
  failures.push(`grade ${grade} is worse than required ${minGrade}`);
}
if (typeof score !== "number" || score < minScore) {
  failures.push(`score ${score} < required ${minScore}`);
}

if (failures.length > 0) {
  console.error("::error::Mozilla Observatory threshold breach:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("Observatory gate passed.");
