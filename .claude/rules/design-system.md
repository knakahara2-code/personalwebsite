# Design System Rules

## Component Usage

- **Only use shadcn/ui components** for UI elements. Never create custom components for things shadcn already provides.
- Available components: Button, Card, Input, Label, Tabs, Table, Badge, Progress, Avatar, Sidebar, Dialog, Dropdown Menu, Select, Textarea, Form, Sonner (toast), Skeleton, Accordion, Separator, Sheet, Tooltip
- If a component is not installed, install it with `npx shadcn@latest add <component>`
- Compose complex UIs from these primitives (e.g., Card + CardHeader + CardContent + CardFooter)

## Color Palette

- Use **CSS variables only** from `globals.css`. Never hardcode colors (`text-[#xxx]`, `bg-[#xxx]`).
- Primary = indigo-blue (trust/education feel)
- Neutral = zinc for backgrounds and text
- Use `text-foreground` for primary text, `text-muted-foreground` for secondary text
- Use `bg-background` for page, `bg-card` for surfaces, `bg-muted` for subtle backgrounds
- Destructive actions use `destructive` variant

## Spacing

- Stick to the **8px grid**: `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px)
- Avoid odd spacing values like `p-3`, `p-5`, `p-7` unless intentionally adjusting
- Use `gap-4` or `gap-6` for flex/grid layouts
- Page padding: `p-6` or `p-8`
- Card padding: `p-6`

## Typography

- **Max 2 font weights** visible at once: `font-normal` (body) + `font-semibold` (headings)
- Never use `font-thin`, `font-light`, `font-black`, or `font-extrabold`
- Use `text-sm` for secondary/helper text, `text-base` for body, `text-lg`+ for headings
- Headings: use semantic HTML (`h1`-`h4`) with appropriate text sizes

## Layout

- **Sidebar navigation** + card-based content area is the default pattern
- Content area: `max-w-5xl` or `max-w-6xl` with `mx-auto` centering
- Use CSS Grid or Flexbox for layouts — never use absolute positioning for layout
- Responsive: mobile-first with `sm:`, `md:`, `lg:` breakpoints

## Scroll & Viewport

This template builds **web apps** (dashboards, chat, tools), not content sites. Use the **app shell pattern**: fixed outer frame, scrollable inner content.

### Default App Shell Structure
```tsx
{/* Root: lock to viewport, no page-level scroll */}
<div className="flex h-dvh overflow-hidden">
  {/* Sidebar: fixed, scrolls independently if needed */}
  <aside className="w-64 shrink-0 overflow-y-auto border-r">
    ...
  </aside>

  {/* Main area: flex column for header + scrollable content */}
  <div className="flex flex-1 flex-col overflow-hidden">
    {/* Header: fixed at top */}
    <header className="shrink-0 border-b px-6 py-4">
      ...
    </header>

    {/* Content: this is the only part that scrolls */}
    <main className="flex-1 overflow-y-auto p-6">
      ...
    </main>
  </div>
</div>
```

### Rules
- **Use `h-dvh`** for the root container — never `h-screen` or `100vh` (breaks on mobile due to browser chrome)
- **`overflow-hidden`** on the root and intermediate containers to prevent page-level scroll
- **`overflow-y-auto`** only on the content area that should scroll
- **`flex-1 overflow-hidden`** on intermediate wrappers — `flex-1` fills space, `overflow-hidden` prevents bleed
- **`shrink-0`** on fixed elements (header, sidebar) so they don't collapse

### Chat / Message UIs
Chat UIs need **reverse scroll** (newest at bottom, scroll up for history):
```tsx
<div className="flex flex-1 flex-col overflow-hidden">
  {/* Messages: scroll area, pinned to bottom */}
  <div className="flex-1 overflow-y-auto flex flex-col-reverse">
    ...
  </div>

  {/* Input: fixed at bottom */}
  <div className="shrink-0 border-t p-4">
    ...
  </div>
</div>
```

### Scrollbar Styling
- Use Tailwind's `scrollbar-thin` utility or add custom CSS for consistent cross-platform appearance
- On Windows, scrollbars are always visible and shift layout — add `scrollbar-gutter-stable` if content width must stay constant:
  ```css
  .scroll-stable {
    scrollbar-gutter: stable;
  }
  ```
- Keep scrollbar styling subtle — match `border` color, don't use bright or thick scrollbars

### Common Pitfalls
- **Missing height chain**: Every parent from root to scroll container must have explicit height (`h-dvh`, `flex-1`, etc.) — one missing link breaks the scroll
- **`overflow-hidden` on body**: Don't set globally — it breaks shadcn Dialog, Sheet, and Dropdown scroll. Only set on the app shell root `div`
- **Nested scroll containers**: Avoid more than 2 scroll areas visible at once — it confuses users, especially on mobile/trackpad
- **Scroll on mobile**: Test with real touch scrolling. Nested scroll areas are harder to use on touch devices than with a mouse wheel

## Icons

- **Lucide React only** — import from `lucide-react`
- Use consistent icon sizes: `size={16}` for inline, `size={20}` for buttons, `size={24}` for standalone
- Always pair icons with text labels for clarity (icon-only buttons need `aria-label`)

## Borders and Shadows

- Borders: use `border-border` color with `rounded-lg` radius
- Shadows: `shadow-sm` or none. **Never use heavy drop shadows** (`shadow-md`, `shadow-lg`, `shadow-xl`)
- Cards use `border` by default (shadcn Card has built-in border)

## States and Feedback

- Use `Skeleton` components for loading states
- Use `Sonner` (toast) for success/error notifications
- Disabled states: use component's `disabled` prop, never custom opacity
- Empty states: show a centered message with icon + description + action button

## Responsive Design

- All layouts must work on mobile (375px+) and desktop
- Sidebar collapses to sheet/drawer on mobile
- Tables become card lists on mobile when data is complex
- Test with `sm`, `md`, `lg` breakpoints
