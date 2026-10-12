import type { Session } from '../features/queue/queueTypes';
import type { StorageAdapter } from './storage';
import { STORAGE_KEYS } from './storage';

const SCHEMA_VERSION = '1';

export const localStorageAdapter: StorageAdapter = {
  loadSession(): Session | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const stored = window.localStorage.getItem(STORAGE_KEYS.activeSession);
    if (!stored) {
      return null;
    }

    try {
      const parsed = JSON.parse(stored) as Session;
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  },

  saveSession(session: Session): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.activeSession, JSON.stringify(session));
    window.localStorage.setItem(STORAGE_KEYS.schemaVersion, SCHEMA_VERSION);
  },

  clearSession(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEYS.activeSession);
    window.localStorage.removeItem(STORAGE_KEYS.schemaVersion);
  },
};
