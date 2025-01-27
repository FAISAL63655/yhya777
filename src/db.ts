import Dexie, { Table } from 'dexie';
import { Player, Game, Match } from './types';

class SportsDB extends Dexie {
  players!: Table<Player, string>;
  games!: Table<Game, string>;
  matches!: Table<Match, string>;

  constructor() {
    super('SportsDatabase');
    this.version(2).stores({
      players: 'id, name',
      games: 'id, name, type',
      matches: 'id, gameId, date, status'
    });
  }
}

export const db = new SportsDB();