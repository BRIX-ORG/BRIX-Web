# TypeScript Conventions

## Strict Mode

- TypeScript strict mode is **on**.
- `any` is flagged as a warning by ESLint — avoid it. Use proper types or `unknown`.

## Path Aliases

Use the `@/*` path alias for all imports from `src/`:

```ts
import { BrickCard } from '@/components/brick-detail';
```

## API Response Shape

All API responses follow the `ApiResponse<T>` type from `src/types/api.types.ts`. Always unwrap with `.data.data`:

```ts
const response = await apiClient.get<ApiResponse<BrickDetail>>(`/api/bricks/${id}`);
return response.data.data; // ← always unwrap
```

## Type Definitions

Types are defined in `src/types/*.types.ts`, split by feature to match the API hooks files that import them.
