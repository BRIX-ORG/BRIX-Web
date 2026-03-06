# State Management

## Server State → React Query Only

All data fetched from the API is managed exclusively by React Query. **Never duplicate API data in Zustand.**

## Client State → Zustand

Zustand stores (`src/stores/`) are only for global client-side state:

- Auth recovery
- Chat UI state
- UI overlays / loading
- Realtime session state

## Global Loading Overlay

Use `useUIStore` from `src/stores/ui-store.ts`:

```ts
const { showLoading, hideLoading } = useUIStore();
```

## Zustand Persistence

Some stores use the `persist` middleware — check existing stores before adding new persistence to avoid conflicts.
