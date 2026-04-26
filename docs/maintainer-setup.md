# Maintainer setup

GitHub-UI / npm-web actions needed to complete the Foundation tier of [`obaron/brand/gh-org/repo-management.md`](https://github.com/obaronai/.github/) for this repo. None of these are checkable into git — they live in repo settings, npm settings, or GitHub Actions secrets. This file is the durable list so it isn't just chat history.

Run order matters: items 1–4 first (everything else waits on them), then 5–6 once CI has run at least once.

## 1. Push `main` to origin

```bash
git push origin main
```

Gates everything below (the workflow files, issue templates, README links all need to be live before the GitHub-side settings reference them).

## 2. About panel — description, homepage, topics

```bash
gh repo edit obaronai/astro-ai-readiness \
  --description "AI Readiness toolkit for Astro — JSON-LD helper components today, agent-discoverable file outputs (llms.txt, agents.md, .well-known/mcp.json, named-bot robots.txt rules) on the v0.1 roadmap." \
  --homepage "https://obaron.ai" \
  --add-topic ai-readiness \
  --add-topic aeo \
  --add-topic agent-readable \
  --add-topic astro \
  --add-topic astro-integration \
  --add-topic schema-org \
  --add-topic json-ld \
  --add-topic llms-txt \
  --add-topic mcp
```

The default description currently advertises features v0.0.1 doesn't ship — fixing it is the highest-impact quick win for the npm registry's first impression.

## 3. Enable Discussions

```bash
gh api -X PATCH repos/obaronai/astro-ai-readiness -f has_discussions=true
```

`.github/ISSUE_TEMPLATE/config.yml` redirects "questions" to Discussions. Without this enabled, the redirect link 404s — and the moment someone files an issue and gets bounced to a 404, the 24-hour-rule grace period is already burning. **Do this before announcing the repo publicly.**

## 4. Replace default labels with the Obaron set

Single block — deletes the seven we don't want, creates the thirteen we do. Reversible (recreate via `gh label`):

```bash
gh label delete bug --yes -R obaronai/astro-ai-readiness
gh label delete enhancement --yes -R obaronai/astro-ai-readiness
gh label delete documentation --yes -R obaronai/astro-ai-readiness
gh label delete wontfix --yes -R obaronai/astro-ai-readiness
gh label delete duplicate --yes -R obaronai/astro-ai-readiness
gh label delete invalid --yes -R obaronai/astro-ai-readiness
gh label delete question --yes -R obaronai/astro-ai-readiness
gh label delete "help wanted" --yes -R obaronai/astro-ai-readiness
gh label delete "good first issue" --yes -R obaronai/astro-ai-readiness

gh label create "type: bug" --color d73a4a --description "Something broken" --force -R obaronai/astro-ai-readiness
gh label create "type: feature" --color a2eeef --description "Net-new functionality" --force -R obaronai/astro-ai-readiness
gh label create "type: docs" --color 0075ca --description "Documentation-only changes" --force -R obaronai/astro-ai-readiness
gh label create "priority: high" --color b60205 --description "Active impact, fix soon" --force -R obaronai/astro-ai-readiness
gh label create "priority: medium" --color fbca04 --description "Default for triage" --force -R obaronai/astro-ai-readiness
gh label create "priority: low" --color 0e8a16 --description "Nice-to-have" --force -R obaronai/astro-ai-readiness
gh label create "status: needs-triage" --color bfd4f2 --description "Default on every new issue until reviewed" --force -R obaronai/astro-ai-readiness
gh label create "status: needs-info" --color fef2c0 --description "Waiting on reporter for reproduction details" --force -R obaronai/astro-ai-readiness
gh label create "status: in-progress" --color 5319e7 --description "Actively being worked on" --force -R obaronai/astro-ai-readiness
gh label create "status: blocked" --color 24292f --description "Waiting on external dependency" --force -R obaronai/astro-ai-readiness
gh label create "good first issue" --color 7057ff --description "Curated for new contributors" --force -R obaronai/astro-ai-readiness
gh label create "help wanted" --color 008672 --description "Maintainer welcomes external help here" --force -R obaronai/astro-ai-readiness
gh label create "meta: out-of-scope" --color cfd3d7 --description "Per the open-vs-closed boundary" --force -R obaronai/astro-ai-readiness
```

The issue forms reference `priority: medium` and `status: needs-triage` as triage defaults — those labels must exist before the forms work cleanly.

## 5. NPM_TOKEN secret (gates `release.yml`)

Two sub-steps; the token never leaves your shell:

```bash
# Generate the token (npm web at npmjs.com/settings/adkinn/tokens also works)
npm token create --read-only=false

# Paste the npm_xxx output into the secret prompt
gh secret set NPM_TOKEN -R obaronai/astro-ai-readiness
```

**Token type matters.** Generate as **automation** (not classic publish), and confirm 2FA is set to "auth-only" (not "auth-and-write") at <https://www.npmjs.com/settings/adkinn/profile> — otherwise the workflow bounces on OTP and `release.yml` fails on every tag push.

Until this lands, `release.yml` will checkout-build-verify cleanly but fail at the `npm publish` step. Manual publish from your terminal still works (and that's the v0.0.1 precedent per `plans/05-tracer-postmortem.md`).

## 6. Branch protection on `main` — with a sub-decision

The playbook spec ([`obaron/brand/gh-org/repo-management.md`](https://github.com/obaronai/.github/) lines 70–84) wants the full set:

- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require linear history
- ✅ Do not allow bypassing — applies to administrators
- ❌ Require approvals (single-maintainer phase)

**But:** `npm test` and `npm run lint` are stub-failing with `exit 1` (intentional, per honest-CI / Critical #1 of the foundation review). Combined with "require status checks to pass" + "no bypass," **every PR — including Dependabot's weekly grouped patch — would be unmergeable until lint/test are real.**

Three paths, pick one:

### Option 1 — recommended: defer the status-check requirement

Turn on everything except "require status checks to pass." The other rules still keep the rope-line:

- Require PR + linear history + no bypass = no force-pushes, no direct-to-main, no merge commits
- 24-hour triage habit + CODEOWNERS + Conventional Commits squash-merge = review discipline
- CI still runs and reports red on every PR — visible enough to keep momentum on swapping the stubs

Flip "require status checks to pass" on in the **same commit** that swaps the stubs for real `vitest` + `eslint` — that's the natural moment when CI is meaningful.

### Option 2 — split `ci.yml` into separate jobs

One job per check (lint / typecheck / test / build). Branch protection requires only `typecheck` + `build` for now. Adds yaml ceremony but lets the no-bypass rule fully bite from day one.

Worth it if you expect non-Dependabot external PRs in the meantime; otherwise overkill.

### Option 3 — `continue-on-error: true` on lint/test

Step still fails visibly in the run summary but doesn't fail the job. CI reports "passing with warnings." Loses the honest-CI signal (the whole point of stub-failing); not recommended.

### What to actually do

For now: **Option 1.** Apply via web UI — Settings → Branches → Add rule on `main` — checking everything except "Require status checks to pass before merging." When `vitest` + `eslint` land, the same diff that makes them real also flips that toggle.

The `gh api` form (drop-in once you decide to require status checks):

```bash
gh api -X PUT repos/obaronai/astro-ai-readiness/branches/main/protection \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["test (22)", "test (24)"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```

For Option 1 (no status check), drop `required_status_checks` to `null`:

```bash
gh api -X PUT repos/obaronai/astro-ai-readiness/branches/main/protection \
  --input - <<'EOF'
{
  "required_status_checks": null,
  "enforce_admins": true,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```

## When triggers fire after lint/test become real

These are the diffs to coordinate when `vitest` + `eslint` land:

1. `package.json`: replace the stub-fail `test` and `lint` commands with the real `vitest` and `eslint` invocations.
2. `.github/workflows/release.yml`: re-add `npm run lint` and `npm test` to the pre-publish step list (they were intentionally omitted while stub-failing — see file comment above the typecheck step).
3. **Branch protection**: flip "Require status checks to pass" on, with `test (22)` and `test (24)` as the required contexts.
4. CHANGELOG `[Unreleased]`: note the swap.

Same commit ideally — keeps the rope-line tight.

## When `src/components/` adds a component

`release.yml`'s dist verification step hardcodes the expected artifact list. When `<WebSiteSchema>` or `<CollectionSchema>` (or any future component) lands, append the new file paths to the `for f in ...` list — otherwise the new artifact ships unverified. This is called out inline in the workflow file too.

If the list ever feels brittle, switch to a structural check (`find dist -type f -name '*.js' -size +0c` against an expected minimum, or `npm pack --dry-run` size threshold). The hardcoded list is more specific and catches subtle reorganizations; the structural check auto-tracks new artifacts. v0.0.1's choice was specificity; revisit when it bites.
