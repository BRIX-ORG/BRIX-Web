---
applyTo: 'src/stores/**/*.ts, src/hooks/apis/**/*.ts'
---

# BRIX State Management Rules

## Server State → React Query

- All server/API state is managed by React Query hooks in `src/hooks/apis/`.
- **Never duplicate API data in Zustand.** Zustand is for client-only state.

## Client State → Zustand

- Zustand stores live in `src/stores/` (e.g., `ui-store.ts`, `chat-store.ts`, `auth-store.ts`).
- Use for: UI toggles, loading overlays, local chat state, auth recovery flow state, realtime session state.

## Global Loading Overlay

```ts
import { useUIStore } from '@/stores/ui-store';

const { showLoading, hideLoading } = useUIStore();
showLoading();
// ... async work
hideLoading();
```

## Persistence

- Some Zustand stores use `persist` middleware — check existing stores before adding new persistence.
- Don't add persistence unless the data genuinely needs to survive page reloads.
