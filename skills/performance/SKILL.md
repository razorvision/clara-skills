---
name: performance
description: Guides performance optimization for Next.js App Router applications, covering Server versus Client component decisions, data fetching, Server Actions, image optimization, dynamic imports, Suspense streaming, parallel fetching, and memoization, with a review checklist and anti-patterns. Use when optimizing a Next.js App Router app, deciding whether a component needs "use client", or reviewing Next.js code for performance.
license: Apache-2.0
metadata:
  version: "0.1.0" # x-release-please-version
  owner: razorvision
---

# Performance Skill

Apply this skill when optimizing Next.js applications or making Server/Client component decisions.

## Server vs Client Components

### Default: Server Components

Server Components are the default in Next.js App Router. Don't add "use client" unless needed.

```tsx
// Server Component (default - NO directive)
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Can use async/await directly
  const { id } = await params
  const product = await fetchProduct(id)

  return <ProductDetails product={product} />
}
```

### When to Use Client Components

Add `"use client"` only when you need:

1. **React hooks**: `useState`, `useEffect`, `useContext`, `useReducer`
2. **Event handlers**: `onClick`, `onChange`, `onSubmit`
3. **Browser APIs**: `window`, `localStorage`, `navigator`
4. **Third-party libraries** that use hooks

```tsx
"use client"

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)  // Hook = needs "use client"

  return (
    <button onClick={() => setCount(c => c + 1)}>  {/* Event handler */}
      Count: {count}
    </button>
  )
}
```

### Composition Pattern

Keep Client Components small, push them to the leaves:

```tsx
// Server Component (parent)
export default async function Dashboard() {
  const data = await fetchDashboardData()  // Server-side fetch

  return (
    <div>
      <h1>Dashboard</h1>
      <StaticContent data={data} />       {/* Server Component */}
      <InteractiveChart data={data} />    {/* Client Component */}
    </div>
  )
}

// Only the interactive part is a Client Component (in its own file)
"use client"
export function InteractiveChart({ data }) {
  const [filter, setFilter] = useState('all')
  // ...
}
```

## Data Fetching

### Server Components (Preferred)

```tsx
// Direct async/await in Server Components
export default async function Page() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }  // Cache for 1 hour
  })
  const data = await res.json()

  return <Content data={data} />
}
```

### Server Actions

Use Server Actions for mutations:

```tsx
// app/actions.ts
"use server"

export async function submitForm(formData: FormData) {
  const name = formData.get('name')
  await db.insert({ name })
  revalidatePath('/dashboard')
}

// Client Component using the action
"use client"
export function Form() {
  return (
    <form action={submitForm}>
      <input name="name" />
      <button type="submit">Submit</button>
    </form>
  )
}
```

## Optimization Techniques

### 1. Image Optimization

Always use `next/image`:

```tsx
import Image from 'next/image'

// Correct
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority  // For above-the-fold images
/>

// Wrong - don't use raw img
<img src="/hero.jpg" />
```

### 2. Dynamic Imports

Lazy load heavy components:

```tsx
import dynamic from 'next/dynamic'

// Load only when needed
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false  // Skip SSR for client-only libraries (only allowed in Client Components)
})

export default function Dashboard() {
  return (
    <div>
      <Header />  {/* Loads immediately */}
      <HeavyChart />  {/* Loads on demand */}
    </div>
  )
}
```

### 3. Suspense Boundaries

Stream content with Suspense:

```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <Header />  {/* Renders immediately */}

      <Suspense fallback={<TableSkeleton />}>
        <SlowDataTable />  {/* Streams when ready */}
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <SlowChart />  {/* Independent stream */}
      </Suspense>
    </div>
  )
}
```

### 4. Parallel Data Fetching

```tsx
// Wrong - sequential (slow)
const user = await fetchUser()
const posts = await fetchPosts()

// Correct - parallel (fast)
const [user, posts] = await Promise.all([
  fetchUser(),
  fetchPosts()
])
```

### 5. Memoization

For Client Components with expensive computations:

```tsx
"use client"
import { useMemo, memo } from 'react'

// Memoize expensive calculations
function Dashboard({ data }) {
  const processedData = useMemo(() => {
    return expensiveProcess(data)
  }, [data])

  return <Chart data={processedData} />
}

// Memoize component to prevent re-renders
const ExpensiveList = memo(function ExpensiveList({ items }) {
  return items.map(item => <Item key={item.id} {...item} />)
})
```

## Decision Tree

```
Need hooks (useState, useEffect)?
  Yes -> "use client"
  No  -> Keep as Server Component

Need event handlers (onClick, onChange)?
  Yes -> "use client"
  No  -> Keep as Server Component

Using browser APIs (window, localStorage)?
  Yes -> "use client"
  No  -> Keep as Server Component

Just displaying data?
  Yes -> Server Component (default)
```

## Review Checklist

When reviewing for performance:

- [ ] No unnecessary "use client" directives
- [ ] Client Components are small and at leaf nodes
- [ ] Using `next/image` for images
- [ ] Parallel data fetching with `Promise.all`
- [ ] Suspense boundaries for slow content
- [ ] Dynamic imports for heavy components
- [ ] Server Actions for mutations (not API routes)
- [ ] Proper caching with `revalidate` or `cache`

## Anti-Patterns

```tsx
// Don't make entire pages Client Components
"use client"
export default function Page() {  // Usually unnecessary
  return <StaticContent />
}

// Don't fetch in Client Components if avoidable
"use client"
export function Component() {
  useEffect(() => {
    fetch('/api/data')  // Move to Server Component
  }, [])
}

// Don't use raw img tags
<img src="/image.jpg" />  // Use next/image

// Don't do sequential fetches
const a = await fetchA()
const b = await fetchB()  // Use Promise.all
```
