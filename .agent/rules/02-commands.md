# Commands

## Package Manager

This project uses **`pnpm`** exclusively. **Do not use `npm` or `yarn`.**

- Install dependencies: `pnpm install`
- Add a package: `pnpm add <package>`
- Add a dev dependency: `pnpm add -D <package>`

## Development

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint (flat config)
pnpm format       # Prettier write — run this after every code change
pnpm format:check # Prettier check (CI)
```

## Important

- No test framework is configured.
- Pre-commit hooks run lint-staged (ESLint + Prettier) and commitlint.
- **Always run `pnpm format` after making code changes** — ESLint and Prettier are configured strictly and the pre-commit hook will block commits that aren't formatted.
