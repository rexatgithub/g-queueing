import { useEffect, useMemo, useState } from 'react';
import {
  addPlayer,
  advanceGame,
  getQueueSections,
  getTimerSnapshot,
  movePlayerToEnd,
  pauseSession,
  promotePlayer,
  removePlayer,
  renamePlayer,
  resumeSession,
  startSession,
  undoAdvance,
} from '../features/queue/queueRules';
import type { Player, Session } from '../features/queue/queueTypes';

interface UseActiveQueueOptions {
  session: Session;
  updateSession: (session: Session | null) => void;
  clearSession: () => void;
}

export function useActiveQueue({ session, updateSession, clearSession }: UseActiveQueueOptions) {
  const [playerName, setPlayerName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const timerState = useMemo(() => getTimerSnapshot(session, now), [now, session]);
  const queue = useMemo(() => getQueueSections(session), [session]);

  const handleAddPlayer = () => {
    if (!playerName.trim()) {
      setErrorMessage('Add a player name before submitting.');
      return;
    }

    updateSession(addPlayer(session, playerName));
    setPlayerName('');
    setErrorMessage('');
  };

  const handleStart = () => updateSession(startSession(session));

  const handlePauseResume = () => {
    if (session.status === 'setup') {
      updateSession(startSession(session));
    } else if (session.status === 'active') {
      updateSession(pauseSession(session));
    } else if (session.status === 'paused') {
      updateSession(resumeSession(session));
    }
  };

  const handleAdvance = () => updateSession(advanceGame(session));

  const handleUndo = () => {
    if (session.lastAdvanceSnapshot) {
      updateSession(undoAdvance(session));
    }
  };

  const handleReset = () => {
    clearSession();
    setPlayerName('');
    setErrorMessage('');
  };

  const promptRename = (player: Player) => {
    const nextName = window.prompt('Rename player', player.name);
    if (nextName) {
      updateSession(renamePlayer(session, player.id, nextName));
    }
  };

  const handleMoveToEnd = (playerId: string) => updateSession(movePlayerToEnd(session, playerId));
  const handlePromote = (playerId: string) => updateSession(promotePlayer(session, playerId));
  const handleRemove = (playerId: string) => updateSession(removePlayer(session, playerId));

  return {
    timerState,
    queue,
    playerName,
    setPlayerName,
    errorMessage,
    handleAddPlayer,
    handleStart,
    handlePauseResume,
    handleAdvance,
    handleUndo,
    handleReset,
    promptRename,
    handleMoveToEnd,
    handlePromote,
    handleRemove,
  };
}