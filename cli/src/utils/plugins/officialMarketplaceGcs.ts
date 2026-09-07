/**
 * Official marketplace GCS mirror — disabled in Quantum CLI.
 * Never phones home to downloads.remote. Callers fall through to git/local.
 */

/**
 * @returns always null — Quantum does not use Anthropic's plugin GCS mirror.
 */
export async function fetchOfficialMarketplaceFromGcs(
  _installLocation: string,
  _marketplacesCacheDir: string,
): Promise<string | null> {
  return null
}
