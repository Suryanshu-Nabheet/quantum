export const PRODUCT_DISPLAY_NAME = 'Quantum'
export const CLI_COMMAND_NAME = 'quantum'
export const PRODUCT_URL = 'https://github.com/Suryanshu-Nabheet/Quantum'
export const DOCS_URL = 'https://github.com/Suryanshu-Nabheet/Quantum/blob/main/cli/README.md'

/**
 * Remote Control / CCR sessions are not part of Quantum CLI.
 * These helpers exist only so leftover call sites compile; they never
 * point at the consumer product or Anthropic staging.
 */
export const REMOTE_SESSIONS_ENABLED = false
export const REMOTE_SESSION_BASE_URL = PRODUCT_URL
export const REMOTE_SESSION_STAGING_BASE_URL = PRODUCT_URL
export const REMOTE_SESSION_LOCAL_BASE_URL = 'http://localhost:4000'

export function isRemoteSessionStaging(
  _sessionId?: string,
  _ingressUrl?: string,
): boolean {
  return false
}

export function isRemoteSessionLocal(
  sessionId?: string,
  ingressUrl?: string,
): boolean {
  return (
    sessionId?.includes('_local_') === true ||
    ingressUrl?.includes('localhost') === true
  )
}

export function getRemoteSessionBaseUrl(
  _sessionId?: string,
  _ingressUrl?: string,
): string {
  return REMOTE_SESSION_BASE_URL
}

/** Never returns a third-party product URL — Quantum has no CCR web frontend. */
export function getRemoteSessionUrl(
  _sessionId: string,
  _ingressUrl?: string,
): string {
  return PRODUCT_URL
}
