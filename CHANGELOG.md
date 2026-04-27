# Changelog

All notable changes to `@obaronai/astro-ai-readiness` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Pre-1.0 releases may include breaking changes in MINOR bumps per [semver §4](https://semver.org/#spec-item-4).

## [Unreleased]

## [0.0.3] — 2026-04-27

Third slice per `plans/07-v0.0.3-breadcrumb-faq-techarticle.md`. Retires the items-array prop pattern; brings the toolkit to five of six components. `<TechArticleSchema>` (heavy-props) splits to v0.0.4 per the cadence rule (one pattern per slice).

### Added

- `<BreadcrumbSchema items={[{ name, url }, ...]} />` — items-array Astro component emitting Schema.org `BreadcrumbList` JSON-LD with 1-based `position` numbering and `itemListElement` mapping. Empty-`items` guard suppresses emission entirely.
- `<FAQPageSchema items={[{ question, answer }, ...]} />` — items-array Astro component emitting Schema.org `FAQPage` JSON-LD with `mainEntity → Question → acceptedAnswer` shape. Empty-`items` guard. Long-form answers escape via the v0.0.2 `jsonLd()` helper (covers `</script>`, U+2028, U+2029 — round-trip clean via `JSON.parse`).
- `src/components/types.ts` — shared types module exporting `BreadcrumbItem` and `FAQItem`. Lives as `.ts` (not `.astro`) so tsup's `dts: true` ships the declarations; consumers `import type { BreadcrumbItem, FAQItem } from '@obaronai/astro-ai-readiness/components'`.
- `dist/components/types.{js,d.ts}` artifacts; tsup entry map updated.

### Changed

- Vite plugin `name` field renamed from `'@obaronai/astro-ai-readiness:virtual-config'` to `'obaronai-virtual-config'` — matches Vite's single-segment plugin-naming convention. Behavior unchanged. Closes v0.0.2 review Medium #4.
- `site`, `organization.url`, `organization.logo`, and `founder.sameAs` URLs now require `https://` (or `http://localhost` for dev) via Zod `.refine()`. Throws `URL must use https:// (or http://localhost for dev)` at integration-factory call time on non-conforming input. Closes v0.0.2 review Medium #5.
- README + Quick Start rewritten to reflect v0.0.3 shipped reality (five components live; TechArticle on roadmap). New Quick Start sections show `<BreadcrumbSchema>` and `<FAQPageSchema>` usage with the items-array pattern and the `BreadcrumbItem` / `FAQItem` interface re-exports. "Shipped on" reflects AATT running five of six components after the install.
- Component barrel re-exports five components plus `BreadcrumbItem` / `FAQItem` interface types from `./types`.

## [0.0.2] — 2026-04-26

Second slice per `plans/06-v0.0.2-website-collection.md`. Adds two more components (one config-driven, one props-driven), establishes the `@id`-referenced entity-graph pattern across components, and promotes the JSON-LD escape helper to a shared utility. First post-foundation release — also carries the README/CONTRIBUTING reality-update from Plan 05b and the playbook foundation alignment.

### Added

- `<WebSiteSchema />` — config-driven Astro component emitting Schema.org `WebSite` JSON-LD. Declares `@id: '<site>#website'`; references the organization via `{ '@id': '<site>#organization' }` instead of redeclaring publisher fields.
- `<CollectionSchema name url description? />` — props-driven Astro component emitting `CollectionPage` JSON-LD. First props-accepting component in the toolkit; sets the TS `interface Props` precedent for v0.0.3+.
- Optional `webSite` config block (`name?: string`, `description?: string`); both `.strict()` against typos. `webSite.name` defaults to `organization.name` when absent (covers the common case where brand and legal entity match).
- `src/utils/json-ld.ts` — `jsonLd()` helper escaping `</script>` (broad `<` form) plus U+2028 / U+2029 line-separator codepoints. All three components import from it; subsequent slices inherit the same single source of truth.
- `WebSiteConfig` TypeScript type re-exported from the package root alongside `AiReadinessConfig` / `OrganizationConfig` / `FounderConfig`.
- `dist/utils/json-ld.{js,d.ts}` artifacts; tsup entry map updated to include the new path.

### Changed

- `<OrganizationSchema>` refactored to use the shared `jsonLd()` helper. Adds `@id: '<site>#organization'` to the rendered JSON-LD so `<WebSiteSchema>` and `<CollectionSchema>` can reference it without redeclaring publisher fields. No other change to the rendered fields — pre-existing AATT consumers see one new line.
- `src/components/astro-shim.d.ts` tightened from `(props: Record<string, unknown>) => unknown` to `AstroComponentFactory` from `astro/runtime/server/index.js`. `astro check` on consumer sites now catches prop-shape errors against `<CollectionSchema>` (and any future props-driven component) at the package boundary.
- README + Quick Start rewritten to reflect v0.0.2 shipped reality per the practice in `obaron/astro-ai-readiness/CLAUDE.md` ("README reflects shipped reality, not aspirational scope"). Status line, "What ships," Quick Start config + component examples, and the roadmap section all updated together.
- This release also carries the v0.0.1 → v0.0.2-cumulative changes that landed since publish: README/CONTRIBUTING reality-update (Plan 05b), repo foundation files (`CHANGELOG`, `CODE_OF_CONDUCT`, `SECURITY`, `.github/CODEOWNERS`, `.github/dependabot.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`), issue templates as YAML forms, `CONTRIBUTING.md` moved to `.github/`, `package.json` `engines.node` bumped 18 → 22, `aeo` + `agent-readable` keywords, `typecheck` script. Stub-failing `npm test` and `npm run lint` until vitest + eslint land. `release.yml` tag-vs-version guard, dist-artifact verification, hardcoded-list-trigger comment.

### Removed

- `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md` (replaced by YAML form variants in 0.0.2-cumulative).

## [0.0.1] — 2026-04-25

First published release. End-to-end tracer slice per `plans/05-e2e-tracer.md`.

### Added

- Astro integration `aiReadiness({...})` factory with strict Zod config schema (top-level `.strict()` + nested `organization.strict()`).
- Vite virtual module `virtual:obaronai-config` exposing the validated config to components at consumer build time.
- `<OrganizationSchema />` Astro component — emits canonical Schema.org Organization JSON-LD inline; all data sourced from the `organization` config block; `</script>` escaped via `<` → `<` to prevent parser confusion.
- Package subpath exports: `@obaronai/astro-ai-readiness` (integration factory) and `@obaronai/astro-ai-readiness/components` (component barrel).
- TypeScript declarations for `AiReadinessConfig`, `OrganizationConfig`, `FounderConfig`.
- Build pipeline: tsup (ESM) for `.ts` + `cp` step for `.astro` source files into `dist/components/`.

[Unreleased]: https://github.com/obaronai/astro-ai-readiness/compare/v0.0.3...HEAD
[0.0.3]: https://github.com/obaronai/astro-ai-readiness/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/obaronai/astro-ai-readiness/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/obaronai/astro-ai-readiness/releases/tag/v0.0.1
