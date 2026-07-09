import type { AiReadinessConfig, LlmsFullConfig } from '../config.js'
import { writeOutput } from './write-output.js'

/**
 * Pure composer for llms-full.txt.
 *
 * This is intentionally config-driven for v0.0.7. Content-collection
 * introspection can layer on later without reintroducing inert config.
 */
export function composeLlmsFullTxt(
  config: AiReadinessConfig & { llmsFull: LlmsFullConfig }
): string {
  const { llmsFull, llmsTxt, organization } = config
  const lines: string[] = []

  lines.push(`# ${llmsFull.title ?? organization.name}`)
  lines.push('')

  const summary = llmsFull.summary ?? llmsTxt?.summary
  if (summary) {
    lines.push(`> ${summary}`)
    lines.push('')
  }

  if (llmsFull.content) {
    lines.push(llmsFull.content.trimEnd())
    lines.push('')
  }

  if (llmsFull.sections) {
    for (const section of llmsFull.sections) {
      lines.push(`## ${section.title}`)
      lines.push('')
      lines.push(section.content.trimEnd())
      lines.push('')
    }
  }

  return lines.join('\n').replace(/\n+$/, '\n')
}

export async function writeLlmsFullTxt(
  config: AiReadinessConfig,
  dir: URL,
  logger: { info: (msg: string) => void; warn: (msg: string) => void }
): Promise<void> {
  if (!config.llmsFull) return
  const content = composeLlmsFullTxt(
    config as AiReadinessConfig & { llmsFull: LlmsFullConfig }
  )
  const target = new URL('llms-full.txt', dir)
  await writeOutput(target, content, 'llms-full.txt', logger)
}
