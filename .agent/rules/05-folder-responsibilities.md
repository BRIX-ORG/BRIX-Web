# Folder Responsibilities

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
