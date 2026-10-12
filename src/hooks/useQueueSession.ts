import { useCallback, useEffect, useState } from 'react';
import type { Session, SessionFormInput } from '../features/queue/queueTypes';
import { createSession, startSession } from '../features/queue/queueRules';
import { localStorageAdapter } from '../storage/localStorageAdapter';

export function useQueueSession() {
  const [session, setSession] = useState<Session | null>(() => localStorageAdapter.loadSession());

  const persist = useCallback((nextSession: Session | null) => {
    setSession(nextSession);

    if (!nextSession) {
      localStorageAdapter.clearSession();
      return;
    }

    localStorageAdapter.saveSession(nextSession);
  }, []);

  useEffect(() => {
    if (session) {
      localStorageAdapter.saveSession(session);
    }
  }, [session]);

  const createNewSession = useCallback((input: SessionFormInput) => {
    const fresh = createSession(input);
    persist(fresh);
    return fresh;
  }, [persist]);

  const start = useCallback(() => {
    if (!session) {
      return null;
    }

    const next = startSession(session);
    persist(next);
    return next;
  }, [persist, session]);

  const updateSession = useCallback((nextSession: Session | null) => {
    persist(nextSession);
  }, [persist]);

  const clearSession = useCallback(() => {
    persist(null);
  }, [persist]);

  return {
    session,
    createNewSession,
    updateSession,
    start,
    clearSession,
  };
}
