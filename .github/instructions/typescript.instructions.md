---
applyTo: '**/*.ts, **/*.tsx'
---

# BRIX TypeScript Rules

## Strict Mode

- TypeScript strict mode is enabled. No implicit `any`.
- ESLint flags `any` as a warning — avoid it. Use proper types or `unknown` with type guards.

## Path Alias

- Always use `@/*` alias for imports from `src/`:
    ```ts
    import { BrickDetail } from '@/types/brick.types';
    ```
- Never use relative paths that go up more than one level (`../../`).

## API Response Unwrapping

- All API responses follow the `ApiResponse<T>` shape from `src/types/api.types.ts`.
- Always unwrap with `.data.data`:
    ```ts
    const response = await apiClient.get<ApiResponse<BrickDetail>>(`/api/bricks/${id}`);
    return response.data.data;
    ```

## Type Definitions

- Types live in `src/types/*.types.ts`, split by feature to mirror the API hooks files.
- When adding a new API endpoint, add its types to the matching types file (e.g., `brick.types.ts` for brick endpoints).
- Export types with `export type` or `export interface`.
