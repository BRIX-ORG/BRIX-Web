---
applyTo: '**/*.tsx, **/*.css'
---

# BRIX Styling Rules

## Tailwind v4 Setup

- All config lives in `src/app/globals.css` via `@theme`. There is **no `tailwind.config.ts`**.
- Always check `globals.css` before writing any UI styles to use correct token names.

## Canonical Classes

- **Prefer canonical Tailwind classes** over arbitrary values: `p-4` not `p-[16px]`, `text-sm` not `text-[14px]`.
- Only use `[]` bracket notation when no standard utility class exists.

## Dark-Mode Only

- App is dark-mode only — `html class="dark"` is hardcoded in root layout.
- Never add light-mode variants or `dark:` prefixes; everything runs in dark mode.

## Border Radius

- Intentionally sharp: `--radius: 0.125rem`. Don't over-round elements.

## Fonts

- `font-display` → Space Grotesk (headings, hero text)
- `font-body` → Inter (body copy, default)
- `font-mono` → JetBrains Mono (code, timestamps)
- `font-cabin` → Cabin (alternate display)

## Token-First Approach

**Always use design token classes instead of hardcoded colors.** Theming is centralized in `globals.css`.

```tsx
// ✅ Correct — uses tokens
<div className="bg-background text-foreground border-border" />
<button className="bg-primary text-primary-foreground" />
<span className="text-brix-primary" />

// ❌ Wrong — hardcoded colors
<div className="bg-[#050505] text-white border-[rgba(255,255,255,0.05)]" />
```

## BRIX Design Tokens (from `globals.css`)

**Core tokens (`@theme`):**

- `brix-primary` (`#00eeff`) — cyan accent
- `brix-secondary` (`#bc00ff`) — purple accent
- `brix-bg-light` (`#f5f5f5`)
- `brix-bg-dark` (`#050505`)

**Dark theme tokens (`.dark`):** `background`, `foreground`, `muted`, `muted-foreground`, `border`, `input`, `ring`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `accent`, `accent-foreground`, `destructive`, `card`, `card-foreground`, `popover`, `popover-foreground`.

## Custom Utility Classes

Available in `globals.css`: `cyber-grid`, `glow-cyan`, `glow-text-cyan`, `border-tech`, `bento-card`, `glassmorphism`, `neon-glow`, `glow-button`, `neon-glow-text`, `neon-grid`, `glitch-border`, `crt-scan`, `no-scrollbar`.
