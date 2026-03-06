---
description: Scaffold a new feature (component + API hook + types + validation + barrel export)
---

# Create New Feature

Follow these steps to scaffold a complete new feature for the BRIX project.

## Steps

1. **Create the feature component folder** at `src/components/<feature-name>/`.

2. **Create the main component file** `src/components/<feature-name>/<ComponentName>.tsx`:
    - Add `'use client'` directive if the component is interactive.
    - Use functional component with proper TypeScript props interface.
    - Import design tokens from `globals.css` (check before writing styles).
    - Use `font-display`, `font-body` classes. Use BRIX token colors (`brix-primary`, `brix-secondary`, etc.).

3. **Create barrel export** `src/components/<feature-name>/index.ts`:

    ```ts
    export { ComponentName } from './ComponentName';
    ```

4. **Create types** in `src/types/<feature-name>.types.ts`:
    - Define all API response and request types.
    - Follow the `ApiResponse<T>` pattern from `src/types/api.types.ts`.

5. **Create API hooks** in `src/hooks/apis/<feature-name>.api.ts`:
    - Use React Query `useQuery` / `useMutation`.
    - Tag `queryKey` arrays (`['feature', id]`).
    - Unwrap responses with `.data.data`.
    - Use `enabled: !!id` for conditional queries.

6. **Create validation schema** in `src/validations/<feature-name>.ts` (if forms are needed):
    - Define Zod schema.
    - Export inferred type: `export type FormInput = z.infer<typeof schema>;`

7. **Create the page** in `src/app/(main)/<feature-name>/page.tsx` (if it's a new route).

// turbo 8. **Run formatting**: `pnpm format`

9. **Verify**: `pnpm lint`
