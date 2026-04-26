# Changelog

All notable changes to `@obaronai/astro-ai-readiness` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Pre-1.0 releases may include breaking changes in MINOR bumps per [semver §4](https://semver.org/#spec-item-4).

## [Unreleased]

### Changed

- README and CONTRIBUTING rewritten to reflect v0.0.1 shipped reality (per Plan 05b). Drift removed: roadmap section now lists what's coming by version; "What ships" section lists only `<OrganizationSchema>`. Will reach the npm registry with the next version publish.
- Repo foundation aligned with the open-source repo management playbook (`obaron/brand/gh-org/repo-management.md`): added `CHANGELOG.md`, `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1), `SECURITY.md`, `.github/CODEOWNERS`, `.github/dependabot.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`. Issue templates converted from Markdown to YAML forms with required-field enforcement. `CONTRIBUTING.md` relocated to `.github/CONTRIBUTING.md` per playbook convention.
- `npm test` and `npm run lint` stub-fail (`exit 1`) until vitest + eslint land. Honest CI: contributors and Dependabot see a red rope-line for missing coverage rather than a green-painted no-op. When real configs land, swap the echo-fails for the real commands and re-add lint/test to `release.yml` (currently typecheck + build only).
- `release.yml` hardened: tag-vs-`package.json`-version guard before publish (prevents "cannot publish over previously published version" if a tag and the manifest drift), explicit dist-artifact non-empty checks, and a comment on the hardcoded `node-version: 22` so the next LTS-policy sweep doesn't miss it.
- `SECURITY.md` "Supported versions" section reworded — pre-1.0 the policy is "most recently published version" (no backports); the most-recent-minor policy activates at 1.0.
- Issue forms now apply `priority: medium` as the triage default (per playbook line 271 — "default medium until evaluated") alongside the existing `type:` and `status: needs-triage` labels.
- `CONTRIBUTING.md` adds the open-vs-closed boundary link to the org Profile README and a one-paragraph voice steer (institutional, specific, no AI-hype) so contributors can mirror the README/Profile-README tone in PRs and issue comments.
- `dependabot.yml` annotated with rationale on the open-PR limits.
- Pull-request template trimmed back to the playbook's spec (What changed / Why / Testing / Breaking / Linked issues + Conventional Commits hint). Earlier checklist removed for fidelity to the seed-instance spec; if we want the checklist as standard across all Obaron repos, update the playbook's PR-template description and re-add.

### Added

- `docs/maintainer-setup.md` — durable record of the GitHub-UI / npm-web tasks needed to complete Foundation, including the **branch-protection sub-decision** the stub-fail decision exposed (require-status-checks would block every Dependabot PR until lint/test are real). Recommends Option 1 — flip status-check requirement on in the same commit that makes lint/test real. Also documents the trigger list for when `src/components/` adds a new component (`release.yml` dist verification needs appending) and the swap-when-real path for stub-failed scripts.
- `release.yml` dist verification block carries an inline reminder that the artifact list is hardcoded and needs appending when new components ship.

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
