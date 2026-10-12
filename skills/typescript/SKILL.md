---
name: typescript
description: Guides TypeScript best practices for strict-mode projects, covering discriminated unions, interface contracts, nullability, type guards, utility types, async return types, const assertions, and a review checklist of common anti-patterns. Use when writing, reviewing, or debugging TypeScript code or type definitions.
license: Apache-2.0
metadata:
  version: "0.1.0" # x-release-please-version
  owner: razorvision
---

# TypeScript Skill

Apply this skill when writing, reviewing, or debugging TypeScript code.

## Configuration

Read the project's `tsconfig.json` first and match it. This guidance assumes strict TypeScript:
- `strict: true`: all strict checks enabled
- `noEmit: true`: type checking only (a bundler or framework emits the JS)
- Path alias: if the project uses path aliases (commonly `@/*` mapping to `./src/*`), use them
  consistently

## Core Patterns

### 1. Discriminated Unions

Use literal types for exhaustive checking:

```typescript
// Define the discriminant
type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

interface Order {
  id: string
  status: OrderStatus  // Discriminant
  customerId: string
  total: number
}

// Exhaustive switch
function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'pending': return 'Awaiting payment'
    case 'paid': return 'Payment received'
    case 'shipped': return 'On its way'
    case 'delivered': return 'Delivered'
    case 'cancelled': return 'Cancelled'
    // TypeScript errors if a case is missing
  }
}
```

### 2. Interface-Based Polymorphism

Define contracts with interfaces:

```typescript
// Contract
interface PaymentProvider {
  readonly name: ProviderName
  readonly enabled: boolean
  charge(amountCents: number, token: string): Promise<ChargeResult>
  refund(chargeId: string): Promise<RefundResult>
  buildReceiptUrl(chargeId: string): string
}

// Implementation
class CardProvider implements PaymentProvider {
  readonly name = 'card' as const
  readonly enabled = true

  async charge(amountCents: number, token: string): Promise<ChargeResult> {
    // Implementation
  }
  // ...
}
```

### 3. React Component Props

Extend native HTML attributes:

```typescript
// Extend native button props
interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// With children
interface CardProps extends React.ComponentProps<"div"> {
  children: React.ReactNode
}

// Callback props
interface FormProps {
  onSubmit: (data: FormData) => Promise<void>
  isLoading?: boolean
}
```

### 4. Nullable Types

Be explicit about nullability:

```typescript
interface Analysis {
  score: number
  recommendation: string | null  // Explicitly nullable
  details?: string              // Optional (may be undefined)
}

// Handle nulls explicitly
function formatRecommendation(rec: string | null): string {
  if (rec === null) {
    return 'No recommendation available'
  }
  return rec
}
```

### 5. Type Guards

Create type-safe narrowing:

```typescript
// Type predicate
function isShipped(order: Order): order is Order & { status: 'shipped' } {
  return order.status === 'shipped'
}

// Usage
if (isShipped(order)) {
  // order.status is now 'shipped'
}

// Assertion function
function assertDefined<T>(value: T | undefined, message: string): asserts value is T {
  if (value === undefined) {
    throw new Error(message)
  }
}
```

### 6. Generic Utilities

```typescript
// Pick specific keys
type OrderSummary = Pick<Order, 'id' | 'status' | 'total'>

// Omit keys
type CreateOrderInput = Omit<Order, 'id' | 'status'>

// Partial for updates
type UpdateOrderInput = Partial<Order>

// Record for maps
type StatusCounts = Record<OrderStatus, number>
```

### 7. Async Return Types

Be explicit with Promise types:

```typescript
// Function returns
async function fetchOrder(id: string): Promise<Order | null> {
  const rows = await db.query<Order>('SELECT * FROM orders WHERE id = $1', [id])
  return rows[0] ?? null
}

// Error handling
interface ApiResult<T> {
  data: T | null
  error: string | null
}

async function safeFetch<T>(url: string): Promise<ApiResult<T>> {
  try {
    const data = await fetch(url).then(r => r.json())
    return { data, error: null }
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
```

### 8. const Assertions

Lock down literal types:

```typescript
// Mutable (type: string[])
const STATUSES = ['pending', 'paid', 'shipped']

// Immutable (type: readonly ['pending', 'paid', 'shipped'])
const STATUSES = ['pending', 'paid', 'shipped'] as const

// Extract type from const
type Status = typeof STATUSES[number]  // 'pending' | 'paid' | 'shipped'
```

## Type File Organization

```
src/types/
├── api.ts         # Request/response types
├── billing.ts     # Payment and invoice types
├── index.ts       # Re-exports
└── orders.ts      # Order domain types
```

## Review Checklist

When reviewing TypeScript:

- [ ] No `any` types (use `unknown` if truly unknown)
- [ ] Explicit return types on public functions
- [ ] Discriminated unions for variants
- [ ] `readonly` on immutable properties
- [ ] Nullability explicitly handled (`| null` or `?`)
- [ ] Interfaces for contracts, types for unions
- [ ] Generic constraints where applicable
- [ ] Path aliases (if the project uses them) used consistently

## Anti-Patterns

```typescript
// Don't use any
function process(data: any) { ... }  // Use unknown or a specific type

// Don't use non-null assertion without checks
const value = data!.property  // Check first or use optional chaining

// Don't ignore errors
} catch (e) {  // Type e properly
  console.log(e.message)  // e is unknown, not Error
}

// Correct error handling
} catch (e) {
  const message = e instanceof Error ? e.message : 'Unknown error'
}

// Don't use object
function process(data: object) { ... }  // Use Record<string, unknown>
```
