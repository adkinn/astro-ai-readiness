import type { AiReadinessConfig, McpConfig } from '../config.js'
import { writeOutput } from './write-output.js'

/**
 * Canonical $schema reference for the toolkit's mcp v1 discovery shape.
 * Pinned to the repo-shipped JSON Schema document at the v0.0.7 tag. URL is
 * live the moment `git push origin v0.0.7` completes on the adkinn repo; no
 * external infra dependency. v0.1.0+ may relocate per D-22.
 */
const MCP_SCHEMA_URL =
  'https://raw.githubusercontent.com/adkinn/astro-ai-readiness/v0.0.7/schemas/mcp/v1.json'

/**
 * Pure composer — returns the mcp.json content string. Testable without filesystem.
 * Pretty-printed (2-space indent) + single trailing newline (POSIX).
 */
export function composeMcpJson(
  config: AiReadinessConfig & { mcp: McpConfig }
): string {
  const { mcp } = config
  const obj: Record<string, unknown> = {
    $schema: MCP_SCHEMA_URL,
    version: mcp.version ?? '1.0',
    servers: mcp.servers.map((s) => {
      const server: Record<string, unknown> = {
        name: s.name,
        description: s.description,
        status: s.status,
      }
      if (s.status === 'active') {
        server.url = s.url
        server.tools = s.tools
      } else {
        server.planned_tools = s.planned_tools
      }
      return server
    }),
  }
  return JSON.stringify(obj, null, 2) + '\n'
}

/**
 * Filesystem writer — composes content + writes to dist/.well-known/mcp.json.
 * Creates the .well-known/ subdirectory first (idempotent via { recursive: true }).
 * Skips (and warns) if the consumer already ships the file. See writeOutput.
 */
export async function writeMcpJson(
  config: AiReadinessConfig,
  dir: URL,
  logger: { info: (msg: string) => void; warn: (msg: string) => void }
): Promise<void> {
  if (!config.mcp) return
  const content = composeMcpJson(
    config as AiReadinessConfig & { mcp: McpConfig }
  )
  const subdir = new URL('.well-known/', dir)
  const target = new URL('.well-known/mcp.json', dir)
  await writeOutput(target, content, '.well-known/mcp.json', logger, subdir)
}
