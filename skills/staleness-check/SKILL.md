---
name: staleness-check
description: Sweeps the repo and related sources for artifacts that a just-completed body of work should have updated but did not, such as stale doc indexes, READMEs, ADRs, registries, agent instruction files, agent memory files, issue status, and cross-references, then reports each stale item with a proposed fix. Use at the end of an epic, feature, or executed plan, or when the user says "staleness check", "did we miss anything", "are we done", or "anything stale".
license: Apache-2.0
metadata:
  version: "0.1.1" # x-release-please-version
  owner: razorvision
---

# Staleness Check

After a body of work, find every downstream artifact that references what changed and
confirm it still tells the truth. Catches "we forgot to update the index / registry / memory"
before it rots.

Not a bug hunt (use a code review for that). This finds *stale references*, not defects.

## Usage

Optionally name what was just finished (an epic, feature, or plan). With no argument, the
skill infers it from recent commits and merged PRs.

## Proportionality first

Skip for trivial work (typo, rename, one-liner, config tweak). Run the full sweep for an epic,
feature, multi-PR effort, a plan's full execution, or any brand / schema / contract / infra /
status change. When unsure, do the quick scan (step 2 on the touched area only).

## Procedure

### 1. Derive the entities the work touched

- `git log --oneline origin/<trunk>..HEAD` (or the recent merges) and `git diff --stat` for the
  body of work; note new/renamed files, changed identifiers, flipped statuses, decisions made.
- If the user named what finished, use that. Otherwise infer from recent commits / merged PRs
  and the issue references in them.

### 2. Sweep the usual suspects

For each entity, check where it is referenced and whether that reference is now stale:

- **In-repo**
  - `grep` the repo for the entity **names and file paths** (renamed file still linked? a
    "pending/TODO" now done? an old value or status?).
  - Doc indexes / READMEs with inventory or feature tables that list the changed thing.
  - ADRs recording the decision (add a status/outcome line if it was executed).
  - Agent instruction files (`CLAUDE.md`, `AGENTS.md`, and similar): invariants, structure,
    verification commands, pipeline facts.
  - Registries: operations runbooks, connection/integration registries, secrets inventories.
  - Changelog, roadmap, status/inventory tables.
- **Agent memory** (only if the agent host keeps persistent memory files for the project): the
  memory index and related files. Mark completed/superseded items, correct or delete now-wrong
  claims (especially "current focus" / "pending" notes).
  - A useful automated check, where a project has one: flag any memory entry that asserts
    outstanding work while citing an issue that is already closed.
  - Watch the index's own size: some hosts load only the first part of a memory index, so a
    bloated index can silently lose its last entries.
- **External** (only if touched): issue and label status in the tracker (use the project's own
  reconciliation tooling where it exists), and any connector registry, shared drive, or
  dashboard the work changed.

### 3. Report

Give a categorized list: `file:line` -> what is stale -> proposed fix. If nothing is stale, say
so explicitly (`swept <areas>, nothing stale`). Never end silent.

### 4. Fix (on approval)

- Repo changes ship through the repo's normal gated pipeline (usually a docs-only PR; follow
  the repo's contribution and verification rules where present).
- Memory edits are direct.
- Batch related fixes into one change rather than many tiny PRs.

## Composition

- Issue/label reconciliation tooling owns ticket staleness; this skill owns docs / registries /
  memory / cross-references. Run both after a big batch of merges.
- Pairs well with a team policy that a body of work is not "done" until this sweep reports,
  and with a hook that nudges it after a PR merge or issue close.
