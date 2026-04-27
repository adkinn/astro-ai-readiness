/**
 * Shared prop-shape types for items-array components.
 *
 * @internal
 *   Consumers should import from the barrel:
 *   `import type { BreadcrumbItem, FAQItem } from '@obaronai/astro-ai-readiness/components'`
 *   The `/components/types` subpath is intentionally not exposed in
 *   `package.json.exports` — deep-importing
 *   `@obaronai/astro-ai-readiness/components/types` will fail with
 *   `ERR_PACKAGE_PATH_NOT_EXPORTED`. The file ships as a build artifact
 *   so internal relative imports (`./types`) work; the barrel is the
 *   public surface. Same pattern as `src/utils/json-ld.ts`.
 *
 * `.astro` files are externalized in `tsup.config.ts`, so their declaration
 * types don't ship via tsup's `dts: true`. Interface types must live in a
 * `.ts` file. This module is the single home for items-array shapes that
 * both the component frontmatter and the package barrel re-export.
 *
 * Components import via relative path (`./types`); the barrel re-exports
 * for consumer-side use:
 *
 * ```ts
 * import type { BreadcrumbItem, FAQItem } from '@obaronai/astro-ai-readiness/components'
 * ```
 */

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface FAQItem {
  question: string
  answer: string
}
