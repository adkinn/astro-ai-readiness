# Changelog

All notable changes to `@adkinn/astro-ai-readiness` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Pre-1.0 releases may include breaking changes in MINOR bumps per [semver §4](https://semver.org/#spec-item-4).

## [Unreleased]

## [0.0.15] — 2026-08-28

A third state for content signals: say nothing.

### Added

- **`'omit'` as a `contentSignals` value.** The Content Signals vocabulary has two
  values, `yes` and `no`, but three states matter: grant, refuse, and say nothing.
  An absent signal expresses no preference; `no` expresses a refusal. Silence was
  previously reachable only by passing `undefined` and relying on it surviving a
  spread over the policy defaults — an accident of the implementation, not an API,
  and one the `'yes' | 'no'` type told consumers did not exist. `'omit'` makes it
  explicit and typed.

### Fixed

- **A bare `Content-Signal: ` no longer ships.** With every signal omitted,
  `composeContentSignal` joined an empty array and the caller pushed the result
  unconditionally, emitting a malformed directive — header, colon, trailing space,
  no signals. The schema accepted it and the build succeeded, so the broken line
  reached production silently. The line is now dropped when there is nothing to
  say; rules and `Sitemap` are unaffected.

## [0.0.14] — 2026-08-27

Astro 7 support, and a JSON-LD graph that agrees with itself.

### Added

- **Astro 7 support.** `peerDependencies` widens to `^5.0.0 || ^6.0.0 || ^7.0.0`.
  CI now runs the full gate against Astro 5.18.0, 6.4.8, and 7.2.9 on Node 22 and
  24, so the supported range is tested rather than asserted.
- `<TechArticleSchema />` falls back to `config.person` when `organization.founder`
  is unset. A person-first site has no organization to hang a founder off, so it
  previously had to pass an explicit `author` on every article or hit a build error
  telling it to add a config block its shape cannot hold.

### Changed

- **One publisher rule across the graph.** `publisher` / `author` `@id` resolution
  moves into `publisherId()` and is now identical in `WebSiteSchema`,
  `CollectionSchema`, `TechArticleSchema`, and `SoftwareApplicationSchema`.
  `WebSiteSchema` previously preferred Person while the others preferred
  Organization, so a site configuring **both** identities emitted a `WebSite`
  published by `#person` alongside pages published by `#organization` — two
  different publishers for one site. Organization now wins the tie everywhere.
  Sites declaring a single identity (the only shape found in practice) are
  unaffected.
- `<TechArticleSchema />` prefers `founder.url` over `founder.sameAs[0]` for the
  synthesized author URL. `sameAs[0]` is a social profile by convention; `url` is
  the canonical one and was being ignored when both were set.
- `robotsTxt.policy: 'private'` now omits the sitemap by default. Publishing a
  sitemap that enumerates the URLs the same file disallows leaks the list it is
  meant to withhold. An explicit `sitemap` value still opts back in.
- `@types/node` pinned to `^22` to match `engines.node >= 22.12.0`, so the build
  catches use of APIs missing from the oldest supported runtime.

### Removed

- The `overrides` block. npm applies `overrides` only for the root project, so it
  did nothing for consumers and was inert weight in the published manifest.

### Fixed

- `config.organization.founder` was read unguarded, so a person-first site using
  `<TechArticleSchema />` crashed at build time on a missing `organization`.

## [0.0.13] — 2026-08-26

Contact address only — no code, no API change.

### Changed

- Public contact for the package is now `npm@adamkinney.com`, a dedicated address for open-source traffic rather than a personal inbox. `package.json` gains an `author.email` (it had a name and URL but no address, so npm showed no way to reach the maintainer), and the Code of Conduct reporting address moves off `adam@adamkinney.com`.

## [0.0.12] — 2026-08-26

Docs only — no code, no API change. Two things in the published tarball had stopped being true.

### Changed

- "Shipped on" now describes comicscry.com in the past tense and links to its retirement page instead of the domain. The site was taken down in August 2026; the entry claimed a live reference implementation that a reader could not go look at. The v0.0.9–v0.0.10 provenance is kept — it is still what drove those features.
- README and `LICENSE` copyright drop the `(DBA Obaron)` qualifier; both now read `Adam Kinney, LLC`.

### Fixed

- Code of Conduct reporting address was `hi@obaron.ai`, on a domain that no longer has MX records — a harassment report sent there would have bounced. Now `adam@adamkinney.com`.

## [0.0.11] — 2026-07-10

Games. Surfaced by adopting the toolkit on a third site — a face-controlled iOS game whose schema is a `VideoGame`, not a plain `SoftwareApplication`.

### Added

- `softwareApplication.type` — `'SoftwareApplication'` (default) | `'VideoGame'` | `'MobileApplication'` | `'WebApplication'`; sets the emitted `@type`.
- `softwareApplication.gamePlatform` (string or string[]) — emitted for games (e.g. `'iPhone'`).

## [0.0.10] — 2026-07-10

Organization `sameAs` — surfaced immediately by adopting the toolkit on a second site whose Organization links out to six social profiles. The `founder` and `person` had `sameAs`; the Organization didn't.

### Added

- Organization `sameAs` (array of https URLs), emitted in `<OrganizationSchema />` — links the Organization to its social/canonical profiles.

## [0.0.9] — 2026-07-09

Ninth slice: app/product support. Driven by adopting the toolkit on a second, differently-shaped site (an iOS-app marketing site) — which exposed everything the personal-brand shape was missing.

### Added

- `<SoftwareApplicationSchema />` component + optional `softwareApplication` config block: `name`, `applicationCategory`, `applicationSubCategory`, `operatingSystem`, `description`, `url`, `image`, `screenshot[]`, `featureList[]`, `offers[]` (`price`/`priceCurrency`/`name`/`description`), `installUrl`, `downloadUrl`, `aggregateRating`. Emits `@id: <site>#app` and links `publisher`/`author` to the site's Organization (or Person).
- Organization gains `description` and `contactPoint` (schema.org ContactPoint: `contactType`, `email`, `telephone`, `url`); `founder` gains `url`.
- WebSite gains `inLanguage`.
- `agentsMd` gains custom `sections` (`title` + markdown `content`), rendered as `## ` blocks between `## Audience` and `## Contact` — so an agents.md can carry arbitrary sections (Pricing, Data sources, …).
- `ContactPointConfig` and `SoftwareApplicationConfig` type exports.

### Changed

- Eight JSON-LD components (was seven). `@id` graph now includes `#app`.

Not breaking: all new config fields are optional and additive.

## [0.0.8] — 2026-07-09

Eighth slice: first-class `Person` identity. Sites whose primary identity is an individual (personal brands, solo builders) can lead with a `Person` instead of an `Organization`.

### Added

- `<PersonSchema />` component — emits `Person` JSON-LD (`@id: <site>#person`) from the new optional `person` config block (`name`, `url`, `jobTitle`, `description`, `image`, `sameAs`, `knowsAbout`). Renders nothing when `person` is unset.
- `PersonConfig` type export from the package barrel.

### Changed

- `organization` is now **optional**. The config requires at least one of `person`/`organization` (Zod refine) so there's always an identity for the file-output headings and JSON-LD.
- Site-identity resolution across `llms.txt`, `llms-full.txt`, `agents.md`, and the `WebSite` publisher now follows `person` → `organization` → `webSite.name` → `site`, so person-first sites lead with the person and publish as the person.
- `<OrganizationSchema />` renders nothing when `organization` is unset (previously assumed present).

Not breaking for existing org-configured sites: `organization` still parses and behaves as before.

## [0.0.7] — 2026-07-08

Seventh slice: closes the inert-config gap and makes the v0.1 file-output set real. `llmsFull` and `robotsTxt` are now typed config blocks with build-time outputs instead of `z.unknown()` placeholders.

### Added

- `dist/llms-full.txt` output from the new typed `llmsFull` config block. v0.0.7 is manual/config-driven (`content` and/or `sections`); content-collection assisted generation remains a later slice.
- `dist/robots.txt` output from the new typed `robotsTxt` config block. Presets: `search-visible`, `training-opt-out` (default), and `private`; supports explicit rules, `Sitemap`, `Content-Signal`, and appended custom lines.
- `LlmsFullConfig` and `RobotsTxtConfig` type exports from the package barrel.
- Node built-in test runner coverage for all five file-output composers plus JSON-LD escaping and config rejection of old boolean placeholder values.
- Package sanity lint script covering package-lock metadata, real lint/test scripts, Node engine floor, exports artifact existence, and output-module build wiring.

### Changed

- `test` now runs real checks (`npm run build && node --test tests/*.test.mjs`) instead of a stub-failing placeholder.
- `lint` now runs `typecheck`, `build`, and package sanity checks instead of a stub-failing placeholder.
- Node engine floor tightened from `>=22.0.0` to `>=22.12.0`, matching Astro 6's documented floor.
- `astro` is now an explicit dev dependency for local package verification while remaining a peer dependency for consumers.
- README now reflects the v0.0.7 shipped surface and documents `llmsFull` / `robotsTxt`.

### Fixed

- `llmsFull` and `robotsTxt` no longer accept arbitrary unknown config that silently does nothing.

## [0.0.6] — 2026-04-29

Sixth slice per `plans/10-v0.0.6-agents-md-mcp-json.md`. **Multi-output orchestration on the `astro:build:done` hook — three of five file outputs now live.** Retires the multi-output orchestration pattern, subdirectory write in `dist/`, and JSON file emission. Component sub-line remains complete from v0.0.4.

### Added

- `dist/agents.md` output — toolkit composes a markdown discovery file for AI-agent crawlers from the new `agentsMd` config block at consumer build time. Format: H1 (`organization.name`) / blockquote (`agentsMd.description`) / optional `## Audience` section / optional `## Contact` section / optional `## Links` section with bulleted links. POSIX trailing-newline convention. Opt-in.
- `dist/.well-known/mcp.json` output — toolkit composes a Model Context Protocol discovery file from the new `mcp` config block. Pretty-printed JSON (2-space indent) with a `$schema` reference to the toolkit-published v1 JSON Schema (per D-22). Supports `status: 'active'` servers (requires `name`, `url`, `description`, `tools[]`) and `status: 'planned'` servers (requires `name`, `description`, `planned_tools[]`; `url` forbidden by `.strict()` schema). First JSON file output and first subdirectory write (`dist/.well-known/`) in the toolkit. Opt-in.
- `repo/schemas/mcp/v1.json` — JSON Schema document (draft-07) describing the toolkit's mcp.json v1 shape, including the `status: 'active' | 'planned'` discriminator and the `tools` / `planned_tools` conventions. Ships in the npm tarball via the `files` allowlist. `$schema` field in emitted `mcp.json` references this document at `https://raw.githubusercontent.com/adkinn/astro-ai-readiness/v0.0.6/schemas/mcp/v1.json` — live the moment the v0.0.6 git tag pushes (D-22).
- `agentsMd` Zod schema replacing the prior `z.unknown().optional()`. Required: `description` (string). Optional: `audience` (string), `contact` (string), `links` (array of `{ title, url, description? }` — `links.min(1)` guards against an empty array at parse time). All nested objects `.strict()`.
- `mcp` Zod schema replacing the prior `z.unknown().optional()`. Required: `servers` (array, `.min(1)`). Optional: `version` (defaults to `'1.0'` at compose time). Each server is a `z.discriminatedUnion('status', [active, planned])` — active branch requires `name + url + description + tools[]`; planned branch requires `name + description + planned_tools[]` and forbids `url` via `.strict()`. Per-branch errors are laser-actionable via the friendlier-Zod-error wrap from v0.0.5.
- `AgentsMdConfig` and `McpConfig` TypeScript types re-exported from the package barrel: `import type { AgentsMdConfig, McpConfig } from '@adkinn/astro-ai-readiness'`.
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
- `LlmsTxtConfig` TypeScript type re-exported from the package barrel: `import type { LlmsTxtConfig } from '@adkinn/astro-ai-readiness'`.
- `src/outputs/llms-txt.ts` — pure `composeLlmsTxt(config)` + filesystem `writeLlmsTxt(config, dir, logger)` pair. Composer is testable in isolation; writer wraps the composer with `fs.writeFile`. Establishes the per-output module shape (composer + writer) that Plans 10–12 inherit.
- `@astrojs/sitemap` detection per D-8. At `astro:config:setup`, the integration walks `astroConfig.integrations` for `'@astrojs/sitemap'`; if absent, `logger.warn(...)` fires unconditionally with an actionable message — sitemap is an AI Readiness baseline, the warning belongs at the integration level. The reference line itself ships in `robots.txt` per the matrix routing (Plan 12), not in `llms.txt`.
- Friendlier Zod error formatting (closes High #3 carried since v0.0.1). The integration-factory `parse()` is now wrapped in `parseConfigOrThrow(options)` — on `ZodError`, throws a single `Error` with one issue per line: `path: message`. Replaces the default JSON-shaped `[{ "code": "invalid_type", ... }]` blob. Compounds across every config field added in subsequent slices.
- `@types/node` added as a dev dependency (required by `node:fs/promises` import in `outputs/llms-txt.ts`). Internal-only — not part of the public API surface.
- `dist/outputs/llms-txt.{js,d.ts}` and `dist/config.{js,d.ts}` artifacts added to the published tarball. tsup entry map extended; `outputs/` and `config` are intentionally NOT exposed in `package.json.exports` — internal modules ship so internal relative imports (`../config`, `./outputs/llms-txt`) resolve at consumer build time. Same pattern as `utils/json-ld` and `components/types`.

### Changed

- `astro:build:done` hook now load-bearing on the integration. Co-exists with the prior `astro:config:setup` hook; gate on `config.llmsTxt` being set keeps v0.0.3 / v0.0.4 consumer behavior unchanged.
- README + Quick Start rewritten to reflect v0.0.5 shipped reality. Status line, "What ships" section (six components + one file output), Quick Start config example showing the new `llmsTxt` block (with `body`, `sections`, `deferTo`), "Shipped on" updated to AATT carrying `aiallthethings.com/llms.txt`. Roadmap shifts: v0.0.6 = `agents.md` + `mcp.json`; v0.0.7 = `llms-full.txt`; v0.0.8 = `robots.txt`; v0.1.0 = polish.
- `src/config.ts` carries `@internal` JSDoc tag — same convention as `utils/json-ld.ts` (added in v0.0.2 review L1) and `components/types.ts` (added in v0.0.3 review L2). Consumers `import type { ... } from '@adkinn/astro-ai-readiness'` (the barrel); deep-importing `/config` will fail with `ERR_PACKAGE_PATH_NOT_EXPORTED`.

## [0.0.4] — 2026-04-27

Fourth slice per `plans/08-v0.0.4-techarticle.md`. Retires the heavy-props prop pattern. **Six of six v0.1 components now live — the component sub-line is complete.** v0.0.5 begins the file-output sub-line (`dist/llms.txt` first).

### Added

- `<TechArticleSchema headline description datePublished {...optional} />` — heavy-props Astro component emitting Schema.org `TechArticle` JSON-LD. Required props: `headline`, `description`, `datePublished`. Optional: `dateModified` (defaults to `datePublished`), `author` (D-21 founder fallback when omitted), `image` (string URL or full `ImageObject`), `url` (defaults to canonical `Astro.url + Astro.site`), `articleSection`, `keywords` (string array → comma-joined per Schema.org `Text or Text` convention), `proficiencyLevel`, `dependencies` (string array → comma-joined). `publisher` is an `@id` reference to the site's Organization (entity-graph pattern from v0.0.2).
- D-21 — `<TechArticleSchema>` `author` defaults to a Person synthesized from `config.organization.founder` (`name` from `founder.name`, `url` from `founder.sameAs[0]` per the existing `OrganizationSchema` convention; no separate `founder.url` field added). Multi-author sites pass an explicit `author` prop per article. Component-level **founder-precondition guard** throws at build time if `author` is omitted AND `founder` is unset — actionable error pointing at the `aiReadiness({...})` config — rather than tightening the global Zod schema (which would break consumers who don't use `<TechArticleSchema>` and don't set `founder`). See `decisions.md` D-21 for the full rationale.
- `TechArticleAuthor` and `TechArticleImage` TypeScript types added to `./components/types.ts` and re-exported from the package barrel. Consumers `import type { TechArticleAuthor, TechArticleImage } from '@adkinn/astro-ai-readiness/components'`.

### Changed

- Component sub-line complete (6 of 6 v0.1 components live). The component barrel re-exports `OrganizationSchema`, `WebSiteSchema`, `CollectionSchema`, `BreadcrumbSchema`, `FAQPageSchema`, `TechArticleSchema` plus four interface types (`BreadcrumbItem`, `FAQItem`, `TechArticleAuthor`, `TechArticleImage`).
- README + Quick Start rewritten to reflect v0.0.4 shipped reality. Status line, "What ships" section (six components), Quick Start example showing `<TechArticleSchema>` minimum + advanced usage, "Shipped on" updated to AATT running all six on production.
- Roadmap shifts: v0.0.5 = `dist/llms.txt` (first file output); v0.0.6 = `agents.md` + `mcp.json`; v0.0.7 = `llms-full.txt`; v0.0.8 = `robots.txt` composition; v0.1.0 = polish, tests, docs.

## [0.0.3] — 2026-04-27

Third slice per `plans/07-v0.0.3-breadcrumb-faq-techarticle.md`. Retires the items-array prop pattern; brings the toolkit to five of six components. `<TechArticleSchema>` (heavy-props) splits to v0.0.4 per the cadence rule (one pattern per slice).

### Added

- `<BreadcrumbSchema items={[{ name, url }, ...]} />` — items-array Astro component emitting Schema.org `BreadcrumbList` JSON-LD with 1-based `position` numbering and `itemListElement` mapping. Empty-`items` guard suppresses emission entirely.
- `<FAQPageSchema items={[{ question, answer }, ...]} />` — items-array Astro component emitting Schema.org `FAQPage` JSON-LD with `mainEntity → Question → acceptedAnswer` shape. Empty-`items` guard. Long-form answers escape via the v0.0.2 `jsonLd()` helper (covers `</script>`, U+2028, U+2029 — round-trip clean via `JSON.parse`).
- `src/components/types.ts` — shared types module exporting `BreadcrumbItem` and `FAQItem`. Lives as `.ts` (not `.astro`) so tsup's `dts: true` ships the declarations; consumers `import type { BreadcrumbItem, FAQItem } from '@adkinn/astro-ai-readiness/components'`.
- `dist/components/types.{js,d.ts}` artifacts; tsup entry map updated.

### Changed

- Vite plugin `name` field renamed from `'@adkinn/astro-ai-readiness:virtual-config'` to `'ai-readiness-virtual-config'` — matches Vite's single-segment plugin-naming convention. Behavior unchanged. Closes v0.0.2 review Medium #4.
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
- Vite virtual module `virtual:ai-readiness-config` exposing the validated config to components at consumer build time.
- `<OrganizationSchema />` Astro component — emits canonical Schema.org Organization JSON-LD inline; all data sourced from the `organization` config block; `</script>` escaped via `<` → `<` to prevent parser confusion.
- Package subpath exports: `@adkinn/astro-ai-readiness` (integration factory) and `@adkinn/astro-ai-readiness/components` (component barrel).
- TypeScript declarations for `AiReadinessConfig`, `OrganizationConfig`, `FounderConfig`.
- Build pipeline: tsup (ESM) for `.ts` + `cp` step for `.astro` source files into `dist/components/`.

[Unreleased]: https://github.com/adkinn/astro-ai-readiness/compare/v0.0.15...HEAD
[0.0.15]: https://github.com/adkinn/astro-ai-readiness/compare/v0.0.14...v0.0.15
[0.0.14]: https://github.com/adkinn/astro-ai-readiness/compare/v0.0.13...v0.0.14
[0.0.13]: https://github.com/adkinn/astro-ai-readiness/compare/v0.0.12...v0.0.13
[0.0.12]: https://github.com/adkinn/astro-ai-readiness/compare/v0.0.11...v0.0.12
[0.0.11]: https://github.com/adkinn/astro-ai-readiness/compare/v0.0.10...v0.0.11
[0.0.10]: https://github.com/adkinn/astro-ai-readiness/compare/v0.0.9...v0.0.10
[0.0.9]: https://github.com/adkinn/astro-ai-readiness/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/adkinn/astro-ai-readiness/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/adkinn/astro-ai-readiness/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/adkinn/astro-ai-readiness/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/adkinn/astro-ai-readiness/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/adkinn/astro-ai-readiness/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/adkinn/astro-ai-readiness/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/adkinn/astro-ai-readiness/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/adkinn/astro-ai-readiness/releases/tag/v0.0.1
