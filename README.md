# @obaronai/astro-ai-readiness

> AI Readiness toolkit for Astro — JSON-LD helper components today, agent-discoverable file outputs (`llms.txt`, `agents.md`, `.well-known/mcp.json`, named-bot `robots.txt` rules) on the v0.1 roadmap.

**Status:** v0.0.2 — second slice shipped. `<OrganizationSchema>`, `<WebSiteSchema>`, and `<CollectionSchema>` are live; more components and file outputs incoming on the v0.1 roadmap.

## What ships in v0.0.2

- `<OrganizationSchema />` — inline JSON-LD Organization block. Config-driven; placed once per page where it's needed (typically the home page).
- `<WebSiteSchema />` — inline JSON-LD WebSite block. Config-driven; typically placed in your `BaseLayout` so it ships site-wide.
- `<CollectionSchema name url description? />` — inline JSON-LD CollectionPage block. Props-driven; place on collection-index pages (`/articles/`, `/tags/[tag]/`, etc.).

All three components emit canonical Schema.org JSON-LD with cross-component `@id` references (`#organization`, `#website`) so search and AI consumers can resolve the entity graph without redeclaring shared fields.

## On the roadmap (toward v0.1.0)

- v0.0.3 — `<FAQPageSchema>` + `<BreadcrumbSchema>` + `<TechArticleSchema>` (items-array + heavy-props patterns)
- v0.0.4 — first file output: `dist/llms.txt`
- v0.0.5 — `dist/agents.md` + `dist/.well-known/mcp.json`
- v0.0.6 — `dist/llms-full.txt` (content-collection-driven)
- v0.0.7 — `dist/robots.txt` composition
- v0.1.0 — polish, tests, docs

Track progress: <https://github.com/obaronai/astro-ai-readiness/milestones>

## Install

```bash
npm install @obaronai/astro-ai-readiness
```

## Quick start

Configure (v0.0.2 accepts `site`, `organization`, and an optional `webSite` block — the Zod schema rejects unknown keys):

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config'
import aiReadiness from '@obaronai/astro-ai-readiness'

export default defineConfig({
  integrations: [
    aiReadiness({
      site: 'https://your-site.com',
      organization: {
        name: 'Your Brand',
        url: 'https://your-site.com',
        logo: 'https://your-site.com/logo.png',
        founder: {
          name: 'Your Name',
          jobTitle: 'Founder',
          sameAs: ['https://your-site.com', 'https://x.com/handle'],
        },
      },
      webSite: {
        // Optional. `name` defaults to organization.name when absent.
        description: 'What your site does, in one sentence.',
      },
    }),
  ],
})
```

Use the components:

```astro
---
// src/layouts/BaseLayout.astro — site-wide
import { WebSiteSchema } from '@obaronai/astro-ai-readiness/components'
---
<head>
  <WebSiteSchema />
</head>
```

```astro
---
// src/pages/index.astro — home page only
import { OrganizationSchema } from '@obaronai/astro-ai-readiness/components'
---
<OrganizationSchema />
```

```astro
---
// src/pages/articles/index.astro — collection index pages
import { CollectionSchema } from '@obaronai/astro-ai-readiness/components'
---
<CollectionSchema
  name="All Articles"
  url={Astro.site + 'articles/'}
  description="Production-tested articles, version-pinned environments."
/>
```

Build your site (`npm run build`); inspect any `dist/*.html` — you'll see inline `<script type="application/ld+json">` blocks with cross-referenced `@id`s tying the entity graph together.

## Design principles

- **Zero client JS.** Every component emits inline `<script type="application/ld+json">` at build time. Hydrating JSON-LD would erode the very Schema.org category it's meant to lift.
- **Compose, don't clobber.** Future file outputs (`robots.txt` etc.) will merge with existing user files rather than overwrite. User intent wins.
- **Composes with `@astrojs/sitemap`.** Doesn't replace it. Will warn when needed once sitemap-touching outputs land.

## What's beyond v0.1

The v0.1 line is content → artifacts: components and files. Build-time AI-readiness self-scoring (against Obaron's published rubric), spec validation against [llmstxt.org](https://llmstxt.org), and content lints are on the v0.2 horizon — but not committed scope yet. v0.1 ships first.

## Shipped on

- [aiallthethings.com](https://aiallthethings.com) — AATT, the toolkit's first reference implementation. Home page renders `<OrganizationSchema />` from v0.0.1.
- [obaron.ai](https://obaron.ai) — Obaron's main site. Will install in FF-3.7 once v0.1.0 publishes.

## Contributing

PRs welcome. See [CONTRIBUTING.md](./.github/CONTRIBUTING.md) and our [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

MIT — Copyright (c) 2026 Adam Kinney, LLC (DBA Obaron).
