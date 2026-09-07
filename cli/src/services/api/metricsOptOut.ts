/**
 * Metrics opt-out phone-home is disabled in Quantum CLI.
 * Telemetry is always off (see privacyLevel.ts).
 */

type MetricsStatus = {
  enabled: boolean
  hasError: boolean
}

export async function checkMetricsEnabled(): Promise<MetricsStatus> {
  return { enabled: false, hasError: false }
}

export async function checkMetricsOptOut(): Promise<{ optedOut: boolean }> {
  return { optedOut: true }
}

export function clearMetricsStatusCache(): void {}
