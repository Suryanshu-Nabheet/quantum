import { isEnvTruthy } from '../utils/envUtils.js'

export function isNewInitEnabled(): boolean {
  if (false) {
    return (
      process.env.USER_TYPE === 'ant' ||
      isEnvTruthy(process.env.QUANTUM_NEW_INIT)
    )
  }

  return false
}
