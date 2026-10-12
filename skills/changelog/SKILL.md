---
name: changelog
description: Generates a polished, user-facing changelog from git commits, grouping them into features, improvements, fixes, and breaking changes and rewriting each in plain user language. Use when the user asks for a changelog, release notes from commits, or a summary of what changed since a tag, date, or commit range.
license: Apache-2.0
compatibility: Requires git and a local checkout of the repository.
metadata:
  version: "0.1.0" # x-release-please-version
  owner: razorvision
---

# Changelog Generator

Transform git commits into polished, user-friendly changelogs.

## Usage

`/changelog [scope]`, for example `since v1.0`, `past week`, or `between commits X and Y`.

## Process

1. **Determine scope** from the arguments (e.g., "since v1.0", "past week", "between commits X and Y"). If no scope given, use commits since last tag or last 7 days.

2. **Gather commits**:
   ```bash
   git log --oneline --no-merges <range>
   ```

3. **Categorize** each commit into:
   - **New Features** - New functionality (`add`, `feat`, `implement`)
   - **Improvements** - Enhancements to existing features (`update`, `improve`, `enhance`, `polish`)
   - **Bug Fixes** - Defect corrections (`fix`, `resolve`, `correct`)
   - **Breaking Changes** - API or behavior changes that require action
   - **Internal** - Refactoring, tests, CI, docs (exclude from user-facing notes unless requested)

4. **Rewrite** each entry:
   - Translate developer language into user language
   - Focus on what changed for the user, not implementation details
   - Start each entry with a bold feature name if applicable
   - Keep entries to 1-2 sentences max

5. **Format** output as:
   ```markdown
   # Changelog - [Version or Date Range]

   ## New Features
   - **Feature Name**: Description of what users can now do

   ## Improvements
   - **Area**: What got better and why it matters

   ## Bug Fixes
   - Fixed issue where [user-facing symptom]
   ```

6. **Filter noise**: Exclude commits that are purely internal (refactoring, test fixes, CI changes) unless the user explicitly requests them.

## Output

Print the changelog to the console. If the user requests it, also append to `CHANGELOG.md`.
