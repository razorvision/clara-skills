---
name: software-architecture
description: Guides architectural decisions using Clean Architecture, separation of concerns, and SOLID principles, covering where new code should live, how modules depend on each other, and which anti-patterns to avoid, with a review checklist. Use when designing a new module or feature structure, refactoring code organization, deciding where code belongs, or reviewing a codebase's architecture.
license: Apache-2.0
metadata:
  version: "0.1.1" # x-release-please-version
  owner: razorvision
---

# Software Architecture Guide

Principles and patterns for maintainable, scalable software design.

## Usage

Invoke with the module, directory, or feature to design or review. With no argument, apply the guidance to the change under discussion.

## When to Use

- Designing new module or feature structure
- Refactoring existing code organization
- Deciding where new code should live
- Reviewing separation of concerns
- Choosing between architectural patterns

## Core Principles

### Separation of Concerns

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **UI/Components** | Rendering, user interaction | React components, pages |
| **Hooks/State** | Client state management, side effects | Custom hooks, context |
| **API/Routes** | Request handling, validation, response formatting | API route handlers |
| **Services/Lib** | Business logic, data transformation | Pure functions, calculators |
| **Data Access** | Database queries, external API calls | ORM queries, SDK clients |
| **Types** | Shared interfaces and contracts | TypeScript types/interfaces |

### SOLID for TypeScript/React

- **S**: Single Responsibility. Each file/function does one thing
- **O**: Open/Closed. Extend via composition, not modification
- **L**: Liskov Substitution. Subtypes must honor parent contracts
- **I**: Interface Segregation. Small, focused interfaces over large ones
- **D**: Dependency Inversion. Depend on abstractions, not concretions

### Practical Guidelines

- **Functions under 50 lines** when possible
- **Files under 300 lines**: split if larger
- **Max 3 levels of nesting**: extract helpers or early-return
- **No `utils.ts` or `helpers.ts`**: use domain-specific names (`invoice-parser.ts`, `price-formatter.ts`)
- **Colocation**: put related files together (component + test + types)
- **Library-first**: check for a well-maintained package before writing custom code

## Decision Framework

When adding new code, ask:

1. **Does this already exist?** Search the codebase first.
2. **Where does this belong?** Match the layer (UI, logic, data).
3. **Is this reusable?** If yes, put it in a shared module (e.g. `lib/`). If no, keep it near its usage.
4. **Does this need state?** Prefer server-rendered or stateless code; add client state only when needed.
5. **Is this testable?** Pure functions beat side-effect-heavy code.

## Anti-Patterns to Avoid

| Anti-Pattern | Better Approach |
|-------------|-----------------|
| God component (500+ lines) | Split into container + presentational |
| Prop drilling 3+ levels | React Context or composition |
| Business logic in API routes | Extract to service/`lib/` functions |
| Duplicate validation | Single schema (e.g. Zod), reused on client and server |
| Direct DB calls in components | A data access layer (e.g. `lib/db/queries/`) |
| Premature abstraction | Wait until you have 3 concrete cases |

## Review Checklist

When reviewing the architecture of the named target:

- [ ] Each module has a single, clear responsibility
- [ ] Dependencies flow inward (UI -> Logic -> Data)
- [ ] No circular dependencies
- [ ] Shared types defined in one place (e.g. `types/`), not duplicated
- [ ] Tests can run without external services
- [ ] New patterns are consistent with existing codebase conventions
