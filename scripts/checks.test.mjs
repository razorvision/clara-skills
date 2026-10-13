// Each gate is exercised in both directions: a passing fixture and the failure it exists to catch.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { checkLicense } from "./check-license.mjs";
import { checkRouter } from "./check-router.mjs";
import { checkSync, checkBump } from "./check-version.mjs";
import { checkConsistency } from "./check-consistency.mjs";

const APACHE = "                                 Apache License\n                           Version 2.0, January 2004\n";

function skill(name, { license = "Apache-2.0", version = "0.1.0", body = "", marker = true } = {}) {
  return `---\nname: ${name}\ndescription: Does ${name}. Use when testing.\nlicense: ${license}\nmetadata:\n  version: "${version}"${marker ? " # x-release-please-version" : ""}\n  owner: razorvision\n---\n\n# ${name}\n${body}`;
}

const ROUTER_BODY = "\n| Skill | Use when |\n|---|---|\n| `alpha` | a |\n\n| Agent | Use when |\n|---|---|\n| `reviewer-x` | r |\n";

function fixture(overrides = {}) {
  const files = {
    LICENSE: APACHE,
    ".release-please-manifest.json": JSON.stringify({ ".": "0.1.0" }),
    ".claude-plugin/plugin.json": JSON.stringify({ name: "clara", version: "0.1.0", license: "Apache-2.0" }),
    "gemini-extension.json": JSON.stringify({ name: "clara", version: "0.1.0" }),
    "skills/alpha/SKILL.md": skill("alpha"),
    "skills/clara-overview/SKILL.md": skill("clara-overview", { body: ROUTER_BODY }),
    "agents/reviewer-x.md": "---\nname: reviewer-x\n---\n",
    ...overrides,
  };
  const root = mkdtempSync(join(tmpdir(), "clara-skills-"));
  for (const [rel, content] of Object.entries(files)) {
    if (content === null) continue;
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), content);
  }
  return root;
}

