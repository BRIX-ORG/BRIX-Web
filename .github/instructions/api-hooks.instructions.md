---
applyTo: 'src/hooks/apis/**/*.ts'
---

# BRIX API Hooks Rules

## Location & Structure

- All API calls go through React Query hooks in `src/hooks/apis/`, split by feature module (e.g., `brick.api.ts`, `user.api.ts`, `message.api.ts`).
- Types are imported from the matching file in `src/types/` (e.g., `brick.types.ts`).

## Query Keys

Always tag `queryKey` arrays with entity + identifier for targeted cache invalidation:

```ts
export function useGetBrickDetail(brickId: string | undefined) {
    return useQuery({
        queryKey: ['brick', brickId],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<BrickDetail>>(
                `/api/bricks/${brickId}`,
            );
            return response.data.data;
        },
        enabled: !!brickId,
    });
}
```

## Response Unwrapping

- API response shape: `ApiResponse<T>` from `src/types/api.types.ts`.
- Always unwrap with `response.data.data` — never return the raw Axios response.

## Conditional Fetching

- Use `enabled: !!id` (or equivalent) to prevent queries from firing with undefined parameters.

## Mutation Invalidation

On mutations, invalidate related queries in `onSuccess`:

```ts
onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['bricks'] });
    queryClient.invalidateQueries({ queryKey: ['userBricks'] });
};
```

## HTTP Client

- Use the shared `apiClient` from `src/lib/api-client.ts` — never create separate Axios instances.
- The client handles JWT auto-refresh on 401 with a single in-flight refresh queue.
