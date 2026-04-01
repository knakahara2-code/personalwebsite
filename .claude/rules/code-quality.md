# Code Quality & Best Practices

## File Length

- **Target**: ~300 lines per file
- **Split at 500 lines** — if a file exceeds 500 lines, refactor immediately
- How to split:
  - Extract reusable logic into custom hooks (`@/hooks/`)
  - Extract sub-components into separate files in the same directory
  - Extract utility/helper functions into `@/lib/`
  - Extract TypeScript types into `@/types/`
- Page components (`page.tsx`) should mostly compose smaller components, not contain all logic inline

## When to Refactor

- A component handles more than one responsibility (fetching + rendering + form logic)
- The same logic appears in 3+ places — extract a shared function or hook
- A function takes more than 4-5 parameters — group into an options object or rethink the API
- A component has more than 3 levels of conditional rendering — split into sub-components
- After adding a feature, if the file crossed 500 lines — refactor before moving on

## Testing Strategy

### What to Test

- **Business logic functions** — calculations, data transformations, validation logic
- **Utility functions** (`@/lib/`) — pure functions with clear input/output
- **Zod schemas** — test edge cases of validation rules
- **API Route Handlers** — test request/response behavior, error handling, auth checks
- **Custom hooks** with complex state logic

### What NOT to Test

- Trivial UI rendering (does a Button render? does text appear?)
- shadcn/ui component behavior — it's already tested upstream
- Simple pass-through components with no logic
- CSS/styling — use visual review instead
- Direct Firebase SDK wrappers with no custom logic

### Test Guidelines

- Use test-driven development (TDD) for pure logic: write the test first, then implement
- Co-locate test files: `utils.ts` → `utils.test.ts` in the same directory
- Test behavior, not implementation — test what the function does, not how it does it
- Keep tests independent — no shared mutable state between tests
- Mock Firebase and external APIs at the boundary, not deep inside the code

## Code Organization

- One component per file — no multi-component files
- Named exports, not default exports (easier to refactor and search)
- Group related files by feature, not by type, once the app grows:
  ```
  src/features/auth/
  ├── components/
  ├── hooks/
  ├── lib/
  └── types.ts
  ```
- Keep `@/components/ui/` for shadcn only — custom shared components go in `@/components/`

## Naming Conventions

- Components: `PascalCase` (`UserCard.tsx`)
- Hooks: `camelCase` with `use` prefix (`useAuth.ts`)
- Utilities: `camelCase` (`formatDate.ts`)
- Types: `PascalCase` (`UserProfile`, `CreatePostInput`)
- Constants: `UPPER_SNAKE_CASE` for true constants, `camelCase` for config objects

## Error Handling

- Use error boundaries (`error.tsx`) at route segment level
- Show user-friendly error messages in Japanese — never expose stack traces
- Log detailed errors server-side for debugging
- Handle loading and empty states explicitly — never leave the UI blank
