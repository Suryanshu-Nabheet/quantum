/**
 * No-Telemetry Build Plugin for Quantum
 *
 * Replaces phone-home, internal-only, and deleted-Anthropics-internal modules
 * with no-op stubs at compile time. Zero runtime cost, zero network calls.
 *
 * Analytics and telemetry modules have been replaced at the source level and
 * no longer need build-time stubs. This plugin now only covers:
 *
 *   - Auto-updater (phones home to GCS + npm)
 *   - Plugin fetch telemetry
 *   - Transcript / feedback sharing
 *   - Internal employee logging
 *   - Deleted Anthropic-internal modules (dump prompts, undercover, protobuf stubs)
 *
 * This file is NOT tracked upstream — merge conflicts are impossible.
 * Only build.ts needs a one-line import + one-line array entry.
 */

import type { BunPlugin } from 'bun'

// Module path (relative to src/, without extension) → stub source
const stubs: Record<string, string> = {

	// ─── Auto-updater (phones home to GCS + npm) ──────────────────

	'utils/autoUpdater': `
export async function assertMinVersion() {}
export async function getMaxVersion() { return undefined; }
export async function getMaxVersionMessage() { return undefined; }
export function shouldSkipVersion() { return true; }
export function getLockFilePath() { return '/tmp/quantum-update.lock'; }
export async function checkGlobalInstallPermissions() { return { hasPermissions: false, npmPrefix: null }; }
export async function getLatestVersion() { return null; }
export async function getNpmDistTags() { return { latest: null, stable: null }; }
export async function getLatestVersionFromGcs() { return null; }
export async function getGcsDistTags() { return { latest: null, stable: null }; }
export async function getVersionHistory() { return []; }
export async function installGlobalPackage() { return 'success'; }
`,

	// ─── Plugin fetch telemetry (not the marketplace itself) ───────

	'utils/plugins/fetchTelemetry': `
export function logPluginFetch() {}
export function classifyFetchError() { return 'disabled'; }
`,

	// ─── Transcript / feedback sharing ─────────────────────────────

	'components/FeedbackSurvey/submitTranscriptShare': `
export async function submitTranscriptShare() { return { success: false }; }
`,

	// ─── Internal employee logging (not needed in the external build) ─────

	'services/internalLogging': `
export async function logPermissionContextForAnts() {}
export const getContainerId = async () => null;
`,

	// ─── Deleted Anthropic-internal modules ───────────────────────────────

	'services/api/dumpPrompts': `
export function createDumpPromptsFetch() { return undefined; }
export function getDumpPromptsPath() { return ''; }
export function getLastApiRequests() { return []; }
export function clearApiRequestCache() {}
export function clearDumpState() {}
export function clearAllDumpState() {}
export function addApiRequestToCache() {}
`,

	'utils/undercover': `
export function isUndercover() { return false; }
export function getUndercoverInstructions() { return ''; }
export function shouldShowUndercoverAutoNotice() { return false; }
`,

	'types/generated/events_mono/claude_code/v1/claude_code_internal_event': `
export const QuantumInternalEvent = {
  fromJSON: value => value,
  toJSON: value => value,
  create: value => value ?? {},
  fromPartial: value => value ?? {},
};
`,

	'types/generated/events_mono/growthbook/v1/growthbook_experiment_event': `
export const GrowthbookExperimentEvent = {
  fromJSON: value => value,
  toJSON: value => value,
  create: value => value ?? {},
  fromPartial: value => value ?? {},
};
`,

	'types/generated/events_mono/common/v1/auth': `
export const PublicApiAuth = {
  fromJSON: value => value,
  toJSON: value => value,
  create: value => value ?? {},
  fromPartial: value => value ?? {},
};
`,

	'types/generated/google/protobuf/timestamp': `
export const Timestamp = {
  fromJSON: value => value,
  toJSON: value => value,
  create: value => value ?? {},
  fromPartial: value => value ?? {},
};
`,
	// ─── Product OAuth / Claude.ai phone-home (permanently disabled) ──

	'services/oauth/index': `
export class OAuthService {
  constructor() {}
  async startOAuthFlow() { throw new Error('Quantum CLI does not support Claude.ai product OAuth. Use an API key or provider profile.'); }
  async createApiKey() { throw new Error('OAuth disabled in Quantum CLI'); }
}
export async function refreshOAuthToken() { return null; }
`,

	'services/oauth/client': `
export function shouldUseQuantumOAuth() { return false; }
export function parseScopes() { return []; }
export function buildAuthUrl() { return ''; }
export async function exchangeCodeForTokens() { throw new Error('OAuth disabled in Quantum CLI'); }
export async function refreshOAuthToken() { return null; }
export async function fetchAndStoreUserRoles() { return null; }
export async function createAndStoreApiKey() { return null; }
export function isOAuthTokenExpired() { return true; }
export async function fetchProfileInfo() { return {}; }
export async function getOrganizationUUID() { return null; }
export function shouldRefreshOAuthAccountInfo() { return false; }
export async function populateOAuthAccountInfoIfNeeded() { return false; }
export function storeOAuthAccountInfo() {}
`,

	'services/oauth/getOauthProfile': `
export async function getOauthProfileFromApiKey() { return null; }
export async function getOauthProfileFromOauthToken() { return null; }
export async function getOauthProfile() { return null; }
export async function fetchClaudeCliProfile() { return null; }
`,

	'services/mcp/claudeai': `
export async function fetchClaudeAiMcpServers() { return []; }
export async function fetchClaudeAIMcpConfigsIfEligible() { return {}; }
export function clearClaudeAIMcpConfigsCache() {}
export function markClaudeAiMcpConnected() {}
export function hasClaudeAiMcpEverConnected() { return false; }
export function isClaudeAiMcpServer() { return false; }
`,


}

function escapeForResolvedPathRegex(modulePath: string): string {
	return modulePath
		.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
		.replace(/\//g, '[/\\\\]')
}

export const noTelemetryPlugin: BunPlugin = {
	name: 'no-telemetry',
	setup(build) {
		for (const [modulePath, contents] of Object.entries(stubs)) {
			const escaped = escapeForResolvedPathRegex(modulePath)
			const filter = new RegExp(`${escaped}\\.(ts|js|tsx)$`)

			build.onLoad({ filter }, () => ({
				contents,
				loader: 'js',
			}))
		}

		console.log(`  [STUB] no-telemetry: stubbed ${Object.keys(stubs).length} modules`)
	},
}
