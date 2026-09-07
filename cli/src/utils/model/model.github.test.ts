import { afterEach, beforeEach, expect, test } from 'bun:test'

import { saveGlobalConfig } from '../config.js'
import { getDefaultMainLoopModelSetting, getUserSpecifiedModelSetting } from './model.js'

const env = {
  QUANTUM_USE_GITHUB: process.env.QUANTUM_USE_GITHUB,
  QUANTUM_USE_OPENAI: process.env.QUANTUM_USE_OPENAI,
  QUANTUM_USE_GEMINI: process.env.QUANTUM_USE_GEMINI,
  QUANTUM_USE_BEDROCK: process.env.QUANTUM_USE_BEDROCK,
  QUANTUM_USE_VERTEX: process.env.QUANTUM_USE_VERTEX,
  QUANTUM_USE_FOUNDRY: process.env.QUANTUM_USE_FOUNDRY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
}

beforeEach(() => {
  process.env.QUANTUM_USE_GITHUB = '1'
  delete process.env.QUANTUM_USE_OPENAI
  delete process.env.QUANTUM_USE_GEMINI
  delete process.env.QUANTUM_USE_BEDROCK
  delete process.env.QUANTUM_USE_VERTEX
  delete process.env.QUANTUM_USE_FOUNDRY
  delete process.env.OPENAI_MODEL
  saveGlobalConfig(current => ({
    ...current,
    model: ({ bad: true } as unknown) as string,
  }))
})

afterEach(() => {
  process.env.QUANTUM_USE_GITHUB = env.QUANTUM_USE_GITHUB
  process.env.QUANTUM_USE_OPENAI = env.QUANTUM_USE_OPENAI
  process.env.QUANTUM_USE_GEMINI = env.QUANTUM_USE_GEMINI
  process.env.QUANTUM_USE_BEDROCK = env.QUANTUM_USE_BEDROCK
  process.env.QUANTUM_USE_VERTEX = env.QUANTUM_USE_VERTEX
  process.env.QUANTUM_USE_FOUNDRY = env.QUANTUM_USE_FOUNDRY
  process.env.OPENAI_MODEL = env.OPENAI_MODEL
  saveGlobalConfig(current => ({
    ...current,
    model: undefined,
  }))
})

test('github default model setting ignores non-string saved model', () => {
  const model = getDefaultMainLoopModelSetting()
  expect(typeof model).toBe('string')
  expect(model).not.toBe('[object Object]')
  expect(model.length).toBeGreaterThan(0)
})

test('user specified model ignores non-string saved model', () => {
  const model = getUserSpecifiedModelSetting()
  if (model !== undefined && model !== null) {
    expect(typeof model).toBe('string')
    expect(model).not.toBe('[object Object]')
  }
})
