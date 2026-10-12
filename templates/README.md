# Starter templates

Two starting points for a new skill. Copy a folder to `skills/<your-skill-name>/`, rename nothing but the folder, replace every `<...>` placeholder, and delete the HTML comments. The writing guide is in [docs/skill-writing-guide.md](../docs/skill-writing-guide.md).

- `full-skill/`: the default for a skill in this repository.
- `minimal-skill/`: a quick personal skill. Add `license` and `metadata` before contributing it here.

## Checklist before opening a PR

- Folder name equals `name`; lowercase, digits, hyphens; no leading, trailing, or double hyphens; 64 characters or fewer.
- Description under 1024 characters, says what and when, includes the words a user would type.
- No header fields beyond the six standard ones.
- `metadata.version` equals the repo's current version (see `.claude-plugin/plugin.json`) and keeps its `# x-release-please-version` comment.
- Body under 500 lines; detail moved to `references/` with a "read when" sentence.
- Any Clara dependency declared in `compatibility` and probed in "Before you start".
- No link outside the skill folder; copy a shared file from `references/` into the skill's own `references/` (CI checks the copies match).
- `agentskills validate skills/<folder>` passes (from `pip install skills-ref`).
- `clara-overview` lists the new skill (CI checks this).
