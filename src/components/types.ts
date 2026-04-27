/**
 * Shared prop-shape types for components that need declarable interfaces
 * (items-array element shapes, heavy-props nested-object shapes).
 *
 * @internal
 *   Consumers should import from the barrel:
 *   `import type { BreadcrumbItem, FAQItem, TechArticleAuthor, TechArticleImage } from '@obaronai/astro-ai-readiness/components'`
 *   The `/components/types` subpath is intentionally not exposed in
 *   `package.json.exports` — deep-importing
 *   `@obaronai/astro-ai-readiness/components/types` will fail with
 *   `ERR_PACKAGE_PATH_NOT_EXPORTED`. The file ships as a build artifact
 *   so internal relative imports (`./types`) work; the barrel is the
 *   public surface. Same pattern as `src/utils/json-ld.ts`.
 *
 * `.astro` files are externalized in `tsup.config.ts`, so their declaration
 * types don't ship via tsup's `dts: true`. Interface types must live in a
 * `.ts` file. This module is the single home for prop shapes — items-array
 * elements (`BreadcrumbItem`, `FAQItem`) and heavy-props nested objects
 * (`TechArticleAuthor`, `TechArticleImage`) — that both the component
 * frontmatter and the package barrel re-export.
 *
 * Components import via relative path (`./types`); the barrel re-exports
 * for consumer-side use.
 */

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface TechArticleAuthor {
  name: string
  url?: string
}

/**
 * URL string is the common case; object form supports width/height/caption
 * when the consumer wants the richer Schema.org ImageObject shape.
 */
export type TechArticleImage =
  | string
  | {
      url: string
      width?: number
      height?: number
      caption?: string
    }
