import { mkdir, writeFile } from 'node:fs/promises'

type Logger = { info: (msg: string) => void; warn: (msg: string) => void }

/**
 * Write a generated output file, but never clobber a file the consumer already
 * ships. Astro copies `public/` into the build dir *before* the
 * `astro:build:done` hook runs, so a hand-authored `public/robots.txt` (or
 * `llms.txt`, etc.) is already present at `target` when we get here. We write
 * with the `wx` flag so the write fails atomically if the file exists — no
 * read-then-write race — and we skip-and-warn rather than overwrite.
 *
 * @param label human-readable output name for log lines (e.g. `robots.txt`)
 * @param ensureDir optional directory to create first (for `.well-known/mcp.json`)
 */
export async function writeOutput(
  target: URL,
  content: string,
  label: string,
  logger: Logger,
  ensureDir?: URL
): Promise<void> {
  if (ensureDir) {
    await mkdir(ensureDir, { recursive: true })
  }
  try {
    await writeFile(target, content, { encoding: 'utf-8', flag: 'wx' })
    logger.info(`wrote ${label} (${content.length} bytes)`)
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code
    if (code === 'EEXIST') {
      logger.warn(
        `${label} already exists — leaving your file untouched. ` +
        `Delete it if you want @adkinn/astro-ai-readiness to generate ${label}.`
      )
      return
    }
    const msg = err instanceof Error ? err.message : String(err)
    logger.warn(`failed to write ${label} at ${target.pathname}: ${msg}`)
    throw err
  }
}
