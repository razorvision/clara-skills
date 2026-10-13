---
name: design-council
description: Convenes a three-consultant design council (product, frontend design, and backend experts) to shape a feature or change before it is built. Spawns the three in parallel and synthesizes their input into one view, surfacing conflicts as decisions. Use when planning or discussing building, adding, changing, or redesigning a feature, page, endpoint, schema, or flow, or when the user says "design council", "consult the experts", or "shape this".
license: Apache-2.0
compatibility: Requires a host that can spawn subagents (for example the Claude Code Agent tool) and the product-expert, frontend-design-expert and backend-expert agents. The Claude Code plugin installs them; a skills-only install does not.
metadata:
  version: "0.1.0" # x-release-please-version
  owner: razorvision
---

# Design Council

Three expert consultants shape a proposed change **before** it is finalized. The three consultant agents ship with this plugin in `agents/`:

- **product-expert**: real user value, scope/MVP, simpler alternatives, flow edge cases
- **frontend-design-expert**: UX, component reuse, design-system fit, accessibility, responsive, anti-generic aesthetics
- **backend-expert**: data model, contracts, performance, failure modes, security, blast radius, architecture fit

## Usage

`/design-council [what we're building or changing]`. The argument is optional; if empty, use the current conversation or plan context.

## Step 1: Gauge proportionality

Do **not** run a full council on trivial work.

| Change size | Action |
| --- | --- |
| Trivial (typo, rename, one-liner, config tweak) | Skip the council. Say so in one line and proceed. |
| Small / single-lens (pure backend tweak, copy change, isolated style fix) | Convene only the one relevant consultant, or just note the consideration inline. |
| Substantive (new feature/page, schema or contract change, cross-cutting refactor, new flow) | Full three-consultant fan-out below. |

When unsure, prefer convening for anything beyond a one-liner.

## Step 2: Convene in parallel

**First, embed any doc content the consultants can't read locally.** The consultants are restricted to local reads (`Read`/`Grep`/`Glob`) plus web; they cannot reach documents behind an MCP server, a ticketing system, or any source that needs a tool they don't have. You (the orchestrator) can. Before spawning, identify every document the review depends on that the consultants can't reach themselves (an MCP-hosted ADR or solution design, a ticket, a source behind auth or a tool they lack), fetch its content with your own tools, and embed the pertinent text inline in each consultant's brief. Otherwise the consultants silently fall back to your summary and the review is degraded. Keep it proportional: embed only the docs the review actually turns on, and for a very large doc include the pertinent sections rather than the whole file.

Spawn the relevant consultants **in a single message** (parallel) via the Agent tool; do not serialize them:

- `subagent_type: product-expert`
- `subagent_type: frontend-design-expert`
- `subagent_type: backend-expert`

Use the name exactly as your host lists it: installed through the Claude Code plugin the agents are `clara:product-expert`, `clara:frontend-design-expert` and `clara:backend-expert`. If none of the three is available, tell the user they come with the `clara` plugin from `razorvision/clara-skills`, then run the council yourself, writing each seat's view in turn.

Hand each the **same brief**:
- What we're building/changing (the argument or current context).
- The relevant files/paths and any constraints, ADRs, or prior decisions already known, so they don't re-discover from scratch.
- The full text of any non-repo document the review depends on (fetched above), embedded inline, not just a reference to it.
- The active repo root, so they can read its `CLAUDE.md`/`docs/`.
- A reminder to return their standard output contract: **Top recommendations · Risks / concerns · Simpler alternative · Confidence + Why**.

For a single-lens change, spawn only the consultant whose domain it touches.

## Step 3: Synthesize

Merge the returns into ONE view for the user. Do not dump three raw reports.

- **Consensus**: what the consultants agree on (the recommended direction).
- **Conflicts**: where they disagree (e.g. product wants MVP-now vs backend wants the migration done right). Present each conflict as a decision for the user; **never resolve it silently**.
- **Recommended approach**: your synthesized recommendation, with a combined **Confidence + Why**.
- **Open decisions**: anything the user must choose before building.

## Step 4: Feed into the work

- **In plan mode:** fold the synthesis into the plan's design/approach section before finalizing.
- **In discussion:** present the synthesis inline and continue shaping with the user.

## Notes

- Consultants are read-only (they advise, never edit). If a consultant can't reach the codebase or returns nothing useful, say so rather than fabricating its view.
- This composes with a plan-mode explore/plan workflow: it shapes the design the plan documents, it doesn't replace exploration.
- Scale effort to the change. The council is a quality gate, not a tax on every keystroke.
