import { z } from 'zod'

const founderSchema = z.object({
  name: z.string().min(1),
  jobTitle: z.string().optional(),
  description: z.string().optional(),
  sameAs: z.array(z.string().url()).optional(),
})

const organizationSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().optional(),
  logo: z.string().url().optional(),
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
  site: z.string().url(),
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
