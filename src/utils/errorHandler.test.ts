import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AppError,
  handleError,
  getErrorMessage,
  getErrorCode,
  formatFirebaseAuthError,
  withErrorHandling,
} from './errorHandler';

describe('errorHandler', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('AppError', () => {
    it('should create an AppError with message', () => {
      const error = new AppError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('AppError');
    });

    it('should create an AppError with code', () => {
      const error = new AppError('Test error', 'TEST_CODE');
      expect(error.code).toBe('TEST_CODE');
    });

    it('should create an AppError with context', () => {
      const context = { component: 'TestComponent', action: 'testAction' };
      const error = new AppError('Test error', 'TEST_CODE', context);
      expect(error.context).toEqual(context);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from AppError', () => {
      const error = new AppError('Custom error message');
      expect(getErrorMessage(error)).toBe('Custom error message');
    });

    it('should extract message from standard Error', () => {
      const error = new Error('Standard error');
      expect(getErrorMessage(error)).toBe('Standard error');
    });

    it('should handle string errors', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should extract message from object with message property', () => {
      const error = { message: 'Object error' };
      expect(getErrorMessage(error)).toBe('Object error');
    });

    it('should return default message for unknown error types', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred');
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
      expect(getErrorMessage(123)).toBe('An unexpected error occurred');
    });
  });

  describe('getErrorCode', () => {
    it('should extract code from AppError', () => {
      const error = new AppError('Error', 'TEST_CODE');
      expect(getErrorCode(error)).toBe('TEST_CODE');
    });

    it('should extract code from object with code property', () => {
      const error = { code: 'CUSTOM_CODE' };
      expect(getErrorCode(error)).toBe('CUSTOM_CODE');
    });

    it('should return undefined for errors without code', () => {
      expect(getErrorCode(new Error('No code'))).toBeUndefined();
      expect(getErrorCode('String error')).toBeUndefined();
      expect(getErrorCode(null)).toBeUndefined();
    });
  });

  describe('handleError', () => {
    it('should log error and return message', () => {
      const error = new Error('Test error');
      const message = handleError(error);

      expect(message).toBe('Test error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error:',
        expect.objectContaining({
          message: 'Test error',
          error,
        })
      );
    });

    it('should include context in log', () => {
      const error = new Error('Test error');
      const context = { component: 'TestComponent' };
      handleError(error, context);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error:',
        expect.objectContaining({
          context,
        })
      );
    });

    it('should handle AppError with code', () => {
      const error = new AppError('Custom error', 'CUSTOM_CODE');
      const message = handleError(error);

      expect(message).toBe('Custom error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error:',
        expect.objectContaining({
          code: 'CUSTOM_CODE',
        })
      );
    });
  });

  describe('formatFirebaseAuthError', () => {
    it('should format network error', () => {
      const error = { code: 'auth/network-request-failed' };
      const message = formatFirebaseAuthError(error);
      expect(message).toContain('Network error');
    });

    it('should format invalid email error', () => {
      const error = { code: 'auth/invalid-email' };
      const message = formatFirebaseAuthError(error);
      expect(message).toBe('Invalid email address.');
    });

    it('should format user-not-found error', () => {
      const error = { code: 'auth/user-not-found' };
      const message = formatFirebaseAuthError(error);
      expect(message).toBe('No account found with this email.');
    });

    it('should format wrong-password error', () => {
      const error = { code: 'auth/wrong-password' };
      const message = formatFirebaseAuthError(error);
      expect(message).toBe('Incorrect password.');
    });

    it('should format email-already-in-use error', () => {
      const error = { code: 'auth/email-already-in-use' };
      const message = formatFirebaseAuthError(error);
      expect(message).toBe('An account already exists with this email.');
    });

    it('should format weak-password error', () => {
      const error = { code: 'auth/weak-password' };
      const message = formatFirebaseAuthError(error);
      expect(message).toBe('Password should be at least 6 characters.');
    });

    it('should format too-many-requests error', () => {
      const error = { code: 'auth/too-many-requests' };
      const message = formatFirebaseAuthError(error);
      expect(message).toContain('Too many failed attempts');
    });

    it('should format invalid-credential error', () => {
      const error = { code: 'auth/invalid-credential' };
      const message = formatFirebaseAuthError(error);
      expect(message).toBe('Invalid email or password.');
    });

    it('should return original message for unknown error codes', () => {
      const error = { code: 'auth/unknown-error', message: 'Unknown error' };
      const message = formatFirebaseAuthError(error);
      expect(message).toBe('Unknown error');
    });

    it('should handle errors without code', () => {
      const error = new Error('Generic error');
      const message = formatFirebaseAuthError(error);
      expect(message).toBe('Generic error');
    });
  });

  describe('withErrorHandling', () => {
    it('should return data on success', async () => {
      const successFn = async () => 'success result';
      const result = await withErrorHandling(successFn);

      expect(result.data).toBe('success result');
      expect(result.error).toBeNull();
    });

    it('should return error on failure', async () => {
      const failFn = async () => {
        throw new Error('Test error');
      };
      const result = await withErrorHandling(failFn);

      expect(result.data).toBeNull();
      expect(result.error).toBe('Test error');
    });

    it('should include context when handling errors', async () => {
      const failFn = async () => {
        throw new Error('Test error');
      };
      const context = { component: 'TestComponent' };
      await withErrorHandling(failFn, context);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error:',
        expect.objectContaining({
          context,
        })
      );
    });

    it('should handle AppError correctly', async () => {
      const failFn = async () => {
        throw new AppError('Custom error', 'CUSTOM_CODE');
      };
      const result = await withErrorHandling(failFn);

      expect(result.data).toBeNull();
      expect(result.error).toBe('Custom error');
    });

    it('should handle non-Error objects', async () => {
      const failFn = async () => {
        throw 'String error';
      };
      const result = await withErrorHandling(failFn);

      expect(result.data).toBeNull();
      expect(result.error).toBe('String error');
    });
  });
});
