# BRIX Web — Copilot Instructions

## Project Overview

BRIX is a Next.js 15+ (App Router) photo platform for immutable, GPS/temporally-verified image publishing ("Build Your Truth"). Core features: camera capture, 3D GLB model uploads, real-time challenge-based photo sessions, social interactions (votes, comments, follows), messaging, and a map-based discovery feed.

---

## Commands

This project uses **`pnpm`** exclusively. **Do not use `npm` or `yarn`.**

```bash
pnpm install      # Install dependencies
pnpm add <pkg>    # Add a package
pnpm add -D <pkg> # Add a dev dependency
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint (flat config)
pnpm format       # Prettier write — run this after every code change
pnpm format:check # Prettier check (CI)
```

**Always run `pnpm format` after making code changes.** Pre-commit hooks run lint-staged (ESLint + Prettier) and commitlint.

---

## Architecture Summary

- **App Router:** `src/app/` with route groups `(auth)` and `(main)`. `globals.css` is the design token source of truth.
- **Data flow:** React Query hooks (`src/hooks/apis/`) → Zustand stores (`src/stores/`) → Axios client (`src/lib/api-client.ts`) with JWT auto-refresh → NextAuth v5 beta session.
- **Guards:** Route protection via `src/guards/` wrappers in layout files.

### Folder Responsibilities

| Folder                      | Purpose                                                                    |
| --------------------------- | -------------------------------------------------------------------------- |
| `src/app/`                  | Pages & layouts (App Router). One `page.tsx` per route.                    |
| `src/components/<feature>/` | UI by feature. One component per file. Barrel `index.ts`.                  |
| `src/components/ui/`        | Reusable primitives (Shadcn).                                              |
| `src/components/shared/`    | Cross-feature shared components.                                           |
| `src/guards/`               | Route protection (`ProtectedRoute`, `GuestRoute`, etc.).                   |
| `src/hooks/`                | Custom hooks (non-API): `useDebounce`, `useGeolocation`, `useCamera`, etc. |
| `src/hooks/apis/`           | React Query API hooks, split by feature.                                   |
| `src/types/`                | TypeScript types, split by feature to mirror `hooks/apis/`.                |
| `src/validations/`          | Zod schemas for form validation (react-hook-form).                         |
| `src/stores/`               | Zustand stores for global client state.                                    |
| `src/utils/`                | Pure helper functions (formatting, distance, etc.).                        |
| `src/lib/`                  | Config: Axios, React Query client, NextAuth, server actions.               |
| `src/providers/`            | React context providers wrapping the app.                                  |

---

## Core Conventions

- **Components:** One per file. Barrel exports via `index.ts`. Import by folder. `'use client'` for interactive, RSC for data-fetching-only. No emoji in source — use Lucide icons.
- **Styling:** Tailwind v4 via `globals.css` `@theme`. Token-first (never hardcode colors). Dark-mode only. Sharp radius (`--radius: 0.125rem`). Prefer canonical classes over arbitrary values.
- **TypeScript:** Strict mode. `@/*` alias. Unwrap `ApiResponse<T>` with `.data.data`. Types in `src/types/*.types.ts`.
- **API hooks:** `queryKey` tagged by entity+id. `invalidateQueries` in `onSuccess`. `enabled: !!id`.
- **State:** React Query for server state. Zustand for client-only state. Never duplicate API data in Zustand.
- **Notifications:** Always `useToast` for toasts, `useSwal` for confirmations — never call libraries directly.
- **Validation:** Zod schemas in `src/validations/`, wired to `react-hook-form`.
- **SVGs:** Import as React components via `@svgr/webpack`. SVGO on commit.
- **Commits:** Conventional format: `type(scope): message`.

---

## Before Coding

1. Check existing patterns in the relevant feature folder.
2. Read matching `src/hooks/apis/` and `src/types/` files.
3. Use `useUIStore().showLoading/hideLoading` for global loading.
4. Use `useToast`/`useSwal` for feedback.
5. Zod validation in `src/validations/`, wire to `react-hook-form`.
6. Run `pnpm lint` (medium changes) or `pnpm lint && pnpm build` (large changes).

> Detailed rules for each area are in `.github/instructions/*.instructions.md` (auto-applied by glob pattern).

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
