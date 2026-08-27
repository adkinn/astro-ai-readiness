import type { AiReadinessConfig } from '../config'

/**
 * Resolve the `@id` of the node that publishes a page.
 *
 * One rule, in one place, because the JSON-LD graph has to agree with itself:
 * a page whose `publisher` points at `#organization` while the `WebSite` it
 * belongs to publishes as `#person` describes two different sites.
 *
 * Organization wins the tie. `publisher` in schema.org is canonically an
 * Organization; the Person branch exists for solo sites that never incorporated,
 * not as a competing preference. Sites declaring both are declaring a legal
 * entity that publishes on the person's behalf.
 *
 * The Person fallback is total rather than nullable because `config.ts` refines
 * the schema to require `person || organization` — a config with neither never
 * reaches a component. If that refinement is ever relaxed, this must gain a
 * null branch and every caller must handle it.
 */
export function publisherId(config: AiReadinessConfig): string {
  return config.organization
    ? `${config.site}#organization`
    : `${config.site}#person`
}