function withFixture(overrides, fn) {
  const root = fixture(overrides);
  try {
    return fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("license: consistent fixture passes", () => {
  withFixture({}, (root) => assert.deepEqual(checkLicense(root), []));
});

test("license: a SKILL.md under another license fails", () => {
  withFixture({ "skills/alpha/SKILL.md": skill("alpha", { license: "MIT" }) }, (root) => {
    assert.match(checkLicense(root).join("\n"), /skills\/alpha\/SKILL\.md: license is "MIT"/);
  });
});

test("license: a manifest under another license fails", () => {
  const manifest = JSON.stringify({ name: "clara", version: "0.1.0", license: "MIT" });
  withFixture({ ".claude-plugin/plugin.json": manifest }, (root) => {
    assert.match(checkLicense(root).join("\n"), /plugin\.json/);
  });
});

test("license: a non-Apache LICENSE file fails", () => {
  withFixture({ LICENSE: "MIT License\n" }, (root) => {
    assert.match(checkLicense(root).join("\n"), /LICENSE is not/);
  });
});

test("router: names every skill and agent, passes", () => {
  withFixture({}, (root) => assert.deepEqual(checkRouter(root), []));
});

test("router: a skill missing from the router fails", () => {
  withFixture({ "skills/beta/SKILL.md": skill("beta") }, (root) => {
    assert.match(checkRouter(root).join("\n"), /no table row for skill `beta`/);
  });
});

test("router: an agent missing from the router fails", () => {
  withFixture({ "agents/reviewer-y.md": "---\nname: reviewer-y\n---\n" }, (root) => {
    assert.match(checkRouter(root).join("\n"), /no table row for agent `reviewer-y`/);
  });
});

test("router: a routed name that does not ship fails", () => {
  withFixture({ "skills/alpha/SKILL.md": null }, (root) => {
    assert.match(checkRouter(root).join("\n"), /names `alpha`, which does not ship/);
  });
});

test("version sync: matching versions pass", () => {
  withFixture({}, (root) => assert.deepEqual(checkSync(root), []));
});

test("version sync: a drifted SKILL.md version fails", () => {
  withFixture({ "skills/alpha/SKILL.md": skill("alpha", { version: "0.0.9" }) }, (root) => {
    assert.match(checkSync(root).join("\n"), /skills\/alpha\/SKILL\.md: metadata\.version "0\.0\.9"/);
  });
});

test("version sync: a drifted manifest version fails", () => {
  withFixture({ "gemini-extension.json": JSON.stringify({ name: "clara", version: "0.2.0" }) }, (root) => {
    assert.match(checkSync(root).join("\n"), /gemini-extension\.json/);
  });
});

test("version sync: before the first release, initial-version is the expected version", () => {
  const config = JSON.stringify({ packages: { ".": { "initial-version": "0.1.0" } } });
  withFixture({ ".release-please-manifest.json": "{}", "release-please-config.json": config }, (root) => {
    assert.deepEqual(checkSync(root), []);
  });
  const later = JSON.stringify({ packages: { ".": { "initial-version": "0.2.0" } } });
  withFixture({ ".release-please-manifest.json": "{}", "release-please-config.json": later }, (root) => {
    assert.ok(checkSync(root).length > 0);
  });
});

test("version sync: no manifest entry and no initial-version fails", () => {
  withFixture({ ".release-please-manifest.json": "{}" }, (root) => {
    assert.match(checkSync(root).join("\n"), /no version/);
  });
});

test("version bump: shipped change with feat title passes", () => {
  assert.deepEqual(checkBump({ changedFiles: ["skills/alpha/SKILL.md"], subjects: [], prTitle: "feat: sharper alpha" }), []);
});

test("version bump: shipped change with docs title fails", () => {
  const errors = checkBump({ changedFiles: ["skills/alpha/SKILL.md"], subjects: ["feat: x"], prTitle: "docs: tweak" });
  assert.equal(errors.length, 1);
});

test("version bump: breaking feat passes, breaking chore does not release", () => {
  assert.deepEqual(checkBump({ changedFiles: ["agents/a.md"], subjects: ["feat(agents)!: rename"] }), []);
  assert.equal(checkBump({ changedFiles: ["agents/a.md"], subjects: ["chore!: rename"] }).length, 1);
});

test("version bump: revert releases", () => {
  assert.deepEqual(checkBump({ changedFiles: ["agents/a.md"], subjects: ["revert: undo x"] }), []);
});

test("version bump: shipped change with only chore commits fails", () => {
  assert.equal(checkBump({ changedFiles: [".mcp.json"], subjects: ["chore: x", "docs: y"] }).length, 1);
});

test("version bump: unshipped change needs no release", () => {
  assert.deepEqual(checkBump({ changedFiles: ["README.md", "scripts/lib.mjs"], subjects: ["docs: x"] }), []);
});

test("version bump: the Release Please PR is exempt", () => {
  const pr = { changedFiles: ["skills/alpha/SKILL.md"], subjects: [], prTitle: "chore(main): release 0.2.0" };
  assert.deepEqual(checkBump({ ...pr, headRef: "release-please--branches--main" }), []);
});

test("version bump: a human PR titled like a release is not exempt", () => {
  const pr = { changedFiles: ["skills/alpha/SKILL.md"], subjects: [], prTitle: "chore: release notes tweak" };
  assert.equal(checkBump({ ...pr, headRef: "feat/x" }).length, 1);
});

test("version sync: a SKILL.md without the release marker fails", () => {
  withFixture({ "skills/alpha/SKILL.md": skill("alpha", { marker: false }) }, (root) => {
    assert.match(checkSync(root).join("\n"), /lacks the "# x-release-please-version" marker/);
  });
});

test("router: a skill named only in prose, not a table row, fails", () => {
  const body = ROUTER_BODY + "\nSee also `beta`.\n";
  withFixture({ "skills/beta/SKILL.md": skill("beta"), "skills/clara-overview/SKILL.md": skill("clara-overview", { body }) }, (root) => {
    assert.match(checkRouter(root).join("\n"), /no table row for skill `beta`/);
  });
});

const REF = "# Verify commands\n";
const V3 = JSON.stringify({ mcpServers: { clara: { type: "http", url: "https://mcp.clarastudio.ai/mcp/v3" } } });

test("consistency: identical reference copy and one MCP URL pass", () => {
  withFixture({ "references/verify-commands.md": REF, "skills/alpha/references/verify-commands.md": REF, ".mcp.json": V3 }, (root) => {
    assert.deepEqual(checkConsistency(root), []);
  });
});

test("consistency: a drifted reference copy fails", () => {
  withFixture({ "references/verify-commands.md": REF, "skills/alpha/references/verify-commands.md": REF + "edited\n" }, (root) => {
    assert.match(checkConsistency(root).join("\n"), /differs from references\/verify-commands\.md/);
  });
});

test("consistency: a link outside the skill folder fails", () => {
  const body = "\nSee [x](../../references/verify-commands.md).\n";
  withFixture({ "skills/alpha/SKILL.md": skill("alpha", { body }) }, (root) => {
    assert.match(checkConsistency(root).join("\n"), /links outside its skill folder/);
  });
});

test("consistency: two different MCP URLs fail", () => {
  const gemini = JSON.stringify({ name: "clara", version: "0.1.0", mcpServers: { clara: { httpUrl: "https://mcp.clarastudio.ai/mcp/v2" } } });
  withFixture({ ".mcp.json": V3, "gemini-extension.json": gemini }, (root) => {
    assert.match(checkConsistency(root).join("\n"), /MCP URL differs/);
  });
});

test("consistency: a link to a reference the skill does not carry fails", () => {
  const body = "\nSee [x](references/verify-commands.md).\n";
  withFixture({ "skills/alpha/SKILL.md": skill("alpha", { body }) }, (root) => {
    assert.match(checkConsistency(root).join("\n"), /links to a missing file/);
  });
});

test("consistency: inline code mentioning ../ is not a link", () => {
  withFixture({ "skills/alpha/SKILL.md": skill("alpha", { body: "\nRun `ls ../src`.\n" }) }, (root) => {
    assert.deepEqual(checkConsistency(root), []);
  });
});

test("version sync: a marker only in the body does not count", () => {
  const body = '\n```yaml\n  version: "0.1.0" # x-release-please-version\n```\n';
  withFixture({ "skills/alpha/SKILL.md": skill("alpha", { marker: false, body }) }, (root) => {
    assert.match(checkSync(root).join("\n"), /lacks the "# x-release-please-version" marker/);
  });
});

test("consistency: a placeholder link inside a code block is an example, not a link", () => {
  const body = "\n```markdown\n[review](<link>) and [x](url)\n```\n";
  withFixture({ "skills/alpha/SKILL.md": skill("alpha", { body }) }, (root) => {
    assert.deepEqual(checkConsistency(root), []);
  });
});

for (const [label, link] of [
  ["titled", '[x](../../README.md "title")'],
  ["angle-bracketed", "[x](<../my file.md>)"],
  ["reference-style", "[x]: ../../README.md"],
  ["root-absolute", "[x](/references/verify-commands.md)"],
]) {
  test(`consistency: a ${label} link outside the skill folder fails`, () => {
    withFixture({ "skills/alpha/SKILL.md": skill("alpha", { body: `\n${link}\n` }) }, (root) => {
      assert.ok(checkConsistency(root).length > 0, link);
    });
  });
}

test("consistency: an indented closing fence still ends the code block", () => {
  const body = "\n```bash\necho hi\n   ```\n\nSee [x](../../README.md).\n\n```\nx\n```\n";
  withFixture({ "skills/alpha/SKILL.md": skill("alpha", { body }) }, (root) => {
    assert.match(checkConsistency(root).join("\n"), /links outside its skill folder/);
  });
});

test("consistency: footnotes, URLs and fragments are not file links", () => {
  const body = "\n[^1]: See the docs.\n[a](https://example.com) [b](#steps)\n";
  withFixture({ "skills/alpha/SKILL.md": skill("alpha", { body }) }, (root) => {
    assert.deepEqual(checkConsistency(root), []);
  });
});

test("version sync: an unquoted marked version is accepted", () => {
  const text = skill("alpha").replace('version: "0.1.0"', "version: 0.1.0");
  withFixture({ "skills/alpha/SKILL.md": text }, (root) => assert.deepEqual(checkSync(root), []));
});
