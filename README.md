# @obaronai/astro-ai-readiness

> AI Readiness toolkit for Astro — six JSON-LD helper components plus `dist/llms.txt` today; `agents.md`, `mcp.json`, `llms-full.txt`, and `robots.txt` rules on the v0.1 roadmap.

**Status:** v0.0.5 — fifth slice shipped. **Component sub-line complete (6 of 6); file-output sub-line begins.** `dist/llms.txt` is the first toolkit-emitted artifact via the `astro:build:done` hook. Four more outputs to follow on the same hook.

## What ships in v0.0.5

**Six JSON-LD components** (component sub-line complete):
- `<OrganizationSchema />` — Organization block. Config-driven; place in your `BaseLayout` so it ships site-wide and the `#organization` `@id` reference resolves on every page.
- `<WebSiteSchema />` — WebSite block. Config-driven; alongside `<OrganizationSchema />` in `BaseLayout`.
- `<CollectionSchema name url description? />` — CollectionPage block. Props-driven; place on collection-index pages (`/articles/`, `/tags/[tag]/`, etc.).
- `<BreadcrumbSchema items={[{ name, url }, ...]} />` — BreadcrumbList. Items-array prop; place on multi-level pages where the navigation hierarchy isn't already declared inline. Empty `items` skips emission.
- `<FAQPageSchema items={[{ question, answer }, ...]} />` — FAQPage. Items-array prop; place on pages with FAQ data. Long-form answers escape `</script>` and U+2028 / U+2029 automatically. Empty `items` skips emission.
- `<TechArticleSchema headline description datePublished {...optional} />` — TechArticle block. Heavy-props; place on article-detail pages. `author` defaults to a Person synthesized from `config.organization.founder`; pass an explicit `author` prop to override.

**One file output** (file-output sub-line begins):
- `dist/llms.txt` — `astro:build:done` hook composes the [llmstxt.org](https://llmstxt.org/) format from the `llmsTxt` config block (`summary`, optional `body`, optional `sections`, optional `deferTo`). Config-driven; opt-in (no `llmsTxt` config = no file shipped). Spec-shape: H1 / blockquote summary / free-form markdown body / H2 sections with bulleted links / canonical-reference footer.

**`@astrojs/sitemap` detection per D-8.** When you call `aiReadiness({...})` and `@astrojs/sitemap` isn't in your integrations list, the toolkit logs a build-time warning. Sitemap is an AI-Readiness baseline; the sitemap reference itself ships in `robots.txt` (Plan 12 / v0.0.8).

All six components emit canonical Schema.org JSON-LD with cross-component `@id` references (`#organization`, `#website`) so search and AI consumers can resolve the entity graph without redeclaring shared fields.

URL config fields (`site`, `organization.url`, `organization.logo`, `founder.sameAs`, `llmsTxt.*.url`) require `https://` (or `http://localhost` for dev).

Config validation errors are formatted with one issue per line — `path: message` per Zod issue — instead of the default `ZodError` JSON blob.

## On the roadmap (toward v0.1.0)

- v0.0.6 — `dist/agents.md` + `dist/.well-known/mcp.json` (multi-output orchestration on the same hook)
- v0.0.7 — `dist/llms-full.txt` (content-collection-driven)
- v0.0.8 — `dist/robots.txt` composition (compose-with-existing pattern; sitemap reference lands here)
- v0.1.0 — polish, tests, docs

Track progress: <https://github.com/obaronai/astro-ai-readiness/milestones>

## Install

```bash
npm install @obaronai/astro-ai-readiness
```

## Quick start

Configure (v0.0.5 accepts `site`, `organization`, optional `webSite`, and optional `llmsTxt` blocks — the Zod schema rejects unknown keys, and URL fields must use `https://` or `http://localhost`):

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import aiReadiness from '@obaronai/astro-ai-readiness'

export default defineConfig({
  site: 'https://your-site.com',
  integrations: [
    sitemap(),                              // recommended — AI Readiness baseline (D-8)
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
      llmsTxt: {
        // Optional. When set, the toolkit ships dist/llms.txt at build time.
        // Note: `summary` must be single-line — multi-paragraph summaries break
        // the llms.txt blockquote shape. Use `body` (free-form markdown) for
        // additional prose. Multi-line summary throws at config-validation time.
        summary: 'What your site does, in one sentence — for AI agents discovering your content.',
        body: 'A free-form markdown paragraph or two between summary and sections. Plain prose; no top-level H2 here (those are reserved for link sections below).',
        sections: [
          {
            title: 'Articles',
            links: [
              { title: 'All Articles', url: 'https://your-site.com/articles/' },
              { title: 'RSS Feed', url: 'https://your-site.com/rss.xml' },
            ],
          },
        ],
        deferTo: {
          // Single canonical-reference link, rendered as a footer.
          title: 'Articles Index',
          url: 'https://your-site.com/articles/',
        },
      },
    }),
  ],
})
```

> **Note on raw markdown.** `llmsTxt.*` string fields (`summary`, `body`, `sections[].title`, `sections[].links[].title`, `sections[].links[].description`, `deferTo.title`) are emitted as raw markdown. If you're templating user-generated content into these fields, escape `]`, `)`, and leading `>` to avoid breaking the rendered Markdown shape. Author-controlled strings (typical case) need no escaping.

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

- [aiallthethings.com](https://aiallthethings.com) — AATT, the toolkit's first reference implementation. Runs all six components on production plus toolkit-emitted `dist/llms.txt` at <https://aiallthethings.com/llms.txt>. Components: Organization + WebSite (site-wide via BaseLayout), CollectionPage (articles + framework + tag indexes), BreadcrumbList (`/about`), FAQPage (articles with FAQ frontmatter), TechArticle (every article-detail page).
- [obaron.ai](https://obaron.ai) — Obaron's main site. Will install in FF-3.7 once v0.1.0 publishes.

## Contributing

PRs welcome. See [CONTRIBUTING.md](./.github/CONTRIBUTING.md) and our [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

MIT — Copyright (c) 2026 Adam Kinney, LLC (DBA Obaron).
