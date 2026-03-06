---
applyTo: 'src/components/**/*.tsx, src/components/**/*.ts'
---

# BRIX Component Rules

## One Component Per File

- **Never put two components in the same file.** Each file exports exactly one function component.
- Exception: small internal sub-components can be in the same file only if they are not exported.

## Barrel Exports

Every feature folder has an `index.ts` barrel export. Import by folder, not by file:

```ts
// ✅ Correct
import { BrickCard } from '@/components/brick-detail';

// ❌ Wrong
import { BrickCard } from '@/components/brick-detail/BrickCard';
```

## Client vs Server Components

- `'use client'` is required for all interactive components (event handlers, hooks, browser APIs).
- Prefer React Server Components (RSC) for layout/data-fetching-only components that don't need interactivity.

## No Emoji in Source

- Never use emoji characters in source code. Use **Lucide React** icons for all iconography:
    ```ts
    import { Camera, Heart, Share2 } from 'lucide-react';
    ```

## Feature Folder Structure

```
src/components/<feature>/
├── FeatureComponent.tsx
├── AnotherComponent.tsx
└── index.ts              # barrel export
```

## Shared & UI Components

- `src/components/ui/` — Shadcn primitives (inputs, cards, badges, etc.). Auto-generated; rarely edit manually.
- `src/components/shared/` — Components used across multiple features (not tied to one feature page).
