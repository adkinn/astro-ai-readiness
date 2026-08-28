import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { aiReadinessConfigSchema } from '../dist/config.js'
import { composeAgentsMd } from '../dist/outputs/agents-md.js'
import { composeLlmsFullTxt } from '../dist/outputs/llms-full.js'
import { composeLlmsTxt } from '../dist/outputs/llms-txt.js'
import { composeMcpJson } from '../dist/outputs/mcp-json.js'
import { composeRobotsTxt } from '../dist/outputs/robots-txt.js'
import { writeRobotsTxt } from '../dist/outputs/robots-txt.js'
import { jsonLd } from '../dist/utils/json-ld.js'

const baseConfig = {
  site: 'https://example.com',
  organization: {
    name: 'Example Lab',
    url: 'https://example.com',
    founder: {
      name: 'Example Founder',
      sameAs: ['https://example.com/about'],
    },
  },
}

test('composeLlmsTxt emits the llms.txt shape with a trailing newline', () => {
  const content = composeLlmsTxt({
    ...baseConfig,
    llmsTxt: {
      summary: 'Readable context for AI agents.',
      sections: [
        {
          title: 'Docs',
          links: [
            {
              title: 'Guide',
              url: 'https://example.com/guide/',
              description: 'Start here',
            },
          ],
        },
      ],
    },
  })

  assert.equal(
    content,
    '# Example Lab\n\n> Readable context for AI agents.\n\n## Docs\n\n- [Guide](https://example.com/guide/): Start here\n'
  )
})

