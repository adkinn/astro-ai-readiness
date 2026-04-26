# Contributing

Thanks for your interest in contributing to `@obaronai/astro-ai-readiness`.

## Status

This package is shipping incrementally toward v0.1.0 (see [README](../README.md) for the roadmap). Current state: v0.0.1 with `<OrganizationSchema>`. The public API surface grows in small, validated slices. PRs welcome — especially bug reports against shipped surface, missing-config-knob requests, and reference-implementation feedback.

## How to contribute

### Reporting a bug

[Open an issue](https://github.com/obaronai/astro-ai-readiness/issues/new?template=bug_report.yml) using the bug report template. Please include:

- Astro version
- Toolkit version
- Minimal reproduction (a `astro.config.mjs` excerpt + observed vs. expected output)

### Requesting a feature

[Open an issue](https://github.com/obaronai/astro-ai-readiness/issues/new?template=feature_request.yml) using the feature request template. The toolkit's scope is "AI Readiness for Astro sites" — features that fit the rubric (`obaron.ai/methodology`) are most likely to land. Adjacent niceties (Lighthouse tuning, OG image generation, sitemap depth) are out of scope.

### Submitting a PR

1. Open an issue first if the change is non-trivial. Helps avoid wasted work.
2. Fork the repo, create a feature branch (`feat/your-feature` or `fix/your-fix`).
3. Run `npm test` locally (once the test suite lands).
4. Open the PR against `main`. Include a short description of the change and link to the related issue.

### Code style

- TypeScript, strict mode.
- Astro components for any JSON-LD emission.
- Zero client-side JavaScript — every output is build-time.
- Composes with `@astrojs/sitemap`; never replaces it.
- Modular outputs (one module per artifact in `src/outputs/`).
- Content-collection introspection (`getCollection()`) — not post-build HTML scrape.

See the toolkit's design principles in the [README](../README.md#design-principles).

## Scope statement

The toolkit's job is to make Astro sites score well against [Obaron's AI Readiness rubric](https://obaron.ai/methodology). Features that don't trace to a rubric category are likely out of scope; flag them in an issue and we'll discuss.

The canonical statement of what's open-source vs. what lives in the closed Obaron product (scoring engine internals, managed services, audit reports) is in the [Obaron org Profile README](https://github.com/obaronai/.github/blob/main/profile/README.md). Read that before proposing scope expansions — it'll save us both a round-trip.

## Voice in issues, PRs, and discussions

We aim for the institutional, specific, no-AI-hype voice the [README](../README.md) and [org Profile README](https://github.com/obaronai/.github/blob/main/profile/README.md) use. Feel free to mirror that tone in PR descriptions, issue comments, and Discussions threads — concrete language ("this is fixed in v0.3.1") over hedged ("should be working now"), thanks-but-no-thanks over apologetic deflection, and no AI-hype copy ("revolutionary", "supercharged", etc.).

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT license](../LICENSE). Please also follow our [Code of Conduct](../CODE_OF_CONDUCT.md).
