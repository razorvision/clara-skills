#!/usr/bin/env node
// Hosts such as `npx skills add`, Codex and claude.ai install one skill folder on its own,
// so a skill must not link outside its folder. Shared references are copied in, and the
// copies must not drift from the canonical file at references/. The Clara MCP URL is
// repeated across every host adapter and must agree everywhere.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative, resolve, dirname, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { skillNames, report } from "./lib.mjs";

const URL_FILES = [
  ".mcp.json",
  ".cursor-plugin/plugin.json",
  "gemini-extension.json",
  "skills/clara-overview/SKILL.md",
  "skills/clara-overview/agents/openai.yaml",
  "README.md",
];
const MCP_URL = /https:\/\/mcp\.clarastudio\.ai\/mcp\/[A-Za-z0-9/._-]*/g;

function files(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

export function checkConsistency(root) {
  const errors = [];
  const sharedDir = join(root, "references");
  const shared = existsSync(sharedDir) ? files(sharedDir).map((f) => relative(sharedDir, f)) : [];

  for (const name of skillNames(root)) {
    const skillDir = join(root, "skills", name);
    for (const file of files(skillDir).filter((f) => f.endsWith(".md"))) {
      const rel = relative(root, file);
      const text = readFileSync(file, "utf8").replace(/^ {0,3}(```|~~~)[\s\S]*?^ {0,3}\1/gm, "");
      // Markdown links and reference-style definitions; inline code is prose, not a link.
      // Inline links (optionally <bracketed> and/or with a title) and reference definitions.
      const links = [
        ...text.matchAll(/\]\(\s*(?:<([^>]*)>|([^)\s]+))(?:\s+["'(][^)]*)?\)|^ {0,3}\[(?!\^)[^\]]+\]:\s*<?([^\s>]+)>?/gm),
      ].map((m) => m[1] ?? m[2] ?? m[3]);
      for (const link of links) {
        if (/^([a-z][a-z0-9+.-]*:|#)/i.test(link)) continue;
        if (link.startsWith("/")) {
          errors.push(`${rel}: root-absolute link breaks when the skill is installed alone (${link})`);
          continue;
        }
        const target = resolve(dirname(file), link.split("#")[0]);
        if (target !== resolve(skillDir) && !target.startsWith(resolve(skillDir) + sep)) {
          errors.push(`${rel}: links outside its skill folder (${link})`);
        } else if (!existsSync(target)) {
          errors.push(`${rel}: links to a missing file (${link}); copy shared files from references/`);
        }
      }
    }
    for (const ref of shared) {
      const copy = join(skillDir, "references", ref);
      if (existsSync(copy) && readFileSync(copy, "utf8") !== readFileSync(join(sharedDir, ref), "utf8")) {
        errors.push(`skills/${name}/references/${ref} differs from references/${ref}; copy the canonical file`);
      }
    }
  }

  const seen = new Map();
  for (const rel of URL_FILES) {
    if (!existsSync(join(root, rel))) continue;
    for (const [url] of readFileSync(join(root, rel), "utf8").matchAll(MCP_URL)) {
      if (!seen.has(url)) seen.set(url, rel);
    }
  }
  if (seen.size > 1) {
    errors.push(`Clara MCP URL differs across adapters: ${[...seen].map(([u, f]) => `${u} (${f})`).join(", ")}`);
  }
  return errors;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(report("consistency", checkConsistency(process.argv[2] ?? ".")));
}
