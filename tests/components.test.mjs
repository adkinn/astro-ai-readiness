import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { build } from 'astro'
import aiReadiness from '../dist/index.js'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))

async function buildFixture(config, page) {
  // Astro 5 stages builds outside `outDir` under the current working directory.
  // Keeping fixtures beneath the repository makes that compatibility path valid.
  const root = await mkdtemp(join(repoRoot, '.astro-ai-readiness-'))
  try {
    await mkdir(join(root, 'src/pages'), { recursive: true })
    await mkdir(join(root, 'node_modules/@adkinn'), { recursive: true })
    await symlink(repoRoot, join(root, 'node_modules/@adkinn/astro-ai-readiness'), 'dir')
    await symlink(join(repoRoot, 'node_modules/astro'), join(root, 'node_modules/astro'), 'dir')
    await writeFile(join(root, 'src/pages/index.astro'), page, 'utf-8')

    await build({
      root,
      site: config.site,
      logLevel: 'silent',
      integrations: [aiReadiness(config)],
    })

    return await readFile(join(root, 'dist/index.html'), 'utf-8')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

test('person-only components publish against the Person identity', async () => {
  const html = await buildFixture(
    {
      site: 'https://example.com',
      person: { name: 'Ada Example', url: 'https://example.com/about' },
    },
    `---
import {
  CollectionSchema,
  PersonSchema,
  TechArticleSchema,
} from '@adkinn/astro-ai-readiness/components'
---
<PersonSchema />
<CollectionSchema name="Articles" url="https://example.com/articles/" />
<TechArticleSchema
  headline="A person-first article"
  description="Regression coverage for person-only sites."
  datePublished="2026-08-27"
  author={{ name: 'Ada Example', url: 'https://example.com/about' }}
/>
`
  )

  assert.match(html, /"@id":"https:\/\/example\.com#person"/)
  assert.doesNotMatch(html, /"@id":"https:\/\/example\.com#organization"/)
})

test('TechArticleSchema synthesizes an author from person when there is no founder', async () => {
  const html = await buildFixture(
    {
      site: 'https://example.com',
      person: { name: 'Ada Example', url: 'https://example.com/about' },
    },
    `---
import { TechArticleSchema } from '@adkinn/astro-ai-readiness/components'
---
<TechArticleSchema
  headline="No author prop, no organization"
  description="A person-first site should not need an explicit author."
  datePublished="2026-08-27"
/>
`
  )

  assert.match(
    html,
    /"author":\{"@type":"Person","name":"Ada Example","url":"https:\/\/example\.com\/about"\}/
  )
})

test('every component publishes against the same identity', async () => {
  // A site declaring BOTH identities used to get a WebSite published by #person
  // and pages published by #organization — one site, two publishers.
  const html = await buildFixture(
    {
      site: 'https://example.com',
      person: { name: 'Ada Example' },
      organization: { name: 'Example Lab', founder: { name: 'Ada Example' } },
      softwareApplication: { name: 'Example App' },
    },
    `---
import {
  CollectionSchema,
  SoftwareApplicationSchema,
  TechArticleSchema,
  WebSiteSchema,
} from '@adkinn/astro-ai-readiness/components'
---
<WebSiteSchema />
<CollectionSchema name="Articles" url="https://example.com/articles/" />
<SoftwareApplicationSchema />
<TechArticleSchema
  headline="Graph coherence"
  description="One site, one publisher."
  datePublished="2026-08-27"
/>
`
  )

  const publishers = [...html.matchAll(/"publisher":\{"@id":"([^"]+)"\}/g)].map((m) => m[1])
  assert.equal(publishers.length, 4)
  assert.deepEqual([...new Set(publishers)], ['https://example.com#organization'])
})

test('TechArticleSchema prefers founder.url over founder.sameAs', async () => {
  const html = await buildFixture(
    {
      site: 'https://example.com',
      organization: {
        name: 'Example Lab',
        founder: {
          name: 'Ada Example',
          url: 'https://example.com/about',
          sameAs: ['https://social.example.com/ada'],
        },
      },
    },
    `---
import { TechArticleSchema } from '@adkinn/astro-ai-readiness/components'
---
<TechArticleSchema
  headline="Canonical founder URL"
  description="The explicit founder URL wins."
  datePublished="2026-08-27"
/>
`
  )

  assert.match(html, /"author":\{"@type":"Person","name":"Ada Example","url":"https:\/\/example\.com\/about"\}/)
  assert.doesNotMatch(html, /"url":"https:\/\/social\.example\.com\/ada"/)
})
