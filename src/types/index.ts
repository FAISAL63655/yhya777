export interface Player {
  id: string;
  name: string;
  ratings: {
    [key in GameType]: number;
  };
}

export interface Game {
  id: string;
  name: string;
  type: GameType;
  playersPerTeam: number;
  maxTeams: number;
}

export enum GameType {
  FOOTBALL = 'FOOTBALL',
  VOLLEYBALL = 'VOLLEYBALL',
  BALOOT = 'BALOOT',
  CARROM = 'CARROM',
  PLAYSTATION = 'PLAYSTATION',
  JACKAROO = 'JACKAROO'
}

export interface PlayerStats {
  playerId: string;
  goals?: number;
  yellowCards?: number;
  redCard?: boolean;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  score: number;
  playerStats: PlayerStats[];
}

export interface Match {
  id: string;
  gameId: string;
  date: string;
  createdAt: string;
  teams: Team[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  round: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  gameType?: GameType;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR'
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}