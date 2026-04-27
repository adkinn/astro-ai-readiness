/**
 * Serialize a JSON-LD payload for safe embedding inside an inline
 * `<script type="application/ld+json">` block.
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
