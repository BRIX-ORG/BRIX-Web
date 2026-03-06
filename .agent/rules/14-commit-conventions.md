# Commit Conventions

Commitlint enforces **conventional commits**:

```
type(scope): message
```

## Examples

```
feat(camera): add zoom control
fix(auth): handle expired refresh token
refactor(brick): extract validation logic
style(ui): update card border radius
chore(deps): bump next to 15.2
```

## Common Types

| Type       | Use for                                 |
| ---------- | --------------------------------------- |
| `feat`     | New feature                             |
| `fix`      | Bug fix                                 |
| `refactor` | Code change that neither fixes nor adds |
| `style`    | Formatting, whitespace (not CSS)        |
| `chore`    | Build, dependencies, config             |
| `docs`     | Documentation only                      |
| `perf`     | Performance improvement                 |
| `test`     | Adding or fixing tests                  |
