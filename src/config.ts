/**
 * Zod schema and inferred TypeScript types for the `aiReadiness({...})` config.
 *
 * @internal
 *   The `aiReadinessConfigSchema` itself is internal — consumers configure the
 *   integration via the default export (`aiReadiness`) and import inferred
 *   types via the package barrel:
 *   `import type { AiReadinessConfig, LlmsTxtConfig, ... } from '@adkinn/astro-ai-readiness'`
 *   The `/config` subpath is intentionally not exposed in `package.json.exports`
 *   — deep-importing `@adkinn/astro-ai-readiness/config` will fail with
 *   `ERR_PACKAGE_PATH_NOT_EXPORTED`. The compiled `dist/config.{js,d.ts}` ships
 *   so internal relative imports (`../config`, `./config`) from `outputs/*` and
 *   `index.ts` resolve at runtime; the barrel is the public surface. Same
 *   pattern as `src/utils/json-ld.ts` and `src/components/types.ts`.
 */

import { z } from 'zod'

/**
 * URL string that requires `https://` (or `http://localhost` for dev).
 * Per v0.0.2 review Medium #5: tighter than plain `z.string().url()`.
 */
const httpsUrl = z.string().url().refine(
  (u) => u.startsWith('https://') || u.startsWith('http://localhost'),
  { message: 'URL must use https:// (or http://localhost for dev)' }
)

const founderSchema = z.object({
  name: z.string().min(1),
  jobTitle: z.string().optional(),
  description: z.string().optional(),
  url: httpsUrl.optional(),
  sameAs: z.array(httpsUrl).optional(),
})

// schema.org ContactPoint — support / press contact on the Organization.
const contactPointSchema = z.object({
  contactType: z.string().min(1),
  email: z.string().email().optional(),
  telephone: z.string().min(1).optional(),
  url: httpsUrl.optional(),
}).strict()

const organizationSchema = z.object({
  name: z.string().min(1),
  url: httpsUrl.optional(),
  logo: httpsUrl.optional(),
  description: z.string().optional(),
  sameAs: z.array(httpsUrl).optional(),
  founder: founderSchema.optional(),
  foundingDate: z.string().optional(),
  knowsAbout: z.array(z.string()).optional(),
  areaServed: z.string().optional(),
  contactPoint: contactPointSchema.optional(),
}).strict()

// Person — schema.org Person, for sites whose primary identity is an
// individual (personal brands, solo builders) rather than an organization.
const personSchema = z.object({
  name: z.string().min(1),
  url: httpsUrl.optional(),
  jobTitle: z.string().optional(),
  description: z.string().optional(),
  image: httpsUrl.optional(),
  sameAs: z.array(httpsUrl).optional(),
  knowsAbout: z.array(z.string()).optional(),
}).strict()

const webSiteSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  inLanguage: z.string().optional(),
}).strict()

// schema.org SoftwareApplication — for app / product sites. Publisher and
// author link to the site's Organization (or Person) automatically.
const offerSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.string().min(1),
  priceCurrency: z.string().min(1),
  description: z.string().optional(),
}).strict()

const softwareApplicationSchema = z.object({
  name: z.string().min(1),
  // schema.org @type — VideoGame / MobileApplication / WebApplication are
  // subtypes of SoftwareApplication, more accurate for games and mobile/web
  // apps. Defaults to 'SoftwareApplication'.
  type: z.enum(['SoftwareApplication', 'VideoGame', 'MobileApplication', 'WebApplication']).optional(),
  applicationCategory: z.string().optional(),
  applicationSubCategory: z.string().optional(),
  operatingSystem: z.string().optional(),
  gamePlatform: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]).optional(),
  description: z.string().optional(),
  url: httpsUrl.optional(),
  image: httpsUrl.optional(),
  screenshot: z.array(httpsUrl).optional(),
  featureList: z.array(z.string()).optional(),
  offers: z.array(offerSchema).optional(),
  installUrl: httpsUrl.optional(),
  downloadUrl: httpsUrl.optional(),
  aggregateRating: z.object({
    ratingValue: z.number(),
    ratingCount: z.number().int().positive(),
  }).strict().optional(),
}).strict()

const llmsTxtLinkSchema = z.object({
  title: z.string().min(1),
  url: httpsUrl,
  description: z.string().optional(),
}).strict()

const llmsTxtSectionSchema = z.object({
  title: z.string().min(1),
  links: z.array(llmsTxtLinkSchema).min(1),
}).strict()

const llmsTxtSchema = z.object({
  summary: z.string().min(1).refine(
    (s) => !s.includes('\n'),
    { message: 'summary must be single-line — multi-paragraph summaries break llms.txt blockquote shape. Use the optional `body` field for additional prose.' }
  ),
  body: z.string().optional(),
  sections: z.array(llmsTxtSectionSchema).optional(),
  deferTo: z.object({
    title: z.string().min(1),
    url: httpsUrl,
  }).strict().optional(),
}).strict()

const llmsFullSectionSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
}).strict()

const llmsFullSchema = z.object({
  title: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  sections: z.array(llmsFullSectionSchema).min(1).optional(),
}).strict().refine(
  (value) => Boolean(value.content || value.sections),
  { message: 'llmsFull requires either `content` or `sections`' }
)

