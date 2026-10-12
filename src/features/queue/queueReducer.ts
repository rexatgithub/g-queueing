import type { Session, SessionFormInput } from './queueTypes';
import { advanceGame, addPlayer, createSession, movePlayerToEnd, pauseSession, promotePlayer, removePlayer, renamePlayer, resumeSession, startSession, undoAdvance } from './queueRules';

export type QueueAction =
  | { type: 'CREATE_SESSION'; payload: SessionFormInput }
  | { type: 'ADD_PLAYER'; payload: { name: string } }
  | { type: 'RENAME_PLAYER'; payload: { playerId: string; name: string } }
  | { type: 'REMOVE_PLAYER'; payload: { playerId: string } }
  | { type: 'MOVE_PLAYER_TO_END'; payload: { playerId: string } }
  | { type: 'PROMOTE_PLAYER'; payload: { playerId: string } }
  | { type: 'START_SESSION' }
  | { type: 'PAUSE_SESSION' }
  | { type: 'RESUME_SESSION' }
  | { type: 'ADVANCE_GAME' }
  | { type: 'UNDO_ADVANCE' }
  | { type: 'RESET_SESSION' };

export const queueReducer = (session: Session | null, action: QueueAction): Session | null => {
  if (!session && action.type !== 'CREATE_SESSION' && action.type !== 'RESET_SESSION') {
    return session;
  }

  switch (action.type) {
    case 'CREATE_SESSION':
      return createSession(action.payload);
    case 'ADD_PLAYER':
      return session ? addPlayer(session, action.payload.name) : session;
    case 'RENAME_PLAYER':
      return session ? renamePlayer(session, action.payload.playerId, action.payload.name) : session;
    case 'REMOVE_PLAYER':
      return session ? removePlayer(session, action.payload.playerId) : session;
    case 'MOVE_PLAYER_TO_END':
      return session ? movePlayerToEnd(session, action.payload.playerId) : session;
    case 'PROMOTE_PLAYER':
      return session ? promotePlayer(session, action.payload.playerId) : session;
    case 'START_SESSION':
      return session ? startSession(session) : session;
    case 'PAUSE_SESSION':
      return session ? pauseSession(session) : session;
    case 'RESUME_SESSION':
      return session ? resumeSession(session) : session;
    case 'ADVANCE_GAME':
      return session ? advanceGame(session) : session;
    case 'UNDO_ADVANCE':
      return session ? undoAdvance(session) : session;
    case 'RESET_SESSION':
      return null;
    default:
      return session;
  }
};
