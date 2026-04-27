import { writeFile } from 'node:fs/promises'
import type { AiReadinessConfig, LlmsTxtConfig } from '../config.js'

/**
 * Pure composer — returns the llms.txt content string. Testable without filesystem.
 *
 * Format follows llmstxt.org: H1 / blockquote / free-form markdown body /
 * H2 sections with bulleted links / optional defer-to footer. No sitemap section
 * per the matrix — sitemap reference lives in robots.txt (Plan 12).
 */
export function composeLlmsTxt(
  config: AiReadinessConfig & { llmsTxt: LlmsTxtConfig }
): string {
  const { llmsTxt, organization } = config
  const lines: string[] = []

  lines.push(`# ${organization.name}`)
  lines.push('')

  lines.push(`> ${llmsTxt.summary}`)
  lines.push('')

  if (llmsTxt.body) {
    lines.push(llmsTxt.body.trimEnd())
    lines.push('')
  }

  if (llmsTxt.sections && llmsTxt.sections.length > 0) {
    for (const section of llmsTxt.sections) {
      lines.push(`## ${section.title}`)
      lines.push('')
      for (const link of section.links) {
        const desc = link.description ? `: ${link.description}` : ''
        lines.push(`- [${link.title}](${link.url})${desc}`)
      }
      lines.push('')
    }
  }

  if (llmsTxt.deferTo) {
    lines.push('---')
    lines.push('')
    lines.push(`Canonical reference: [${llmsTxt.deferTo.title}](${llmsTxt.deferTo.url})`)
    lines.push('')
  }

  return lines.join('\n').replace(/\n+$/, '\n')
}

export async function writeLlmsTxt(
  config: AiReadinessConfig,
  dir: URL,
  logger: { info: (msg: string) => void; warn: (msg: string) => void }
): Promise<void> {
  if (!config.llmsTxt) return
  const content = composeLlmsTxt(
    config as AiReadinessConfig & { llmsTxt: LlmsTxtConfig }
  )
  const target = new URL('llms.txt', dir)
  try {
    await writeFile(target, content, 'utf-8')
    logger.info(`wrote llms.txt (${content.length} bytes)`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.warn(`failed to write llms.txt at ${target.pathname}: ${msg}`)
    throw err
  }
}
