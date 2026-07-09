import type { AstroIntegration } from 'astro'
import { ZodError } from 'zod'
import { aiReadinessConfigSchema, type AiReadinessConfig } from './config.js'
import { writeLlmsTxt } from './outputs/llms-txt.js'
import { writeLlmsFullTxt } from './outputs/llms-full.js'
import { writeAgentsMd } from './outputs/agents-md.js'
import { writeMcpJson } from './outputs/mcp-json.js'
import { writeRobotsTxt } from './outputs/robots-txt.js'

export type {
  AiReadinessConfig,
  OrganizationConfig,
  FounderConfig,
  WebSiteConfig,
  LlmsTxtConfig,
  LlmsFullConfig,
  AgentsMdConfig,
  McpConfig,
  RobotsTxtConfig,
} from './config.js'

const VIRTUAL_ID = 'virtual:ai-readiness-config'
const RESOLVED_VIRTUAL_ID = '\0' + VIRTUAL_ID

/**
 * Friendlier Zod error formatting (closes High #3 carried since v0.0.1).
 * Default ZodError JSON output is hard to read; this wraps it in a
 * one-issue-per-line message with `path: message` per issue.
 */
function parseConfigOrThrow(options: unknown): AiReadinessConfig {
  try {
    return aiReadinessConfigSchema.parse(options)
  } catch (err) {
    if (err instanceof ZodError) {
      const lines = err.issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : '<root>'
        return `  • ${path}: ${issue.message}`
      })
      throw new Error(
        `aiReadiness: invalid config in aiReadiness({...}):\n${lines.join('\n')}`,
        { cause: err }
      )
    }
    throw err
  }
}

export default function aiReadiness(options: AiReadinessConfig): AstroIntegration {
  const config = parseConfigOrThrow(options)
  const serialized = JSON.stringify(config)

  return {
    name: '@adkinn/astro-ai-readiness',
    hooks: {
      'astro:config:setup': ({ updateConfig, logger, config: astroConfig }) => {
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'ai-readiness-virtual-config',
                resolveId(id: string) {
                  if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID
                  return null
                },
                load(id: string) {
                  if (id === RESOLVED_VIRTUAL_ID) {
                    return `export const config = ${serialized}\nexport default config\n`
                  }
                  return null
                },
              },
            ],
          },
        })

        // D-8 sitemap detection: warn unconditionally when @astrojs/sitemap is
        // missing. Sitemap is an AI-Readiness baseline; warning belongs at the
        // integration level, not gated on a specific output. The reference
        // line itself routes to robots.txt per matrix line 33 (Plan 12).
        const hasSitemap = astroConfig.integrations.some(
          (i) => i.name === '@astrojs/sitemap'
        )
        if (!hasSitemap) {
          logger.warn(
            '@astrojs/sitemap not detected. Install it ' +
            '(`npm install @astrojs/sitemap`) so AI agents can discover ' +
            'your sitemap.xml — sitemap is an AI Readiness baseline ' +
            '(per D-8). See https://docs.astro.build/en/guides/integrations-guide/sitemap/'
          )
        }

        logger.info('aiReadiness integration registered')
      },

      'astro:build:done': async ({ dir, logger }) => {
        if (config.llmsTxt) {
          await writeLlmsTxt(config, dir, logger)
        }
        if (config.llmsFull) {
          await writeLlmsFullTxt(config, dir, logger)
        }
        if (config.agentsMd) {
          await writeAgentsMd(config, dir, logger)
        }
        if (config.mcp) {
          await writeMcpJson(config, dir, logger)
        }
        if (config.robotsTxt) {
          await writeRobotsTxt(config, dir, logger)
        }
      },
    },
  }
}
