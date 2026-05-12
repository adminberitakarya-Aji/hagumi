import {
  createError,
  ErrorCode,
  getErrorSeverity,
  ErrorSeverity,
  getUserFriendlyMessage,
  isRecoverableError,
  withErrorHandling,
} from '@/shared/error/errorHandler'

describe('errorHandler utilities', () => {
  test('createError should return a structured AppError', () => {
    const error = createError(ErrorCode.VALIDATION_ERROR, 'Invalid input', 'Details about error')
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR)
    expect(error.message).toBe('Invalid input')
    expect(error.details).toBe('Details about error')
    expect(error.timestamp).toBeInstanceOf(Date)
  })

  test('getErrorSeverity should return correct severity for codes', () => {
    expect(getErrorSeverity(ErrorCode.INTERNAL_ERROR)).toBe(ErrorSeverity.CRITICAL)
    expect(getErrorSeverity(ErrorCode.AUTH_REQUIRED)).toBe(ErrorSeverity.HIGH)
    expect(getErrorSeverity(ErrorCode.INVALID_INPUT)).toBe(ErrorSeverity.MEDIUM)
    expect(getErrorSeverity(ErrorCode.NOT_FOUND)).toBe(ErrorSeverity.LOW)
  })

  test('isRecoverableError should identify recoverable errors', () => {
    const recoverable = createError(ErrorCode.VALIDATION_ERROR, 'Error')
    const nonRecoverable = createError(ErrorCode.INTERNAL_ERROR, 'Critical')
    
    expect(isRecoverableError(recoverable)).toBe(true)
    expect(isRecoverableError(nonRecoverable)).toBe(false)
  })

  test('getUserFriendlyMessage should return mapped messages', () => {
    const error = createError(ErrorCode.AUTH_REQUIRED, 'Original message')
    expect(getUserFriendlyMessage(error)).toBe('Please log in to continue')
    
    const unknownError = createError('UNKNOWN' as any, 'Custom message')
    expect(getUserFriendlyMessage(unknownError)).toBe('Custom message')
  })

  test('withErrorHandling should catch errors and return structured response', async () => {
    const successFn = async () => 'success'
    const result = await withErrorHandling(successFn)
    expect(result.data).toBe('success')
    expect(result.error).toBeNull()

    const failFn = async () => { throw new Error('failure') }
    const failResult = await withErrorHandling(failFn)
    expect(failResult.data).toBeNull()
    expect(failResult.error?.message).toBe('failure')
    expect(failResult.error?.code).toBe(ErrorCode.INTERNAL_ERROR)
  })
})
