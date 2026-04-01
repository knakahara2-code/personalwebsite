# Security Best Practices

## API Keys & Secrets

- **Never commit secrets** — `.env.local` is gitignored; all keys/tokens go there
- **`.env.example`** must list every variable with empty values as documentation
- **`NEXT_PUBLIC_` prefix** = embedded in client bundle, visible to anyone. Only use for:
  - Firebase client config (restricted by Firestore/Storage security rules)
  - Public-facing API endpoints
- **No `NEXT_PUBLIC_` prefix** = server-only. Use for:
  - Firebase Admin SDK credentials
  - Third-party API keys (OpenAI, Stripe secret key, etc.)
  - Database connection strings
  - Any secret that grants privileged access

## LLM / AI API Calls

- **Always call AI APIs from server-side** (Route Handlers or Server Actions) — never from client components
- API keys for OpenAI, Anthropic, etc. must be server-only environment variables
- Pattern:
  ```
  Client Component → fetch("/api/chat") → Route Handler → AI API
  ```
- Never stream API keys or tokens to the browser, even temporarily
- Add rate limiting or auth checks to AI-powered API routes to prevent abuse

## Server vs Client Boundary

- Treat the client as untrusted — validate all input on the server
- Use Zod schemas in Route Handlers to validate request bodies
- Never trust client-sent user IDs — derive from auth session on the server
- Firestore security rules are the last line of defense, not the only one

## Common Vulnerabilities to Avoid

- **XSS**: React escapes by default, but avoid `dangerouslySetInnerHTML`. If unavoidable, sanitize with a library like `dompurify`
- **Injection**: Use parameterized Firestore queries — never build queries from raw user input strings
- **CSRF**: Next.js API routes should check `Origin` header for state-changing operations
- **Open redirects**: Validate redirect URLs against an allowlist before `router.push(userInput)`

## Firebase-Specific Security

- See `firebase.md` for Firestore security rules details
- Never use `allow read, write: if true;` — even in development
- Storage rules are separate from Firestore rules — configure both
- Custom Claims (set via Admin SDK) for role-based access — never store roles in client-writable documents

## Dependency Security

- Prefer well-maintained packages with active communities
- Avoid installing packages for trivial tasks (e.g., `is-odd`)
- Review package permissions before installing — watch for postinstall scripts
