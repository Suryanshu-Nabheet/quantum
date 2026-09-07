/**
 * Privacy level for Quantum CLI.
 *
 * Quantum never sends product telemetry or nonessential Anthropic phone-home
 * traffic. LLM provider API calls (Anthropic Messages, OpenAI, Gemini, etc.)
 * still work when the user configures API keys.
 */

type PrivacyLevel = 'default' | 'no-telemetry' | 'essential-traffic'

export function getPrivacyLevel(): PrivacyLevel {
  return 'essential-traffic'
}

export function isEssentialTrafficOnly(): boolean {
  return true
}

export function isTelemetryDisabled(): boolean {
  return true
}

export function getEssentialTrafficOnlyReason(): string | null {
  return 'QUANTUM_PRIVACY_DEFAULT'
}
