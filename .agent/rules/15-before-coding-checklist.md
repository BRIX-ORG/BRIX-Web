# Before Coding a Feature — Checklist

Before writing any feature code (especially with API integration), follow this checklist:

1. **Check existing components** in the relevant feature folder for patterns already in use.
2. **Read the matching API hooks file** in `src/hooks/apis/` to understand how API calls are structured for that module.
3. **Read the matching types file** in `src/types/` to understand existing type shapes — add new types there.
4. **Use `useUIStore().showLoading` / `hideLoading`** for global loading states.
5. **Use `useToast`** for inline feedback and **`useSwal`** for confirmations / blocking dialogs.
6. **Define form validation** in `src/validations/` with Zod; wire to `react-hook-form` in the component.
7. **Reference `globals.css`** before writing any UI to use the correct design token names.
8. **Run `pnpm format`** after making code changes.
9. **Verification after coding:**
    - **Small changes:** No commands needed, just double-check logic.
    - **Medium changes:** Run `pnpm lint` to ensure no regressions.
    - **Large changes/Refactors:** Run `pnpm lint` and `pnpm build` to verify the entire app integrity.
