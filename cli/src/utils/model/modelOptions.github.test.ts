import { afterEach, beforeEach, expect, test } from 'bun:test'
import { mock } from 'bun:test'

import { resetModelStringsForTestingOnly } from '../../bootstrap/state.js'
import { saveGlobalConfig } from '../config.js'
import {
  resetSettingsCache,
  setSessionSettingsCache,
} from '../settings/settingsCache.js'

async function importFreshModelOptionsModule() {
  mock.restore()
  mock.module('./providers.js', () => ({
    getAPIProvider: () => 'github',
    getAPIProviderForStatsig: () => 'github',
    isFirstPartyAnthropicBaseUrl: () => false,
    isGithubNativeAnthropicMode: () => false,
    usesAnthropicAccountFlow: () => false,
  }))
  const nonce = `${Date.now()}-${Math.random()}`
  return import(`./modelOptions.js?ts=${nonce}`)
}

const originalEnv = {
  QUANTUM_USE_GITHUB: process.env.QUANTUM_USE_GITHUB,
  QUANTUM_USE_OPENAI: process.env.QUANTUM_USE_OPENAI,
  QUANTUM_USE_GEMINI: process.env.QUANTUM_USE_GEMINI,
  QUANTUM_USE_BEDROCK: process.env.QUANTUM_USE_BEDROCK,
  QUANTUM_USE_VERTEX: process.env.QUANTUM_USE_VERTEX,
  QUANTUM_USE_FOUNDRY: process.env.QUANTUM_USE_FOUNDRY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
  ANTHROPIC_CUSTOM_MODEL_OPTION: process.env.ANTHROPIC_CUSTOM_MODEL_OPTION,
}

function restoreEnvValue(
  key: keyof typeof originalEnv,
): void {
  const value = originalEnv[key]
  if (value === undefined) {
    delete process.env[key]
  } else {
    process.env[key] = value
  }
}

beforeEach(() => {
  mock.restore()
  setSessionSettingsCache({ settings: {}, errors: [] })
  delete process.env.QUANTUM_USE_GITHUB
  delete process.env.QUANTUM_USE_OPENAI
  delete process.env.QUANTUM_USE_GEMINI
  delete process.env.QUANTUM_USE_BEDROCK
  delete process.env.QUANTUM_USE_VERTEX
  delete process.env.QUANTUM_USE_FOUNDRY
  delete process.env.OPENAI_MODEL
  delete process.env.OPENAI_BASE_URL
  delete process.env.ANTHROPIC_CUSTOM_MODEL_OPTION
  resetModelStringsForTestingOnly()
})

afterEach(() => {
  mock.restore()
  resetSettingsCache()
  restoreEnvValue('QUANTUM_USE_GITHUB')
  restoreEnvValue('QUANTUM_USE_OPENAI')
  restoreEnvValue('QUANTUM_USE_GEMINI')
  restoreEnvValue('QUANTUM_USE_BEDROCK')
  restoreEnvValue('QUANTUM_USE_VERTEX')
  restoreEnvValue('QUANTUM_USE_FOUNDRY')
  restoreEnvValue('OPENAI_MODEL')
  restoreEnvValue('OPENAI_BASE_URL')
  restoreEnvValue('ANTHROPIC_CUSTOM_MODEL_OPTION')
  saveGlobalConfig(current => ({
    ...current,
    additionalModelOptionsCache: [],
    additionalModelOptionsCacheScope: undefined,
    openaiAdditionalModelOptionsCache: [],
    openaiAdditionalModelOptionsCacheByProfile: {},
    providerProfiles: [],
    activeProviderProfileId: undefined,
  }))
  resetModelStringsForTestingOnly()
})

test('GitHub provider exposes default + all Copilot models in /model options', async () => {
  process.env.QUANTUM_USE_GITHUB = '1'
  delete process.env.QUANTUM_USE_OPENAI
  delete process.env.QUANTUM_USE_GEMINI
  delete process.env.QUANTUM_USE_BEDROCK
  delete process.env.QUANTUM_USE_VERTEX
  delete process.env.QUANTUM_USE_FOUNDRY

  process.env.OPENAI_MODEL = 'gpt-4o'
  delete process.env.ANTHROPIC_CUSTOM_MODEL_OPTION

  const { getModelOptions } = await importFreshModelOptionsModule()
  const options = getModelOptions(false)
  const nonDefault = options.filter(
    (option: { value: unknown }) => option.value !== null,
  )

  expect(nonDefault.length).toBeGreaterThan(1)
  expect(nonDefault.some((o: { value: unknown }) => o.value === 'gpt-4o')).toBe(true)
  expect(nonDefault.some((o: { value: unknown }) => o.value === 'gpt-5.3-codex')).toBe(true)
})
