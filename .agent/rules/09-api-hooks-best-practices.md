# API Hooks Best Practices

## Location

All API calls go through React Query hooks in `src/hooks/apis/`. Files are split by feature module (e.g., `brick.api.ts`, `user.api.ts`). Types are imported from the matching file in `src/types/`.

## Query Key Tagging

Always tag `queryKey` arrays for targeted cache invalidation:

```ts
export function useGetBrickDetail(brickId: string | undefined) {
    return useQuery({
        queryKey: ['brick', brickId], // tag with entity + id
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<BrickDetail>>(
                `/api/bricks/${brickId}`,
            );
            return response.data.data; // always unwrap .data.data
        },
        enabled: !!brickId,
    });
}
```

## Mutation Cache Invalidation

On mutations, invalidate related queries in `onSuccess`:

```ts
onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['bricks'] });
    queryClient.invalidateQueries({ queryKey: ['userBricks'] });
};
```

## Key Rules

- Use `enabled: !!id` to prevent queries from firing with undefined params.
- Always unwrap API responses with `.data.data`.
- Keep query keys hierarchical: `['entity', id]` or `['entity', 'list', filters]`.
