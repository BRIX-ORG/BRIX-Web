# Component Conventions

## Rules

- **One function component per file.** Never put two components in the same file.
- Every feature folder has an `index.ts` barrel export. Import by folder, not by file:

```ts
// ✅ Correct
import { BrickCard } from '@/components/brick-detail';

// ❌ Wrong
import { BrickCard } from '@/components/brick-detail/BrickCard';
```

- **No emoji characters in source code.** Use Lucide icons (`lucide-react`) for all iconography.
- `'use client'` is required for all interactive components (event handlers, hooks, state).
- Prefer React Server Components (RSC) for layout and data-fetching-only components.
