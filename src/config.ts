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

export const aiReadinessConfigSchema = z.object({
  site: httpsUrl,
  organization: organizationSchema,
  webSite: webSiteSchema.optional(),
  llmsTxt: z.unknown().optional(),
  llmsFull: z.unknown().optional(),
  agentsMd: z.unknown().optional(),
  mcp: z.unknown().optional(),
  robotsTxt: z.unknown().optional(),
}).strict()

export type AiReadinessConfig = z.infer<typeof aiReadinessConfigSchema>
export type OrganizationConfig = z.infer<typeof organizationSchema>
export type FounderConfig = z.infer<typeof founderSchema>
export type WebSiteConfig = z.infer<typeof webSiteSchema>