test('composeLlmsTxt leads with person.name for a person-first site (no org)', () => {
  const content = composeLlmsTxt({
    site: 'https://example.com',
    person: { name: 'Ada Example', url: 'https://example.com' },
    llmsTxt: { summary: 'A person, building in public.' },
  })
  assert.match(content, /^# Ada Example\n/)
})

test('config schema requires a person or an organization', () => {
  assert.throws(
    () => aiReadinessConfigSchema.parse({
      site: 'https://example.com',
      llmsTxt: { summary: 'no identity' },
    }),
    /person.*organization/i
  )
  // person-only is valid
  assert.doesNotThrow(() => aiReadinessConfigSchema.parse({
    site: 'https://example.com',
    person: { name: 'Ada Example' },
  }))
})

test('composeLlmsFullTxt emits manual full-context content', () => {
  const content = composeLlmsFullTxt({
    ...baseConfig,
    llmsTxt: { summary: 'Short summary.' },
    llmsFull: {
      sections: [
        { title: 'Positioning', content: 'Detailed positioning context.' },
        { title: 'Canonical URLs', content: '- https://example.com/guide/' },
      ],
    },
  })

  assert.equal(
    content,
    '# Example Lab\n\n> Short summary.\n\n## Positioning\n\nDetailed positioning context.\n\n## Canonical URLs\n\n- https://example.com/guide/\n'
  )
})

test('composeAgentsMd emits optional sections only when configured', () => {
  const content = composeAgentsMd({
    ...baseConfig,
    agentsMd: {
      description: 'Agent operating notes.',
      contact: 'hello@example.com',
      links: [
        { title: 'RSS', url: 'https://example.com/rss.xml' },
      ],
    },
  })

  assert.equal(
    content,
    '# Example Lab\n\n> Agent operating notes.\n\n## Contact\n\nhello@example.com\n\n## Links\n\n- [RSS](https://example.com/rss.xml)\n'
  )
})

test('composeAgentsMd renders custom sections between audience and contact', () => {
  const content = composeAgentsMd({
    ...baseConfig,
    agentsMd: {
      description: 'Agent operating notes.',
      audience: 'Estate flippers.',
      sections: [
        { title: 'Pricing', content: '- Free download\n- $19.99 one-time' },
        { title: 'Data sources', content: 'Prices from real sold listings.' },
      ],
      contact: 'hi@example.com',
    },
  })

  assert.equal(
    content,
    '# Example Lab\n\n> Agent operating notes.\n\n## Audience\n\nEstate flippers.\n\n## Pricing\n\n- Free download\n- $19.99 one-time\n\n## Data sources\n\nPrices from real sold listings.\n\n## Contact\n\nhi@example.com\n'
  )
})

test('config schema accepts a softwareApplication block with offers', () => {
  assert.doesNotThrow(() => aiReadinessConfigSchema.parse({
    site: 'https://example.com',
    organization: { name: 'Example Lab' },
    softwareApplication: {
      name: 'Example App',
      operatingSystem: 'iOS',
      applicationCategory: 'UtilitiesApplication',
      screenshot: ['https://example.com/ss-1.webp'],
      featureList: ['Does the thing'],
      offers: [{ name: 'Free', price: '0', priceCurrency: 'USD' }],
    },
  }))
})

test('config schema accepts a VideoGame type with gamePlatform', () => {
  assert.doesNotThrow(() => aiReadinessConfigSchema.parse({
    site: 'https://example.com',
    person: { name: 'Example Dev' },
    softwareApplication: {
      name: 'Example Game',
      type: 'VideoGame',
      applicationCategory: 'GameApplication',
      operatingSystem: 'iOS',
      gamePlatform: 'iPhone',
      offers: [{ price: '0', priceCurrency: 'USD' }],
    },
  }))
  assert.throws(() => aiReadinessConfigSchema.parse({
    site: 'https://example.com',
    person: { name: 'Example Dev' },
    softwareApplication: { name: 'X', type: 'NotAType' },
  }))
})

test('composeMcpJson emits active and planned server metadata', () => {
  const content = composeMcpJson({
    ...baseConfig,
    mcp: {
      servers: [
        {
          status: 'active',
          name: 'knowledge',
          url: 'https://mcp.example.com',
          description: 'Example MCP server.',
          tools: [
            { name: 'search', description: 'Search content.' },
          ],
        },
        {
          status: 'planned',
          name: 'future',
          description: 'Planned server.',
          planned_tools: [
            { name: 'lookup', description: 'Lookup content.' },
          ],
        },
      ],
    },
  })

  const parsed = JSON.parse(content)
  assert.equal(parsed.version, '1.0')
  assert.equal(parsed.servers[0].tools[0].name, 'search')
  assert.equal(parsed.servers[1].planned_tools[0].name, 'lookup')
})

test('composeRobotsTxt defaults to training opt-out while preserving ordinary search', () => {
  const content = composeRobotsTxt({
    ...baseConfig,
    robotsTxt: {},
  })

  assert.match(content, /Content-Signal: search=yes, ai-train=no, ai-input=yes/)
  assert.match(content, /User-agent: OAI-SearchBot\nAllow: \//)
  assert.match(content, /User-agent: GPTBot\nDisallow: \//)
  assert.match(content, /User-agent: Google-Extended\nDisallow: \//)
  assert.match(content, /Sitemap: https:\/\/example\.com\/sitemap-index\.xml/)
})

test('composeRobotsTxt puts Content-Signal inside the wildcard group', () => {
  const content = composeRobotsTxt({ ...baseConfig, robotsTxt: {} })

  // Content-Signal is a group-member record. Emitted above the first User-agent
  // line it belongs to no group, and RFC 9309 parsers may discard it — which is
  // what shipped through v0.0.14. Both reference implementations (Cloudflare's own
  // robots.txt, stackoverflow.com) place it inside a user-agent group.
  assert.match(
    content,
    /User-agent: \*\nContent-Signal: search=yes, ai-train=no, ai-input=yes\nAllow: \//
  )

  const signalLine = content.split('\n').findIndex((l) => l.startsWith('Content-Signal:'))
  const firstGroupLine = content.split('\n').findIndex((l) => l.startsWith('User-agent:'))
  assert.ok(firstGroupLine !== -1)
  assert.ok(
    signalLine > firstGroupLine,
    'Content-Signal must not precede the first User-agent line'
  )
})

test('custom rules without a wildcard group still carry site-wide signals', () => {
  const content = composeRobotsTxt({
    ...baseConfig,
    robotsTxt: { rules: [{ userAgent: 'GPTBot', disallow: ['/'] }] },
  })

  // The signal describes the site, not GPTBot. Hanging it off the only group
  // present would silently narrow it to one crawler, so it gets a wildcard group
  // of its own — no Allow/Disallow, so no crawl rule is invented.
  assert.match(content, /User-agent: \*\nContent-Signal: search=yes, ai-train=no, ai-input=yes\n/)
  assert.doesNotMatch(content, /User-agent: GPTBot\nContent-Signal:/)
  assert.match(content, /User-agent: GPTBot\nDisallow: \//)
})

test('composeRobotsTxt drops individual signals marked omit', () => {
  const content = composeRobotsTxt({
    ...baseConfig,
    robotsTxt: {
      policy: 'search-visible',
      contentSignals: { aiTrain: 'omit' },
    },
  })

  // Silence about training is not the same as refusing it — `omit` must leave the
  // key out entirely rather than fall back to the policy default of `ai-train=yes`.
  assert.match(content, /^Content-Signal: search=yes, ai-input=yes$/m)
  assert.doesNotMatch(content, /ai-train=/)
})

test('composeRobotsTxt emits no Content-Signal line when every signal is omitted', () => {
  const content = composeRobotsTxt({
    ...baseConfig,
    robotsTxt: {
      contentSignals: { search: 'omit', aiTrain: 'omit', aiInput: 'omit' },
    },
  })

  // The bug this covers shipped a bare `Content-Signal: ` — a malformed directive
  // with a trailing space and no signals. Nothing at all is the correct output.
  assert.doesNotMatch(content, /Content-Signal/)
  assert.match(content, /^# Generated by @adkinn\/astro-ai-readiness\n\n# Default web/)
  // The rules and sitemap still ship; only the header goes quiet.
  assert.match(content, /User-agent: GPTBot\nDisallow: \//)
  assert.match(content, /Sitemap: https:\/\/example\.com\/sitemap-index\.xml/)
})

test('the config schema accepts omit as a content signal value', () => {
  const parsed = aiReadinessConfigSchema.parse({
    ...baseConfig,
    robotsTxt: { contentSignals: { aiTrain: 'omit' } },
  })
  assert.equal(parsed.robotsTxt.contentSignals.aiTrain, 'omit')

  assert.throws(
    () => aiReadinessConfigSchema.parse({
      ...baseConfig,
      robotsTxt: { contentSignals: { aiTrain: 'maybe' } },
    }),
    /aiTrain/
  )
})

test('composeRobotsTxt omits the sitemap for private sites unless explicitly configured', () => {
  const defaultPrivate = composeRobotsTxt({
    ...baseConfig,
    robotsTxt: { policy: 'private' },
  })
  assert.doesNotMatch(defaultPrivate, /^Sitemap:/m)

  const explicitSitemap = composeRobotsTxt({
    ...baseConfig,
    robotsTxt: {
      policy: 'private',
      sitemap: 'https://example.com/private-sitemap.xml',
    },
  })
  assert.match(explicitSitemap, /Sitemap: https:\/\/example\.com\/private-sitemap\.xml/)
})

test('config schema rejects old inert llmsFull and robotsTxt booleans', () => {
  assert.throws(
    () => aiReadinessConfigSchema.parse({
      ...baseConfig,
      llmsFull: true,
    }),
    /Expected object/
  )

  assert.throws(
    () => aiReadinessConfigSchema.parse({
      ...baseConfig,
      robotsTxt: true,
    }),
    /Expected object/
  )
})

test('writeRobotsTxt writes into an empty dir', async () => {
  const tmp = await mkdtemp(join(tmpdir(), 'air-'))
  try {
    const dir = pathToFileURL(tmp + '/')
    await writeRobotsTxt({ ...baseConfig, robotsTxt: {} }, dir, { info() {}, warn() {} })
    const written = await readFile(new URL('robots.txt', dir), 'utf-8')
    assert.match(written, /User-agent: GPTBot\nDisallow: \//)
  } finally {
    await rm(tmp, { recursive: true, force: true })
  }
})

test('writeRobotsTxt refuses to overwrite an existing file', async () => {
  const tmp = await mkdtemp(join(tmpdir(), 'air-'))
  try {
    const dir = pathToFileURL(tmp + '/')
    const target = new URL('robots.txt', dir)
    await writeFile(target, 'USER CONTENT\n', 'utf-8')
    const warnings = []
    await writeRobotsTxt(
      { ...baseConfig, robotsTxt: {} },
      dir,
      { info() {}, warn: (m) => warnings.push(m) }
    )
    assert.equal(await readFile(target, 'utf-8'), 'USER CONTENT\n')
    assert.ok(warnings.some((m) => /already exists/.test(m)))
  } finally {
    await rm(tmp, { recursive: true, force: true })
  }
})

test('jsonLd escapes script-breaking text and line separators', () => {
  const content = jsonLd({
    text: '</script>\u2028\u2029',
  })

  assert.equal(content, '{"text":"\\u003c/script>\\u2028\\u2029"}')
})
