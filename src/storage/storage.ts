import type { Session } from '../features/queue/queueTypes';

export interface StorageAdapter {
  loadSession(): Session | null;
  saveSession(session: Session): void;
  clearSession(): void;
}

export const STORAGE_KEYS = {
  activeSession: 'gqueue:active-session',
  sessionHistory: 'gqueue:sessions',
  settings: 'gqueue:settings',
  schemaVersion: 'gqueue:schema-version',
} as const;
