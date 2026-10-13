# How to write a skill

**Verdict: a skill is one folder with a `SKILL.md` file: six allowed header fields, a body under 500 lines that tells the agent what to do and when, and any detail moved into linked files. Follow that and the same skill loads in Claude, Codex, Gemini, Copilot, Cursor, Grok, and Clara.**

Written for anyone contributing a skill to this repository, engineer or not. Sources are the Agent Skills specification, Claude Code's skills documentation, and Anthropic's published skill-creator guidance (links at the end). Where two official sources disagree, both views are given.

## 1. The shape of a skill

```
my-skill/
  SKILL.md          required: header + instructions
  references/       optional: detail the agent reads only when needed
  scripts/          optional: runnable helpers
  assets/           optional: templates, images, data files
```

- The folder name is the skill name. Lowercase letters, digits, and hyphens only, max 64 characters, no leading, trailing, or double hyphens. `pdf-processing` is valid, `PDF-Processing` and `pdf--processing` are not.
- `SKILL.md` is uppercase and lives at the folder root.
- Keep file references one level deep: `references/api-errors.md`, never `references/a/b/c.md`.
- Never link outside the skill folder (`../`). Many hosts install one skill folder on its own, so the link would break; copy the file in instead.

## 2. The header (YAML frontmatter)

Only six fields exist in the standard. Anything else fails validation and breaks upload to claude.ai and the Gemini app, so this repository allows only these. This repository also leaves `allowed-tools` out of every skill it ships, so installing the set never pre-approves a tool.

| Field | Required | Rule | Example |
|---|---|---|---|
| `name` | Yes | Matches the folder name; the naming rule above | `clara-status-report` |
| `description` | Yes | 1 to 1024 characters; what it does AND when to use it, with the words a user would say | see section 3 |
| `license` | No | Short: a license name or a bundled file | `Apache-2.0` |
| `compatibility` | No | Up to 500 characters; only when the skill has real environment needs | `Designed for Clara Studio via its MCP server` |
| `metadata` | No | String-to-string map for your own tooling; use distinctive key names. In this repository it carries `version` (with a `# x-release-please-version` comment so releases bump it) and `owner` | `version: "0.1.0" # x-release-please-version` |
| `allowed-tools` | No | Experimental; space-separated pre-approved tools | `Bash(git:*) Read` |

Claude Code adds its own fields (`when_to_use`, `argument-hint`, `context: fork`, `paths`, `model`, and others). They are useful, but they belong in a host's adapter layer, never in the shared `SKILL.md`, because claude.ai rejects them on upload and other hosts ignore them.

## 3. Writing the description

The description is the only part of the skill the agent sees before deciding to use it, so it carries the trigger.

- Say what the skill does and when to use it, in that order.
- Include the specific words a user would type. "Use when the user mentions PDFs, forms, or document extraction" beats "helps with documents".
- Lean pushy. Agents under-trigger skills, so say "use this skill whenever..." rather than "can be used for".
- Keep it to a few sentences. The hard limit is 1024 characters.
- Point of view: the Agent Skills guide favours imperative phrasing ("Use this skill when..."); Anthropic's platform guide asks for third person ("Processes Excel files and generates reports"). Either is accepted everywhere. Pick one per repo and stay consistent; RazorVision uses third person for the what and "Use when..." for the trigger.

Good:

> Produces a weekly client status report from Clara issues, time entries, and project updates. Use when the user asks for a status report, weekly update, or client summary for a project.

Poor:

> Helps with reports.

## 4. Writing the body

- **Under 500 lines and roughly 5,000 tokens.** The whole body loads when the skill activates, so every line costs context on every use.
- **State what to do, not why the agent should care.** Numbered steps, concrete commands, expected outputs. Explain a why only where the agent would otherwise make the wrong call.
- **Tell the agent when to open each linked file.** "Read `references/api-errors.md` if the API returns a non-200 status" works; "see references/ for details" does not.
- **Provide defaults, not menus.** One recommended path, with the exception named.
- **Write complete instructions.** A skill cannot assume the previous turn's context. If it depends on a connection (the Clara MCP), open with a probe and the one-line fix: "Call `clara:fetch` with entity `user` and id `me`. If it fails, tell the user to connect Clara Studio under Connectors and stop."
- **Avoid shouting.** If you are writing ALWAYS or NEVER in capitals, the instruction is probably compensating for a missing explanation or a missing script.
- **Prefer a script to a long procedure.** Repeated, deterministic work goes in `scripts/` with clear error messages, no interactive prompts, pinned versions, and idempotent behaviour.

## 5. Supporting files

- `references/`: focused documents, each on one topic, loaded on demand. A reference over about 100 lines gets a table of contents at the top.
- `scripts/`: self-contained, documented dependencies, run from the skill root. Note that Claude Code does not auto-run them; the body must tell the agent to invoke them.
- `assets/`: templates and resources used in output, not read as instructions.

## 6. What not to do

- Generic filler the agent already knows ("handle errors appropriately").
- Mixing reference material into the task body; split it out.
- Time-sensitive statements; put them in an "Old patterns" note or a hook instead.
- Inconsistent terminology; pick one word per concept.
- Unqualified MCP tool names; write `clara:fetch`, not `fetch`.
- Secrets or credentials anywhere in the folder.
- Assuming a tool is installed; declare it in `compatibility` and probe for it.
- Names like `helper`, `utils`, `tools`, or anything containing `anthropic` or `claude`.

## 7. Validate before you publish

```
agentskills validate ./my-skill         # Agent Skills reference validator: pip install skills-ref (Python 3.11+)
claude plugin validate --strict ./       # Claude Code: marketplace, plugin, or skills folder
```

The reference validator rejects unknown header fields, bad names, and a description over 1024 characters. Claude Code's validator catches malformed YAML and plugin manifest errors. This repository runs both in CI.

## 8. Test it

Write two or three realistic prompts that should trigger the skill and one or two near misses that should not, before polishing the prose. Run the prompts with and without the skill and compare. Anthropic's skill-creator ships a full loop for this (`anthropics/skills`, `skills/skill-creator`); for most RazorVision skills, three prompts and a quick read of the transcript is enough.

## Sources

- Agent Skills specification: https://agentskills.io/specification
- Writing descriptions: https://agentskills.io/skill-creation/optimizing-descriptions
- Best practices and scripts: https://agentskills.io/skill-creation/best-practices, https://agentskills.io/skill-creation/using-scripts
- Reference validator: https://github.com/agentskills/agentskills (skills-ref)
- Claude Code skills: https://code.claude.com/docs/en/skills
- Claude Code plugin validator: https://code.claude.com/docs/en/plugins/cli-reference
- Anthropic platform best practices: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
- Anthropic skill-creator: https://github.com/anthropics/skills/tree/main/skills/skill-creator
