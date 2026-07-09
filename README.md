# @adkinn/astro-ai-readiness

> AI Readiness toolkit for Astro — six JSON-LD helper components plus `dist/llms.txt`, `dist/llms-full.txt`, `dist/agents.md`, `dist/robots.txt`, and `dist/.well-known/mcp.json`.

**Status:** v0.0.7 — seventh slice in prep. **Component sub-line complete (6 of 6); five of five v0.1 file outputs live.** Multi-output orchestration on the `astro:build:done` hook now covers the full v0.1 artifact set.

## What ships in v0.0.7

**Six JSON-LD components** (component sub-line complete):
- `<OrganizationSchema />` — Organization block. Config-driven; place in your `BaseLayout` so it ships site-wide and the `#organization` `@id` reference resolves on every page.
- `<WebSiteSchema />` — WebSite block. Config-driven; alongside `<OrganizationSchema />` in `BaseLayout`.
- `<CollectionSchema name url description? />` — CollectionPage block. Props-driven; place on collection-index pages (`/articles/`, `/tags/[tag]/`, etc.).
- `<BreadcrumbSchema items={[{ name, url }, ...]} />` — BreadcrumbList. Items-array prop; place on multi-level pages where the navigation hierarchy isn't already declared inline. Empty `items` skips emission.
- `<FAQPageSchema items={[{ question, answer }, ...]} />` — FAQPage. Items-array prop; place on pages with FAQ data. Long-form answers escape `</script>` and U+2028 / U+2029 automatically. Empty `items` skips emission.
- `<TechArticleSchema headline description datePublished {...optional} />` — TechArticle block. Heavy-props; place on article-detail pages. `author` defaults to a Person synthesized from `config.organization.founder`; pass an explicit `author` prop to override.

