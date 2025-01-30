import Dexie, { Table } from 'dexie';
import { Player, Game, Match } from '../types';

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
    this.players.hook('creating', (primKey, obj: Player) => {
      const now = new Date().toISOString();
      obj.createdAt = now;
      obj.updatedAt = now;
    });

    this.players.hook('updating', (modifications: Partial<Player>) => {
      modifications.updatedAt = new Date().toISOString();
    });
  }
}

export const db = new AppDB();
