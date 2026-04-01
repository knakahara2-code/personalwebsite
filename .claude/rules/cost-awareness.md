# Cost Awareness

Non-engineers may not realize when actions incur costs. Always warn before enabling paid features.

## Firebase

### Free Tier (Spark Plan)
- Firestore: 50K reads, 20K writes, 20K deletes per day
- Auth: unlimited (most providers)
- Hosting: 10GB storage, 360MB/day transfer
- **No Cloud Functions, no Storage** on Spark plan

### Blaze Plan (Pay-as-you-go)
- Required for: Firebase Storage, Cloud Functions, Extensions
- Has a generous free tier — most personal/MVP projects cost $0
- **Always warn the user** before suggesting Blaze upgrade
- Recommend setting a **budget alert** in Google Cloud Console (e.g., ¥1,000/month)

### Cost Traps to Avoid
- **Unbounded reads**: Always use `limit()` in Firestore queries — never fetch entire collections
- **Real-time listeners on large collections**: Each document change = 1 read per listener
- **No pagination**: Fetching 10,000 documents when showing 20 = wasted reads
- **Excessive writes**: Avoid writing on every keystroke — debounce or save on blur/submit

## Vercel

### Free Tier (Hobby)
- 100GB bandwidth/month
- Serverless function: 10 second timeout, 1024MB memory
- 1 concurrent build
- **Commercial use requires Pro plan ($20/month)**

### Cost Traps to Avoid
- **Large images without optimization**: Use `next/image` — it auto-optimizes and caches
- **Serverless function abuse**: Don't use API routes for things that can be done client-side
- **ISR too frequent**: Don't set `revalidate: 1` — it causes constant re-renders on the server

## When to Warn the User

Proactively inform the user (in Japanese) when:
1. A feature requires upgrading to Firebase Blaze plan
2. A design choice will cause high Firestore read/write volume
3. The app might exceed Vercel Hobby limits (e.g., video streaming, heavy API usage)
4. Installing a paid third-party service or API (e.g., paid tier of an AI API)

Use language like:
- 「この機能には Firebase の Blaze プラン（従量課金）が必要です。個人利用なら無料枠内に収まることが多いですが、念のためご確認ください。」
- 「Vercel の無料プランではサーバーレス関数が10秒でタイムアウトします。この処理が重い場合は Pro プラン（月$20）が必要になる可能性があります。」
