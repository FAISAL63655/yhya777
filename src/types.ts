export enum GameType {
  FOOTBALL = 'FOOTBALL',
  VOLLEYBALL = 'VOLLEYBALL',
  BALOOT = 'BALOOT',
  CARROM = 'CARROM',
  PLAYSTATION = 'PLAYSTATION',
  JACKAROO = 'JACKAROO',
  DARTS = 'DARTS',
  CUSTOM = 'CUSTOM'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  USER = 'USER'
}

export enum PlayerCategory {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export interface Player {
  id: string;
  name: string;
  phone: string;
  image?: string;
  ratings: {
    [key in GameType]?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  name: string;
  type: GameType;
  playersPerTeam: number;
  maxTeams: number;
  categoryRequirements?: {
    [key in PlayerCategory]?: number;
  };
}

export interface PlayerMatchStats {
  playerId: string;
  goals?: number;
  assists?: number;
  yellowCards: number;
  redCard: boolean;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  score: number;
  playerStats?: PlayerMatchStats[];
}

export interface Match {
  id: string;
  gameId: string;
  teams: Team[];
  status: 'PENDING' | 'COMPLETED';
  round: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  gameType?: GameType;
  createdAt: string;
  updatedAt: string;
}
