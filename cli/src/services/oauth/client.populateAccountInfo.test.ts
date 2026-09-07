import { expect, test } from 'bun:test'
import { shouldRefreshOAuthAccountInfo } from './client.js'

test('OAuth account info population does not refresh when the consumer product auth is inactive', () => {
  expect(
    shouldRefreshOAuthAccountInfo({
      hasCompleteAccountInfo: false,
      isQuantumSubscriber: false,
      hasProfileScope: true,
    }),
  ).toBe(false)
})

test('OAuth account info population still refreshes active the consumer product auth', () => {
  expect(
    shouldRefreshOAuthAccountInfo({
      hasCompleteAccountInfo: false,
      isQuantumSubscriber: true,
      hasProfileScope: true,
    }),
  ).toBe(true)
})

test('OAuth account info population skips refresh when profile scope is missing', () => {
  expect(
    shouldRefreshOAuthAccountInfo({
      hasCompleteAccountInfo: false,
      isQuantumSubscriber: true,
      hasProfileScope: false,
    }),
  ).toBe(false)
})

test('OAuth account info population skips refresh when account info is complete', () => {
  expect(
    shouldRefreshOAuthAccountInfo({
      hasCompleteAccountInfo: true,
      isQuantumSubscriber: true,
      hasProfileScope: true,
    }),
  ).toBe(false)
})
