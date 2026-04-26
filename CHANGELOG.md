# Changelog

All notable changes to `@obaronai/astro-ai-readiness` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Pre-1.0 releases may include breaking changes in MINOR bumps per [semver §4](https://semver.org/#spec-item-4).

## [Unreleased]

### Changed

- README and CONTRIBUTING rewritten to reflect v0.0.1 shipped reality (per Plan 05b). Drift removed: roadmap section now lists what's coming by version; "What ships" section lists only `<OrganizationSchema>`. Will reach the npm registry with the next version publish.
- Repo foundation aligned with the open-source repo management playbook (`obaron/brand/gh-org/repo-management.md`): added `CHANGELOG.md`, `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1), `SECURITY.md`, `.github/CODEOWNERS`, `.github/dependabot.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`. Issue templates converted from Markdown to YAML forms with required-field enforcement. `CONTRIBUTING.md` relocated to `.github/CONTRIBUTING.md` per playbook convention.

### Removed

- `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md` (replaced by YAML form variants).

## [0.0.1] — 2026-04-25

First published release. End-to-end tracer slice per `plans/05-e2e-tracer.md`.

### Added

- Astro integration `aiReadiness({...})` factory with strict Zod config schema (top-level `.strict()` + nested `organization.strict()`).
- Vite virtual module `virtual:obaronai-config` exposing the validated config to components at consumer build time.
- `<OrganizationSchema />` Astro component — emits canonical Schema.org Organization JSON-LD inline; all data sourced from the `organization` config block; `</script>` escaped via `<` → `<` to prevent parser confusion.
- Package subpath exports: `@obaronai/astro-ai-readiness` (integration factory) and `@obaronai/astro-ai-readiness/components` (component barrel).
- TypeScript declarations for `AiReadinessConfig`, `OrganizationConfig`, `FounderConfig`.
- Build pipeline: tsup (ESM) for `.ts` + `cp` step for `.astro` source files into `dist/components/`.

[Unreleased]: https://github.com/obaronai/astro-ai-readiness/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/obaronai/astro-ai-readiness/releases/tag/v0.0.1
