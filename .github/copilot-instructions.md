# BRIX Web — Copilot Instructions

## Project Overview

BRIX is a Next.js 15+ (App Router) photo platform for immutable, GPS/temporally-verified image publishing ("Build Your Truth"). Core features: camera capture, 3D GLB model uploads, real-time challenge-based photo sessions, social interactions (votes, comments, follows), messaging, and a map-based discovery feed.

---

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint (flat config)
pnpm format       # Prettier write — run this after every code change
pnpm format:check # Prettier check (CI)
```

> No test framework is configured. Pre-commit hooks run lint-staged (ESLint + Prettier) and commitlint.

**Always run `pnpm format` after making code changes** — ESLint and Prettier are configured strictly and the pre-commit hook will block commits that aren't formatted.

---

## Architecture

### App Router (`src/app/`)

```
src/app/
├── (auth)/         # login, signup, recovery, verify-email
├── (main)/         # dashboard, camera, messages (all protected)
├── api/            # NextAuth [...nextauth] route
├── introduction/   # Landing intro page
├── globals.css     # Tailwind @theme tokens — check here before writing any UI styles
└── page.tsx        # Root landing page
```

`globals.css` is the source of truth for design tokens (colors, fonts, spacing, radii). Always reference it before writing UI to use the correct token names.

Route groups use `layout.tsx` to apply guards. Protected routes wrap with guard components from `src/guards/`.

### Data Flow

1. **API calls** → `src/hooks/apis/*.api.ts` — all server state as React Query hooks
2. **Global client state** → `src/stores/*.ts` (Zustand) — auth recovery, chat, UI, realtime sessions
3. **HTTP client** → `src/lib/api-client.ts` — Axios with automatic JWT refresh on 401 (single in-flight refresh, queues retries). NextAuth stores the access/refresh tokens issued by the backend in cookies; the backend owns user data, NextAuth only holds the session tokens.
4. **Auth session** → NextAuth v5 beta provides session + tokens; `ApiClientProvider` injects them into Axios on mount.

### Folder Responsibilities

| Folder                      | Purpose                                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/app/`                  | Pages and layouts (App Router). One `page.tsx` per route.                                                         |
| `src/components/<feature>/` | UI split by feature/page. One component per file. Exported via `index.ts`.                                        |
| `src/components/ui/`        | Small reusable primitives: inputs, cards, loaders, badges. Shadcn lives here.                                     |
| `src/components/shared/`    | Components shared across multiple features (not feature-specific).                                                |
| `src/guards/`               | Route protection wrappers (`ProtectedRoute`, `GuestRoute`, etc.).                                                 |
| `src/hooks/`                | General-purpose custom hooks (non-API): `useDebounce`, `useGeolocation`, `useCamera`, `useToast`, `useSwal`, etc. |
| `src/hooks/apis/`           | React Query API hooks, split by feature module.                                                                   |
| `src/types/`                | TypeScript type definitions, split by feature to mirror `hooks/apis/`.                                            |
| `src/validations/`          | Zod schemas for form validation. Used with react-hook-form.                                                       |
| `src/stores/`               | Zustand stores for global client state.                                                                           |
| `src/utils/`                | Pure helper functions used across components (date formatting, distance, etc.).                                   |
| `src/lib/`                  | Configuration: Axios instance, React Query client, NextAuth config, server actions.                               |
| `src/providers/`            | React context providers wrapping the app.                                                                         |

---

## Conventions

### Components

- **One function component per file.** Never put two components in the same file.
- Every feature folder has an `index.ts` barrel export. Import by folder, not by file:
    ```ts
    // Correct
    import { BrickCard } from '@/components/brick-detail';
    // Wrong
    import { BrickCard } from '@/components/brick-detail/BrickCard';
    ```
- **No emoji characters in source code.** Use Lucide icons for all iconography.
- `'use client'` is required for all interactive components. Prefer RSC for layout/data-fetching-only components.

### Styling

- Tailwind CSS v4. No `tailwind.config.ts` — all config is in `globals.css` via `@theme`.
- **Prefer canonical Tailwind classes** over arbitrary values. Use `p-4` not `p-[16px]`, `text-sm` not `text-[14px]`. Only use `[]` when no standard class exists.
- BRIX design tokens to use in classes:
    - Colors: `text-brix-primary`, `bg-brix-secondary`, `bg-brix-bg-dark`
    - Primary cyan: `#00eeff` / Secondary purple: `#bc00ff` / Background: `#050505`
- App is **dark-mode only** (`html class="dark"` is hardcoded in root layout).
- Border radius is intentionally sharp (`--radius: 0.125rem`) — don't over-round.
- Font utility classes: `font-display` (Space Grotesk), `font-body` (Inter), `font-mono` (JetBrains Mono).

### TypeScript

- Strict mode is on. `any` is flagged as a warning by ESLint — avoid it.
- Use `@/*` path alias for all imports from `src/`.
- API response shape is always `ApiResponse<T>` from `src/types/api.types.ts`; unwrap with `.data.data`.
- Types are defined in `src/types/*.types.ts`, split by feature to match the API hooks files that import them.

### API Hooks (`src/hooks/apis/`)

All API calls go through React Query hooks here. Files are split by feature module (e.g., `brick.api.ts`, `user.api.ts`). Types are imported from the matching file in `src/types/`.

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

On mutations, invalidate related queries in `onSuccess`:

```ts
onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['bricks'] });
    queryClient.invalidateQueries({ queryKey: ['userBricks'] });
};
```

### Validation (`src/validations/`)

Zod schemas define form input types. Use with `react-hook-form` (reduces re-renders). Schema-inferred types are imported by API mutation hooks:

```ts
// validations/brick.ts → types used in brick.api.ts mutations
import type { UploadArtBrickFormInput } from '@/validations/brick';
```

### State Management

- **Server state**: React Query only. Never duplicate API data in Zustand.
- **Global loading overlay**: use `useUIStore` from `src/stores/ui-store.ts`:
    ```ts
    const { showLoading, hideLoading } = useUIStore();
    ```
- Zustand stores use `persist` middleware where configured — check existing stores before adding new persistence.

### Notifications & Dialogs

Always use the project hooks instead of calling libraries directly:

- **Toast notifications** (`useToast` from `src/hooks/useToast.ts`):
    ```ts
    const { success, error, loading, promise } = useToast();
    ```
- **Confirmation dialogs / alerts** (`useSwal` from `src/hooks/useSwal.ts`):
    ```ts
    const { confirm, success, error } = useSwal();
    const result = await confirm({ title: 'Delete?', icon: 'warning' });
    ```

Both hooks are pre-configured with the BRIX dark theme.

### Utils (`src/utils/`)

Any logic shared across components that is independent of React (formatting, calculations, helpers) goes here. Don't inline the same logic in multiple components.

### SVGs

SVGs import as React components via `@svgr/webpack`:

```ts
import Icon from '@/assets/icon.svg';
// <Icon />
```

SVGO runs on commit via lint-staged.

### Commit Messages

Commitlint enforces conventional commits: `type(scope): message`
Example: `feat(camera): add zoom control`

---

## Before Coding a Feature with API Integration

1. Check existing components in the relevant feature folder for patterns already in use.
2. Read the matching file in `src/hooks/apis/` to understand how API calls are structured for that module.
3. Read the matching file in `src/types/` to understand existing type shapes — add new types there.
4. Use `useUIStore().showLoading` / `hideLoading` for global loading states.
5. Use `useToast` for inline feedback and `useSwal` for confirmations/blocking dialogs.
6. Define form validation in `src/validations/` with Zod; wire to `react-hook-form` in the component.

---

## Environment Variables

```
NEXT_PUBLIC_BACKEND_URL     # Backend REST API base URL
NEXTAUTH_SECRET             # NextAuth secret
NEXTAUTH_URL                # App base URL
NEXT_PUBLIC_FIREBASE_*      # Firebase public config
```

---

## Key Dependencies

| Purpose       | Package                                              |
| ------------- | ---------------------------------------------------- |
| Framework     | Next.js 15, React 19                                 |
| Auth          | next-auth v5 beta, Firebase                          |
| Data fetching | @tanstack/react-query v5, axios                      |
| Global state  | zustand v5                                           |
| Forms         | react-hook-form + zod v4                             |
| UI components | shadcn/ui (new-york), lucide-react                   |
| Notifications | react-toastify (`useToast`), sweetalert2 (`useSwal`) |
| Styling       | Tailwind CSS v4, tw-animate-css                      |
| 3D graphics   | three.js, @react-three/fiber, @react-three/drei      |
| Maps          | maplibre-gl                                          |
| Animations    | gsap, motion (Framer Motion)                         |
| Realtime      | socket.io-client                                     |
