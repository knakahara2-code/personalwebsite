# UX Patterns

AI-generated code tends to build only the happy path. These patterns are the difference between "it works" and "it feels good."

## Loading & Transition States

Every async action needs three states: idle → loading → success/error. Never leave the user wondering if their click worked.

### Button Submissions
```tsx
const [isPending, setIsPending] = useState(false);

<Button disabled={isPending} onClick={handleSubmit}>
  {isPending ? (
    <>
      <Loader2 className="animate-spin" size={16} />
      送信中...
    </>
  ) : (
    "送信"
  )}
</Button>
```
- Always disable the button during submission to prevent double clicks
- Show a spinner + text change so the user knows something is happening
- Use `Loader2` from lucide-react — it has a built-in spin animation

### Page/Data Loading
- Use `Skeleton` components for initial data loading — never show a blank page
- Match skeleton shape to the actual content layout (card skeleton for cards, table row skeleton for tables)
- For route navigation, add `loading.tsx` files in route segments

### Avoid
- Never use `Loading...` text as the only loading indicator — it feels broken
- Never block the entire page with a full-screen spinner for partial data loads
- Never show stale data without indicating it's refreshing

## Form UX

### Validation Timing
- **Validate on blur** (when user leaves the field), not on every keystroke
- After first blur validation, switch to **on-change** for that field so errors clear as user types
- Show validation errors below the field, not in a toast or alert
- react-hook-form `mode: "onBlur"` handles this pattern automatically:
  ```tsx
  const form = useForm({ resolver: zodResolver(schema), mode: "onBlur" });
  ```

### Submission Flow
1. User clicks submit → button shows spinner + disables
2. Validate all fields → show inline errors if invalid, re-enable button
3. On success → show toast (Sonner) + navigate or reset form
4. On error → show toast with error message + re-enable button

### Prevent Double Submission
- Disable submit button while `isPending` is true
- For critical actions (payments, data creation), add server-side idempotency checks

### Form Reset After Success
- Clear form fields after successful submission
- If staying on the same page, show a success toast
- If navigating away, no toast needed — the navigation itself is feedback

## Navigation UX

### Active State
- Always highlight the current page in sidebar/nav — users need to know where they are
- Use `usePathname()` from `next/navigation` to match the current route:
  ```tsx
  const pathname = usePathname();
  const isActive = pathname === href;
  ```
- Active style: `bg-accent text-accent-foreground` (shadcn convention)

### Unsaved Changes Warning
For pages with forms or editable content, warn before navigation:
```tsx
const [hasUnsaved, setHasUnsaved] = useState(false);

useEffect(() => {
  const handler = (e: BeforeUnloadEvent) => {
    if (hasUnsaved) {
      e.preventDefault();
    }
  };
  window.addEventListener("beforeunload", handler);
  return () => window.removeEventListener("beforeunload", handler);
}, [hasUnsaved]);
```
- Track `hasUnsaved` via form `isDirty` state from react-hook-form
- For in-app navigation (Next.js Link), use a confirmation Dialog before navigating

### Back Button / Breadcrumbs
- For pages deeper than 2 levels, add a breadcrumb or back link
- Use `戻る` with a left arrow icon for back navigation
- Never rely on browser back button alone — provide explicit navigation

## Debouncing

Any input that triggers an API call or expensive computation must be debounced.

### Search Input
```tsx
const [query, setQuery] = useState("");
const debouncedQuery = useDebounce(query, 300);

useEffect(() => {
  if (debouncedQuery) {
    searchItems(debouncedQuery);
  }
}, [debouncedQuery]);
```

Simple `useDebounce` hook (add to `@/hooks/use-debounce.ts`):
```tsx
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```

### When to Debounce
- Search / filter inputs → 300ms
- Auto-save (e.g., notes, drafts) → 1000ms
- Window resize handlers → 150ms
- Scroll position tracking → 100ms

### When NOT to Debounce
- Button clicks — use disable instead
- Form submission — use pending state instead
- Toggle switches — should feel instant

## Animation & Transitions

Keep it subtle. The goal is to make the UI feel responsive, not flashy.

### Recommended Approach
Use Tailwind's built-in transition utilities — no animation library needed for most cases:
```tsx
{/* Fade in on mount */}
<div className="animate-in fade-in duration-200">
  ...
</div>

{/* Smooth hover/focus transitions */}
<Card className="transition-colors hover:border-primary/50">
  ...
</Card>
```

### Where to Animate
- **Page content**: Fade in (`animate-in fade-in duration-200`) on mount
- **Cards/list items**: Subtle hover effect (`transition-colors` or `transition-shadow`)
- **Modals/sheets**: shadcn Dialog and Sheet already have enter/exit animations — don't add more
- **Toasts**: Sonner handles animation automatically

### Where NOT to Animate
- Navigation link clicks — should feel instant
- Data updates in tables/lists — just swap the content
- Form validation error appearance — should be immediate so the user notices
- Don't use `animate-bounce`, `animate-pulse` (except on Skeleton), or other attention-grabbing animations

### Duration Guidelines
- Micro-interactions (hover, focus): `duration-150`
- Enter animations (fade in, slide in): `duration-200`
- Exit animations (fade out): `duration-150` (exits should be faster than enters)
- Never exceed `duration-300` — anything longer feels sluggish

## Error Recovery

Users will lose network, Firebase will have outages, API calls will fail. Handle it gracefully.

### API Call Errors
- Show a toast with a human-readable message in Japanese — never show raw error objects
- Include a retry action when possible:
  ```tsx
  toast.error("データの取得に失敗しました", {
    action: { label: "再試行", onClick: () => refetch() },
  });
  ```

### Network-Aware UI
- For critical data operations, check `navigator.onLine` before attempting
- Show an inline banner (not a toast) for persistent network issues — toasts disappear

### Error Boundaries
- Add `error.tsx` to important route segments
- Show a friendly message + retry button, not a stack trace:
  ```tsx
  // app/dashboard/error.tsx
  "use client";
  export default function Error({ reset }: { reset: () => void }) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">エラーが発生しました</p>
        <Button onClick={reset}>再試行</Button>
      </div>
    );
  }
  ```

### Empty States
Never show a blank page when there's no data. Always show:
- An icon (from lucide-react)
- A short message explaining the empty state
- An action button to create the first item
```tsx
<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
  <FileText className="text-muted-foreground" size={48} />
  <div>
    <p className="font-semibold">まだ投稿がありません</p>
    <p className="text-sm text-muted-foreground">最初の投稿を作成しましょう</p>
  </div>
  <Button>新規作成</Button>
</div>
```
