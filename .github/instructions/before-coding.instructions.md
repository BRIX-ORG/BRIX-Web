---
applyTo: 'src/**/*.ts, src/**/*.tsx'
---

# BRIX Before-Coding Checklist

Before implementing a feature (especially with API integration), follow this checklist:

1. **Check existing patterns** — Look at existing components in the relevant feature folder. Follow the same structure.
2. **Read API hooks** — Open the matching file in `src/hooks/apis/` to understand how API calls are structured for that module.
3. **Read type definitions** — Open the matching file in `src/types/` to understand existing type shapes. Add new types there, not inline.
4. **Global loading** — Use `useUIStore().showLoading` / `hideLoading` for loading states that block the entire UI.
5. **Feedback** — Use `useToast` for inline feedback and `useSwal` for confirmations/blocking dialogs.
6. **Form validation** — Define Zod schemas in `src/validations/`, wire to `react-hook-form` in the component.
7. **Verify after coding:**
    - **Small changes:** No commands needed, just double-check logic.
    - **Medium changes:** Run `pnpm lint`.
    - **Large changes / refactorings:** Run `pnpm lint` and `pnpm build`.
8. **Format:** Always run `pnpm format` after making changes.

## Commit Convention

Commitlint enforces conventional commits: `type(scope): message`

Examples:

- `feat(camera): add zoom control`
- `fix(auth): handle expired token redirect`
- `refactor(dashboard): extract stats grid component`
