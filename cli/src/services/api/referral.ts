/** Guest-pass / referral phone-home disabled in Quantum CLI. */

export async function fetchReferralEligibility(): Promise<null> {
  return null
}

export async function fetchReferralRedemptions(): Promise<never[]> {
  return []
}

export async function prefetchPassesEligibility(): Promise<void> {}

export function getPassesEligibilityCache(): null {
  return null
}

export function checkCachedPassesEligibility(): null {
  return null
}

export function formatCreditAmount(amount?: number | null): string {
  return amount == null ? '' : String(amount)
}

export function getCachedReferrerReward(): null {
  return null
}

export function clearPassesEligibilityCache(): void {}
