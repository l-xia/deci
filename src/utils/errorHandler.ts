export interface ErrorContext {
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public context?: ErrorContext
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Centralized error handler that logs errors
 */
export function handleError(
  error: unknown,
  context: ErrorContext = {}
): string {
  const errorMessage = getErrorMessage(error);
  const errorCode = getErrorCode(error);

  // Log to console for debugging
  console.error('Error:', {
    message: errorMessage,
    code: errorCode,
    context,
    error,
  });

  return errorMessage;
}

/**
 * Extract a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'An unexpected error occurred';
}

/**
 * Extract error code from various error types
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof AppError) {
    return error.code;
  }

  if (error && typeof error === 'object' && 'code' in error) {
    return String(error.code);
  }

  return undefined;
}

/**
 * Format Firebase Auth errors into user-friendly messages
 */
export function formatFirebaseAuthError(error: unknown): string {
  const code = getErrorCode(error);
  const originalMessage = getErrorMessage(error);

  // Network-related errors
  if (code === 'auth/network-request-failed') {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Common auth errors
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
    'auth/internal-error': 'An internal error occurred. Please try again.',
    'auth/invalid-credential': 'Invalid email or password.',
  };

  return code ? (errorMessages[code] || originalMessage) : originalMessage;
}

/**
 * Async error handler that wraps async functions and handles errors
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: ErrorContext = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const errorMessage = handleError(error, context);
    return { data: null, error: errorMessage };
  }
}
