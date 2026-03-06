# Data Flow

## Request Lifecycle

1. **API calls** → `src/hooks/apis/*.api.ts` — all server state as React Query hooks.
2. **Global client state** → `src/stores/*.ts` (Zustand) — auth recovery, chat, UI, realtime sessions.
3. **HTTP client** → `src/lib/api-client.ts` — Axios with automatic JWT refresh on 401 (single in-flight refresh, queues retries).
4. **Auth session** → NextAuth v5 beta provides session + tokens; `ApiClientProvider` injects them into Axios on mount.

## Key Details

- NextAuth stores the access/refresh tokens issued by the backend in cookies.
- The **backend owns user data**; NextAuth only holds the session tokens.
- The Axios instance handles 401 responses by refreshing the JWT automatically using a single in-flight refresh pattern (all concurrent requests queue behind the same refresh call).
