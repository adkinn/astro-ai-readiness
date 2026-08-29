import type { AiReadinessConfig, RobotsTxtConfig } from '../config.js'
import { writeOutput } from './write-output.js'

type RobotsRule = NonNullable<RobotsTxtConfig['rules']>[number]
type ContentSignals = NonNullable<RobotsTxtConfig['contentSignals']>

const TRAINING_BOT_RULES: RobotsRule[] = [
  { userAgent: 'GPTBot', disallow: ['/'], comment: 'OpenAI training crawler' },
  { userAgent: 'Google-Extended', disallow: ['/'], comment: 'Google Gemini training/grounding control token' },
  { userAgent: 'CCBot', disallow: ['/'], comment: 'Common Crawl' },
  { userAgent: 'ClaudeBot', disallow: ['/'], comment: 'Anthropic crawler' },
  { userAgent: 'anthropic-ai', disallow: ['/'], comment: 'Anthropic crawler' },
  { userAgent: 'Applebot-Extended', disallow: ['/'], comment: 'Apple AI training control token' },
]

const SEARCH_BOT_RULES: RobotsRule[] = [
  { userAgent: '*', allow: ['/'], comment: 'Default web and search discovery' },
  { userAgent: 'OAI-SearchBot', allow: ['/'], comment: 'OpenAI search crawler' },
]

/**
 * The Content Signals Policy notice, verbatim from the policy Cloudflare
 * published in September 2025 and released under CC0 — no attribution required,
 * reproduction unrestricted. Copied byte-for-byte from the live
 * `blog.cloudflare.com/robots.txt`; do not paraphrase it.
 *
 * The final clause is the operative one. A `Content-Signal: ai-train=no` is just
 * a string until something states what it means and under what authority; this
 * block makes the restriction an express reservation of rights under Article 4 of
 * the EU DSM Directive. A toolkit that defaults to opting out of training and
 * omits this ships the refusal without the standing behind it.
 *
 * @see https://blog.cloudflare.com/content-signals-policy/
 */
const CONTENT_SIGNAL_NOTICE: string[] = [
  '# As a condition of accessing this website, you agree to',
  '# abide by the following content signals:',
  '',
  '# (a)  If a content-signal = yes, you may collect content',
  '# for the corresponding use.',
  '# (b)  If a content-signal = no, you may not collect content',
  '# for the corresponding use.',
  '# (c)  If the website operator does not include a content',
  '# signal for a corresponding use, the website operator',
  '# neither grants nor restricts permission via content signal',
  '# with respect to the corresponding use.',
  '',
  '# The content signals and their meanings are:',
  '',
  '# search: building a search index and providing search',
  '# results (e.g., returning hyperlinks and short excerpts',
  '# from your website\'s contents).  Search does not include',
  '# providing AI-generated search summaries.',
  '# ai-input: inputting content into one or more AI models',
  '# (e.g., retrieval augmented generation, grounding, or other',
  '# real-time taking of content for generative AI search',
  '# answers).',
  '# ai-train: training or fine-tuning AI models.',
  '',
  '# ANY RESTRICTIONS EXPRESSED VIA CONTENT-SIGNALS ARE EXPRESS',
  '# RESERVATIONS OF RIGHTS UNDER ARTICLE 4 OF THE EUROPEAN',
  '# UNION DIRECTIVE 2019/790 ON COPYRIGHT AND RELATED RIGHTS',
  '# IN THE DIGITAL SINGLE MARKET.',
]

function defaultSitemap(site: string): string {
  return new URL('sitemap-index.xml', site.endsWith('/') ? site : `${site}/`).toString()
}

function policyRules(policy: NonNullable<RobotsTxtConfig['policy']>): RobotsRule[] {
  if (policy === 'private') {
    return [{ userAgent: '*', disallow: ['/'], comment: 'Private site' }]
  }
  if (policy === 'training-opt-out') {
    return [...SEARCH_BOT_RULES, ...TRAINING_BOT_RULES]
  }
  return SEARCH_BOT_RULES
}

function defaultContentSignals(
  policy: NonNullable<RobotsTxtConfig['policy']>
): ContentSignals {
  if (policy === 'private') {
    return { search: 'no', aiTrain: 'no', aiInput: 'no' }
  }
  if (policy === 'training-opt-out') {
    return { search: 'yes', aiTrain: 'no', aiInput: 'yes' }
  }
  return { search: 'yes', aiTrain: 'yes', aiInput: 'yes' }
}

function isWildcard(rule: RobotsRule): boolean {
  const userAgents = Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent]
  return userAgents.includes('*')
}

