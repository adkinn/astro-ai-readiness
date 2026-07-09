/**
 * Serialize a JSON-LD payload for safe embedding inside an inline
 * `<script type="application/ld+json">` block.
 *
 * @internal
 *   Used by the toolkit's components via relative import (`../utils/json-ld`)
 *   from `dist/components/*.astro`. Not part of the public API; intentionally
 *   excluded from `package.json.exports`. The file ships as a build artifact
 *   so the relative-import resolution works at consumer build time, but no
 *   subpath like `@adkinn/astro-ai-readiness/utils/json-ld` is exposed.
 *   If you find yourself wanting to import this directly, file an issue —
 *   we'll consider promoting it to a public subpath.
 *
 * Three escapes:
 * - `<` -> `\u003c` so a literal `</script>` in any string cannot break
 *   the host HTML parser (XSS / parser confusion vector).
 * - U+2028 line separator and U+2029 paragraph separator: legal in JSON
 *   strings but illegal in pre-ES2019 JS string literals; consumer
 *   toolchains vary. Cheap insurance.
 *
 * The escaped form is canonical JSON-LD; validator.schema.org and every
 * search-engine consumer decode the escapes transparently.
 */
export function jsonLd(obj: Record<string, unknown>): string {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}
