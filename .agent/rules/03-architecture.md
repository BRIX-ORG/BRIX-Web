# Architecture

## App Router (`src/app/`)

```
src/app/
├── (auth)/         # login, signup, recovery, verify-email
├── (main)/         # dashboard, camera, messages (all protected)
├── api/            # NextAuth [...nextauth] route
├── introduction/   # Landing intro page
├── globals.css     # Tailwind @theme tokens — check here before writing any UI styles
└── page.tsx        # Root landing page
```

## Design Tokens

`globals.css` is the **source of truth** for design tokens (colors, fonts, spacing, radii). Always reference it before writing UI to use the correct token names.

## Route Guards

Route groups use `layout.tsx` to apply guards. Protected routes wrap with guard components from `src/guards/`.
