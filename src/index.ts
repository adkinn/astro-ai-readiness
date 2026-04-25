/**
 * @obaronai/astro-ai-readiness
 *
 * AI Readiness toolkit for Astro — generates llms.txt, agents.md,
 * .well-known/mcp.json, named-bot rules in robots.txt, and ships JSON-LD
 * helper components.
 *
 * v0.1 is pre-publish. This file is a placeholder integration factory;
 * the real implementation lands in subsequent commits per the spec at
 * obaron/astro-ai-readiness/plans/03-mvp-scope.md (in the luky workspace).
 */

import type { AstroIntegration } from 'astro'

// TODO: replace with full Zod schema per src/config.ts
export interface AiReadinessOptions {
  site: string
  organization: {
    name: string
    url?: string
    founder?: {
      name: string
      jobTitle?: string
      description?: string
      sameAs?: string[]
    }
    foundingDate?: string
    knowsAbout?: string[]
    areaServed?: string
  }
  llmsTxt?: {
    summary?: string
    deferTo?: string
    sections?: unknown[]
  }
  llmsFull?: {
    collection?: string
    format?: 'markdown' | 'xml'
    sizeLimit?: number
  }
  agentsMd?: {
    description?: string
    audience?: string
    contact?: string
    links?: Record<string, string>
  }
  mcp?: {
    servers?: unknown[]
  }
  robotsTxt?: {
    bonusBots?: string[]
  }
}

/**
 * Astro integration factory.
 *
 * @example
 * ```ts
 * // astro.config.mjs
 * import aiReadiness from '@obaronai/astro-ai-readiness'
 *
 * export default defineConfig({
 *   integrations: [
 *     aiReadiness({
 *       site: 'https://your-site.com',
 *       organization: { name: 'Your Brand', founder: { name: 'You' } },
 *     }),
 *   ],
 * })
 * ```
 */
export default function aiReadiness(options: AiReadinessOptions): AstroIntegration {
  return {
    name: '@obaronai/astro-ai-readiness',
    hooks: {
      'astro:config:setup': ({ logger }) => {
        // TODO: validate options via Zod, register virtual modules,
        // inject helper components per src/components/.
        logger.info('aiReadiness integration registered (v0.0.0 — implementation TBD)')
      },
      'astro:build:done': async ({ logger }) => {
        // TODO: orchestrate src/outputs/* — llms-txt, llms-full, agents-md,
        // mcp-json, robots-txt — and write to dist/.
        logger.info('aiReadiness build:done hook (no-op in v0.0.0)')
      },
    },
  }
}
