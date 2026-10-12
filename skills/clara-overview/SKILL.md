---
name: clara-overview
description: Lists every skill and agent in the RazorVision clara-skills set, says when to use each one, and explains how to connect the Clara Studio MCP server. Use when the user asks what skills or agents are available, which skill fits a task, how to get started with this plugin, or how to connect Clara Studio.
license: Apache-2.0
compatibility: Works without Clara Studio. The Clara section needs the Clara MCP server at https://mcp.clarastudio.ai/mcp/v3, which the Claude Code plugin registers on install.
metadata:
  version: "0.1.0" # x-release-please-version
  owner: razorvision
  clara/display-name: Clara skills overview
---

# Clara skills overview

Route the user's task to the one skill or agent that fits it, then load that skill. If two fit, pick the narrower one and say why in one line.

## Skills

| Skill | Use when |
|---|---|
| `changelog` | Turning git commits into user-facing release notes. |
| `deep-research` | A question needs several sources: parallel research, a cited report. |
| `design-council` | Shaping a feature or change before building it, with product, frontend and backend views. |
| `domain-picker` | Naming a product and checking `.com` availability. |
| `fix-pr` | Working through review feedback on an open pull request. |
| `html-css-design` | Reviewing or styling a plain HTML/CSS site at desktop, tablet and mobile widths. |
| `performance` | Speeding up a Next.js App Router app. |
| `postgres` | Answering a question from a PostgreSQL database with read-only queries. |
| `prompt-engineering` | Writing or tightening a prompt, system instruction, or tool definition. |
| `root-cause` | A bug whose error surfaces far from where it starts. |
| `software-architecture` | Deciding where new code lives and how modules depend on each other. |
| `staleness-check` | After finishing a body of work: finding docs, indexes and records it should have updated. |
| `testing` | Writing, reviewing or debugging Vitest tests. |
| `typescript` | Writing or reviewing strict-mode TypeScript. |

## Agents

Agents are subagents a skill or the user dispatches; they read and report, never edit.

| Agent | Use when |
|---|---|
| `reviewer-architect` | Pre-push or PR review: blast radius, contracts, failure modes. Run with `reviewer-security`. |
| `reviewer-security` | Pre-push or PR review: authz, secrets, injection, infrastructure. Run with `reviewer-architect`. |
| `reviewer-frontend` | Pre-push or PR review of a frontend-only diff, instead of the pair above. |
| `product-expert` | The product seat of `design-council`. |
| `frontend-design-expert` | The frontend and UX seat of `design-council`. |
| `backend-expert` | The backend and architecture seat of `design-council`. |

Skills that run project commands (tests, typecheck, lint) carry their own `references/verify-commands.md`, which explains how they find the commands.

## Connecting Clara Studio

None of the skills above needs Clara. Clara Studio adds issues, projects, documents and its own skills through one MCP server.

1. Check the connection: call `clara:fetch` with entity `user` and id `me`. If it returns a user, Clara is connected; stop here.
2. If the tool is missing or the call fails, give the one step for the user's host:
   - **Claude Code with this plugin installed:** the server is already registered; run `/mcp`, pick `clara`, and sign in.
   - **Claude Code without the plugin:** `claude mcp add --transport http --scope user clara https://mcp.clarastudio.ai/mcp/v3`, then sign in through `/mcp`.
   - **Any other MCP host:** add a remote HTTP server named `clara` at `https://mcp.clarastudio.ai/mcp/v3` and sign in with your Clara account.
3. Point to the full guide for anything else: https://app.clarastudio.ai/docs/tools/connect-clara-mcp-to-claude-code

Clara is a commercial product; connecting needs a Clara Studio account.
