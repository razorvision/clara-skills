# clara-skills

**RazorVision's open agent skills and code-review agents, in the [Agent Skills](https://agentskills.io) format, with an optional connection to [Clara Studio](https://clarastudio.ai).**

- 15 skills (14 working skills plus the `clara-overview` router) and 6 subagents.
- Every `SKILL.md` uses only the standard header fields, so the same file loads in Claude Code, Codex, Gemini CLI, Cursor, Devin, GitHub Copilot and other Agent Skills hosts.
- Apache-2.0. None of the skills needs Clara; Clara adds issues, projects and documents through its MCP server.

## Install

**Claude Code (skills, agents and the Clara MCP server):**

```
/plugin install clara --marketplace razorvision/clara-skills
```

On older Claude Code versions, add the marketplace first:

```
claude plugin marketplace add razorvision/clara-skills
claude plugin install clara@razorvision
```

**Any Agent Skills host (skills only; no agents, no MCP server):**

```
npx skills add razorvision/clara-skills
```

**Gemini CLI (skills and the Clara MCP server; the agents are Claude Code format and do not load):** `gemini extensions install https://github.com/razorvision/clara-skills`

**Cursor and Devin** read the manifests in `.cursor-plugin/` and `.devin-plugin/`. **Codex** reads `skills/` plus the `agents/openai.yaml` beside a skill.

## What's inside

Ask for `clara-overview` (or read [its SKILL.md](skills/clara-overview/SKILL.md)) for when to use each one.

| Skills | |
|---|---|
| Delivery | `changelog`, `fix-pr`, `staleness-check` |
| Design and architecture | `design-council`, `software-architecture`, `html-css-design` |
| Code quality | `root-cause`, `testing`, `typescript`, `performance` |
| Research and data | `deep-research`, `postgres`, `prompt-engineering`, `domain-picker` |

| Agents | |
|---|---|
| Adversarial review | `reviewer-architect` + `reviewer-security` as a pair, or `reviewer-frontend` alone for a frontend-only diff |
| Design council seats | `product-expert`, `frontend-design-expert`, `backend-expert` |

Skills that run a project's tests or checks find the commands through [references/verify-commands.md](references/verify-commands.md).

## Connect Clara Studio (optional)

The Claude Code plugin registers the server for you; sign in through `/mcp`. Anywhere else, add a remote HTTP MCP server:

- **Name:** `clara`
- **URL:** `https://mcp.clarastudio.ai/mcp/v3`
- **Auth:** sign in with your Clara account (OAuth).

Full guide: https://app.clarastudio.ai/docs/tools/connect-clara-mcp-to-claude-code

## Safety notes

- **No skill pre-approves a tool.** None carries `allowed-tools`, so your host asks before anything it would normally ask about.
- **The reviewer agents read untrusted diffs and have Bash** (for `git diff`, `git log`). Run them on someone else's PR only in a disposable checkout or worktree, and never in a mode that skips permission prompts.
- **The design-council seats can browse the web** while holding your brief. Leave out secrets and confidential data you would not paste into a search engine.
- **`fix-pr` only acts on reviews from people with write access to the repository (it checks)** and shows you its plan before editing; it will not change scripts, dependencies or CI from a comment without your yes.
- **Connecting Clara is optional.** The plugin registers the server, but no workspace data is exchanged until you sign in. Once signed in, Clara Studio may ask your agent to log session activity and token usage to your Clara workspace; see the Clara guide below.

## Recommended companion skills

These are not ours, so this repo does not copy them. Install them from their authors:

| Source | Install | Good for |
|---|---|---|
| [vercel/components.build](https://github.com/vercel/components.build) | `npx skills add vercel/components.build` | `building-components`: accessible, composable UI components |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `npx skills add vercel-labs/agent-skills` | `web-design-guidelines`: UI review against Vercel's guidelines |
| [anthropics/skills](https://github.com/anthropics/skills) | `npx skills add anthropics/skills` | Document skills, `frontend-design`, `skill-creator` |
| [mattpocock/skills](https://github.com/mattpocock/skills) | `npx skills add mattpocock/skills` | TDD, code review, codebase design, diagnosis |
| [kylezantos/design-motion-principles](https://github.com/kylezantos/design-motion-principles) | `npx skills add kylezantos/design-motion-principles` | Auditing UI motion |

## Contributing

- Start from [templates/](templates/) and read the [skill-writing guide](docs/skill-writing-guide.md).
- Add the new skill to the `clara-overview` tables; CI fails if the router misses a skill or agent.
- PRs are squash-merged, so the **PR title** must be a [Conventional Commit](https://www.conventionalcommits.org). A change to anything that ships (`skills/`, `agents/`, `references/`, the manifests) needs `feat:`, `fix:`, `perf:` or `revert:` so a release carries it (write a breaking change as `feat!:` or `fix!:`); CI enforces this.
- Do not bump versions by hand. Release Please opens a release PR that bumps every manifest and each skill's `metadata.version` together. A new skill starts at the repo's current version, with the `# x-release-please-version` comment from the template; CI checks both.
- A skill never links outside its own folder. Shared files live in `references/` and are copied into each skill that uses them; CI checks the copies match.

Local checks (Node 22+, Python 3.11+ with `pip install skills-ref==0.1.1`): commit, then run `npm run verify`. It runs everything CI runs and needs a clean working tree.

## License

[Apache-2.0](LICENSE). Copyright RazorVision.
