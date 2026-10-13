#!/usr/bin/env node
// The clara-overview router must name every shipped skill and agent, and name nothing
// that does not ship, so an agent reading it never routes to a missing skill.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { skillNames, agentNames, report } from "./lib.mjs";

export const ROUTER = "clara-overview";

export function checkRouter(root) {
  const file = join(root, "skills", ROUTER, "SKILL.md");
  if (!existsSync(file)) return [`skills/${ROUTER}/SKILL.md is missing`];
  const text = readFileSync(file, "utf8");
  const errors = [];
  const skills = skillNames(root).filter((n) => n !== ROUTER);
  const agents = agentNames(root);
  // Only a table row routes; a passing mention elsewhere in the prose does not count.
  const routed = new Set([...text.matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|/gm)].map((m) => m[1]));
  for (const name of skills) {
    if (!routed.has(name)) errors.push(`router has no table row for skill \`${name}\``);
  }
  for (const name of agents) {
    if (!routed.has(name)) errors.push(`router has no table row for agent \`${name}\``);
  }
  const known = new Set([...skills, ...agents]);
  for (const name of routed) {
    if (!known.has(name)) errors.push(`router names \`${name}\`, which does not ship`);
  }
  return errors;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(report("router-coverage", checkRouter(process.argv[2] ?? ".")));
}
