#!/usr/bin/env node
// Two checks that together stop a shipped change from reaching nobody:
//  1. sync: every version the hosts read (plugin manifests, gemini-extension.json, each
//     SKILL.md metadata.version) equals the Release Please manifest. Hosts cache by
//     version, so a drifted copy keeps serving the old skill.
//  2. bump: a change to shipped content must land with a release-triggering conventional
//     type, or Release Please never bumps the version. The repo squash-merges with the PR
//     title as the commit subject, so the PR title is checked when given; otherwise the commits.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { skillNames, frontmatter, readJson, report } from "./lib.mjs";

const VERSIONED_JSON = [
  ".claude-plugin/plugin.json",
  ".cursor-plugin/plugin.json",
  ".devin-plugin/plugin.json",
  "gemini-extension.json",
];

export const SHIPPED = /^(skills\/|agents\/|references\/|\.mcp\.json$|\.claude-plugin\/|\.cursor-plugin\/|\.devin-plugin\/|gemini-extension\.json$)/;
// House rule: a shipped change uses one of Release Please's releasing types. A breaking
// change is written `feat!:` or `fix!:`, not `chore!:`, so the gate never depends on how
// Release Please treats breaking commits of hidden types.
const RELEASING = /^(feat|fix|perf|revert)(\([^)]*\))?!?: /;
const MARKER = /^\s+version:\s*["']?[^"'\s]+["']?\s*#\s*x-release-please-version\s*$/m;

export function checkSync(root) {
  const errors = [];
  if (!existsSync(join(root, ".release-please-manifest.json"))) {
    return [".release-please-manifest.json is missing"];
  }
  // Before the first release the manifest is empty and the config's initial-version is the truth.
  const expected =
    readJson(root, ".release-please-manifest.json")["."] ??
    (existsSync(join(root, "release-please-config.json"))
      ? readJson(root, "release-please-config.json").packages?.["."]?.["initial-version"]
      : undefined);
  if (!expected) return ["no version: .release-please-manifest.json has no \".\" entry and no initial-version is configured"];
  for (const rel of VERSIONED_JSON) {
    if (!existsSync(join(root, rel))) continue;
    const v = readJson(root, rel).version;
    if (v !== expected) errors.push(`${rel}: version "${v}", expected "${expected}"`);
  }
  for (const name of skillNames(root)) {
    const file = join(root, "skills", name, "SKILL.md");
    const v = frontmatter(file).metadata?.version;
    if (v !== expected) errors.push(`skills/${name}/SKILL.md: metadata.version "${v}", expected "${expected}"`);
    // Without the marker Release Please's generic updater skips the file and it drifts.
    const header = readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
    if (!MARKER.test(header)) {
      errors.push(`skills/${name}/SKILL.md: metadata.version line lacks the "# x-release-please-version" marker`);
    }
  }
  return errors;
}

export function checkBump({ changedFiles, subjects, prTitle, headRef }) {
  const shipped = changedFiles.filter((f) => SHIPPED.test(f));
  if (shipped.length === 0) return [];
  // Release Please's own PR is the bump; it always comes from a release-please-- branch.
  if (prTitle && /^chore(\([^)]*\))?: release /.test(prTitle) && headRef?.startsWith("release-please--")) return [];
  const candidates = prTitle ? [prTitle] : subjects;
  if (candidates.some((s) => RELEASING.test(s))) return [];
  const where = prTitle ? `the PR title "${prTitle}" does not` : "no commit subject does";
  return [
    `${shipped.length} shipped file(s) changed (e.g. ${shipped[0]}) but ${where} start with feat:, fix:, perf: or revert:, so no release would carry the change`,
  ];
}

function git(root, args) {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).split("\n").filter(Boolean);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [mode, root = ".", base] = process.argv.slice(2);
  if (mode === "sync") {
    process.exit(report("version-sync", checkSync(root)));
  } else if (mode === "bump") {
    if (!base) {
      console.error("usage: check-version.mjs bump <root> <base-ref>");
      process.exit(2);
    }
    const errors = checkBump({
      changedFiles: git(root, ["diff", "--name-only", `${base}...HEAD`]),
      subjects: git(root, ["log", "--format=%s", `${base}..HEAD`]),
      prTitle: process.env.PR_TITLE || undefined,
      headRef: process.env.HEAD_REF || undefined,
    });
    process.exit(report("version-bump", errors));
  } else {
    console.error("usage: check-version.mjs sync|bump <root> [base-ref]");
    process.exit(2);
  }
}
