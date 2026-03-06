---
applyTo: 'src/utils/**/*.ts, **/*.svg'
---

# BRIX Utils & SVG Rules

## Utils (`src/utils/`)

- Pure helper functions shared across components go here (formatting, calculations, distance, time, etc.).
- Must be independent of React — no hook calls, no JSX.
- Don't inline the same logic in multiple components; extract to utils instead.
- Existing utils: `brick.ts`, `classnames.ts`, `cloudinary.ts`, `time.ts`.

## SVGs

- SVGs import as React components via `@svgr/webpack`:
    ```ts
    import Icon from '@/assets/icon.svg';
    // Usage: <Icon className="size-6" />
    ```
- SVGO runs automatically on commit via lint-staged — no manual optimization needed.
- Prefer Lucide React icons over custom SVGs when a suitable icon exists.
