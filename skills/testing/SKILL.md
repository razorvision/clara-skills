---
name: testing
description: Guides writing, reviewing, and debugging Vitest tests for JavaScript and TypeScript projects, covering test structure, async handling, mocking, error cases, setup and teardown, and a review checklist of common anti-patterns. Use when writing new tests, reviewing a test file, or debugging a failing or flaky Vitest suite. Not for Python test suites.
license: Apache-2.0
metadata:
  version: "0.1.0" # x-release-please-version
  owner: razorvision
---

# Testing Skill

Apply this skill when writing, reviewing, or debugging tests.

## Test Configuration

Read the project's `vitest.config.*` (or the `test` block in `vite.config.*`) before writing
tests, and match it. Typical settings to check:
- **Environment:** `node` for server/library code, `jsdom` or `happy-dom` for DOM code
- **Timeout:** raised (e.g. 30 seconds) for API/integration tests
- **Pattern:** where tests live, e.g. `src/**/*.test.ts` or colocated `*.test.ts`
- **Env vars:** how test env vars are loaded (e.g. from an env file or a setup file)
- **Path alias:** if the project uses path aliases (e.g. `@/` mapping to `./src/`), use them in
  imports and mocks exactly as the source code does

## Core Patterns

### 1. Test File Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('ModuleName', () => {
  describe('functionName', () => {
    it('returns expected result when given valid input', async () => {
      // Arrange
      const input = { ... }

      // Act
      const result = await functionName(input)

      // Assert
      expect(result).toEqual(expected)
    })

    it('throws error when given invalid input', async () => {
      await expect(functionName(null)).rejects.toThrow('Expected error')
    })
  })
})
```

### 2. Async Tests

Always use `async/await` for async operations:

```typescript
// Correct
it('fetches data from API', async () => {
  const result = await fetchData()
  expect(result).toBeDefined()
})

// Wrong - missing await
it('fetches data from API', () => {
  const result = fetchData()  // Promise, not result!
  expect(result).toBeDefined()
})
```

### 3. Specific and Realistic Assertions

For pure functions, assert exact values. For integration tests against live or variable data,
use range- and shape-based assertions:

```typescript
// Pure function: exact values
it('applies a percentage discount and rounds to cents', () => {
  expect(applyDiscount(19.99, 0.15)).toBe(16.99)
  expect(applyDiscount(100, 0)).toBe(100)
})

// Integration: realistic ranges and shapes
it('returns a plausible exchange rate', async () => {
  const result = await getExchangeRate('USD', 'EUR')

  // Rate should be in a realistic range
  expect(result.rate).toBeGreaterThan(0.5)
  expect(result.rate).toBeLessThan(2)

  // Pair should match the request
  expect(result.pair).toMatch(/USD\/EUR/)

  // Required fields present
  expect(result.source).toBeTruthy()
  expect(result.fetchedAt).toBeInstanceOf(Date)
})
```

### 4. Mocking an API Client Module

```typescript
import { vi } from 'vitest'

// Mock the whole module (path must match the import used in the code under test)
vi.mock('./lib/api-client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    post: vi.fn().mockResolvedValue({ data: { id: '123' }, error: null }),
  },
}))

// Or build a chainable query-builder mock for fluent SDKs
const mockDb = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  }),
}
```

### 5. Test Organization

Group related tests with nested `describe`:

```typescript
describe('PaymentProvider', () => {
  describe('Card payments', () => {
    describe('charge', () => {
      it('charges the exact amount in minor units', async () => { ... })
      it('handles a declined card gracefully', async () => { ... })
      it('retries once on a transient network error', async () => { ... })
    })
  })

  describe('Bank transfers', () => {
    describe('buildReference', () => {
      it('includes the invoice number', () => { ... })
    })
  })
})
```

### 6. Setup and Teardown

```typescript
describe('DatabaseTests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await cleanup()
  })

  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })
})
```

### 7. Testing Error Cases

```typescript
it('handles API errors gracefully', async () => {
  // Mock API failure
  vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))

  const result = await fetchWithFallback()

  expect(result.error).toBe('Network error')
  expect(result.data).toBeNull()
})

it('throws on invalid input', () => {
  expect(() => validateInput(null)).toThrow('Input required')
})

it('rejects promise on async error', async () => {
  await expect(asyncFunction()).rejects.toThrow('Async error')
})
```

## Running Tests

Resolve the repo's actual test commands per
[references/verify-commands.md](references/verify-commands.md) rather than assuming
script names. Common Vitest invocations:

```bash
# Run all tests once (CI style; does not watch)
npx vitest run

# Run a specific file
npx vitest run src/lib/discount.test.ts

# Run with coverage
npx vitest run --coverage

# Watch mode (interactive only; never use as a gate)
npx vitest
```

## Review Checklist

When reviewing tests:

- [ ] Tests follow the project's configured file pattern
- [ ] Async tests use `async/await`
- [ ] Descriptive test names (behavior-focused)
- [ ] Assertions are specific (not just `.toBeTruthy()`)
- [ ] Error cases are tested
- [ ] Mocks are cleaned up in `beforeEach`
- [ ] No hardcoded delays (use fake timers)
- [ ] Integration tests use realistic ranges

## Anti-Patterns

```typescript
// Don't use vague assertions
expect(result).toBeTruthy()  // Use specific: expect(result.id).toBe('123')

// Don't forget async
it('test', () => {
  fetchData()  // Missing await!
})

// Don't hardcode delays
await new Promise(r => setTimeout(r, 1000))  // Use vi.useFakeTimers()

// Don't test implementation details
expect(component.state.count).toBe(1)  // Test behavior, not state
```