**Five file outputs**:
- `dist/llms.txt` — [llmstxt.org](https://llmstxt.org/) format from the `llmsTxt` config block. H1 / blockquote summary / optional body / H2 sections with bulleted links / optional canonical-reference footer. Opt-in.
- `dist/llms-full.txt` — manual full-context markdown from the `llmsFull` config block. This is config-driven in v0.0.7; content-collection introspection is a later layer.
- `dist/agents.md` — Markdown discovery file for AI-agent crawlers from the `agentsMd` config block. H1 / blockquote description / optional `## Audience`, `## Contact`, `## Links` sections. Opt-in.
- `dist/.well-known/mcp.json` — [Model Context Protocol](https://modelcontextprotocol.io/) discovery file from the `mcp` config block. Pretty-printed JSON with `$schema` reference to the toolkit-published v1 shape (per D-22). Supports `status: 'active'` (requires `url` + `tools[]`) and `status: 'planned'` (requires `planned_tools[]`; `url` forbidden by schema). Opt-in.
- `dist/robots.txt` — robots policy composition from the `robotsTxt` config block. Presets: `search-visible`, `training-opt-out` (default), and `private`; supports explicit bot rules, `Sitemap`, and optional `Content-Signal` directives.

**`@astrojs/sitemap` detection per D-8.** When you call `aiReadiness({...})` and `@astrojs/sitemap` isn't in your integrations list, the toolkit logs a build-time warning. Sitemap is an AI-Readiness baseline; when `robotsTxt` is enabled, the generated `robots.txt` includes a `Sitemap` line by default.

All six components emit canonical Schema.org JSON-LD with cross-component `@id` references (`#organization`, `#website`) so search and AI consumers can resolve the entity graph without redeclaring shared fields.

URL config fields (`site`, `organization.url`, `organization.logo`, `founder.sameAs`, `llmsTxt.*.url`) require `https://` (or `http://localhost` for dev).

Config validation errors are formatted with one issue per line — `path: message` per Zod issue — instead of the default `ZodError` JSON blob.

## On the roadmap (toward v0.1.0)

- v0.0.8 — fixture Astro app validation against AATT / adamkinney.com install paths; refine robots presets from real traffic policy.
- v0.0.9 — content-collection assisted `llms-full.txt` generation.
- v0.1.0 — polish, docs, release hardening; full install on adamkinney.com

Track progress: <https://github.com/adkinn/astro-ai-readiness/milestones>

## Install

```bash
npm install @adkinn/astro-ai-readiness
```

## Quick start

Configure (v0.0.7 accepts `site`, `organization`, optional `webSite`, optional `llmsTxt`, optional `llmsFull`, optional `agentsMd`, optional `mcp`, and optional `robotsTxt` blocks — the Zod schema rejects unknown keys, and URL fields must use `https://` or `http://localhost`):

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import aiReadiness from '@adkinn/astro-ai-readiness'

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
      llmsFull: {
        // Optional. When set, the toolkit ships dist/llms-full.txt at build time.
        // v0.0.7 is manual/config-driven; later slices can derive sections from
        // content collections.
        sections: [
          {
            title: 'Site Context',
            content: 'Long-form context agents should read before summarizing this site.',
          },
          {
            title: 'Canonical Resources',
            content: '- https://your-site.com/articles/\n- https://your-site.com/rss.xml',
          },
        ],
      },
      agentsMd: {
        // Optional. When set, the toolkit ships dist/agents.md at build time.
        description: 'What your site does and who it serves — for AI-agent crawlers.',
        audience: 'Developers and AI agents acting on their behalf.',
        contact: 'hello@your-site.com',
        links: [
          { title: 'Articles', url: 'https://your-site.com/articles/', description: 'All articles' },
          { title: 'RSS Feed', url: 'https://your-site.com/rss.xml', description: 'Machine-readable article stream' },
        ],
      },
      mcp: {
        // Optional. When set, the toolkit ships dist/.well-known/mcp.json at build time.
        // Each server must have status: 'active' or status: 'planned'.
        // Active: requires url + tools[]. Planned: requires planned_tools[]; url is forbidden.
        servers: [
          {
            // A live MCP server — must have url + tools.
            status: 'active',
            name: 'your-knowledge',
            url: 'https://mcp.your-site.com',
            description: 'MCP server exposing your site knowledge for AI agents.',
            tools: [
              { name: 'search_articles', description: 'Search articles by keyword or tag.' },
              { name: 'fetch_article', description: 'Fetch a specific article by slug.' },
            ],
          },
          {
            // A planned server — declares intent without a live URL.
            status: 'planned',
            name: 'your-future-server',
            description: 'Planned MCP server for future capability.',
            planned_tools: [
              { name: 'lookup', description: 'Lookup by ID once the server ships.' },
            ],
          },
        ],
      },
      robotsTxt: {
        // Optional. When set, the toolkit ships dist/robots.txt at build time.
        // Default policy is "training-opt-out": ordinary search stays open while
        // common model-training bot tokens are disallowed. Some vendors bundle
        // training and grounding under one token, so override rules when needed.
        policy: 'training-opt-out',
        // Defaults to https://your-site.com/sitemap-index.xml. Set false to omit.
        sitemap: 'https://your-site.com/sitemap-index.xml',
        contentSignals: {
          search: 'yes',
          aiTrain: 'no',
          aiInput: 'yes',
        },
        // Add or replace rules when your site has a specific bot policy.
        additionalLines: [
          '# Custom lines are appended before Sitemap.',
        ],
      },
    }),
  ],
})
```

> **Note on raw markdown.** `llmsTxt.*`, `llmsFull.*`, and `agentsMd.*` string fields are emitted as raw markdown. If you're templating user-generated content into those fields, escape `]`, `)`, and leading `>` to avoid breaking the rendered Markdown shape. Author-controlled strings (typical case) need no escaping. `mcp.json` is JSON-serialized and has no markdown-injection surface.

Use the components:

```astro
---
// src/layouts/BaseLayout.astro — site-wide
import { OrganizationSchema, WebSiteSchema } from '@adkinn/astro-ai-readiness/components'
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
import { CollectionSchema } from '@adkinn/astro-ai-readiness/components'
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
import { BreadcrumbSchema } from '@adkinn/astro-ai-readiness/components'
import type { BreadcrumbItem } from '@adkinn/astro-ai-readiness/components'

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
import { FAQPageSchema } from '@adkinn/astro-ai-readiness/components'
import type { FAQItem } from '@adkinn/astro-ai-readiness/components'

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
import { TechArticleSchema } from '@adkinn/astro-ai-readiness/components'
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
- **Compose, don't clobber.** `robotsTxt` exposes explicit rules and appended lines so user intent can override presets. If you already maintain a hand-written `public/robots.txt`, compare the generated file before adopting it.
- **Composes with `@astrojs/sitemap`.** Doesn't replace it. The integration warns when sitemap is missing and `robotsTxt` defaults its `Sitemap` line to `/sitemap-index.xml`.

## What's beyond v0.1

The v0.1 line is content → artifacts: components and files. Build-time AI-readiness self-scoring, spec validation against [llmstxt.org](https://llmstxt.org), and content lints are on the v0.2 horizon — but not committed scope yet. v0.1 ships first.

## Shipped on

- [aiallthethings.com](https://aiallthethings.com) — AATT, the toolkit's first reference implementation. Runs all six components on production plus three toolkit-emitted files: `dist/llms.txt` at <https://aiallthethings.com/llms.txt>, `dist/agents.md` at <https://aiallthethings.com/agents.md>, and `dist/.well-known/mcp.json` at <https://aiallthethings.com/.well-known/mcp.json>. Components: Organization + WebSite (site-wide via BaseLayout), CollectionPage (articles + framework + tag indexes), BreadcrumbList (`/about`), FAQPage (articles with FAQ frontmatter), TechArticle (every article-detail page).
- [adamkinney.com](https://adamkinney.com) — Adam Kinney's site. Next SSR reference-implementation target once v0.1.0 publishes.

## Contributing

PRs welcome. See [CONTRIBUTING.md](./.github/CONTRIBUTING.md) and our [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

MIT — Copyright (c) 2026 Adam Kinney, LLC (DBA Obaron).
