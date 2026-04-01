# Next.js App Router Conventions

## Server vs Client Components

- **Default is Server Component** — no directive needed
- Add `"use client"` only when the component uses:
  - React hooks (`useState`, `useEffect`, `useContext`, etc.)
  - Event handlers (`onClick`, `onChange`, `onSubmit`, etc.)
  - Browser APIs (`window`, `document`, `localStorage`, etc.)
  - Third-party libraries that require browser context (Firebase client SDK, etc.)

### Rules
- Server Components can import Client Components, but NOT vice versa
- Pass Server Component as `children` prop to Client Components when needed
- Data fetching should happen in Server Components when possible
- Firebase client SDK → always in Client Components
- shadcn/ui components that use interactions (Dialog, Dropdown, etc.) need `"use client"` in the component that uses them

## File Conventions

```
src/app/
├── layout.tsx          # Root layout (wraps all pages)
├── page.tsx            # Home page (/)
├── loading.tsx         # Loading UI (automatic Suspense boundary)
├── error.tsx           # Error boundary (must be "use client")
├── not-found.tsx       # 404 page
├── [slug]/
│   └── page.tsx        # Dynamic route (/[slug])
└── api/
    └── route.ts        # API route handler
```

## Data Fetching

- Use `async` Server Components for data fetching (no `useEffect` + `useState` pattern)
- For client-side data: use React hooks with Firebase SDK in `"use client"` components
- API routes: use `NextRequest`/`NextResponse` from `next/server`

## Route Handlers (API Routes)

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Handle GET
  return NextResponse.json({ data: "..." });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Handle POST
  return NextResponse.json({ success: true });
}
```

## Metadata

- Export `metadata` object or `generateMetadata` function from `page.tsx` or `layout.tsx`
- Set `lang="ja"` on the `<html>` element (already done in root layout)

## Images

- Use `next/image` `<Image>` component for optimized images
- Configure external image domains in `next.config.ts`:
```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
  ],
},
```

## Common Mistakes to Avoid

1. **Importing `useState`/`useEffect` in Server Components** — will cause build error
2. **Using `window` or `document` in Server Components** — causes `ReferenceError`
3. **Not adding `"use client"` to error.tsx** — error boundaries must be Client Components
4. **Forgetting `loading.tsx`** — add it for better UX during navigation
5. **Using `<a>` instead of `<Link>`** — always use `next/link` for internal navigation
6. **Case-sensitive imports** — works on macOS, fails on Linux (Vercel). Match exact file names.
