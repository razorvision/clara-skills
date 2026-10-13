---
name: <folder-name-lowercase-hyphens>
description: <What the skill does, in third person, one or two sentences. Then the trigger: Use when the user asks for <X>, mentions <Y>, or needs <Z>.>
license: Apache-2.0
compatibility: <Delete this line unless the skill needs something specific, e.g. "Designed for Clara Studio via its MCP server (clara). Requires git.">
metadata:
  version: "0.1.0" # x-release-please-version
  owner: razorvision
---

# <Skill title>

<!-- One or two lines: what this produces and for whom. No marketing. -->

## Before you start

<!-- Preconditions and the probe. Delete if the skill needs nothing. -->
1. Call `clara:fetch` with entity `user` and id `me`. If it fails, tell the user to connect Clara Studio under Connectors and stop.
2. Confirm <the input the skill needs> is present. If not, ask for it once and stop.

## Steps

<!-- Numbered, concrete, complete. One recommended path; name the exception where it exists. -->
1. <Do the first thing. Name the exact tool or command.>
2. <Do the next thing.> If <condition>, read `references/<file>.md` first.
3. <Produce the output using the format below.>

## Output

<!-- The shape of the result. Keep it short; move long templates to assets/. -->
- <Field or section 1>
- <Field or section 2>

## Edge cases

<!-- Only the ones that change behaviour. -->
- <Situation>: <what to do instead>.

## Files

<!-- Tell the agent when to open each file, not just that it exists. -->
- `references/<topic>.md`: read when <specific trigger>.
- `scripts/<name>.sh`: run from the skill root to <purpose>; it prints <what> and exits non-zero on <failure>.
