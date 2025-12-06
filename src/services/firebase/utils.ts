import type { FirebaseErrorType } from './types';

export function isFirebaseError(error: unknown): error is FirebaseErrorType {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as FirebaseErrorType).code === 'string' &&
    typeof (error as FirebaseErrorType).message === 'string'
  );
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i); // exponential backoff
      console.warn(`Retry attempt ${i + 1}/${retries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Retry failed');
}

function removeUndefinedValues(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedValues(item));
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = removeUndefinedValues(value);
      }
    }
    return result;
  }

  return obj;
}

export function createDataToSave(data: unknown) {
  return {
    data: removeUndefinedValues(data),
    savedAt: new Date().toISOString(),
    version: '1.0.0',
  };
}
