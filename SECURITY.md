# Security Policy

## Reporting a vulnerability

Please report security vulnerabilities through GitHub's [private vulnerability reporting](https://github.com/obaronai/astro-ai-readiness/security/advisories/new) feature. We'll acknowledge within 48 hours.

The 48-hour acknowledgment is intentionally longer than the 24-hour first-response we hold on public issues — it gives us time to triage privately and prepare a coordinated fix before any public surface, which is the whole point of private disclosure.

Do not report vulnerabilities through public issues, social, or email.

## Supported versions

During the 0.x phase, we support the most recently published version only — security fixes ship as a new patch, not as backports. Once 1.0 ships, the policy becomes most-recent-minor (security fixes backported within the active minor line; older minors get advisories but may not get patches).

## Scope

In scope: vulnerabilities in the `@obaronai/astro-ai-readiness` package itself.

Out of scope: vulnerabilities in transitive dependencies (we'll patch via Dependabot but the upstream report goes to that maintainer).
