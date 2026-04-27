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
  summary: z.string().min(1),
  body: z.string().optional(),
  sections: z.array(llmsTxtSectionSchema).optional(),
  deferTo: z.object({
    title: z.string().min(1),
    url: httpsUrl,
  }).strict().optional(),
}).strict()

export const aiReadinessConfigSchema = z.object({
  site: httpsUrl,
  organization: organizationSchema,
  webSite: webSiteSchema.optional(),
  llmsTxt: llmsTxtSchema.optional(),
  llmsFull: z.unknown().optional(),
  agentsMd: z.unknown().optional(),
  mcp: z.unknown().optional(),
  robotsTxt: z.unknown().optional(),
}).strict()

export type AiReadinessConfig = z.infer<typeof aiReadinessConfigSchema>
export type OrganizationConfig = z.infer<typeof organizationSchema>
export type FounderConfig = z.infer<typeof founderSchema>
export type WebSiteConfig = z.infer<typeof webSiteSchema>
export type LlmsTxtConfig = z.infer<typeof llmsTxtSchema>
