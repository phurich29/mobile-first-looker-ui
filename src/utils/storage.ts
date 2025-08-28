/**
 * Safe localStorage wrapper that handles iOS PWA security restrictions
 * iOS can block localStorage access in certain contexts, causing "operation is insecure" errors
 */
class SafeStorage {
  private fallbackStorage = new Map<string, string>();
  private isStorageAvailable: boolean;

  constructor() {
    this.isStorageAvailable = this.checkStorageAvailability();
  }

  private checkStorageAvailability(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      console.warn('localStorage not available, using fallback storage');
      return false;
    }
  }

  getItem(key: string): string | null {
    try {
      if (this.isStorageAvailable) {
        return localStorage.getItem(key);
      }
      return this.fallbackStorage.get(key) || null;
    } catch (error) {
      console.warn(`Failed to get item "${key}" from storage:`, error);
      return this.fallbackStorage.get(key) || null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      if (this.isStorageAvailable) {
        localStorage.setItem(key, value);
      }
      // Always keep fallback in sync
      this.fallbackStorage.set(key, value);
    } catch (error) {
      console.warn(`Failed to set item "${key}" in storage:`, error);
      this.fallbackStorage.set(key, value);
    }
  }

  removeItem(key: string): void {
    try {
      if (this.isStorageAvailable) {
        localStorage.removeItem(key);
      }
      this.fallbackStorage.delete(key);
    } catch (error) {
      console.warn(`Failed to remove item "${key}" from storage:`, error);
      this.fallbackStorage.delete(key);
    }
  }

  clear(): void {
    try {
      if (this.isStorageAvailable) {
        localStorage.clear();
      }
      this.fallbackStorage.clear();
    } catch (error) {
      console.warn('Failed to clear storage:', error);
      this.fallbackStorage.clear();
    }
  }

  key(index: number): string | null {
    try {
      if (this.isStorageAvailable) {
        return localStorage.key(index);
      }
      const keys = Array.from(this.fallbackStorage.keys());
      return keys[index] || null;
    } catch (error) {
      console.warn(`Failed to get key at index ${index}:`, error);
      return null;
    }
  }

  get length(): number {
    try {
      if (this.isStorageAvailable) {
        return localStorage.length;
      }
      return this.fallbackStorage.size;
    } catch (error) {
      console.warn('Failed to get storage length:', error);
      return this.fallbackStorage.size;
    }
  }
}

export const safeStorage = new SafeStorage();

/**
 * Safe wrapper for localStorage operations that handles iOS PWA restrictions
 * Use this instead of direct localStorage access to prevent "operation is insecure" errors
 */
export const storage = {
  getItem: (key: string) => safeStorage.getItem(key),
  setItem: (key: string, value: string) => safeStorage.setItem(key, value),
  removeItem: (key: string) => safeStorage.removeItem(key),
  clear: () => safeStorage.clear(),
  key: (index: number) => safeStorage.key(index),
  get length() { return safeStorage.length; }
};
