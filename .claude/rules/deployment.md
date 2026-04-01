# Deployment Rules (Vercel)

## Pre-Deployment Checklist

1. **Build locally first**: Run `npm run build` and fix all errors before deploying
2. **Check env vars**: Ensure `.env.example` matches all variables used in code
3. **TypeScript errors**: Fix all TS errors — Vercel treats warnings as errors in build
4. **Case sensitivity**: Verify all import paths match exact file names (Linux is case-sensitive)
5. **Security rules**: Deploy Firestore and Storage security rules before launching

## Environment Variables

### In Vercel Dashboard
- Add all variables from `.env.example`
- **Client variables** (NEXT_PUBLIC_*): Available in browser, embedded at build time
- **Server variables**: Available only in API routes and Server Components at runtime
- **Firebase private key**: May need `\n` → actual newline handling

### Important
- Changing `NEXT_PUBLIC_` variables requires **redeployment** (they're build-time embedded)
- Server-side variables take effect immediately (runtime access)
- Never commit `.env.local` to git

## Build Configuration

- Vercel automatically detects Next.js and uses correct build settings
- Build command: `next build` (default)
- Output directory: `.next` (default)
- Node.js version: ensure it matches your local version in Vercel project settings

## Common Deployment Failures

### "Module not found"
- Case-sensitive import mismatch (e.g., `./Header` vs `./header`)
- Missing dependency in `package.json` (installed globally but not in project)

### "Build failed - TypeScript errors"
- Fix all TypeScript errors locally with `npm run build`
- Unused variables, missing types, or `any` types can cause build failures

### Firebase "permission denied" in production
- Firestore security rules not deployed
- Environment variables not set in Vercel dashboard
- Using wrong Firebase project (development vs production)

### Images not loading
- Firebase Storage domain not in `next.config.ts` `images.remotePatterns`
- Storage security rules blocking read access

### Serverless function timeout
- Hobby plan: 10 second limit
- Pro plan: 60 second limit
- Move long operations to background jobs or edge functions

## Domain Setup

1. Add custom domain in Vercel dashboard
2. Update Firebase Auth authorized domains
3. Update OAuth redirect URIs if using social login
4. Update CORS settings if using API routes from external clients
