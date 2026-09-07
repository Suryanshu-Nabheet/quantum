import { afterEach, expect, test } from 'bun:test'

// MACRO is replaced at build time by Bun.define but not in test mode.
// Define it globally so tests that import modules using MACRO don't crash.
;(globalThis as Record<string, unknown>).MACRO = {
  VERSION: '99.0.0',
  DISPLAY_VERSION: '0.0.0-test',
  BUILD_TIME: new Date().toISOString(),
  ISSUES_EXPLAINER: 'report the issue at https://github.com/SuryanshuNabheet/quantum/issues',
  PACKAGE_URL: 'quantum',
  NATIVE_PACKAGE_URL: undefined,
}

import { clearSystemPromptSections } from './systemPromptSections.js'
import { getSystemPrompt, DEFAULT_AGENT_PROMPT } from './prompts.js'
import { CLI_SYSPROMPT_PREFIXES, getCLISyspromptPrefix } from './system.js'
import { QUANTUM_GUIDE_AGENT } from '../tools/AgentTool/built-in/quantumGuideAgent.js'
import { GENERAL_PURPOSE_AGENT } from '../tools/AgentTool/built-in/generalPurposeAgent.js'
import { EXPLORE_AGENT } from '../tools/AgentTool/built-in/exploreAgent.js'
import { PLAN_AGENT } from '../tools/AgentTool/built-in/planAgent.js'
import { STATUSLINE_SETUP_AGENT } from '../tools/AgentTool/built-in/statuslineSetup.js'

const originalSimpleEnv = process.env.QUANTUM_SIMPLE

afterEach(() => {
  process.env.QUANTUM_SIMPLE = originalSimpleEnv
  clearSystemPromptSections()
})

function expectQuantumIdentity(text: string): void {
  expect(text).toContain('Quantum')
  expect(text).not.toContain('Claude Code')
  expect(text).not.toContain('OpenClaude')
  expect(text).not.toContain("Anthropic's official CLI for Claude")
}

test('CLI identity prefixes describe Quantum, not Claude Code', () => {
  expectQuantumIdentity(getCLISyspromptPrefix())

  for (const prefix of CLI_SYSPROMPT_PREFIXES) {
    expectQuantumIdentity(prefix)
  }
})

test('simple mode identity describes Quantum, not Claude Code', async () => {
  process.env.QUANTUM_SIMPLE = '1'

  const prompt = await getSystemPrompt([], 'gpt-4o')
  expectQuantumIdentity(prompt[0] ?? '')
})

test('system prompt model identity updates when model changes mid-session', async () => {
  delete process.env.QUANTUM_SIMPLE
  clearSystemPromptSections()

  const firstPrompt = await getSystemPrompt([], 'old-test-model')
  const secondPrompt = await getSystemPrompt([], 'new-test-model')

  const firstText = firstPrompt.join('\n')
  const secondText = secondPrompt.join('\n')

  expect(firstText).toContain('You are powered by the model old-test-model.')
  expect(secondText).toContain('You are powered by the model new-test-model.')
  expect(secondText).not.toContain('You are powered by the model old-test-model.')
})

test('built-in agent prompts describe Quantum, not Claude Code', () => {
  expectQuantumIdentity(DEFAULT_AGENT_PROMPT)

  const generalPrompt = GENERAL_PURPOSE_AGENT.getSystemPrompt({
    toolUseContext: { options: {} as never },
  })
  expectQuantumIdentity(generalPrompt)

  const explorePrompt = EXPLORE_AGENT.getSystemPrompt({
    toolUseContext: { options: {} as never },
  })
  expectQuantumIdentity(explorePrompt)

  const planPrompt = PLAN_AGENT.getSystemPrompt({
    toolUseContext: { options: {} as never },
  })
  expectQuantumIdentity(planPrompt)

  const statuslinePrompt = STATUSLINE_SETUP_AGENT.getSystemPrompt({
    toolUseContext: { options: {} as never },
  })
  expectQuantumIdentity(statuslinePrompt)

  const guidePrompt = QUANTUM_GUIDE_AGENT.getSystemPrompt({
    toolUseContext: {
      options: {
        commands: [],
        agentDefinitions: { activeAgents: [] },
        mcpClients: [],
      } as never,
    },
  })
  expectQuantumIdentity(guidePrompt)
  expect(guidePrompt).toContain('You are the Quantum guide agent.')
  expect(guidePrompt).toContain('**Quantum** (the CLI tool)')
  expect(guidePrompt).not.toContain('You are the Claude guide agent.')
})
