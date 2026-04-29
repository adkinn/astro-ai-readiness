# Changelog

All notable changes to `@obaronai/astro-ai-readiness` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Pre-1.0 releases may include breaking changes in MINOR bumps per [semver §4](https://semver.org/#spec-item-4).

## [Unreleased]

## [0.0.6] — 2026-04-29

Sixth slice per `plans/10-v0.0.6-agents-md-mcp-json.md`. **Multi-output orchestration on the `astro:build:done` hook — three of five file outputs now live.** Retires the multi-output orchestration pattern, subdirectory write in `dist/`, and JSON file emission. Component sub-line remains complete from v0.0.4.

### Added

- `dist/agents.md` output — toolkit composes a markdown discovery file for AI-agent crawlers from the new `agentsMd` config block at consumer build time. Format: H1 (`organization.name`) / blockquote (`agentsMd.description`) / optional `## Audience` section / optional `## Contact` section / optional `## Links` section with bulleted links. POSIX trailing-newline convention. Opt-in.
- `dist/.well-known/mcp.json` output — toolkit composes a Model Context Protocol discovery file from the new `mcp` config block. Pretty-printed JSON (2-space indent) with a `$schema` reference to the toolkit-published v1 JSON Schema (per D-22). Supports `status: 'active'` servers (requires `name`, `url`, `description`, `tools[]`) and `status: 'planned'` servers (requires `name`, `description`, `planned_tools[]`; `url` forbidden by `.strict()` schema). First JSON file output and first subdirectory write (`dist/.well-known/`) in the toolkit. Opt-in.
- `repo/schemas/mcp/v1.json` — JSON Schema document (draft-07) describing the toolkit's mcp.json v1 shape, including the `status: 'active' | 'planned'` discriminator and the `tools` / `planned_tools` conventions. Ships in the npm tarball via the `files` allowlist. `$schema` field in emitted `mcp.json` references this document at `https://raw.githubusercontent.com/obaronai/astro-ai-readiness/v0.0.6/schemas/mcp/v1.json` — live the moment the v0.0.6 git tag pushes (D-22).
- `agentsMd` Zod schema replacing the prior `z.unknown().optional()`. Required: `description` (string). Optional: `audience` (string), `contact` (string), `links` (array of `{ title, url, description? }` — `links.min(1)` guards against an empty array at parse time). All nested objects `.strict()`.
- `mcp` Zod schema replacing the prior `z.unknown().optional()`. Required: `servers` (array, `.min(1)`). Optional: `version` (defaults to `'1.0'` at compose time). Each server is a `z.discriminatedUnion('status', [active, planned])` — active branch requires `name + url + description + tools[]`; planned branch requires `name + description + planned_tools[]` and forbids `url` via `.strict()`. Per-branch errors are laser-actionable via the friendlier-Zod-error wrap from v0.0.5.
- `AgentsMdConfig` and `McpConfig` TypeScript types re-exported from the package barrel: `import type { AgentsMdConfig, McpConfig } from '@obaronai/astro-ai-readiness'`.
- `src/outputs/agents-md.ts` — pure `composeAgentsMd(config)` + filesystem `writeAgentsMd(config, dir, logger)` pair. Same composer + writer module shape from v0.0.5's `outputs/llms-txt.ts`.
- `src/outputs/mcp-json.ts` — pure `composeMcpJson(config)` + filesystem `writeMcpJson(config, dir, logger)` pair. Writer calls `fs.mkdir(subdir, { recursive: true })` before `fs.writeFile` — idempotent across re-builds and works on a fresh `dist/` without the subdirectory pre-existing.

### Changed

- `astro:build:done` hook grows from one if-then to three. Sequential `await`s preserve deterministic order across builds: llms.txt → agents.md → mcp.json. Each output gated independently on its config block. Future outputs (`llms-full.txt`, `robots.txt`) wire in at the same hook without hook changes.
- `outputs/` per-output module shape now exercised across two formats (markdown, JSON) and two write shapes (flat dist write, subdirectory write). Pattern load-bearing on AATT main through every subsequent file-output slice.
- README + Quick Start rewritten to reflect v0.0.6 shipped reality. Status line, "What ships" section (six components + three file outputs), Quick Start config extended with `agentsMd` and `mcp` blocks (active + planned server examples), raw-markdown caveat extended to cover `agentsMd.*` fields, "Shipped on" updated to AATT carrying agents.md and mcp.json in production. Roadmap: v0.0.7 = `llms-full.txt`; v0.0.8 = `robots.txt`; v0.1.0 = polish + FF-3.7 full install.
- **Markdown-injection caveat extended to agents.md** — `agentsMd.description`, `agentsMd.audience`, `agentsMd.contact`, `agentsMd.links[].title`, `agentsMd.links[].description` are emitted as raw markdown. Same consumer-responsibility note as `llmsTxt.*`. `mcp.json` is JSON-serialized and has no markdown-injection surface.

## [0.0.5] — 2026-04-27

Fifth slice per `plans/09-v0.0.5-llms-txt.md`. **First file-output slice — opens the file-output sub-line.** Retires the `astro:build:done` hook + dist-write pattern; subsequent slices (Plans 10–12) use the same hook to emit `agents.md`, `mcp.json`, `llms-full.txt`, and `robots.txt`. Component sub-line (six of six) remains complete from v0.0.4.

### Added

- `dist/llms.txt` output — toolkit composes the [llmstxt.org](https://llmstxt.org/) format from the new `llmsTxt` config block at consumer build time via the `astro:build:done` hook. Emits H1 (`organization.name`) / blockquote (`summary`) / optional free-form markdown body / optional H2 sections with bulleted links / optional `Canonical reference: [title](url)` footer after `---` rule. POSIX trailing-newline convention. Opt-in: when `llmsTxt` is absent from the config, no file ships.
- `llmsTxt` Zod schema replacing the prior `z.unknown().optional()`. Required: `summary` (string). Optional: `body` (free-form markdown), `sections` (array of `{ title, links: [{ title, url, description? }] }` — `links.min(1)` guards against empty sections at parse time), `deferTo` (single canonical-reference `{ title, url }`). All nested objects `.strict()`. Link URLs require `https://` (or `http://localhost` for dev) per the v0.0.3 HTTPS refine.
- `LlmsTxtConfig` TypeScript type re-exported from the package barrel: `import type { LlmsTxtConfig } from '@obaronai/astro-ai-readiness'`.
- `src/outputs/llms-txt.ts` — pure `composeLlmsTxt(config)` + filesystem `writeLlmsTxt(config, dir, logger)` pair. Composer is testable in isolation; writer wraps the composer with `fs.writeFile`. Establishes the per-output module shape (composer + writer) that Plans 10–12 inherit.
- `@astrojs/sitemap` detection per D-8. At `astro:config:setup`, the integration walks `astroConfig.integrations` for `'@astrojs/sitemap'`; if absent, `logger.warn(...)` fires unconditionally with an actionable message — sitemap is an AI Readiness baseline, the warning belongs at the integration level. The reference line itself ships in `robots.txt` per the matrix routing (Plan 12), not in `llms.txt`.
- Friendlier Zod error formatting (closes High #3 carried since v0.0.1). The integration-factory `parse()` is now wrapped in `parseConfigOrThrow(options)` — on `ZodError`, throws a single `Error` with one issue per line: `path: message`. Replaces the default JSON-shaped `[{ "code": "invalid_type", ... }]` blob. Compounds across every config field added in subsequent slices.
- `@types/node` added as a dev dependency (required by `node:fs/promises` import in `outputs/llms-txt.ts`). Internal-only — not part of the public API surface.
- `dist/outputs/llms-txt.{js,d.ts}` and `dist/config.{js,d.ts}` artifacts added to the published tarball. tsup entry map extended; `outputs/` and `config` are intentionally NOT exposed in `package.json.exports` — internal modules ship so internal relative imports (`../config`, `./outputs/llms-txt`) resolve at consumer build time. Same pattern as `utils/json-ld` and `components/types`.

### Changed

- `astro:build:done` hook now load-bearing on the integration. Co-exists with the prior `astro:config:setup` hook; gate on `config.llmsTxt` being set keeps v0.0.3 / v0.0.4 consumer behavior unchanged.
- README + Quick Start rewritten to reflect v0.0.5 shipped reality. Status line, "What ships" section (six components + one file output), Quick Start config example showing the new `llmsTxt` block (with `body`, `sections`, `deferTo`), "Shipped on" updated to AATT carrying `aiallthethings.com/llms.txt`. Roadmap shifts: v0.0.6 = `agents.md` + `mcp.json`; v0.0.7 = `llms-full.txt`; v0.0.8 = `robots.txt`; v0.1.0 = polish.
- `src/config.ts` carries `@internal` JSDoc tag — same convention as `utils/json-ld.ts` (added in v0.0.2 review L1) and `components/types.ts` (added in v0.0.3 review L2). Consumers `import type { ... } from '@obaronai/astro-ai-readiness'` (the barrel); deep-importing `/config` will fail with `ERR_PACKAGE_PATH_NOT_EXPORTED`.

## [0.0.4] — 2026-04-27

Fourth slice per `plans/08-v0.0.4-techarticle.md`. Retires the heavy-props prop pattern. **Six of six v0.1 components now live — the component sub-line is complete.** v0.0.5 begins the file-output sub-line (`dist/llms.txt` first).

### Added

- `<TechArticleSchema headline description datePublished {...optional} />` — heavy-props Astro component emitting Schema.org `TechArticle` JSON-LD. Required props: `headline`, `description`, `datePublished`. Optional: `dateModified` (defaults to `datePublished`), `author` (D-21 founder fallback when omitted), `image` (string URL or full `ImageObject`), `url` (defaults to canonical `Astro.url + Astro.site`), `articleSection`, `keywords` (string array → comma-joined per Schema.org `Text or Text` convention), `proficiencyLevel`, `dependencies` (string array → comma-joined). `publisher` is an `@id` reference to the site's Organization (entity-graph pattern from v0.0.2).
- D-21 — `<TechArticleSchema>` `author` defaults to a Person synthesized from `config.organization.founder` (`name` from `founder.name`, `url` from `founder.sameAs[0]` per the existing `OrganizationSchema` convention; no separate `founder.url` field added). Multi-author sites pass an explicit `author` prop per article. Component-level **founder-precondition guard** throws at build time if `author` is omitted AND `founder` is unset — actionable error pointing at the `aiReadiness({...})` config — rather than tightening the global Zod schema (which would break consumers who don't use `<TechArticleSchema>` and don't set `founder`). See `decisions.md` D-21 for the full rationale.
- `TechArticleAuthor` and `TechArticleImage` TypeScript types added to `./components/types.ts` and re-exported from the package barrel. Consumers `import type { TechArticleAuthor, TechArticleImage } from '@obaronai/astro-ai-readiness/components'`.

### Changed

- Component sub-line complete (6 of 6 v0.1 components live). The component barrel re-exports `OrganizationSchema`, `WebSiteSchema`, `CollectionSchema`, `BreadcrumbSchema`, `FAQPageSchema`, `TechArticleSchema` plus four interface types (`BreadcrumbItem`, `FAQItem`, `TechArticleAuthor`, `TechArticleImage`).
- README + Quick Start rewritten to reflect v0.0.4 shipped reality. Status line, "What ships" section (six components), Quick Start example showing `<TechArticleSchema>` minimum + advanced usage, "Shipped on" updated to AATT running all six on production.
- Roadmap shifts: v0.0.5 = `dist/llms.txt` (first file output); v0.0.6 = `agents.md` + `mcp.json`; v0.0.7 = `llms-full.txt`; v0.0.8 = `robots.txt` composition; v0.1.0 = polish, tests, docs.

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

[Unreleased]: https://github.com/obaronai/astro-ai-readiness/compare/v0.0.6...HEAD
[0.0.6]: https://github.com/obaronai/astro-ai-readiness/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/obaronai/astro-ai-readiness/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/obaronai/astro-ai-readiness/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/obaronai/astro-ai-readiness/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/obaronai/astro-ai-readiness/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/obaronai/astro-ai-readiness/releases/tag/v0.0.1
