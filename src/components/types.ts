/**
 * Shared prop-shape types for items-array components.
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
