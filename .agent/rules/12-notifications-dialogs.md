# Notifications & Dialogs

Always use the project hooks — **never call the underlying libraries directly**.

## Toast Notifications

Use `useToast` from `src/hooks/useToast.ts`:

```ts
const { success, error, loading, promise } = useToast();
```

## Confirmation Dialogs & Alerts

Use `useSwal` from `src/hooks/useSwal.ts`:

```ts
const { confirm, success, error } = useSwal();
const result = await confirm({ title: 'Delete?', icon: 'warning' });
```

## Important

Both hooks are **pre-configured with the BRIX dark theme**. Calling `react-toastify` or `sweetalert2` directly will break the visual consistency.