function composeRule(rule: RobotsRule, contentSignal?: string): string[] {
  const lines: string[] = []
  const userAgents = Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent]

  if (rule.comment) lines.push(`# ${rule.comment}`)
  for (const userAgent of userAgents) {
    lines.push(`User-agent: ${userAgent}`)
  }
  // `Content-Signal` is a group-member record: it belongs inside a user-agent
  // group, alongside Allow/Disallow, not floating above the first group. Both
  // reference implementations place it this way (Cloudflare's own robots.txt and
  // stackoverflow.com). Per RFC 9309 a group-member line that precedes any
  // start-of-group line is in no group at all, and parsers may discard it — which
  // is what the toolkit emitted through v0.0.14.
  if (contentSignal) lines.push(contentSignal)
  for (const value of rule.allow ?? []) {
    lines.push(`Allow: ${value}`)
  }
  for (const value of rule.disallow ?? []) {
    lines.push(`Disallow: ${value}`)
  }
  if (rule.crawlDelay) {
    lines.push(`Crawl-delay: ${rule.crawlDelay}`)
  }
  return lines
}

/**
 * Returns the `Content-Signal` line, or `undefined` when every signal is
 * omitted. Callers must not emit the line in that case — a header with no
 * signals (`Content-Signal: `) is malformed, and a site that says nothing should
 * ship nothing rather than an empty directive.
 */
function composeContentSignal(signals: ContentSignals): string | undefined {
  const parts: string[] = []
  if (signals.search && signals.search !== 'omit') parts.push(`search=${signals.search}`)
  if (signals.aiTrain && signals.aiTrain !== 'omit') parts.push(`ai-train=${signals.aiTrain}`)
  if (signals.aiInput && signals.aiInput !== 'omit') parts.push(`ai-input=${signals.aiInput}`)
  if (parts.length === 0) return undefined
  return `Content-Signal: ${parts.join(', ')}`
}

/**
 * Pure composer for robots.txt.
 *
 * Presets are intentionally conservative: `training-opt-out` keeps ordinary
 * search discovery open and opts out of common model-training tokens. Some
 * vendors bundle training and grounding under one token, so consumers can
 * override the rules when answer-engine inclusion matters more than opt-out.
 */
export function composeRobotsTxt(
  config: AiReadinessConfig & { robotsTxt: RobotsTxtConfig }
): string {
  const robotsTxt = config.robotsTxt
  const policy = robotsTxt.policy ?? 'training-opt-out'
  const rules = robotsTxt.rules ?? policyRules(policy)
  const signals = {
    ...defaultContentSignals(policy),
    ...robotsTxt.contentSignals,
  }
  const sitemap = robotsTxt.sitemap === false ||
    (policy === 'private' && robotsTxt.sitemap === undefined)
    ? undefined
    : robotsTxt.sitemap ?? defaultSitemap(config.site)

  const contentSignal = composeContentSignal(signals)
  const lines: string[] = ['# Generated by @adkinn/astro-ai-readiness', '']

  // The notice defines what the signals mean and under what authority. It rides
  // with them or not at all: a site expressing no signals has nothing to
  // interpret, and 28 lines of policy text above an empty statement is noise.
  if (contentSignal && robotsTxt.contentSignalNotice !== false) {
    lines.push(...CONTENT_SIGNAL_NOTICE, '')
  }

  // Signals configured under `robotsTxt` are a statement about the site, so they
  // belong to the `*` group. Custom `rules` that name no wildcard group get a
  // dedicated one carrying only the signal: an empty group grants and denies no
  // paths, so this expresses the site-wide preference without inventing a crawl
  // rule the operator did not write.
  const wildcardRule = rules.find(isWildcard)
  if (contentSignal && !wildcardRule) {
    lines.push('# Site-wide content signals. This group carries no crawl rules.')
    lines.push('User-agent: *')
    lines.push(contentSignal)
    lines.push('')
  }

  for (const rule of rules) {
    lines.push(...composeRule(rule, rule === wildcardRule ? contentSignal : undefined))
    lines.push('')
  }

  if (robotsTxt.additionalLines && robotsTxt.additionalLines.length > 0) {
    lines.push(...robotsTxt.additionalLines)
    lines.push('')
  }

  if (sitemap) {
    lines.push(`Sitemap: ${sitemap}`)
    lines.push('')
  }

  return lines.join('\n').replace(/\n+$/, '\n')
}

export async function writeRobotsTxt(
  config: AiReadinessConfig,
  dir: URL,
  logger: { info: (msg: string) => void; warn: (msg: string) => void }
): Promise<void> {
  if (!config.robotsTxt) return
  const content = composeRobotsTxt(
    config as AiReadinessConfig & { robotsTxt: RobotsTxtConfig }
  )
  const target = new URL('robots.txt', dir)
  await writeOutput(target, content, 'robots.txt', logger)
}
