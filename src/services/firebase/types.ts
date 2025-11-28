export type StorageKey = 'cards' | 'dailyDeck' | 'templates' | 'dayCompletions' | 'userStreak';

export interface FirebaseErrorType {
  code: string;
  message: string;
}

export interface StorageResult<T = unknown> {
  success: boolean;
  data?: T | null;
  error: FirebaseStorageError | null;
}

export class FirebaseStorageError extends Error {
  code: string;
  originalError: unknown;

  constructor(message: string, code: string, originalError: unknown = null) {
    super(message);
    this.name = 'FirebaseStorageError';
    this.code = code;
    this.originalError = originalError;
  }
}
