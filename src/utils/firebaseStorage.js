/**
 * Firebase Storage utility
 * Provides real-time syncing to Firestore with error handling, retry logic, and offline support
 */

import { doc, setDoc, getDoc, onSnapshot, enableIndexedDbPersistence } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { validateLoadedData } from './validators';

// Error types for better error handling
export class FirebaseStorageError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'FirebaseStorageError';
    this.code = code;
    this.originalError = originalError;
  }
}

class FirebaseStorageManager {
  constructor() {
    this.userId = null;
    this.unsubscribers = {};
    this.initialized = false;
    this.offlinePersistenceEnabled = false;
    this.retryAttempts = 3;
    this.retryDelay = 1000; // ms
    this.lastError = null;
    this.pendingOperations = [];
  }

  /**
   * Initialize Firebase auth and get/create user with offline persistence
   */
  async initialize() {
    try {
      // Enable offline persistence (only call once)
      if (!this.offlinePersistenceEnabled) {
        try {
          await enableIndexedDbPersistence(db);
          this.offlinePersistenceEnabled = true;
          console.log('Offline persistence enabled');
        } catch (err) {
          if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time
            console.warn('Offline persistence failed: Multiple tabs open');
          } else if (err.code === 'unimplemented') {
            // The current browser doesn't support persistence
            console.warn('Offline persistence not supported by this browser');
          } else {
            console.error('Error enabling offline persistence:', err);
          }
        }
      }

      // Sign in anonymously to get a user ID
      const userCredential = await signInAnonymously(auth);
      this.userId = userCredential.user.uid;
      this.initialized = true;
      this.lastError = null;
      return true;
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      this.lastError = new FirebaseStorageError(
        'Failed to initialize Firebase authentication',
        'INIT_ERROR',
        error
      );
      return false;
    }
  }

  /**
   * Get the user's document reference path
   */
  getUserDocPath(key) {
    if (!this.userId) {
      throw new Error('Firebase not initialized. Call initialize() first.');
    }
    // Firestore requires even number of path segments: collection/document/collection/document
    return `users/${this.userId}/data/${key}`;
  }

  /**
   * Retry a function with exponential backoff
   */
  async retryWithBackoff(fn, retries = this.retryAttempts) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error; // Last attempt failed
        const delay = this.retryDelay * Math.pow(2, i); // Exponential backoff
        console.warn(`Retry attempt ${i + 1}/${retries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Save data to Firestore with retry logic
   */
  async save(key, data) {
    if (!this.initialized) {
      const error = new FirebaseStorageError(
        'Cannot save data: Firebase not initialized',
        'NOT_INITIALIZED'
      );
      console.error(error.message);
      this.lastError = error;
      throw error;
    }

    try {
      const docPath = this.getUserDocPath(key);
      const docRef = doc(db, docPath);
      const dataToSave = {
        data: data,
        savedAt: new Date().toISOString(),
        version: '1.0.0',
      };

      await this.retryWithBackoff(async () => {
        await setDoc(docRef, dataToSave);
      });

      this.lastError = null;
      return { success: true, error: null };
    } catch (error) {
      console.error(`Error saving ${key} to Firebase:`, error);
      const storageError = new FirebaseStorageError(
        `Failed to save ${key} after ${this.retryAttempts} attempts`,
        'SAVE_ERROR',
        error
      );
      this.lastError = storageError;
      return { success: false, error: storageError };
    }
  }

  /**
   * Load data from Firestore with validation and retry logic
   */
  async load(key) {
    if (!this.initialized) {
      const error = new FirebaseStorageError(
        'Cannot load data: Firebase not initialized',
        'NOT_INITIALIZED'
      );
      console.error(error.message);
      this.lastError = error;
      return { success: false, data: null, error };
    }

    try {
      const docPath = this.getUserDocPath(key);
      const docRef = doc(db, docPath);

      const docSnap = await this.retryWithBackoff(async () => {
        return await getDoc(docRef);
      });

      if (docSnap.exists()) {
        const storedData = docSnap.data();
        const loadedData = storedData.data || null;

        // Validate the loaded data structure
        const validation = validateLoadedData(loadedData, key);
        if (!validation.valid) {
          const error = new FirebaseStorageError(
            `Invalid data structure for ${key}: ${validation.error}`,
            'VALIDATION_ERROR'
          );
          console.error(error.message);
          this.lastError = error;
          return { success: false, data: null, error };
        }

        this.lastError = null;
        return { success: true, data: loadedData, error: null };
      }

      // No data found is not an error
      this.lastError = null;
      return { success: true, data: null, error: null };
    } catch (error) {
      console.error(`Error loading ${key} from Firebase:`, error);
      const storageError = new FirebaseStorageError(
        `Failed to load ${key} after ${this.retryAttempts} attempts`,
        'LOAD_ERROR',
        error
      );
      this.lastError = storageError;
      return { success: false, data: null, error: storageError };
    }
  }

  /**
   * Get the last error that occurred
   */
  getLastError() {
    return this.lastError;
  }

  /**
   * Clear the last error
   */
  clearLastError() {
    this.lastError = null;
  }

  /**
   * Subscribe to real-time updates for a specific key
   */
  subscribe(key, callback) {
    if (!this.initialized) {
      console.error('Firebase not initialized');
      return () => {};
    }

    try {
      const docPath = this.getUserDocPath(key);
      const docRef = doc(db, docPath);

      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const storedData = docSnap.data();
          callback(storedData.data);
        } else {
          callback(null);
        }
      }, (error) => {
        console.error(`Error subscribing to ${key}:`, error);
      });

      // Store the unsubscriber
      this.unsubscribers[key] = unsubscribe;

      return unsubscribe;
    } catch (error) {
      console.error(`Error setting up subscription for ${key}:`, error);
      return () => {};
    }
  }

  /**
   * Unsubscribe from a specific key
   */
  unsubscribe(key) {
    if (this.unsubscribers[key]) {
      this.unsubscribers[key]();
      delete this.unsubscribers[key];
    }
  }

  /**
   * Unsubscribe from all listeners
   */
  unsubscribeAll() {
    Object.keys(this.unsubscribers).forEach(key => {
      this.unsubscribe(key);
    });
  }

  /**
   * Check if using Firebase storage (always true for this implementation)
   */
  isUsingFirebase() {
    return this.initialized;
  }

  /**
   * Get current user ID
   */
  getUserId() {
    return this.userId;
  }
}

export const firebaseStorage = new FirebaseStorageManager();
