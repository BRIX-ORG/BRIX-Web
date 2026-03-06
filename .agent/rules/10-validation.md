# Validation

## Stack

- **Zod** for schema definitions (in `src/validations/`).
- **react-hook-form** for form state management (reduces re-renders).

## Pattern

1. Define the Zod schema in `src/validations/<feature>.ts`.
2. Infer the TypeScript type from the schema.
3. Import the inferred type in the API mutation hook.

```ts
// src/validations/brick.ts
export const uploadArtBrickSchema = z.object({ ... });
export type UploadArtBrickFormInput = z.infer<typeof uploadArtBrickSchema>;

// src/hooks/apis/brick.api.ts
import type { UploadArtBrickFormInput } from '@/validations/brick';
```

## Rules

- Always define validation schemas in `src/validations/`, not inline in components.
- Use `zodResolver` to connect Zod schemas with react-hook-form.
- Schema-inferred types are the single source of truth for form input shapes.
