import { writeFile } from 'node:fs/promises'
import type { AiReadinessConfig, AgentsMdConfig } from '../config.js'

/**
 * Pure composer — returns the agents.md content string. Testable without filesystem.
 * Format: H1 (org name) / blockquote summary / fixed H2 sections.
 *
 * Like llms.txt, agents.md string fields are emitted as raw markdown — consumers
 * responsible for escaping their own punctuation when shipping user-generated content.
 */
export function composeAgentsMd(
  config: AiReadinessConfig & { agentsMd: AgentsMdConfig }
): string {
  const { agentsMd, organization } = config
  const lines: string[] = []

  lines.push(`# ${organization.name}`)
  lines.push('')
  lines.push(`> ${agentsMd.description}`)
  lines.push('')

  if (agentsMd.audience) {
    lines.push('## Audience')
    lines.push('')
    lines.push(agentsMd.audience.trimEnd())
    lines.push('')
  }

  if (agentsMd.contact) {
    lines.push('## Contact')
    lines.push('')
    lines.push(agentsMd.contact.trimEnd())
    lines.push('')
  }

  if (agentsMd.links && agentsMd.links.length > 0) {
    lines.push('## Links')
    lines.push('')
    for (const link of agentsMd.links) {
      const desc = link.description ? `: ${link.description}` : ''
      lines.push(`- [${link.title}](${link.url})${desc}`)
    }
    lines.push('')
  }

  return lines.join('\n').replace(/\n+$/, '\n')
}

export async function writeAgentsMd(
  config: AiReadinessConfig,
  dir: URL,
  logger: { info: (msg: string) => void; warn: (msg: string) => void }
): Promise<void> {
  if (!config.agentsMd) return
  const content = composeAgentsMd(
    config as AiReadinessConfig & { agentsMd: AgentsMdConfig }
  )
  const target = new URL('agents.md', dir)
  try {
    await writeFile(target, content, 'utf-8')
    logger.info(`wrote agents.md (${content.length} bytes)`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.warn(`failed to write agents.md at ${target.pathname}: ${msg}`)
    throw err
  }
}
