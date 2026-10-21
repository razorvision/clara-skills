---
name: root-cause
description: Traces a bug backward through the call chain to the original trigger instead of patching where the error surfaces, then fixes it at the source and adds defensive validation at intermediate layers. Use when debugging an error, a failing test, or unexpected behavior where the symptom appears far from its cause.
license: Apache-2.0
metadata:
  version: "0.1.1" # x-release-please-version
  owner: razorvision
---

# Root Cause Tracing

A bug is reported where it becomes visible, which is rarely where it starts. Walk the bad value or state back to the line that first produced it, fix that line, and only then add guards on the way down.

## The rule

Do not change the line that throws until you can name the line that first produced the bad value. A guard at the symptom hides the bug from everything else that reads the same value.

## The trace

1. **Pin down the failure.** Record the exact error, the input that triggers it, and what should have happened instead. If you cannot reproduce it, make reproducing it the first task.
2. **Find the failing line.** Use the stack trace or error location to find the statement that failed, and write down the value that was wrong at that point.
3. **Move up one frame.** Find the caller that passed the wrong value in. Read the code there; do not assume.
4. **Repeat until the value is born.** At each frame, decide which is true:
   - the value arrived wrong from the caller (keep going up), or
   - the value was computed, defaulted or mutated wrongly here (this is the origin).
   Stop when you reach the origin, not when you reach a plausible place to add a check.
5. **Fix the origin, then defend.** Correct the code that produced the value. Then add validation at the boundaries the value crossed, so the next bad value fails loudly near its source.
6. **Prove it.** Add a test that fails on the original input before the fix and passes after it.

## Example

```
Symptom:  invoice PDF shows a total of NaN
  <- renderTotal(total) receives NaN
    <- invoiceTotal(lines) sums line.amount
      <- one line has amount: undefined
        <- ORIGIN: the CSV importer maps the column "Amount " (trailing space),
           so rows from one bank's export never set amount
```

- **Symptom fix (wrong):** `renderTotal` prints 0 when the total is NaN. Every other report still sums undefined.
- **Origin fix (right):** the importer trims header names and rejects a row with no amount.
- **Defense:** `invoiceTotal` throws when a line has a non-numeric amount, naming the line id.

## When the chain is hard to follow

Add short-lived logging that captures the value and who passed it, placed before the operation rather than in the error handler:

```typescript
console.error("[trace] invoiceTotal input", { count: lines.length, sample: lines[0] });
console.error("[trace] caller", new Error().stack);
```

- Print to stderr in tests, since test runners often silence the app logger.
- Log identifiers and shapes, not secrets or full customer records.
- Remove the logging once the origin is found.

## Signs you stopped too early

- The fix is a null check, default value or try/catch at the line that threw.
- You cannot say which earlier line produced the bad value.
- The same symptom could still appear through another caller.

Any of these means: keep tracing.

## Common origins

| Symptom | Where to look first |
|---|---|
| `undefined` or `null` deep in a call chain | Initialization order, a missing field mapping, an optional field treated as required |
| Wrong format or units | The nearest parse, serialize or conversion step upstream |
| Intermittent failure | Shared mutable state, a missing `await`, test order dependence |
| Passes locally, fails in CI | Environment variables, timezone, locale, file ordering |
| Wrong value only for some records | The import or migration that wrote those records |
