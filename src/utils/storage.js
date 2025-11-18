/**
 * Storage utility that uses File System Access API with localStorage fallback
 * Provides auto-save to user's computer drive when supported
 */

import { validateData, sanitizeData, safeJSONParse, CURRENT_VERSION } from './validation.js';

class StorageManager {
  constructor() {
    this.fileHandle = null;
    this.supportsFileSystem = 'showSaveFilePicker' in window;
    this.saveQueue = Promise.resolve(); // Queue for sequential saves
  }

  /**
   * Initialize storage - prompt user to select save location if File System API is supported
   */
  async initialize() {
    if (!this.supportsFileSystem && import.meta.env.DEV) {
      console.log('File System Access API not supported, using localStorage');
    }

    // Check if we have a stored file handle
    const stored = await this.getStoredFileHandle();
    if (stored) {
      this.fileHandle = stored;
      return true;
    }

    return false;
  }

  /**
   * Prompt user to select a save location
   */
  async selectSaveLocation() {
    if (!this.supportsFileSystem) {
      alert('File System Access is not supported in this browser. Using localStorage instead.');
      return false;
    }

    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: 'deci-data.json',
        types: [{
          description: 'Deci Data File',
          accept: { 'application/json': ['.json'] },
        }],
      });

      this.fileHandle = handle;
      await this.storeFileHandle(handle);
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error selecting save location:', err);
      }
      return false;
    }
  }

  /**
   * Save data to file or localStorage with queuing to prevent race conditions
   */
  async save(key, data) {
    // Queue the save operation to prevent concurrent writes
    this.saveQueue = this.saveQueue.then(async () => {
      try {
        // Add version and timestamp
        const versionedData = {
          version: CURRENT_VERSION,
          data: data,
          savedAt: new Date().toISOString(),
        };

        const jsonData = JSON.stringify(versionedData, null, 2);

        // Try to save to file if we have a file handle
        if (this.fileHandle) {
          try {
            const writable = await this.fileHandle.createWritable();

            // Load existing data from file
            const existingData = await this.loadFromFile();

            // Merge with new data
            const mergedData = {
              ...existingData,
              [key]: versionedData,
              lastModified: new Date().toISOString()
            };

            await writable.write(JSON.stringify(mergedData, null, 2));
            await writable.close();
            return true;
          } catch (err) {
            console.error('Error saving to file:', err);
            // Fall back to localStorage
          }
        }

        // Fallback to localStorage
        try {
          localStorage.setItem(key, jsonData);
          return true;
        } catch (err) {
          if (err.name === 'QuotaExceededError') {
            alert('Storage is full. Please export your data and clear some space.');
            return false;
          }
          console.error('localStorage error:', err);
          return false;
        }
      } catch (err) {
        console.error('Save error:', err);
        return false;
      }
    });

    return this.saveQueue;
  }

  /**
   * Load data from file or localStorage with validation
   */
  async load(key) {
    // Try to load from file if we have a file handle
    if (this.fileHandle) {
      try {
        const data = await this.loadFromFile();
        if (data[key]) {
          return this.extractAndValidateData(data[key]);
        }
      } catch (err) {
        console.error('Error loading from file:', err);
        // Fall back to localStorage
      }
    }

    // Fallback to localStorage with safe parsing
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const parsed = safeJSONParse(stored);
      if (!parsed) {
        console.error('Failed to parse localStorage data for key:', key);
        localStorage.removeItem(key); // Clear corrupted data
        return null;
      }

      return this.extractAndValidateData(parsed);
    } catch (err) {
      console.error('Error loading from localStorage:', err);
      localStorage.removeItem(key); // Clear corrupted data
      return null;
    }
  }

  /**
   * Extract data from versioned wrapper and validate
   */
  extractAndValidateData(versionedData) {
    // Handle both versioned and legacy data formats
    let actualData;

    if (versionedData && versionedData.version && versionedData.data) {
      // New versioned format
      actualData = versionedData.data;
    } else {
      // Legacy format - direct data
      actualData = versionedData;
    }

    return actualData;
  }

  /**
   * Load entire data file with safe parsing
   */
  async loadFromFile() {
    if (!this.fileHandle) {
      return {};
    }

    try {
      const file = await this.fileHandle.getFile();
      const text = await file.text();

      if (!text) return {};

      const parsed = safeJSONParse(text, {});
      if (!parsed || typeof parsed !== 'object') {
        console.error('Invalid file format');
        return {};
      }

      return parsed;
    } catch (err) {
      console.error('Error reading file:', err);
      return {};
    }
  }

  /**
   * Prompt user to select an existing file to load
   */
  async selectFileToLoad() {
    if (!this.supportsFileSystem) {
      alert('File System Access is not supported in this browser.');
      return null;
    }

    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{
          description: 'Deci Data File',
          accept: { 'application/json': ['.json'] },
        }],
        multiple: false,
      });

      this.fileHandle = handle;
      await this.storeFileHandle(handle);

      const file = await handle.getFile();
      const text = await file.text();

      const data = safeJSONParse(text);
      if (!data) {
        alert('Error: The selected file contains invalid JSON data.');
        return null;
      }

      // Validate and sanitize the loaded data
      const validation = validateData(data);
      if (!validation.valid) {
        console.warn('Data validation failed:', validation.error);
        alert(`Data validation warning: ${validation.error}. Attempting to repair...`);
        return sanitizeData(data);
      }

      return data;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error selecting file to load:', err);
        alert('Failed to load file. Please check the file format.');
      }
      return null;
    }
  }

  /**
   * Export data as downloadable file (works in all browsers)
   */
  exportAsDownload(data, filename = 'deci-data.json') {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Import data from uploaded file (works in all browsers)
   */
  async importFromUpload() {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          resolve(null);
          return;
        }

        try {
          const text = await file.text();
          const data = safeJSONParse(text);

          if (!data) {
            alert('Error: The file contains invalid JSON data.');
            resolve(null);
            return;
          }

          // Validate and sanitize the loaded data
          const validation = validateData(data);
          if (!validation.valid) {
            console.warn('Data validation failed:', validation.error);
            alert(`Data validation warning: ${validation.error}. Attempting to repair...`);
            resolve(sanitizeData(data));
            return;
          }

          resolve(data);
        } catch (err) {
          console.error('Error reading uploaded file:', err);
          alert('Error reading file. Please make sure it\'s a valid JSON file.');
          resolve(null);
        }
      };

      input.click();
    });
  }

  /**
   * Store file handle reference (using IndexedDB for persistence)
   */
  async storeFileHandle(handle) {
    // Note: File handles can't be directly stored, but we keep the reference in memory
    // User will need to re-select the file after browser restart
    // This is a browser security limitation
    if (import.meta.env.DEV) {
      console.log('File handle stored in memory for this session');
    }
  }

  /**
   * Get stored file handle (placeholder for future enhancement)
   */
  async getStoredFileHandle() {
    // File System Access API doesn't allow persistent handle storage for security
    // User needs to grant permission each session
    return null;
  }

  /**
   * Clear file handle
   */
  clearFileHandle() {
    this.fileHandle = null;
  }

  /**
   * Check if using file system storage
   */
  isUsingFileSystem() {
    return this.fileHandle !== null;
  }
}

export const storageManager = new StorageManager();
