import Dexie, { Table } from 'dexie';

export interface Player {
  id?: string;
  name: string;
  image?: string;
  ratings: { [key: string]: number };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Game {
  id: string;
  name: string;
  type: string;
  playersPerTeam: number;
  maxTeams: number;
}

export interface Match {
  id?: string;
  date: string;
  gameId: string;
  round: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  teams: {
    id: string;
    name: string;
    score: number;
    players: { id: string; name: string }[];
    playerStats: {
      playerId: string;
      goals: number;
      yellowCards: number;
      redCard: boolean;
      penaltyPoints: number;
      points: number;
      matchPoints: number;
    }[];
  }[];
  createdAt?: string;
}

class AppDB extends Dexie {
  players!: Table<Player>;
  games!: Table<Game>;
  matches!: Table<Match>;

  constructor() {
    super('SportsDB');
    
    this.version(1).stores({
      players: '++id, name',
      games: '++id, type',
      matches: '++id, gameId, round, status'
    });

    // إضافة hooks لتحديث التواريخ تلقائياً
    this.players.hook('creating', (primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.players.hook('updating', (modifications, primKey, obj) => {
      if (typeof modifications === 'object') {
        modifications.updatedAt = new Date();
      }
    });
  }
}

export const db = new AppDB();
