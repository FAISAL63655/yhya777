import { db } from '../db';

export const DataService = {
  // إدارة اللاعبين
  async addPlayer(player: Player) {
    return db.players.add(player);
  },

  async getPlayers() {
    return db.players.toArray();
  },

  async updatePlayer(id: number, updates: Partial<Player>) {
    return db.players.update(id, updates);
  },

  async deletePlayer(id: number) {
    return db.players.delete(id);
  },

  // إدارة الألعاب
  async addGame(game: Game) {
    return db.games.add(game);
  },

  async getGames() {
    return db.games.toArray();
  },

  async updateGame(id: number, updates: Partial<Game>) {
    return db.games.update(id, updates);
  },

  async deleteGame(id: number) {
    return db.games.delete(id);
  }
};

import { Player, Game } from '../types';