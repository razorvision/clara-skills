import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

export const LICENSE_ID = "Apache-2.0";

export function skillNames(root) {
  const dir = join(root, "skills");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => statSync(join(dir, n)).isDirectory() && existsSync(join(dir, n, "SKILL.md")))
    .sort();
}

export function agentNames(root) {
  const dir = join(root, "agents");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => n.endsWith(".md"))
    .map((n) => n.slice(0, -3))
    .sort();
}

// Reads the flat top-level keys of a SKILL.md header plus the one nested map the
// standard allows (metadata). Enough for the gates; skills-ref does full validation.
export function frontmatter(file) {
  const text = readFileSync(file, "utf8");
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error(`${file}: no YAML frontmatter`);
  const out = {};
  let nested = null;
  for (const line of m[1].split(/\r?\n/)) {
    const top = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (top) {
      const value = unquote(stripComment(top[2]));
      if (value === "") {
        nested = out[top[1]] = {};
      } else {
        out[top[1]] = value;
        nested = null;
      }
      continue;
    }
    const sub = line.match(/^\s+([\w./-]+):\s*(.*)$/);
    if (sub && nested) nested[sub[1]] = unquote(stripComment(sub[2]));
  }
  return out;
}

function stripComment(v) {
  return v.replace(/\s+#.*$/, "").trim();
}

function unquote(v) {
  const q = v.match(/^(["'])(.*)\1$/);
  return q ? q[2] : v;
}

export function readJson(root, rel) {
  return JSON.parse(readFileSync(join(root, rel), "utf8"));
}

export function report(name, errors) {
  if (errors.length) {
    for (const e of errors) console.error(`${name}: ${e}`);
    console.error(`${name}: FAIL (${errors.length})`);
    return 1;
  }
  console.log(`${name}: PASS`);
  return 0;
}
