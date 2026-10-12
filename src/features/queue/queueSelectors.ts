import type { Session } from './queueTypes';

export const getCurrentPlayers = (session: Session) =>
  session.players.filter((player) => player.status === 'current');

export const getUpNextPlayers = (session: Session) =>
  session.players.filter((player) => player.status === 'up_next');

export const getWaitingPlayers = (session: Session) =>
  session.players.filter((player) => player.status === 'waiting');

export const getQueueSummary = (session: Session) => ({
  current: getCurrentPlayers(session),
  upNext: getUpNextPlayers(session),
  waiting: getWaitingPlayers(session),
  total: session.players.length,
});
