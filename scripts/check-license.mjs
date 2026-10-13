#!/usr/bin/env node
// LICENSE, every manifest that declares a license, and every SKILL.md must agree.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { LICENSE_ID, skillNames, frontmatter, readJson, report } from "./lib.mjs";

const MANIFESTS = [".claude-plugin/plugin.json", ".cursor-plugin/plugin.json", ".devin-plugin/plugin.json"];

export function checkLicense(root) {
  const errors = [];
  const licenseFile = join(root, "LICENSE");
  if (!existsSync(licenseFile)) {
    errors.push("LICENSE file is missing");
  } else if (!/Apache License\s+Version 2\.0/.test(readFileSync(licenseFile, "utf8"))) {
    errors.push(`LICENSE is not the ${LICENSE_ID} text`);
  }
  for (const rel of MANIFESTS) {
    if (!existsSync(join(root, rel))) continue;
    const license = readJson(root, rel).license;
    if (license !== undefined && license !== LICENSE_ID) {
      errors.push(`${rel}: license is "${license}", expected "${LICENSE_ID}"`);
    }
  }
  if (!existsSync(join(root, ".claude-plugin/plugin.json"))) {
    errors.push(".claude-plugin/plugin.json is missing");
  } else if (readJson(root, ".claude-plugin/plugin.json").license !== LICENSE_ID) {
    errors.push(`.claude-plugin/plugin.json must declare license "${LICENSE_ID}"`);
  }
  for (const name of skillNames(root)) {
    const license = frontmatter(join(root, "skills", name, "SKILL.md")).license;
    if (license !== LICENSE_ID) {
      errors.push(`skills/${name}/SKILL.md: license is "${license ?? "(missing)"}", expected "${LICENSE_ID}"`);
    }
  }
  return errors;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(report("license-consistency", checkLicense(process.argv[2] ?? ".")));
}
