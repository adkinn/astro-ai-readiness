import type { AstroIntegration } from 'astro'
import { aiReadinessConfigSchema, type AiReadinessConfig } from './config.js'

export type { AiReadinessConfig, OrganizationConfig, FounderConfig, WebSiteConfig } from './config.js'

const VIRTUAL_ID = 'virtual:obaronai-config'
const RESOLVED_VIRTUAL_ID = '\0' + VIRTUAL_ID

export default function aiReadiness(options: AiReadinessConfig): AstroIntegration {
  const config = aiReadinessConfigSchema.parse(options)
  const serialized = JSON.stringify(config)

  return {
    name: '@obaronai/astro-ai-readiness',
    hooks: {
      'astro:config:setup': ({ updateConfig, logger }) => {
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'obaronai-virtual-config',
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
        logger.info('aiReadiness integration registered')
      },
    },
  }
}
