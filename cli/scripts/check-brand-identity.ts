#!/usr/bin/env bun
/**
 * Ironclad Quantum CLI brand identity guard.
 *
 * FORBIDDEN (no shortcuts, no aliases, no Claude product hosts):
 * - Claude Code / OpenClaude product identity
 * - CLAUDE_CODE_* / CLAUDE_CONFIG_DIR
 * - claude.ai / claude.com product hosts (incl. docs/support/downloads)
 * - ant.dev Anthropic internal staging hosts
 * - mcp-proxy.anthropic.com / api.anthropic.com/api/oauth|claude_* product APIs
 * - Alias shims mapping Claude → Quantum
 *
 * ALLOWED:
 * - Anthropic Messages API (/v1/messages), @anthropic-ai SDK, docs.anthropic.com
 * - Claude model IDs (claude-sonnet, Claude Opus, …)
 * - On-disk legacy CLAUDE.md / CLAUDE.local.md filenames
 * - Wire beta header value 'claude-code-20250219' (Anthropic API contract)
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')

type Rule = { name: string; re: RegExp }

const rules: Rule[] = [
  { name: 'OpenClaude', re: /\bOpenClaude\b/i },
  { name: 'openclaude package', re: /\bopenclaude\b/ },
  { name: 'Claude Code product', re: /\bClaude Code\b/ },
  { name: 'CLAUDE_CODE_ env', re: /\bCLAUDE_CODE_[A-Z0-9_]+\b/ },
  { name: 'CLAUDE_CONFIG_DIR', re: /\bCLAUDE_CONFIG_DIR\b/ },
  { name: 'getClaudeCode*', re: /\bgetClaudeCode[A-Za-z0-9_]*/ },
  { name: 'getClaudeConfigHomeDir', re: /\bgetClaudeConfigHomeDir\b/ },
  { name: 'claude-code-guide id', re: /\bclaude-code-guide\b/ },
  { name: 'process.title claude', re: /process\.title\s*=\s*['"]claude['"]/ },
  {
    name: 'alias shortcut CLAUDE→QUANTUM',
    re: /\bCLAUDE_CODE_[A-Z0-9_]*\s*=\s*process\.env\.QUANTUM_|\bQUANTUM_[A-Z0-9_]*\s*=\s*process\.env\.CLAUDE_CODE_|\bCLAUDE_CODE_[A-Z0-9_]*\s*\?\?\s*process\.env\.QUANTUM_|\balias\s+claude\b|\bconst\s+claude\s*=\s*['"]quantum['"]/i,
  },
  { name: 'workflows/claude.yml', re: /\.github\/workflows\/claude(?:-code-review)?\.yml/ },
  { name: 'Run claude --', re: /Run claude --/ },
  { name: 'claude plugin help', re: /(?:^|[^\w/`])claude plugin / },
  // Product hosts — scanned including comments
  { name: 'claude.ai host', re: /claude\.ai\b/i },
  { name: 'clau.de shortlink', re: /clau\.de\b/i },
  { name: 'claude.com product host', re: /(?:^|[^\w.-])claude\.com\b/i },
  { name: 'docs.claude.com', re: /docs\.claude\.com/i },
  { name: 'support.claude.com', re: /support\.claude\.com/i },
  { name: 'downloads.claude.ai', re: /downloads\.claude\.ai/i },
  { name: 'platform.claude.com', re: /platform\.claude\.com/i },
  { name: 'code.claude.com', re: /code\.claude\.com/i },
  { name: 'ant.dev host', re: /\bant\.dev\b/i },
  { name: 'mcp-proxy.anthropic.com', re: /mcp-proxy\.anthropic\.com/i },
  {
    name: 'Anthropic product OAuth/API path',
    re: /api\.anthropic\.com\/api\/(?:oauth|claude_code|claude_cli)/i,
  },
]

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, m => '\n'.repeat(m.split('\n').length - 1))
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

const HOST_RULES = new Set([
  'claude.ai host',
  'clau.de shortlink',
  'claude.com product host',
  'docs.claude.com',
  'support.claude.com',
  'downloads.claude.ai',
  'platform.claude.com',
  'code.claude.com',
  'ant.dev host',
  'mcp-proxy.anthropic.com',
  'Anthropic product OAuth/API path',
])

function allowLine(line: string, rule: Rule): boolean {
  if (line.includes("'claude-code-20250219'") || line.includes('"claude-code-20250219"')) {
    return true
  }
  if (rule.name === 'CLAUDE_CODE_ env' && line.includes('QUANTUM_ANTHROPIC_API_BETA_HEADER')) {
    return true
  }
  // Model IDs / SDK packages are fine
  if (
    /Claude (Opus|Sonnet|Haiku|Pro|Max|Team|Enterprise)\b/.test(line) ||
    /claude-(?:sonnet|opus|haiku|3|4)/.test(line) ||
    /@anthropic-ai\//.test(line) ||
    /docs\.anthropic\.com/.test(line) ||
    /console\.anthropic\.com/.test(line) ||
    /api\.anthropic\.com\/v1\//.test(line) ||
    /anthropics\/claude-code-action/.test(line)
  ) {
    if (HOST_RULES.has(rule.name)) return false
    if (rule.name === 'Claude Code product') return false
    if (rule.name.startsWith('CLAUDE_CODE') || rule.name.startsWith('getClaude')) return false
    return !/Claude Code|CLAUDE_CODE_|getClaudeCode|OpenClaude|claude\.ai|platform\.claude/i.test(
      line,
    )
  }
  if (
    (rule.name === 'Claude Code product' || rule.name === 'CLAUDE_CODE_ env') &&
    /\bCLAUDE\.(md|local\.md)\b/.test(line) &&
    !/Claude Code|CLAUDE_CODE_/.test(line)
  ) {
    return true
  }
  return false
}

function listTrackedFiles(): string[] {
  return execFileSync(
    'git',
    ['ls-files', 'src', 'scripts', 'README.md', 'package.json', 'bin', 'docs'],
    { cwd: root, encoding: 'utf8' },
  )
    .split('\n')
    .filter(Boolean)
}

const skipPath = (path: string): boolean =>
  path.includes('/generated/') ||
  path.includes('/types/generated/') ||
  path.endsWith('.test.ts') ||
  path.endsWith('.test.tsx') ||
  path.endsWith('scripts/check-brand-identity.ts') ||
  path.endsWith('scripts/verify-no-phone-home.ts') ||
  path.endsWith('scripts/verify-no-phone-home.sh') ||
  path.endsWith('scripts/no-telemetry-plugin.ts')

const violations: { path: string; line: number; text: string; name: string }[] = []

for (const rel of listTrackedFiles()) {
  if (skipPath(rel)) continue
  if (!/\.(ts|tsx|js|jsx|mjs|cjs|md|json|sh)$/.test(rel) && !rel.startsWith('bin/')) continue
  let contents: string
  try {
    contents = readFileSync(join(root, rel), 'utf8')
  } catch {
    continue
  }
  for (const rule of rules) {
    // Product hosts: scan full file including comments.
    // Identity tokens: scan comment-stripped code to reduce noise.
    const scanned = HOST_RULES.has(rule.name)
      ? contents
      : /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(rel)
        ? stripComments(contents)
        : contents
    for (const [index, line] of scanned.split(/\r?\n/).entries()) {
      if (!rule.re.test(line)) continue
      if (allowLine(line, rule)) continue
      violations.push({
        path: rel,
        line: index + 1,
        text: line.trim().slice(0, 180),
        name: rule.name,
      })
    }
  }
}

if (violations.length) {
  console.error('Quantum CLI brand identity check FAILED — Claude product surfaces remain:\n')
  for (const v of violations.slice(0, 80)) {
    console.error(`  ${v.path}:${v.line} [${v.name}]`)
    console.error(`    ${v.text}\n`)
  }
  if (violations.length > 80) console.error(`  …and ${violations.length - 80} more`)
  process.exit(1)
}

console.log(
  'Quantum CLI identity check passed (no Claude Code product identity, hosts, or aliases).',
)
