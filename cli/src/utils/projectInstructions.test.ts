import { describe, expect, test } from 'bun:test'
import { join } from 'node:path'

import {
  findProjectInstructionFilePathInAncestors,
  FALLBACK_LOCAL_INSTRUCTION_FILE,
  FALLBACK_PROJECT_INSTRUCTION_FILE,
  getLocalInstructionFilePath,
  getProjectInstructionFilePath,
  getProjectInstructionFilePaths,
  hasProjectInstructionFile,
  isLocalInstructionFileName,
  isProjectInstructionFileName,
  PRIMARY_LOCAL_INSTRUCTION_FILE,
  PRIMARY_PROJECT_INSTRUCTION_FILE,
  QUANTUM_PROJECT_INSTRUCTION_FILE,
} from './projectInstructions.js'

describe('projectInstructions', () => {
  test('prefers AGENTS.md over QUANTUM.md and CLAUDE.md', () => {
    const dir = '/repo'
    const existingPaths = new Set([
      join(dir, PRIMARY_PROJECT_INSTRUCTION_FILE),
      join(dir, QUANTUM_PROJECT_INSTRUCTION_FILE),
      join(dir, FALLBACK_PROJECT_INSTRUCTION_FILE),
    ])
    expect(
      getProjectInstructionFilePath(dir, path => existingPaths.has(path)),
    ).toBe(join(dir, PRIMARY_PROJECT_INSTRUCTION_FILE))
  })

  test('prefers QUANTUM.md over CLAUDE.md when AGENTS.md is absent', () => {
    const dir = '/repo'
    const existingPaths = new Set([
      join(dir, QUANTUM_PROJECT_INSTRUCTION_FILE),
      join(dir, FALLBACK_PROJECT_INSTRUCTION_FILE),
    ])
    expect(
      getProjectInstructionFilePath(dir, path => existingPaths.has(path)),
    ).toBe(join(dir, QUANTUM_PROJECT_INSTRUCTION_FILE))
  })

  test('falls back to CLAUDE.md when AGENTS.md and QUANTUM.md are absent', () => {
    const dir = '/repo'
    const existingPaths = new Set([join(dir, FALLBACK_PROJECT_INSTRUCTION_FILE)])
    expect(
      getProjectInstructionFilePath(dir, path => existingPaths.has(path)),
    ).toBe(join(dir, FALLBACK_PROJECT_INSTRUCTION_FILE))
  })

  test('defaults to AGENTS.md when no root instruction file exists', () => {
    const dir = '/repo'
    expect(getProjectInstructionFilePath(dir, () => false)).toBe(
      join(dir, PRIMARY_PROJECT_INSTRUCTION_FILE),
    )
  })

  test('returns candidate root instruction paths in preference order', () => {
    const dir = '/repo'
    expect(getProjectInstructionFilePaths(dir)).toEqual([
      join(dir, PRIMARY_PROJECT_INSTRUCTION_FILE),
      join(dir, QUANTUM_PROJECT_INSTRUCTION_FILE),
      join(dir, FALLBACK_PROJECT_INSTRUCTION_FILE),
    ])
  })

  test('prefers QUANTUM.local.md over CLAUDE.local.md', () => {
    const dir = '/repo'
    const existingPaths = new Set([
      join(dir, PRIMARY_LOCAL_INSTRUCTION_FILE),
      join(dir, FALLBACK_LOCAL_INSTRUCTION_FILE),
    ])
    expect(
      getLocalInstructionFilePath(dir, path => existingPaths.has(path)),
    ).toBe(join(dir, PRIMARY_LOCAL_INSTRUCTION_FILE))
  })

  test('falls back to CLAUDE.local.md when QUANTUM.local.md is absent', () => {
    const dir = '/repo'
    const existingPaths = new Set([join(dir, FALLBACK_LOCAL_INSTRUCTION_FILE)])
    expect(
      getLocalInstructionFilePath(dir, path => existingPaths.has(path)),
    ).toBe(join(dir, FALLBACK_LOCAL_INSTRUCTION_FILE))
  })

  test('detects whether a repo instruction file exists', () => {
    const dir = '/repo'
    const existingPaths = new Set([join(dir, PRIMARY_PROJECT_INSTRUCTION_FILE)])
    expect(hasProjectInstructionFile(dir, path => existingPaths.has(path))).toBe(
      true,
    )
    expect(hasProjectInstructionFile(dir, () => false)).toBe(false)
  })

  test('recognizes Quantum and legacy root instruction filenames', () => {
    expect(isProjectInstructionFileName(PRIMARY_PROJECT_INSTRUCTION_FILE)).toBe(
      true,
    )
    expect(isProjectInstructionFileName(QUANTUM_PROJECT_INSTRUCTION_FILE)).toBe(
      true,
    )
    expect(isProjectInstructionFileName(FALLBACK_PROJECT_INSTRUCTION_FILE)).toBe(
      true,
    )
    expect(isLocalInstructionFileName(PRIMARY_LOCAL_INSTRUCTION_FILE)).toBe(true)
    expect(isLocalInstructionFileName(FALLBACK_LOCAL_INSTRUCTION_FILE)).toBe(
      true,
    )
    expect(isProjectInstructionFileName('README.md')).toBe(false)
  })

  test('finds repo instructions in ancestor directories', () => {
    const repoDir = '/repo'
    const nestedDir = join(repoDir, 'packages', 'app')
    const existingPaths = new Set([join(repoDir, PRIMARY_PROJECT_INSTRUCTION_FILE)])
    expect(
      findProjectInstructionFilePathInAncestors(
        nestedDir,
        path => existingPaths.has(path),
      ),
    ).toBe(join(repoDir, PRIMARY_PROJECT_INSTRUCTION_FILE))
  })

  test('prefers the closest ancestor project instruction file', () => {
    const repoDir = '/repo'
    const nestedProjectDir = join(repoDir, 'packages', 'app')
    const existingPaths = new Set([
      join(repoDir, PRIMARY_PROJECT_INSTRUCTION_FILE),
      join(nestedProjectDir, FALLBACK_PROJECT_INSTRUCTION_FILE),
    ])
    expect(
      findProjectInstructionFilePathInAncestors(
        join(nestedProjectDir, 'src'),
        path => existingPaths.has(path),
      ),
    ).toBe(join(nestedProjectDir, FALLBACK_PROJECT_INSTRUCTION_FILE))
  })

  test('returns null when no ancestor repo instruction file exists', () => {
    expect(
      findProjectInstructionFilePathInAncestors('/repo/packages/app', () => false),
    ).toBeNull()
  })
})
