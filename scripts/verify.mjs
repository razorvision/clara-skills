#!/usr/bin/env node
// Local verify gate: runs every check CI runs, in one go, against a clean tree, and records
// the result for this commit in <git-dir>/claude-verify-receipt.json so a pre-push hook can
// tell a verified commit from an unverified one.
import { execFileSync, spawnSync } from "node:child_process";
import { writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

if (git("status", "--porcelain")) {
  console.error("verify: the working tree has uncommitted changes; commit first so the receipt matches what is pushed.");
  process.exit(2);
}

const skills = readdirSync("skills").map((n) => `skills/${n}/`);
const stages = [
  ["gate-tests", "node", ["--test", "scripts/checks.test.mjs"]],
  ["license", "node", ["scripts/check-license.mjs", "."]],
  ["router", "node", ["scripts/check-router.mjs", "."]],
  ["consistency", "node", ["scripts/check-consistency.mjs", "."]],
  ["version-sync", "node", ["scripts/check-version.mjs", "sync", "."]],
  ...skills.map((d) => [`skills-ref ${d}`, "agentskills", ["validate", d]]),
  ["claude-plugin", "npx", ["-y", "@anthropic-ai/claude-code@2.1.296", "plugin", "validate", ".", "--strict"]],
];

const results = [];
for (const [name, cmd, args] of stages) {
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  const ok = r.status === 0;
  if (r.error?.code === "ENOENT" && cmd === "agentskills") {
    console.error("verify: `agentskills` not found; install the validator with `pip install skills-ref==0.1.1`.");
  }
  results.push({ name, ok });
  console.log(`verify: ${ok ? "PASS" : "FAIL"} ${name}`);
}

const allPassed = results.every((s) => s.ok);
const receipt = { sha: git("rev-parse", "HEAD"), allPassed, stages: results, mode: "full", at: new Date().toISOString() };
writeFileSync(join(git("rev-parse", "--git-dir"), "claude-verify-receipt.json"), JSON.stringify(receipt, null, 2) + "\n");
console.log(`verify: ${allPassed ? "PASS" : "FAIL"} (${results.filter((s) => !s.ok).length} failed) for ${receipt.sha.slice(0, 8)}`);
process.exit(allPassed ? 0 : 1);
