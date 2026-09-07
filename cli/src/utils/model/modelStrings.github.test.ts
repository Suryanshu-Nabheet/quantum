import { afterEach, expect, test } from 'bun:test'

import { resetModelStringsForTestingOnly } from '../../bootstrap/state.js'
import { parseUserSpecifiedModel } from './model.js'
import { getModelStrings } from './modelStrings.js'

const originalEnv = {
  QUANTUM_USE_GITHUB: process.env.QUANTUM_USE_GITHUB,
  QUANTUM_USE_OPENAI: process.env.QUANTUM_USE_OPENAI,
  QUANTUM_USE_GEMINI: process.env.QUANTUM_USE_GEMINI,
  QUANTUM_USE_BEDROCK: process.env.QUANTUM_USE_BEDROCK,
  QUANTUM_USE_VERTEX: process.env.QUANTUM_USE_VERTEX,
  QUANTUM_USE_FOUNDRY: process.env.QUANTUM_USE_FOUNDRY,
}

function clearProviderFlags(): void {
  delete process.env.QUANTUM_USE_GITHUB
  delete process.env.QUANTUM_USE_OPENAI
  delete process.env.QUANTUM_USE_GEMINI
  delete process.env.QUANTUM_USE_BEDROCK
  delete process.env.QUANTUM_USE_VERTEX
  delete process.env.QUANTUM_USE_FOUNDRY
}

afterEach(() => {
  process.env.QUANTUM_USE_GITHUB = originalEnv.QUANTUM_USE_GITHUB
  process.env.QUANTUM_USE_OPENAI = originalEnv.QUANTUM_USE_OPENAI
  process.env.QUANTUM_USE_GEMINI = originalEnv.QUANTUM_USE_GEMINI
  process.env.QUANTUM_USE_BEDROCK = originalEnv.QUANTUM_USE_BEDROCK
  process.env.QUANTUM_USE_VERTEX = originalEnv.QUANTUM_USE_VERTEX
  process.env.QUANTUM_USE_FOUNDRY = originalEnv.QUANTUM_USE_FOUNDRY
  resetModelStringsForTestingOnly()
})

test('GitHub provider model strings are concrete IDs', () => {
  clearProviderFlags()
  process.env.QUANTUM_USE_GITHUB = '1'

  const modelStrings = getModelStrings()

  for (const value of Object.values(modelStrings)) {
    expect(typeof value).toBe('string')
    expect(value.trim().length).toBeGreaterThan(0)
  }
})

test('GitHub provider model strings are safe to parse', () => {
  clearProviderFlags()
  process.env.QUANTUM_USE_GITHUB = '1'

  const modelStrings = getModelStrings()

  expect(() => parseUserSpecifiedModel(modelStrings.sonnet46 as any)).not.toThrow()
})
