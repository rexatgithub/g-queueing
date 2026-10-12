export type SessionStatus = 'setup' | 'active' | 'paused' | 'finished';
export type PlayerStatus = 'current' | 'up_next' | 'waiting' | 'removed';

export interface Player {
  id: string;
  name: string;
  joinedAt: string;
  status: PlayerStatus;
}

export interface Game {
  id: string;
  gameNumber: number;
  playerIds: string[];
  startedAt: number;
  endedAt?: number;
  durationSeconds: number;
}

export interface Session {
  id: string;
  name: string;
  sport: string;
  court: string;
  playersPerGame: number;
  gameDurationSeconds: number;
  status: SessionStatus;
  players: Player[];
  games: Game[];
  currentGameId: string | null;
  timerStartedAt: number | null;
  timerRemainingSeconds: number;
  createdAt: string;
  updatedAt: string;
  lastAdvanceSnapshot?: {
    players: Player[];
    games: Game[];
    currentGameId: string | null;
    timerStartedAt: number | null;
    timerRemainingSeconds: number;
    status: SessionStatus;
  } | null;
}

export interface SessionFormInput {
  name: string;
  sport: string;
  court: string;
  playersPerGame: number;
  gameDurationSeconds: number;
}
