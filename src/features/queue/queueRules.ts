import type { Game, Player, Session, SessionFormInput } from './queueTypes';

export const defaultSessionInput: SessionFormInput = {
  name: 'Saturday Pickup',
  sport: 'Basketball',
  court: 'Court A',
  playersPerGame: 10,
  gameDurationSeconds: 12 * 60,
};

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `queue-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeName = (value: string) => value.trim();

const cloneSessionSnapshot = (session: Session) => ({
  players: session.players.map((player) => ({ ...player })),
  games: session.games.map((game) => ({ ...game, playerIds: [...game.playerIds] })),
  currentGameId: session.currentGameId,
  timerStartedAt: session.timerStartedAt,
  timerRemainingSeconds: session.timerRemainingSeconds,
  status: session.status,
});

export const createSession = (input: SessionFormInput): Session => {
  const now = new Date().toISOString();

  return {
    id: createId(),
    name: input.name.trim() || defaultSessionInput.name,
    sport: input.sport.trim() || defaultSessionInput.sport,
    court: input.court.trim() || defaultSessionInput.court,
    playersPerGame: Math.max(1, Number(input.playersPerGame) || defaultSessionInput.playersPerGame),
    gameDurationSeconds: Math.max(60, Number(input.gameDurationSeconds) || defaultSessionInput.gameDurationSeconds),
    status: 'setup',
    players: [],
    games: [],
    currentGameId: null,
    timerStartedAt: null,
    timerRemainingSeconds: Math.max(60, Number(input.gameDurationSeconds) || defaultSessionInput.gameDurationSeconds),
    createdAt: now,
    updatedAt: now,
    lastAdvanceSnapshot: null,
  };
};

export const getCurrentPlayers = (session: Session) =>
  session.players.filter((player) => player.status === 'current');

export const getUpNextPlayers = (session: Session) =>
  session.players.filter((player) => player.status === 'up_next');

export const getWaitingPlayers = (session: Session) =>
  session.players.filter((player) => player.status === 'waiting');

export const getQueueSections = (session: Session) => ({
  current: getCurrentPlayers(session),
  upNext: getUpNextPlayers(session),
  waiting: getWaitingPlayers(session),
});

export const getTimerSnapshot = (session: Session, now = Date.now()) => {
  const total = session.gameDurationSeconds;
  const hasStarted = session.status === 'active' && session.timerStartedAt !== null;

  if (hasStarted) {
    const elapsedSeconds = Math.max(0, Math.floor((now - session.timerStartedAt!) / 1000));
    const remaining = Math.max(0, session.timerRemainingSeconds - elapsedSeconds);

    return {
      remainingSeconds: remaining,
      totalSeconds: total,
      isRunning: true,
      formatted: formatClock(remaining),
    };
  }

  return {
    remainingSeconds: Math.max(0, session.timerRemainingSeconds),
    totalSeconds: total,
    isRunning: false,
    formatted: formatClock(session.timerRemainingSeconds),
  };
};

export const formatDurationDisplay = (value: number) => {
  const safeValue = Math.max(0, Math.floor(value));
  const hours = Math.floor(safeValue / 3600);
  const minutes = Math.floor((safeValue % 3600) / 60);
  const seconds = safeValue % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const parseDurationInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 0;

  const parts = trimmed.split(':').map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) return 0;

  const numericParts = parts.map((part) => Number(part));
  if (numericParts.some((part) => Number.isNaN(part))) {
    return 0;
  }

  if (numericParts.length === 1) {
    return Math.max(0, numericParts[0]);
  }

  if (numericParts.length === 2) {
    return Math.max(0, numericParts[0] * 60 + numericParts[1]);
  }

  return Math.max(0, numericParts[0] * 3600 + numericParts[1] * 60 + numericParts[2]);
};

export const formatClock = (value: number) => formatDurationDisplay(value);

export const addPlayer = (session: Session, rawName: string): Session => {
  const name = normalizeName(rawName);
  if (!name) {
    return session;
  }

  const nextPlayer: Player = {
    id: createId(),
    name,
    joinedAt: new Date().toISOString(),
    status: 'waiting',
  };

  const players: Player[] = [...session.players, nextPlayer];
  const seeded: Player[] = seedQueue(players, session.playersPerGame);

  return {
    ...session,
    players: seeded,
    updatedAt: new Date().toISOString(),
  };
};

export const renamePlayer = (session: Session, playerId: string, rawName: string): Session => {
  const name = normalizeName(rawName);
  if (!name) {
    return session;
  }

  return {
    ...session,
    players: session.players.map((player) =>
      player.id === playerId ? { ...player, name } : player,
    ),
    updatedAt: new Date().toISOString(),
  };
};

export const removePlayer = (session: Session, playerId: string): Session => {
  const remainingPlayers = session.players.filter((player) => player.id !== playerId);

  return {
    ...session,
    players: seedQueue(remainingPlayers, session.playersPerGame),
    updatedAt: new Date().toISOString(),
  };
};

export const movePlayerToEnd = (session: Session, playerId: string): Session => {
  const player = session.players.find((entry) => entry.id === playerId);
  if (!player || (player.status !== 'waiting' && player.status !== 'up_next')) {
    return session;
  }

  const remaining: Player[] = session.players.filter((entry) => entry.id !== playerId);
  const updated: Player[] = [...remaining, player];

  return {
    ...session,
    players: seedQueue(updated, session.playersPerGame),
    updatedAt: new Date().toISOString(),
  };
};

export const promotePlayer = (session: Session, playerId: string): Session => {
  const player = session.players.find((entry) => entry.id === playerId);
  if (!player || player.status !== 'waiting') {
    return session;
  }

  const currentPlayers = getCurrentPlayers(session);
  const upNextPlayers = getUpNextPlayers(session);
  const waitingPlayers = getWaitingPlayers(session).filter((entry) => entry.id !== playerId);
  const promoted = session.players.find((entry) => entry.id === playerId)!;
  const reordered = [...currentPlayers, promoted, ...upNextPlayers, ...waitingPlayers];

  return {
    ...session,
    players: seedQueue(reordered, session.playersPerGame),
    updatedAt: new Date().toISOString(),
  };
};

export const startSession = (session: Session): Session => {
  const seeded = seedQueue(session.players, session.playersPerGame);

  return {
    ...session,
    status: 'active',
    players: seeded,
    timerStartedAt: Date.now(),
    timerRemainingSeconds: session.gameDurationSeconds,
    updatedAt: new Date().toISOString(),
  };
};

export const pauseSession = (session: Session): Session => {
  if (session.status !== 'active') {
    return session;
  }

  const snapshot = getTimerSnapshot(session);

  return {
    ...session,
    status: 'paused',
    timerRemainingSeconds: snapshot.remainingSeconds,
    timerStartedAt: null,
    updatedAt: new Date().toISOString(),
  };
};

export const resumeSession = (session: Session): Session => {
  if (session.status !== 'paused') {
    return session;
  }

  return {
    ...session,
    status: 'active',
    timerStartedAt: Date.now(),
    updatedAt: new Date().toISOString(),
  };
};

export const advanceGame = (session: Session): Session => {
  const currentPlayers = getCurrentPlayers(session);
  if (currentPlayers.length === 0) {
    return session;
  }

  const snapshot = cloneSessionSnapshot(session);

  const game: Game = {
    id: createId(),
    gameNumber: session.games.length + 1,
    playerIds: currentPlayers.map((player) => player.id),
    startedAt: session.timerStartedAt ?? Date.now(),
    endedAt: Date.now(),
    durationSeconds: session.gameDurationSeconds,
  };

  const waitingPlayers = session.players.filter((player) => player.status !== 'current');
  const reorderedPlayers = [...waitingPlayers, ...currentPlayers];

  const nextSession: Session = {
    ...session,
    players: seedQueue(reorderedPlayers, session.playersPerGame),
    games: [...session.games, game],
    status: 'active',
    currentGameId: game.id,
    timerStartedAt: Date.now(),
    timerRemainingSeconds: session.gameDurationSeconds,
    lastAdvanceSnapshot: snapshot,
    updatedAt: new Date().toISOString(),
  };

  return nextSession;
};

export const undoAdvance = (session: Session): Session => {
  if (!session.lastAdvanceSnapshot) {
    return session;
  }

  return {
    ...session,
    players: session.lastAdvanceSnapshot.players,
    games: session.lastAdvanceSnapshot.games,
    status: session.lastAdvanceSnapshot.status,
    currentGameId: session.lastAdvanceSnapshot.currentGameId,
    timerStartedAt: session.lastAdvanceSnapshot.timerStartedAt,
    timerRemainingSeconds: session.lastAdvanceSnapshot.timerRemainingSeconds,
    lastAdvanceSnapshot: null,
    updatedAt: new Date().toISOString(),
  };
};

export const resetSession = (): Session => {
  const now = new Date().toISOString();

  return {
    id: createId(),
    name: defaultSessionInput.name,
    sport: defaultSessionInput.sport,
    court: defaultSessionInput.court,
    playersPerGame: defaultSessionInput.playersPerGame,
    gameDurationSeconds: defaultSessionInput.gameDurationSeconds,
    status: 'setup',
    players: [],
    games: [],
    currentGameId: null,
    timerStartedAt: null,
    timerRemainingSeconds: defaultSessionInput.gameDurationSeconds,
    createdAt: now,
    updatedAt: now,
    lastAdvanceSnapshot: null,
  };
};

const seedQueue = (players: Player[], playersPerGame: number): Player[] => {
  const queue: Player[] = players.filter((player) => player.status !== 'removed');

  if (queue.length === 0) {
    return [];
  }

  const current: Player[] = queue.slice(0, playersPerGame).map((player) => ({
    ...player,
    status: 'current',
  }));

  const upNext: Player[] = queue.slice(playersPerGame, playersPerGame * 2).map((player) => ({
    ...player,
    status: 'up_next',
  }));

  const waiting: Player[] = queue.slice(playersPerGame * 2).map((player) => ({
    ...player,
    status: 'waiting',
  }));

  return [...current, ...upNext, ...waiting];
};
