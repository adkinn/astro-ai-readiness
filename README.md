# @obaronai/astro-ai-readiness

> AI Readiness toolkit for Astro — JSON-LD helper components today, agent-discoverable file outputs (`llms.txt`, `agents.md`, `.well-known/mcp.json`, named-bot `robots.txt` rules) on the v0.1 roadmap.

**Status:** v0.0.4 — fourth slice shipped. **Six of six v0.1 components are live** — the component sub-line is complete. `<OrganizationSchema>`, `<WebSiteSchema>`, `<CollectionSchema>`, `<BreadcrumbSchema>`, `<FAQPageSchema>`, `<TechArticleSchema>`. v0.0.5 begins the file-output sub-line (`dist/llms.txt` first).

## What ships in v0.0.4

- `<OrganizationSchema />` — inline JSON-LD Organization block. Config-driven; place in your `BaseLayout` so it ships site-wide and the `#organization` `@id` reference resolves on every page.
- `<WebSiteSchema />` — inline JSON-LD WebSite block. Config-driven; typically placed in your `BaseLayout` alongside `<OrganizationSchema />`.
- `<CollectionSchema name url description? />` — inline JSON-LD CollectionPage block. Props-driven; place on collection-index pages (`/articles/`, `/tags/[tag]/`, etc.).
- `<BreadcrumbSchema items={[{ name, url }, ...]} />` — inline JSON-LD BreadcrumbList. Items-array prop; place on multi-level pages where the navigation hierarchy isn't already declared inline. Empty `items` skips emission.
- `<FAQPageSchema items={[{ question, answer }, ...]} />` — inline JSON-LD FAQPage. Items-array prop; place on pages with FAQ data. Long-form answers escape `</script>` and U+2028 / U+2029 automatically. Empty `items` skips emission.
- `<TechArticleSchema headline description datePublished {...optional} />` — inline JSON-LD TechArticle block. Heavy-props; place on article-detail pages. `author` defaults to a Person synthesized from `config.organization.founder` (name from `founder.name`, url from `founder.sameAs[0]`); pass an explicit `author` prop to override. Optional fields: `dateModified` (defaults to `datePublished`), `image` (string URL or full ImageObject), `articleSection`, `keywords` (string array), `proficiencyLevel`, `dependencies` (string array), `url` (defaults to canonical from `Astro.url + Astro.site`).

All six components emit canonical Schema.org JSON-LD with cross-component `@id` references (`#organization`, `#website`) so search and AI consumers can resolve the entity graph without redeclaring shared fields.

URL config fields (`site`, `organization.url`, `organization.logo`, `founder.sameAs`) require `https://` (or `http://localhost` for dev) since v0.0.3.

## On the roadmap (toward v0.1.0)

- v0.0.5 — first file output: `dist/llms.txt`
- v0.0.6 — `dist/agents.md` + `dist/.well-known/mcp.json`
- v0.0.7 — `dist/llms-full.txt` (content-collection-driven)
- v0.0.8 — `dist/robots.txt` composition
- v0.1.0 — polish, tests, docs

Track progress: <https://github.com/obaronai/astro-ai-readiness/milestones>

## Install

```bash
npm install @obaronai/astro-ai-readiness
```

## Quick start

Configure (v0.0.4 accepts `site`, `organization`, and an optional `webSite` block — the Zod schema rejects unknown keys, and URL fields must use `https://` or `http://localhost`):

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
import { OrganizationSchema, WebSiteSchema } from '@obaronai/astro-ai-readiness/components'
---
<head>
  <OrganizationSchema />
  <WebSiteSchema />
</head>
```

`<OrganizationSchema />` declares `@id: '<site>#organization'`; `<WebSiteSchema />` references it. Order matters in the head — Organization first.

```astro
---
// src/pages/articles/index.astro — collection index pages
import { CollectionSchema } from '@obaronai/astro-ai-readiness/components'
---
<CollectionSchema
  name="All Articles"
  url={new URL('articles/', Astro.site).toString()}
  description="Production-tested articles, version-pinned environments."
/>
```

```astro
---
// any multi-level page — site-context navigation
import { BreadcrumbSchema } from '@obaronai/astro-ai-readiness/components'
import type { BreadcrumbItem } from '@obaronai/astro-ai-readiness/components'

const crumbs: BreadcrumbItem[] = [
  { name: 'Home', url: new URL('/', Astro.site).toString() },
  { name: 'Articles', url: new URL('/articles/', Astro.site).toString() },
  { name: 'How agents handle errors', url: Astro.url.toString() },
]
---
<BreadcrumbSchema items={crumbs} />
```

```astro
---
// pages with FAQ data — items-array of question/answer pairs
import { FAQPageSchema } from '@obaronai/astro-ai-readiness/components'
import type { FAQItem } from '@obaronai/astro-ai-readiness/components'

const faqs: FAQItem[] = [
  { question: 'What is X?', answer: 'X is...' },
  { question: 'Why does Y matter?', answer: 'Because...' },
]
---
<FAQPageSchema items={faqs} />
```

```astro
---
// article-detail pages — required props only
import { TechArticleSchema } from '@obaronai/astro-ai-readiness/components'
---
<TechArticleSchema
  headline="How agents handle errors"
  description="A pattern for agent error handling that doesn't lose context."
  datePublished="2026-04-01T12:00:00Z"
/>
```

`<TechArticleSchema>` defaults `author` to a Person synthesized from `config.organization.founder` (name from `founder.name`, url from `founder.sameAs[0]`). Pass an explicit `author={{ name, url? }}` to override on multi-author sites. The component throws at build time if `author` is omitted and `founder` is unset — actionable error pointing at the `aiReadiness({...})` config.

Advanced — full prop surface:

```astro
<TechArticleSchema
  headline={article.title}
  description={article.description}
  datePublished={article.pubDate.toISOString()}
  dateModified={(article.updatedDate ?? article.pubDate).toISOString()}
  author={{ name: 'Guest Author', url: 'https://example.com' }}
  image={{ url: 'https://your-site.com/og.png', width: 1200, height: 630 }}
  articleSection="Tutorials"
  keywords={['ai', 'agents', 'error-handling']}
  proficiencyLevel="intermediate"
  dependencies={['Node 22', 'Astro 5.5']}
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

- [aiallthethings.com](https://aiallthethings.com) — AATT, the toolkit's first reference implementation. Runs all six components on production: Organization + WebSite (site-wide via BaseLayout), CollectionPage (articles + framework + tag indexes), BreadcrumbList (`/about`), FAQPage (articles with FAQ frontmatter), TechArticle (every article-detail page).
- [obaron.ai](https://obaron.ai) — Obaron's main site. Will install in FF-3.7 once v0.1.0 publishes.

## Contributing

PRs welcome. See [CONTRIBUTING.md](./.github/CONTRIBUTING.md) and our [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

MIT — Copyright (c) 2026 Adam Kinney, LLC (DBA Obaron).
