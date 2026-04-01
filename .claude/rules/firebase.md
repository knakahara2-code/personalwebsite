# Firebase Rules & Patterns

## Client SDK Setup

- Firebase client config lives in `src/lib/firebase.ts`
- **Always guard initialization**: `getApps().length === 0 ? initializeApp(config) : getApps()[0]`
- Firebase client SDK is **client-side only** — never import in Server Components
- All Firebase client imports must be in files with `"use client"` directive or called from client components

## Environment Variables

- Client SDK config uses `NEXT_PUBLIC_` prefix (embedded in client bundle, restricted by security rules)
- Admin SDK credentials use NO prefix (server-side only, never exposed to client)
- Copy `.env.example` to `.env.local` and fill in values from Firebase Console

## Firestore Patterns

### Document Structure
- **Always include timestamps**: `createdAt` and `updatedAt` on every document
- Use `serverTimestamp()` instead of `new Date()` — client clocks can be wrong
- Store user ID as `userId` field for ownership-based security rules
- Use subcollections for unbounded lists (not arrays) — arrays have 1MB document limit

### Querying
- Firestore has **no JOIN** — denormalize data when needed for read performance
- **Composite indexes**: queries with multiple `where` clauses or `where` + `orderBy` on different fields require composite indexes. Firestore error messages include a direct link to create them.
- Use `limit()` for pagination — never fetch entire collections
- Always `orderBy` when paginating with `startAfter`/`startAt`

### Real-time Listeners
- **Always clean up listeners** in `useEffect` return function:
```tsx
useEffect(() => {
  const unsubscribe = onSnapshot(query, (snapshot) => {
    // handle data
  });
  return () => unsubscribe();
}, []);
```
- React 18 Strict Mode runs effects twice in development — this is expected, cleanup prevents duplicates

### Batch Operations
- Use `writeBatch()` for multiple document operations (atomic, max 500 ops per batch)
- Use `runTransaction()` when reads and writes must be atomic

## Security Rules

**CRITICAL: Always write proper security rules before deploying.**

Never use `allow read, write: if true;` — this allows anyone on the internet to read/write all data.

### Basic Template
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Example: collection with ownership
    match /items/{itemId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }
  }
}
```

### Rule Principles
- **Deny by default** — only allow what's explicitly needed
- **Check `request.auth != null`** for authenticated-only access
- **Check ownership** with `request.auth.uid == resource.data.userId`
- **Validate data shape** with `request.resource.data.keys().hasAll([...])`
- **Don't forget Storage rules** — they are separate from Firestore rules

## Authentication

- Enable auth providers in Firebase Console before using them in code
- For Google Sign-In: configure OAuth consent screen and authorized domains
- Use `onAuthStateChanged` for persistent auth state in client components
- For SSR auth: consider Firebase session cookies or Auth middleware patterns
- **Roles**: use Firebase Custom Claims (set via Admin SDK), not client-side role fields

## Firebase Admin SDK (Server-Side)

- Used in API routes and Server Components/Actions only
- Private key from env var needs `\n` → newline conversion:
```ts
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
```
- Initialize with `cert()` from `firebase-admin/app`
- **Never import `firebase-admin` in client-side code**

## Storage

- Add Firebase Storage domain to `next.config.ts` for `<Image>` component:
```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
  ],
},
```
- Set Storage security rules separately from Firestore rules
- Use signed URLs for sensitive content
