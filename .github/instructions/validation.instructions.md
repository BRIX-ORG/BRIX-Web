---
applyTo: 'src/validations/**/*.ts, src/components/**/*.tsx'
---

# BRIX Validation Rules

## Zod Schemas

- All form validation schemas live in `src/validations/`, split by feature (e.g., `auth.ts`, `brick.ts`, `message.ts`, `user.ts`).
- Schemas define the form input shape; inferred types are used by components and API mutation hooks.

## Integration with react-hook-form

- Always wire Zod schemas to `react-hook-form` via `@hookform/resolvers/zod`:

    ```ts
    import { zodResolver } from '@hookform/resolvers/zod';
    import { useForm } from 'react-hook-form';
    import { mySchema, type MyFormInput } from '@/validations/feature';

    const form = useForm<MyFormInput>({
        resolver: zodResolver(mySchema),
    });
    ```

## Schema-Inferred Types

- Export inferred types from schema files for reuse in API hooks and components:
    ```ts
    // validations/brick.ts
    export const uploadArtBrickSchema = z.object({ ... });
    export type UploadArtBrickFormInput = z.infer<typeof uploadArtBrickSchema>;
    ```
- Import these types (not raw objects) in mutation hooks:
    ```ts
    import type { UploadArtBrickFormInput } from '@/validations/brick';
    ```
