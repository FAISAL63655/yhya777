import React, { useState, useEffect } from 'react';
import { Match, Game, Player } from '../types';
import { Trophy, Medal, Star, TrendingUp, TrendingDown, Minus, Maximize2, Minimize2 } from 'lucide-react';

interface LivePlayerRankingProps {
  matches: Match[];
  games: Game[];
  players: Player[];
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

interface PlayerStats {
  playerId: string;
  playerName: string;
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  yellowCards: number;
  redCards: number;
  gameStats: {
    [gameId: string]: {
      matches: number;
      wins: number;
      draws: number;
      losses: number;
      points: number;
      rank: number;
    }
  }
}

export function LivePlayerRanking({ matches, games, players, isFullScreen, onToggleFullScreen }: LivePlayerRankingProps) {
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [sortBy, setSortBy] = useState<keyof PlayerStats>('points');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    calculatePlayerStats();
  }, [matches]);

  const calculatePlayerStats = () => {
    const stats: PlayerStats[] = players.map(player => {
      const playerMatches = matches.filter(match => 
        match.teams.some(team => team.players.some(p => p.id === player.id))
      );

      let totalMatches = 0;
      let wins = 0;
      let draws = 0;
      let losses = 0;
      let yellowCards = 0;
      let redCards = 0;
      const gameStats: { [key: string]: { matches: number; wins: number; draws: number; losses: number; points: number; rank: number } } = {};

      // تهيئة إحصائيات كل لعبة
      games.forEach(game => {
        gameStats[game.id] = {
          matches: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          points: 0,
          rank: 0
        };
      });

      playerMatches.forEach(match => {
        const playerTeam = match.teams.find(team => 
          team.players.some(p => p.id === player.id)
        );
        const otherTeam = match.teams.find(team => 
          !team.players.some(p => p.id === player.id)
        );

        if (playerTeam && otherTeam) {
          totalMatches++;
          gameStats[match.gameId].matches++;

          if (playerTeam.score > otherTeam.score) {
            wins++;
            gameStats[match.gameId].wins++;
            gameStats[match.gameId].points += 3;
          } else if (playerTeam.score === otherTeam.score) {
            draws++;
            gameStats[match.gameId].draws++;
            gameStats[match.gameId].points += 1;
          } else {
            losses++;
            gameStats[match.gameId].losses++;
          }

          const playerStats = playerTeam.playerStats.find(ps => ps.playerId === player.id);
          if (playerStats) {
            yellowCards += playerStats.yellowCards || 0;
            redCards += playerStats.redCard ? 1 : 0;
          }
        }
      });

      const points = (wins * 3) + draws;

      return {
        playerId: player.id,
        playerName: player.name,
        totalMatches,
        wins,
        draws,
        losses,
        points,
        yellowCards,
        redCards,
        gameStats
      };
    });

    // حساب الترتيب لكل لعبة
    games.forEach(game => {
      const playersInGame = stats.filter(stat => stat.gameStats[game.id].matches > 0)
        .sort((a, b) => b.gameStats[game.id].points - a.gameStats[game.id].points);

      playersInGame.forEach((player, index) => {
        player.gameStats[game.id].rank = index + 1;
      });
    });

    const sortedStats = stats.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      return sortOrder === 'desc' ? 
        (typeof bValue === 'number' ? bValue - (aValue as number) : 0) :
        (typeof aValue === 'number' ? aValue - (bValue as number) : 0);
    });

    setPlayerStats(sortedStats);
  };

  const handleSort = (key: keyof PlayerStats) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${isFullScreen ? 'fixed inset-0 z-50 overflow-auto' : ''}`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">ترتيب اللاعبين</h2>
            <button
              onClick={onToggleFullScreen}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title={isFullScreen ? 'إغلاق الشاشة الكاملة' : 'عرض الشاشة الكاملة'}
            >
              {isFullScreen ? (
                <Minimize2 className="w-5 h-5 text-gray-600" />
              ) : (
                <Maximize2 className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              عدد اللاعبين: {playerStats.length}
            </div>
            <div className="text-sm text-gray-600">
              عدد المباريات: {matches.length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {games.map(game => {
            const playersInGame = playerStats.filter(p => p.gameStats[game.id].matches > 0);
            const totalMatches = playersInGame.reduce((acc, p) => acc + p.gameStats[game.id].matches, 0);
            return (
              <div
                key={game.id}
                className="bg-gray-50 rounded-lg p-4 transition-all transform hover:scale-105"
              >
                <h3 className="text-lg font-semibold mb-2 text-gray-800">{game.name}</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-blue-600">{playersInGame.length} لاعب</p>
                  <p className="text-green-600">{totalMatches} مباراة</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-right">الترتيب</th>
                  <th className="px-4 py-3 text-right">اللاعب</th>
                  <th className="px-4 py-3 text-right cursor-pointer group" onClick={() => handleSort('totalMatches')}>
                    <div className="flex items-center gap-2">
                      <span>المباريات</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {sortBy === 'totalMatches' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right cursor-pointer group" onClick={() => handleSort('wins')}>
                    <div className="flex items-center gap-2">
                      <span>الفوز</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {sortBy === 'wins' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right cursor-pointer group" onClick={() => handleSort('draws')}>
                    <div className="flex items-center gap-2">
                      <span>التعادل</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {sortBy === 'draws' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right cursor-pointer group" onClick={() => handleSort('losses')}>
                    <div className="flex items-center gap-2">
                      <span>الخسارة</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {sortBy === 'losses' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right">البطاقات</th>
                  <th className="px-4 py-3 text-right cursor-pointer group" onClick={() => handleSort('points')}>
                    <div className="flex items-center gap-2">
                      <span>النقاط</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {sortBy === 'points' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </div>
                    </div>
                  </th>
                  {games.map(game => (
                    <th key={game.id} className="px-4 py-3 text-right sticky top-0 bg-gray-50">
                      <div className="font-semibold text-gray-900">{game.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {playerStats.map((stat, index) => (
                  <tr
                    key={stat.playerId}
                    className={`border-t border-gray-200 transition-all ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-blue-50 animate-fade-in`}
                  >
                    <td className="px-4 py-3 text-right">
                      {index < 3 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-transform hover:scale-110">
                          {index === 0 && <Trophy className="w-6 h-6 text-yellow-400" />}
                          {index === 1 && <Medal className="w-6 h-6 text-gray-400" />}
                          {index === 2 && <Medal className="w-6 h-6 text-amber-600" />}
                        </span>
                      ) : (
                        <span className="text-gray-600">{index + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Star className={`w-5 h-5 ${index < 3 ? 'text-yellow-400' : 'text-gray-400'}`} />
                        <span className="font-medium text-gray-900">{stat.playerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block min-w-[2rem] text-gray-900">{stat.totalMatches}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block min-w-[2rem] text-green-600 font-medium">{stat.wins}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block min-w-[2rem] text-blue-600">{stat.draws}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block min-w-[2rem] text-red-600">{stat.losses}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <span className="inline-flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                          <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
                          <span className="text-yellow-700">{stat.yellowCards}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                          <span className="text-red-700">{stat.redCards}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block min-w-[2rem] font-bold ${
                        stat.points >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.points}
                      </span>
                    </td>
                    {games.map(game => (
                      <td key={game.id} className="px-4 py-3 text-center">
                        {stat.gameStats[game.id]?.matches > 0 ? (
                          <div className="flex flex-col gap-1 bg-gray-50 p-2 rounded-lg transition-all hover:bg-blue-50">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                #{stat.gameStats[game.id].rank}
                              </span>
                              <span className="text-sm font-medium text-blue-600">
                                ({stat.gameStats[game.id].points})
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              <div className="text-gray-500">
                                {stat.gameStats[game.id].matches} م
                              </div>
                              <div className="text-green-600">
                                {stat.gameStats[game.id].wins} ف
                              </div>
                              <div className="text-blue-600">
                                {stat.gameStats[game.id].draws} ت
                              </div>
                              <div className="text-red-600">
                                {stat.gameStats[game.id].losses} خ
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">لم يشارك</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">نظام النقاط:</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-700">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span>3 نقاط للفوز</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <Star className="w-5 h-5 text-gray-400" />
                <span>نقطة واحدة للتعادل</span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">الرموز:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span>المركز الأول</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Medal className="w-5 h-5 text-gray-400" />
                  <span>المركز الثاني</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Medal className="w-5 h-5 text-amber-600" />
                  <span>المركز الثالث</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Star className="w-5 h-5 text-gray-400" />
                  <span>باقي المراكز</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
