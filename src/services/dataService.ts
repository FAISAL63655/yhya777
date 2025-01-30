import { Player, Game } from '../types';
import { db } from '../db';

export const DataService = {
  // إدارة اللاعبين
  async addPlayer(player: Player) {
    return db.players.add(player);
  },

  async getPlayers() {
    return db.players.toArray();
  },

  async updatePlayer(id: string, updates: Partial<Player>) {
    return db.players.update(id, updates);
  },

  async deletePlayer(id: string) {
    return db.players.delete(id);
  },

  // إدارة الألعاب
  async addGame(game: Game) {
    return db.games.add(game);
  },

  async getGames() {
    return db.games.toArray();
  },

  async updateGame(id: string, updates: Partial<Game>) {
    return db.games.update(id, updates);
  },

  async deleteGame(id: string) {
    return db.games.delete(id);
  }
};