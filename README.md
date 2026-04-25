# @obaronai/astro-ai-readiness

> AI Readiness toolkit for Astro — generates `llms.txt`, `agents.md`, `.well-known/mcp.json`, named-bot rules in `robots.txt`, and ships JSON-LD helper components.

**Status:** v0.1 in development. Pre-publish.

## What it does

One `aiReadiness({...})` block in `astro.config.mjs` plus your content collections produces the AI-readiness artifacts at build time:

- `dist/llms.txt`
- `dist/llms-full.txt` (size-asserted from a content collection)
- `dist/agents.md`
- `dist/.well-known/mcp.json`
- `dist/robots.txt` (composed with existing rules — never clobbers)

Plus six importable Astro components for site-wide JSON-LD:

`<OrganizationSchema>` `<WebSiteSchema>` `<FAQPageSchema>` `<BreadcrumbSchema>` `<TechArticleSchema>` `<CollectionSchema>`

## Install

```bash
npm install @obaronai/astro-ai-readiness
```

## Quick start

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
        founder: { name: 'You', sameAs: ['https://...'] },
      },
      llmsTxt: { summary: 'What you do, in one sentence.' },
      llmsFull: { collection: 'articles', sizeLimit: 200_000 },
      agentsMd: { description: '...', contact: 'hi@your-site.com' },
      mcp: { servers: [/* optional */] },
      robotsTxt: { bonusBots: [/* optional extra named bots */] },
    }),
  ],
})
```

```astro
---
// src/layouts/Base.astro
import { OrganizationSchema, WebSiteSchema } from '@obaronai/astro-ai-readiness/components'
---
<OrganizationSchema />
<WebSiteSchema />
```

## Design principles

- **Content-collection-first.** Reads `getCollection()` for content sources. Does not post-build HTML scrape.
- **Compose, don't clobber.** `robots.txt` merges with any existing `public/robots.txt`. User intent wins.
- **Zero client JS.** Every component emits inline `<script type="application/ld+json">` at build time.
- **Modular outputs.** One module per artifact (`outputs/llms-txt.ts`, `outputs/agents-md.ts`, …). Clean extension points for v0.2+.
- **Composes with `@astrojs/sitemap`.** Doesn't replace it. Warns if absent.

## What's deferred to v0.2

Build-time AI-readiness self-score, spec validation against [llmstxt.org](https://llmstxt.org) / MCP schema, and content lints. v0.1 is content → artifacts only.

## Shipped on

- TBD — placeholder, filled in once reference implementations deploy.

## Contributing

PRs welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT — Copyright (c) 2026 Adam Kinney, LLC (DBA Obaron).
