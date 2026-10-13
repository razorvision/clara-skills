# Verify-Commands Resolution Convention

The single definition of "resolve this repo's verification chain". Skills that need to run a
repo's checks (typecheck, lint, build, tests, end-to-end, smoke) follow this convention instead
of hardcoding commands.

## Resolution order

1. **The repo's agent instructions file** (`CLAUDE.md`, `AGENTS.md`, or the equivalent at the
   repo root): look for a section headed exactly `## Verification Commands` containing a
   `| Check | Command | Notes |` table.
   - Reserved Check keys: `typecheck`, `lint`, `build`, `test`, `e2e`, `smoke`. Free-form
     extras are allowed (e.g. `website-e2e`).
   - A Command value of `none` means explicitly not configured: report that check as "n/a",
     do NOT fall back to auto-detection, and do NOT invent a substitute.
   - Honor the Notes column (conditions like "only when X changed", timeouts, foreground
     requirements).
   - Table row order is the recommended execution order.
2. **No table? Auto-detect:**
   - A `package.json` whose `scripts` block CONTAINS `build`/`typecheck`/`test`/`lint`
     entries: run the npm chain (`npm run build`, `npm run typecheck`, `npm run test`,
     `npm run lint`), skipping scripts that do not exist. A `package.json` WITHOUT those
     scripts does not trigger the npm chain (some repos carry one only for tooling). Watch for
     a `test` script that starts a watch mode (common with Vitest); prefer a run-once variant
     (`vitest run`, `test:run`) so the check terminates.
   - Else `pyproject.toml` or `pytest.ini` present: run `python -m pytest` as the test check,
     honoring any documented interpreter requirement; typecheck/lint/build are n/a unless the
     repo documents them.
   - Else a `Makefile` with `test`/`lint`/`check` targets: run those targets.
   - Else other ecosystems with a standard entry point (`cargo test`, `go test ./...`,
     `dotnet test`, and similar) when the matching manifest is present.
   - Else: ask the user what the verification chain is; do not guess.

## Execution rules

- Run each resolved command **separately**, never chained with `&&` (combined output hides
  which check failed).
- Order fastest-to-slowest.
- A check that is `none`/missing is reported as "n/a (not configured)", never treated as a
  failure.
- The `e2e` check is a separate gate from the unit `test` check: run it from a clean state
  (fresh test services, no orphaned processes) per the repo's Notes.
- Read the exit code and the pass/fail summary. "It finished" is not "it passed": a timeout,
  collection error, or zero tests run is a failure to surface.

## Reporting template

```
Checks: build PASS | typecheck n/a | test PASS | lint n/a | e2e PASS
```

## The `smoke` row

Defines the repo's local smoke method for non-web apps (consumed by smoke or acceptance-testing
steps):

- Command: what to launch (usually backgrounded).
- Notes: the readiness probe (e.g. "ready when `curl -s http://localhost:9222/json` returns
  JSON") and/or the tool to prefer for driving the app.
- Cleanup: desktop apps launched for a smoke test must be terminated afterward (unlike shared
  web dev servers, they are launched per run).

## Example table

```markdown
## Verification Commands

| Check | Command | Notes |
|-------|---------|-------|
| typecheck | `npm run typecheck` | |
| lint | `npm run lint` | |
| test | `npm run test:run` | run-once mode, not watch |
| build | `npm run build` | |
| e2e | `npm run test:e2e` | needs the local database running |
| smoke | none | |
```
