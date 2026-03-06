# Utils & SVGs

## Utils (`src/utils/`)

Any logic shared across components that is **independent of React** (formatting, calculations, helpers) goes here. Do not inline the same logic in multiple components — extract it to a utility function.

## SVGs

SVGs are imported as React components via `@svgr/webpack`:

```ts
import Icon from '@/assets/icon.svg';
// <Icon />
```

SVGO runs on commit via lint-staged to optimize SVG files automatically.
