import { mkdir, writeFile } from 'node:fs/promises'
import type { AiReadinessConfig, McpConfig } from '../config.js'

/**
 * Canonical $schema reference for the toolkit's mcp v1 discovery shape.
 * Locked at v0.0.6 to the repo-shipped JSON Schema document, GitHub-pinned at
 * the v0.0.6 tag. URL is live the moment `git push origin v0.0.6` completes;
 * no obaron.ai infra dependency at v0.0.6. v0.1.0+ may relocate per D-22.
 */
const MCP_SCHEMA_URL =
  'https://raw.githubusercontent.com/obaronai/astro-ai-readiness/v0.0.6/schemas/mcp/v1.json'

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
 * Logs at info on write; logs at warn on failure and re-throws.
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
  try {
    await mkdir(subdir, { recursive: true })
    await writeFile(target, content, 'utf-8')
    logger.info(`wrote .well-known/mcp.json (${content.length} bytes)`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.warn(`failed to write .well-known/mcp.json at ${target.pathname}: ${msg}`)
    throw err
  }
}
