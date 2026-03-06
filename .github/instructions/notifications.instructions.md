---
applyTo: 'src/components/**/*.tsx, src/hooks/**/*.ts'
---

# BRIX Notifications & Dialogs Rules

## Never Call Libraries Directly

Always use the project hooks instead of importing `react-toastify` or `sweetalert2` directly.

## Toast Notifications

Use `useToast` from `src/hooks/useToast.ts`:

```ts
const { success, error, loading, promise } = useToast();

success('Brick uploaded!');
error('Something went wrong');
promise(asyncFn(), { pending: 'Uploading...', success: 'Done!', error: 'Failed' });
```

## Confirmation Dialogs & Alerts

Use `useSwal` from `src/hooks/useSwal.ts`:

```ts
const { confirm, success, error } = useSwal();

const result = await confirm({ title: 'Delete this brick?', icon: 'warning' });
if (result.isConfirmed) {
    // proceed with deletion
}
```

## Theme

Both hooks are pre-configured with the BRIX dark theme — no extra styling needed.
