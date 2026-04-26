## What changed

<!-- One or two sentences describing the change. -->

## Why

<!-- Linked issue (closes #N) or short rationale if there's no issue. -->

## Testing performed

<!-- What did you do to verify this works? Manual reproduction, unit tests, build output inspection, AATT install + build, validator.schema.org check, etc. -->

## Breaking changes

<!-- "None" if non-breaking. Otherwise: what breaks, who's affected, and the migration path. -->

## Linked issues

<!-- closes #N / refs #N — fill in or remove. -->

## Checklist

- [ ] Code builds cleanly (`npm run build`)
- [ ] Lint + typecheck + tests pass (`npm run lint && npm run typecheck && npm test`)
- [ ] CHANGELOG.md `[Unreleased]` section updated (Added / Changed / Deprecated / Removed / Fixed / Security)
- [ ] README updated if this changes user-facing behavior or scope
- [ ] PR title follows [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, etc.) — becomes the squashed commit message
