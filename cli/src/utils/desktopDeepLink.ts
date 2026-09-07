/**
 * Anthropic Claude Desktop handoff — not part of Quantum CLI.
 */

export type DesktopInstallStatus = {
  installed: boolean
  version?: string
  needsUpdate?: boolean
}

export async function isDesktopInstalled(): Promise<boolean> {
  return false
}

export async function getDesktopInstallStatus(): Promise<DesktopInstallStatus> {
  return { installed: false }
}

export function buildDesktopDeepLink(_sessionId: string): string {
  return ''
}

export async function openDeepLink(_url: string): Promise<boolean> {
  return false
}

export async function openSessionInDesktop(): Promise<{
  success: boolean
  error?: string
  deepLinkUrl?: string
}> {
  return {
    success: false,
    error:
      'Desktop handoff is not part of Quantum CLI. Continue in this terminal or use Quantum Agent Manager.',
  }
}

export async function openCurrentSessionInDesktop(): Promise<{
  success: boolean
  error?: string
  deepLinkUrl?: string
}> {
  return openSessionInDesktop()
}
