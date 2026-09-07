import { existsSync, readFileSync } from 'node:fs'

const DIST = 'dist/cli.mjs'
const BANNED_PATTERNS = [
  // Legacy telemetry / internal phone-home
  'datadoghq.com',
  'api/event_logging/batch',
  'api/claude_code/metrics',
  'getKubernetesNamespace',
  '/var/run/secrets/kubernetes',
  '/proc/self/mountinfo',
  'tengu_internal_record_permission_context',
  'anthropic-serve',
  'infra.ant.dev',
  'claude-code-feedback',
  'C07VBSHV7EV',
  // Claude Code product identity must never ship in the binary
  'Claude Code',
  'OpenClaude',
  'openclaude',
  'CLAUDE_CODE_',
  'CLAUDE_CONFIG_DIR',
  'getClaudeCodeUserAgent',
  'getClaudeConfigHomeDir',
  // Product OAuth / consumer phone-home surfaces
  'claude.com/cai/oauth',
  'platform.claude.com/oauth',
  'platform.claude.com/settings',
  'platform.claude.com/buy',
  'mcp-proxy.anthropic.com',
  'api/claude_code_shared_session_transcripts',
  'api/claude_cli_feedback',
  'downloads.claude.ai',
  'claude.ai',
  'clau.de',
  'docs.claude.com',
  'support.claude.com',
  'code.claude.com',
  'ant.dev',
] as const

if (!existsSync(DIST)) {
  console.error(`ERROR: ${DIST} not found. Run 'bun run build' first.`)
  process.exit(1)
}

const contents = readFileSync(DIST, 'utf8')
let exitCode = 0

console.log(`Checking ${DIST} for banned Claude Code / phone-home patterns...`)
console.log('')

for (const pattern of BANNED_PATTERNS) {
  const count = contents.split(pattern).length - 1
  if (count > 0) {
    console.log(`  FAIL: '${pattern}' found (${count} occurrences)`)
    exitCode = 1
  } else {
    console.log(`  PASS: '${pattern}' not found`)
  }
}

console.log('')

if (exitCode === 0) {
  console.log('[PASS] All checks passed — no banned patterns in build output')
} else {
  console.log(
    '[FAIL] FAILED — banned Claude Code / phone-home patterns found in build output',
  )
}

process.exit(exitCode)
