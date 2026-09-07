import { dirname, join } from 'path'

export const PRIMARY_PROJECT_INSTRUCTION_FILE = 'AGENTS.md'
export const QUANTUM_PROJECT_INSTRUCTION_FILE = 'QUANTUM.md'
export const FALLBACK_PROJECT_INSTRUCTION_FILE = 'CLAUDE.md'

export const PRIMARY_LOCAL_INSTRUCTION_FILE = 'QUANTUM.local.md'
export const FALLBACK_LOCAL_INSTRUCTION_FILE = 'CLAUDE.local.md'

export function getProjectInstructionFilePaths(dir: string): string[] {
  return [
    join(dir, PRIMARY_PROJECT_INSTRUCTION_FILE),
    join(dir, QUANTUM_PROJECT_INSTRUCTION_FILE),
    join(dir, FALLBACK_PROJECT_INSTRUCTION_FILE),
  ]
}

export function getLocalInstructionFilePaths(dir: string): string[] {
  return [
    join(dir, PRIMARY_LOCAL_INSTRUCTION_FILE),
    join(dir, FALLBACK_LOCAL_INSTRUCTION_FILE),
  ]
}

export function getProjectInstructionFilePath(
  dir: string,
  existsSync: (path: string) => boolean,
): string {
  for (const candidate of getProjectInstructionFilePaths(dir)) {
    if (existsSync(candidate)) {
      return candidate
    }
  }
  return join(dir, PRIMARY_PROJECT_INSTRUCTION_FILE)
}

export function getLocalInstructionFilePath(
  dir: string,
  existsSync: (path: string) => boolean,
): string {
  for (const candidate of getLocalInstructionFilePaths(dir)) {
    if (existsSync(candidate)) {
      return candidate
    }
  }
  return join(dir, PRIMARY_LOCAL_INSTRUCTION_FILE)
}

export function hasProjectInstructionFile(
  dir: string,
  existsSync: (path: string) => boolean,
): boolean {
  return getProjectInstructionFilePaths(dir).some(path => existsSync(path))
}

export function findProjectInstructionFilePathInAncestors(
  startDir: string,
  existsSync: (path: string) => boolean,
): string | null {
  let currentDir = startDir

  while (true) {
    if (hasProjectInstructionFile(currentDir, existsSync)) {
      return getProjectInstructionFilePath(currentDir, existsSync)
    }

    const parentDir = dirname(currentDir)
    if (parentDir === currentDir) {
      return null
    }

    currentDir = parentDir
  }
}

export function isProjectInstructionFileName(name: string): boolean {
  return (
    name === PRIMARY_PROJECT_INSTRUCTION_FILE ||
    name === QUANTUM_PROJECT_INSTRUCTION_FILE ||
    name === FALLBACK_PROJECT_INSTRUCTION_FILE
  )
}

export function isLocalInstructionFileName(name: string): boolean {
  return (
    name === PRIMARY_LOCAL_INSTRUCTION_FILE ||
    name === FALLBACK_LOCAL_INSTRUCTION_FILE
  )
}
