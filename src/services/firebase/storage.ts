import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from './config';
import { validateLoadedData } from '../../utils/validators';
import {
  FirebaseStorageError,
  type StorageKey,
  type StorageResult,
} from './types';
import { retryWithBackoff, createDataToSave } from './utils';

class FirebaseStorageManager {
  private userId: string | null = null;
  private unsubscribers: Record<string, () => void> = {};
  private initialized: boolean = false;

  private readonly RETRY_ATTEMPTS = 3;
  private readonly RETRY_BASE_DELAY = 1000;

  async initialize(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new FirebaseStorageError(
          'No authenticated user found',
          'NOT_AUTHENTICATED'
        );
      }

      this.userId = user.uid;
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      return false;
    }
  }

  private ensureUserIdSet(): void {
    if (!this.userId) {
      throw new Error('User ID is not set');
    }
  }

  async save(key: StorageKey, data: unknown): Promise<StorageResult> {
    if (!this.initialized) {
      const error = new FirebaseStorageError(
        'Cannot save data: Firebase not initialized',
        'NOT_INITIALIZED'
      );
      console.error(error.message);
      return { success: false, error };
    }

    try {
      this.ensureUserIdSet();
      const userId = this.userId!; // Safe after ensureUserIdSet()

      const docRef = doc(db, 'users', userId, 'data', key);
      const dataToSave = createDataToSave(data);

      if (import.meta.env.DEV) {
        console.log(`💾 Saving ${key} to Firebase...`, {
          path: `users/${userId}/data/${key}`,
          dataSize: data !== undefined ? JSON.stringify(data).length : 0,
        });
      }

      await retryWithBackoff(
        async () => await setDoc(docRef, dataToSave),
        this.RETRY_ATTEMPTS,
        this.RETRY_BASE_DELAY
      );

      if (import.meta.env.DEV) {
        console.log(`✅ Successfully saved ${key} to Firebase`);
      }
      return { success: true, error: null };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`❌ Error saving ${key} to Firebase:`, error);
      }
      const storageError = new FirebaseStorageError(
        `Failed to save ${key} after ${this.RETRY_ATTEMPTS} attempts`,
        'SAVE_ERROR',
        error
      );
      return { success: false, error: storageError };
    }
  }

  async load(key: StorageKey): Promise<StorageResult> {
    if (!this.initialized) {
      const error = new FirebaseStorageError(
        'Cannot load data: Firebase not initialized',
        'NOT_INITIALIZED'
      );
      console.error(error.message);
      return { success: false, data: null, error };
    }

    try {
      this.ensureUserIdSet();
      const userId = this.userId!; // Safe after ensureUserIdSet()

      const docRef = doc(db, 'users', userId, 'data', key);

      const docSnap = await retryWithBackoff(
        async () => await getDoc(docRef),
        this.RETRY_ATTEMPTS,
        this.RETRY_BASE_DELAY
      );

      if (docSnap.exists()) {
        const storedData = docSnap.data();
        if (!storedData) {
          const error = new FirebaseStorageError(
            `Document exists but data is null for ${key}`,
            'INVALID_DOCUMENT'
          );
          console.error(error.message);
          return { success: false, data: null, error };
        }

        const loadedData = storedData.data ?? null;

        const validation = validateLoadedData(loadedData, key);
        if (!validation.valid) {
          const error = new FirebaseStorageError(
            `Invalid data structure for ${key}: ${validation.error}`,
            'VALIDATION_ERROR'
          );
          console.error(error.message);
          return { success: false, data: null, error };
        }

        return { success: true, data: loadedData, error: null };
      }

      return { success: true, data: null, error: null };
    } catch (error) {
      console.error(`Error loading ${key} from Firebase:`, error);
      const storageError = new FirebaseStorageError(
        `Failed to load ${key} after ${this.RETRY_ATTEMPTS} attempts`,
        'LOAD_ERROR',
        error
      );
      return { success: false, data: null, error: storageError };
    }
  }

  subscribe(key: StorageKey, callback: (data: unknown) => void): () => void {
    if (!this.initialized || !this.userId) {
      console.error('Firebase not initialized or user ID not set');
      return () => {};
    }

    try {
      const docRef = doc(db, 'users', this.userId, 'data', key);

      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          const data = docSnap.exists() ? (docSnap.data()?.data ?? null) : null;
          callback(data);
        },
        (error) => {
          console.error(`Error subscribing to ${key}:`, error);
        }
      );

      this.unsubscribers[key] = unsubscribe;
      return unsubscribe;
    } catch (error) {
      console.error(`Error setting up subscription for ${key}:`, error);
      return () => {};
    }
  }

  unsubscribe(key: StorageKey): void {
    if (this.unsubscribers[key]) {
      this.unsubscribers[key]();
      delete this.unsubscribers[key];
    }
  }

  unsubscribeAll(): void {
    Object.keys(this.unsubscribers).forEach((key) => {
      this.unsubscribe(key as StorageKey);
    });
  }

  isUsingFirebase(): boolean {
    return this.initialized;
  }

  getUserId(): string | null {
    return this.userId;
  }
}

export const firebaseStorage = new FirebaseStorageManager();
