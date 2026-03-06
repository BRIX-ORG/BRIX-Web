# Styling Conventions

## Tailwind CSS v4

- No `tailwind.config.ts` — all configuration is defined in `globals.css` via `@theme`.
- **Prefer canonical Tailwind classes** over arbitrary values:
    - Use `p-4` not `p-[16px]`, `text-sm` not `text-[14px]`.
    - Only use `[arbitrary]` values when no standard class exists.

## Token-First Approach

**Always use design token classes instead of hardcoded colors.** This ensures themes can be changed globally by editing `globals.css` alone, with zero component changes.

```ts
// ✅ Correct — uses token
<div className="bg-background text-foreground border-border" />
<button className="bg-primary text-primary-foreground" />
<span className="text-brix-primary" />

// ❌ Wrong — hardcoded colors, breaks theme switching
<div className="bg-[#050505] text-white border-[rgba(255,255,255,0.05)]" />
<button className="bg-[#00eeff] text-black" />
```

## BRIX Design Tokens (defined in `globals.css`)

### Core Tokens (`@theme`)

| Token class         | CSS variable             | Default value |
| ------------------- | ------------------------ | ------------- |
| `text-brix-primary` | `--color-brix-primary`   | `#00eeff`     |
| `bg-brix-secondary` | `--color-brix-secondary` | `#bc00ff`     |
| `bg-brix-bg-light`  | `--color-brix-bg-light`  | `#f5f5f5`     |
| `bg-brix-bg-dark`   | `--color-brix-bg-dark`   | `#050505`     |

### Dark Theme Tokens (`.dark` scope — always active)

| Token class                 | CSS variable             | Default value            |
| --------------------------- | ------------------------ | ------------------------ |
| `bg-background`             | `--background`           | `#050505`                |
| `text-foreground`           | `--foreground`           | `#ffffff`                |
| `bg-muted`                  | `--muted`                | `#1a1a1a`                |
| `text-muted-foreground`     | `--muted-foreground`     | `rgba(255,255,255,0.5)`  |
| `border-border`             | `--border`               | `rgba(255,255,255,0.05)` |
| `bg-input`                  | `--input`                | `rgba(255,255,255,0.15)` |
| `ring-ring`                 | `--ring`                 | `#00eeff`                |
| `bg-primary`                | `--primary`              | `#00eeff`                |
| `text-primary-foreground`   | `--primary-foreground`   | `#000000`                |
| `bg-secondary`              | `--secondary`            | `#bc00ff`                |
| `text-secondary-foreground` | `--secondary-foreground` | `#ffffff`                |
| `bg-accent`                 | `--accent`               | `#bc00ff`                |
| `text-accent-foreground`    | `--accent-foreground`    | `#ffffff`                |
| `bg-destructive`            | `--destructive`          | `#ff4444`                |
| `bg-card`                   | `--card`                 | `rgba(255,255,255,0.02)` |
| `text-card-foreground`      | `--card-foreground`      | `#ffffff`                |
| `bg-popover`                | `--popover`              | `#0a0f0f`                |
| `text-popover-foreground`   | `--popover-foreground`   | `#ffffff`                |

### Custom Utility Classes

| Class            | Purpose                                       |
| ---------------- | --------------------------------------------- |
| `cyber-grid`     | Subtle cyan grid background                   |
| `glow-cyan`      | Cyan box-shadow glow                          |
| `glow-text-cyan` | Cyan text-shadow glow                         |
| `border-tech`    | Subtle cyan border (`rgba(0,238,255,0.2)`)    |
| `bento-card`     | Ultra-subtle white bg + border for card tiles |
| `glassmorphism`  | Frosted glass effect with blur                |
| `neon-glow`      | Cyan glow on focus                            |
| `glow-button`    | Cyan glow with purple hover transition        |
| `neon-glow-text` | Cyan text glow                                |
| `neon-grid`      | Cyan grid lines background                    |
| `glitch-border`  | Cyber-style double border with glow           |
| `crt-scan`       | CRT scanline overlay for camera page          |
| `no-scrollbar`   | Hide scrollbar cross-browser                  |

## Dark Mode

The app is **dark-mode only** (`html class="dark"` is hardcoded in root layout). Do not add light-mode variants.

## Border Radius

Border radius is intentionally sharp: `--radius: 0.125rem`. Do not over-round elements.

## Fonts

- `font-display` → Space Grotesk
- `font-body` → Inter
- `font-mono` → JetBrains Mono
