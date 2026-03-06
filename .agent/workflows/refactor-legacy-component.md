---
description: Refactor a legacy component to follow current BRIX conventions
---

# Refactor Legacy Component

Follow these steps to bring an older component up to the current BRIX patterns.

## Steps

1. **Audit the component**:
    - Check if it violates any rule in `.agent/rules/` (barrel exports, one component per file, `'use client'`, etc.).
    - Identify any inline API calls (should use React Query hooks from `src/hooks/apis/`).
    - Identify any inline validation (should use Zod schemas from `src/validations/`).
    - Check for direct library calls (`react-toastify`, `sweetalert2`) that should use `useToast` / `useSwal`.
    - Check for duplicated API data in Zustand stores.
    - Check for arbitrary Tailwind values that have canonical equivalents.

2. **Extract types** to `src/types/<feature>.types.ts` if inline types exist.

3. **Extract API calls** to `src/hooks/apis/<feature>.api.ts` as React Query hooks:
    - Follow queryKey tagging convention.
    - Unwrap with `.data.data`.

4. **Extract validation** to `src/validations/<feature>.ts` if inline Zod schemas exist.

5. **Split multi-component files** into separate files (one component per file).

6. **Update barrel export** `index.ts` in the feature folder.

7. **Replace direct library calls**:
    - `toast(...)` → `useToast().success(...)` / `.error(...)`
    - `Swal.fire(...)` → `useSwal().confirm(...)` / `.success(...)`

8. **Replace emojis** with Lucide icons.

9. **Review styling**:
    - Replace arbitrary values with canonical Tailwind classes.
    - Use BRIX token classes (`brix-primary`, `brix-secondary`, etc.).
    - Verify sharp border radius (no over-rounding).

// turbo 10. **Run formatting**: `pnpm format`

11. **Verify**: `pnpm lint`
