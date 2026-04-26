# @obaronai/astro-ai-readiness

> AI Readiness toolkit for Astro — JSON-LD helper components today, agent-discoverable file outputs (`llms.txt`, `agents.md`, `.well-known/mcp.json`, named-bot `robots.txt` rules) on the v0.1 roadmap.

**Status:** v0.0.1 — first slice shipped. `<OrganizationSchema>` is live; more components and file outputs incoming on the v0.1 roadmap.

## What ships in v0.0.1

- `<OrganizationSchema />` — inline JSON-LD Organization block, all data driven from your `aiReadiness({...})` config.

That's it for the first slice. The toolkit ships incrementally — see the roadmap below.

## On the roadmap (toward v0.1.0)

- v0.0.2 — `<WebSiteSchema>` + `<CollectionSchema>` (config-driven and props-driven respectively)
- v0.0.3 — `<FAQPageSchema>` + `<BreadcrumbSchema>` + `<TechArticleSchema>`
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

Configure (v0.0.1 accepts `site` + `organization` only — the Zod schema rejects unknown keys):

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
    }),
  ],
})
```

Use the component:

```astro
---
// src/pages/index.astro
import { OrganizationSchema } from '@obaronai/astro-ai-readiness/components'
---
<OrganizationSchema />
```

That's it for v0.0.1. Build your site (`npm run build`); inspect `dist/index.html` — you'll see an inline `<script type="application/ld+json">` with your Organization data.

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
