/**
 * Zod schema and inferred TypeScript types for the `aiReadiness({...})` config.
 *
 * @internal
 *   The `aiReadinessConfigSchema` itself is internal — consumers configure the
 *   integration via the default export (`aiReadiness`) and import inferred
 *   types via the package barrel:
 *   `import type { AiReadinessConfig, LlmsTxtConfig, ... } from '@obaronai/astro-ai-readiness'`
 *   The `/config` subpath is intentionally not exposed in `package.json.exports`
 *   — deep-importing `@obaronai/astro-ai-readiness/config` will fail with
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
  sameAs: z.array(httpsUrl).optional(),
})

const organizationSchema = z.object({
  name: z.string().min(1),
  url: httpsUrl.optional(),
  logo: httpsUrl.optional(),
  founder: founderSchema.optional(),
  foundingDate: z.string().optional(),
  knowsAbout: z.array(z.string()).optional(),
  areaServed: z.string().optional(),
}).strict()

const webSiteSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
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

// agents.md — markdown composition for AI-agent discovery
const agentsMdLinkSchema = z.object({
  title: z.string().min(1),
  url: httpsUrl,
  description: z.string().optional(),
}).strict()

const agentsMdSchema = z.object({
  description: z.string().min(1).refine(
    (s) => !s.includes('\n'),
    { message: 'description must be single-line — use audience/contact fields for additional prose' }
  ),
  audience: z.string().optional(),
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

export const aiReadinessConfigSchema = z.object({
  site: httpsUrl,
  organization: organizationSchema,
  webSite: webSiteSchema.optional(),
  llmsTxt: llmsTxtSchema.optional(),
  llmsFull: z.unknown().optional(),
  agentsMd: agentsMdSchema.optional(),
  mcp: mcpSchema.optional(),
  robotsTxt: z.unknown().optional(),
}).strict()

export type AiReadinessConfig = z.infer<typeof aiReadinessConfigSchema>
export type OrganizationConfig = z.infer<typeof organizationSchema>
export type FounderConfig = z.infer<typeof founderSchema>
export type WebSiteConfig = z.infer<typeof webSiteSchema>
export type LlmsTxtConfig = z.infer<typeof llmsTxtSchema>
export type AgentsMdConfig = z.infer<typeof agentsMdSchema>
export type McpConfig = z.infer<typeof mcpSchema>