// agents.md — markdown composition for AI-agent discovery
const agentsMdLinkSchema = z.object({
  title: z.string().min(1),
  url: httpsUrl,
  description: z.string().optional(),
}).strict()

// Arbitrary H2 section (`## title` + raw-markdown content) for agents.md,
// beyond the built-in audience/contact/links. Rendered between audience and
// contact so a site can carry Pricing, Data sources, etc.
const agentsMdSectionSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
}).strict()

const agentsMdSchema = z.object({
  description: z.string().min(1).refine(
    (s) => !s.includes('\n'),
    { message: 'description must be single-line — use audience/contact fields for additional prose' }
  ),
  audience: z.string().optional(),
  sections: z.array(agentsMdSectionSchema).min(1).optional(),
  contact: z.string().optional(),
  links: z.array(agentsMdLinkSchema).min(1).optional(),
}).strict()

// .well-known/mcp.json — Model Context Protocol discovery file
const mcpToolSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
}).strict()

// Active server — has a live URL + real tools.
const mcpActiveServerSchema = z.object({
  status: z.literal('active'),
  name: z.string().min(1),
  url: z.string().url(),
  description: z.string().min(1),
  tools: z.array(mcpToolSchema).min(1),
}).strict()

// Planned server — declares intent; url is forbidden per D-22.
const mcpPlannedServerSchema = z.object({
  status: z.literal('planned'),
  name: z.string().min(1),
  description: z.string().min(1),
  planned_tools: z.array(mcpToolSchema).min(1),
}).strict()

// Discriminated union on `status` — per-branch errors via friendlier-Zod-error wrap.
const mcpServerSchema = z.discriminatedUnion('status', [
  mcpActiveServerSchema,
  mcpPlannedServerSchema,
])

const mcpSchema = z.object({
  version: z.string().optional(),
  servers: z.array(mcpServerSchema).min(1),
}).strict()

const robotsPath = z.string().min(1).refine(
  (path) => path === '*' || path.startsWith('/'),
  { message: 'robots.txt paths must start with /, or be *' }
)

const robotsTxtRuleSchema = z.object({
  userAgent: z.union([
    z.string().min(1),
    z.array(z.string().min(1)).min(1),
  ]),
  allow: z.array(robotsPath).min(1).optional(),
  disallow: z.array(robotsPath).min(1).optional(),
  crawlDelay: z.number().positive().optional(),
  comment: z.string().min(1).optional(),
}).strict().refine(
  (rule) => Boolean(rule.allow || rule.disallow),
  { message: 'robots.txt rules require `allow` or `disallow`' }
)

// `omit` is not a value the Content Signals vocabulary defines — it means "say
// nothing about this signal," which is materially different from `no`. An absent
// signal expresses no preference; `no` expresses a refusal. Sites that want to
// stay silent on training while still declaring search need a way to say so, and
// before v0.0.15 the only thing that worked was passing `undefined` and relying
// on it surviving a spread — an accident of the implementation, not an API.
const contentSignalValueSchema = z.enum(['yes', 'no', 'omit'])

const robotsTxtSchema = z.object({
  policy: z.enum(['search-visible', 'training-opt-out', 'private']).optional(),
  sitemap: z.union([httpsUrl, z.literal(false)]).optional(),
  contentSignals: z.object({
    search: contentSignalValueSchema.optional(),
    aiTrain: contentSignalValueSchema.optional(),
    aiInput: contentSignalValueSchema.optional(),
  }).strict().optional(),
  rules: z.array(robotsTxtRuleSchema).min(1).optional(),
  additionalLines: z.array(z.string()).optional(),
}).strict()

export const aiReadinessConfigSchema = z.object({
  site: httpsUrl,
  organization: organizationSchema.optional(),
  person: personSchema.optional(),
  softwareApplication: softwareApplicationSchema.optional(),
  webSite: webSiteSchema.optional(),
  llmsTxt: llmsTxtSchema.optional(),
  llmsFull: llmsFullSchema.optional(),
  agentsMd: agentsMdSchema.optional(),
  mcp: mcpSchema.optional(),
  robotsTxt: robotsTxtSchema.optional(),
}).strict().refine(
  (value) => Boolean(value.person || value.organization),
  { message: 'Provide `person` and/or `organization` — the site needs at least one identity for the llms.txt heading and JSON-LD.' }
)

export type AiReadinessConfig = z.infer<typeof aiReadinessConfigSchema>
export type OrganizationConfig = z.infer<typeof organizationSchema>
export type PersonConfig = z.infer<typeof personSchema>
export type FounderConfig = z.infer<typeof founderSchema>
export type ContactPointConfig = z.infer<typeof contactPointSchema>
export type SoftwareApplicationConfig = z.infer<typeof softwareApplicationSchema>
export type WebSiteConfig = z.infer<typeof webSiteSchema>
export type LlmsTxtConfig = z.infer<typeof llmsTxtSchema>
export type LlmsFullConfig = z.infer<typeof llmsFullSchema>
export type AgentsMdConfig = z.infer<typeof agentsMdSchema>
export type McpConfig = z.infer<typeof mcpSchema>
export type RobotsTxtConfig = z.infer<typeof robotsTxtSchema>
